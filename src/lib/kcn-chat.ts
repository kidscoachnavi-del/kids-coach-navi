import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import type {
  Booking,
  ChatMessage,
  CoachProfile,
  Service,
  ServiceSlot,
  UserRole,
} from '@/types/kids-coach-db';

const COACH_PROFILE_COLUMNS =
  'id, display_name, title, avatar_url, bio, stripe_account_id, stripe_payouts_enabled, avg_rating, total_completed_lessons, created_at';

export interface KcnChatUser {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  isAdmin: boolean;
  isCoach: boolean;
}

export interface KcnChatRoomRecord {
  id: string;
  roomKey: string;
  parentId: string;
  coachId: string;
  deletedByRole: 'parent' | 'coach' | null;
  deletedAt: string | null;
}

export interface ChatInitialData {
  currentUser: KcnChatUser;
  bookings: Booking[];
  messages: ChatMessage[];
  roomsMeta: KcnChatRoomRecord[];
}

export type ChatFetchResult =
  | { ok: true; data: ChatInitialData }
  | { ok: false; error: string; status: 401 | 500 };

/**
 * 現在のログインユーザーを検証し、当事者（保護者・コーチ・管理者）の
 * 予約およびチャット履歴のみを Supabase 実データから取得する。
 * - 未ログイン時は必ず status: 401 を返す（デモ・モックデータへのフォールバックなし）
 * - compliance_selfie_path や連絡先（電話番号等）の不要な個人情報は除外する
 */
