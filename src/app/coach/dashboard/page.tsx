'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import KidsCoachNavbar from '@/components/kids-coach/Navbar';
import KidsCoachFooter from '@/components/kids-coach/Footer';
import {
  INITIAL_COACH_PROFILE,
  INITIAL_SERVICES,
  INITIAL_SLOTS,
  INITIAL_BOOKINGS,
} from '@/lib/kids-coach-store';
import {
  loadDemandRequests,
  aggregateDemandTrends,
  INITIAL_DEMAND_REQUESTS,
} from '@/lib/demand-requests';
import {
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
} from 'lucide-react';

export default function CoachDashboardPage() {
  const [profile, setProfile] = useState(INITIAL_COACH_PROFILE);
  const [services, setServices] = useState<Service[]>(INITIAL_SERVICES);
  const [slots, setSlots] = useState<ServiceSlot[]>(INITIAL_SLOTS);
  const [bookings, setBookings] = useState<Booking[]>(INITIAL_BOOKINGS);

  // Stripe Connect連携シミュレーション
  const [isConnectingStripe, setIsConnectingStripe] = useState(false);

  // レッスン出品モーダル開閉
  const [showServiceModal, setShowServiceModal] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newCategory, setNewCategory] = useState('かけっこ・走り方');
  const [newAreas, setNewAreas] = useState('世田谷区、目黒区、駒沢公園周辺');
  const [newPrice, setNewPrice] = useState(6500);
  const [newDesc, setNewDesc] = useState('');
  const [newReq, setNewReq] = useState('');

  // 空き枠追加用状態
  const [newSlotDate, setNewSlotDate] = useState('2026-11-17');
  const [newSlotTime, setNewSlotTime] = useState('10:00');
  const [selectedServiceForSlot, setSelectedServiceForSlot] = useState(services[0]?.id || '');

  // 保護者リクエスト需要ランキング状態
  const [demandTrends, setDemandTrends] = useState(() =>
    aggregateDemandTrends(INITIAL_DEMAND_REQUESTS)
  );

  useEffect(() => {
    setDemandTrends(aggregateDemandTrends(loadDemandRequests()));
  }, []);

  /** 需要ランキングから新規出品モーダルをプリセットして開く */
  const handleCreateFromDemand = (sportName: string, areaName: string) => {
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

  // 1. Stripe Connect Hosted Onboarding 実行
  const handleStripeConnect = () => {
    setIsConnectingStripe(true);
    setTimeout(() => {
      setIsConnectingStripe(false);
      setProfile((prev) => ({
        ...prev,
        stripe_account_id: 'acct_1MockStripeConnected888',
        stripe_payouts_enabled: true,
      }));
      showToast('Stripe Connect連携が完了しました。本人確認および振込口座が承認されました。');
    }, 1200);
  };

  // 2. レッスン商品新規出品
  const handleCreateService = (e: React.FormEvent) => {
    e.preventDefault();
    if (newPrice < 5000) {
      alert('最低料金は5,000円（税込）以上で設定してください。');
      return;
    }

    const created: Service = {
      id: `srv-${Date.now()}`,
      coach_id: profile.id,
      title: newTitle,
      sport_category: newCategory,
      target_areas: newAreas.split(/[,、]/).map((s) => s.trim()).filter(Boolean),
      price: newPrice,
      duration_minutes: 60,
      target_ages: '4〜12歳',
      description: newDesc,
      requirements: newReq,
      is_published: true,
      created_at: new Date().toISOString(),
      coach: profile,
    };

    setServices([created, ...services]);
    setShowServiceModal(false);
    setNewTitle('');
    setNewDesc('');
    setNewReq('');
    showToast('レッスン商品を出品しました。保護者ポータルに公開されます。');
  };

  // 3. 空きコマ追加
  const handleAddSlot = (e: React.FormEvent) => {
    e.preventDefault();
    const startTimeStr = `${newSlotDate}T${newSlotTime}:00+09:00`;
    const [h, m] = newSlotTime.split(':').map(Number);
    const endH = String(h + 1).padStart(2, '0');
    const endTimeStr = `${newSlotDate}T${endH}:${String(m).padStart(2, '0')}:00+09:00`;

    const targetService = services.find((s) => s.id === selectedServiceForSlot) || services[0];

    const newSlot: ServiceSlot = {
      id: `slot-${Date.now()}`,
      service_id: targetService.id,
      coach_id: profile.id,
      start_time: startTimeStr,
      end_time: endTimeStr,
      is_booked: false,
      service: targetService,
    };

    setSlots([...slots, newSlot]);
    showToast(`${newSlotDate} ${newSlotTime} - の空き枠を追加しました。`);
  };

  // 4. 空きコマ削除
  const handleDeleteSlot = (slotId: string) => {
    setSlots(slots.filter((s) => s.id !== slotId));
    showToast('空きコマを削除しました。');
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
                  <span className="inline-flex items-center gap-1 font-en text-[11px] sm:text-xs font-extrabold text-[#2C2B29] bg-[#FCE7A2] px-2.5 py-0.5 rounded-full whitespace-nowrap">
                    <Star className="w-3 h-3 fill-[#E3644F] text-[#E3644F] shrink-0" strokeWidth={1.75} />
                    <span>{profile.avg_rating}</span>
                  </span>
                </div>
                <h2 className="font-heading text-base sm:text-xl font-bold text-[#2C2B29] leading-snug">
                  {profile.display_name} コーチ
                </h2>
                <p className="text-xs text-[#5E5B54] font-bold mt-0.5">{profile.title}</p>
              </div>
            </div>

            {/* 手数料率バッジ（スマホは横1行バー、PCは右寄せボックス） */}
            <div className="bg-[#FDFBF7] px-3.5 py-2.5 sm:p-3.5 rounded-2xl border border-[#EADBCC] w-full lg:w-auto flex items-center justify-between lg:block lg:text-right text-xs shrink-0">
              <span className="text-[10px] text-[#5E5B54] font-bold block">手数料配分ルール</span>
              <div className="font-bold text-[#2C2B29] whitespace-nowrap">
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

                        {booking.status === 'completion_reported' && (
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
                onClick={() => setShowServiceModal(true)}
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

                  <div className="pt-3 border-t border-[#EADBCC] mt-4 flex items-center justify-between text-xs">
                    <span className="text-[#3E8E84] font-bold text-[11px] inline-flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#3E8E84]" />
                      <span>公開中（ポータル掲載）</span>
                    </span>
                    <span className="text-[#5E5B54] font-bold">
                      対象: {srv.target_ages}
                    </span>
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
                <select
                  id="slot-service"
                  value={selectedServiceForSlot}
                  onChange={(e) => setSelectedServiceForSlot(e.target.value)}
                  className="w-full h-10 px-3 rounded-xl border border-[#EADBCC] text-xs font-bold text-[#2C2B29] bg-white"
                >
                  {services.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.sport_category}: {s.title.slice(0, 16)}...
                    </option>
                  ))}
                </select>
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
        </div>
      </main>

      {/* 新規出品モーダル */}
      {showServiceModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#2C2B29]/60 backdrop-blur-xs overflow-y-auto">
          <div className="bg-[#FDFBF7] w-full max-w-lg rounded-3xl shadow-2xl border border-[#EADBCC] overflow-hidden my-8">
            <div className="p-5 bg-[#2C2B29] text-white flex items-center justify-between">
              <h3 className="font-heading font-bold text-base">レッスン商品の新規出品</h3>
              <button
                onClick={() => setShowServiceModal(false)}
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
                  <select
                    id="service-cat"
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value)}
                    className="w-full h-11 px-3 rounded-xl border border-[#EADBCC] text-xs font-bold text-[#2C2B29] bg-white"
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
                  この内容で出品する
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
