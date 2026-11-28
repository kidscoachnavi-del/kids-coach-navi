import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { validateChatMessage } from '@/types/kids-coach-db';

/**
 * チャットメッセージ送信API（認証必須＋中抜き防止フィルター＋削除済みロックをサーバー側で強制）
 */
export async function POST(req: NextRequest) {
  if (
    !process.env.NEXT_PUBLIC_SUPABASE_URL ||
    !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
    !process.env.SUPABASE_SERVICE_ROLE_KEY
  ) {
    return NextResponse.json(
      { error: '本番環境変数（Supabase）が未設定です。' },
      { status: 503 }
    );
  }

  try {
    const authClient = await createClient();
    const {
      data: { user },
      error: authError,
    } = await authClient.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { error: 'ログインが必要です。' },
        { status: 401 }
      );
    }

    const { roomId, bookingId, message } =
      (await req.json()) as {
        roomId: string;
        bookingId?: string;
        message: string;
      };

    if (!roomId || !message?.trim()) {
      return NextResponse.json(
        { error: '必須パラメータが不足しています。' },
        { status: 400 }
      );
    }

    const supabase = createAdminClient();
    const { data: room } = await supabase
      .from('kcn_chat_rooms')
      .select('id, parent_id, coach_id, deleted_at')
      .eq('id', roomId)
      .single();

    if (!room) {
      return NextResponse.json(
        { error: 'チャットルームが見つかりません。' },
        { status: 404 }
      );
    }
    if (room.deleted_at) {
      return NextResponse.json(
        { error: 'このチャットは削除されているため送信できません。' },
        { status: 403 }
      );
    }
    if (user.id !== room.parent_id && user.id !== room.coach_id) {
      return NextResponse.json(
        { error: '送信権限がありません。' },
        { status: 403 }
      );
    }

    const resolvedSenderRole: 'parent' | 'coach' =
      user.id === room.coach_id ? 'coach' : 'parent';

    // サーバー側で連絡先交換・直接取引ワードを検査して自動マスク
    const validation = validateChatMessage(message.trim());
    const storedText = validation.hasViolation
      ? validation.maskedMessage
      : message.trim();

    const { data: created, error: insertError } = await supabase
      .from('kcn_chat_messages')
      .insert({
        room_id: room.id,
        booking_id: bookingId || null,
        sender_id: user.id,
        sender_role: resolvedSenderRole,
        message: storedText,
      })
      .select('*')
      .single();

    if (insertError || !created) {
      return NextResponse.json(
        { error: 'メッセージの送信に失敗しました。' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      message: created,
      hasViolation: validation.hasViolation,
      warningReason: validation.reason,
    });
  } catch (err) {
    console.error('kcn chat message post error:', err);
    return NextResponse.json(
      { error: 'メッセージ送信中にエラーが発生しました。' },
      { status: 500 }
    );
  }
}
