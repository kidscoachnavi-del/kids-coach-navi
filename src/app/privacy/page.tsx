import React from 'react';
import { Metadata } from 'next';
import Link from 'next/link';
import KidsCoachNavbar from '@/components/kids-coach/Navbar';
import KidsCoachFooter from '@/components/kids-coach/Footer';
import { ArrowLeft } from 'lucide-react';

export const metadata: Metadata = {
  title: 'プライバシーポリシー | キッズコーチナビ by Wellne',
  description: 'キッズコーチナビ by Wellne（運営：株式会社Wellne）のプライバシーポリシーです。',
};

export default function PrivacyPage() {
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
                PRIVACY POLICY
              </span>
              <h1 className="font-heading text-xl sm:text-2xl font-bold text-[#2C2B29]">
                プライバシーポリシー
              </h1>
              <p className="text-[11px] text-[#8A857B]">運営会社：株式会社Wellne</p>
            </header>

            <section className="space-y-2">
              <h2 className="font-heading text-base font-bold text-[#2C2B29]">1. 収集する個人情報</h2>
              <p>
                当社は、本サービスの提供にあたり、保護者様・お子様・コーチの氏名、メールアドレス、電話番号、年齢・学年、レッスンのご希望内容、およびコーチのプロフィール用顔写真・登録時カメラ撮影画像を取得します。
              </p>
            </section>

            <section className="space-y-2">
              <h2 className="font-heading text-base font-bold text-[#2C2B29]">2. クレジットカード情報・身分証・銀行口座の非保持</h2>
              <p>
                クレジットカード番号（PAN）・セキュリティコード、およびコーチの公的身分証明書・振込先銀行口座番号の入力・保管・管理はすべて決済代行会社である Stripe（ストライプ）にて行われます。当社サーバーにはこれらの機密情報を一切保持いたしません。
              </p>
            </section>

            <section className="space-y-2">
              <h2 className="font-heading text-base font-bold text-[#2C2B29]">3. コーチの顔写真・撮影画像の利用目的</h2>
              <p>
                コーチ登録時に撮影された顔画像は、なりすまし防止および当社の目視本人確認審査の目的のみに利用し、非公開領域にて厳重に保管します。公開プロフィール用顔写真のみ、予約検討中の保護者様への表示に使用します。
              </p>
            </section>

            <section className="space-y-2">
              <h2 className="font-heading text-base font-bold text-[#2C2B29]">4. 第三者提供・安全管理</h2>
              <p>
                法令に基づく場合を除き、ご本人の同意なく第三者へ個人情報を提供いたしません。チャット内のメッセージは、連絡先の不正交換・トラブル防止のため自動保護フィルターおよび運営監査の対象となります。
              </p>
            </section>
          </article>
        </div>
      </main>

      <KidsCoachFooter />
    </div>
  );
}
