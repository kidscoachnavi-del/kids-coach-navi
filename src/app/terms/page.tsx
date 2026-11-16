import React from 'react';
import { Metadata } from 'next';
import Link from 'next/link';
import KidsCoachNavbar from '@/components/kids-coach/Navbar';
import KidsCoachFooter from '@/components/kids-coach/Footer';
import { ArrowLeft } from 'lucide-react';

export const metadata: Metadata = {
  title: '利用規約 | キッズコーチナビ',
  description: 'キッズコーチナビ（運営：SWIM PARTNERS）の利用規約です。',
};

export default function TermsPage() {
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

          <article className="bg-white rounded-3xl border border-[#EADBCC] p-6 sm:p-10 shadow-xs space-y-6 text-xs sm:text-sm leading-relaxed text-[#5E5B54]">
            <header className="border-b border-[#EADBCC] pb-5 space-y-1.5">
              <span className="font-en text-[10px] font-extrabold tracking-widest uppercase text-[#3E8E84] block">
                TERMS OF SERVICE
              </span>
              <h1 className="font-heading text-xl sm:text-2xl font-bold text-[#2C2B29]">
                キッズコーチナビ 利用規約
              </h1>
              <p className="text-[11px] text-[#8A857B]">運営事業者：SWIM PARTNERS</p>
            </header>

            <section className="space-y-2">
              <h2 className="font-heading text-base font-bold text-[#2C2B29]">第1条（適用・目的）</h2>
              <p>
                本規約は、SWIM PARTNERS（以下「当社」といいます）が運営する出張個別スポーツ指導マッチングサービス「キッズコーチナビ」（以下「本サービス」といいます）の利用条件を定めるものです。保護者様および認定コーチは、本規約に同意の上で本サービスを利用するものとします。
              </p>
            </section>

            <section className="space-y-2">
              <h2 className="font-heading text-base font-bold text-[#2C2B29]">第2条（認定コーチの登録・審査）</h2>
              <p>
                コーチとしての登録希望者は、公開プロフィール用顔写真の登録、登録時のリアルタイムカメラ撮影、および Stripe Connect を用いた本人確認・振込口座連携を完了し、当社の目視審査を通過する必要があります。虚偽の申告が判明した場合、当社は即時にアカウントを停止します。
              </p>
            </section>

            <section className="space-y-2">
              <h2 className="font-heading text-base font-bold text-[#2C2B29]">第3条（予約・決済・直接取引の禁止）</h2>
              <p>
                1. 受講料金はすべて事前クレジットカード決済（Stripe利用）とし、レッスン当日の現金手渡しは禁止します。<br />
                2. 本サービスを通じて知り合った保護者様およびコーチは、当社を介さずに直接金銭の授受または直接契約（中抜き行為）を行ってはならず、電話番号・SNSアカウント・メールアドレス等の個人連絡先の交換も専用チャット上では原則禁止とします。
              </p>
            </section>

            <section className="space-y-2">
              <h2 className="font-heading text-base font-bold text-[#2C2B29]">第4条（キャンセル・日程振替）</h2>
              <p>
                通常のご変更・キャンセルはレッスン前日正午（12:00）まで無料です。屋外レッスンの雨天等による中止・振替は、レッスン開始2時間前まで手数料無料で別日程への変更が可能です。
              </p>
            </section>

            <section className="space-y-2">
              <h2 className="font-heading text-base font-bold text-[#2C2B29]">第5条（報酬の確定および振込）</h2>
              <p>
                コーチへの報酬（受講料の75%）は、レッスン終了時刻経過後の完了報告および保護者様による確認（または48時間以内の異議なし経過）をもって確定し、Stripe Connect を通じて2週に1回（隔週）登録口座へ自動振込されます。
              </p>
            </section>
          </article>
        </div>
      </main>

      <KidsCoachFooter />
    </div>
  );
}
