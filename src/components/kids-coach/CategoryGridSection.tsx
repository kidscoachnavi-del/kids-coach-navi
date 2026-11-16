'use client';

import React from 'react';
import Link from 'next/link';
import { SPORT_CATEGORIES } from '@/data/kids-coach-mock';
import { ArrowRight } from 'lucide-react';

export default function CategoryGridSection() {
  // 建築的・シネマティックな高解像度Unsplashビジュアル
  const categoryMeta: Record<
    string,
    { image: string; enLabel: string; enSub: string }
  > = {
    running: {
      image:
        'https://images.unsplash.com/photo-1552674605-db6ffd4facb5?auto=format&fit=crop&w=1000&q=85',
      enLabel: 'SPRINT & BIOMECHANICS',
      enSub: 'Form Analysis & Acceleration',
    },
    'school-pe': {
      image:
        'https://images.unsplash.com/photo-1526676037777-05a232554f77?auto=format&fit=crop&w=1000&q=85',
      enLabel: 'GYMNASTICS & APPARATUS',
      enSub: 'Horizontal Bar, Vault & Rope',
    },
    swimming: {
      image:
        'https://images.unsplash.com/photo-1530549387789-4c1017266635?auto=format&fit=crop&w=1000&q=85',
      enLabel: 'PRIVATE AQUATICS',
      enSub: 'Water Adaptation to 4 Strokes',
    },
    'niche-sports': {
      image:
        'https://images.unsplash.com/photo-1522163182402-834f871fd851?auto=format&fit=crop&w=1000&q=85',
      enLabel: 'SPECIALIZED DISCIPLINES',
      enSub: 'Acrobatics, Bouldering & Core',
    },
  };

  return (
    <section
      id="categories"
      className="relative overflow-hidden py-20 md:py-28 bg-white border-b border-slate-200/80"
    >
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 film-noise" />

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* セクション見出し（12カラム整列） */}
        <div className="gsap-scroll-reveal flex flex-col lg:flex-row lg:items-end justify-between mb-14 gap-6">
          <div className="space-y-3">
            <span className="inline-flex items-center px-3.5 py-1.5 rounded-xl depth-card font-mono text-[11px] font-semibold text-sky-700 uppercase tracking-[0.2em]">
              04 / CURATED ATHLETIC DISCIPLINES
            </span>
            <p className="font-editorial italic text-lg sm:text-2xl text-slate-500 tracking-[0.14em]">
              Tailored Curriculum for Every Milestone
            </p>
            <h2 className="font-jp-serif text-2xl sm:text-3xl lg:text-4xl font-bold text-slate-900 tracking-[0.04em] leading-[1.4]">
              種目・目的別プログラム
            </h2>
          </div>
          <p className="text-xs sm:text-sm text-slate-600 max-w-md tracking-[0.03em] leading-[1.9]">
            お子様の年齢・現在のつまずき・目標時期に合わせて、専任コーチが60分間の個別カリキュラムをオーダーメイドで設計します。
          </p>
        </div>

        {/* 4カテゴリーグリッド（パララックス画像＋インナーシャドウカード） */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {SPORT_CATEGORIES.map((cat) => {
            const meta = categoryMeta[cat.slug] || categoryMeta.running;
            return (
              <Link
                key={cat.slug}
                href={`/sports/${cat.slug}`}
                className="gsap-scroll-reveal group depth-card rounded-xl overflow-hidden hover:border-sky-300 hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between"
              >
                <div>
                  {/* 写真フレーム（GSAPパララックス対応） */}
                  <div className="relative aspect-16/10 bg-slate-900 overflow-hidden border-b border-slate-200/80">
                    <img
                      src={meta.image}
                      alt={cat.name}
                      className="gsap-parallax-img w-full h-[116%] -mt-[8%] object-cover group-hover:scale-105 transition-transform duration-700"
                      loading="lazy"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950/75 via-slate-900/15 to-transparent pointer-events-none" />
                    <span className="absolute top-3 left-3 text-[10px] font-mono tracking-[0.14em] font-semibold px-2.5 py-1 rounded-md bg-white/90 backdrop-blur-md text-slate-900 shadow-xs">
                      {cat.badge}
                    </span>
                    <div className="absolute bottom-2.5 left-3 right-3 text-white">
                      <div className="font-mono text-[9px] tracking-[0.2em] text-sky-300 uppercase">
                        {meta.enLabel}
                      </div>
                      <div className="font-editorial italic text-xs text-slate-200 tracking-[0.08em]">
                        {meta.enSub}
                      </div>
                    </div>
                  </div>

                  {/* コンテンツ */}
                  <div className="p-5">
                    <h3 className="font-jp-serif text-base sm:text-lg font-bold text-slate-900 mb-2 group-hover:text-sky-600 transition-colors tracking-[0.03em]">
                      {cat.name}
                    </h3>

                    <p className="text-xs text-slate-600 leading-[1.8] tracking-[0.02em] mb-4">
                      {cat.shortDesc}
                    </p>

                    <div className="flex flex-wrap gap-1.5 mb-2">
                      {cat.subCategories.slice(0, 3).map((sub, i) => (
                        <span
                          key={i}
                          className="text-[11px] px-2 py-0.5 rounded-md depth-Well text-slate-700 font-medium"
                        >
                          {sub}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                {/* フッター情報 */}
                <div className="px-5 py-3.5 bg-[#F8FAFC]/90 border-t border-slate-200/70 flex items-center justify-between text-xs">
                  <div>
                    <span className="text-slate-500 text-[11px] block">都度払い 1コマ60分</span>
                    <span className="font-mono font-bold text-slate-900">
                      ¥{cat.priceFrom.toLocaleString()}〜
                    </span>
                  </div>
                  <span className="inline-flex items-center gap-1 font-semibold text-sky-600">
                    <span>プログラム詳細</span>
                    <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                  </span>
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}
