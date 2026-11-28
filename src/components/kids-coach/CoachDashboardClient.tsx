'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import KidsCoachNavbar from '@/components/kids-coach/Navbar';
import KidsCoachFooter from '@/components/kids-coach/Footer';
import {
  loadDemandRequests,
  aggregateDemandTrends,
  INITIAL_DEMAND_REQUESTS,
} from '@/lib/demand-requests';
import {
  CoachProfile,
  Service,
  ServiceSlot,
  Booking,
  canReportLessonCompletion,
} from '@/types/kids-coach-db';
import {
  Plus,
  Trash2,
  Clock,
  Check,
  ExternalLink,
  Shield,
  Star,
  X,
  Wallet,
  CalendarCheck2,
  TrendingUp,
  Lock,
  Sparkles,
  ChevronDown,
  Pencil,
} from 'lucide-react';

function getTomorrowJstYmd(): string {
  const tomorrow = new Date(Date.now() + 24 * 60 * 60 * 1000);
  return new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Asia/Tokyo',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(tomorrow);
}

const EMPTY_COACH_PROFILE: CoachProfile = {
  id: '',
  display_name: '認定コーチ',
  title: 'キッズコーチナビ 認定コーチ',
  avatar_url: '',
  bio: '',
  stripe_account_id: '',
  stripe_payouts_enabled: false,
  avg_rating: 0,
  total_completed_lessons: 0,
  created_at: '',
};

import type { CoachDashboardData } from '@/lib/kcn-coach-dashboard';

interface CoachDashboardClientProps {
  initialData?: CoachDashboardData | null;
  initialAuthRequired?: boolean;
  initialError?: string | null;
}

