import { NextRequest, NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe';
import { createAdminClient } from '@/lib/supabase/admin';
import Stripe from 'stripe';

/**
 * キッズコーチナビ用 Stripe Webhook 受信エンドポイント
 * - checkout.session.completed: 予約確定・空き枠確保・統合チャットルーム作成
 * - account.updated: Stripe Connect による本人確認・振込口座有効化の同期
 */
export async function POST(req: NextRequest) {
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!webhookSecret || !process.env.STRIPE_SECRET_KEY) {
    return NextResponse.json(
      { error: 'Stripe Webhook 環境変数が未設定です。' },
      { status: 503 }
    );
  }

  const signature = req.headers.get('stripe-signature');
  if (!signature) {
    return NextResponse.json({ error: 'Missing signature' }, { status: 400 });
  }

  let event: Stripe.Event;
  try {
    const rawBody = await req.text();
    event = stripe.webhooks.constructEvent(rawBody, signature, webhookSecret);
  } catch (err) {
    console.error('kcn webhook signature verification failed:', err);
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
  }

  const supabase = createAdminClient();

  try {
    if (event.type === 'checkout.session.completed') {
      const session = event.data.object as Stripe.Checkout.Session;
      const bookingId = session.metadata?.kcn_booking_id;
      const slotId = session.metadata?.kcn_slot_id;
      const parentId = session.metadata?.kcn_parent_id;
      const coachId = session.metadata?.kcn_coach_id;

      if (bookingId) {
        await supabase
          .from('kcn_bookings')
          .update({
            status: 'confirmed',
            stripe_payment_intent_id:
              typeof session.payment_intent === 'string'
                ? session.payment_intent
                : null,
          })
          .eq('id', bookingId)
          .eq('status', 'pending');
      }

      if (slotId) {
        await supabase
          .from('kcn_service_slots')
          .update({ is_booked: true })
          .eq('id', slotId);
      }

      if (parentId && coachId) {
        await supabase.from('kcn_chat_rooms').upsert(
          { parent_id: parentId, coach_id: coachId },
          { onConflict: 'parent_id,coach_id', ignoreDuplicates: true }
        );
      }
    } else if (event.type === 'account.updated') {
      const account = event.data.object as Stripe.Account;
      await supabase
        .from('kcn_coach_profiles')
        .update({
          stripe_payouts_enabled: Boolean(account.payouts_enabled),
        })
        .eq('stripe_account_id', account.id);
    }

    return NextResponse.json({ received: true });
  } catch (err) {
    console.error('kcn webhook processing error:', err);
    return NextResponse.json(
      { error: 'Webhook processing failed' },
      { status: 500 }
    );
  }
}
