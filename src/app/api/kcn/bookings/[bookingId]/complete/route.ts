import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { canReportLessonCompletion } from '@/types/kids-coach-db';

/**
 * 虚偽報告防止・2段階報酬確定API
 * - POST: コーチによる指導完了報告（終了時刻経過後のみ受付 -> completion_reported）
 * - PATCH: 保護者確認または48時間経過後の確定処理（-> completed / 隔週振込対象）
 */
export async function POST(
  req: NextRequest,
  context: { params: Promise<{ bookingId: string }> }
) {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
    return NextResponse.json(
      { error: '本番環境変数（Supabase）が未設定です。' },
      { status: 503 }
    );
  }

  try {
    const { bookingId } = await context.params;
    const { coachId } = (await req.json()) as { coachId: string };

    if (!bookingId || !coachId) {
      return NextResponse.json(
        { error: 'bookingId と coachId が必須です。' },
        { status: 400 }
      );
    }

    const supabase = createAdminClient();
    const { data: booking } = await supabase
      .from('kcn_bookings')
      .select('id, coach_id, status, slot:kcn_service_slots(end_time)')
      .eq('id', bookingId)
      .single();

    if (!booking || booking.coach_id !== coachId) {
      return NextResponse.json(
        { error: '対象の予約が見つかりません。' },
        { status: 404 }
      );
    }
    if (booking.status !== 'confirmed') {
      return NextResponse.json(
        { error: '予約確定（実施待ち）の予約のみ完了報告できます。' },
        { status: 400 }
      );
    }

    const slotRecord = Array.isArray(booking.slot) ? booking.slot[0] : booking.slot;
    if (!canReportLessonCompletion(slotRecord?.end_time)) {
      return NextResponse.json(
        { error: 'レッスン終了時刻を過ぎるまで完了報告はできません（虚偽報告防止）。' },
        { status: 403 }
      );
    }

    const { error: updateError } = await supabase
      .from('kcn_bookings')
      .update({
        status: 'completion_reported',
        completion_reported_at: new Date().toISOString(),
      })
      .eq('id', bookingId);

    if (updateError) {
      return NextResponse.json(
        { error: '完了報告の保存に失敗しました。' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      status: 'completion_reported',
    });
  } catch (err) {
    console.error('kcn booking complete report error:', err);
    return NextResponse.json(
      { error: '完了報告の処理中にエラーが発生しました。' },
      { status: 500 }
    );
  }
}

export async function PATCH(
  req: NextRequest,
  context: { params: Promise<{ bookingId: string }> }
) {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
    return NextResponse.json(
      { error: '本番環境変数（Supabase）が未設定です。' },
      { status: 503 }
    );
  }

  try {
    const { bookingId } = await context.params;
    const { parentId } = (await req.json()) as { parentId?: string };

    const supabase = createAdminClient();
    const { data: booking } = await supabase
      .from('kcn_bookings')
      .select('id, parent_id, status')
      .eq('id', bookingId)
      .single();

    if (!booking) {
      return NextResponse.json(
        { error: '対象の予約が見つかりません。' },
        { status: 404 }
      );
    }
    if (parentId && booking.parent_id !== parentId) {
      return NextResponse.json(
        { error: '保護者本人のみ確認できます。' },
        { status: 403 }
      );
    }
    if (booking.status !== 'completion_reported') {
      return NextResponse.json(
        { error: '完了報告済みの予約のみ確定できます。' },
        { status: 400 }
      );
    }

    const { error: updateError } = await supabase
      .from('kcn_bookings')
      .update({
        status: 'completed',
        completed_at: new Date().toISOString(),
      })
      .eq('id', bookingId);

    if (updateError) {
      return NextResponse.json(
        { error: '報酬確定の更新に失敗しました。' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      status: 'completed',
    });
  } catch (err) {
    console.error('kcn booking confirm error:', err);
    return NextResponse.json(
      { error: '報酬確定の処理中にエラーが発生しました。' },
      { status: 500 }
    );
  }
}
