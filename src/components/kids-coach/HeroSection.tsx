'use client';

import React from 'react';
import {
  Search,
  ArrowUpRight,
  ChevronDown,
  MapPin,
  Sparkles,
} from 'lucide-react';

interface HeroSectionProps {
  selectedSport: string;
  setSelectedSport: (sport: string) => void;
  selectedArea: string;
  setSelectedArea: (area: string) => void;
  onSearchClick: () => void;
}

// Taste Skill (Hero Editorial) 準拠：写真を主役にするアシンメトリー＆オーバーラッピング・ヒーローセクション
export default function HeroSection({
  selectedSport,
  setSelectedSport,
  selectedArea,
  setSelectedArea,
  onSearchClick,
}: HeroSectionProps) {
  const sports = [
    { value: 'all', label: 'すべての種目（水泳・かけっこ・体育）' },
    { value: '水泳', label: '水泳（水慣れ・息継ぎ・25m完泳）' },
    { value: 'かけっこ・陸上', label: 'かけっこ・陸上（フォーム・運動会）' },
    { value: '学校体育・逆上がり', label: '学校体育克服（逆上がり・跳び箱・縄跳び）' },
    { value: 'その他・ニッチ競技', label: '専門・ニッチ競技（体操・球技基礎）' },
  ];

  const areas = [
    { value: 'all', label: 'すべてのエリア（東京・神奈川・千葉・埼玉）' },
    { value: '世田谷区', label: '世田谷区（駒沢公園・砧公園周辺）' },
    { value: '目黒区', label: '目黒区（林試の森・碑文谷周辺）' },
    { value: '港区', label: '港区（芝公園・白金・お台場周辺）' },
    { value: '渋谷区', label: '渋谷区（代々木公園・恵比寿周辺）' },
    { value: '中央区', label: '中央区（晴海・月島・浜町周辺）' },
    { value: '江東区', label: '江東区（豊洲・有明・木場周辺）' },
    { value: '千葉・ベイエリア', label: '千葉・ベイエリア（浦安・幕張・市川）' },
    { value: '横浜・川崎エリア', label: '横浜・川崎エリア' },
  ];

  return (
    <section className="relative bg-[#FFFFFF] text-slate-900 border-b border-slate-200/80 min-h-[calc(100svh-4.5rem)] flex items-center py-10 sm:py-14 lg:py-16 overflow-hidden">
      {/* 無彩色ベースの微細なフィルムノイズ（写真のトーンを邪魔しないColor Lock） */}
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 film-noise opacity-60" />

      {/* 背景の繊細な垂直グリッドガイドライン（高級建築・ギャラリー誌の組版ディテール） */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex justify-between opacity-35"
      >
        <div className="w-px h-full bg-slate-200/60" />
        <div className="w-px h-full bg-slate-200/40 hidden lg:block" />
        <div className="w-px h-full bg-slate-200/60" />
      </div>

      <div className="relative z-10 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* アシンメトリー12カラム構成（Split Screen × Overlapping Editorial Grid） */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-0 items-center">
          {/* 左側（5カラム＋右側の写真境界へオーバーラップするタイポグラフィレイヤー） */}
          <div className="lg:col-span-5 lg:pr-4 relative z-20 flex flex-col justify-between space-y-8 min-w-0">
            {/* 極小のエディトリアル・メタタイポグラフィ */}
            <div className="gsap-hero-stagger space-y-2">
              <div className="flex items-center gap-3">
                <span className="font-mono text-[10px] tracking-[0.28em] uppercase text-slate-400">
                  ISSUE NO. 01 — AQUATICS & ATHLETICS
                </span>
                <span className="h-px w-10 bg-slate-300" />
              </div>
              <p className="font-editorial italic text-sm sm:text-base text-slate-500 tracking-[0.16em]">
                Personal Coaching, Right Where They Grow.
              </p>
            </div>

            {/* 写真の左境界線にわずかに重なる（Overlapping Grid）メインコピー塊 */}
            <div className="gsap-hero-stagger lg:-mr-20 xl:-mr-28 bg-white/92 backdrop-blur-xl p-6 sm:p-8 lg:p-9 rounded-xl border border-slate-200/80 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.95),0_24px_48px_-16px_rgba(15,23,42,0.08)] space-y-6">
              {/* メインコピー（文字間隔と行間を贅沢に広げたセリフ体） */}
              <h1 className="font-jp-serif text-2xl sm:text-3xl lg:text-[36px] xl:text-[40px] font-bold text-slate-900 tracking-[0.06em] leading-[1.48] max-w-xl">
                「憧れ」で終わらせない。
                <br />
                来週の「できた！」を、
                <br />
                一番近くで。
              </h1>

              {/* サブコピー（視覚的階層を保つmax-w設定と贅沢な行間） */}
              <p className="text-xs sm:text-sm lg:text-[15px] text-slate-600 tracking-[0.04em] leading-[1.95] max-w-lg">
                有名選手に1回会うよりも、近所の公園で60分じっくり。入会金0円・都度払いで、子どもの苦手を今すぐ笑顔に変える出張マンツーマン。
              </p>

              {/* ミニマル検索バー ＆ メインCTA「コーチを探す」 */}
              <div className="pt-2 space-y-3">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  <div className="min-w-0">
                    <label
                      htmlFor="hero-sport-select"
                      className="block font-mono text-[9px] tracking-[0.22em] uppercase text-slate-400 mb-1"
                    >
                      DISCIPLINE / 種目
                    </label>
                    <div className="relative">
                      <select
                        id="hero-sport-select"
                        value={selectedSport}
                        onChange={(e) => setSelectedSport(e.target.value)}
                        className="w-full max-w-full truncate h-10 pl-3 pr-7 rounded-lg bg-[#F8FAFC] hover:bg-white border border-slate-200/90 text-xs font-semibold text-slate-800 focus:outline-none focus:border-sky-600 transition-colors appearance-none cursor-pointer"
                      >
                        {sports.map((s) => (
                          <option key={s.value} value={s.value}>
                            {s.label}
                          </option>
                        ))}
                      </select>
                      <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                    </div>
                  </div>

                  <div className="min-w-0">
                    <label
                      htmlFor="hero-area-select"
                      className="block font-mono text-[9px] tracking-[0.22em] uppercase text-slate-400 mb-1"
                    >
                      NEIGHBORHOOD / エリア
                    </label>
                    <div className="relative">
                      <select
                        id="hero-area-select"
                        value={selectedArea}
                        onChange={(e) => setSelectedArea(e.target.value)}
                        className="w-full max-w-full truncate h-10 pl-3 pr-7 rounded-lg bg-[#F8FAFC] hover:bg-white border border-slate-200/90 text-xs font-semibold text-slate-800 focus:outline-none focus:border-sky-600 transition-colors appearance-none cursor-pointer"
                      >
                        {areas.map((a) => (
                          <option key={a.value} value={a.value}>
                            {a.label}
                          </option>
                        ))}
                      </select>
                      <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                    </div>
                  </div>
                </div>

                {/* 指定CTAボタン：「コーチを探す」 */}
                <div className="pt-1">
                  <button
                    type="button"
                    onClick={onSearchClick}
                    className="w-full h-12 px-7 rounded-lg bg-sky-600 hover:bg-sky-700 active:scale-[0.98] text-white font-semibold text-sm tracking-[0.12em] flex items-center justify-center gap-2.5 transition-all duration-200 cursor-pointer shadow-[inset_0_1px_0_0_rgba(255,255,255,0.3),0_8px_20px_-6px_rgba(2,132,199,0.45)] group"
                  >
                    <Search className="w-4 h-4" />
                    <span>コーチを探す</span>
                    <ArrowUpRight className="w-4 h-4 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                  </button>
                </div>
              </div>
            </div>

            {/* 下部：極小エディトリアル仕様（余白を活かしたタイポグラフィ） */}
            <div className="gsap-hero-stagger grid grid-cols-3 gap-4 pt-1 border-t border-slate-200/70">
              <div>
                <span className="font-mono text-[9px] tracking-[0.22em] text-slate-400 uppercase block">
                  INITIATION FEE
                </span>
                <span className="font-jp-serif text-sm sm:text-base font-bold text-slate-900 tracking-[0.04em]">
                  入会金・月謝 ¥0
                </span>
              </div>
              <div>
                <span className="font-mono text-[9px] tracking-[0.22em] text-slate-400 uppercase block">
                  SESSION RATE
                </span>
                <span className="font-jp-serif text-sm sm:text-base font-bold text-slate-900 tracking-[0.04em]">
                  60分 ¥5,000〜
                </span>
              </div>
              <div>
                <span className="font-mono text-[9px] tracking-[0.22em] text-slate-400 uppercase block">
                  INSURANCE
                </span>
                <span className="font-jp-serif text-sm sm:text-base font-bold text-slate-900 tracking-[0.04em]">
                  全枠 賠償保険付
                </span>
              </div>
            </div>
          </div>

          {/* 右側（7カラム）：主役となる大判写真フレーム（文字を一切重ねず写真そのものを主役として際立たせる） */}
          <div className="lg:col-span-7 lg:pl-6 relative z-10 min-w-0">
            {/* メイン大判写真：クリッピングマスク展開（.gsap-hero-mask） ＆ ズームアウト（.gsap-hero-photo） ＆ スクロールパララックス（.gsap-parallax-img） */}
            <div className="gsap-hero-mask relative overflow-hidden rounded-xl bg-slate-100 aspect-4/3 sm:aspect-16/11 lg:aspect-6/5 shadow-[0_28px_60px_-20px_rgba(15,23,42,0.16)] border border-slate-200/80 group">
              <img
                src="https://images.unsplash.com/photo-1519315901367-f34ff9154487?auto=format&fit=crop&w=1800&q=85"
                alt="透き通るプールでマンツーマン水泳指導を受け、力強く水を捉えて泳ぐ子ども"
                className="gsap-hero-photo gsap-parallax-img w-full h-[116%] -mt-[8%] object-cover group-hover:scale-[1.02] transition-transform duration-700"
                loading="eager"
              />
            </div>

            {/* 右下アシンメトリー・サブフレーム（コーチとの水慣れ・フォーム対話シーンのレイヤー重なり） */}
            <div className="gsap-hero-stagger hidden sm:block absolute -bottom-5 right-4 lg:-right-3 w-48 lg:w-56 overflow-hidden rounded-xl border-4 border-white bg-slate-100 aspect-4/3 shadow-[0_18px_36px_-10px_rgba(15,23,42,0.2)]">
              <img
                src="https://images.unsplash.com/photo-1576610616656-d3aa5d1f4534?auto=format&fit=crop&w=800&q=85"
                alt="公営プールの澄んだ水面でのプライベート水泳指導"
                className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
                loading="eager"
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
