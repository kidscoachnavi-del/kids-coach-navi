import { NextRequest, NextResponse } from 'next/server';
import nodemailer from 'nodemailer';
import { createAdminClient } from '@/lib/supabase/admin';

const CONTACT_RECIPIENT =
  process.env.CONTACT_TO_EMAIL || 'info.swimpartners@gmail.com';

/**
 * 認定コーチ新規登録・審査申請 API (POST /api/kcn/coach/register)
 * - kcn_users（role: 'coach'）と kcn_coach_profiles（review_status: 'pending_review'）を保存
 * - 運営（info.swimpartners@gmail.com / Google Chat）へ目視審査依頼を通知
 */
export async function POST(req: NextRequest) {
  if (
    !process.env.NEXT_PUBLIC_SUPABASE_URL ||
    !process.env.SUPABASE_SERVICE_ROLE_KEY
  ) {
    return NextResponse.json(
      { error: 'Supabase 環境変数が未設定です。' },
      { status: 503 }
    );
  }

  try {
    const body = await req.json();
    const displayName =
      typeof body?.displayName === 'string' ? body.displayName.trim() : '';
    const email = typeof body?.email === 'string' ? body.email.trim() : '';
    const title = typeof body?.title === 'string' ? body.title.trim() : '';
    const bio = typeof body?.bio === 'string' ? body.bio.trim() : '';
    const avatarUrl =
      typeof body?.avatarUrl === 'string' ? body.avatarUrl.trim() : '';
    const liveSelfieUrl =
      typeof body?.liveSelfieUrl === 'string' ? body.liveSelfieUrl.trim() : '';
    const selfieTimestamp =
      typeof body?.selfieTimestamp === 'string' && body.selfieTimestamp
        ? body.selfieTimestamp
        : new Date().toISOString();
    const sportCategories = Array.isArray(body?.selectedSports)
      ? body.selectedSports.filter((s: unknown): s is string => typeof s === 'string').slice(0, 3)
      : [];
    const targetAreas = Array.isArray(body?.selectedAreas)
      ? body.selectedAreas.filter((a: unknown): a is string => typeof a === 'string')
      : [];

    if (!displayName || !email || !title || !avatarUrl || !liveSelfieUrl) {
      return NextResponse.json(
        { error: '必須項目（お名前・メール・肩書き・顔写真・カメラ撮影）が不足しています。' },
        { status: 400 }
      );
    }

    const supabase = createAdminClient();

    // 1. kcn_users の取得または新規作成
    let { data: existingUser } = await supabase
      .from('kcn_users')
      .select('id, email, name')
      .eq('email', email)
      .maybeSingle();

    if (!existingUser) {
      const { data: authCreated, error: authErr } =
        await supabase.auth.admin.createUser({
          email,
          email_confirm: true,
          user_metadata: { name: displayName, role: 'coach' },
        });
      if (authErr || !authCreated?.user) {
        return NextResponse.json(
          { error: 'コーチアカウントの作成に失敗しました。' },
          { status: 500 }
        );
      }

      const { data: insertedUser, error: userErr } = await supabase
        .from('kcn_users')
        .insert({
          id: authCreated.user.id,
          role: 'coach',
          name: displayName,
          email,
        })
        .select('id, email, name')
        .single();

      if (userErr || !insertedUser) {
        return NextResponse.json(
          { error: 'ユーザー情報の保存に失敗しました。' },
          { status: 500 }
        );
      }
      existingUser = insertedUser;
    }

    // 2. kcn_coach_profiles へ審査待ち（pending_review）で保存
    const { error: profileErr } = await supabase
      .from('kcn_coach_profiles')
      .upsert(
        {
          id: existingUser.id,
          display_name: displayName,
          title,
          bio,
          avatar_url: avatarUrl,
          compliance_selfie_path: liveSelfieUrl,
          selfie_captured_at: new Date(selfieTimestamp).toISOString(),
          sport_categories: sportCategories,
          target_areas: targetAreas,
          review_status: 'pending_review',
        },
        { onConflict: 'id' }
      );

    if (profileErr) {
      console.error('kcn_coach_profiles upsert error:', profileErr);
      return NextResponse.json(
        { error: 'コーチプロフィールの保存に失敗しました。' },
        { status: 500 }
      );
    }

    // 3. 運営へ審査申請通知（メール / Google Chat）
    const smtpUser = process.env.SMTP_USER || process.env.GMAIL_USER;
    const smtpPass = process.env.SMTP_PASS || process.env.GMAIL_APP_PASSWORD;
    const smtpHost =
      process.env.SMTP_HOST ||
      (smtpUser?.endsWith('@gmail.com') ? 'smtp.gmail.com' : undefined);
    const smtpPort = parseInt(process.env.SMTP_PORT || '465', 10);

    if (smtpHost && smtpUser && smtpPass) {
      const transporter = nodemailer.createTransport({
        host: smtpHost,
        port: smtpPort,
        secure: smtpPort === 465,
        auth: { user: smtpUser, pass: smtpPass },
      });
      await transporter
        .sendMail({
          from: `"キッズコーチナビ 審査通知" <${smtpUser}>`,
          to: CONTACT_RECIPIENT,
          subject: `【キッズコーチナビ】新規コーチ登録（目視審査待ち）: ${displayName}`,
          text: [
            `新規コーチの登録・本人確認審査申請が届きました。`,
            ``,
            `コーチID: ${existingUser.id}`,
            `お名前: ${displayName}`,
            `メールアドレス: ${email}`,
            `肩書き: ${title}`,
            `指導種目: ${sportCategories.join(' / ') || '未設定'}`,
            `対応エリア: ${targetAreas.join(' / ') || '未設定'}`,
            ``,
            `Supabase の kcn_coach_profiles で目視確認後、review_status を 'approved' に更新すると公開ページへ掲載されます。`,
          ].join('\n'),
        })
        .catch((err) => console.error('coach register mail error:', err));
    }

    const gchatWebhookUrl = process.env.GOOGLE_CHAT_WEBHOOK_URL;
    if (gchatWebhookUrl) {
      await fetch(gchatWebhookUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: `🏅 *【キッズコーチナビ】新規コーチ審査申請*\n• お名前: ${displayName}\n• Email: ${email}\n• 種目: ${sportCategories.join(', ')}\n• エリア: ${targetAreas.join(', ')}`,
        }),
      }).catch((err) => console.error('coach register gchat error:', err));
    }

    return NextResponse.json({
      ok: true,
      coachId: existingUser.id,
      reviewStatus: 'pending_review',
    });
  } catch (err) {
    console.error('kcn coach register error:', err);
    return NextResponse.json(
      { error: '登録申請の処理中にエラーが発生しました。' },
      { status: 500 }
    );
  }
}
