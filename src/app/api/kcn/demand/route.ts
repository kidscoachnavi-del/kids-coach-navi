import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';

/**
 * 保護者リクエスト（希望種目・エリア）を Supabase kcn_demand_requests へ保存する API
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const sportName = typeof body?.sportName === 'string' ? body.sportName.trim() : '';
    const areaName = typeof body?.areaName === 'string' ? body.areaName.trim() : '';
    const note = typeof body?.note === 'string' ? body.note.trim() : '';
    const contactEmail =
      typeof body?.contactEmail === 'string' ? body.contactEmail.trim() : '';

    if (!sportName || !areaName) {
      return NextResponse.json(
        { error: 'ご希望の種目とエリアをご入力ください。' },
        { status: 400 }
      );
    }

    if (
      !process.env.NEXT_PUBLIC_SUPABASE_URL ||
      !process.env.SUPABASE_SERVICE_ROLE_KEY
    ) {
      return NextResponse.json({ ok: true, savedToDb: false });
    }

    const supabase = createAdminClient();
    const { data, error } = await supabase
      .from('kcn_demand_requests')
      .insert({
        sport_name: sportName,
        area_name: areaName,
        note: note || null,
        contact_email: contactEmail || null,
      })
      .select('id')
      .single();

    if (error) {
      console.error('kcn_demand_requests insert error:', error);
      return NextResponse.json(
        { error: 'リクエストの保存に失敗しました。' },
        { status: 500 }
      );
    }

    return NextResponse.json({ ok: true, id: data?.id, savedToDb: true });
  } catch (err) {
    console.error('kcn demand POST error:', err);
    return NextResponse.json(
      { error: 'リクエストの送信に失敗しました。' },
      { status: 500 }
    );
  }
}
