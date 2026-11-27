import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import type { CoachProfile, Service, ServiceSlot, Booking } from '@/types/kids-coach-db';

const COACH_PROFILE_COLUMNS =
  'id, display_name, title, avatar_url, bio, stripe_account_id, stripe_payouts_enabled, avg_rating, total_completed_lessons, created_at';

export interface CoachDashboardData {
  profile: CoachProfile;
  services: Service[];
  slots: ServiceSlot[];
  bookings: Booking[];
}

/**
 * 現在のログインユーザーから対象コーチのダッシュボード用データを最短クエリで取得する
 * - compliance_selfie_path 等の巨大バイナリは除外してペイロードを最小化
 * - JOIN重複を避け、並列単表クエリ + メモリ結合で高速化
 */
export async function resolveAndFetchCoachDashboard(
  requestedCoachId?: string | null
): Promise<
  | { ok: true; data: CoachDashboardData; isAdmin: boolean }
  | { ok: false; error: string; status: 401 | 404 | 500 }
> {
  try {
    const supabase = await createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return { ok: false, error: 'ログインが必要です。', status: 401 };
    }

    const admin = createAdminClient();
    const [{ data: kcnUser }, { data: ownCoach }] = await Promise.all([
      admin.from('kcn_users').select('id, role, email').eq('id', user.id).maybeSingle(),
      admin
        .from('kcn_coach_profiles')
        .select(COACH_PROFILE_COLUMNS)
        .eq('id', user.id)
        .maybeSingle(),
    ]);

    const isAdmin =
      user.email?.toLowerCase() === 'info@swim-partners.com' ||
      kcnUser?.role === 'admin';

    let targetCoach = ownCoach as CoachProfile | null;

    if ((!targetCoach || requestedCoachId) && isAdmin) {
      if (requestedCoachId) {
        const { data } = await admin
          .from('kcn_coach_profiles')
          .select(COACH_PROFILE_COLUMNS)
          .eq('id', requestedCoachId)
          .maybeSingle();
        if (data) targetCoach = data as CoachProfile;
      } else if (!targetCoach) {
        const { data } = await admin
          .from('kcn_coach_profiles')
          .select(COACH_PROFILE_COLUMNS)
          .order('created_at', { ascending: false })
          .limit(1)
          .maybeSingle();
        if (data) targetCoach = data as CoachProfile;
      }
    }

    if (!targetCoach) {
      return {
        ok: false,
        error: isAdmin
          ? '登録されているコーチがまだありません。'
          : 'コーチプロフィールが見つかりません。先にコーチ新規登録を行ってください。',
        status: 404,
      };
    }

    const coachId = targetCoach.id;
    const [{ data: rawServices }, { data: rawSlots }, { data: rawBookings }] =
      await Promise.all([
        admin
          .from('kcn_services')
          .select('*')
          .eq('coach_id', coachId)
          .order('created_at', { ascending: false }),
        admin
          .from('kcn_service_slots')
          .select('id, service_id, coach_id, start_time, end_time, is_booked')
          .eq('coach_id', coachId)
          .order('start_time', { ascending: true }),
        admin
          .from('kcn_bookings')
          .select('*')
          .eq('coach_id', coachId)
          .order('created_at', { ascending: false }),
      ]);

    const services = (rawServices || []) as Service[];
    const serviceMap = new Map(services.map((s) => [s.id, s]));

    const slots = ((rawSlots || []) as ServiceSlot[]).map((slot) => ({
      ...slot,
      service: serviceMap.get(slot.service_id),
    }));
    const slotMap = new Map(slots.map((s) => [s.id, s]));

    const bookings = ((rawBookings || []) as Booking[]).map((booking) => ({
      ...booking,
      service: serviceMap.get(booking.service_id),
      slot: slotMap.get(booking.slot_id),
    }));

    return {
      ok: true,
      isAdmin,
      data: {
        profile: targetCoach,
        services,
        slots,
        bookings,
      },
    };
  } catch (err) {
    console.error('resolveAndFetchCoachDashboard error:', err);
    return {
      ok: false,
      error: 'ダッシュボード情報の取得に失敗しました。',
      status: 500,
    };
  }
}
