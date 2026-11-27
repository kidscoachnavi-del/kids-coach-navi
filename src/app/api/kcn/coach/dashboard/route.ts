import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { resolveAndFetchCoachDashboard } from '@/lib/kcn-coach-dashboard';

/**
 * 現在のログインユーザーから対象コーチIDを解決する
 * - コーチ本人でログイン時: 本人の kcn_coach_profiles.id
 * - 管理者(admin / info@swim-partners.com)でログイン時: 指定 coachId または最新の承認済みコーチ
 */
async function resolveCoachId(requestedCoachId?: string | null) {
  const supabase = await createClient();
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user) {
    return { error: 'ログインが必要です。', status: 401 as const };
  }

  const admin = createAdminClient();
  const [{ data: kcnUser }, { data: ownCoach }] = await Promise.all([
    admin.from('kcn_users').select('id, role, email').eq('id', user.id).maybeSingle(),
    admin.from('kcn_coach_profiles').select('*').eq('id', user.id).maybeSingle(),
  ]);

  const isAdmin =
    user.email?.toLowerCase() === 'info@swim-partners.com' ||
    kcnUser?.role === 'admin';

  if (ownCoach && !requestedCoachId) {
    return { coachProfile: ownCoach, isAdmin, status: 200 as const };
  }

  if (isAdmin) {
    if (requestedCoachId) {
      const { data: targetCoach } = await admin
        .from('kcn_coach_profiles')
        .select('*')
        .eq('id', requestedCoachId)
        .maybeSingle();
      if (targetCoach) {
        return { coachProfile: targetCoach, isAdmin: true, status: 200 as const };
      }
    }
    const { data: latestCoach } = await admin
      .from('kcn_coach_profiles')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (latestCoach) {
      return { coachProfile: latestCoach, isAdmin: true, status: 200 as const };
    }
    return { error: '登録されているコーチがまだありません。', status: 404 as const };
  }

  return {
    error: 'コーチプロフィールが見つかりません。先にコーチ新規登録を行ってください。',
    status: 404 as const,
  };
}

/**
 * コーチダッシュボードデータ取得 API (GET /api/kcn/coach/dashboard)
 */
export async function GET(req: NextRequest) {
  const coachIdParam = req.nextUrl.searchParams.get('coachId');
  const result = await resolveAndFetchCoachDashboard(coachIdParam);
  if (!result.ok) {
    return NextResponse.json({ error: result.error }, { status: result.status });
  }
  return NextResponse.json(result.data);
}

