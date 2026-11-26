import { NextRequest, NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe';
import { createAdminClient } from '@/lib/supabase/admin';

const isUuid = (v?: string) =>
  Boolean(v && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(v));

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
      parentName,
      parentEmail,
      parentPhone,
      membershipNumber,
      studentName,
      studentAge,
      notes,
      saveForFuture = true,
    } = body as {
      slotId: string;
      serviceId?: string;
      parentId?: string;
      coachId?: string;
      parentName?: string;
      parentEmail?: string;
      parentPhone?: string;
      membershipNumber?: string;
      studentName: string;
      studentAge: string;
      notes?: string;
      saveForFuture?: boolean;
    };

    if (!slotId || !studentName) {
      return NextResponse.json(
        { error: '必須パラメータ（予約枠・お子様のお名前）が不足しています。' },
        { status: 400 }
      );
    }

    const supabase = createAdminClient();
    const appUrl =
      process.env.NEXT_PUBLIC_APP_URL ||
      req.nextUrl.origin ||
      'https://kids-coach-navi.com';

    // スロット解決（UUIDなら直接参照、モックID時は未予約スロットを1件取得して検証）
    let resolvedSlot: { id: string; service_id: string; coach_id: string; is_booked: boolean } | null = null;
    if (isUuid(slotId)) {
      const { data } = await supabase
        .from('kcn_service_slots')
        .select('id, service_id, coach_id, is_booked')
        .eq('id', slotId)
        .single();
      resolvedSlot = data;
    } else {
      const { data } = await supabase
        .from('kcn_service_slots')
        .select('id, service_id, coach_id, is_booked')
        .eq('is_booked', false)
        .order('created_at', { ascending: true })
        .limit(1)
        .maybeSingle();
      resolvedSlot = data;
    }

    if (!resolvedSlot) {
      return NextResponse.json(
        { error: '予約可能なレッスン枠が見つかりません。' },
        { status: 404 }
      );
    }
    if (resolvedSlot.is_booked) {
      return NextResponse.json(
        { error: 'この時間枠はすでに予約されています。' },
        { status: 409 }
      );
    }

    const resolvedServiceId = isUuid(serviceId) ? serviceId! : resolvedSlot.service_id;
    const resolvedCoachId = isUuid(coachId) ? coachId! : resolvedSlot.coach_id;

    // 保護者ユーザー解決（parentId UUID → メール/会員番号検索 → 新規Auth/KCNユーザー作成）
    let parentUser: { id: string; email: string; name: string; stripe_customer_id: string | null } | null = null;
    if (isUuid(parentId)) {
      const { data } = await supabase
        .from('kcn_users')
        .select('id, email, name, stripe_customer_id')
        .eq('id', parentId!)
        .maybeSingle();
      parentUser = data;
    }
    if (!parentUser && parentEmail) {
      const { data } = await supabase
        .from('kcn_users')
        .select('id, email, name, stripe_customer_id')
        .eq('email', parentEmail.trim())
        .maybeSingle();
      parentUser = data;
    }
    if (!parentUser && membershipNumber) {
      const { data } = await supabase
        .from('kcn_users')
        .select('id, email, name, stripe_customer_id')
        .eq('membership_number', membershipNumber.trim())
        .maybeSingle();
      parentUser = data;
    }
    if (!parentUser && parentEmail) {
      const { data: authCreated, error: authErr } = await supabase.auth.admin.createUser({
        email: parentEmail.trim(),
        email_confirm: true,
        user_metadata: { name: parentName || '保護者様', role: 'parent' },
      });
      if (!authErr && authCreated?.user) {
        const { data: inserted } = await supabase
          .from('kcn_users')
          .insert({
            id: authCreated.user.id,
            role: 'parent',
            name: parentName || '保護者様',
            email: parentEmail.trim(),
            phone: parentPhone || null,
            membership_number: membershipNumber || null,
          })
          .select('id, email, name, stripe_customer_id')
          .single();
        parentUser = inserted;
      }
    }

    const { data: service } = await supabase
      .from('kcn_services')
      .select('id, title, price, duration_minutes')
      .eq('id', resolvedServiceId)
      .single();

    if (!service || !parentUser) {
      return NextResponse.json(
        { error: '対象のレッスンまたは保護者情報が見つかりません。メールアドレスをご入力ください。' },
        { status: 404 }
      );
    }

    const slot = resolvedSlot;
    const finalCoachId = resolvedCoachId;

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
        coach_id: finalCoachId,
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
          kcn_coach_id: finalCoachId,
        },
      },
      metadata: {
        kcn_booking_id: booking.id,
        kcn_slot_id: slot.id,
        kcn_parent_id: parentUser.id,
        kcn_coach_id: finalCoachId,
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
