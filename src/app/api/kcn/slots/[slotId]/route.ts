import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';

const isUuid = (v?: string) =>
  Boolean(v && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(v));

/**
 * 予約スロット詳細取得 API (GET /api/kcn/slots/[slotId])
 * 実DB上の kcn_service_slots + kcn_services + kcn_coach_profiles を返す
 */
export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ slotId: string }> }
) {
  const { slotId } = await params;

  if (
    !isUuid(slotId) ||
    !process.env.NEXT_PUBLIC_SUPABASE_URL ||
    !process.env.SUPABASE_SERVICE_ROLE_KEY
  ) {
    return NextResponse.json({ slot: null });
  }

  try {
    const supabase = createAdminClient();
    const { data: slot, error } = await supabase
      .from('kcn_service_slots')
      .select(
        `
        id,
        service_id,
        coach_id,
        start_time,
        end_time,
        is_booked,
        service:kcn_services (
          id,
          title,
          sport_category,
          target_areas,
          price,
          duration_minutes,
          target_ages,
          description
        ),
        coach:kcn_coach_profiles (
          id,
          display_name,
          title,
          avatar_url
        )
      `
      )
      .eq('id', slotId)
      .maybeSingle();

    if (error || !slot) {
      return NextResponse.json({ slot: null });
    }

    return NextResponse.json({ slot });
  } catch (err) {
    console.error('kcn slot detail fetch error:', err);
    return NextResponse.json({ slot: null });
  }
}
