'use client';

import React from 'react';
import { Clock, HeartHandshake, MapPin, Wallet, Check, X, ArrowRight } from 'lucide-react';

export default function PainPointsSection() {
  const personaPains = [
    {
      icon: Clock,
      code: 'ISSUE 01 / WAITING PARADOX',
      tag: '集団スクールの限界',
      title: '「待ち時間」ばかりで進級が停滞している',
      quotes: [
        '60分のうち、順番待ちばかりで実際に泳ぐ・走る時間がわずか数分しかない',
        '同じ級の進級テストで何ヶ月も落ち続け、子どもの自己肯定感が下がっている',
      ],
      solution: '60分間ずっと1対1。集団の3〜4倍の実技量でつまずきの原因をその場で解消します。',
    },
    {
      icon: HeartHandshake,
      code: 'ISSUE 02 / PSYCHOLOGICAL SAFETY',
      tag: '苦手意識・短期克服',
      title: '運動が苦手・水が怖い、周りの目が気になる',
      quotes: [
        '集団クラスのペースに馴染めず、無理強いされるのを嫌がる',
        '運動会前のかけっこや、鉄棒・逆上がりのテスト前だけ短期集中で克服させたい',
      ],
      solution: 'お子様の性格やペースに完全オーダーメイド。1回ごとの単発予約・都度払いでご利用いただけます。',
    },
    {
      icon: MapPin,
      code: 'ISSUE 03 / ZERO COMMUTE',
      tag: '共働き世帯の送迎負担',
      title: '毎週の習い事送迎で休日が潰れてしまう',
      quotes: [
        '遠くの指定スクールへ毎週往復送迎する時間的・体力的余裕がない',
        '自宅近くの公園や、普段使い慣れた地域の公営プールで受講させたい',
      ],
      solution: 'ご自宅近くの公園・広場・公営プールへプロコーチが直行。移動拘束ゼロへ。',
    },
    {
      icon: Wallet,
      code: 'ISSUE 04 / TRANSPARENT PRICING',
      tag: '固定費・初期費用の無駄',
      title: '高額な入会金や毎月の固定月謝に縛られたくない',
      quotes: [
        '入会金・年会費・指定ユニフォーム代だけで数万円かかるのが負担',
        '体調不良や家族予定で休んだ分の振替消化に毎月追われている',
      ],
      solution: '入会金・月会費・指定着代すべて0円。受けたい時だけ1回5,000円〜の都度払いです。',
    },
  ];

  const comparisons = [
    {
      metric: '60分間の実質運動時間',
      groupSchool: '約5〜8分（大半が列に並ぶ順番待ち）',
      kidsCoach: '約50〜55分（専任コーチと常時実践・反復）',
      advantage: '3-4X DENSITY / 練習密度 3〜4倍',
    },
    {
      metric: 'カリキュラム・指導法',
      groupSchool: '15〜20名一律の進行（個人の癖までは見きれない）',
      kidsCoach: '骨格・フォーム・恐怖心に合わせた完全個別プログラム',
      advantage: 'BESPOKE / 最短1回で変化を実感',
    },
    {
      metric: '初期費用・月額固定費',
      groupSchool: '入会金1万円＋月謝8,000〜12,000円＋指定教材費',
      kidsCoach: '入会金0円・月会費0円（1コマ5,000円〜の完全都度払い）',
      advantage: 'NO RETAINER / 固定費リスク 0円',
    },
    {
      metric: '受講場所・送迎負担',
      groupSchool: '指定施設へ毎週決まった曜日に保護者が往復送迎',
      kidsCoach: '近所の公園・公営プールへコーチが出張（日程も毎回自由）',
      advantage: 'CONCIERGE / 送迎時間を大幅削減',
    },
  ];

  return (
    <section
      id="comparison"
      className="relative overflow-hidden py-20 sm:py-24 lg:py-28 bg-white border-b border-slate-200/80"
    >
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 film-noise" />

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-14">
        {/* セクション見出し（12カラム整列・贅沢な字間と行間） */}
        <div className="gsap-scroll-reveal grid grid-cols-1 lg:grid-cols-12 gap-8 items-end">
          <div className="lg:col-span-7 space-y-3">
            <span className="inline-flex items-center px-3.5 py-1.5 rounded-xl depth-card font-mono text-[11px] font-semibold text-sky-700 uppercase tracking-[0.2em]">
              01 / THE ARCHITECTURE OF 60 MINUTES
            </span>
            <p className="font-editorial italic text-lg sm:text-2xl text-slate-500 tracking-[0.14em]">
              Why Traditional Group Lessons Stall — And How 1-on-1 Coaching Unlocks Potential
            </p>
            <h2 className="font-jp-serif text-2xl sm:text-3xl lg:text-4xl font-bold text-slate-900 tracking-[0.04em] leading-[1.45]">
              子育て・共働き世帯が抱える「4つの切実な悩み」を、<br className="hidden sm:inline" />
              マンツーマン出張指導で根本から解決します。
            </h2>
          </div>
          <div className="lg:col-span-5">
            <p className="text-xs sm:text-sm text-slate-600 tracking-[0.03em] leading-[1.9]">
              「毎週通わせているのに上達しない」「送迎と固定月謝ばかり負担が大きい」。
              従来の集団スクール構造が抱える時間的・金銭的ロスを、1対1の直行直帰モデルで解消します。
            </p>
          </div>
        </div>

        {/* 4つのペルソナ悩み＆解決カード（2x2グリッド・立体インナーシャドウ） */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {personaPains.map((item, idx) => {
            const Icon = item.icon;
            return (
              <div
                key={idx}
                className="gsap-scroll-reveal depth-card rounded-xl p-6 sm:p-7 flex flex-col justify-between space-y-5"
              >
                <div className="space-y-3.5">
                  <div className="flex items-center justify-between gap-2">
                    <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-700 bg-white/90 px-3 py-1 rounded-lg border border-slate-200/80 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.9)]">
                      <Icon className="w-3.5 h-3.5 text-sky-600" />
                      <span>{item.tag}</span>
                    </span>
                    <span className="font-mono text-[10px] tracking-[0.16em] text-slate-400 uppercase">
                      {item.code}
                    </span>
                  </div>

                  <h3 className="font-jp-serif text-base sm:text-xl font-bold text-slate-900 tracking-[0.03em]">
                    {item.title}
                  </h3>

                  <ul className="space-y-2 depth-Well p-4 rounded-xl">
                    {item.quotes.map((q, qIdx) => (
                      <li
                        key={qIdx}
                        className="text-xs sm:text-sm text-slate-600 flex items-start gap-2 tracking-[0.02em] leading-[1.8]"
                      >
                        <span className="text-slate-400 font-bold shrink-0">―</span>
                        <span>「{q}」</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="pt-2 flex items-start gap-2.5 text-xs sm:text-sm font-semibold text-slate-900 tracking-[0.02em]">
                  <ArrowRight className="w-4 h-4 text-sky-600 shrink-0 mt-0.5" />
                  <span>{item.solution}</span>
                </div>
              </div>
            );
          })}
        </div>

        {/* 60分間の運動密度比較ダイアグラム ＋ 比較テーブル */}
        <div className="gsap-scroll-reveal grid grid-cols-1 lg:grid-cols-12 gap-7 items-stretch">
          {/* 左側（5列）：60分間のタイムパフォーマンス比較ダイアグラム */}
          <div className="lg:col-span-5 depth-card rounded-xl p-6 sm:p-7 flex flex-col justify-between space-y-5">
            <div>
              <span className="font-mono text-[10px] font-bold text-sky-600 uppercase tracking-[0.2em] block mb-1.5">
                TIME DENSITY ANALYSIS
              </span>
              <h3 className="font-jp-serif text-base sm:text-xl font-bold text-slate-900 tracking-[0.03em]">
                1コマ60分あたりの「実質運動時間」の違い
              </h3>
              <p className="text-xs text-slate-600 mt-2 tracking-[0.02em] leading-[1.8]">
                集団指導では生徒15〜20名に対してコーチ1名のため、8割以上が「列に並ぶ待ち時間」になります。
              </p>
            </div>

            <div className="space-y-4">
              {/* 集団スクールバー */}
              <div className="depth-Well p-4 rounded-xl space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-slate-600">一般的な集団スクール（60分）</span>
                  <span className="font-mono font-bold text-slate-700">ACTIVE: ~8 MIN</span>
                </div>
                <div className="w-full h-7 rounded-lg overflow-hidden flex text-[10px] font-semibold shadow-inner">
                  <div className="w-[17%] bg-slate-200 text-slate-600 flex items-center justify-center border-r border-white">
                    体操
                  </div>
                  <div className="w-[70%] bg-slate-100 text-slate-500 flex items-center justify-center border-r border-white">
                    順番待ち・待機（約42分）
                  </div>
                  <div className="w-[13%] bg-slate-400 text-white flex items-center justify-center">
                    8分
                  </div>
                </div>
              </div>

              {/* キッズコーチナビバー */}
              <div className="bg-white p-4 rounded-xl border border-sky-200/90 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.9),0_4px_14px_-4px_rgba(2,132,199,0.12)] space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-slate-900">キッズコーチナビ（60分）</span>
                  <span className="font-mono font-bold text-sky-600">ACTIVE: ~50 MIN (4X)</span>
                </div>
                <div className="w-full h-7 rounded-lg overflow-hidden flex text-[10px] font-semibold">
                  <div className="w-[8%] bg-sky-100 text-sky-800 flex items-center justify-center border-r border-white">
                    5分
                  </div>
                  <div className="w-[84%] bg-sky-600 text-white flex items-center justify-center border-r border-white shadow-[inset_0_1px_0_0_rgba(255,255,255,0.3)]">
                    専任マンツーマン実技・フォーム修正（約50分）
                  </div>
                  <div className="w-[8%] bg-sky-100 text-sky-800 flex items-center justify-center">
                    5分
                  </div>
                </div>
              </div>
            </div>

            <div className="text-[11px] text-slate-600 depth-Well px-4 py-3 rounded-xl leading-relaxed">
              1回60分で集団スクールの1ヶ月分（4回分）に相当する練習密度とフィードバックを得られます。
            </div>
          </div>

          {/* 右側（7列）：構造比較テーブル */}
          <div className="lg:col-span-7 depth-card rounded-xl overflow-hidden flex flex-col">
            <div className="grid grid-cols-12 bg-[#F8FAFC]/90 p-4 border-b border-slate-200/80 text-xs font-bold text-slate-700 tracking-[0.04em]">
              <div className="col-span-3">比較項目</div>
              <div className="col-span-4 text-slate-500">大手集団スクール</div>
              <div className="col-span-5 text-sky-600">キッズコーチナビ（出張個別）</div>
            </div>

            <div className="divide-y divide-slate-200/60 flex-1 flex flex-col justify-between bg-white/80">
              {comparisons.map((row, idx) => (
                <div key={idx} className="grid grid-cols-12 p-4 text-xs items-center gap-2 flex-1">
                  <div className="col-span-3 font-bold text-slate-900 tracking-[0.02em]">
                    {row.metric}
                  </div>
                  <div className="col-span-4 text-slate-600 flex items-start gap-1.5 leading-relaxed">
                    <X className="w-3.5 h-3.5 text-slate-400 shrink-0 mt-0.5" />
                    <span>{row.groupSchool}</span>
                  </div>
                  <div className="col-span-5 text-slate-900 font-medium flex items-start gap-1.5 leading-relaxed">
                    <Check className="w-4 h-4 text-sky-600 shrink-0 mt-0.5" />
                    <div>
                      <div className="font-semibold">{row.kidsCoach}</div>
                      <span className="font-mono text-[10px] font-bold text-sky-700 bg-sky-50 px-2 py-0.5 rounded border border-sky-200/80 inline-block mt-1">
                        {row.advantage}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
