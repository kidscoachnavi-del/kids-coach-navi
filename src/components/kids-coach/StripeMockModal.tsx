'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Coach, AvailableSlot } from '@/data/kids-coach-mock';
import {
  Lock,
  Shield,
  Check,
  X,
  Loader2,
  CreditCard,
  Zap,
  ArrowRight,
} from 'lucide-react';

const SAVED_CHECKOUT_KEY = 'kcn_saved_checkout_profile_v1';

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

interface StripeMockModalProps {
  isOpen: boolean;
  onClose: () => void;
  coach: Coach;
  slot: AvailableSlot;
  durationMinutes?: number;
  priceAmount?: number;
  bookingInfo: {
    childAge: string;
    concern: string;
    location: string;
    parentName: string;
    phone: string;
    membershipNumber?: string;
  };
  onSuccess: () => void;
}

export default function StripeMockModal({
  isOpen,
  onClose,
  coach,
  slot,
  durationMinutes,
  priceAmount,
  bookingInfo,
  onSuccess,
}: StripeMockModalProps) {
  const effectiveDuration = durationMinutes ?? coach.durationMinutes;
  const effectivePrice = priceAmount ?? coach.hourlyRate;
  const [isProcessing, setIsProcessing] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);
  const [saveForFuture, setSaveForFuture] = useState(true);
  const [hasSavedCard, setHasSavedCard] = useState(false);

  // 既存のStripe連携済みプロフィールの有無を確認（カード番号自体は保持しない）
  useEffect(() => {
    if (!isOpen) return;
    try {
      const raw = localStorage.getItem(SAVED_CHECKOUT_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as SavedCheckoutProfile;
        if (parsed?.stripeCustomerId && parsed?.stripePaymentMethodId) {
          setHasSavedCard(true);
          return;
        }
      }
      setHasSavedCard(false);
    } catch {
      setHasSavedCard(false);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  /** Stripe側へ委任する決済シミュレーションを実行する */
  const handlePay = () => {
    setIsProcessing(true);
    setTimeout(() => {
      try {
        sessionStorage.setItem('kcn_paid_bk-demo-001', '1');
        if (!hasSavedCard && saveForFuture) {
          const memberNum = bookingInfo.membershipNumber || '0035';
          const profileToSave: SavedCheckoutProfile = {
            parentName: bookingInfo.parentName || 'テスト太郎',
            parentEmail: 'test_taro@wellne.example.com',
            parentPhone: bookingInfo.phone || '090-0000-0035',
            membershipNumber: memberNum,
            studentName: bookingInfo.parentName || 'テスト太郎',
            studentAge: bookingInfo.childAge || '小学2年生 (7歳)',
            stripeCustomerId: `cus_mock_stripe_${memberNum}`,
            stripePaymentMethodId: `pm_mock_stripe_${Date.now()}`,
          };
          localStorage.setItem(SAVED_CHECKOUT_KEY, JSON.stringify(profileToSave));
          setHasSavedCard(true);
        }
      } catch {
        // ストレージ無効環境は無視
      }
      setIsProcessing(false);
      setIsCompleted(true);
    }, 1200);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#2C2B29]/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-[#FDFBF7] w-full max-w-md rounded-3xl shadow-2xl border border-[#EADBCC] overflow-hidden relative">
        {/* ヘッダー */}
        <div className="p-5 bg-[#2C2B29] text-white flex items-center justify-between">
          <div>
            <span className="font-en text-[10px] tracking-widest uppercase text-[#F7D668] block">
              STRIPE SECURE CHECKOUT
            </span>
            <span className="font-heading font-bold text-sm tracking-wide">
              Stripe 事前決済（当日の現金払い不要）
            </span>
          </div>
          {!isProcessing && (
            <button
              type="button"
              onClick={isCompleted ? onSuccess : onClose}
              aria-label="閉じる"
              className="text-white/70 hover:text-white p-1 rounded-lg transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" strokeWidth={1.75} />
            </button>
          )}
        </div>

        {/* 決済完了状態 */}
        {isCompleted ? (
          <div className="p-6 sm:p-8 text-center space-y-4">
            <div className="w-14 h-14 rounded-full bg-[#3E8E84]/15 text-[#3E8E84] flex items-center justify-center mx-auto">
              <Check className="w-7 h-7" strokeWidth={2} />
            </div>
            <h3 className="font-heading text-xl font-bold text-[#2C2B29]">
              予約・決済が完了しました
            </h3>
            <p className="text-xs text-[#5E5B54] leading-relaxed">
              Stripe での事前決済が完了し、日程が確定しました。
              <br />
              待ち合わせ場所の確認はチャット一覧から行えます。
            </p>
            <div className="p-4 bg-white rounded-2xl text-left text-xs space-y-1.5 border border-[#EADBCC]">
              <div className="text-[#5E5B54]">
                受講日時:{' '}
                <strong className="text-[#2C2B29] font-en">
                  {slot.date} ({slot.dayOfWeek}) {slot.startTime} - {slot.endTime}
                </strong>
              </div>
              <div className="text-[#5E5B54]">
                担当コーチ: <strong className="text-[#2C2B29]">{coach.name} コーチ</strong>
              </div>
              <div className="text-[#5E5B54]">
                決済金額:{' '}
                <strong className="text-[#E3644F] font-en font-extrabold">
                  ￥{effectivePrice.toLocaleString()}
                </strong>
              </div>
            </div>

            <div className="pt-1 space-y-2">
              <Link
                href="/chat?room=bk-demo-001&paid=1"
                className="w-full h-11 px-4 rounded-full bg-[#E3644F] hover:bg-[#d05540] text-white font-bold text-xs sm:text-sm flex items-center justify-center gap-1.5 transition-colors shadow-xs whitespace-nowrap"
              >
                <span>チャット一覧で日程・決済状況を確認する</span>
                <ArrowRight className="w-4 h-4 shrink-0" strokeWidth={1.75} />
              </Link>
              <button
                type="button"
                onClick={onSuccess}
                className="w-full h-10 px-4 rounded-full bg-white border border-[#EADBCC] hover:border-[#2C2B29] text-xs font-bold text-[#5E5B54] transition-colors cursor-pointer"
              >
                閉じる
              </button>
            </div>
          </div>
        ) : (
          /* Stripe安全決済確認状態（当サイトでカード情報は一切入力・保持しない） */
          <div className="p-5 sm:p-6 space-y-4">
            {/* 最終お支払い金額（内訳なし） */}
            <div className="bg-white p-4 rounded-2xl border border-[#EADBCC] flex justify-between items-baseline">
              <div>
                <span className="text-xs font-bold text-[#2C2B29] block">お支払い金額</span>
                <span className="text-[10px] text-[#5E5B54]">
                  {effectiveDuration}分・税込・交通費込
                </span>
              </div>
              <span className="font-en text-2xl font-extrabold text-[#E3644F]">
                ￥{effectivePrice.toLocaleString()}
              </span>
            </div>

            {/* 予約情報プレビュー */}
            <div className="text-xs text-[#5E5B54] bg-white p-3.5 rounded-2xl border border-[#EADBCC] space-y-1">
              <div>
                日時:{' '}
                <strong className="text-[#2C2B29] font-en">
                  {slot.date} ({slot.dayOfWeek}) {slot.startTime} - {slot.endTime}
                </strong>
              </div>
              <div>
                保護者様:{' '}
                <strong className="text-[#2C2B29]">
                  {bookingInfo.parentName}{' '}
                  {bookingInfo.membershipNumber
                    ? `(会員番号: ${bookingInfo.membershipNumber})`
                    : ''}
                </strong>
              </div>
              <div>
                希望場所: <strong className="text-[#2C2B29]">{bookingInfo.location}</strong>
              </div>
            </div>

            {/* Stripe管理案内（カード入力欄を置かない） */}
            {hasSavedCard ? (
              <div className="p-3.5 rounded-2xl bg-[#D2E7DF]/35 border border-[#3E8E84]/40 space-y-1.5 text-xs">
                <div className="inline-flex items-center gap-1.5 font-bold text-[#3E8E84]">
                  <Zap className="w-4 h-4 shrink-0" strokeWidth={2} />
                  <span>Stripe 登録済みカードでワンクリック決済</span>
                </div>
                <p className="text-[11px] text-[#5E5B54] leading-relaxed">
                  クレジットカード情報の入力・管理はすべて Stripe 側で行われています（当サイトではカード番号を保持していません）。
                </p>
              </div>
            ) : (
              <div className="p-3.5 rounded-2xl bg-white border border-[#EADBCC] space-y-2.5">
                <div className="flex items-start gap-2 text-xs">
                  <CreditCard className="w-4 h-4 text-[#3E8E84] shrink-0 mt-0.5" strokeWidth={1.75} />
                  <div className="space-y-0.5 text-[11px] text-[#5E5B54] leading-relaxed">
                    <p className="font-bold text-[#2C2B29]">
                      クレジットカード情報の入力・管理はすべて Stripe（ストライプ）側で行います（当サイト非保持）
                    </p>
                    <p>
                      Stripe の安全な暗号化決済によって処理されるため、当サイト上でカード番号を保存・管理することは一切ありません。
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
                    <strong className="text-[#2C2B29]">
                      次回からワンクリック決済を利用する
                    </strong>
                  </span>
                </label>
              </div>
            )}

            {/* 決済実行ボタン */}
            <button
              type="button"
              onClick={handlePay}
              disabled={isProcessing}
              className={`w-full py-3.5 px-4 rounded-full text-white font-bold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-sm active:scale-[0.99] transition-all cursor-pointer disabled:opacity-50 ${
                hasSavedCard
                  ? 'bg-[#3E8E84] hover:bg-[#32756d]'
                  : 'bg-[#E3644F] hover:bg-[#d05540]'
              }`}
            >
              {isProcessing ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin shrink-0" strokeWidth={1.75} />
                  <span>Stripe 決済処理中...</span>
                </>
              ) : hasSavedCard ? (
                <>
                  <Zap className="w-4 h-4 shrink-0" strokeWidth={2} />
                  <span>Stripe 登録済みカードで ￥{effectivePrice.toLocaleString()} をワンクリック決済</span>
                </>
              ) : (
                <>
                  <Lock className="w-4 h-4 shrink-0" strokeWidth={1.75} />
                  <span>Stripe で ￥{effectivePrice.toLocaleString()} を決済して予約確定</span>
                </>
              )}
            </button>

            <div className="flex items-center justify-center gap-1.5 text-[11px] text-[#5E5B54]">
              <Shield className="w-3.5 h-3.5 text-[#3E8E84] shrink-0" strokeWidth={1.75} />
              <span>前日正午まで無料キャンセル可能</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
