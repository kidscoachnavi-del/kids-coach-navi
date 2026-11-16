'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Menu, X, ArrowUpRight } from 'lucide-react';

interface NavLinkItem {
  href: string;
  label: string;
  mobileLabel?: string;
  tone?: 'default' | 'accent' | 'muted';
}

const NAV_LINKS: NavLinkItem[] = [
  { href: '/#about', label: '選ばれる理由' },
  { href: '/#coaches', label: 'コーチ・種目紹介' },
  { href: '/#voices', label: 'レッスンイメージ', mobileLabel: 'お悩み別レッスンイメージ' },
  { href: '/#price', label: '料金・流れ', mobileLabel: '料金・ご利用の流れ' },
  {
    href: '/chat',
    label: 'チャット',
    mobileLabel: 'チャット一覧（生徒・コーチ）',
    tone: 'accent',
  },
  {
    href: '/coach/dashboard',
    label: 'コーチ登録・掲載',
    mobileLabel: 'コーチ登録・レッスン掲載',
    tone: 'muted',
  },
];

// 自然な活版フォント＆温かみのあるアイボリー調グローバルナビゲーション（不要な装飾アイコン排除）
export default function KidsCoachNavbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 bg-[#FDFBF7]/95 backdrop-blur-md border-b border-[#EADBCC]">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 sm:h-20 flex items-center justify-between gap-3">
        {/* ブランドロゴ（幾何学カードアイコン ＋ Kids Coach Navi by SWIM PARTNERS） */}
        <Link href="/" className="flex items-center gap-2.5 sm:gap-3 group shrink-0 min-w-0">
          <div className="relative w-7 h-9 shrink-0">
            <div className="absolute inset-0 bg-[#F7D668] rounded-md rotate-12 group-hover:rotate-6 transition-transform" />
            <div className="absolute top-1.5 left-1 w-2 h-2 bg-[#3E8E84] rounded-full" />
            <div className="absolute top-1.5 right-1 w-2 h-2 bg-[#E3644F] rotate-45" />
            <div className="absolute bottom-1.5 left-2.5 w-2 h-2 bg-[#88C8D8] rounded-xs" />
          </div>
          <div className="min-w-0">
            <span className="font-logo font-bold text-lg sm:text-xl xl:text-2xl tracking-tight text-[#2C2B29] block leading-none whitespace-nowrap">
              Kids Coach Navi
            </span>
            <span className="text-[10px] xl:text-xs text-[#5E5B54] font-bold tracking-wider block mt-0.5 whitespace-nowrap">
              キッズコーチナビ by SWIM PARTNERS
            </span>
          </div>
        </Link>

        {/* PCナビゲーション（lg以上で1行横並び・折り返し禁止） */}
        <nav className="hidden lg:flex items-center gap-4 xl:gap-6 text-xs xl:text-sm font-bold text-[#2C2B29]">
          {NAV_LINKS.map((item) => {
            const toneClass =
              item.tone === 'accent'
                ? 'text-[#3E8E84] hover:text-[#2C2B29]'
                : item.tone === 'muted'
                ? 'text-[#5E5B54] hover:text-[#2C2B29]'
                : 'hover:text-[#E3644F]';
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`${toneClass} transition-colors whitespace-nowrap`}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>

        {/* 右側CTA ＆ タブレット/モバイルメニューボタン */}
        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          <Link
            href="/#coaches"
            className="hidden sm:inline-flex items-center gap-1.5 bg-[#E3644F] hover:bg-[#d05540] text-white text-xs font-bold px-3.5 xl:px-4 py-2 xl:py-2.5 rounded-full shadow-xs transition-all whitespace-nowrap shrink-0"
          >
            <span>空き枠から探す</span>
            <ArrowUpRight className="w-3.5 h-3.5 shrink-0" strokeWidth={1.75} />
          </Link>

          <button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="メニューを開く"
            aria-expanded={mobileMenuOpen}
            className="w-10 h-10 rounded-full border border-[#2C2B29]/30 flex lg:hidden items-center justify-center hover:bg-[#FCE7A2]/60 transition-colors cursor-pointer shrink-0"
          >
            {mobileMenuOpen ? (
              <X className="w-5 h-5 text-[#2C2B29]" strokeWidth={1.75} />
            ) : (
              <Menu className="w-5 h-5 text-[#2C2B29]" strokeWidth={1.75} />
            )}
          </button>
        </div>
      </div>

      {/* タブレット・モバイル用ドロワーメニュー（lg未満） */}
      {mobileMenuOpen && (
        <div className="lg:hidden bg-[#FDFBF7] border-b border-[#EADBCC] px-4 py-4 space-y-1.5">
          {NAV_LINKS.map((item) => {
            const toneClass =
              item.tone === 'accent'
                ? 'text-[#3E8E84]'
                : item.tone === 'muted'
                ? 'text-[#5E5B54]'
                : 'text-[#2C2B29]';
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setMobileMenuOpen(false)}
                className={`block py-2 px-3 rounded-xl font-bold text-sm ${toneClass} hover:bg-[#FCE7A2]/40`}
              >
                {item.mobileLabel || item.label}
              </Link>
            );
          })}
          <Link
            href="/#coaches"
            onClick={() => setMobileMenuOpen(false)}
            className="sm:hidden mt-2 py-2.5 px-4 rounded-full bg-[#E3644F] text-white font-bold text-xs flex items-center justify-center gap-1.5"
          >
            <span>空き枠から探す</span>
            <ArrowUpRight className="w-3.5 h-3.5" strokeWidth={1.75} />
          </Link>
        </div>
      )}
    </header>
  );
}