export async function resolveAndFetchChatData(): Promise<ChatFetchResult> {
  if (
    !process.env.NEXT_PUBLIC_SUPABASE_URL ||
    !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  ) {
    return { ok: false, error: 'ログインが必要です。', status: 401 };
  }

  try {
    const supabase = await createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return { ok: false, error: 'ログインが必要です。', status: 401 };
    }

    const db = process.env.SUPABASE_SERVICE_ROLE_KEY
      ? createAdminClient()
      : supabase;

    const [{ data: kcnUser }, { data: ownCoach }] = await Promise.all([
      db
        .from('kcn_users')
        .select('id, role, name, email')
        .eq('id', user.id)
        .maybeSingle(),
      db
        .from('kcn_coach_profiles')
        .select(COACH_PROFILE_COLUMNS)
        .eq('id', user.id)
        .maybeSingle(),
    ]);

    const isAdmin =
      user.email?.toLowerCase() === 'info@swim-partners.com' ||
      kcnUser?.role === 'admin';
    const isCoach = Boolean(ownCoach) || kcnUser?.role === 'coach';

    const resolvedRole: UserRole = isAdmin
      ? 'admin'
      : isCoach
        ? 'coach'
        : 'parent';

    const displayName =
      ownCoach?.display_name ||
      kcnUser?.name ||
      (typeof user.user_metadata?.full_name === 'string' &&
      user.user_metadata.full_name.trim()
        ? user.user_metadata.full_name.trim()
        : null) ||
      user.email?.split('@')[0] ||
      'ユーザー';

    const currentUser: KcnChatUser = {
      id: user.id,
      name: displayName,
      email: user.email || kcnUser?.email || '',
      role: resolvedRole,
      isAdmin,
      isCoach,
    };

    const bookingsQuery = db
      .from('kcn_bookings')
      .select(
        'id, service_id, slot_id, parent_id, coach_id, status, total_amount, platform_fee, coach_payout, stripe_payment_intent_id, stripe_transfer_id, student_name, student_age, notes, created_at'
      )
      .order('created_at', { ascending: false })
      .limit(100);

    const roomsQuery = db
      .from('kcn_chat_rooms')
      .select('id, parent_id, coach_id, deleted_by_role, deleted_at, created_at')
      .order('created_at', { ascending: false })
      .limit(100);

    if (!isAdmin) {
      bookingsQuery.or(`parent_id.eq.${user.id},coach_id.eq.${user.id}`);
      roomsQuery.or(`parent_id.eq.${user.id},coach_id.eq.${user.id}`);
    }

    const [{ data: rawBookings, error: bookingsError }, { data: rawRooms }] =
      await Promise.all([bookingsQuery, roomsQuery]);

    if (bookingsError) {
      console.error('resolveAndFetchChatData bookingsError:', bookingsError);
      return {
        ok: false,
        error: 'チャット情報の取得に失敗しました。',
        status: 500,
      };
    }

    const bookingRows = rawBookings || [];
    const roomRows = rawRooms || [];

    const serviceIds = Array.from(
      new Set(bookingRows.map((b) => b.service_id).filter(Boolean))
    );
    const slotIds = Array.from(
      new Set(bookingRows.map((b) => b.slot_id).filter(Boolean))
    );
    const coachIds = Array.from(
      new Set(
        [
          ...bookingRows.map((b) => b.coach_id),
          ...roomRows.map((r) => r.coach_id),
        ].filter(Boolean)
      )
    );
    const parentIds = Array.from(
      new Set(
        [
          ...bookingRows.map((b) => b.parent_id),
          ...roomRows.map((r) => r.parent_id),
        ].filter(Boolean)
      )
    );
    const roomIds = roomRows.map((r) => r.id).filter(Boolean);

    const [
      servicesRes,
      slotsRes,
      coachesRes,
      parentsRes,
      messagesRes,
    ] = await Promise.all([
      serviceIds.length > 0
        ? db.from('kcn_services').select('*').in('id', serviceIds)
        : Promise.resolve({ data: [] as Service[] }),
      slotIds.length > 0
        ? db
            .from('kcn_service_slots')
            .select('id, service_id, coach_id, start_time, end_time, is_booked')
            .in('id', slotIds)
        : Promise.resolve({ data: [] as ServiceSlot[] }),
      coachIds.length > 0
        ? db
            .from('kcn_coach_profiles')
            .select(COACH_PROFILE_COLUMNS)
            .in('id', coachIds)
        : Promise.resolve({ data: [] as CoachProfile[] }),
      parentIds.length > 0
        ? db
            .from('kcn_users')
            .select('id, role, name, created_at')
            .in('id', parentIds)
        : Promise.resolve({
            data: [] as Array<{
              id: string;
              role: UserRole;
              name: string;
              created_at: string;
            }>,
          }),
      roomIds.length > 0
        ? db
            .from('kcn_chat_messages')
            .select(
              'id, room_id, booking_id, sender_id, sender_role, message, is_read, created_at'
            )
            .in('room_id', roomIds)
            .order('created_at', { ascending: true })
        : Promise.resolve({
            data: [] as Array<{
              id: string;
              room_id: string;
              booking_id: string | null;
              sender_id: string;
              sender_role: 'parent' | 'coach';
              message: string;
              is_read: boolean;
              created_at: string;
            }>,
          }),
    ]);

    const serviceMap = new Map(
      ((servicesRes.data || []) as Service[]).map((s) => [s.id, s])
    );
    const slotMap = new Map(
      ((slotsRes.data || []) as ServiceSlot[]).map((s) => [s.id, s])
    );
    const coachMap = new Map(
      ((coachesRes.data || []) as CoachProfile[]).map((c) => [c.id, c])
    );
    const parentMap = new Map(
      (parentsRes.data || []).map((p) => [p.id, p])
    );

    const bookings: Booking[] = bookingRows.map((row) => {
      const parentInfo = parentMap.get(row.parent_id);
      return {
        ...row,
        service: serviceMap.get(row.service_id),
        slot: slotMap.get(row.slot_id),
        coach: coachMap.get(row.coach_id),
        parent: parentInfo
          ? {
              id: parentInfo.id,
              role: parentInfo.role,
              email: '',
              name: parentInfo.name,
              created_at: parentInfo.created_at,
            }
          : undefined,
      } as Booking;
    });

    const primaryBookingByRoomKey = new Map<string, string>();
    for (const b of bookings) {
      const key = `${b.parent_id}__${b.coach_id}`;
      if (!primaryBookingByRoomKey.has(key)) {
        primaryBookingByRoomKey.set(key, b.id);
      }
    }

    const roomsMeta: KcnChatRoomRecord[] = roomRows.map((r) => ({
      id: r.id,
      roomKey: `${r.parent_id}__${r.coach_id}`,
      parentId: r.parent_id,
      coachId: r.coach_id,
      deletedByRole:
        r.deleted_at &&
        (r.deleted_by_role === 'parent' || r.deleted_by_role === 'coach')
          ? r.deleted_by_role
          : null,
      deletedAt: r.deleted_at || null,
    }));

    const roomKeyById = new Map(roomsMeta.map((r) => [r.id, r.roomKey]));

    const messages: ChatMessage[] = (messagesRes.data || []).map((m) => {
      const roomKey = roomKeyById.get(m.room_id) || '';
      const fallbackBookingId = primaryBookingByRoomKey.get(roomKey) || '';
      const senderCoach = coachMap.get(m.sender_id);
      const senderParent = parentMap.get(m.sender_id);
      const senderName =
        m.sender_role === 'coach'
          ? `${senderCoach?.display_name || '担当'}（コーチ）`
          : `${senderParent?.name || '生徒・保護者'}（保護者）`;

      return {
        id: m.id,
        booking_id: m.booking_id || fallbackBookingId,
        sender_id: m.sender_id,
        sender_name: senderName,
        sender_role: m.sender_role,
        message: m.message,
        is_read: Boolean(m.is_read),
        created_at: m.created_at,
      };
    });

    return {
      ok: true,
      data: {
        currentUser,
        bookings,
        messages,
        roomsMeta,
      },
    };
  } catch (err) {
    console.error('resolveAndFetchChatData error:', err);
    return {
      ok: false,
      error: 'チャット情報の取得に失敗しました。',
      status: 500,
    };
  }
}
