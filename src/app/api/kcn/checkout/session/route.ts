import { NextRequest, NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe';
import { createAdminClient } from '@/lib/supabase/admin';

/**
 * 初回決済・通常決済用の Stripe Checkout Session 作成API
 * クレジットカード情報の入力・保管はすべて Stripe 側へ委任し、当サイトでは一切保持しない
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
    const body = await req.json();
    const {
      slotId,
      serviceId,
      parentId,
      coachId,
      studentName,
      studentAge,
      notes,
      saveForFuture = true,
    } = body as {
      slotId: string;
      serviceId: string;
      parentId: string;
      coachId: string;
      studentName: string;
      studentAge: string;
      notes?: string;
      saveForFuture?: boolean;
    };

    if (!slotId || !serviceId || !parentId || !coachId || !studentName) {
      return NextResponse.json(
        { error: '必須パラメータが不足しています。' },
        { status: 400 }
      );
    }

    const supabase = createAdminClient();
    const appUrl =
      process.env.NEXT_PUBLIC_APP_URL || 'https://kidscoach-navi.wellne.co.jp';

    // サービス料金・空き枠のサーバー側検証
    const [{ data: service }, { data: slot }, { data: parentUser }] =
      await Promise.all([
        supabase
          .from('kcn_services')
          .select('id, title, price, duration_minutes')
          .eq('id', serviceId)
          .single(),
        supabase
          .from('kcn_service_slots')
          .select('id, is_booked')
          .eq('id', slotId)
          .single(),
        supabase
          .from('kcn_users')
          .select('id, email, name, stripe_customer_id')
          .eq('id', parentId)
          .single(),
      ]);

    if (!service || !slot || !parentUser) {
      return NextResponse.json(
        { error: '対象のレッスン・空き枠・ユーザーが見つかりません。' },
        { status: 404 }
      );
    }
    if (slot.is_booked) {
      return NextResponse.json(
        { error: 'この時間枠はすでに予約されています。' },
        { status: 409 }
      );
    }

    // Stripe Customer 取得または新規作成（ワンクリック決済用）
    let stripeCustomerId = parentUser.stripe_customer_id;
    if (!stripeCustomerId) {
      const customer = await stripe.customers.create({
        email: parentUser.email,
        name: parentUser.name,
        metadata: { kcn_user_id: parentUser.id },
      });
      stripeCustomerId = customer.id;
      await supabase
        .from('kcn_users')
        .update({ stripe_customer_id: stripeCustomerId })
        .eq('id', parentUser.id);
    }

    const totalAmount = service.price;
    const platformFee = Math.round(totalAmount * 0.25);
    const coachPayout = totalAmount - platformFee;

    // 仮予約（pending）を作成
    const { data: booking, error: bookingError } = await supabase
      .from('kcn_bookings')
      .insert({
        service_id: service.id,
        slot_id: slot.id,
        parent_id: parentUser.id,
        coach_id: coachId,
        status: 'pending',
        total_amount: totalAmount,
        platform_fee: platformFee,
        coach_payout: coachPayout,
        student_name: studentName,
        student_age: studentAge || '',
        notes: notes || '',
      })
      .select('id')
      .single();

    if (bookingError || !booking) {
      return NextResponse.json(
        { error: '予約レコードの作成に失敗しました。' },
        { status: 500 }
      );
    }

    // Stripe Checkout Session 作成
    const session = await stripe.checkout.sessions.create({
      mode: 'payment',
      customer: stripeCustomerId,
      line_items: [
        {
          price_data: {
            currency: 'jpy',
            product_data: {
              name: service.title,
              description: `${service.duration_minutes}分 マンツーマン指導（税込・交通費込）`,
            },
            unit_amount: totalAmount,
          },
          quantity: 1,
        },
      ],
      payment_intent_data: {
        ...(saveForFuture ? { setup_future_usage: 'off_session' } : {}),
        metadata: {
          kcn_booking_id: booking.id,
          kcn_slot_id: slot.id,
          kcn_parent_id: parentUser.id,
          kcn_coach_id: coachId,
        },
      },
      metadata: {
        kcn_booking_id: booking.id,
        kcn_slot_id: slot.id,
        kcn_parent_id: parentUser.id,
        kcn_coach_id: coachId,
      },
      success_url: `${appUrl}/chat?room=${booking.id}&paid=1`,
      cancel_url: `${appUrl}/checkout/${slot.id}`,
    });

    return NextResponse.json({
      checkoutUrl: session.url,
      sessionId: session.id,
      bookingId: booking.id,
    });
  } catch (err) {
    console.error('kcn checkout session error:', err);
    return NextResponse.json(
      { error: '決済セッションの作成中にエラーが発生しました。' },
      { status: 500 }
    );
  }
}