export default function CoachDashboardClient({
  initialData = null,
  initialAuthRequired = false,
  initialError = null,
}: CoachDashboardClientProps) {
  const hasInitial = Boolean(initialData) || initialAuthRequired || Boolean(initialError);
  const [profile, setProfile] = useState<CoachProfile>(
    initialData?.profile || EMPTY_COACH_PROFILE
  );
  const [isLoadingDashboard, setIsLoadingDashboard] = useState(!hasInitial);
  const [authRequired, setAuthRequired] = useState(initialAuthRequired);
  const [loadError, setLoadError] = useState<string | null>(initialError);
  const [showDemoTools, setShowDemoTools] = useState(
    process.env.NODE_ENV !== 'production'
  );

  const [services, setServices] = useState<Service[]>(initialData?.services || []);
  const [slots, setSlots] = useState<ServiceSlot[]>(initialData?.slots || []);
  const [bookings, setBookings] = useState<Booking[]>(initialData?.bookings || []);

  // Stripe Connect連携状態
  const [isConnectingStripe, setIsConnectingStripe] = useState(false);

  // レッスン出品/編集モーダル開閉
  const [showServiceModal, setShowServiceModal] = useState(false);
  const [editingServiceId, setEditingServiceId] = useState<string | null>(null);
  const [newTitle, setNewTitle] = useState('');
  const [newCategory, setNewCategory] = useState('かけっこ・走り方');
  const [newAreas, setNewAreas] = useState('世田谷区、目黒区、駒沢公園周辺');
  const [newPrice, setNewPrice] = useState(6500);
  const [newDesc, setNewDesc] = useState('');
  const [newReq, setNewReq] = useState('');

  // 空き枠追加用状態
  const [newSlotDate, setNewSlotDate] = useState(getTomorrowJstYmd);
  const [newSlotTime, setNewSlotTime] = useState('10:00');
  const [selectedServiceForSlot, setSelectedServiceForSlot] = useState(
    initialData?.services?.[0]?.id || ''
  );

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      if (params.get('demo') === '1') setShowDemoTools(true);
    }

    if (hasInitial) return;

    const fetchDashboard = async () => {
      setIsLoadingDashboard(true);
      setLoadError(null);
      try {
        const res = await fetch('/api/kcn/coach/dashboard', { cache: 'no-store' });
        const data = await res.json();
        if (res.status === 401) {
          setAuthRequired(true);
          setIsLoadingDashboard(false);
          return;
        }
        if (!res.ok) {
          setLoadError(data?.error || 'ダッシュボードの読み込みに失敗しました。');
          setIsLoadingDashboard(false);
          return;
        }
        if (data.profile) setProfile(data.profile);
        if (Array.isArray(data.services)) {
          setServices(data.services);
          if (data.services[0]?.id) {
            setSelectedServiceForSlot(data.services[0].id);
          }
        }
        if (Array.isArray(data.slots)) setSlots(data.slots);
        if (Array.isArray(data.bookings)) setBookings(data.bookings);
      } catch {
        setLoadError('通信エラーが発生しました。再読み込みしてください。');
      } finally {
        setIsLoadingDashboard(false);
      }
    };

    fetchDashboard();
  }, [hasInitial]);

  // 保護者リクエスト需要ランキング状態
  const [demandTrends, setDemandTrends] = useState(() =>
    aggregateDemandTrends(INITIAL_DEMAND_REQUESTS)
  );

  useEffect(() => {
    setDemandTrends(aggregateDemandTrends(loadDemandRequests()));
  }, []);

  /** 需要ランキングから新規出品モーダルをプリセットして開く */
  const handleCreateFromDemand = (sportName: string, areaName: string) => {
    setEditingServiceId(null);
    setNewTitle(`【${areaName}】${sportName} マンツーマン指導 60分`);
    setNewCategory(sportName);
    setNewAreas(areaName);
    setShowServiceModal(true);
  };

  // トースト/通知メッセージ
  const [notification, setNotification] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setNotification(msg);
    setTimeout(() => setNotification(null), 4000);
  };

  // 1. Stripe Connect Hosted Onboarding 実行（実API連携）
  const handleStripeConnect = async () => {
    if (!profile.id) return;
    setIsConnectingStripe(true);
    try {
      const res = await fetch('/api/kcn/coach/connect', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          coachId: profile.id,
          displayName: profile.display_name,
        }),
      });
      const data = await res.json();
      if (!res.ok || !data?.onboardingUrl) {
        showToast(
          data?.error ||
            'Stripe Connect 連携URLの発行に失敗しました（Stripe ダッシュボードの Connect 設定をご確認ください）。'
        );
        return;
      }
      window.open(data.onboardingUrl, '_blank', 'noopener,noreferrer');
      showToast('Stripe Connect の本人確認・口座連携画面を開きました。');
    } catch {
      showToast('通信エラーが発生しました。時間をおいて再度お試しください。');
    } finally {
      setIsConnectingStripe(false);
    }
  };

  // 2. レッスン商品新規出品・編集（Supabase保存）
  const handleOpenCreateModal = () => {
    setEditingServiceId(null);
    setNewTitle('');
    setNewCategory('かけっこ・走り方');
    setNewAreas('世田谷区、目黒区、駒沢公園周辺');
    setNewPrice(6500);
    setNewDesc('');
    setNewReq('');
    setShowServiceModal(true);
  };

  const handleOpenEditModal = (srv: Service) => {
    setEditingServiceId(srv.id);
    setNewTitle(srv.title);
    setNewCategory(srv.sport_category);
    setNewAreas((srv.target_areas || []).join('、'));
    setNewPrice(srv.price);
    setNewDesc(srv.description || '');
    setNewReq(srv.requirements || '');
    setShowServiceModal(true);
  };

  const handleCreateService = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPrice < 5000) {
      alert('最低料金は5,000円（税込）以上で設定してください。');
      return;
    }

    try {
      const isEdit = Boolean(editingServiceId);
      const res = await fetch('/api/kcn/coach/dashboard', {
        method: isEdit ? 'PATCH' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...(isEdit ? { serviceId: editingServiceId } : { action: 'create_service' }),
          coachId: profile.id,
          title: newTitle,
          sportCategory: newCategory,
          targetAreas: newAreas.split(/[,、]/).map((s) => s.trim()).filter(Boolean),
          price: newPrice,
          durationMinutes: 60,
          description: newDesc,
          requirements: newReq,
        }),
      });
      const data = await res.json();
      if (!res.ok || !data?.service) {
        showToast(data?.error || 'レッスンの保存に失敗しました。');
        return;
      }

      if (isEdit) {
        setServices((prev) =>
          prev.map((s) => (s.id === data.service.id ? data.service : s))
        );
        showToast('レッスン商品を更新しました。');
      } else {
        setServices([data.service, ...services]);
        setSelectedServiceForSlot(data.service.id);
        showToast('レッスン商品をSupabaseへ保存し、公開しました。');
      }

      setShowServiceModal(false);
      setEditingServiceId(null);
      setNewTitle('');
      setNewDesc('');
      setNewReq('');
    } catch {
      showToast('通信エラーが発生しました。');
    }
  };

  const handleDeleteService = async (serviceId: string) => {
    if (!window.confirm('このレッスン商品を削除しますか？（紐づく未予約の空き枠も削除されます）')) {
      return;
    }
    try {
      const res = await fetch(
        `/api/kcn/coach/dashboard?serviceId=${encodeURIComponent(serviceId)}&coachId=${encodeURIComponent(profile.id)}`,
        { method: 'DELETE' }
      );
      const data = await res.json();
      if (!res.ok || !data?.ok) {
        showToast(data?.error || 'レッスン商品の削除に失敗しました。');
        return;
      }
      setServices((prev) => prev.filter((s) => s.id !== serviceId));
      setSlots((prev) => prev.filter((s) => s.service_id !== serviceId));
      showToast('レッスン商品を削除しました。');
    } catch {
      showToast('通信エラーが発生しました。');
    }
  };

  // 3. 空きコマ追加（Supabase保存）
  const handleAddSlot = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/kcn/coach/dashboard', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'create_slot',
          coachId: profile.id,
          serviceId: selectedServiceForSlot || services[0]?.id || '',
          date: newSlotDate,
          time: newSlotTime,
        }),
      });
      const data = await res.json();
      if (!res.ok || !data?.slot) {
        showToast(data?.error || '空き枠の追加に失敗しました。');
        return;
      }

      setSlots([...slots, data.slot]);
      if (data.slot.service && !services.some((s) => s.id === data.slot.service.id)) {
        setServices((prev) => [data.slot.service, ...prev]);
        setSelectedServiceForSlot(data.slot.service.id);
      }
      showToast(`${newSlotDate} ${newSlotTime}〜 の空き枠をSupabaseに公開しました。`);
    } catch {
      showToast('通信エラーが発生しました。');
    }
  };

  // 4. 空きコマ削除（Supabase削除）
  const handleDeleteSlot = async (slotId: string) => {
    try {
      const res = await fetch(
        `/api/kcn/coach/dashboard?slotId=${encodeURIComponent(slotId)}&coachId=${encodeURIComponent(profile.id)}`,
        { method: 'DELETE' }
      );
      const data = await res.json();
      if (!res.ok || !data?.ok) {
        showToast(data?.error || '空き枠の削除に失敗しました。');
        return;
      }
      setSlots(slots.filter((s) => s.id !== slotId));
      showToast('空きコマを削除しました。');
    } catch {
      showToast('通信エラーが発生しました。');
    }
  };

  // 5. 指導完了報告ボタン（終了時刻経過チェック＋保護者確認/48h保留ステップへ移行）
  const handleCompleteLesson = (bookingId: string) => {
    const target = bookings.find((b) => b.id === bookingId);
    if (!target || !canReportLessonCompletion(target.slot?.end_time)) {
      showToast('レッスン終了時刻を過ぎるまで完了報告はできません（虚偽報告防止）。');
      return;
    }

    setBookings((prev) =>
      prev.map((b) =>
        b.id === bookingId ? { ...b, status: 'completion_reported' } : b
      )
    );
    showToast(
      `完了報告を受け付けました（￥${target.coach_payout.toLocaleString()}）。保護者確認または48時間経過後に報酬が確定し、隔週振込の対象となります。`
    );
  };

  // 6. 検証用：保護者による受講完了確認（または48時間異議なし経過）をシミュレートして報酬確定
  const handleApproveByParent = (bookingId: string) => {
    const target = bookings.find((b) => b.id === bookingId);
    setBookings((prev) =>
      prev.map((b) => (b.id === bookingId ? { ...b, status: 'completed' } : b))
    );
    const payoutText = target ? `￥${target.coach_payout.toLocaleString()}` : '75%';
    showToast(
      `保護者の確認が完了し、報酬（${payoutText}）が確定しました。次回の隔週（2週に1回）Stripe振込日に自動送金されます。`
    );
  };

  // ログイン中コーチ（田中 健太 コーチ）の受注予約と報酬合計を算出
  const coachBookings = bookings.filter((b) => b.coach_id === profile.id);
  const completedBookings = coachBookings.filter((b) => b.status === 'completed');
  const reportedBookings = coachBookings.filter(
    (b) => b.status === 'completion_reported'
  );
  const confirmedBookings = coachBookings.filter((b) => b.status === 'confirmed');
  const pendingBookings = coachBookings.filter((b) => b.status === 'pending');

  const completedPayout = completedBookings.reduce((sum, b) => sum + b.coach_payout, 0);
  const reportedPayout = reportedBookings.reduce((sum, b) => sum + b.coach_payout, 0);
  const confirmedPayout = confirmedBookings.reduce((sum, b) => sum + b.coach_payout, 0);
  const pendingPayout = pendingBookings.reduce((sum, b) => sum + b.coach_payout, 0);
  const escrowPayout = reportedPayout + confirmedPayout;
  const totalExpectedPayout = completedPayout + escrowPayout;
  const totalGrossAmount = [
    ...completedBookings,
    ...reportedBookings,
    ...confirmedBookings,
  ].reduce((sum, b) => sum + b.total_amount, 0);

  return (
    <div className="min-h-screen bg-[#FDFBF7] text-[#2C2B29] flex flex-col font-sans">
      <KidsCoachNavbar />

      {/* トースト通知 */}
      {notification && (
        <div className="fixed top-20 right-4 z-50 bg-[#2C2B29] text-white px-5 py-3.5 rounded-2xl shadow-xl flex items-center gap-2 border border-[#F7D668]">
          <Check className="w-4 h-4 text-[#F7D668] shrink-0" strokeWidth={2} />
          <span className="text-xs sm:text-sm font-bold">{notification}</span>
        </div>
      )}

      <main className="flex-1 py-5 sm:py-8 md:py-12">
        <div className="max-w-5xl mx-auto px-3.5 sm:px-6 space-y-5 sm:space-y-6">
          {/* ページ最上部タイトル */}
          <div className="px-1 flex flex-wrap items-center justify-between gap-2">
            <div>
              <span className="font-en text-[10px] font-extrabold tracking-widest uppercase text-[#3E8E84] block mb-0.5">
                COACH DASHBOARD
              </span>
              <h1 className="font-heading text-xl sm:text-2xl font-bold text-[#2C2B29] tracking-tight">
                コーチダッシュボード
              </h1>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              {profile.id && (
                <Link
                  href={`/coaches/${profile.id}`}
                  target="_blank"
                  className="h-9 px-3.5 rounded-full bg-[#3E8E84] hover:bg-[#32756d] text-white text-xs font-bold inline-flex items-center gap-1.5 transition-colors whitespace-nowrap"
                >
                  <ExternalLink className="w-3.5 h-3.5 shrink-0" strokeWidth={1.75} />
                  <span>公開プロフィール・空き枠を見る</span>
                </Link>
              )}
              <Link
                href="/coach/terms"
                className="h-9 px-3.5 rounded-full bg-white border border-[#EADBCC] hover:border-[#3E8E84] text-xs font-bold text-[#5E5B54] hover:text-[#3E8E84] inline-flex items-center gap-1.5 transition-colors whitespace-nowrap"
              >
                <Shield className="w-3.5 h-3.5 shrink-0" strokeWidth={1.75} />
                <span>コーチ利用規約</span>
              </Link>
              <Link
                href="/coach/onboarding"
                className="h-9 px-3.5 rounded-full bg-white border border-[#EADBCC] hover:border-[#3E8E84] text-xs font-bold text-[#2C2B29] hover:text-[#3E8E84] inline-flex items-center gap-1.5 transition-colors whitespace-nowrap"
              >
                <ExternalLink className="w-3.5 h-3.5 shrink-0" strokeWidth={1.75} />
                <span>新規コーチ登録・審査画面を見る</span>
              </Link>
            </div>
          </div>

          {isLoadingDashboard ? (
            <div className="bg-white rounded-3xl border border-[#EADBCC] p-8 text-center text-xs font-bold text-[#5E5B54]">
              ダッシュボード情報を読み込み中です...
            </div>
          ) : authRequired ? (
            <div className="bg-white rounded-3xl border border-[#EADBCC] p-8 text-center space-y-3">
              <p className="font-heading text-base font-bold text-[#2C2B29]">
                コーチダッシュボードの利用にはログインが必要です
              </p>
              <p className="text-xs text-[#5E5B54]">
                審査承認されたコーチアカウント（または管理者アカウント）でログインしてください。
              </p>
              <Link
                href="/login?redirectTo=/coach/dashboard"
                className="inline-flex h-10 px-5 rounded-full bg-[#E3644F] hover:bg-[#d05540] text-white text-xs font-bold items-center gap-1.5"
              >
                <span>ログイン画面へ進む</span>
              </Link>
            </div>
          ) : loadError ? (
            <div className="bg-rose-50 rounded-3xl border border-rose-200 p-6 text-center text-xs font-bold text-rose-700">
              {loadError}
            </div>
          ) : (
            <>

          {/* コーチプロフィール見出しボックス */}
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 bg-white p-4 sm:p-6 rounded-3xl border border-[#EADBCC] shadow-xs">
            <div className="flex items-start sm:items-center gap-3 sm:gap-4 min-w-0">
              <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-2xl bg-[#FCE7A2] border border-[#2C2B29]/25 flex items-center justify-center font-heading font-bold text-lg sm:text-2xl text-[#2C2B29] shrink-0">
                {profile.display_name.charAt(0)}
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-1.5 sm:gap-2 mb-1">
                  <span className="text-[10px] sm:text-[11px] font-bold text-[#3E8E84] bg-[#3E8E84]/10 px-2.5 py-0.5 rounded-full whitespace-nowrap">
                    認定コーチ出品・管理
                  </span>
                  {profile.total_completed_lessons > 0 && profile.avg_rating > 0 && (
                    <span className="inline-flex items-center gap-1 font-en text-[11px] sm:text-xs font-extrabold text-[#2C2B29] bg-[#FCE7A2] px-2.5 py-0.5 rounded-full whitespace-nowrap">
                      <Star className="w-3 h-3 fill-[#E3644F] text-[#E3644F] shrink-0" strokeWidth={1.75} />
                      <span>{profile.avg_rating}</span>
                    </span>
                  )}
                </div>
                <h2 className="font-heading text-base sm:text-xl font-bold text-[#2C2B29] leading-snug">
                  {profile.display_name} コーチ
                </h2>
                <p className="text-xs text-[#5E5B54] font-bold mt-0.5">{profile.title}</p>
              </div>
            </div>

            {/* 手数料率バッジ（スマホは縦積み、PCは右寄せボックス） */}
            <div className="bg-[#FDFBF7] px-3.5 py-2.5 sm:p-3.5 rounded-2xl border border-[#EADBCC] w-full lg:w-auto flex flex-col sm:flex-row sm:items-center justify-between gap-1 lg:block lg:text-right text-xs shrink-0">
              <span className="text-[10px] text-[#5E5B54] font-bold block whitespace-nowrap">手数料配分ルール</span>
              <div className="font-bold text-[#2C2B29] sm:whitespace-nowrap">
                コーチ受取 <span className="font-en text-[#E3644F] font-extrabold text-sm sm:text-base">75%</span> / SWIM PARTNERS 25%
              </div>
            </div>
          </div>

          {/* 合計報酬サマリーカード */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
            {/* 合計報酬見込み */}
            <div className="bg-[#2C2B29] text-white p-5 rounded-3xl border border-[#2C2B29] shadow-xs flex flex-col justify-between gap-2">
              <div className="flex items-center justify-between gap-2">
                <span className="text-[11px] font-bold text-[#FCE7A2] inline-flex items-center gap-1.5">
                  <Wallet className="w-4 h-4 shrink-0" strokeWidth={1.75} />
                  <span>合計報酬（確定＋保留＋予定）</span>
                </span>
                <span className="text-[10px] font-bold bg-white/10 text-white/90 px-2 py-0.5 rounded-full whitespace-nowrap">
                  {completedBookings.length + reportedBookings.length + confirmedBookings.length}件分
                </span>
              </div>
              <div>
                <div className="font-en text-2xl sm:text-3xl font-extrabold text-[#FCE7A2] tracking-tight">
                  ￥{totalExpectedPayout.toLocaleString()}
                </div>
                <p className="text-[11px] text-white/75 mt-1">
                  総受講料 ￥{totalGrossAmount.toLocaleString()} の75%（2週に1回自動振込）
                </p>
              </div>
            </div>

            {/* 報酬確定済み（隔週振込対象） */}
            <div className="bg-white p-5 rounded-3xl border border-[#EADBCC] shadow-xs flex flex-col justify-between gap-2">
              <div className="flex items-center justify-between gap-2">
                <span className="text-[11px] font-bold text-[#3E8E84] inline-flex items-center gap-1.5">
                  <TrendingUp className="w-4 h-4 shrink-0" strokeWidth={1.75} />
                  <span>報酬確定（隔週振込対象）</span>
                </span>
                <span className="text-[10px] font-bold bg-[#D2E7DF]/70 text-[#3E8E84] px-2 py-0.5 rounded-full whitespace-nowrap">
                  確定 {completedBookings.length}件
                </span>
              </div>
              <div>
                <div className="font-en text-2xl sm:text-3xl font-extrabold text-[#3E8E84] tracking-tight">
                  ￥{completedPayout.toLocaleString()}
                </div>
                <p className="text-[11px] text-[#5E5B54] mt-1">
                  保護者確認済み・次回隔週振込日に自動送金
                </p>
              </div>
            </div>

            {/* 確認保留・実施待ち（エスクロー保護） */}
            <div className="bg-white p-5 rounded-3xl border border-[#EADBCC] shadow-xs flex flex-col justify-between gap-2">
              <div className="flex items-center justify-between gap-2">
                <span className="text-[11px] font-bold text-[#E3644F] inline-flex items-center gap-1.5">
                  <CalendarCheck2 className="w-4 h-4 shrink-0" strokeWidth={1.75} />
                  <span>確認保留・実施待ち</span>
                </span>
                <span className="text-[10px] font-bold bg-[#FCE7A2] text-[#2C2B29] px-2 py-0.5 rounded-full whitespace-nowrap">
                  保留 {reportedBookings.length} / 予定 {confirmedBookings.length}
                </span>
              </div>
              <div>
                <div className="font-en text-2xl sm:text-3xl font-extrabold text-[#2C2B29] tracking-tight">
                  ￥{escrowPayout.toLocaleString()}
                </div>
                <p className="text-[11px] text-[#5E5B54] mt-1">
                  {pendingBookings.length > 0
                    ? `※未決済・相談中 ${pendingBookings.length}件（￥${pendingPayout.toLocaleString()}）は別途`
                    : '終了後の完了報告＋保護者確認（48h）で確定'}
                </p>
              </div>
            </div>
          </div>

          {/* 01. Stripe Connect（Hosted Onboarding）連携カード */}
          <div className="bg-[#3E8E84] text-white p-5 sm:p-7 rounded-3xl shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4 sm:gap-6">
            <div className="space-y-1.5 max-w-xl">
              <span className="font-en text-[10px] font-extrabold tracking-widest uppercase text-[#FCE7A2] block">
                01 / STRIPE CONNECT PAYOUTS
              </span>
              <h2 className="font-heading text-base sm:text-lg font-bold text-white">
                本人確認・銀行口座の自動振込連携
              </h2>
              <p className="text-xs text-white/90 leading-relaxed">
                自社サーバーに身分証明書や銀行口座の番号を保管せず、Stripeのセキュアな画面で本人確認・振込口座登録を完結します。
              </p>
            </div>

            <div className="w-full md:w-auto">
              {profile.stripe_payouts_enabled ? (
                <div className="inline-flex items-center gap-1.5 bg-white/15 text-white px-4 py-2.5 rounded-full border border-white/30 font-bold text-[11px] sm:text-xs max-w-full">
                  <Shield className="w-4 h-4 text-[#FCE7A2] shrink-0" strokeWidth={1.75} />
                  <span>Stripe Connect 連携済み（自動振込有効）</span>
                </div>
              ) : (
                <button
                  onClick={handleStripeConnect}
                  disabled={isConnectingStripe}
                  className="w-full md:w-auto h-11 px-5 rounded-full bg-white text-[#2C2B29] hover:bg-[#FCE7A2] font-bold text-xs flex items-center justify-center gap-2 transition-colors cursor-pointer disabled:opacity-50"
                >
                  <ExternalLink className="w-4 h-4 shrink-0" strokeWidth={1.75} />
                  <span>{isConnectingStripe ? 'Stripe連携中...' : 'Stripe Connectで本人確認＆口座連携'}</span>
                </button>
              )}
            </div>
          </div>

          {/* 02. 受注レッスン一覧＆「指導完了」ボタン */}
          <div className="bg-white p-4 sm:p-6 md:p-8 rounded-3xl border border-[#EADBCC] shadow-xs space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3">
              <div>
                <span className="font-en text-[10px] font-extrabold tracking-widest uppercase text-[#E3644F] block mb-0.5">
                  02 / ACTIVE BOOKINGS
                </span>
                <h2 className="font-heading text-base sm:text-lg font-bold text-[#2C2B29]">
                  受注レッスン・予約一覧
                </h2>
                <p className="text-xs text-[#5E5B54] mt-0.5">
                  レッスン終了時刻経過後に「指導完了を報告」を押すと、保護者確認（または48時間経過）後に報酬確定し、2週に1回Stripeから自動振込されます。
                </p>
              </div>

              <div className="bg-[#FDFBF7] px-3.5 py-2 rounded-2xl border border-[#EADBCC] text-xs font-bold flex items-center gap-2 self-start sm:self-auto whitespace-nowrap">
                <span className="text-[#5E5B54]">受取合計見込み:</span>
                <span className="font-en text-base font-extrabold text-[#3E8E84]">
                  ￥{totalExpectedPayout.toLocaleString()}
                </span>
              </div>
            </div>

            {coachBookings.length > 0 ? (
              <div className="space-y-3">
                {coachBookings.map((booking) => {
                  const isAfterLessonEnd = canReportLessonCompletion(
                    booking.slot?.end_time
                  );

                  return (
                  <div
                    key={booking.id}
                    className="p-4 sm:p-5 rounded-2xl border border-[#EADBCC] bg-[#FDFBF7] flex flex-col lg:flex-row lg:items-center justify-between gap-4 overflow-hidden"
                  >
                    <div className="space-y-1 min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span
                          className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full ${
                            booking.status === 'completed'
                              ? 'bg-[#3E8E84]/15 text-[#3E8E84]'
                              : booking.status === 'completion_reported'
                                ? 'bg-[#E3644F]/15 text-[#E3644F]'
                                : booking.status === 'confirmed'
                                  ? 'bg-[#FCE7A2] text-[#2C2B29]'
                                  : 'bg-[#EADBCC]/60 text-[#5E5B54]'
                          }`}
                        >
                          {booking.status === 'completed'
                            ? '報酬確定・隔週振込対象'
                            : booking.status === 'completion_reported'
                              ? '完了報告済（保護者確認・48h保留中）'
                              : booking.status === 'confirmed'
                                ? '予約確定・実施待ち'
                                : '日程調整中・未決済'}
                        </span>
                        <span className="text-xs text-[#5E5B54] font-en font-bold">
                          ID: {booking.id}
                        </span>
                      </div>
                      <h3 className="font-heading text-sm sm:text-base font-bold text-[#2C2B29] leading-snug">
                        {booking.service?.title}
                      </h3>
                      <div className="text-xs text-[#5E5B54] space-y-0.5">
                        <div>受講生徒: <strong className="text-[#2C2B29]">{booking.student_name}</strong> 様（会員番号0035 / {booking.student_age}）</div>
                        <div>日時: <strong className="text-[#2C2B29] font-en">{booking.slot?.start_time.slice(0, 10)} 15:00 - 16:00</strong></div>
                      </div>
                    </div>

                    <div className="flex flex-col sm:flex-row sm:items-center justify-between lg:justify-end gap-3 w-full lg:w-auto shrink-0 pt-3 lg:pt-0 border-t lg:border-t-0 border-[#EADBCC]/70">
                      <div className="text-left sm:text-left lg:text-right flex sm:block items-baseline justify-between gap-2">
                        <span className="text-[10px] text-[#5E5B54] block font-bold">受講料 / コーチ受取 (75%)</span>
                        <div className="flex sm:block items-baseline gap-1.5">
                          <span className="font-en text-xs text-[#5E5B54]">￥{booking.total_amount.toLocaleString()}</span>
                          <span className="font-en text-sm font-extrabold text-[#3E8E84] sm:block">
                            → ￥{booking.coach_payout.toLocaleString()}
                          </span>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:flex sm:flex-row items-stretch sm:items-center gap-2 w-full sm:w-auto">
                        <Link
                          href={`/chat?room=${booking.id}&role=coach`}
                          className="w-full sm:w-auto h-10 px-4 rounded-full bg-white border border-[#EADBCC] hover:border-[#2C2B29] font-bold text-xs text-[#2C2B29] flex items-center justify-center transition-colors whitespace-nowrap"
                        >
                          <span>チャットを開く</span>
                        </Link>

                        {booking.status === 'confirmed' && (
                          isAfterLessonEnd ? (
                            <button
                              type="button"
                              onClick={() => handleCompleteLesson(booking.id)}
                              className="w-full sm:w-auto h-10 px-4 rounded-full bg-[#E3644F] hover:bg-[#d05540] text-white font-bold text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer whitespace-nowrap"
                            >
                              <Check className="w-4 h-4 shrink-0" strokeWidth={2} />
                              <span>指導完了を報告</span>
                            </button>
                          ) : (
                            <button
                              type="button"
                              disabled
                              title="不正防止のため、レッスン終了時刻を過ぎるまで完了報告できません"
                              className="w-full sm:w-auto h-10 px-4 rounded-full bg-[#EADBCC]/60 text-[#5E5B54] font-bold text-xs flex items-center justify-center gap-1.5 cursor-not-allowed whitespace-nowrap"
                            >
                              <Lock className="w-3.5 h-3.5 shrink-0" strokeWidth={1.75} />
                              <span>終了時刻後に報告可</span>
                            </button>
                          )
                        )}

                        {booking.status === 'completion_reported' && showDemoTools && (
                          <button
                            type="button"
                            onClick={() => handleApproveByParent(booking.id)}
                            className="w-full sm:w-auto h-10 px-4 rounded-full bg-[#3E8E84] hover:bg-[#32756d] text-white font-bold text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer whitespace-nowrap"
                          >
                            <Check className="w-4 h-4 shrink-0" strokeWidth={2} />
                            <span>デモ：保護者確認で確定</span>
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                  );
                })}
              </div>
            ) : (
              <div className="p-8 text-center text-[#5E5B54] bg-[#FDFBF7] rounded-2xl text-xs border border-[#EADBCC]">
                現在、確定した予約はありません。
              </div>
            )}
          </div>

          {/* 03. 出品中レッスン商品一覧 ＆ 新規出品 */}
          <div className="bg-white p-4 sm:p-6 md:p-8 rounded-3xl border border-[#EADBCC] shadow-xs space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <span className="font-en text-[10px] font-extrabold tracking-widest uppercase text-[#3E8E84] block mb-0.5">
                  03 / SERVICES
                </span>
                <h2 className="font-heading text-lg sm:text-xl font-bold text-[#2C2B29]">
                  出品レッスン商品（自由価格設定）
                </h2>
                <p className="text-xs text-[#5E5B54] mt-0.5">
                  最低料金5,000円（税込）以上・交通費込みで自由に出品できます。
                </p>
              </div>

              <button
                type="button"
                onClick={handleOpenCreateModal}
                className="w-full sm:w-auto h-11 px-5 rounded-full bg-[#E3644F] hover:bg-[#d05540] text-white font-bold text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer whitespace-nowrap"
              >
                <Plus className="w-4 h-4 shrink-0" strokeWidth={1.75} />
                <span>新しいレッスンを出品</span>
              </button>
            </div>

            {/* 保護者がいま求めている種目・エリア（需要データ連携） */}
            {demandTrends.length > 0 && (
              <div className="p-4 rounded-2xl bg-[#FDFBF7] border border-[#EADBCC] space-y-2.5">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <span className="inline-flex items-center gap-1.5 text-xs font-bold text-[#2C2B29]">
                    <Sparkles className="w-4 h-4 text-[#E3644F] shrink-0" strokeWidth={1.75} />
                    <span>保護者がいま探している種目・エリア（リクエスト需要）</span>
                  </span>
                  <span className="text-[10px] font-bold text-[#5E5B54]">
                    タップで需要に合わせたレッスンを出品できます
                  </span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {demandTrends.slice(0, 4).map((trend) => (
                    <button
                      key={trend.key}
                      type="button"
                      onClick={() =>
                        handleCreateFromDemand(trend.sportName, trend.areaName)
                      }
                      className="px-3 py-1.5 rounded-xl bg-white hover:bg-[#FCE7A2]/45 border border-[#EADBCC] hover:border-[#E3644F] text-left transition-colors cursor-pointer inline-flex items-center gap-2"
                    >
                      <span className="text-[11px] font-bold text-[#2C2B29]">
                        {trend.areaName} × {trend.sportName}
                      </span>
                      <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-[#E3644F]/12 text-[#E3644F] font-en">
                        {trend.count}件
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {services.map((srv) => (
                <div
                  key={srv.id}
                  className="p-5 rounded-2xl border border-[#EADBCC] bg-[#FDFBF7] hover:bg-white hover:border-[#E3644F] transition-all flex flex-col justify-between"
                >
                  <div className="space-y-2.5">
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-bold text-[#3E8E84] bg-[#3E8E84]/10 px-2.5 py-0.5 rounded-full">
                        #{srv.sport_category}
                      </span>
                      <span className="font-en text-xl font-extrabold text-[#2C2B29]">
                        ￥{srv.price.toLocaleString()}
                        <span className="text-xs font-sans text-[#5E5B54] font-normal"> / 60分</span>
                      </span>
                    </div>

                    <h3 className="font-heading font-bold text-[#2C2B29] text-base leading-snug">
                      {srv.title}
                    </h3>
                    <p className="text-xs text-[#5E5B54] line-clamp-2 leading-relaxed">
                      {srv.description}
                    </p>

                    <div className="text-[11px] text-[#5E5B54]">
                      対応エリア: <strong className="text-[#2C2B29]">{srv.target_areas.join('、')}</strong>
                    </div>
                  </div>

                  <div className="pt-3 border-t border-[#EADBCC] mt-4 space-y-2.5 text-xs">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1.5">
                      <span className="text-[#3E8E84] font-bold text-[11px] inline-flex items-center gap-1.5 whitespace-nowrap">
                        <span className="w-1.5 h-1.5 rounded-full bg-[#3E8E84] shrink-0" />
                        <span>公開中（ポータル掲載）</span>
                      </span>
                      <span className="text-[#5E5B54] font-bold">
                        対象: {srv.target_ages}
                      </span>
                    </div>

                    <div className="flex flex-wrap items-center gap-2 pt-1">
                      {profile.id && (
                        <Link
                          href={`/coaches/${profile.id}`}
                          target="_blank"
                          className="h-8 px-3 rounded-full bg-white border border-[#EADBCC] hover:border-[#3E8E84] text-[#3E8E84] text-[11px] font-bold inline-flex items-center gap-1 transition-colors"
                        >
                          <ExternalLink className="w-3 h-3 shrink-0" strokeWidth={1.75} />
                          <span>ページ確認</span>
                        </Link>
                      )}
                      <button
                        type="button"
                        onClick={() => handleOpenEditModal(srv)}
                        className="h-8 px-3 rounded-full bg-white border border-[#EADBCC] hover:border-[#2C2B29] text-[#2C2B29] text-[11px] font-bold inline-flex items-center gap-1 transition-colors cursor-pointer"
                      >
                        <Pencil className="w-3 h-3 shrink-0" strokeWidth={1.75} />
                        <span>編集</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDeleteService(srv.id)}
                        className="h-8 px-3 rounded-full bg-white border border-rose-200 hover:bg-rose-50 text-rose-600 text-[11px] font-bold inline-flex items-center gap-1 transition-colors cursor-pointer"
                      >
                        <Trash2 className="w-3 h-3 shrink-0" strokeWidth={1.75} />
                        <span>削除</span>
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* 04. 空きコマ登録カレンダー */}
          <div className="bg-white p-4 sm:p-6 md:p-8 rounded-3xl border border-[#EADBCC] shadow-xs space-y-6">
            <div>
              <span className="font-en text-[10px] font-extrabold tracking-widest uppercase text-[#E3644F] block mb-0.5">
                04 / AVAILABILITY SLOTS
              </span>
              <h2 className="font-heading text-lg sm:text-xl font-bold text-[#2C2B29]">
                空きコマ登録カレンダー
              </h2>
              <p className="text-xs text-[#5E5B54] mt-0.5">
                指導可能な日時を登録すると、保護者がカレンダーから即時予約・決済できるようになります。
              </p>
            </div>

            {/* コマ追加フォーム */}
            <form
              onSubmit={handleAddSlot}
              className="p-4 sm:p-5 rounded-2xl bg-[#FDFBF7] border border-[#EADBCC] grid grid-cols-1 sm:grid-cols-4 gap-3 items-end"
            >
              <div>
                <label htmlFor="slot-date" className="block text-[11px] font-bold text-[#2C2B29] mb-1">
                  指導可能日
                </label>
                <input
                  id="slot-date"
                  type="date"
                  required
                  value={newSlotDate}
                  onChange={(e) => setNewSlotDate(e.target.value)}
                  className="w-full h-10 px-3 rounded-xl border border-[#EADBCC] text-xs font-bold text-[#2C2B29] bg-white"
                />
              </div>

              <div>
                <label htmlFor="slot-time" className="block text-[11px] font-bold text-[#2C2B29] mb-1">
                  開始時刻（60分枠）
                </label>
                <input
                  id="slot-time"
                  type="time"
                  required
                  value={newSlotTime}
                  onChange={(e) => setNewSlotTime(e.target.value)}
                  className="w-full h-10 px-3 rounded-xl border border-[#EADBCC] text-xs font-bold text-[#2C2B29] bg-white"
                />
              </div>

              <div>
                <label htmlFor="slot-service" className="block text-[11px] font-bold text-[#2C2B29] mb-1">
                  適用するレッスン商品
                </label>
                <div className="relative">
                  <select
                    id="slot-service"
                    value={selectedServiceForSlot}
                    onChange={(e) => setSelectedServiceForSlot(e.target.value)}
                    style={{
                      WebkitAppearance: 'none',
                      MozAppearance: 'none',
                      appearance: 'none',
                      backgroundImage: 'none',
                    }}
                    className="w-full h-10 pl-3 pr-9 py-2 rounded-xl border border-[#EADBCC] text-xs font-bold text-[#2C2B29] bg-white leading-normal appearance-none cursor-pointer focus:outline-none focus:border-[#E3644F]"
                  >
                    {services.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.sport_category}: {s.title.slice(0, 16)}...
                      </option>
                    ))}
                  </select>
                  <ChevronDown
                    className="w-4 h-4 text-[#5E5B54] pointer-events-none absolute right-3 top-1/2 -translate-y-1/2"
                    strokeWidth={1.75}
                  />
                </div>
              </div>

              <div>
                <button
                  type="submit"
                  className="w-full h-10 rounded-full bg-[#2C2B29] hover:bg-[#E3644F] text-white font-bold text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                >
                  <Plus className="w-4 h-4" strokeWidth={1.75} />
                  <span>空き枠を追加</span>
                </button>
              </div>
            </form>

            {/* 登録済みスロット一覧 */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
              {slots.map((slot) => {
                const datePart = slot.start_time.slice(0, 10);
                const timePart = `${slot.start_time.slice(11, 16)} - ${slot.end_time.slice(11, 16)}`;

                return (
                  <div
                    key={slot.id}
                    className={`p-3.5 rounded-2xl border flex items-center justify-between ${
                      slot.is_booked
                        ? 'bg-gray-100 border-[#EADBCC] opacity-60'
                        : 'bg-[#FDFBF7] border-[#EADBCC] hover:border-[#E3644F]'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <Clock className="w-4 h-4 text-[#E3644F]" strokeWidth={1.75} />
                      <div>
                        <div className="font-en text-xs font-extrabold text-[#2C2B29]">
                          {datePart} {timePart}
                        </div>
                        <span className="text-[10px] text-[#5E5B54] font-bold truncate block max-w-[160px]">
                          {slot.service?.title}
                        </span>
                      </div>
                    </div>

                    {!slot.is_booked && (
                      <button
                        onClick={() => handleDeleteSlot(slot.id)}
                        className="text-[#5E5B54] hover:text-[#E3644F] p-1.5 rounded-full hover:bg-[#E3644F]/10 transition-colors cursor-pointer"
                        title="枠を削除"
                      >
                        <Trash2 className="w-4 h-4" strokeWidth={1.75} />
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
            </>
          )}
        </div>
      </main>

      {/* 新規出品モーダル */}
      {showServiceModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#2C2B29]/60 backdrop-blur-xs overflow-y-auto">
          <div className="bg-[#FDFBF7] w-full max-w-lg rounded-3xl shadow-2xl border border-[#EADBCC] overflow-hidden my-8">
            <div className="p-5 bg-[#2C2B29] text-white flex items-center justify-between">
              <h3 className="font-heading font-bold text-base">
                {editingServiceId ? 'レッスン商品の編集' : 'レッスン商品の新規出品'}
              </h3>
              <button
                onClick={() => {
                  setShowServiceModal(false);
                  setEditingServiceId(null);
                }}
                className="text-white/80 hover:text-white p-1 cursor-pointer"
              >
                <X className="w-5 h-5" strokeWidth={1.75} />
              </button>
            </div>

            <form onSubmit={handleCreateService} className="p-6 space-y-4 text-xs">
              <div>
                <label htmlFor="service-title" className="block font-bold text-[#2C2B29] mb-1">
                  レッスンタイトル <span className="text-[#E3644F]">*</span>
                </label>
                <input
                  id="service-title"
                  type="text"
                  required
                  placeholder="例: 【世田谷】運動会で1等賞！足が速くなる走り方特訓 60分"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className="w-full h-11 px-3.5 rounded-xl border border-[#EADBCC] bg-white text-xs font-bold text-[#2C2B29] focus:outline-none focus:border-[#E3644F]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label htmlFor="service-cat" className="block font-bold text-[#2C2B29] mb-1">
                    種目カテゴリー
                  </label>
                  <div className="relative">
                    <select
                      id="service-cat"
                      value={newCategory}
                      onChange={(e) => setNewCategory(e.target.value)}
                      style={{
                        WebkitAppearance: 'none',
                        MozAppearance: 'none',
                        appearance: 'none',
                        backgroundImage: 'none',
                      }}
                      className="w-full h-11 pl-3 pr-9 py-2.5 rounded-xl border border-[#EADBCC] text-xs font-bold text-[#2C2B29] bg-white leading-normal appearance-none cursor-pointer focus:outline-none focus:border-[#E3644F]"
                    >
                      <option value="かけっこ・走り方">かけっこ・走り方</option>
                      <option value="水泳・息継ぎ">水泳・息継ぎ</option>
                      <option value="鉄棒・逆上がり">鉄棒・逆上がり</option>
                      <option value="なわとび・二重跳び">なわとび・二重跳び</option>
                      {![
                        'かけっこ・走り方',
                        '水泳・息継ぎ',
                        '鉄棒・逆上がり',
                        'なわとび・二重跳び',
                      ].includes(newCategory) && (
                        <option value={newCategory}>{newCategory}</option>
                      )}
                    </select>
                    <ChevronDown
                      className="w-4 h-4 text-[#5E5B54] pointer-events-none absolute right-3 top-1/2 -translate-y-1/2"
                      strokeWidth={1.75}
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="service-price" className="block font-bold text-[#2C2B29] mb-1">
                    指導料金（下限5,000円〜） <span className="text-[#E3644F]">*</span>
                  </label>
                  <input
                    id="service-price"
                    type="number"
                    min={5000}
                    step={500}
                    required
                    value={newPrice}
                    onChange={(e) => setNewPrice(Number(e.target.value))}
                    className="w-full h-11 px-3 rounded-xl border border-[#EADBCC] bg-white text-xs font-en font-bold text-[#2C2B29]"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="service-areas" className="block font-bold text-[#2C2B29] mb-1">
                  対応エリア・公園名タグ（カンマ区切り）
                </label>
                <input
                  id="service-areas"
                  type="text"
                  required
                  value={newAreas}
                  onChange={(e) => setNewAreas(e.target.value)}
                  className="w-full h-11 px-3.5 rounded-xl border border-[#EADBCC] bg-white text-xs font-bold text-[#2C2B29]"
                />
              </div>

              <div>
                <label htmlFor="service-desc" className="block font-bold text-[#2C2B29] mb-1">
                  レッスンの流れ・指導内容
                </label>
                <textarea
                  id="service-desc"
                  rows={3}
                  required
                  placeholder="1. 準備体操とフォーム診断 2. 基礎ドリル 3. 実践測定..."
                  value={newDesc}
                  onChange={(e) => setNewDesc(e.target.value)}
                  className="w-full p-3 rounded-xl border border-[#EADBCC] bg-white text-xs text-[#2C2B29] leading-relaxed"
                />
              </div>

              <div>
                <label htmlFor="service-req" className="block font-bold text-[#2C2B29] mb-1">
                  持ち物・集合にあたってのお願い
                </label>
                <input
                  id="service-req"
                  type="text"
                  placeholder="動きやすい服装、水筒、タオルをご持参ください。"
                  value={newReq}
                  onChange={(e) => setNewReq(e.target.value)}
                  className="w-full h-11 px-3.5 rounded-xl border border-[#EADBCC] bg-white text-xs text-[#2C2B29]"
                />
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  className="w-full h-12 rounded-full bg-[#E3644F] hover:bg-[#d05540] text-white font-bold text-sm transition-colors shadow-sm cursor-pointer"
                >
                  {editingServiceId ? 'この内容で更新する' : 'この内容で出品する'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <KidsCoachFooter />
    </div>
  );
}
