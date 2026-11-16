'use client';

import React from 'react';
import Link from 'next/link';
import { Calendar, CreditCard, MessageSquare, Lock, ShieldCheck } from 'lucide-react';

export default function HowItWorksSection() {
  return (
    <section
      id="how-it-works"
      className="relative overflow-hidden py-20 sm:py-24 lg:py-28 retina-mesh-bg border-b border-slate-200/80"
    >
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 film-noise" />

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* 見出し（12カラム整列） */}
        <div className="gsap-scroll-reveal grid grid-cols-1 lg:grid-cols-12 gap-8 items-end mb-14">
          <div className="lg:col-span-7 space-y-3">
            <span className="inline-flex items-center px-3.5 py-1.5 rounded-xl depth-card font-mono text-[11px] font-semibold text-sky-700 uppercase tracking-[0.2em]">
              05 / BESPOKE RESERVATION FLOW
            </span>
            <p className="font-editorial italic text-lg sm:text-2xl text-slate-500 tracking-[0.14em]">
              Seamless Digital Concierge — From Slot Selection to Private Chat
            </p>
            <h2 className="font-jp-serif text-2xl sm:text-3xl lg:text-4xl font-bold text-slate-900 tracking-[0.04em] leading-[1.45]">
              面倒な仲介やLINE交換は一切不要。<br className="hidden sm:inline" />
              予約・決済から当日の合流までスマホ1つで完結。
            </h2>
          </div>
          <div className="lg:col-span-5">
            <p className="text-xs sm:text-sm text-slate-600 tracking-[0.03em] leading-[1.9]">
              運営とのメール往復や事前の入会手続きはありません。カレンダーの空き枠選択からStripe決済、当日の待ち合わせ連絡まで3ステップで完了します。
            </p>
          </div>
        </div>

        {/* 3ステップ（UI fragments + depth-card） */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* STEP 01 */}
          <div className="gsap-scroll-reveal depth-card rounded-xl p-6 sm:p-7 flex flex-col justify-between space-y-6">
            <div className="space-y-3.5">
              <div className="flex items-center justify-between">
                <div className="w-10 h-10 rounded-xl bg-sky-50 border border-sky-100 text-sky-600 flex items-center justify-center shadow-[inset_0_1px_0_0_rgba(255,255,255,0.9)]">
                  <Calendar className="w-5 h-5" />
                </div>
                <span className="font-mono text-xs font-bold tracking-[0.18em] text-slate-400">
                  STEP 01 / SCHEDULE
                </span>
              </div>

              <h3 className="font-jp-serif text-base sm:text-xl font-bold text-slate-900 tracking-[0.03em]">
                空き枠カレンダーから日時を選択
              </h3>

              <p className="text-xs sm:text-sm text-slate-600 tracking-[0.02em] leading-[1.85]">
                コーチ詳細画面で直近2週間の空きスロットを確認。ご都合の良い60分枠をタップするだけで受講情報入力へ進みます。
              </p>
            </div>

            {/* UI Fragment: カレンダー枠プレビュー */}
            <div className="p-4 rounded-xl depth-Well space-y-2.5 text-xs">
              <div className="flex items-center justify-between text-[11px] font-semibold text-slate-600">
                <span>空き枠カレンダー（直近14日間）</span>
                <span className="font-mono text-[10px] text-sky-600 uppercase tracking-wider">INSTANT</span>
              </div>
              <div className="grid grid-cols-3 gap-2 text-center">
                <div className="p-2 rounded-lg bg-sky-600 text-white font-bold text-[11px] shadow-[inset_0_1px_0_0_rgba(255,255,255,0.3)]">
                  <div>11/14 (土)</div>
                  <div className="text-[10px] font-normal text-sky-100">空き 3枠</div>
                </div>
                <div className="p-2 rounded-lg bg-white border border-slate-200/80 text-slate-700 font-semibold text-[11px]">
                  <div>11/15 (日)</div>
                  <div className="text-[10px] text-sky-700">空き 2枠</div>
                </div>
                <div className="p-2 rounded-lg bg-white border border-slate-200/80 text-slate-700 font-semibold text-[11px]">
                  <div>11/16 (月)</div>
                  <div className="text-[10px] text-sky-700">空き 4枠</div>
                </div>
              </div>
            </div>
          </div>

          {/* STEP 02 */}
          <div className="gsap-scroll-reveal depth-card rounded-xl p-6 sm:p-7 flex flex-col justify-between space-y-6">
            <div className="space-y-3.5">
              <div className="flex items-center justify-between">
                <div className="w-10 h-10 rounded-xl bg-sky-50 border border-sky-100 text-sky-600 flex items-center justify-center shadow-[inset_0_1px_0_0_rgba(255,255,255,0.9)]">
                  <CreditCard className="w-5 h-5" />
                </div>
                <span className="font-mono text-xs font-bold tracking-[0.18em] text-slate-400">
                  STEP 02 / ESCROW
                </span>
              </div>

              <h3 className="font-jp-serif text-base sm:text-xl font-bold text-slate-900 tracking-[0.03em]">
                Stripe決済でその場で予約確定
              </h3>

              <p className="text-xs sm:text-sm text-slate-600 tracking-[0.02em] leading-[1.85]">
                入会金・月会費は0円。クレジットカード（Stripeエスクロー保護）による都度払いで即時確定。当日の現金手渡しは不要です。
              </p>
            </div>

            {/* UI Fragment: 明朗会計＆エスクロー内訳 */}
            <div className="p-4 rounded-xl depth-Well space-y-2 text-xs">
              <div className="flex justify-between text-slate-600">
                <span>60分マンツーマン受講料（交通費込）</span>
                <span className="font-mono font-bold text-slate-900">¥6,000</span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>入会金・年会費・月謝</span>
                <span className="font-mono font-bold text-sky-600">¥0</span>
              </div>
              <div className="pt-2 border-t border-slate-200/80 flex items-center justify-between">
                <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-slate-700">
                  <Lock className="w-3 h-3 text-sky-600" />
                  <span>Stripeエスクロー保護</span>
                </span>
                <Link href="/checkout/slot-101" className="text-[11px] font-bold text-sky-600 hover:underline">
                  決済画面例 →
                </Link>
              </div>
            </div>
          </div>

          {/* STEP 03 */}
          <div className="gsap-scroll-reveal depth-card rounded-xl p-6 sm:p-7 flex flex-col justify-between space-y-6">
            <div className="space-y-3.5">
              <div className="flex items-center justify-between">
                <div className="w-10 h-10 rounded-xl bg-sky-50 border border-sky-100 text-sky-600 flex items-center justify-center shadow-[inset_0_1px_0_0_rgba(255,255,255,0.9)]">
                  <MessageSquare className="w-5 h-5" />
                </div>
                <span className="font-mono text-xs font-bold tracking-[0.18em] text-slate-400">
                  STEP 03 / PRIVATE CHAT
                </span>
              </div>

              <h3 className="font-jp-serif text-base sm:text-xl font-bold text-slate-900 tracking-[0.03em]">
                専用チャットで片手合流（LINE交換不要）
              </h3>

              <p className="text-xs sm:text-sm text-slate-600 tracking-[0.02em] leading-[1.85]">
                個人のLINEや連絡先を教える必要はありません。サイト内の専用チャットと定型文ボタンで、集合場所の連絡から予約後のフォローまでやり取りできます（どちらかが削除するまで利用可能）。
              </p>
            </div>

            {/* UI Fragment: 専用チャットプレビュー */}
            <div className="p-4 rounded-xl depth-Well space-y-2.5 text-xs">
              <div className="bg-sky-600 text-white px-3.5 py-2 rounded-lg text-[11px] ml-auto max-w-[90%] shadow-[inset_0_1px_0_0_rgba(255,255,255,0.3)]">
                駒沢公園の中央広場時計塔前に到着しました。青い帽子が目印です。
              </div>
              <div className="flex items-center justify-between pt-1">
                <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-slate-600">
                  <ShieldCheck className="w-3.5 h-3.5 text-sky-600" />
                  <span>削除するまで予約後も利用可能</span>
                </span>
                <Link href="/chat" className="text-[11px] font-bold text-sky-600 hover:underline">
                  チャット一覧を見る →
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
