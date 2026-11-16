// キッズコーチナビ データベース型定義 & マーケットプレイス共通型

export type UserRole = 'parent' | 'coach' | 'admin';

export interface User {
  id: string;
  role: UserRole;
  email: string;
  phone?: string;
  name: string;
  created_at: string;
}

export interface CoachProfile {
  id: string;
  display_name: string;
  title: string;
  avatar_url: string;
  bio: string;
  stripe_account_id?: string;
  stripe_payouts_enabled: boolean;
  avg_rating: number;
  total_completed_lessons: number;
  created_at: string;
}

export interface Service {
  id: string;
  coach_id: string;
  title: string;
  sport_category: string;
  target_areas: string[];
  price: number; // 最低5,000円以上（税込）
  duration_minutes: number; // デフォルト60分
  target_ages: string;
  description: string;
  requirements?: string;
  is_published: boolean;
  created_at: string;
  // リレーション用（任意）
  coach?: CoachProfile;
}

export interface ServiceSlot {
  id: string;
  service_id: string;
  coach_id: string;
  start_time: string; // ISO 8601
  end_time: string; // ISO 8601
  is_booked: boolean;
  service?: Service;
}

export type BookingStatus =
  | 'pending'
  | 'confirmed'
  | 'completion_reported'
  | 'completed'
  | 'cancelled';

/** レッスン終了時刻を過ぎているかを判定し、実施前のフライング完了報告を防ぐ */
export function canReportLessonCompletion(lessonEndTime?: string): boolean {
  if (!lessonEndTime) return false;
  const endMs = new Date(lessonEndTime).getTime();
  if (Number.isNaN(endMs)) return false;
  return Date.now() >= endMs;
}

export interface Booking {
  id: string;
  service_id: string;
  slot_id: string;
  parent_id: string;
  coach_id: string;
  status: BookingStatus;
  total_amount: number;
  platform_fee: number; // 25% (株式会社Wellne)
  coach_payout: number; // 75% (コーチ受取)
  stripe_payment_intent_id?: string;
  stripe_transfer_id?: string;
  student_name?: string;
  student_age?: string;
  notes?: string;
  created_at: string;
  service?: Service;
  slot?: ServiceSlot;
  coach?: CoachProfile;
  parent?: User;
}

export interface ChatMessage {
  id: string;
  booking_id: string;
  sender_id: string;
  sender_name?: string;
  sender_role?: 'parent' | 'coach';
  message: string;
  is_read: boolean;
  created_at: string;
}

export interface Review {
  id: string;
  booking_id: string;
  coach_id: string;
  parent_id: string;
  rating: number;
  comment?: string;
  created_at: string;
}

// -------------------------------------------------------------
// 中抜き防止（プラットフォーム外直接取引防止）バリデーション
// -------------------------------------------------------------
export interface DisintermediationCheckResult {
  hasViolation: boolean;
  reason?: string;
  detectedWord?: string;
  maskedMessage: string;
}

export function validateChatMessage(text: string): DisintermediationCheckResult {
  let masked = text;
  let hasViolation = false;
  let reason = '';
  let detectedWord = '';

  // 1. 電話番号（日本の一般的なフォーマット、数字の羅列10〜11桁）
  const phoneRegex = /(0\d{1,4}[-\s]?\d{1,4}[-\s]?\d{4})|(\b0[789]0\d{8}\b)/g;
  if (phoneRegex.test(text)) {
    hasViolation = true;
    reason = '電話番号と思われる文字列が検出されました。安全のため個人情報の直接交換は禁止されています。';
    masked = masked.replace(phoneRegex, '【電話番号非表示】');
    detectedWord = '電話番号';
  }

  // 2. メールアドレス
  const emailRegex = /([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})/g;
  if (emailRegex.test(text)) {
    hasViolation = true;
    reason = 'メールアドレスが検出されました。メッセージはプラットフォーム内の専用チャットをご利用ください。';
    masked = masked.replace(emailRegex, '【メールアドレス非表示】');
    detectedWord = 'メールアドレス';
  }

  // 3. LINE ID / SNSアカウント
  const lineRegex = /(line\s*id|ライン\s*id|ID\s*[:：]\s*[a-zA-Z0-9._-]{4,}|LINE教えて|ライン交換)/gi;
  if (lineRegex.test(text)) {
    hasViolation = true;
    reason = '外部SNSやLINEへの誘導が検出されました。トラブル防止・保険適用の対象外となるため禁止されています。';
    masked = masked.replace(lineRegex, '【外部連絡先非表示】');
    detectedWord = 'LINE・SNS誘導';
  }

  // 4. 直接取引・直接金銭授受のNGワード
  const ngWords = [
    '直接取引', '直接振込', '手渡し', '個人間', '現金で', '直接会って',
    '手数料引いて', '安くします', '口座番号', 'paypay', 'ペイペイ', '銀行振込'
  ];
  for (const word of ngWords) {
    if (text.toLowerCase().includes(word)) {
      hasViolation = true;
      reason = `直接金銭授受や中抜きを示唆する語句（「${word}」）が検出されました。全レッスンはStripe決済および保険付帯の対象となります。`;
      detectedWord = word;
      masked = masked.replaceAll(word, '【規約禁止ワード】');
      break;
    }
  }

  return {
    hasViolation,
    reason,
    detectedWord,
    maskedMessage: masked,
  };
}

// チャット利用可否判定（予約後も利用可能、コーチまたは生徒が削除するまで継続）
export function isChatActive(
  _lessonEndTime: string,
  deletedBy?: 'parent' | 'coach' | null
): { isActive: boolean; deletedBy: 'parent' | 'coach' | null } {
  if (deletedBy) {
    return { isActive: false, deletedBy };
  }
  return { isActive: true, deletedBy: null };
}
