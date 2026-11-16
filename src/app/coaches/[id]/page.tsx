import React from 'react';
import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { MOCK_COACHES } from '@/data/kids-coach-mock';
import KidsCoachNavbar from '@/components/kids-coach/Navbar';
import CoachProfileHeader from '@/components/kids-coach/CoachProfileHeader';
import BookingCalendarSection from '@/components/kids-coach/BookingCalendarSection';
import KidsCoachFooter from '@/components/kids-coach/Footer';
import JsonLd from '@/components/kids-coach/JsonLd';
import { ChevronRight, Shield } from 'lucide-react';

const SITE_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://kids-coach-navi.vercel.app';

interface CoachPageProps {
  params: Promise<{
    id: string;
  }>;
}

export async function generateMetadata({
  params,
}: CoachPageProps): Promise<Metadata> {
  const { id } = await params;
  const coach = MOCK_COACHES.find((c) => c.id === id);

  if (!coach) {
    return {
      title: 'コーチが見つかりません | キッズコーチナビ',
    };
  }

  const title = `${coach.name} コーチの詳細・予約 | キッズコーチナビ by SWIM PARTNERS`;
  const description = `${coach.name} コーチ（${coach.title}）のマンツーマン出張レッスン予約。${coach.specialties.join('、')}などの得意種目。直近の空き日程から都度払いで予約可能。`;

  return {
    title,
    description,
    alternates: {
      canonical: `${SITE_URL}/coaches/${coach.id}`,
    },
    openGraph: {
      type: 'profile',
      locale: 'ja_JP',
      url: `${SITE_URL}/coaches/${coach.id}`,
      title,
      description,
    },
  };
}

export default async function CoachDetailPage({ params }: CoachPageProps) {
  const { id } = await params;
  const coach = MOCK_COACHES.find((c) => c.id === id);

  if (!coach) {
    notFound();
  }

  // AIO・検索エンジン向けのコーチ構造化データ（Person / Service / BreadcrumbList）
  const coachJsonLd = [
    {
      '@context': 'https://schema.org',
      '@type': 'Service',
      name: `${coach.name} コーチ 出張マンツーマン指導`,
      serviceType: coach.sports.join('・'),
      provider: {
        '@type': 'Person',
        name: coach.name,
        jobTitle: coach.title,
        description: coach.bio,
      },
      areaServed: coach.areas,
      offers: {
        '@type': 'Offer',
        price: coach.hourlyRate,
        priceCurrency: 'JPY',
        availability: 'https://schema.org/InStock',
      },
    },
    {
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'ホーム', item: `${SITE_URL}/` },
        { '@type': 'ListItem', position: 2, name: `${coach.name} コーチ`, item: `${SITE_URL}/coaches/${coach.id}` },
      ],
    },
  ];

  return (
    <div className="min-h-screen bg-[#FDFBF7] text-[#2C2B29] flex flex-col font-sans">
      <JsonLd data={coachJsonLd} />
      <KidsCoachNavbar />

      <main className="flex-1 py-6 md:py-10">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 space-y-6">
          {/* パンくずリスト */}
          <nav className="flex items-center gap-1.5 text-xs text-[#5E5B54] overflow-x-auto whitespace-nowrap font-bold">
            <Link href="/" className="hover:text-[#E3644F] transition-colors">
              ホーム
            </Link>
            <ChevronRight className="w-3.5 h-3.5 text-[#5E5B54]/60 shrink-0" strokeWidth={1.75} />
            <Link href="/#coaches" className="hover:text-[#E3644F] transition-colors">
              コーチ・種目紹介
            </Link>
            <ChevronRight className="w-3.5 h-3.5 text-[#5E5B54]/60 shrink-0" strokeWidth={1.75} />
            <span className="text-[#2C2B29] font-bold truncate">
              {coach.name} コーチ
            </span>
          </nav>

          {/* 1. コーチプロフィール詳細 */}
          <CoachProfileHeader coach={coach} />

          {/* 2. 予約日程カレンダー（直近2週間スロット）＆受講情報入力・決済 */}
          <BookingCalendarSection coach={coach} />

          {/* 安心保証バナー */}
          <div className="p-6 rounded-3xl bg-white border border-[#EADBCC] flex items-start gap-4 shadow-xs">
            <div className="w-10 h-10 rounded-2xl bg-[#3E8E84]/10 text-[#3E8E84] flex items-center justify-center shrink-0">
              <Shield className="w-5 h-5" strokeWidth={1.75} />
            </div>
            <div className="text-xs sm:text-sm leading-relaxed space-y-1">
              <h4 className="font-heading font-bold text-[#2C2B29] text-base">
                日程調整後のカード決済・安心の雨天振替制度
              </h4>
              <p className="text-[#5E5B54]">
                通常のご変更・キャンセルは前日正午まで、屋外レッスンでの雨天時は開始2時間前まで無料で日程の振替が可能です。また、クレジットカードによるオンライン事前決済のため、当日の現金手渡しは不要で安全にご利用いただけます。
              </p>
            </div>
          </div>
        </div>
      </main>

      <KidsCoachFooter />
    </div>
  );
}
