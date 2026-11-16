'use client';

import React from 'react';
import CoachCard from './CoachCard';
import { Coach } from '@/data/kids-coach-mock';
import { RotateCcw, MapPin, Activity } from 'lucide-react';

interface CoachListSectionProps {
  coaches: Coach[];
  selectedSport: string;
  setSelectedSport: (sport: string) => void;
  selectedArea: string;
  setSelectedArea: (area: string) => void;
}

export default function CoachListSection({
  coaches,
  selectedSport,
  setSelectedSport,
  selectedArea,
  setSelectedArea,
}: CoachListSectionProps) {
  const filteredCoaches = coaches.filter((coach) => {
    const matchSport =
      selectedSport === 'all' ||
      coach.sports.some((s) => s.includes(selectedSport) || selectedSport.includes(s));

    const matchArea =
      selectedArea === 'all' ||
      coach.areas.some((a) => a.includes(selectedArea) || selectedArea.includes(a));

    return matchSport && matchArea;
  });

  const hasFilter = selectedSport !== 'all' || selectedArea !== 'all';

  const sportTabs = [
    { id: 'all', label: 'すべての種目' },
    { id: 'かけっこ・陸上', label: 'かけっこ・陸上' },
    { id: '学校体育・逆上がり', label: '学校体育（逆上がり・鉄棒）' },
    { id: '水泳', label: '水泳（水慣れ・25m完泳）' },
    { id: 'その他・ニッチ競技', label: '専門・ニッチ競技' },
  ];

  const areaPills = [
    { id: 'all', label: 'すべてのエリア' },
    { id: '世田谷区', label: '世田谷区（駒沢公園等）' },
    { id: '目黒区', label: '目黒区' },
    { id: '港区', label: '港区（芝公園等）' },
    { id: '渋谷区', label: '渋谷区（代々木公園等）' },
    { id: '江東区', label: '江東区（豊洲・木場）' },
    { id: '中央区', label: '中央区' },
    { id: '千葉・ベイエリア', label: '千葉・ベイエリア' },
    { id: '横浜・川崎エリア', label: '横浜・川崎' },
  ];

  return (
    <section
      id="coaches"
      className="relative overflow-hidden py-20 sm:py-24 lg:py-28 retina-mesh-bg border-b border-slate-200/80"
    >
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 film-noise" />

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* セクションヘッダー */}
        <div className="gsap-scroll-reveal flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10">
          <div className="space-y-3">
            <span className="inline-flex items-center px-3.5 py-1.5 rounded-xl depth-card font-mono text-[11px] font-semibold text-sky-700 uppercase tracking-[0.2em]">
              02 / CERTIFIED MENTOR ROSTER
            </span>
            <p className="font-editorial italic text-lg sm:text-2xl text-slate-500 tracking-[0.14em]">
              Verified Professionals Ready to Dispatch to Your Local Park or Pool
            </p>
            <h2 className="font-jp-serif text-2xl sm:text-3xl lg:text-4xl font-bold text-slate-900 tracking-[0.04em] leading-[1.4]">
              「種目 × エリア」で即座に見つかる認定プロコーチ一覧
            </h2>
          </div>

          {/* 該当件数 ＆ 条件リセット */}
          <div className="flex items-center gap-2.5 flex-wrap shrink-0">
            <div className="text-xs font-semibold text-slate-700 depth-card px-4 py-2.5 rounded-xl">
              出張対応可能コーチ:{' '}
              <span className="font-mono text-sky-600 font-bold text-sm">
                {filteredCoaches.length}
              </span>{' '}
              名
            </div>

            {hasFilter && (
              <button
                type="button"
                onClick={() => {
                  setSelectedSport('all');
                  setSelectedArea('all');
                }}
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-700 hover:text-slate-900 depth-card px-3.5 py-2.5 rounded-xl hover:border-slate-300 transition-colors cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>絞り込みを解除する</span>
              </button>
            )}
          </div>
        </div>

        {/* デュアル絞り込みバー（グラスモフィズム＆インナーシャドウ） */}
        <div className="gsap-scroll-reveal depth-card p-5 sm:p-6 rounded-xl mb-10 space-y-4">
          {/* 種目フィルター */}
          <div className="flex flex-col sm:flex-row sm:items-center gap-2.5">
            <span className="text-xs font-bold text-slate-800 tracking-[0.04em] flex items-center gap-1.5 min-w-[100px] shrink-0">
              <Activity className="w-3.5 h-3.5 text-sky-600" />
              <span>種目で絞る:</span>
            </span>
            <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
              {sportTabs.map((tab) => (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setSelectedSport(tab.id)}
                  className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                    selectedSport === tab.id
                      ? 'bg-sky-600 text-white shadow-[inset_0_1px_0_0_rgba(255,255,255,0.35),0_4px_10px_-2px_rgba(2,132,199,0.4)]'
                      : 'bg-white/90 text-slate-600 border border-slate-200/80 hover:border-sky-300 hover:text-slate-900'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          {/* エリアフィルター */}
          <div className="flex flex-col sm:flex-row sm:items-center gap-2.5 pt-3.5 border-t border-slate-200/60">
            <span className="text-xs font-bold text-slate-800 tracking-[0.04em] flex items-center gap-1.5 min-w-[100px] shrink-0">
              <MapPin className="w-3.5 h-3.5 text-sky-600" />
              <span>地域で絞る:</span>
            </span>
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
              {areaPills.map((pill) => (
                <button
                  key={pill.id}
                  type="button"
                  onClick={() => setSelectedArea(pill.id)}
                  className={`px-3 py-1 rounded-lg text-xs font-medium whitespace-nowrap transition-all cursor-pointer ${
                    selectedArea === pill.id
                      ? 'bg-slate-900 text-white shadow-sm'
                      : 'bg-white/90 text-slate-600 border border-slate-200/80 hover:border-slate-300 hover:text-slate-900'
                  }`}
                >
                  {pill.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* コーチカード一覧グリッド */}
        {filteredCoaches.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredCoaches.map((coach) => (
              <CoachCard key={coach.id} coach={coach} />
            ))}
          </div>
        ) : (
          <div className="depth-card rounded-xl p-10 text-center max-w-lg mx-auto">
            <h3 className="font-jp-serif text-base font-bold text-slate-900 mb-2">
              選択された「種目 × エリア」に一致するコーチが見つかりませんでした
            </h3>
            <p className="text-xs text-slate-600 mb-6 leading-[1.8]">
              隣接するエリア（例: 世田谷区・目黒区・渋谷区など）を含めて再検索するか、絞り込み条件を解除してご確認ください。
            </p>
            <button
              type="button"
              onClick={() => {
                setSelectedSport('all');
                setSelectedArea('all');
              }}
              className="px-5 py-2.5 rounded-xl bg-sky-600 text-white text-xs font-semibold hover:bg-sky-700 transition-colors cursor-pointer shadow-sm"
            >
              すべてのコーチを表示する
            </button>
          </div>
        )}
      </div>
    </section>
  );
}
