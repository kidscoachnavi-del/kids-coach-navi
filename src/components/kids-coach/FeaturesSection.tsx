'use client';

import React from 'react';
import { ShieldCheck, BadgeCheck, Lock, CalendarCheck2, Check, FileCheck2 } from 'lucide-react';

// 親が一番気にする「安心・安全の担保」セクション（グラスモフィズム＆インナーシャドウ・GSAP連動）
export default function FeaturesSection() {
  const safetyGuarantees = [
    {
      icon: ShieldCheck,
      code: 'GOVERNANCE 01 / LIABILITY COVERAGE',
      title: '全レッスンに「対人・対物賠償責任保険」が自動付帯',
      desc: '公園や公営プールでの練習中、万が一お子様がケガをされた場合や、周囲の物・第三者に損害を与えてしまった場合でも、株式会社Wellneが契約する賠償責任保険が全レッスンに自動で適用されます。追加の保険料負担はありません。',
      fact: '追加保険料 ¥0 / 全予約に自動付帯',
      badge: '補償制度完備',
    },
    {
      icon: BadgeCheck,
      code: 'GOVERNANCE 02 / IDENTITY VERIFICATION',
      title: '公的身分証・指導実績を審査した「本人確認済みコーチ」のみ在籍',
      desc: '登録コーチは全員、Stripe KYCによる公的身分証の確認および指導経歴・競技実績の審査を通過しています。プロフィール画面では過去の指導実績、保有資格、実際に受講した保護者の評価レビューを事前にすべて確認できます。',
      fact: '本人確認審査 100% 実施済',
      badge: '厳選審査・評価公開',
    },
    {
      icon: Lock,
      code: 'GOVERNANCE 03 / PRIVACY & ESCROW',
      title: '個人のLINE交換・現金手渡しは一切不要（削除まで安心利用）',
      desc: 'コーチとの待ち合わせ調整や予約後のフォローは、サイト内の専用チャットで完結します。個人の連絡先を教える必要はなく、コーチまたは生徒がチャットを削除するまで利用でき、削除後はやり取りを終了できるためプライバシーと安全が守られます。',
      fact: '連絡先非公開 / Stripeエスクロー決済',
      badge: '連絡先交換不要',
    },
    {
      icon: CalendarCheck2,
      code: 'GOVERNANCE 04 / FLEXIBLE RESCHEDULING',
      title: '前日正午までキャンセル完全無料・雨天時も無償で日程振替',
      desc: 'お子様の急な発熱や体調不良でも、レッスン前日の昼12:00までならマイページからキャンセル料0円で手続き可能です。また、屋外レッスンで当日雨が降った場合も、追加費用なしで別日程へスムーズに振り替えられます。',
      fact: '前日12:00までキャンセル料 0%',
      badge: '体調不良・雨天対応',
    },
  ];

  return (
    <section
      id="safety"
      className="relative overflow-hidden py-20 md:py-28 bg-white border-b border-slate-200/80"
    >
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 film-noise" />

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* セクションヘッダー */}
        <div className="gsap-scroll-reveal flex flex-col lg:flex-row lg:items-end justify-between mb-14 gap-6">
          <div className="max-w-2xl space-y-3">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl depth-card font-mono text-[11px] font-semibold text-sky-700 uppercase tracking-[0.2em]">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>06 / SAFETY & ESCROW GOVERNANCE</span>
            </div>
            <p className="font-editorial italic text-lg sm:text-2xl text-slate-500 tracking-[0.14em]">
              Institutional-Grade Protection for Every Family
            </p>
            <h2 className="font-jp-serif text-2xl sm:text-3xl lg:text-4xl font-bold text-slate-900 tracking-[0.04em] leading-[1.45]">
              大切な子どもを預けるからこそ、
              <br className="hidden sm:inline" />
              保険・審査・決済の安全網を徹底しています。
            </h2>
          </div>
          <p className="text-xs sm:text-sm text-slate-600 max-w-md tracking-[0.03em] leading-[1.9]">
            個人間SNSでの直接契約や現金手渡しに伴うトラブルをゼロにするため、株式会社Wellneがプラットフォームとして4つの安全基準を担保しています。
          </p>
        </div>

        {/* 4つの安全基準カード（2x2グリッド・インナーシャドウ＆グラスモフィズム） */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">
          {safetyGuarantees.map((item, idx) => {
            const Icon = item.icon;
            return (
              <div
                key={idx}
                className="gsap-scroll-reveal depth-card rounded-xl p-6 sm:p-7 hover:border-slate-300 transition-all duration-200 flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-4 gap-2">
                    <div className="flex items-center gap-2.5">
                      <div className="w-10 h-10 rounded-xl bg-sky-50 border border-sky-100 text-sky-600 flex items-center justify-center shadow-[inset_0_1px_0_0_rgba(255,255,255,0.9)]">
                        <Icon className="w-5 h-5" />
                      </div>
                      <span className="font-mono text-[10px] font-bold text-slate-400 tracking-[0.16em] uppercase">
                        {item.code}
                      </span>
                    </div>
                    <span className="px-2.5 py-1 rounded-lg depth-Well text-[11px] font-semibold text-slate-700 shrink-0">
                      {item.badge}
                    </span>
                  </div>

                  <h3 className="font-jp-serif text-base sm:text-xl font-bold text-slate-900 mb-3 tracking-[0.03em] leading-snug">
                    {item.title}
                  </h3>

                  <p className="text-xs sm:text-sm text-slate-600 tracking-[0.02em] leading-[1.85] mb-6">
                    {item.desc}
                  </p>
                </div>

                <div className="pt-3.5 border-t border-slate-200/60 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-1.5 text-slate-800 font-semibold">
                    <Check className="w-4 h-4 text-sky-600 shrink-0" />
                    <span>{item.fact}</span>
                  </div>
                  <span className="font-mono text-[10px] tracking-[0.16em] text-slate-400 uppercase">
                    WELLNE STANDARD
                  </span>
                </div>
              </div>
            );
          })}
        </div>

        {/* 運営体制サマリーバー */}
        <div className="gsap-scroll-reveal depth-card rounded-xl p-5 sm:p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex items-start sm:items-center gap-4">
            <div className="w-11 h-11 rounded-xl bg-slate-900 text-white flex items-center justify-center shrink-0 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.2)]">
              <FileCheck2 className="w-5 h-5 text-sky-400" />
            </div>
            <div>
              <div className="font-jp-serif text-xs sm:text-base font-bold text-slate-900 tracking-[0.03em]">
                エスクロー決済（受講完了まで代金を運営が一時預かり）を採用
              </div>
              <p className="text-xs text-slate-600 mt-1 tracking-[0.02em] leading-relaxed">
                万が一コーチ都合でレッスンが実施されなかった場合は、決済代金が100%返金される仕組みのため金銭トラブルの心配がありません。
              </p>
            </div>
          </div>
          <a
            href="#coaches"
            className="shrink-0 inline-flex items-center justify-center px-5 py-3 rounded-xl bg-sky-600 hover:bg-sky-700 text-white text-xs font-semibold tracking-[0.05em] transition-colors shadow-[inset_0_1px_0_0_rgba(255,255,255,0.35),0_4px_12px_-2px_rgba(2,132,199,0.4)]"
          >
            本人確認済みコーチ一覧を見る
          </a>
        </div>
      </div>
    </section>
  );
}
