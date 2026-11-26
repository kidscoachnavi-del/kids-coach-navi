import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';

async function assertAdmin() {
  const supabase = await createClient();
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();
  if (error || !user) {
    return { ok: false as const, status: 401, userId: null };
  }

  const adminClient = createAdminClient();
  const [{ data: kcnUser }, { data: profile }] = await Promise.all([
    adminClient.from('kcn_users').select('role').eq('id', user.id).maybeSingle(),
    adminClient.from('profiles').select('role').eq('id', user.id).maybeSingle(),
  ]);

  if (kcnUser?.role !== 'admin' && profile?.role !== 'admin') {
    return { ok: false as const, status: 403, userId: user.id };
  }

  return { ok: true as const, status: 200, userId: user.id };
}

/**
 * キッズコーチナビ 管理者用データ取得 API (GET /api/admin/kcn)
 */
export async function GET() {
  const auth = await assertAdmin();
  if (!auth.ok) {
    return NextResponse.json(
      { error: auth.status === 401 ? 'Unauthorized' : 'Forbidden' },
      { status: auth.status }
    );
  }

  try {
    const admin = createAdminClient();
    const [
      { data: users },
      { data: coaches },
      { data: services },
      { data: bookings },
      { data: demands },
    ] = await Promise.all([
      admin.from('kcn_users').select('*').order('created_at', { ascending: false }),
      admin
        .from('kcn_coach_profiles')
        .select('*')
        .order('created_at', { ascending: false }),
      admin.from('kcn_services').select('id, title, price, sport_category'),
      admin
        .from('kcn_bookings')
        .select('*')
        .order('created_at', { ascending: false }),
      admin
        .from('kcn_demand_requests')
        .select('*')
        .order('created_at', { ascending: false }),
    ]);

    const userMap = new Map((users || []).map((u) => [u.id, u]));
    const coachMap = new Map((coaches || []).map((c) => [c.id, c]));
    const serviceMap = new Map((services || []).map((s) => [s.id, s]));

    const enrichedBookings = (bookings || []).map((b) => {
      const parent = userMap.get(b.parent_id);
      const coach = coachMap.get(b.coach_id);
      const service = serviceMap.get(b.service_id);
      return {
        ...b,
        parent_name: parent?.name || b.student_name || '不明',
        parent_email: parent?.email || '',
        parent_phone: parent?.phone || '',
        membership_number: parent?.membership_number || '',
        coach_name: coach?.display_name || '担当コーチ',
        service_title: service?.title || 'マンツーマンレッスン',
      };
    });

    const parents = (users || [])
      .filter((u) => u.role === 'parent')
      .map((p) => {
        const myBookings = (bookings || []).filter((b) => b.parent_id === p.id);
        const paidTotal = myBookings
          .filter((b) => ['confirmed', 'completion_reported', 'completed'].includes(b.status))
          .reduce((sum, b) => sum + (b.total_amount || 0), 0);
        return {
          ...p,
          booking_count: myBookings.length,
          paid_total: paidTotal,
        };
      });

    const activeBookings = (bookings || []).filter((b) =>
      ['confirmed', 'completion_reported', 'completed'].includes(b.status)
    );
    const totalSales = activeBookings.reduce((sum, b) => sum + (b.total_amount || 0), 0);
    const totalPlatformFee = activeBookings.reduce(
      (sum, b) => sum + (b.platform_fee || 0),
      0
    );
    const pendingReviewCount = (coaches || []).filter(
      (c) => c.review_status === 'pending_review'
    ).length;

    return NextResponse.json({
      summary: {
        totalSales,
        totalPlatformFee,
        totalBookings: (bookings || []).length,
        activeBookingsCount: activeBookings.length,
        parentCount: parents.length,
        coachCount: (coaches || []).length,
        pendingReviewCount,
        demandCount: (demands || []).length,
      },
      parents,
      coaches: coaches || [],
      bookings: enrichedBookings,
      demands: demands || [],
    });
  } catch (err) {
    console.error('admin kcn GET error:', err);
    return NextResponse.json(
      { error: '管理データの取得に失敗しました。' },
      { status: 500 }
    );
  }
}

/**
 * コーチ目視審査ステータス更新 API (PATCH /api/admin/kcn)
 */
export async function PATCH(req: NextRequest) {
  const auth = await assertAdmin();
  if (!auth.ok) {
    return NextResponse.json(
      { error: auth.status === 401 ? 'Unauthorized' : 'Forbidden' },
      { status: auth.status }
    );
  }

  try {
    const body = await req.json();
    const coachId = typeof body?.coachId === 'string' ? body.coachId : '';
    const action = body?.action;

    if (!coachId || (action !== 'approve' && action !== 'reject')) {
      return NextResponse.json(
        { error: 'coachId と action（approve / reject）を指定してください。' },
        { status: 400 }
      );
    }

    const nextStatus = action === 'approve' ? 'approved' : 'rejected';
    const admin = createAdminClient();

    const { error } = await admin
      .from('kcn_coach_profiles')
      .update({
        review_status: nextStatus,
        reviewed_by: auth.userId,
        reviewed_at: new Date().toISOString(),
      })
      .eq('id', coachId);

    if (error) {
      console.error('admin kcn PATCH error:', error);
      return NextResponse.json(
        { error: '審査ステータスの更新に失敗しました。' },
        { status: 500 }
      );
    }

    return NextResponse.json({ ok: true, coachId, review_status: nextStatus });
  } catch (err) {
    console.error('admin kcn PATCH error:', err);
    return NextResponse.json(
      { error: '処理中にエラーが発生しました。' },
      { status: 500 }
    );
  }
}
