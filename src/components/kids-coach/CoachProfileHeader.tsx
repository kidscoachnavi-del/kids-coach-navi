'use client';

import React from 'react';
import Link from 'next/link';
import { Coach } from '@/data/kids-coach-mock';
import {
  MapPin,
  ArrowLeft,
  Check,
  Shield,
} from 'lucide-react';

interface CoachProfileHeaderProps {
  coach: Coach;
}

export default function CoachProfileHeader({ coach }: CoachProfileHeaderProps) {
  return (
    <div className="bg-white rounded-3xl border border-[#EADBCC] p-6 sm:p-8 shadow-xs">
      {/* 戻るボタン＆認証ステータス */}
      <div className="flex flex-wrap items-center justify-between gap-2 mb-6 pb-4 border-b border-[#EADBCC]">
        <Link
          href="/#coaches"
          className="inline-flex items-center gap-1.5 text-xs font-bold text-[#5E5B54] hover:text-[#E3644F] transition-colors"
        >
          <ArrowLeft className="w-4 h-4" strokeWidth={1.75} />
          <span>コーチ一覧に戻る</span>
        </Link>
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1.5 text-xs font-bold text-[#3E8E84] bg-[#3E8E84]/10 px-3 py-1 rounded-full">
            <Shield className="w-3.5 h-3.5 text-[#3E8E84]" strokeWidth={1.75} />
            <span>本人確認・安全審査クリア済み</span>
          </span>
        </div>
      </div>

      {/* メインプロフィール情報 */}
      <div className="flex flex-col md:flex-row gap-6 md:gap-8 items-start">
        {/* イニシャルバッジ */}
        <div className="flex flex-col items-center gap-2 mx-auto md:mx-0 shrink-0">
          <div className="relative w-24 h-24 sm:w-28 sm:h-28 rounded-2xl sm:rounded-3xl bg-[#FCE7A2] border border-[#2C2B29]/25 flex items-center justify-center font-heading font-bold text-3xl sm:text-4xl text-[#2C2B29] shadow-2xs">
            {coach.initial || coach.name.charAt(0)}
            <span className="absolute -bottom-1.5 -right-1 bg-[#E3644F] text-white px-2.5 py-0.5 rounded-full text-[10px] font-bold border border-white">
              認定プロ
            </span>
          </div>
        </div>

        {/* テキスト情報 */}
        <div className="flex-1 w-full text-center md:text-left">
          <div className="flex flex-wrap items-center justify-center md:justify-start gap-2 mb-2">
            <span className="text-xs font-bold px-3 py-1 rounded-full bg-[#3E8E84]/10 text-[#3E8E84]">
              #{coach.sports.join('・')}
            </span>
            <span className="inline-flex items-center gap-1.5 bg-[#FCE7A2]/80 px-3 py-1 rounded-full text-xs font-bold text-[#2C2B29]">
              <Check className="w-3.5 h-3.5 text-[#3E8E84] shrink-0" strokeWidth={2.2} />
              <span>1回ごとの単発予約（都度払い）</span>
            </span>
          </div>

          <h1 className="font-heading text-2xl sm:text-3xl font-bold text-[#2C2B29] tracking-tight">
            {coach.name} コーチ
            <span className="ml-2 text-xs sm:text-sm font-sans font-normal text-[#5E5B54]">
              ({coach.kana})
            </span>
          </h1>

          <p className="text-xs sm:text-sm font-bold text-[#5E5B54] mt-1">
            {coach.title}
          </p>

          {/* 指導スペック */}
          <div className="mt-4 grid grid-cols-2 sm:grid-cols-4 gap-3 p-4 rounded-2xl bg-[#FDFBF7] border border-[#EADBCC] text-left">
            <div>
              <span className="text-[11px] font-bold text-[#5E5B54] block">指導料金（税込）</span>
              <span className="font-en text-xl font-extrabold text-[#2C2B29]">
                ¥{coach.hourlyRate.toLocaleString()}
              </span>
              <span className="text-[11px] text-[#5E5B54] block">/ 1コマ{coach.durationMinutes}分</span>
            </div>
            <div>
              <span className="text-[11px] font-bold text-[#5E5B54] block">対象年齢</span>
              <span className="text-xs sm:text-sm font-bold text-[#2C2B29] block mt-1">
                {coach.targetAges}
              </span>
              <span className="text-[11px] text-[#5E5B54] block">個別メニュー作成</span>
            </div>
            <div>
              <span className="text-[11px] font-bold text-[#5E5B54] block">指導スタイル</span>
              <span className="text-xs sm:text-sm font-bold text-[#2C2B29] block mt-1">
                完全マンツーマン
              </span>
              <span className="text-[11px] text-[#5E5B54] block">公園・施設へ出張</span>
            </div>
            <div>
              <span className="text-[11px] font-bold text-[#5E5B54] block">入会金・月会費</span>
              <span className="text-xs sm:text-sm font-bold text-[#E3644F] block mt-1">
                なし（都度払い）
              </span>
              <span className="text-[11px] text-[#5E5B54] block">交通費込みの明朗価格</span>
            </div>
          </div>

          {/* エリア */}
          <div className="mt-3 flex items-center justify-center md:justify-start gap-1.5 text-xs text-[#5E5B54] font-bold">
            <MapPin className="w-3.5 h-3.5 text-[#E3644F] shrink-0" strokeWidth={1.75} />
            <span>
              出張対応エリア: <strong className="text-[#2C2B29]">{coach.areas.join('、')}</strong>
            </span>
          </div>
        </div>
      </div>

      {/* 自己紹介文 */}
      <div className="mt-6 pt-5 border-t border-[#EADBCC]">
        <h2 className="font-heading text-sm font-bold text-[#2C2B29] mb-2.5">
          自己紹介・指導方針
        </h2>
        <div className="bg-[#FDFBF7] p-4 sm:p-5 rounded-2xl border border-[#EADBCC] leading-relaxed text-xs sm:text-sm text-[#5E5B54] whitespace-pre-line">
          {coach.bio}
          {coach.message && coach.message.trim() !== coach.bio.trim() && (
            <div className="mt-3 pt-3 border-t border-[#EADBCC] text-xs font-bold text-[#2C2B29]">
              保護者・お子さまへのメッセージ: 「{coach.message}」
            </div>
          )}
        </div>
      </div>

      {/* 競技実績 & 指導歴（不要な装飾アイコンを省き、タイポグラフィで端正に整理） */}
      <div className="mt-5 grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* 競技実績 */}
        <div className="bg-[#FDFBF7] p-4 rounded-2xl border border-[#EADBCC]">
          <div className="flex items-center justify-between text-xs font-bold text-[#2C2B29] mb-2.5 pb-2 border-b border-[#EADBCC]/70">
            <span>主な競技実績・資格</span>
            <span className="font-en text-[10px] text-[#8A857B] tracking-widest">ACHIEVEMENTS</span>
          </div>
          <ul className="space-y-1.5">
            {coach.achievements.map((item, idx) => (
              <li key={idx} className="text-xs text-[#5E5B54] flex items-start gap-2">
                <Check className="w-3.5 h-3.5 text-[#E3644F] shrink-0 mt-0.5" strokeWidth={2} />
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* 指導歴 */}
        <div className="bg-[#FDFBF7] p-4 rounded-2xl border border-[#EADBCC]">
          <div className="flex items-center justify-between text-xs font-bold text-[#2C2B29] mb-2.5 pb-2 border-b border-[#EADBCC]/70">
            <span>指導歴・実績</span>
            <span className="font-en text-[10px] text-[#8A857B] tracking-widest">EXPERIENCE</span>
          </div>
          <ul className="space-y-1.5">
            {coach.coachingHistory.map((item, idx) => (
              <li key={idx} className="text-xs text-[#5E5B54] flex items-start gap-2">
                <Check className="w-3.5 h-3.5 text-[#3E8E84] shrink-0 mt-0.5" strokeWidth={2} />
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
