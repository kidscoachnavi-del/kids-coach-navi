'use client';

import React from 'react';
import Link from 'next/link';
import { MapPin, ChevronRight, ShieldCheck, Calendar } from 'lucide-react';
import { Coach, generateMockSlots } from '@/data/kids-coach-mock';

interface CoachCardProps {
  coach: Coach;
  /** 1名のみの表示時など、横長2カラムレイアウトにする場合に指定 */
  wide?: boolean;
}

/** YYYY-MM-DD を M/D 形式に変換する */
function formatShortDate(dateStr: string): string {
  const parts = dateStr.split('-');
  if (parts.length !== 3) return dateStr;
  return `${Number(parts[1])}/${Number(parts[2])}`;
}

export default function CoachCard({ coach, wide = false }: CoachCardProps) {
  const upcomingSlots = generateMockSlots(coach.id)
    .filter((slot) => slot.status === 'available')
    .slice(0, 3);

  return (
    <article
      className={`bg-white rounded-3xl border border-[#EADBCC] hover:border-[#E3644F] transition-all duration-200 flex overflow-hidden group shadow-xs ${
        wide ? 'flex-col md:flex-row' : 'flex-col'
      }`}
    >
      {/* プロフィール・料金ブロック */}
      <div
        className={`p-5 sm:p-6 ${
          wide ? 'md:w-[54%] md:border-r md:border-[#EADBCC]/70 flex flex-col justify-between gap-4' : 'pb-4'
        }`}
      >
        <div className="flex gap-4 items-start">
          {/* イニシャルアバター */}
          <div className="relative shrink-0">
            <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-[#FCE7A2] border border-[#2C2B29]/20 flex items-center justify-center font-heading font-bold text-xl text-[#2C2B29]">
              {coach.initial || coach.name.charAt(0)}
            </div>
          </div>

          {/* 名前・肩書き・認定ステータス */}
          <div className="flex-1 min-w-0">
            <div className="flex flex-wrap items-center gap-1.5 mb-1.5">
              {coach.isVerified && (
                <span className="inline-flex items-center gap-1 text-[10px] font-bold text-[#3E8E84] bg-[#D2E7DF]/55 px-2.5 py-0.5 rounded-full">
                  <ShieldCheck className="w-3 h-3 shrink-0" strokeWidth={2} />
                  <span>本人確認済み</span>
                </span>
              )}
              <span className="text-[10px] font-bold text-[#5E5B54] bg-[#FDFBF7] border border-[#EADBCC] px-2 py-0.5 rounded-full">
                対象: {coach.targetAges}
              </span>
            </div>

            <h3 className="font-heading font-bold text-[#2C2B29] text-base sm:text-lg truncate group-hover:text-[#E3644F] transition-colors">
              {coach.name} コーチ
            </h3>
            <p className="text-xs text-[#5E5B54] line-clamp-1 mt-0.5 font-bold">
              {coach.title}
            </p>

            {/* 料金 */}
            <div className="mt-2.5 flex flex-wrap items-baseline gap-x-1.5 gap-y-0.5 text-xs">
              <span className="font-en text-lg sm:text-xl font-extrabold text-[#2C2B29]">
                ￥{coach.hourlyRate.toLocaleString()}
              </span>
              <span className="text-[#5E5B54]">/ {coach.durationMinutes}分</span>
              <span className="text-[10px] font-bold text-[#3E8E84] bg-[#D2E7DF]/40 px-2 py-0.5 rounded-full">
                税込・交通費込
              </span>
            </div>
          </div>
        </div>

        {/* 横長カード時は自己紹介メッセージも表示 */}
        {wide && (
          <p className="text-xs text-[#5E5B54] leading-relaxed bg-[#FDFBF7] p-3.5 rounded-2xl border border-[#EADBCC]/80">
            {coach.bio}
          </p>
        )}
      </div>

      {/* 得意分野・空き枠・CTAブロック */}
      <div className={`flex flex-col justify-between flex-1 ${wide ? 'bg-[#FDFBF7]/70' : ''}`}>
        <div
          className={`px-5 sm:px-6 py-4 space-y-3 flex-1 ${
            wide ? '' : 'bg-[#FDFBF7] border-t border-b border-[#EADBCC]/70'
          }`}
        >
          {/* 得意分野タグ */}
          <div className="flex flex-wrap gap-1.5">
            {coach.specialties.slice(0, wide ? 4 : 3).map((spec, i) => (
              <span
                key={i}
                className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-white text-[#2C2B29] border border-[#EADBCC]"
              >
                #{spec}
              </span>
            ))}
          </div>

          {/* 対応エリア */}
          <div className="flex items-start gap-1.5 text-xs text-[#5E5B54] font-bold">
            <MapPin className="w-3.5 h-3.5 text-[#3E8E84] shrink-0 mt-0.5" strokeWidth={1.75} />
            <span className="leading-snug">
              対応エリア: {coach.areas.join('・')}
            </span>
          </div>

          {/* 直近の空き枠 */}
          {upcomingSlots.length > 0 && (
            <div className="space-y-1.5 pt-0.5">
              <span className="inline-flex items-center gap-1 text-[10px] font-bold text-[#8A857B]">
                <Calendar className="w-3 h-3 text-[#E3644F]" strokeWidth={1.75} />
                <span>直近の空き枠（日程相談可）</span>
              </span>
              <div className="flex flex-wrap gap-1.5">
                {upcomingSlots.map((slot) => (
                  <span
                    key={slot.id}
                    className="px-2 py-1 rounded-lg bg-white border border-[#EADBCC] text-[10px] font-bold font-en text-[#2C2B29]"
                  >
                    {formatShortDate(slot.date)}({slot.dayOfWeek}) {slot.startTime}〜
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* ボタン */}
        <div className={`p-4 sm:p-5 ${wide ? 'pt-0 sm:pt-0' : 'bg-white mt-auto'}`}>
          <Link
            href={`/coaches/${coach.id}`}
            className="w-full py-2.5 sm:py-3 px-4 rounded-xl font-bold text-xs bg-[#3E8E84] hover:bg-[#32756d] text-white transition-all flex items-center justify-center gap-1.5 shadow-2xs"
          >
            <span>空き枠・詳細を見る</span>
            <ChevronRight className="w-3.5 h-3.5" strokeWidth={1.75} />
          </Link>
        </div>
      </div>
    </article>
  );
}
