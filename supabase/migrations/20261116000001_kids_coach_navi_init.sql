-- キッズコーチナビ by Wellne 本番データベース初期スキーマ
-- 既存システムとのテーブル名衝突を防ぐため kcn_ プレフィックスを使用

-- UUID生成拡張機能
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 1. ユーザー基本テーブル (kcn_users)
CREATE TABLE IF NOT EXISTS public.kcn_users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('parent', 'coach', 'admin')) DEFAULT 'parent',
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  membership_number TEXT,
  stripe_customer_id TEXT, -- ワンクリック決済用（カード番号自体は保持しない）
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 2. コーチプロフィール・コンプラ審査テーブル (kcn_coach_profiles)
CREATE TABLE IF NOT EXISTS public.kcn_coach_profiles (
  id UUID PRIMARY KEY REFERENCES public.kcn_users(id) ON DELETE CASCADE,
  display_name TEXT NOT NULL,
  title TEXT NOT NULL,
  bio TEXT NOT NULL DEFAULT '',
  avatar_url TEXT NOT NULL, -- 公開プロフィール用顔写真（必須）
  compliance_selfie_path TEXT NOT NULL, -- 登録時リアルタイム撮影画像パス（非公開バケット・目視審査用）
  selfie_captured_at TIMESTAMPTZ NOT NULL,
  sport_categories TEXT[] NOT NULL DEFAULT '{}' CHECK (cardinality(sport_categories) <= 3), -- 最大3種目
  target_areas TEXT[] NOT NULL DEFAULT '{}',
  review_status TEXT NOT NULL CHECK (review_status IN ('pending_review', 'approved', 'rejected')) DEFAULT 'pending_review',
  reviewed_by UUID REFERENCES public.kcn_users(id),
  reviewed_at TIMESTAMPTZ,
  stripe_account_id TEXT,
  stripe_payouts_enabled BOOLEAN NOT NULL DEFAULT FALSE,
  avg_rating NUMERIC(3, 2) NOT NULL DEFAULT 5.00,
  total_completed_lessons INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 3. 出品レッスン商品テーブル (kcn_services)
CREATE TABLE IF NOT EXISTS public.kcn_services (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  coach_id UUID NOT NULL REFERENCES public.kcn_coach_profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  sport_category TEXT NOT NULL,
  target_areas TEXT[] NOT NULL DEFAULT '{}',
  price INTEGER NOT NULL CHECK (price >= 5000), -- 下限5,000円（税込・交通費込）
  duration_minutes INTEGER NOT NULL DEFAULT 60 CHECK (duration_minutes IN (60, 90, 120)),
  target_ages TEXT NOT NULL DEFAULT '4〜12歳',
  description TEXT NOT NULL,
  requirements TEXT NOT NULL DEFAULT '',
  is_published BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 4. 空き枠テーブル (kcn_service_slots)
CREATE TABLE IF NOT EXISTS public.kcn_service_slots (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  service_id UUID NOT NULL REFERENCES public.kcn_services(id) ON DELETE CASCADE,
  coach_id UUID NOT NULL REFERENCES public.kcn_coach_profiles(id) ON DELETE CASCADE,
  start_time TIMESTAMPTZ NOT NULL,
  end_time TIMESTAMPTZ NOT NULL,
  is_booked BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CHECK (end_time > start_time)
);

-- 5. 予約・決済・報酬テーブル (kcn_bookings)
CREATE TABLE IF NOT EXISTS public.kcn_bookings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  service_id UUID NOT NULL REFERENCES public.kcn_services(id),
  slot_id UUID NOT NULL REFERENCES public.kcn_service_slots(id),
  parent_id UUID NOT NULL REFERENCES public.kcn_users(id),
  coach_id UUID NOT NULL REFERENCES public.kcn_coach_profiles(id),
  status TEXT NOT NULL CHECK (status IN ('pending', 'confirmed', 'completion_reported', 'completed', 'cancelled')) DEFAULT 'pending',
  total_amount INTEGER NOT NULL,
  platform_fee INTEGER NOT NULL, -- 25% (株式会社Wellne)
  coach_payout INTEGER NOT NULL, -- 75% (コーチ受取)
  stripe_payment_intent_id TEXT,
  stripe_transfer_id TEXT,
  student_name TEXT NOT NULL,
  student_age TEXT NOT NULL,
  notes TEXT NOT NULL DEFAULT '',
  completion_reported_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 6. トークルームテーブル (kcn_chat_rooms：生徒×コーチ単位で統合管理)
CREATE TABLE IF NOT EXISTS public.kcn_chat_rooms (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  parent_id UUID NOT NULL REFERENCES public.kcn_users(id) ON DELETE CASCADE,
  coach_id UUID NOT NULL REFERENCES public.kcn_coach_profiles(id) ON DELETE CASCADE,
  deleted_by_role TEXT CHECK (deleted_by_role IN ('parent', 'coach')),
  deleted_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (parent_id, coach_id)
);

-- 7. チャットメッセージテーブル (kcn_chat_messages)
CREATE TABLE IF NOT EXISTS public.kcn_chat_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  room_id UUID NOT NULL REFERENCES public.kcn_chat_rooms(id) ON DELETE CASCADE,
  booking_id UUID REFERENCES public.kcn_bookings(id) ON DELETE SET NULL,
  sender_id UUID NOT NULL REFERENCES public.kcn_users(id),
  sender_role TEXT NOT NULL CHECK (sender_role IN ('parent', 'coach')),
  message TEXT NOT NULL,
  is_read BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 8. 保護者リクエスト（需要収集）テーブル (kcn_demand_requests)
CREATE TABLE IF NOT EXISTS public.kcn_demand_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sport_name TEXT NOT NULL,
  area_name TEXT NOT NULL,
  note TEXT,
  contact_email TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- インデックス設定
CREATE INDEX IF NOT EXISTS idx_kcn_services_sport ON public.kcn_services(sport_category) WHERE is_published = TRUE;
CREATE INDEX IF NOT EXISTS idx_kcn_slots_coach_time ON public.kcn_service_slots(coach_id, start_time) WHERE is_booked = FALSE;
CREATE INDEX IF NOT EXISTS idx_kcn_bookings_parent ON public.kcn_bookings(parent_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_kcn_bookings_coach ON public.kcn_bookings(coach_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_kcn_messages_room ON public.kcn_chat_messages(room_id, created_at ASC);

-- ============================================================================
-- Row Level Security (RLS) 設定
-- ============================================================================
ALTER TABLE public.kcn_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.kcn_coach_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.kcn_services ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.kcn_service_slots ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.kcn_bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.kcn_chat_rooms ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.kcn_chat_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.kcn_demand_requests ENABLE ROW LEVEL SECURITY;

-- ユーザー本人・管理者参照ポリシー
CREATE POLICY "kcn_users_self_select" ON public.kcn_users
  FOR SELECT USING (auth.uid() = id);
CREATE POLICY "kcn_users_self_update" ON public.kcn_users
  FOR UPDATE USING (auth.uid() = id);

-- 承認済みコーチプロフィールは公開閲覧可、本人・管理者は全閲覧可
CREATE POLICY "kcn_coach_public_select" ON public.kcn_coach_profiles
  FOR SELECT USING (review_status = 'approved' OR auth.uid() = id);
CREATE POLICY "kcn_coach_self_upsert" ON public.kcn_coach_profiles
  FOR ALL USING (auth.uid() = id);

-- 公開レッスン・空き枠は承認済みコーチ分を公開閲覧可
CREATE POLICY "kcn_services_public_select" ON public.kcn_services
  FOR SELECT USING (
    is_published = TRUE AND EXISTS (
      SELECT 1 FROM public.kcn_coach_profiles cp
      WHERE cp.id = coach_id AND cp.review_status = 'approved'
    )
    OR auth.uid() = coach_id
  );
CREATE POLICY "kcn_services_coach_manage" ON public.kcn_services
  FOR ALL USING (auth.uid() = coach_id);

CREATE POLICY "kcn_slots_public_select" ON public.kcn_service_slots
  FOR SELECT USING (TRUE);
CREATE POLICY "kcn_slots_coach_manage" ON public.kcn_service_slots
  FOR ALL USING (auth.uid() = coach_id);

-- 予約は当事者（保護者・担当コーチ）のみ閲覧可
CREATE POLICY "kcn_bookings_party_select" ON public.kcn_bookings
  FOR SELECT USING (auth.uid() = parent_id OR auth.uid() = coach_id);

-- チャットルーム・メッセージは当事者のみ閲覧・送信可
-- ルーム削除は進行中・確認保留中の予約が存在しない場合のみ許可
CREATE POLICY "kcn_rooms_party_select" ON public.kcn_chat_rooms
  FOR SELECT USING (auth.uid() = parent_id OR auth.uid() = coach_id);
CREATE POLICY "kcn_rooms_safe_delete_update" ON public.kcn_chat_rooms
  FOR UPDATE USING (
    (auth.uid() = parent_id OR auth.uid() = coach_id)
    AND NOT EXISTS (
      SELECT 1 FROM public.kcn_bookings b
      WHERE b.parent_id = kcn_chat_rooms.parent_id
        AND b.coach_id = kcn_chat_rooms.coach_id
        AND b.status IN ('pending', 'confirmed', 'completion_reported')
    )
  );

CREATE POLICY "kcn_messages_party_select" ON public.kcn_chat_messages
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.kcn_chat_rooms r
      WHERE r.id = room_id AND (auth.uid() = r.parent_id OR auth.uid() = r.coach_id)
    )
  );
CREATE POLICY "kcn_messages_party_insert" ON public.kcn_chat_messages
  FOR INSERT WITH CHECK (
    auth.uid() = sender_id
    AND EXISTS (
      SELECT 1 FROM public.kcn_chat_rooms r
      WHERE r.id = room_id
        AND r.deleted_at IS NULL
        AND (auth.uid() = r.parent_id OR auth.uid() = r.coach_id)
    )
  );

-- 保護者リクエストは誰でも投稿可
CREATE POLICY "kcn_demand_insert_public" ON public.kcn_demand_requests
  FOR INSERT WITH CHECK (TRUE);

-- ============================================================================
-- Storage バケット作成（顔写真・コンプラ撮影画像）
-- ============================================================================
INSERT INTO storage.buckets (id, name, public)
VALUES
  ('kcn-coach-avatars', 'kcn-coach-avatars', TRUE),
  ('kcn-coach-compliance', 'kcn-coach-compliance', FALSE)
ON CONFLICT (id) DO NOTHING;
