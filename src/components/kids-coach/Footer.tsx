'use client';

import React from 'react';
import Link from 'next/link';
import { ArrowRight, Check } from 'lucide-react';

interface KidsCoachFooterProps {
  /** コーチ募集CTAバナーを表示するかどうか（一覧系ページのみtrue推奨） */
  showCoachRecruit?: boolean;
}

// 活版調の温かみのある共通フッター＆コーチパートナー案内（過度な装飾アイコン排除）
export default function KidsCoachFooter({
  showCoachRecruit = false,
}: KidsCoachFooterProps) {
  return (
    <>
      {/* 指導者（コーチ）パートナー募集セクション */}
      {showCoachRecruit && (
        <section id="coach-recruit" className="bg-[#FDFBF7] py-12 sm:py-16 border-t border-[#EADBCC]">
        <div className="max-w-5xl mx-auto px-4 sm:px-6">
          <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-8 bg-white rounded-3xl p-6 sm:p-8 border border-[#EADBCC] shadow-xs">
            <div className="space-y-3 max-w-2xl">
              <span className="inline-block px-3 py-1 rounded-full bg-[#3E8E84]/10 text-[11px] font-bold text-[#3E8E84] tracking-wider">
                FOR COACHES ｜ スポーツ指導者・体育大生・元選手の方へ
              </span>
              <h2 className="font-heading text-xl sm:text-2xl font-bold tracking-tight text-[#2C2B29] leading-snug">
                あなたの競技経験で、子どもたちの「できた！」を引き出しませんか？
              </h2>
              <p className="text-xs sm:text-sm text-[#5E5B54] leading-relaxed">
                水泳・かけっこ・体操など、得意種目を活かして空き時間に出張指導。指導料金は自由に設定でき（1コマ5,000円〜・コーチ受取75%）、スケジュールも柔軟に管理できます。
              </p>
              <div className="flex flex-wrap items-center gap-4 pt-1 text-xs font-bold text-[#2C2B29]">
                <span className="inline-flex items-center gap-1.5">
                  <Check className="w-3.5 h-3.5 text-[#3E8E84]" strokeWidth={2} />
                  初期登録費・掲載費 ￥0
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <Check className="w-3.5 h-3.5 text-[#3E8E84]" strokeWidth={2} />
                  レッスン完了後の自動売上振込
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <Check className="w-3.5 h-3.5 text-[#3E8E84]" strokeWidth={2} />
                  シフト・対応エリアを自由設定
                </span>
              </div>
            </div>

            <div className="shrink-0 w-full lg:w-auto">
              <Link
                href="/coach/dashboard"
                className="w-full lg:w-auto inline-flex items-center justify-center gap-2 px-6 py-4 rounded-full bg-[#3E8E84] hover:bg-[#32756d] text-white font-bold text-xs sm:text-sm transition-all shadow-xs"
              >
                <span>コーチ登録・レッスン掲載へ</span>
                <ArrowRight className="w-4 h-4" strokeWidth={1.75} />
              </Link>
            </div>
          </div>
        </div>
        </section>
      )}

      {/* フッター */}
      <footer className="bg-[#2C2B29] text-[#FDFBF7] py-12 border-t border-[#EADBCC]">
        <div className="max-w-5xl mx-auto px-4 sm:px-6">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-8 pb-8 border-b border-white/15">
            <div>
              <div className="flex items-center gap-2.5 mb-2">
                <div className="relative w-6 h-8 shrink-0">
                  <div className="absolute inset-0 bg-[#F7D668] rounded-xs rotate-12" />
                  <div className="absolute top-1 left-1 w-1.5 h-1.5 bg-[#3E8E84] rounded-full" />
                  <div className="absolute top-1 right-1 w-1.5 h-1.5 bg-[#E3644F] rotate-45" />
                  <div className="absolute bottom-1 left-2 w-1.5 h-1.5 bg-[#88C8D8] rounded-xs" />
                </div>
                <span className="font-logo font-bold text-xl tracking-tight">
                  Kids Coach Navi
                </span>
              </div>
              <p className="text-xs text-white/70">
                子ども専門・出張マンツーマンスポーツ指導プラットフォーム「キッズコーチナビ」
              </p>
            </div>

            <div className="flex flex-wrap gap-6 text-xs font-bold text-white/80">
              <Link href="/#about" className="hover:text-[#F7D668] transition-colors">
                選ばれる理由
              </Link>
              <Link href="/#coaches" className="hover:text-[#F7D668] transition-colors">
                コーチ・種目紹介
              </Link>
              <Link href="/#voices" className="hover:text-[#F7D668] transition-colors">
                レッスンイメージ
              </Link>
              <Link href="/#price" className="hover:text-[#F7D668] transition-colors">
                料金・ご利用の流れ
              </Link>
              <Link href="/coach/dashboard" className="hover:text-[#F7D668] transition-colors">
                コーチ登録・レッスン掲載
              </Link>
              <Link href="/chat" className="hover:text-[#F7D668] transition-colors">
                チャット一覧
              </Link>
              <Link href="/faq" className="hover:text-[#F7D668] transition-colors">
                よくある質問
              </Link>
              <Link href="/contact" className="hover:text-[#F7D668] transition-colors">
                お問い合わせ
              </Link>
              <Link href="/terms" className="hover:text-[#F7D668] transition-colors">
                利用規約
              </Link>
              <Link href="/privacy" className="hover:text-[#F7D668] transition-colors">
                プライバシーポリシー
              </Link>
              <Link href="/tokushoho" className="hover:text-[#F7D668] transition-colors">
                特定商取引法に基づく表記
              </Link>
            </div>
          </div>

          <div className="pt-6 flex flex-col sm:flex-row justify-between items-center gap-4 text-xs text-white/60">
            <div>運営事業者：SWIM PARTNERS</div>
            <div className="text-white/75">
              本人確認済コーチによるマンツーマン指導 ／ クレジットカード事前決済
            </div>
            <div className="font-en">&copy; 2026 SWIM PARTNERS. All rights reserved.</div>
          </div>
        </div>
      </footer>
    </>
  );
}
