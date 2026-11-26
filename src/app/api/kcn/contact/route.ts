import { NextRequest, NextResponse } from 'next/server';
import nodemailer from 'nodemailer';

const CONTACT_RECIPIENT =
  process.env.CONTACT_TO_EMAIL || 'info.swimpartners@gmail.com';

/**
 * お問い合わせフォーム送信受付 API (/api/kcn/contact)
 * 未ログインでも利用可能。SMTP設定がある場合は info.swimpartners@gmail.com へメール送信し、
 * GOOGLE_CHAT_WEBHOOK_URL が設定されている場合は Google Chat にも通知する。
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const name = typeof body?.name === 'string' ? body.name.trim() : '';
    const email = typeof body?.email === 'string' ? body.email.trim() : '';
    const category = typeof body?.category === 'string' ? body.category.trim() : '';
    const message = typeof body?.message === 'string' ? body.message.trim() : '';

    if (!name || !email || !category || !message) {
      return NextResponse.json(
        { error: '必須項目がすべて入力されていません。' },
        { status: 400 }
      );
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: 'メールアドレスの形式が正しくありません。' },
        { status: 400 }
      );
    }

    const inquiryId = `KCN-${Date.now().toString(36).toUpperCase()}`;
    const receivedAt = new Date().toISOString();

    let emailSent = false;
    const smtpUser = process.env.SMTP_USER || process.env.GMAIL_USER;
    const smtpPass = process.env.SMTP_PASS || process.env.GMAIL_APP_PASSWORD;
    const smtpHost = process.env.SMTP_HOST || (smtpUser?.endsWith('@gmail.com') ? 'smtp.gmail.com' : undefined);
    const smtpPort = parseInt(process.env.SMTP_PORT || '465', 10);

    if (smtpHost && smtpUser && smtpPass) {
      const transporter = nodemailer.createTransport({
        host: smtpHost,
        port: smtpPort,
        secure: smtpPort === 465,
        auth: {
          user: smtpUser,
          pass: smtpPass,
        },
      });

      await transporter.sendMail({
        from: `"キッズコーチナビ お問い合わせ" <${smtpUser}>`,
        to: CONTACT_RECIPIENT,
        replyTo: email,
        subject: `【キッズコーチナビ】お問い合わせ（${category}）[${inquiryId}]`,
        text: [
          `キッズコーチナビのお問い合わせフォームより新規連絡がありました。`,
          ``,
          `受付番号: ${inquiryId}`,
          `受信日時: ${receivedAt}`,
          `種別: ${category}`,
          `お名前: ${name}`,
          `メールアドレス: ${email}`,
          ``,
          `--- お問い合わせ内容 ---`,
          message,
        ].join('\n'),
      });
      emailSent = true;
    } else {
      console.warn(
        '[KCN Contact Inquiry] SMTP未設定のためメール送信をスキップしました:',
        { inquiryId, to: CONTACT_RECIPIENT, category, name, email, receivedAt }
      );
    }

    // Google Chat Webhook が設定されていれば併せて通知
    const gchatWebhookUrl = process.env.GOOGLE_CHAT_WEBHOOK_URL;
    if (gchatWebhookUrl) {
      await fetch(gchatWebhookUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: [
            `📩 *【キッズコーチナビ】新規お問い合わせ (${inquiryId})*`,
            `• 種別: ${category}`,
            `• お名前: ${name}`,
            `• Email: ${email}`,
            `• 内容:\n${message}`,
          ].join('\n'),
        }),
      }).catch((err) => {
        console.error('[KCN Contact Inquiry] Google Chat通知エラー:', err);
      });
    }

    // Google スプレッドシート（GAS Webhook）が設定されていれば自動追記
    let sheetRecorded = false;
    const gasWebhookUrl = process.env.CONTACT_GAS_WEBHOOK_URL;
    if (gasWebhookUrl) {
      const receivedAtJst = new Intl.DateTimeFormat('ja-JP', {
        timeZone: 'Asia/Tokyo',
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
      }).format(new Date(receivedAt));

      try {
        const gasRes = await fetch(gasWebhookUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            inquiryId,
            receivedAt: receivedAtJst,
            category,
            name,
            email,
            message,
          }),
        });
        sheetRecorded = gasRes.ok;
      } catch (err) {
        console.error('[KCN Contact Inquiry] スプレッドシート記録エラー:', err);
      }
    }

    return NextResponse.json({
      ok: true,
      inquiryId,
      receivedAt,
      recipient: CONTACT_RECIPIENT,
      emailSent,
      sheetRecorded,
    });
  } catch (error) {
    console.error('[KCN Contact Inquiry] Error:', error);
    return NextResponse.json(
      { error: 'リクエストの送信に失敗しました。時間をおいて再度お試しください。' },
      { status: 500 }
    );
  }
}
