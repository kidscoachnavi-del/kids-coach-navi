import { createAdminClient } from '@/lib/supabase/admin';
import {
  Coach,
  AvailableSlot,
  MOCK_COACHES,
  generateMockSlots,
  SPORT_CATEGORIES,
  AREA_LIST,
} from '@/data/kids-coach-mock';

const WEEKDAYS = ['日', '月', '火', '水', '木', '金', '土'];

function mapSportToSlugs(sports: string[]): string[] {
  return sports
    .map((s) => {
      const found = SPORT_CATEGORIES.find(
        (cat) => s.includes(cat.name.slice(0, 2)) || cat.slug === s
      );
      return found?.slug;
    })
    .filter((v): v is string => Boolean(v));
}

function mapAreaToSlugs(areas: string[]): string[] {
  return areas
    .map((a) => {
      const found = AREA_LIST.find((area) => a.includes(area.name) || area.slug === a);
      return found?.slug;
    })
    .filter((v): v is string => Boolean(v));
}

function toAvailableSlot(row: {
  id: string;
  coach_id: string;
  start_time: string;
  end_time: string;
  is_booked: boolean;
}): AvailableSlot {
  const start = new Date(row.start_time);
  const end = new Date(row.end_time);
  const jstStart = new Date(start.toLocaleString('en-US', { timeZone: 'Asia/Tokyo' }));
  const jstEnd = new Date(end.toLocaleString('en-US', { timeZone: 'Asia/Tokyo' }));
  const pad = (n: number) => String(n).padStart(2, '0');
  const date = `${jstStart.getFullYear()}-${pad(jstStart.getMonth() + 1)}-${pad(jstStart.getDate())}`;

  return {
    id: row.id,
    coachId: row.coach_id,
    date,
    dayOfWeek: WEEKDAYS[jstStart.getDay()] ?? '土',
    startTime: `${pad(jstStart.getHours())}:${pad(jstStart.getMinutes())}`,
    endTime: `${pad(jstEnd.getHours())}:${pad(jstEnd.getMinutes())}`,
    status: row.is_booked ? 'booked' : 'available',
  };
}

/**
 * 承認済みコーチ一覧と空き枠を取得（Supabase優先・未構築時はモックフォールバック）
 */
export async function fetchApprovedCoachesWithSlots(): Promise<{
  coaches: Coach[];
  slots: AvailableSlot[];
  fromDatabase: boolean;
}> {
  if (
    !process.env.NEXT_PUBLIC_SUPABASE_URL ||
    !process.env.SUPABASE_SERVICE_ROLE_KEY
  ) {
    return { coaches: MOCK_COACHES, slots: [], fromDatabase: false };
  }

  try {
    const supabase = createAdminClient();
    const [{ data: dbCoaches }, { data: dbServices }, { data: dbSlots }] =
      await Promise.all([
        supabase
          .from('kcn_coach_profiles')
          .select('*')
          .eq('review_status', 'approved')
          .order('created_at', { ascending: false }),
        supabase
          .from('kcn_services')
          .select('id, coach_id, price, duration_minutes, target_ages, is_published')
          .eq('is_published', true),
        supabase
          .from('kcn_service_slots')
          .select('id, coach_id, start_time, end_time, is_booked')
          .eq('is_booked', false)
          .gte('start_time', new Date().toISOString())
          .order('start_time', { ascending: true }),
      ]);

    if (!dbCoaches || dbCoaches.length === 0) {
      return { coaches: MOCK_COACHES, slots: [], fromDatabase: false };
    }

    const coaches: Coach[] = dbCoaches.map((c) => {
      const coachServices = (dbServices || []).filter((s) => s.coach_id === c.id);
      const minPrice =
        coachServices.length > 0
          ? Math.min(...coachServices.map((s) => s.price))
          : 5500;
      const primaryService = coachServices[0];
      const sports = Array.isArray(c.sport_categories) ? c.sport_categories : [];
      const areas = Array.isArray(c.target_areas) ? c.target_areas : [];

      return {
        id: c.id,
        name: c.display_name,
        kana: c.display_name,
        initial: c.display_name.slice(0, 1),
        title: c.title,
        avatar:
          c.avatar_url ||
          'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=80',
        rating: Number(c.avg_rating || 5.0),
        reviewCount: Number(c.total_completed_lessons || 0),
        hourlyRate: minPrice,
        durationMinutes: primaryService?.duration_minutes || 60,
        sports,
        sportsSlugs: mapSportToSlugs(sports),
        specialties: sports,
        areas,
        areaSlugs: mapAreaToSlugs(areas),
        bio: c.bio || '',
        achievements: [c.title],
        coachingHistory: ['認定本人確認・目視審査通過コーチ'],
        targetAges: primaryService?.target_ages || '4〜12歳（年中〜小学生）',
        message: c.bio || 'お子様のペースに合わせて丁寧に指導いたします。',
        isVerified: true,
      };
    });

    const slots: AvailableSlot[] = (dbSlots || []).map(toAvailableSlot);

    return { coaches, slots, fromDatabase: true };
  } catch (err) {
    console.error('fetchApprovedCoachesWithSlots error:', err);
    return { coaches: MOCK_COACHES, slots: [], fromDatabase: false };
  }
}

/**
 * コーチ単体と空き枠を取得（UUIDならSupabase参照、モックID時はモック参照）
 */
export async function fetchCoachByIdWithSlots(id: string): Promise<{
  coach: Coach | undefined;
  slots: AvailableSlot[];
}> {
  const { coaches, slots } = await fetchApprovedCoachesWithSlots();
  const found = coaches.find((c) => c.id === id) || MOCK_COACHES.find((c) => c.id === id);
  const dbCoachSlots = slots.filter((s) => s.coachId === id);
  const coachSlots =
    dbCoachSlots.length > 0 ? dbCoachSlots : generateMockSlots(id, 60);

  return { coach: found, slots: coachSlots };
}
