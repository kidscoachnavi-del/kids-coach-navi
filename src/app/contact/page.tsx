import React from 'react';
import { Metadata } from 'next';
import Link from 'next/link';
import KidsCoachNavbar from '@/components/kids-coach/Navbar';
import KidsCoachFooter from '@/components/kids-coach/Footer';
import ContactFormClient from '@/components/kids-coach/ContactFormClient';
import { ArrowLeft } from 'lucide-react';

export const metadata: Metadata = {
  title: 'お問い合わせ | キッズコーチナビ',
  description:
    'キッズコーチナビ（運営：SWIM PARTNERS）へのお問い合わせ・情報開示請求窓口です。',
};

export default function ContactPage() {
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
                CONTACT US
              </span>
              <h1 className="font-heading text-xl sm:text-2xl font-bold text-[#2C2B29]">
                お問い合わせ窓口
              </h1>
              <p className="text-[11px] text-[#8A857B]">
                運営事業者：SWIM PARTNERS（メール連絡先：
                <a
                  href="mailto:info.swimpartners@gmail.com"
                  className="font-en font-bold text-[#3E8E84] underline hover:text-[#2f7169]"
                >
                  info.swimpartners@gmail.com
                </a>
                ）
              </p>
            </header>

            <ContactFormClient />
          </article>
        </div>
      </main>

      <KidsCoachFooter />
    </div>
  );
}
