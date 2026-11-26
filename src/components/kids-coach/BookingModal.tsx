'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Coach, AvailableSlot } from '@/data/kids-coach-mock';
import {
  Clock,
  ChevronRight,
  X,
  Lock,
  Loader2,
} from 'lucide-react';

interface BookingModalProps {
  isOpen: boolean;
  onClose: () => void;
  coach: Coach;
  slot: AvailableSlot;
  durationMinutes?: number;
  priceAmount?: number;
}

export default function BookingModal({
  isOpen,
  onClose,
  coach,
  slot,
  durationMinutes,
  priceAmount,
}: BookingModalProps) {
  const effectiveDuration = durationMinutes ?? coach.durationMinutes;
  const effectivePrice = priceAmount ?? coach.hourlyRate;
  // フォーム状態
  const [parentName, setParentName] = useState('');
  const [parentEmail, setParentEmail] = useState('');
  const [childAge, setChildAge] = useState('小学2年生 (7歳)');
  const [concern, setConcern] = useState('');
  const [location, setLocation] = useState('');
  const [phone, setPhone] = useState('');
  const [membershipNumber, setMembershipNumber] = useState('');

  // Stripe遷移状態・規約同意状態・デモ表示制御
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [showDemoTools, setShowDemoTools] = useState(
    process.env.NODE_ENV !== 'production'
  );

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      if (params.get('demo') === '1') setShowDemoTools(true);
    }
  }, []);

  if (!isOpen) return null;

  // テスト太郎（会員番号0035）自動入力ヘルパー
  const handleSetTestTaro = () => {
    setParentName('テスト太郎');
    setParentEmail('test_taro@wellne.example.com');
    setMembershipNumber('0035');
    setChildAge('小学2年生 (7歳)');
    setConcern('運動会前の走り方フォーム改善とスタートダッシュ克服');
    setLocation('駒沢オリンピック公園 中央広場');
    setPhone('090-0000-0035');
  };

  const handleSubmitToStripe = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!agreedToTerms || isSubmitting) return;

    setIsSubmitting(true);
    setSubmitError(null);

    try {
      const res = await fetch('/api/kcn/checkout/session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          slotId: slot.id,
          parentName,
          parentEmail,
          parentPhone: phone,
          membershipNumber,
          studentName: parentName,
          studentAge: childAge,
          notes: `${concern}${location ? `（希望場所: ${location}）` : ''}`,
          saveForFuture: true,
        }),
      });
      const data = await res.json();

      if (!res.ok || !data?.checkoutUrl) {
        setSubmitError(data?.error || '決済画面の起動に失敗しました。');
        setIsSubmitting(false);
        return;
      }

      window.location.href = data.checkoutUrl;
    } catch {
      setSubmitError('通信エラーが発生しました。時間をおいて再度お試しください。');
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <div className="fixed inset-0 z-40 flex items-center justify-center p-4 bg-[#2C2B29]/60 backdrop-blur-xs overflow-y-auto">
        <div className="bg-[#FDFBF7] w-full max-w-lg rounded-3xl shadow-2xl border border-[#EADBCC] overflow-hidden my-8">
          {/* モーダルヘッダー */}
          <div className="p-5 bg-[#2C2B29] text-white flex items-center justify-between">
            <div>
              <span className="font-en text-[10px] tracking-widest uppercase text-[#F7D668] block">
                LESSON REQUEST
              </span>
              <h3 className="font-heading font-bold text-base tracking-tight">
                レッスン予約情報の入力（{coach.name} コーチ）
              </h3>
            </div>
            <button
              onClick={onClose}
              className="text-white/80 hover:text-white p-1 rounded-lg transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" strokeWidth={1.75} />
            </button>
          </div>

          {/* 選択日時＆料金確認バナー */}
          <div className="bg-[#FCE7A2]/60 p-4 border-b border-[#EADBCC] flex flex-wrap items-center justify-between gap-3">
            <div className="space-y-0.5">
              <span className="text-[11px] font-bold text-[#5E5B54] uppercase tracking-wider">
                選択した日時
              </span>
              <div className="text-sm font-bold text-[#2C2B29] flex items-center gap-1.5">
                <Clock className="w-4 h-4 text-[#E3644F]" strokeWidth={1.75} />
                <span className="font-en">
                  {slot.date} ({slot.dayOfWeek}) {slot.startTime} - {slot.endTime}
                </span>
              </div>
            </div>
            <div className="text-right">
              <span className="text-[10px] text-[#5E5B54] font-bold block">お支払い金額（{effectiveDuration}分・税込・交通費込）</span>
              <span className="font-en text-xl font-extrabold text-[#E3644F]">
                ￥{effectivePrice.toLocaleString()}
              </span>
            </div>
          </div>

          {/* テスト支援ボタン（開発環境・?demo=1のみ表示） */}
          {showDemoTools && (
            <div className="px-6 pt-4 pb-1">
              <div className="p-3 rounded-2xl bg-white border border-[#EADBCC] flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div className="text-xs text-[#2C2B29] font-bold whitespace-nowrap">
                  テスト検証用顧客プリセット
                </div>
                <button
                  type="button"
                  onClick={handleSetTestTaro}
                  className="text-[11px] font-bold px-3 py-1.5 rounded-full bg-[#3E8E84] hover:bg-[#32756d] text-white transition-colors cursor-pointer whitespace-nowrap self-start sm:self-auto"
                >
                  会員番号0035（テスト太郎）を適用
                </button>
              </div>
            </div>
          )}

          {/* 入力フォーム */}
          <form onSubmit={handleSubmitToStripe} className="p-6 space-y-4">
            {/* 保護者氏名 */}
            <div>
              <label className="block text-xs font-bold text-[#2C2B29] mb-1">
                保護者様のお名前 <span className="text-[#E3644F]">*</span>
              </label>
              <input
                type="text"
                required
                placeholder="例: 山田 花子"
                value={parentName}
                onChange={(e) => setParentName(e.target.value)}
                className="w-full h-11 px-3.5 rounded-xl border border-[#EADBCC] bg-white text-sm font-bold text-[#2C2B29] focus:outline-none focus:ring-2 focus:ring-[#E3644F]"
              />
            </div>

            {/* 保護者メールアドレス */}
            <div>
              <label className="block text-xs font-bold text-[#2C2B29] mb-1">
                メールアドレス <span className="text-[#E3644F]">*</span>
              </label>
              <input
                type="email"
                required
                placeholder="example@email.com"
                value={parentEmail}
                onChange={(e) => setParentEmail(e.target.value)}
                className="w-full h-11 px-3.5 rounded-xl border border-[#EADBCC] bg-white text-sm font-bold text-[#2C2B29] focus:outline-none focus:ring-2 focus:ring-[#E3644F]"
              />
            </div>

            {/* 会員番号（任意） */}
            <div>
              <label className="block text-xs font-bold text-[#2C2B29] mb-1">
                会員番号（既存会員の方）
              </label>
              <input
                type="text"
                placeholder="例: 0035"
                value={membershipNumber}
                onChange={(e) => setMembershipNumber(e.target.value)}
                className="w-full h-11 px-3.5 rounded-xl border border-[#EADBCC] bg-white text-sm font-bold text-[#2C2B29] focus:outline-none focus:ring-2 focus:ring-[#E3644F]"
              />
            </div>

            {/* お子様の年齢・学年 */}
            <div>
              <label className="block text-xs font-bold text-[#2C2B29] mb-1">
                お子様の年齢・現在の学年 <span className="text-[#E3644F]">*</span>
              </label>
              <input
                type="text"
                required
                placeholder="例: 小学2年生 (7歳)"
                value={childAge}
                onChange={(e) => setChildAge(e.target.value)}
                className="w-full h-11 px-3.5 rounded-xl border border-[#EADBCC] bg-white text-sm font-bold text-[#2C2B29] focus:outline-none focus:ring-2 focus:ring-[#E3644F]"
              />
            </div>

            {/* 現在のお悩み・レッスン目標 */}
            <div>
              <label className="block text-xs font-bold text-[#2C2B29] mb-1">
                現在のお悩み・克服したいこと <span className="text-[#E3644F]">*</span>
              </label>
              <textarea
                required
                rows={3}
                placeholder="例: 走るときに腕が横に振れてしまうので、運動会前にフォームを直したい。"
                value={concern}
                onChange={(e) => setConcern(e.target.value)}
                className="w-full p-3 rounded-xl border border-[#EADBCC] bg-white text-sm text-[#2C2B29] focus:outline-none focus:ring-2 focus:ring-[#E3644F] leading-relaxed"
              />
            </div>

            {/* 希望の指導場所 */}
            <div>
              <label className="block text-xs font-bold text-[#2C2B29] mb-1">
                希望の指導場所（公園・利用可能な施設等） <span className="text-[#E3644F]">*</span>
              </label>
              <input
                type="text"
                required
                placeholder="例: 駒沢オリンピック公園 または 世田谷公園"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className="w-full h-11 px-3.5 rounded-xl border border-[#EADBCC] bg-white text-sm font-bold text-[#2C2B29] focus:outline-none focus:ring-2 focus:ring-[#E3644F]"
              />
              <span className="text-[11px] text-[#5E5B54] mt-1 block">
                ※実施場所や当日の待ち合わせ詳細は、専用チャットでコーチと調整できます。
              </span>
            </div>

            {/* 電話番号 */}
            <div>
              <label className="block text-xs font-bold text-[#2C2B29] mb-1">
                緊急連絡先（携帯電話） <span className="text-[#E3644F]">*</span>
              </label>
              <input
                type="tel"
                required
                placeholder="090-0000-0035"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full h-11 px-3.5 rounded-xl border border-[#EADBCC] bg-white text-sm font-bold text-[#2C2B29] focus:outline-none focus:ring-2 focus:ring-[#E3644F]"
              />
            </div>

            {/* 初回予約時の利用規約・プライバシーポリシー同意（必須） */}
            <div className="p-3 rounded-xl border border-[#EADBCC] bg-white">
              <label className="flex items-start gap-2 cursor-pointer select-none">
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
                  に同意します <span className="text-[#E3644F] font-bold">*</span>
                </span>
              </label>
            </div>

            {submitError && (
              <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-bold">
                {submitError}
              </div>
            )}

            {/* 決済へ進むボタン */}
            <div className="pt-2 space-y-2.5">
              <button
                type="submit"
                disabled={!agreedToTerms || isSubmitting}
                className="w-full h-12 rounded-full bg-[#E3644F] hover:bg-[#d05540] text-white font-bold text-sm flex items-center justify-center gap-2 shadow-sm active:scale-[0.99] transition-all cursor-pointer disabled:opacity-45 disabled:cursor-not-allowed"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" strokeWidth={1.75} />
                    <span>Stripe 決済画面へ移動中...</span>
                  </>
                ) : (
                  <>
                    <Lock className="w-4 h-4" strokeWidth={1.75} />
                    <span>お支払い情報の入力へ進む</span>
                    <ChevronRight className="w-4 h-4" strokeWidth={1.75} />
                  </>
                )}
              </button>

              <div className="text-center">
                <Link
                  href={`/checkout/${slot.id}`}
                  className="text-xs text-[#3E8E84] hover:underline font-bold"
                >
                  お支払い確認ページで詳しく確認して申し込む →
                </Link>
              </div>
            </div>
          </form>
        </div>
      </div>
    </>
  );
}
