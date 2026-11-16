import React from 'react';
import { Metadata } from 'next';
import Link from 'next/link';
import KidsCoachNavbar from '@/components/kids-coach/Navbar';
import KidsCoachFooter from '@/components/kids-coach/Footer';
import { ArrowLeft } from 'lucide-react';

export const metadata: Metadata = {
  title: '利用規約（受講者・保護者様向け） | キッズコーチナビ',
  description: 'キッズコーチナビ（運営：SWIM PARTNERS）の受講者・保護者様向け利用規約です。',
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
                TERMS OF SERVICE (FOR PARENTS)
              </span>
              <h1 className="font-heading text-xl sm:text-2xl font-bold text-[#2C2B29]">
                キッズコーチナビ 利用規約（保護者・受講者様向け）
              </h1>
              <p className="text-[11px] text-[#8A857B]">運営事業者：SWIM PARTNERS</p>
            </header>

            <section className="space-y-2">
              <h2 className="font-heading text-base font-bold text-[#2C2B29]">第1条（適用・本サービスの性質）</h2>
              <p>
                1. 本規約は、SWIM PARTNERS（以下「当社」といいます）が運営する出張個別スポーツ指導マッチングサービス「キッズコーチナビ」（以下「本サービス」といいます）を保護者様およびお子様（以下総称して「利用者」といいます）が利用する際の条件を定めるものです。<br />
                2. 当社は、利用者と認定コーチとのマッチングの場および決済代行システムを提供するものであり、個別の指導契約は利用者と担当コーチの間で成立します（コーチは当社の従業員ではありません）。
              </p>
            </section>

            <section className="space-y-2">
              <h2 className="font-heading text-base font-bold text-[#2C2B29]">第2条（予約・事前決済・直接取引の禁止）</h2>
              <p>
                1. 受講料金はすべて Stripe を用いた事前クレジットカード決済とし、レッスン当日の現金手渡しは禁止します。<br />
                2. 利用者は、本サービスを通じて知り合ったコーチと当社を介さずに直接契約・金銭の授受（中抜き行為）を行ってはならず、専用チャット上で電話番号・SNSアカウント・メールアドレス等の個人連絡先を交換する行為を禁止します。
              </p>
            </section>

            <section className="space-y-2">
              <h2 className="font-heading text-base font-bold text-[#2C2B29]">第3条（キャンセル・雨天振替・コーチ都合の中止）</h2>
              <p>
                1. 利用者都合によるキャンセル・日程変更は、レッスン前日正午（12:00）まで無料で承ります。前日正午以降のキャンセルは返金対象外となります。<br />
                2. 屋外レッスンにおいて雨天等により実施が困難な場合は、レッスン開始2時間前まで手数料無料で別日程への振替が可能です。<br />
                3. 担当コーチの都合によりレッスンが中止・キャンセルされた場合は、お支払いいただいた受講料を全額返金いたします。
              </p>
            </section>

            <section className="space-y-2">
              <h2 className="font-heading text-base font-bold text-[#2C2B29]">第4条（お子様の安全管理・健康申告・立ち会い）</h2>
              <p>
                1. 利用者は、お子様の持病・アレルギー・既往歴・運動制限など安全管理上必要な事項を事前に申告するものとし、当日体調が優れない場合は無理な受講をさせないものとします。<br />
                2. 原則としてレッスン中は保護者様が会場付近に立ち会うか、直ちに連絡・合流できる体制を保つものとします。
              </p>
            </section>

            <section className="space-y-2">
              <h2 className="font-heading text-base font-bold text-[#2C2B29]">第5条（指導場所・施設ルールの遵守）</h2>
              <p>
                営利目的の指導・個人指導が禁止されている公園や公営プール等の施設ではレッスンを実施できません。有料施設を利用する際の施設入場料等は利用者ご自身の実費負担とし、各施設の規則を遵守するものとします。
              </p>
            </section>

            <section className="space-y-2">
              <h2 className="font-heading text-base font-bold text-[#2C2B29]">第6条（禁止事項・反社会的勢力の排除）</h2>
              <p>
                1. 利用者は、コーチに対するハラスメント、無断での営利撮影・SNS公開、虚偽の申告・不正な異議申し立てを行ってはなりません。<br />
                2. 利用者は、現在および将来にわたり反社会的勢力に該当しないことを表明・確約するものとします。
              </p>
            </section>

            <section className="space-y-2">
              <h2 className="font-heading text-base font-bold text-[#2C2B29]">第7条（免責事項・損害賠償の上限）</h2>
              <p>
                レッスン中の負傷・盗難・施設トラブル等について、当社は当社に故意または重過失がある場合を除き責任を負いません。当社が損害賠償責任を負う場合であっても、その賠償額は当該予約にかかるレッスン料金相当額を上限とします。
              </p>
            </section>

            <section className="space-y-2">
              <h2 className="font-heading text-base font-bold text-[#2C2B29]">第8条（準拠法・管轄裁判所）</h2>
              <p>
                本規約は日本法を準拠法とし、本サービスに関する一切の紛争については東京地方裁判所を第一審の専属的合意管轄裁判所とします。
              </p>
            </section>
          </article>
        </div>
      </main>

      <KidsCoachFooter />
    </div>
  );
}
