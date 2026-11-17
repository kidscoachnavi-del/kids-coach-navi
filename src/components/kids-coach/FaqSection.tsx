'use client';

import React, { useState } from 'react';
import { ChevronDown, HelpCircle, ShieldCheck, ArrowRight } from 'lucide-react';

// よくある質問セクション（12カラムスプリット・グラスモフィズム＆GSAP連動）
export default function FaqSection() {
  const faqs = [
    {
      q: 'レッスン場所はどのように決まりますか？自宅の近くでも可能ですか？',
      a: 'はい、可能です。かけっこや鉄棒・縄跳びなどはご自宅近くの公園や広場、水泳は地域の公営プール・市民プール（入場料は各自実費負担）へコーチが出張します。予約確定後にサイト内の専用チャットで具体的な待ち合わせ場所をご相談いただけます。',
    },
    {
      q: '運動が苦手・水が怖い子どもでも大丈夫でしょうか？',
      a: 'もちろん大歓迎です。集団スクールで「順番待ちばかりで進級できない」「周りの目が気になって萎縮してしまう」というお子様こそ、1対1の専任指導で劇的に変わります。お子様の性格やペースに寄り添い、小さな「できた！」を積み重ねる指導を行います。',
    },
    {
      q: '入会金や月謝はかかりますか？1回だけでも受講できますか？',
      a: '入会金・年会費・月謝・指定ユニフォーム代はすべて0円です。「運動会前の1回だけ」「水泳の進級テスト前に2回だけ」など、必要な時に必要な回数だけ都度払い（1コマ60分 5,000円〜）でご予約いただけます。',
    },
    {
      q: '支払い方法や、体調不良・雨天時のキャンセル規定を教えてください。',
      a: 'お支払いはクレジットカード（Stripe事前決済）のみとなります。現地での現金手渡しは不要です。キャンセルは【レッスン前日の正午（12:00）まで】マイページより完全無料（手数料0円）で可能です。また、当日雨天の場合も無料で別日程へ振り替えが可能です。',
    },
    {
      q: 'きょうだいやお友達と一緒に2人で受講することはできますか？',
      a: '多くのコーチが「きょうだい・友人ペア受講（同時2名まで）」に対応しています。予約確定後の専用チャットにて、ペア受講ご希望の旨をコーチへお伝えください。',
    },
  ];

  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <section
      id="faq"
      className="relative overflow-hidden py-20 md:py-28 retina-mesh-bg border-b border-slate-200/80"
    >
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 film-noise" />

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-start">
          {/* 左4カラム：見出し＋安心サポート案内 */}
          <div className="gsap-scroll-reveal lg:col-span-4 space-y-5">
            <div className="space-y-3">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl depth-card font-mono text-[11px] font-semibold text-sky-700 uppercase tracking-[0.2em]">
                <HelpCircle className="w-3.5 h-3.5" />
                <span>07 / INQUIRIES & FAQ</span>
              </div>
              <p className="font-editorial italic text-lg sm:text-xl text-slate-500 tracking-[0.14em]">
                Clarity Before Your First Session
              </p>
              <h2 className="font-jp-serif text-2xl sm:text-3xl font-bold text-slate-900 tracking-[0.04em] leading-[1.45]">
                受講前の疑問を
                <br className="hidden sm:inline" />
                すべて解消します
              </h2>
              <p className="text-xs sm:text-sm text-slate-600 tracking-[0.03em] leading-[1.9]">
                初めての出張マンツーマン指導でも安心してご利用いただけるよう、保護者様からよくいただくご質問をまとめました。
              </p>
            </div>

            <div className="depth-card rounded-xl p-5 sm:p-6 space-y-3">
              <div className="flex items-center gap-2 text-xs font-bold text-slate-900 tracking-[0.03em]">
                <ShieldCheck className="w-4 h-4 text-sky-600 shrink-0" />
                <span>入会金0円・1回ごとの完全都度払い</span>
              </div>
              <p className="text-xs text-slate-600 tracking-[0.02em] leading-[1.8]">
                まずはご希望の種目・エリアで対応可能なコーチのプロフィールと空き日程をご覧ください。
              </p>
              <a
                href="#coaches"
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-sky-600 hover:text-sky-700 transition-colors"
              >
                <span>空き枠からコーチを探す</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </a>
            </div>
          </div>

          {/* 右8カラム：FAQアコーディオン */}
          <div className="gsap-scroll-reveal lg:col-span-8 space-y-3.5">
            {faqs.map((faq, idx) => {
              const isOpen = openIndex === idx;
              return (
                <div key={idx} className="depth-card rounded-xl overflow-hidden">
                  <button
                    type="button"
                    onClick={() => setOpenIndex(isOpen ? null : idx)}
                    className="w-full p-5 sm:p-6 text-left flex items-center justify-between gap-4 font-jp-serif font-bold text-sm sm:text-base text-slate-900 tracking-[0.03em] hover:bg-white/95 transition-colors duration-150 cursor-pointer"
                  >
                    <span className="flex items-start sm:items-center gap-3.5">
                      <span className="w-6 h-6 rounded-lg bg-sky-50 border border-sky-100 text-sky-600 font-mono text-xs font-bold flex items-center justify-center shrink-0 mt-0.5 sm:mt-0 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.9)]">
                        Q
                      </span>
                      <span className="leading-snug">{faq.q}</span>
                    </span>
                    <ChevronDown
                      className={`w-4 h-4 text-slate-400 shrink-0 transition-transform duration-200 ${
                        isOpen ? 'rotate-180 text-sky-600' : ''
                      }`}
                    />
                  </button>
                  {isOpen && (
                    <div className="px-5 sm:px-6 pb-5 sm:pb-6 pt-3.5 text-xs sm:text-sm text-slate-600 tracking-[0.02em] leading-[1.9] border-t border-slate-200/60 depth-Well">
                      <div className="flex gap-3.5">
                        <span className="w-6 h-6 rounded-lg bg-slate-200/80 text-slate-700 font-mono text-xs font-bold flex items-center justify-center shrink-0 mt-0.5">
                          A
                        </span>
                        <p className="flex-1 leading-[1.9]">{faq.a}</p>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
