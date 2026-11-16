-- キッズコーチナビ（Kids Coach Navi）完全自走型マーケットプレイス スキーマ定義
-- 運営主体: 株式会社Wellne（ウェルネ）

-- 1. users（保護者・コーチ共通ユーザー）
CREATE TABLE IF NOT EXISTS public.users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  role TEXT NOT NULL CHECK (role IN ('parent', 'coach', 'admin')),
  email TEXT UNIQUE NOT NULL,
  phone TEXT,
  name TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. coach_profiles（コーチ情報・出品者管理）
CREATE TABLE IF NOT EXISTS public.coach_profiles (
  id UUID PRIMARY KEY REFERENCES public.users(id) ON DELETE CASCADE,
  display_name TEXT NOT NULL,
  title TEXT NOT NULL,
  avatar_url TEXT,
  bio TEXT,
  stripe_account_id TEXT,
  stripe_payouts_enabled BOOLEAN DEFAULT FALSE,
  avg_rating NUMERIC(2,1) DEFAULT 5.0,
  total_completed_lessons INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. services（コーチが出品するレッスン商品・ココナラ型）
CREATE TABLE IF NOT EXISTS public.services (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  coach_id UUID NOT NULL REFERENCES public.coach_profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  sport_category TEXT NOT NULL,
  target_areas TEXT[] NOT NULL DEFAULT '{}',
  price INTEGER NOT NULL CHECK (price >= 5000), -- 最低5,000円（税込）
  duration_minutes INTEGER NOT NULL DEFAULT 60,
  target_ages TEXT NOT NULL,
  description TEXT NOT NULL,
  requirements TEXT,
  is_published BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. service_slots（空き枠カレンダー）
CREATE TABLE IF NOT EXISTS public.service_slots (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  service_id UUID NOT NULL REFERENCES public.services(id) ON DELETE CASCADE,
  coach_id UUID NOT NULL REFERENCES public.coach_profiles(id) ON DELETE CASCADE,
  start_time TIMESTAMP WITH TIME ZONE NOT NULL,
  end_time TIMESTAMP WITH TIME ZONE NOT NULL,
  is_booked BOOLEAN DEFAULT FALSE
);

-- 5. bookings（予約・エスクロー決済）
CREATE TABLE IF NOT EXISTS public.bookings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  service_id UUID NOT NULL REFERENCES public.services(id) ON DELETE RESTRICT,
  slot_id UUID NOT NULL REFERENCES public.service_slots(id) ON DELETE RESTRICT,
  parent_id UUID NOT NULL REFERENCES public.users(id) ON DELETE RESTRICT,
  coach_id UUID NOT NULL REFERENCES public.coach_profiles(id) ON DELETE RESTRICT,
  status TEXT NOT NULL DEFAULT 'confirmed' CHECK (status IN ('confirmed', 'completed', 'cancelled')),
  total_amount INTEGER NOT NULL,
  platform_fee INTEGER NOT NULL, -- 25% (株式会社Wellne)
  coach_payout INTEGER NOT NULL,  -- 75% (コーチ受取)
  stripe_payment_intent_id TEXT,
  stripe_transfer_id TEXT,
  student_name TEXT,
  student_age TEXT,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 6. chat_messages（1対1期限付きチャット）
CREATE TABLE IF NOT EXISTS public.chat_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_id UUID NOT NULL REFERENCES public.bookings(id) ON DELETE CASCADE,
  sender_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  message TEXT NOT NULL,
  is_read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 7. reviews（受講後評価）
CREATE TABLE IF NOT EXISTS public.reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_id UUID NOT NULL REFERENCES public.bookings(id) ON DELETE CASCADE,
  coach_id UUID NOT NULL REFERENCES public.coach_profiles(id) ON DELETE CASCADE,
  parent_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  rating INTEGER NOT NULL CHECK (rating BETWEEN 1 AND 5),
  comment TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- インデックス作成
CREATE INDEX IF NOT EXISTS idx_services_coach_id ON public.services(coach_id);
CREATE INDEX IF NOT EXISTS idx_services_sport_category ON public.services(sport_category);
CREATE INDEX IF NOT EXISTS idx_service_slots_service_id ON public.service_slots(service_id);
CREATE INDEX IF NOT EXISTS idx_service_slots_start_time ON public.service_slots(start_time);
CREATE INDEX IF NOT EXISTS idx_bookings_parent_id ON public.bookings(parent_id);
CREATE INDEX IF NOT EXISTS idx_bookings_coach_id ON public.bookings(coach_id);
CREATE INDEX IF NOT EXISTS idx_chat_messages_booking_id ON public.chat_messages(booking_id);