/**
 * レッスン出品・空き枠登録 API (POST /api/kcn/coach/dashboard)
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const action = body?.action as string | undefined;
    const resolved = await resolveCoachId(body?.coachId);
    if ('error' in resolved) {
      return NextResponse.json({ error: resolved.error }, { status: resolved.status });
    }

    const admin = createAdminClient();
    const coachId = resolved.coachProfile.id;

    if (action === 'create_service') {
      const title = typeof body.title === 'string' ? body.title.trim() : '';
      const sportCategory =
        typeof body.sportCategory === 'string' ? body.sportCategory.trim() : 'かけっこ・走り方';
      const targetAreas = Array.isArray(body.targetAreas)
        ? body.targetAreas.filter((a: unknown): a is string => typeof a === 'string' && a.trim().length > 0)
        : [];
      const price = Number(body.price);
      const durationMinutes = [60, 90, 120].includes(Number(body.durationMinutes))
        ? Number(body.durationMinutes)
        : 60;
      const description =
        typeof body.description === 'string' ? body.description.trim() : '';
      const requirements =
        typeof body.requirements === 'string' ? body.requirements.trim() : '';

      if (!title || !description || Number.isNaN(price) || price < 5000) {
        return NextResponse.json(
          { error: 'レッスン名・内容・料金（5,000円以上）を正しく入力してください。' },
          { status: 400 }
        );
      }

      const { data: created, error } = await admin
        .from('kcn_services')
        .insert({
          coach_id: coachId,
          title,
          sport_category: sportCategory,
          target_areas: targetAreas,
          price,
          duration_minutes: durationMinutes,
          target_ages: '4〜12歳',
          description,
          requirements,
          is_published: true,
        })
        .select('*')
        .single();

      if (error || !created) {
        console.error('create_service error:', error);
        return NextResponse.json(
          { error: 'レッスンの登録に失敗しました。' },
          { status: 500 }
        );
      }

      return NextResponse.json({ ok: true, service: created });
    }

    if (action === 'create_slot') {
      let serviceId = typeof body.serviceId === 'string' ? body.serviceId : '';
      const dateStr = typeof body.date === 'string' ? body.date.trim() : '';
      const timeStr = typeof body.time === 'string' ? body.time.trim() : '';

      if (!dateStr || !timeStr) {
        return NextResponse.json(
          { error: '日付と開始時刻を指定してください。' },
          { status: 400 }
        );
      }

      // サービス未指定時は対象コーチの既存サービスを取得（なければコーチプロフィールから初期サービスを自動作成）
      if (!serviceId) {
        const { data: existingSvc } = await admin
          .from('kcn_services')
          .select('id, duration_minutes')
          .eq('coach_id', coachId)
          .order('created_at', { ascending: false })
          .limit(1)
          .maybeSingle();

        if (existingSvc) {
          serviceId = existingSvc.id;
        } else {
          const p = resolved.coachProfile;
          const sport =
            Array.isArray(p.sport_categories) && p.sport_categories[0]
              ? p.sport_categories[0]
              : 'かけっこ・走り方';
          const areas = Array.isArray(p.target_areas) ? p.target_areas : ['世田谷区'];
          const { data: autoSvc, error: autoErr } = await admin
            .from('kcn_services')
            .insert({
              coach_id: coachId,
              title: `${p.display_name} コーチ ${sport} マンツーマン指導 60分`,
              sport_category: sport,
              target_areas: areas,
              price: 6500,
              duration_minutes: 60,
              target_ages: '4〜12歳',
              description: p.bio || 'お子様のペースに合わせて丁寧に個別指導いたします。',
              requirements: '動きやすい服装、飲み物、タオル',
              is_published: true,
            })
            .select('id')
            .single();

          if (autoErr || !autoSvc) {
            return NextResponse.json(
              { error: '先に「新規レッスンを出品」からレッスン商品を作成してください。' },
              { status: 400 }
            );
          }
          serviceId = autoSvc.id;
        }
      }

      const startIso = new Date(`${dateStr}T${timeStr}:00+09:00`);
      if (Number.isNaN(startIso.getTime())) {
        return NextResponse.json({ error: '日時の形式が正しくありません。' }, { status: 400 });
      }
      const endIso = new Date(startIso.getTime() + 60 * 60 * 1000);

      const { data: createdSlot, error: slotErr } = await admin
        .from('kcn_service_slots')
        .insert({
          service_id: serviceId,
          coach_id: coachId,
          start_time: startIso.toISOString(),
          end_time: endIso.toISOString(),
          is_booked: false,
        })
        .select('*, service:kcn_services(*)')
        .single();

      if (slotErr || !createdSlot) {
        console.error('create_slot error:', slotErr);
        return NextResponse.json(
          { error: '空き枠の登録に失敗しました。' },
          { status: 500 }
        );
      }

      return NextResponse.json({ ok: true, slot: createdSlot });
    }

    return NextResponse.json({ error: '不正な操作です。' }, { status: 400 });
  } catch (err) {
    console.error('POST /api/kcn/coach/dashboard error:', err);
    return NextResponse.json(
      { error: 'データの保存中にエラーが発生しました。' },
      { status: 500 }
    );
  }
}

/**
 * レッスン商品更新 API (PATCH /api/kcn/coach/dashboard)
 */
