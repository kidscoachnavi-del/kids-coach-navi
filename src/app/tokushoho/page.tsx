import React from 'react';
import { Metadata } from 'next';
import Link from 'next/link';
import KidsCoachNavbar from '@/components/kids-coach/Navbar';
import KidsCoachFooter from '@/components/kids-coach/Footer';
import { ArrowLeft } from 'lucide-react';

export const metadata: Metadata = {
  title: '特定商取引法に基づく表記 | キッズコーチナビ by Wellne',
  description: 'キッズコーチナビ by Wellne（運営：株式会社Wellne）の特定商取引法に基づく表記です。',
};

export default function TokushohoPage() {
  const rows = [
    { label: '運営事業者', value: 'SWIM PARTNERS' },
    { label: 'サービス名称', value: 'キッズコーチナビ（Kids Coach Navi）' },
    { label: '所在地・連絡先', value: '東京都内（お問い合わせは本サービス内フォームおよび公式窓口より受け付けております）' },
    {
      label: '販売価格（レッスン料金）',
      value: 'コーチ・レッスンごとに設定された金額（最低5,000円〜／コーチが設定する税込・出張交通費込の料金）。入会金・月会費は無料です。',
    },
    {
      label: '商品代金以外の必要料金',
      value: 'プール等の有料施設を利用される場合の施設入場料のみ実費をご負担いただきます。',
    },
    {
      label: 'お支払い方法・時期',
      value: 'クレジットカード事前決済（Stripe利用）。予約確定時に決済が行われます。',
    },
    {
      label: '役務の提供時期',
      value: 'ご予約確定いただいた指定日時に担当コーチが出張指導を行います。',
    },
    {
      label: 'キャンセル・返金・振替について',
      value: '通常のご変更・キャンセルはレッスン前日正午（12:00）まで無料（全額返金）。屋外レッスンの雨天時は開始2時間前まで無償で別日程へ振替可能です。前日正午以降の自己都合キャンセルは返金対象外となります。',
    },
  ];

  return (
    <div className="min-h-screen bg-[#FDFBF7] text-[#2C2B29] flex flex-col font-sans">
      <KidsCoachNavbar />

      <main className="flex-1 py-8 sm:py-12">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 space-y-6">
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-xs font-bold text-[#5E5B54] hover:text-[#E3644F] transition-colors"
          >
            <ArrowLeft className="w-4 h-4" strokeWidth={1.75} />
            <span>トップページへ戻る</span>
          </Link>

          <article className="bg-white rounded-3xl border border-[#EADBCC] p-6 sm:p-10 shadow-xs space-y-6">
            <header className="border-b border-[#EADBCC] pb-5 space-y-1.5">
              <span className="font-en text-[10px] font-extrabold tracking-widest uppercase text-[#3E8E84] block">
                SPECIFIED COMMERCIAL TRANSACTIONS ACT
              </span>
              <h1 className="font-heading text-xl sm:text-2xl font-bold text-[#2C2B29]">
                特定商取引法に基づく表記
              </h1>
            </header>

            <dl className="divide-y divide-[#EADBCC]/70 text-xs sm:text-sm">
              {rows.map((row) => (
                <div
                  key={row.label}
                  className="py-3.5 grid grid-cols-1 sm:grid-cols-12 gap-1.5 sm:gap-4"
                >
                  <dt className="sm:col-span-4 font-bold text-[#2C2B29]">
                    {row.label}
                  </dt>
                  <dd className="sm:col-span-8 text-[#5E5B54] leading-relaxed">
                    {row.value}
                  </dd>
                </div>
              ))}
            </dl>
          </article>
        </div>
      </main>

      <KidsCoachFooter />
    </div>
  );
}
