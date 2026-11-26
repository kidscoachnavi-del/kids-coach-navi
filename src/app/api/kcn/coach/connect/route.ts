import { NextRequest, NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe';
import { createAdminClient } from '@/lib/supabase/admin';

/**
 * コーチ用 Stripe Connect（Express）アカウント連携・Onboarding URL発行API
 * 身分証・銀行口座管理はすべて Stripe 側で行い、出金スケジュールは
 * 隔週（2週に1回）のプラットフォーム一括送金制御のため manual に設定する
 */
export async function POST(req: NextRequest) {
  if (
    !process.env.STRIPE_SECRET_KEY ||
    !process.env.NEXT_PUBLIC_SUPABASE_URL ||
    !process.env.SUPABASE_SERVICE_ROLE_KEY
  ) {
    return NextResponse.json(
      { error: '本番環境変数（Stripe / Supabase）が未設定です。' },
      { status: 503 }
    );
  }

  try {
    const { coachId, email, displayName } = (await req.json()) as {
      coachId?: string;
      email?: string;
      displayName?: string;
    };

    if (!coachId && !email) {
      return NextResponse.json(
        { error: 'coachId またはメールアドレスを指定してください。' },
        { status: 400 }
      );
    }

    const supabase = createAdminClient();
    const appUrl =
      process.env.NEXT_PUBLIC_APP_URL ||
      req.nextUrl.origin ||
      'https://kids-coach-navi.com';

    let profile: { id: string; stripe_account_id: string | null } | null = null;

    if (coachId) {
      const { data } = await supabase
        .from('kcn_coach_profiles')
        .select('id, stripe_account_id')
        .eq('id', coachId)
        .maybeSingle();
      profile = data;
    }

    if (!profile && email) {
      const { data: userByEmail } = await supabase
        .from('kcn_users')
        .select('id')
        .eq('email', email.trim())
        .maybeSingle();

      let targetId = userByEmail?.id;
      if (!targetId) {
        const { data: authCreated } = await supabase.auth.admin.createUser({
          email: email.trim(),
          email_confirm: true,
          user_metadata: { name: displayName || '新規コーチ', role: 'coach' },
        });
        if (authCreated?.user) {
          targetId = authCreated.user.id;
          await supabase.from('kcn_users').insert({
            id: targetId,
            role: 'coach',
            name: displayName || '新規コーチ',
            email: email.trim(),
          });
        }
      }

      if (targetId) {
        const { data: existingProf } = await supabase
          .from('kcn_coach_profiles')
          .select('id, stripe_account_id')
          .eq('id', targetId)
          .maybeSingle();

        if (existingProf) {
          profile = existingProf;
        } else {
          const { data: insertedProf } = await supabase
            .from('kcn_coach_profiles')
            .insert({
              id: targetId,
              display_name: displayName || '新規コーチ',
              title: '申請中コーチ',
              avatar_url: '',
              compliance_selfie_path: '',
              selfie_captured_at: new Date().toISOString(),
              review_status: 'pending_review',
            })
            .select('id, stripe_account_id')
            .single();
          profile = insertedProf;
        }
      }
    }

    if (!profile) {
      return NextResponse.json(
        { error: 'コーチプロフィールが見つかりません。メールアドレスをご入力ください。' },
        { status: 404 }
      );
    }

    const resolvedCoachId = profile.id;

    let accountId = profile.stripe_account_id;
    if (!accountId) {
      const account = await stripe.accounts.create({
        type: 'express',
        country: 'JP',
        email,
        capabilities: {
          transfers: { requested: true },
        },
        settings: {
          payouts: {
            // 2週に1回（隔週）の自動バッチ振込で制御するため manual に設定
            schedule: { interval: 'manual' },
          },
        },
        metadata: { kcn_coach_id: resolvedCoachId },
      });
      accountId = account.id;
      await supabase
        .from('kcn_coach_profiles')
        .update({ stripe_account_id: accountId })
        .eq('id', resolvedCoachId);
    }

    const accountLink = await stripe.accountLinks.create({
      account: accountId,
      refresh_url: `${appUrl}/coach/onboarding`,
      return_url: `${appUrl}/coach/dashboard`,
      type: 'account_onboarding',
    });

    return NextResponse.json({
      coachId: resolvedCoachId,
      accountId,
      onboardingUrl: accountLink.url,
    });
  } catch (err) {
    console.error('kcn coach connect error:', err);
    return NextResponse.json(
      { error: 'Stripe Connect 連携URLの生成に失敗しました。' },
      { status: 500 }
    );
  }
}
