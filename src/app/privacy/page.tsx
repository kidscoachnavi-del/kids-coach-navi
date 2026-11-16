import React from 'react';
import { Metadata } from 'next';
import Link from 'next/link';
import KidsCoachNavbar from '@/components/kids-coach/Navbar';
import KidsCoachFooter from '@/components/kids-coach/Footer';
import { ArrowLeft } from 'lucide-react';

export const metadata: Metadata = {
  title: 'プライバシーポリシー | キッズコーチナビ',
  description: 'キッズコーチナビ（運営：SWIM PARTNERS）のプライバシーポリシーです。',
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
              <p className="text-[11px] text-[#8A857B]">
                運営事業者：SWIM PARTNERS ／ 運営責任者：新吉 航大（〒150-0021 東京都渋谷区恵比寿西２丁目４−８ ウィンド恵比寿ビル 8F）
              </p>
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
              <h2 className="font-heading text-base font-bold text-[#2C2B29]">3. コーチの顔写真・撮影画像の利用目的と保管期間</h2>
              <p>
                コーチ登録時に撮影されたカメラ画像は、なりすまし防止および当社の目視本人確認審査の目的のみに利用し、非公開領域にて厳重に保管します（退会または利用終了後は当社規定に基づき速やかに削除いたします）。公開プロフィール用顔写真のみ、予約検討中の保護者様への表示に使用します。
              </p>
            </section>

            <section className="space-y-2">
              <h2 className="font-heading text-base font-bold text-[#2C2B29]">4. Cookie・外部サービス連携</h2>
              <p>
                本サービスでは、利便性向上・セッション維持・アクセス状況把握のために Cookie 等を使用します。また、決済処理のために必要な情報を Stripe 社（海外サーバーを含む場合があります）へ送信します。
              </p>
            </section>

            <section className="space-y-2">
              <h2 className="font-heading text-base font-bold text-[#2C2B29]">5. 保有個人データの開示・訂正・削除請求窓口</h2>
              <p>
                法令に基づく場合を除き、ご本人の同意なく第三者へ個人情報を提供いたしません。ご自身の個人情報の開示・訂正・利用停止・削除をご希望の場合は、本サービス内の
                <Link
                  href="/contact"
                  className="font-bold text-[#3E8E84] underline hover:text-[#2f7169] mx-0.5"
                >
                  お問い合わせフォーム
                </Link>
                よりご連絡ください。ご本人確認の上、遅滞なく対応いたします。
              </p>
            </section>
          </article>
        </div>
      </main>

      <KidsCoachFooter />
    </div>
  );
}
