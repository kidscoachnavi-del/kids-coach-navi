import React from 'react';
import { Metadata } from 'next';
import Link from 'next/link';
import KidsCoachNavbar from '@/components/kids-coach/Navbar';
import { ArrowLeft } from 'lucide-react';

export const metadata: Metadata = {
  title: 'コーチ利用規約 | キッズコーチナビ',
  description: 'キッズコーチナビ（運営：SWIM PARTNERS）の認定コーチ向け利用規約です。',
  robots: {
    index: false,
    follow: false,
  },
};

export default function CoachTermsPage() {
  return (
    <div className="min-h-screen bg-[#FDFBF7] text-[#2C2B29] flex flex-col font-sans">
      <KidsCoachNavbar />

      <main className="flex-1 py-8 sm:py-12">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 space-y-6">
          <Link
            href="/coach/dashboard"
            className="inline-flex items-center gap-1.5 text-xs font-bold text-[#5E5B54] hover:text-[#E3644F] transition-colors"
          >
            <ArrowLeft className="w-4 h-4" strokeWidth={1.75} />
            <span>コーチダッシュボードへ戻る</span>
          </Link>

          <article className="bg-white rounded-3xl border border-[#EADBCC] p-6 sm:p-10 shadow-xs space-y-6 text-xs sm:text-sm leading-relaxed text-[#5E5B54]">
            <header className="border-b border-[#EADBCC] pb-5 space-y-1.5">
              <span className="font-en text-[10px] font-extrabold tracking-widest uppercase text-[#E3644F] block">
                COACH TERMS OF SERVICE
              </span>
              <h1 className="font-heading text-xl sm:text-2xl font-bold text-[#2C2B29]">
                キッズコーチナビ 認定コーチ利用規約
              </h1>
              <p className="text-[11px] text-[#8A857B]">運営事業者：SWIM PARTNERS</p>
            </header>

            <section className="space-y-2">
              <h2 className="font-heading text-base font-bold text-[#2C2B29]">第1条（適用・契約関係）</h2>
              <p>
                1. 本規約は、SWIM PARTNERS（以下「当社」といいます）が運営する「キッズコーチナビ」に登録・出品するコーチ（以下「コーチ」といいます）に適用されます。<br />
                2. コーチは独立した事業者（個人事業主等）として指導を行うものであり、当社との間に雇用関係・指揮命令関係は生じません。税務申告・保険加入等はコーチ自身の責任で行うものとします。
              </p>
            </section>

            <section className="space-y-2">
              <h2 className="font-heading text-base font-bold text-[#2C2B29]">第2条（登録審査・本人確認コンプライアンス）</h2>
              <p>
                1. コーチは登録時に、公開プロフィール用顔写真の登録、登録時リアルタイムカメラ撮影、および Stripe Connect を用いた本人確認・振込口座連携を完了するものとします。<br />
                2. 当社は提出内容の目視審査を行い、承認したコーチのみにレッスン公開・受注を許可します。なりすましや虚偽申告が発覚した場合、直ちにアカウントを停止します。
              </p>
            </section>

            <section className="space-y-2">
              <h2 className="font-heading text-base font-bold text-[#2C2B29]">第3条（価格設定・手数料・隔週振込）</h2>
              <p>
                1. コーチは最低5,000円（税込・交通費込）以上の範囲で自由にレッスン価格を設定できます。<br />
                2. プラットフォーム手数料は受講料の25%とし、残る75%をコーチの報酬とします。<br />
                3. 報酬は、レッスン終了時刻経過後の完了報告および保護者様の確認（または終了後48時間以内の異議なし経過）をもって確定し、Stripe Connect を通じて2週に1回（隔週）登録口座へ自動振込されます。
              </p>
            </section>

            <section className="space-y-2">
              <h2 className="font-heading text-base font-bold text-[#2C2B29]">第4条（コーチ都合キャンセルの制限・ペナルティ）</h2>
              <p>
                1. 予約確定後のコーチ都合によるキャンセルは原則禁止とします（急病・天災等やむを得ない場合を除く）。<br />
                2. コーチ都合によるキャンセルが重なった場合または無断欠席が発生した場合、当社は保護者様へ全額返金を行うとともに、コーチに対して以下の段階的ペナルティを課すことができます。<br />
                ・1回目：厳重注意および実績評価への記録<br />
                ・2回目：検索表示順位の低下および一定期間（14日間）の出品公開停止<br />
                ・3回目（または無断欠席1回）：掲載の永久停止およびアカウント強制退会
              </p>
            </section>

            <section className="space-y-2">
              <h2 className="font-heading text-base font-bold text-[#2C2B29]">第5条（虚偽報告・中抜き行為・不適切行為の禁止）</h2>
              <p>
                1. 指導実施前または未実施にもかかわらず指導完了報告を行う虚偽報告、および受講者との直接取引（中抜き）・個人連絡先交換を厳禁とします。<br />
                2. お子様に対する不適切な言動・ハラスメント・不必要な身体的接触、許可されていない施設での指導、無断撮影・SNS投稿を禁止します。<br />
                3. 違反が判明した場合、当社はアカウントの強制停止および不正取引・損害相当額の報酬留保・損害賠償請求を行うことができます。
              </p>
            </section>

            <section className="space-y-2">
              <h2 className="font-heading text-base font-bold text-[#2C2B29]">第6条（反社会的勢力の排除・準拠法・管轄）</h2>
              <p>
                コーチは反社会的勢力に該当しないことを確約するものとします。本規約は日本法を準拠法とし、紛争については東京地方裁判所を第一審の専属的合意管轄裁判所とします。
              </p>
            </section>
          </article>
        </div>
      </main>
    </div>
  );
}
