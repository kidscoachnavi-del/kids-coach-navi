import { NextRequest, NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe';
import { createAdminClient } from '@/lib/supabase/admin';

/**
 * 2回目以降のワンクリック決済API
 * 当サイトではクレジットカード番号を保持せず、Stripe Customer に保存された
 * 決済手段（PaymentMethod）をオフセッション決済で即時実行する
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
    const { slotId, serviceId, parentId, coachId, studentName, studentAge, notes } =
      body as {
        slotId: string;
        serviceId: string;
        parentId: string;
        coachId: string;
        studentName: string;
        studentAge: string;
        notes?: string;
      };

    if (!slotId || !serviceId || !parentId || !coachId || !studentName) {
      return NextResponse.json(
        { error: '必須パラメータが不足しています。' },
        { status: 400 }
      );
    }

    const supabase = createAdminClient();
    const [{ data: service }, { data: slot }, { data: parentUser }] =
      await Promise.all([
        supabase
          .from('kcn_services')
          .select('id, title, price')
          .eq('id', serviceId)
          .single(),
        supabase
          .from('kcn_service_slots')
          .select('id, is_booked')
          .eq('id', slotId)
          .single(),
        supabase
          .from('kcn_users')
          .select('id, stripe_customer_id')
          .eq('id', parentId)
          .single(),
      ]);

    if (!service || !slot || !parentUser?.stripe_customer_id) {
      return NextResponse.json(
        { error: 'ワンクリック決済用の登録済み決済情報が見つかりません。' },
        { status: 404 }
      );
    }
    if (slot.is_booked) {
      return NextResponse.json(
        { error: 'この時間枠はすでに予約されています。' },
        { status: 409 }
      );
    }

    // Stripe 側で保存済みのカード決済手段を取得（番号本体は取得・保持しない）
    const paymentMethods = await stripe.paymentMethods.list({
      customer: parentUser.stripe_customer_id,
      type: 'card',
      limit: 1,
    });
    const defaultPm = paymentMethods.data[0];
    if (!defaultPm) {
      return NextResponse.json(
        { error: '保存済みの決済手段がありません。通常決済をご利用ください。' },
        { status: 400 }
      );
    }

    const totalAmount = service.price;
    const platformFee = Math.round(totalAmount * 0.25);
    const coachPayout = totalAmount - platformFee;

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

    // オフセッションで即時決済を実行
    const paymentIntent = await stripe.paymentIntents.create({
      amount: totalAmount,
      currency: 'jpy',
      customer: parentUser.stripe_customer_id,
      payment_method: defaultPm.id,
      off_session: true,
      confirm: true,
      description: service.title,
      metadata: {
        kcn_booking_id: booking.id,
        kcn_slot_id: slot.id,
        kcn_parent_id: parentUser.id,
        kcn_coach_id: coachId,
      },
    });

    // 予約確定・枠確保・統合チャットルーム生成
    await Promise.all([
      supabase
        .from('kcn_bookings')
        .update({
          status: 'confirmed',
          stripe_payment_intent_id: paymentIntent.id,
        })
        .eq('id', booking.id),
      supabase
        .from('kcn_service_slots')
        .update({ is_booked: true })
        .eq('id', slot.id),
      supabase.from('kcn_chat_rooms').upsert(
        { parent_id: parentUser.id, coach_id: coachId },
        { onConflict: 'parent_id,coach_id', ignoreDuplicates: true }
      ),
    ]);

    return NextResponse.json({
      success: true,
      bookingId: booking.id,
      paymentIntentId: paymentIntent.id,
    });
  } catch (err) {
    console.error('kcn one-click checkout error:', err);
    return NextResponse.json(
      { error: 'ワンクリック決済に失敗しました。通常決済をお試しください。' },
      { status: 500 }
    );
  }
}
