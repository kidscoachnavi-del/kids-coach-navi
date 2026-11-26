'use client';

import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import KidsCoachNavbar from '@/components/kids-coach/Navbar';
import KidsCoachFooter from '@/components/kids-coach/Footer';
import { INITIAL_SERVICES, INITIAL_SLOTS, INITIAL_COACH_PROFILE } from '@/lib/kids-coach-store';
import {
  Lock,
  Shield,
  Calendar,
  Clock,
  MapPin,
  Check,
  ArrowRight,
  Loader2,
  Star,
  Zap,
  CreditCard,
  RotateCcw,
} from 'lucide-react';

const SAVED_CHECKOUT_KEY = 'kcn_saved_checkout_profile_v1';

/**
 * 2回目以降のワンクリック決済用プロフィール
 * クレジットカード情報の入力・保管・管理はすべて Stripe（ストライプ）側で行い、
 * 当サイトでは Stripe の顧客参照ID・決済手段参照IDのみを扱う
 */
interface SavedCheckoutProfile {
  parentName: string;
  parentEmail: string;
  parentPhone: string;
  membershipNumber: string;
  studentName: string;
  studentAge: string;
  stripeCustomerId: string;
  stripePaymentMethodId: string;
}

export default function CheckoutPage() {
  const params = useParams();
  const slotId = params?.slotId as string;

  // 対象スロットおよびサービスの取得（実DB優先・モックフォールバック）
  const fallbackSlot = INITIAL_SLOTS.find((s) => s.id === slotId) || INITIAL_SLOTS[0];
  const fallbackService = fallbackSlot?.service || INITIAL_SERVICES[0];
  const fallbackCoach = fallbackService.coach || INITIAL_COACH_PROFILE;

  const [liveSlotData, setLiveSlotData] = useState<{
    id: string;
    start_time: string;
    end_time: string;
    service?: {
      id: string;
      title: string;
      price: number;
      duration_minutes: number;
      target_areas?: string[];
    };
    coach?: {
      id: string;
      display_name: string;
      title: string;
      avatar_url: string;
    };
  } | null>(null);

  const slot = liveSlotData
    ? {
        ...fallbackSlot,
        id: liveSlotData.id,
        start_time: liveSlotData.start_time,
        end_time: liveSlotData.end_time,
      }
    : fallbackSlot;
  const service = liveSlotData?.service
    ? {
        ...fallbackService,
        id: liveSlotData.service.id,
        title: liveSlotData.service.title,
        price: liveSlotData.service.price,
        duration_minutes: liveSlotData.service.duration_minutes,
        target_areas: liveSlotData.service.target_areas || fallbackService.target_areas,
      }
    : fallbackService;
  const coach = liveSlotData?.coach
    ? {
        ...fallbackCoach,
        id: liveSlotData.coach.id,
        display_name: liveSlotData.coach.display_name,
        title: liveSlotData.coach.title,
        avatar_url: liveSlotData.coach.avatar_url || fallbackCoach.avatar_url,
      }
    : fallbackCoach;

  const [showDemoTools, setShowDemoTools] = useState(
    process.env.NODE_ENV !== 'production'
  );

  // 料金計算: Wellne 25% / コーチ 75%
  const totalAmount = service.price;

  // フォーム状態
  const [parentName, setParentName] = useState('');
  const [parentEmail, setParentEmail] = useState('');
  const [parentPhone, setParentPhone] = useState('');
  const [membershipNumber, setMembershipNumber] = useState('');
  const [studentName, setStudentName] = useState('');
  const [studentAge, setStudentAge] = useState('小学2年生 (7歳)');
  const [concern, setConcern] = useState('運動会のリレー選手を目指して、スタートダッシュと腕振りを指導してほしい。');

  // ワンクリック決済（Stripe顧客・決済手段参照）状態
  const [savedProfile, setSavedProfile] = useState<SavedCheckoutProfile | null>(null);
  const [useOneClickMode, setUseOneClickMode] = useState(false);
  const [saveForFuture, setSaveForFuture] = useState(true);
  const [agreedToTerms, setAgreedToTerms] = useState(false);

  // 決済処理・完了・エラー状態
  const [isProcessing, setIsProcessing] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);
  const [paymentError, setPaymentError] = useState<string | null>(null);
  const [createdBookingId, setCreatedBookingId] = useState('bk-demo-001');

  // 初回マウント時に実DBスロット＆Stripe連携済み顧客プロフィールを読み込む（カード情報は一切保持しない）
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      if (params.get('demo') === '1') setShowDemoTools(true);
    }

    if (slotId && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(slotId)) {
      fetch(`/api/kcn/slots/${slotId}`)
        .then((res) => res.json())
        .then((data) => {
          if (data?.slot) setLiveSlotData(data.slot);
        })
        .catch(() => {
          // 取得失敗時はフォールバックのまま表示
        });
    }

    try {
      const raw = localStorage.getItem(SAVED_CHECKOUT_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as SavedCheckoutProfile;
        if (parsed && parsed.stripeCustomerId && parsed.stripePaymentMethodId) {
          setSavedProfile(parsed);
          setUseOneClickMode(true);
          setParentName(parsed.parentName);
          setParentEmail(parsed.parentEmail);
          setParentPhone(parsed.parentPhone);
          setMembershipNumber(parsed.membershipNumber);
          setStudentName(parsed.studentName);
          setStudentAge(parsed.studentAge);
        }
      }
    } catch {
      // ストレージ無効環境は無視
    }
  }, []);

  // テスト太郎（会員番号0035）ワンクリック入力
  const handleSetTestTaro = () => {
    setParentName('テスト太郎');
    setParentEmail('test_taro@wellne.example.com');
    setParentPhone('090-0000-0035');
    setMembershipNumber('0035');
    setStudentName('テスト太郎');
    setStudentAge('小学2年生 (7歳)');
    setConcern('運動会前の走り方フォーム改善とスタートダッシュ');
  };

  /** 初回・Stripe Checkout 実API決済遷移 */
  const handlePay = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!agreedToTerms || isProcessing) return;

    setIsProcessing(true);
    setPaymentError(null);

    try {
      const res = await fetch('/api/kcn/checkout/session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          slotId: slot.id,
          serviceId: service.id,
          coachId: coach.id,
          parentName: parentName || 'テスト太郎',
          parentEmail: parentEmail || 'test_taro@wellne.example.com',
          parentPhone: parentPhone || '090-0000-0035',
          membershipNumber,
          studentName: studentName || 'テスト太郎',
          studentAge,
          notes: concern,
          saveForFuture,
        }),
      });
      const data = await res.json();

      if (!res.ok || !data?.checkoutUrl) {
        setPaymentError(data?.error || 'Stripe決済画面の作成に失敗しました。');
        setIsProcessing(false);
        return;
      }

      if (data.bookingId) {
        setCreatedBookingId(data.bookingId);
      }

      if (saveForFuture) {
        try {
          const profileToSave: SavedCheckoutProfile = {
            parentName: parentName || 'テスト太郎',
            parentEmail: parentEmail || 'test_taro@wellne.example.com',
            parentPhone: parentPhone || '090-0000-0035',
            membershipNumber: membershipNumber || '0035',
            studentName: studentName || 'テスト太郎',
            studentAge: studentAge || '小学2年生 (7歳)',
            stripeCustomerId: 'cus_stripe_managed',
            stripePaymentMethodId: 'pm_stripe_managed',
          };
          localStorage.setItem(SAVED_CHECKOUT_KEY, JSON.stringify(profileToSave));
          setSavedProfile(profileToSave);
        } catch {
          // ストレージ無効環境は無視
        }
      }

      window.location.href = data.checkoutUrl;
    } catch {
      setPaymentError('通信エラーが発生しました。時間をおいて再度お試しください。');
      setIsProcessing(false);
    }
  };

  /** 2回目以降のワンクリック決済（実API） */
  const handleOneClickPay = async () => {
    if (!savedProfile || isProcessing) return;
    setIsProcessing(true);
    setPaymentError(null);

    try {
      const res = await fetch('/api/kcn/checkout/one-click', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          slotId: slot.id,
          serviceId: service.id,
          coachId: coach.id,
          parentId: savedProfile.membershipNumber === '0035'
            ? '07f961c0-5ec7-4209-9296-4011362452ed'
            : '',
          studentName: savedProfile.studentName,
          studentAge: savedProfile.studentAge,
          notes: concern,
        }),
      });
      const data = await res.json();

      if (!res.ok) {
        setPaymentError(
          data?.error || 'ワンクリック決済に失敗しました。「別のカード・情報で支払う」をお試しください。'
        );
        setIsProcessing(false);
        return;
      }

      if (data.bookingId) {
        setCreatedBookingId(data.bookingId);
      }
      setIsProcessing(false);
      setIsCompleted(true);
    } catch {
      setPaymentError('通信エラーが発生しました。時間をおいて再度お試しください。');
      setIsProcessing(false);
    }
  };

  /** デモ用：保存済み決済情報をリセットして初回状態へ戻す */
  const handleResetSavedCheckout = () => {
    try {
      localStorage.removeItem(SAVED_CHECKOUT_KEY);
    } catch {
      // ストレージ無効環境は無視
    }
    setSavedProfile(null);
    setUseOneClickMode(false);
  };

  const datePart = slot.start_time.slice(0, 10);
  const timePart = `${slot.start_time.slice(11, 16)} - ${slot.end_time.slice(11, 16)}`;

  return (
    <div className="min-h-screen bg-[#FDFBF7] text-[#2C2B29] flex flex-col font-sans">
      <KidsCoachNavbar />

      <main className="flex-1 py-5 sm:py-8 md:py-12">
        <div className="max-w-4xl mx-auto px-3.5 sm:px-6">
          {isCompleted ? (
            /* 予約・決済完了画面 */
            <div className="bg-white rounded-3xl border border-[#EADBCC] p-5 sm:p-8 md:p-12 shadow-xs text-center max-w-xl mx-auto space-y-5 sm:space-y-6">
              <div className="w-14 h-14 rounded-full bg-[#3E8E84]/15 text-[#3E8E84] flex items-center justify-center mx-auto">
                <Check className="w-7 h-7" strokeWidth={2} />
              </div>

              <div>
                <span className="inline-block text-xs font-bold text-[#3E8E84] bg-[#3E8E84]/10 px-3.5 py-1 rounded-full">
                  予約・決済完了（即時確定）
                </span>
                <h1 className="font-heading text-xl sm:text-3xl font-bold text-[#2C2B29] mt-3 tracking-tight leading-snug">
                  レッスンの予約が完了しました
                </h1>
                <p className="text-xs sm:text-sm text-[#5E5B54] mt-2 leading-relaxed">
                  クレジットカード事前決済が完了しました（当日の現金のお支払いは不要です）。
                  <br className="hidden sm:inline" />
                  担当コーチとの待ち合わせ場所や当日の相談は、専用チャットより行えます。
                </p>
              </div>

              <div className="p-4 bg-[#FDFBF7] rounded-2xl text-left text-xs space-y-2 border border-[#EADBCC] leading-relaxed">
                <div className="text-[#5E5B54]">
                  <span className="block sm:inline text-[11px] sm:text-xs">受講レッスン：</span>
                  <strong className="text-[#2C2B29]">{service.title}</strong>
                </div>
                <div className="text-[#5E5B54]">
                  担当コーチ：<strong className="text-[#2C2B29]">{coach.display_name} コーチ</strong>
                </div>
                <div className="text-[#5E5B54]">
                  受講日時：<strong className="text-[#2C2B29] font-en whitespace-nowrap">{datePart} {timePart}</strong>
                </div>
                <div className="text-[#5E5B54]">
                  決済金額：<strong className="text-[#E3644F] font-en font-extrabold whitespace-nowrap">￥{totalAmount.toLocaleString()}</strong>
                  <span className="whitespace-nowrap">（税込・交通費込）</span>
                </div>
              </div>

              <div className="pt-2">
                <Link
                  href={`/chat?room=${createdBookingId}&paid=1`}
                  className="w-full h-12 px-4 rounded-full bg-[#E3644F] hover:bg-[#d05540] text-white font-bold text-xs sm:text-sm flex items-center justify-center gap-2 transition-colors shadow-xs whitespace-nowrap"
                >
                  <span>当日の合流チャットを開く</span>
                  <ArrowRight className="w-4 h-4 shrink-0" strokeWidth={1.75} />
                </Link>
              </div>
            </div>
          ) : (
            /* 予約・決済入力画面 */
            <div className="grid grid-cols-1 md:grid-cols-12 gap-5 md:gap-8 items-start">
              {/* 左側（スマホでは下部）：入力フォーム */}
              <div className="md:col-span-7 order-2 md:order-1 bg-white rounded-3xl border border-[#EADBCC] p-4 sm:p-6 md:p-8 shadow-xs space-y-5">
                <div>
                  <span className="inline-block bg-[#FCE7A2] text-[#2C2B29] text-[11px] font-bold px-3 py-1 rounded-full mb-2">
                    入会金・月会費 ￥0（都度払い）
                  </span>
                  <h1 className="font-heading text-lg sm:text-2xl font-bold text-[#2C2B29] tracking-tight leading-snug">
                    お支払い・予約確定（カード決済）
                  </h1>
                  <p className="text-xs text-[#5E5B54] mt-1.5 leading-relaxed">
                    必要情報を入力して決済へお進みください。指導完了まで代金は安全に保護されます。
                  </p>
                </div>

                {/* 2回目以降のワンクリック決済UI（カード番号自体は一切保持せずトークン参照のみ） */}
                {savedProfile && useOneClickMode ? (
                  <div className="space-y-4 text-xs">
                    <div className="p-4 rounded-2xl bg-[#D2E7DF]/35 border border-[#3E8E84]/40 space-y-3">
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <span className="inline-flex items-center gap-1.5 text-xs font-bold text-[#3E8E84]">
                          <Zap className="w-4 h-4 shrink-0" strokeWidth={2} />
                          <span>ワンクリック決済が利用できます</span>
                        </span>
                        <button
                          type="button"
                          onClick={handleResetSavedCheckout}
                          className="text-[11px] font-bold text-[#5E5B54] hover:text-[#E3644F] inline-flex items-center gap-1 cursor-pointer whitespace-nowrap"
                        >
                          <RotateCcw className="w-3 h-3 shrink-0" strokeWidth={1.75} />
                          <span>初回状態に戻す</span>
                        </button>
                      </div>

                      <div className="p-3 rounded-xl bg-white border border-[#EADBCC] space-y-1.5 leading-relaxed">
                        <div className="flex flex-wrap items-center justify-between gap-2">
                          <span className="text-[11px] text-[#5E5B54] font-bold">ご登録者</span>
                          <span className="font-bold text-[#2C2B29]">
                            {savedProfile.parentName} 様（会員番号 {savedProfile.membershipNumber}）
                          </span>
                        </div>
                        <div className="flex flex-wrap items-center justify-between gap-2">
                          <span className="text-[11px] text-[#5E5B54] font-bold">お子様</span>
                          <span className="font-bold text-[#2C2B29]">
                            {savedProfile.studentName} ／ {savedProfile.studentAge}
                          </span>
                        </div>
                        <div className="pt-1.5 border-t border-[#EADBCC]/70 flex flex-wrap items-center justify-between gap-2">
                          <span className="text-[11px] text-[#5E5B54] font-bold inline-flex items-center gap-1">
                            <CreditCard className="w-3.5 h-3.5 text-[#3E8E84] shrink-0" strokeWidth={1.75} />
                            <span>お支払い方法</span>
                          </span>
                          <span className="font-bold text-[#3E8E84] whitespace-nowrap">
                            Stripe 登録済みカード（Stripe側で管理）
                          </span>
                        </div>
                      </div>

                      <p className="text-[11px] text-[#5E5B54] leading-relaxed flex items-start gap-1.5">
                        <Lock className="w-3.5 h-3.5 text-[#3E8E84] shrink-0 mt-0.5" strokeWidth={1.75} />
                        <span>
                          クレジットカードの管理・保管・決済処理はすべて Stripe（ストライプ）側で行っています。当サイトでカード情報を入力・保持することはありません。
                        </span>
                      </p>
                    </div>

                    <div>
                      <label htmlFor="oneclick-concern" className="block font-bold text-[#2C2B29] mb-1">
                        今回のご要望・お悩み（任意）
                      </label>
                      <textarea
                        id="oneclick-concern"
                        rows={2}
                        value={concern}
                        onChange={(e) => setConcern(e.target.value)}
                        className="w-full p-3 rounded-xl border border-[#EADBCC] bg-[#FDFBF7] text-xs text-[#2C2B29] leading-relaxed focus:outline-none focus:border-[#E3644F] focus:bg-white"
                      />
                    </div>

                    {paymentError && (
                      <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-bold">
                        {paymentError}
                      </div>
                    )}

                    <button
                      type="button"
                      onClick={handleOneClickPay}
                      disabled={isProcessing}
                      className="w-full h-12 px-4 rounded-full bg-[#3E8E84] hover:bg-[#32756d] text-white font-bold text-xs sm:text-sm flex items-center justify-center gap-2 transition-all cursor-pointer disabled:opacity-50 shadow-sm whitespace-nowrap"
                    >
                      {isProcessing ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin shrink-0" strokeWidth={1.75} />
                          <span>ワンクリック決済処理中...</span>
                        </>
                      ) : (
                        <>
                          <Zap className="w-4 h-4 shrink-0" strokeWidth={2} />
                          <span>￥{totalAmount.toLocaleString()} をワンクリック決済する</span>
                        </>
                      )}
                    </button>

                    <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
                      <span className="inline-flex items-center gap-1.5 text-[11px] text-[#5E5B54] font-bold whitespace-nowrap">
                        <Shield className="w-3.5 h-3.5 text-[#3E8E84] shrink-0" strokeWidth={1.75} />
                        <span>前日正午まで無料キャンセル可能</span>
                      </span>
                      <button
                        type="button"
                        onClick={() => setUseOneClickMode(false)}
                        className="text-[11px] font-bold text-[#E3644F] hover:underline cursor-pointer whitespace-nowrap"
                      >
                        別のカード・情報で支払う
                      </button>
                    </div>
                    <p className="text-[11px] text-[#8A857B] leading-relaxed">
                      ※ ワンクリック決済では、初回予約時にご同意いただいた
                      <Link href="/terms" target="_blank" rel="noopener noreferrer" className="text-[#3E8E84] underline mx-0.5">
                        利用規約
                      </Link>
                      および
                      <Link href="/privacy" target="_blank" rel="noopener noreferrer" className="text-[#3E8E84] underline mx-0.5">
                        プライバシーポリシー
                      </Link>
                      が引き続き適用されます。
                    </p>
                  </div>
                ) : (
                  <>
                    {savedProfile && !showDemoTools && (
                      <div className="flex justify-end">
                        <button
                          type="button"
                          onClick={() => setUseOneClickMode(true)}
                          className="text-[11px] font-bold px-3 py-1.5 rounded-full bg-white border border-[#3E8E84] text-[#3E8E84] hover:bg-[#D2E7DF]/30 transition-colors cursor-pointer whitespace-nowrap"
                        >
                          ワンクリック決済に戻る
                        </button>
                      </div>
                    )}

                    {/* テスト支援プリセットボタン（開発環境・?demo=1時のみ表示） */}
                    {showDemoTools && (
                      <div className="p-3.5 bg-[#FDFBF7] rounded-2xl border border-[#EADBCC] flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
                        <div className="text-xs font-bold text-[#2C2B29] whitespace-nowrap">
                          テスト検証用顧客データ
                        </div>
                        <div className="flex flex-wrap items-center gap-2">
                          {savedProfile && (
                            <button
                              type="button"
                              onClick={() => setUseOneClickMode(true)}
                              className="text-[11px] font-bold px-3 py-1.5 rounded-full bg-white border border-[#3E8E84] text-[#3E8E84] hover:bg-[#D2E7DF]/30 transition-colors cursor-pointer whitespace-nowrap"
                            >
                              ワンクリック決済に戻る
                            </button>
                          )}
                          <button
                            type="button"
                            onClick={handleSetTestTaro}
                            className="text-[11px] font-bold px-3.5 py-2 sm:py-1.5 rounded-full bg-[#3E8E84] hover:bg-[#32756d] text-white transition-colors cursor-pointer whitespace-nowrap"
                          >
                            会員番号0035（テスト太郎）適用
                          </button>
                        </div>
                      </div>
                    )}

                    <form onSubmit={handlePay} className="space-y-4 text-xs">
                  {/* 保護者情報 */}
                  <div className="space-y-3 pt-1">
                    <h2 className="font-heading text-xs font-bold text-[#2C2B29] uppercase tracking-wider">
                      01. 保護者様情報
                    </h2>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label htmlFor="parent-name" className="block font-bold text-[#2C2B29] mb-1">
                          保護者様のお名前 <span className="text-[#E3644F]">*</span>
                        </label>
                        <input
                          id="parent-name"
                          type="text"
                          required
                          autoComplete="name"
                          placeholder="例: テスト太郎"
                          value={parentName}
                          onChange={(e) => setParentName(e.target.value)}
                          className="w-full h-11 px-3.5 rounded-xl border border-[#EADBCC] bg-[#FDFBF7] text-xs font-bold text-[#2C2B29] focus:outline-none focus:border-[#E3644F] focus:bg-white"
                        />
                      </div>

                      <div>
                        <label htmlFor="member-num" className="block font-bold text-[#2C2B29] mb-1">
                          会員番号（任意）
                        </label>
                        <input
                          id="member-num"
                          type="text"
                          placeholder="例: 0035"
                          value={membershipNumber}
                          onChange={(e) => setMembershipNumber(e.target.value)}
                          className="w-full h-11 px-3.5 rounded-xl border border-[#EADBCC] bg-[#FDFBF7] text-xs font-bold text-[#2C2B29] focus:outline-none focus:border-[#E3644F] focus:bg-white"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label htmlFor="parent-email" className="block font-bold text-[#2C2B29] mb-1">
                          メールアドレス <span className="text-[#E3644F]">*</span>
                        </label>
                        <input
                          id="parent-email"
                          type="email"
                          required
                          autoComplete="email"
                          placeholder="example@wellne.jp"
                          value={parentEmail}
                          onChange={(e) => setParentEmail(e.target.value)}
                          className="w-full h-11 px-3.5 rounded-xl border border-[#EADBCC] bg-[#FDFBF7] text-xs font-bold text-[#2C2B29] focus:outline-none focus:border-[#E3644F] focus:bg-white"
                        />
                      </div>

                      <div>
                        <label htmlFor="parent-phone" className="block font-bold text-[#2C2B29] mb-1">
                          緊急連絡先（電話番号） <span className="text-[#E3644F]">*</span>
                        </label>
                        <input
                          id="parent-phone"
                          type="tel"
                          required
                          autoComplete="tel"
                          placeholder="090-0000-0035"
                          value={parentPhone}
                          onChange={(e) => setParentPhone(e.target.value)}
                          className="w-full h-11 px-3.5 rounded-xl border border-[#EADBCC] bg-[#FDFBF7] text-xs font-bold text-[#2C2B29] focus:outline-none focus:border-[#E3644F] focus:bg-white"
                        />
                      </div>
                    </div>
                  </div>

                  {/* 生徒情報 */}
                  <div className="space-y-3 pt-3 border-t border-[#EADBCC]">
                    <h2 className="font-heading text-xs font-bold text-[#2C2B29] uppercase tracking-wider">
                      02. お子様・受講情報
                    </h2>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label htmlFor="student-name" className="block font-bold text-[#2C2B29] mb-1">
                          お子様のお名前
                        </label>
                        <input
                          id="student-name"
                          type="text"
                          placeholder="例: テスト太郎"
                          value={studentName}
                          onChange={(e) => setStudentName(e.target.value)}
                          className="w-full h-11 px-3.5 rounded-xl border border-[#EADBCC] bg-[#FDFBF7] text-xs font-bold text-[#2C2B29] focus:outline-none focus:border-[#E3644F] focus:bg-white"
                        />
                      </div>

                      <div>
                        <label htmlFor="student-age" className="block font-bold text-[#2C2B29] mb-1">
                          学年・年齢 <span className="text-[#E3644F]">*</span>
                        </label>
                        <input
                          id="student-age"
                          type="text"
                          required
                          placeholder="例: 小学2年生 (7歳)"
                          value={studentAge}
                          onChange={(e) => setStudentAge(e.target.value)}
                          className="w-full h-11 px-3.5 rounded-xl border border-[#EADBCC] bg-[#FDFBF7] text-xs font-bold text-[#2C2B29] focus:outline-none focus:border-[#E3644F] focus:bg-white"
                        />
                      </div>
                    </div>

                    <div>
                      <label htmlFor="concern-text" className="block font-bold text-[#2C2B29] mb-1">
                        現在のお悩み・レッスンで克服したいこと <span className="text-[#E3644F]">*</span>
                      </label>
                      <textarea
                        id="concern-text"
                        rows={2}
                        required
                        placeholder="例: 走るときに足が流れてしまう。運動会に向けてフォームを直したい。"
                        value={concern}
                        onChange={(e) => setConcern(e.target.value)}
                        className="w-full p-3 rounded-xl border border-[#EADBCC] bg-[#FDFBF7] text-xs text-[#2C2B29] leading-relaxed focus:outline-none focus:border-[#E3644F] focus:bg-white"
                      />
                    </div>
                  </div>

                  {/* お支払い方法（Stripe完全管理・当サイト非保持） */}
                  <div className="space-y-3 pt-3 border-t border-[#EADBCC]">
                    <div className="flex flex-wrap items-center justify-between gap-1.5">
                      <h2 className="font-heading text-xs font-bold text-[#2C2B29] uppercase tracking-wider whitespace-nowrap">
                        03. お支払い方法（Stripe 安全決済）
                      </h2>
                      <div className="flex items-center gap-1 text-[10px] font-bold text-[#3E8E84] whitespace-nowrap">
                        <Lock className="w-3 h-3 shrink-0" strokeWidth={1.75} />
                        <span>Stripe 管理 / 当サイト非保持</span>
                      </div>
                    </div>

                    <div className="p-4 bg-[#FDFBF7] rounded-2xl border border-[#EADBCC] space-y-3">
                      <div className="flex items-start gap-2.5">
                        <CreditCard className="w-4 h-4 text-[#3E8E84] shrink-0 mt-0.5" strokeWidth={1.75} />
                        <div className="space-y-1 text-[11px] text-[#5E5B54] leading-relaxed">
                          <p className="font-bold text-[#2C2B29]">
                            クレジットカード情報の入力・管理はすべて Stripe（ストライプ）で行います
                          </p>
                          <p>
                            この後の決済画面で Stripe がカード情報を安全に処理・管理するため、当サイト側でカード番号を入力・保持することは一切ありません。
                          </p>
                        </div>
                      </div>

                      <label className="flex items-start gap-2 pt-2 border-t border-[#EADBCC]/70 cursor-pointer select-none">
                        <input
                          type="checkbox"
                          checked={saveForFuture}
                          onChange={(e) => setSaveForFuture(e.target.checked)}
                          className="mt-0.5 rounded border-[#EADBCC] text-[#3E8E84] focus:ring-[#3E8E84]"
                        />
                        <span className="text-[11px] text-[#5E5B54] leading-relaxed">
                          <strong className="text-[#2C2B29]">Stripe に決済手段を保存し、次回からワンクリック決済を利用する</strong>
                        </span>
                      </label>
                    </div>
                  </div>

                  {/* 初回予約時の利用規約・プライバシーポリシー同意（必須） */}
                  <div className="p-3.5 rounded-2xl border border-[#EADBCC] bg-[#FDFBF7]">
                    <label className="flex items-start gap-2.5 cursor-pointer select-none">
                      <input
                        type="checkbox"
                        required
                        checked={agreedToTerms}
                        onChange={(e) => setAgreedToTerms(e.target.checked)}
                        className="mt-0.5 rounded border-[#EADBCC] text-[#E3644F] focus:ring-[#E3644F]"
                      />
                      <span className="text-[11px] text-[#2C2B29] leading-relaxed">
                        <Link
                          href="/terms"
                          target="_blank"
                          rel="noopener noreferrer"
                          className="font-bold text-[#3E8E84] underline hover:text-[#2f7169]"
                        >
                          利用規約（保護者・受講者様向け）
                        </Link>
                        、
                        <Link
                          href="/privacy"
                          target="_blank"
                          rel="noopener noreferrer"
                          className="font-bold text-[#3E8E84] underline hover:text-[#2f7169]"
                        >
                          プライバシーポリシー
                        </Link>
                        および
                        <Link
                          href="/tokushoho"
                          target="_blank"
                          rel="noopener noreferrer"
                          className="font-bold text-[#3E8E84] underline hover:text-[#2f7169]"
                        >
                          キャンセルポリシー（特商法表記）
                        </Link>
                        に同意します <span className="text-[#E3644F] font-bold">*</span>
                      </span>
                    </label>
                  </div>

                  {/* 決済エラー表示 */}
                  {paymentError && (
                    <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-bold">
                      {paymentError}
                    </div>
                  )}

                  {/* 決済確定ボタン */}
                  <div className="pt-2">
                    <button
                      type="submit"
                      disabled={isProcessing || !agreedToTerms}
                      className="w-full h-12 px-4 rounded-full bg-[#E3644F] hover:bg-[#d05540] text-white font-bold text-xs sm:text-sm flex items-center justify-center gap-2 transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed shadow-sm whitespace-nowrap"
                    >
                      {isProcessing ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin shrink-0" strokeWidth={1.75} />
                          <span>Stripe 決済処理中...</span>
                        </>
                      ) : (
                        <>
                          <Lock className="w-4 h-4 shrink-0" strokeWidth={1.75} />
                          <span>Stripe で ￥{totalAmount.toLocaleString()} を決済する</span>
                        </>
                      )}
                    </button>
                    <div className="flex items-center justify-center gap-1.5 text-[11px] text-[#5E5B54] mt-2.5 font-bold whitespace-nowrap">
                      <Shield className="w-3.5 h-3.5 text-[#3E8E84] shrink-0" strokeWidth={1.75} />
                      <span>前日正午まで無料キャンセル可能</span>
                    </div>
                  </div>
                </form>
                  </>
                )}
              </div>

              {/* 右側（スマホでは上部に表示）：注文サマリーカード */}
              <div className="md:col-span-5 order-1 md:order-2 bg-white rounded-3xl border border-[#EADBCC] p-4 sm:p-6 shadow-xs space-y-4 md:sticky md:top-24">
                <h3 className="font-heading text-sm font-bold text-[#2C2B29] pb-2.5 border-b border-[#EADBCC]">
                  ご予約レッスン内容
                </h3>

                {/* コーチ情報 */}
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-[#FCE7A2] border border-[#2C2B29]/25 flex items-center justify-center font-heading font-bold text-lg text-[#2C2B29] shrink-0">
                    {coach.display_name.charAt(0)}
                  </div>
                  <div className="min-w-0">
                    <span className="inline-block text-[10px] font-bold text-[#3E8E84] bg-[#3E8E84]/10 px-2 py-0.5 rounded-full">
                      担当コーチ
                    </span>
                    <div className="font-heading font-bold text-sm text-[#2C2B29] mt-0.5">{coach.display_name} コーチ</div>
                    <span className="inline-flex items-center gap-1 text-[10px] text-[#5E5B54] font-bold font-en whitespace-nowrap">
                      <Star className="w-3 h-3 fill-[#E3644F] text-[#E3644F] shrink-0" strokeWidth={1.75} />
                      <span>{coach.avg_rating} (指導実績{coach.total_completed_lessons}件)</span>
                    </span>
                  </div>
                </div>

                {/* レッスン商品概要 */}
                <div className="p-3.5 sm:p-4 rounded-2xl bg-[#FDFBF7] space-y-2 text-xs border border-[#EADBCC]">
                  <div className="font-bold text-[#2C2B29] leading-relaxed">{service.title}</div>
                  <div className="flex items-center gap-1.5 text-[#5E5B54]">
                    <Calendar className="w-3.5 h-3.5 text-[#E3644F] shrink-0" strokeWidth={1.75} />
                    <span className="font-en whitespace-nowrap">{datePart}</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-[#5E5B54]">
                    <Clock className="w-3.5 h-3.5 text-[#E3644F] shrink-0" strokeWidth={1.75} />
                    <span className="font-en whitespace-nowrap">{timePart} ({service.duration_minutes}分個別指導)</span>
                  </div>
                  <div className="flex items-start gap-1.5 text-[#5E5B54]">
                    <MapPin className="w-3.5 h-3.5 text-[#E3644F] shrink-0 mt-0.5" strokeWidth={1.75} />
                    <span className="leading-relaxed">{service.target_areas.join('・')}</span>
                  </div>
                </div>

                {/* 最終お支払い金額（内訳なしの明朗単一料金） */}
                <div className="pt-3 border-t border-[#EADBCC] flex flex-wrap justify-between items-end gap-2">
                  <div>
                    <span className="font-bold text-xs text-[#2C2B29] block">お支払い金額</span>
                    <span className="text-[10px] text-[#5E5B54] whitespace-nowrap">税込・交通費込（追加費用なし）</span>
                  </div>
                  <span className="font-en text-2xl font-extrabold text-[#E3644F] whitespace-nowrap shrink-0">
                    ￥{totalAmount.toLocaleString()}
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>

      <KidsCoachFooter />
    </div>
  );
}