export async function PATCH(req: NextRequest) {
  try {
    const body = await req.json();
    const serviceId = typeof body?.serviceId === 'string' ? body.serviceId : '';
    if (!serviceId) {
      return NextResponse.json({ error: 'serviceId が必要です。' }, { status: 400 });
    }

    const resolved = await resolveCoachId(body?.coachId);
    if ('error' in resolved) {
      return NextResponse.json({ error: resolved.error }, { status: resolved.status });
    }

    const title = typeof body.title === 'string' ? body.title.trim() : '';
    const sportCategory =
      typeof body.sportCategory === 'string' ? body.sportCategory.trim() : 'かけっこ・走り方';
    const targetAreas = Array.isArray(body.targetAreas)
      ? body.targetAreas.filter((a: unknown): a is string => typeof a === 'string' && a.trim().length > 0)
      : [];
    const price = Number(body.price);
    const description =
      typeof body.description === 'string' ? body.description.trim() : '';
    const requirements =
      typeof body.requirements === 'string' ? body.requirements.trim() : '';

    if (!title || !description || Number.isNaN(price) || price < 5000) {
      return NextResponse.json(
        { error: 'レッスン名・内容・料金（5,000円以上）を正しく入力してください。' },
        { status: 400 }
      );
    }

    const admin = createAdminClient();
    const { data: updated, error } = await admin
      .from('kcn_services')
      .update({
        title,
        sport_category: sportCategory,
        target_areas: targetAreas,
        price,
        description,
        requirements,
      })
      .eq('id', serviceId)
      .eq('coach_id', resolved.coachProfile.id)
      .select('*')
      .single();

    if (error || !updated) {
      console.error('update_service error:', error);
      return NextResponse.json(
        { error: 'レッスン商品の更新に失敗しました。' },
        { status: 500 }
      );
    }

    return NextResponse.json({ ok: true, service: updated });
  } catch (err) {
    console.error('PATCH /api/kcn/coach/dashboard error:', err);
    return NextResponse.json(
      { error: 'データの更新中にエラーが発生しました。' },
      { status: 500 }
    );
  }
}

/**
 * 未予約の空き枠・レッスン商品削除 API (DELETE /api/kcn/coach/dashboard?slotId=... | ?serviceId=...)
 */
export async function DELETE(req: NextRequest) {
  try {
    const slotId = req.nextUrl.searchParams.get('slotId');
    const serviceId = req.nextUrl.searchParams.get('serviceId');
    const coachIdParam = req.nextUrl.searchParams.get('coachId');
    if (!slotId && !serviceId) {
      return NextResponse.json({ error: 'slotId または serviceId が必要です。' }, { status: 400 });
    }

    const resolved = await resolveCoachId(coachIdParam);
    if ('error' in resolved) {
      return NextResponse.json({ error: resolved.error }, { status: statusForError(resolved.status) });
    }

    const admin = createAdminClient();
    const coachId = resolved.coachProfile.id;

    if (serviceId) {
      const { count } = await admin
        .from('kcn_bookings')
        .select('id', { count: 'exact', head: true })
        .eq('service_id', serviceId);

      if ((count ?? 0) > 0) {
        return NextResponse.json(
          { error: '予約履歴があるレッスン商品は削除できません。' },
          { status: 400 }
        );
      }

      const { error } = await admin
        .from('kcn_services')
        .delete()
        .eq('id', serviceId)
        .eq('coach_id', coachId);

      if (error) {
        return NextResponse.json(
          { error: 'レッスン商品の削除に失敗しました。' },
          { status: 400 }
        );
      }

      return NextResponse.json({ ok: true });
    }

    const { error } = await admin
      .from('kcn_service_slots')
      .delete()
      .eq('id', slotId!)
      .eq('coach_id', coachId)
      .eq('is_booked', false);

    if (error) {
      return NextResponse.json(
        { error: '空き枠の削除に失敗しました（予約済みの枠は削除できません）。' },
        { status: 400 }
      );
    }

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error('DELETE /api/kcn/coach/dashboard error:', err);
    return NextResponse.json({ error: '削除に失敗しました。' }, { status: 500 });
  }
}

function statusForError(status: number): 401 | 404 {
  return status === 401 ? 401 : 404;
}
