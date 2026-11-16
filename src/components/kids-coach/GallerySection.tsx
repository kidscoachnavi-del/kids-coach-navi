'use client';

import React from 'react';
import Link from 'next/link';
import { ArrowUpRight, Compass, Sparkles } from 'lucide-react';

// 建築・モノクロ・ミニマルアート＆アスレチック空間を展示するプレミアム・ギャラリーセクション
export default function GallerySection() {
  const archivePlates = [
    {
      id: 'PLATE 01',
      enTitle: 'ARCHITECTURAL AQUATICS — HYDRODYNAMIC FORM',
      jpTitle: '水面の幾何学と、恐怖心を溶かすマンツーマン水泳指導',
      location: 'MINATO / SHIBUYA MUNICIPAL AQUATIC ARENA',
      caption:
        'Designing quiet confidence in the water. Without the noise of waiting lines, 60 minutes of uninterrupted biomechanical guidance transforms hesitation into effortless propulsion.',
      jpCaption:
        '順番待ちの喧騒を離れた公営プールで、呼吸のリズムと浮力の感覚を1対1で丁寧に調律。水を怖がっていた子どもが、自らの推進力を発見する60分。',
      image:
        'https://images.unsplash.com/photo-1576610616656-d3aa5d1f4534?auto=format&fit=crop&w=1400&q=85',
      span: 'lg:col-span-7',
      aspect: 'aspect-16/10',
      href: '/sports/swimming',
    },
    {
      id: 'PLATE 02',
      enTitle: 'MONOCHROME KINETICS — SPRINT BIOMECHANICS',
      jpTitle: '光と影のトラックで磨く、接地と推進のフォーム解析',
      location: 'SETAGAYA / KOMAZAWA OLYMPIC PARK',
      caption:
        'Precision ground contact and arm-swing geometry. Every stride is analyzed in real time to unlock natural acceleration.',
      jpCaption:
        '地面を捉える角度と腕振りの軌道を分解。感覚論ではなく、身体の構造に沿った走り方の原理を遊びの中で体得します。',
      image:
        'https://images.unsplash.com/photo-1461896836934-ffe607ba8211?auto=format&fit=crop&w=1200&q=85',
      span: 'lg:col-span-5',
      aspect: 'aspect-16/10 lg:aspect-4/3',
      href: '/sports/running',
    },
    {
      id: 'PLATE 03',
      enTitle: 'MINIMALIST APPARATUS — SPATIAL EQUILIBRIUM',
      jpTitle: '鉄棒・跳び箱の恐怖を分解する、構造的ステップワーク',
      location: 'MEGURO / URBAN SANCTUARY PARK',
      caption:
        'Overcoming gravity through structured micro-steps. Turning the apparatus from an obstacle into an instrument of self-efficacy.',
      jpCaption:
        '逆上がりや跳び箱の「できない理由」を重心と回転軸から紐解き、小さな成功体験を重ねて自己肯定感を劇的に引き上げます。',
      image:
        'https://images.unsplash.com/photo-1517649763962-0c623066013b?auto=format&fit=crop&w=1200&q=85',
      span: 'lg:col-span-5',
      aspect: 'aspect-16/10 lg:aspect-4/3',
      href: '/sports/school-pe',
    },
    {
      id: 'PLATE 04',
      enTitle: 'URBAN PAVILION — BESPOKE ATHLETIC SANCTUARY',
      jpTitle: '送迎という拘束から解放された、日常の中のプライベートアリーナ',
      location: 'TOYOSU / HARUMI WATERFRONT PROMENADE',
      caption:
        'Transforming familiar neighborhood landscapes into private athletic studios. Zero commute, zero initiation fees, pure focus.',
      jpCaption:
        '見慣れた近所の公園や水辺の広場が、専任コーチの到着とともに最良のプライベートスタジオへと変わります。',
      image:
        'https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=1400&q=85',
      span: 'lg:col-span-7',
      aspect: 'aspect-16/10',
      href: '/sports/niche-sports',
    },
  ];

  return (
    <section
      id="gallery"
      className="relative overflow-hidden py-20 sm:py-28 retina-mesh-bg border-b border-slate-200/80"
    >
      {/* 背景アンビエントレイヤー＆ノイズ */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute top-12 left-1/4 w-[540px] h-[540px] rounded-full bg-sky-400/10 blur-[130px]"
      />
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 film-noise" />

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-14">
        {/* ギャラリーヘッダー（12カラム整列・贅沢な字間と行間） */}
        <div className="gsap-scroll-reveal grid grid-cols-1 lg:grid-cols-12 gap-8 items-end">
          <div className="lg:col-span-7 space-y-3">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl depth-card text-[11px] font-mono tracking-[0.2em] uppercase text-sky-700">
              <span>03 / CURATED VISUAL ARCHIVE</span>
            </div>
            <p className="font-editorial italic text-lg sm:text-2xl text-slate-500 tracking-[0.14em]">
              Architectural Spaces & The Aesthetics of Human Movement
            </p>
            <h2 className="font-jp-serif text-2xl sm:text-3xl lg:text-4xl font-bold text-slate-900 tracking-[0.05em] leading-[1.45]">
              都市の建築と自然光の中で、
              <br className="hidden sm:inline" />
              子どもの身体能力が覚醒する瞬間。
            </h2>
          </div>

          <div className="lg:col-span-5 space-y-2">
            <p className="font-editorial text-xs sm:text-sm text-slate-500 tracking-[0.08em] leading-[1.8] italic">
              “True athletic mastery does not happen in a crowded waiting line. It emerges in quiet, focused dialogue between mentor and child.”
            </p>
            <p className="text-xs sm:text-sm text-slate-600 tracking-[0.03em] leading-[1.85]">
              私たちが提供するのは単なるスポーツの練習時間ではありません。選び抜かれた指導者と1対1で向き合い、「自分の身体を自在に操れる喜び」を刻む特別な体験です。
            </p>
          </div>
        </div>

        {/* アシンメトリー・エディトリアルギャラリーグリッド（7:5 / 5:7） */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-7">
          {archivePlates.map((plate) => (
            <Link
              key={plate.id}
              href={plate.href}
              className={`gsap-scroll-reveal ${plate.span} group depth-card rounded-xl overflow-hidden flex flex-col justify-between transition-all duration-300 hover:border-sky-300/90`}
            >
              {/* パララックス画像フレーム */}
              <div className={`relative overflow-hidden ${plate.aspect} bg-slate-900`}>
                <img
                  src={plate.image}
                  alt={plate.enTitle}
                  className="gsap-parallax-img w-full h-[118%] -mt-[9%] object-cover filter contrast-[1.04] group-hover:scale-[1.04] transition-transform duration-700"
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-slate-950/20 to-transparent pointer-events-none" />

                {/* 上部メタプレート */}
                <div className="absolute top-4 left-4 right-4 flex items-center justify-between gap-2">
                  <span className="depth-card-dark px-3 py-1 rounded-lg font-mono text-[10px] tracking-[0.2em] text-white uppercase">
                    {plate.id}
                  </span>
                  <span className="bg-white/85 backdrop-blur-md border border-white/70 px-3 py-1 rounded-lg font-mono text-[10px] tracking-[0.14em] text-slate-800 uppercase shadow-xs">
                    {plate.location}
                  </span>
                </div>

                {/* 下部英語エディトリアルタイトル */}
                <div className="absolute bottom-4 left-4 right-4 flex items-end justify-between gap-4 text-white">
                  <div>
                    <p className="font-mono text-[10px] tracking-[0.2em] text-sky-300 uppercase mb-1">
                      {plate.enTitle}
                    </p>
                    <h3 className="font-jp-serif text-base sm:text-xl font-bold tracking-[0.04em] leading-snug">
                      {plate.jpTitle}
                    </h3>
                  </div>
                  <div className="w-9 h-9 rounded-lg bg-white/90 backdrop-blur-md text-slate-900 group-hover:bg-sky-600 group-hover:text-white flex items-center justify-center shrink-0 transition-colors duration-200 shadow-sm">
                    <ArrowUpRight className="w-4 h-4" />
                  </div>
                </div>
              </div>

              {/* カード下部：日英バイリンガル・エディトリアル解説 */}
              <div className="p-5 sm:p-6 space-y-3 bg-white/75 backdrop-blur-xl">
                <p className="font-editorial italic text-xs sm:text-sm text-slate-500 tracking-[0.06em] leading-[1.75]">
                  {plate.caption}
                </p>
                <p className="text-xs sm:text-sm text-slate-700 tracking-[0.03em] leading-[1.85] border-t border-slate-200/70 pt-3">
                  {plate.jpCaption}
                </p>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
