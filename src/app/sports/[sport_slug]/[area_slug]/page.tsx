import React from 'react';
import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import KidsCoachNavbar from '@/components/kids-coach/Navbar';
import CoachCard from '@/components/kids-coach/CoachCard';
import DemandRequestCard from '@/components/kids-coach/DemandRequestCard';
import KidsCoachFooter from '@/components/kids-coach/Footer';
import JsonLd from '@/components/kids-coach/JsonLd';
import {
  SPORT_CATEGORIES,
  AREA_LIST,
  MOCK_COACHES,
  SPORT_VISUALS,
} from '@/data/kids-coach-mock';
import { ChevronRight, MapPin, Check } from 'lucide-react';

interface SportAreaPageProps {
  params: Promise<{
    sport_slug: string;
    area_slug: string;
  }>;
}

export async function generateMetadata({
  params,
}: SportAreaPageProps): Promise<Metadata> {
  const { sport_slug, area_slug } = await params;
  const category = SPORT_CATEGORIES.find((c) => c.slug === sport_slug);
  const area = AREA_LIST.find((a) => a.slug === area_slug);

  if (!category || !area) {
    return {
      title: 'ページが見つかりません | キッズコーチナビ by Wellne',
    };
  }

  return {
    title: `【${area.name}】子ども向け${category.name}の出張マンツーマン指導 | キッズコーチナビ`,
    description: `${area.prefecture}${area.name}で受けられる子ども向け${category.name}の出張レッスン。公園や個人指導可能な施設へプロコーチが出張。入会金・月会費なしの都度払い。運営：株式会社Wellne。`,
  };
}

export default async function SportAreaPage({ params }: SportAreaPageProps) {
  const { sport_slug, area_slug } = await params;
  const category = SPORT_CATEGORIES.find((c) => c.slug === sport_slug);
  const area = AREA_LIST.find((a) => a.slug === area_slug);

  if (!category || !area) {
    notFound();
  }

  // 該当種目 ＆ 該当エリアのコーチを抽出（該当がなければ該当種目コーチを表示）
  let coaches = MOCK_COACHES.filter(
    (c) =>
      (c.sportsSlugs.includes(sport_slug) || c.sports.some((s) => s.includes(category.name.slice(0, 2)))) &&
      (c.areaSlugs.includes(area_slug) || c.areas.some((a) => a.includes(area.name)))
  );

  if (coaches.length === 0) {
    coaches = MOCK_COACHES.filter(
      (c) =>
        c.sportsSlugs.includes(sport_slug) ||
        c.sports.some((s) => s.includes(category.name.slice(0, 2)))
    );
  }

  // 構造化データ（LocalBusiness + Service 複合）
  const localBusinessJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'LocalBusiness',
    name: `キッズコーチナビ ${area.name} ${category.name}出張指導`,
    image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=600&q=80',
    '@id': `https://kidscoachnavi.wellne.co.jp/sports/${sport_slug}/${area_slug}`,
    url: `https://kidscoachnavi.wellne.co.jp/sports/${sport_slug}/${area_slug}`,
    telephone: '03-0000-0035',
    priceRange: '¥5,000〜',
    address: {
      '@type': 'PostalAddress',
      addressLocality: area.name,
      addressRegion: area.prefecture,
      addressCountry: 'JP',
    },
    geo: {
      '@type': 'GeoCoordinates',
      latitude: 35.6585805,
      longitude: 139.7454329,
    },
    parentOrganization: {
      '@type': 'Organization',
      name: '株式会社Wellne',
      url: 'https://wellne.co.jp',
    },
    makesOffer: {
      '@type': 'Offer',
      itemOffered: {
        '@type': 'Service',
        name: `${area.name}での子ども向け${category.name}マンツーマン指導`,
        description: `${area.parks.join('、')}等での出張個人指導。`,
      },
    },
  };

  return (
    <div className="min-h-screen bg-[#FDFBF7] text-[#2C2B29] flex flex-col font-sans">
      <JsonLd data={localBusinessJsonLd} />
      <KidsCoachNavbar />

      <main className="flex-1 py-8 md:py-12">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 space-y-10">
          {/* パンくずリスト */}
          <nav className="flex items-center gap-1.5 text-xs text-[#5E5B54] overflow-x-auto whitespace-nowrap font-bold">
            <Link href="/" className="hover:text-[#E3644F] transition-colors">
              ホーム
            </Link>
            <ChevronRight className="w-3.5 h-3.5 text-[#5E5B54]/60 shrink-0" strokeWidth={1.75} />
            <Link href={`/sports/${category.slug}`} className="hover:text-[#E3644F] transition-colors">
              {category.name}
            </Link>
            <ChevronRight className="w-3.5 h-3.5 text-[#5E5B54]/60 shrink-0" strokeWidth={1.75} />
            <span className="text-[#2C2B29] font-bold truncate">
              {area.name}
            </span>
          </nav>

          {/* 近隣エリアクイック切替バー */}
          <div className="flex flex-wrap items-center gap-2">
            {AREA_LIST.map((item) => {
              const active = item.slug === area.slug;
              return (
                <Link
                  key={item.slug}
                  href={`/sports/${category.slug}/${item.slug}`}
                  className={`px-3 py-1.5 rounded-full text-xs font-bold border transition-colors ${
                    active
                      ? 'bg-[#2C2B29] text-white border-[#2C2B29]'
                      : 'bg-white text-[#5E5B54] border-[#EADBCC] hover:border-[#2C2B29]/40 hover:text-[#2C2B29]'
                  }`}
                >
                  {item.name}
                </Link>
              );
            })}
          </div>

          {/* 種目×エリア特化Hero */}
          {(() => {
            const visual = SPORT_VISUALS[category.slug] || SPORT_VISUALS.running;
            return (
              <div className="bg-white rounded-3xl p-6 sm:p-10 border border-[#EADBCC] shadow-xs flex flex-col md:flex-row items-center justify-between gap-6 md:gap-8">
                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2 mb-3">
                    <span className="font-en text-[11px] font-extrabold tracking-widest text-[#E3644F] bg-orange-50 px-3 py-1 rounded-full">
                      {category.code}
                    </span>
                    <span className="text-xs font-bold text-[#2C2B29] bg-[#FCE7A2] px-3 py-1 rounded-full flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5 text-[#E3644F]" strokeWidth={1.75} />
                      <span>{area.prefecture} {area.name}</span>
                    </span>
                    <span className="text-xs font-bold text-[#3E8E84] bg-[#3E8E84]/10 px-2.5 py-1 rounded-full">
                      空き枠・日程相談受付中
                    </span>
                  </div>

                  <h1 className="font-heading tracking-tight mb-4 space-y-1">
                    <span className="block text-2xl sm:text-3xl lg:text-4xl font-extrabold text-[#2C2B29] leading-tight">
                      {category.name}
                    </span>
                    <span className="block text-sm sm:text-base font-bold text-[#3E8E84] tracking-wide">
                      {area.name}の出張マンツーマンレッスン
                    </span>
                  </h1>

                  <p className="text-xs sm:text-sm text-[#5E5B54] leading-relaxed mb-6">
                    {area.name}内の公園や個人指導が許可されているスポーツ施設など、ご希望の場所へコーチが出張してマンツーマンで指導します。入会金・月会費なしの都度払いで、1回から気軽に始められます。
                  </p>

                  {/* 指導可能スポット例一覧 */}
                  <div className="bg-[#FDFBF7] p-4 rounded-2xl border border-[#EADBCC] mb-6 space-y-2">
                    <span className="text-[11px] font-bold text-[#5E5B54] flex items-center gap-1.5">
                      <MapPin className="w-3.5 h-3.5 text-[#3E8E84]" strokeWidth={1.75} />
                      <span>{area.name}周辺の主なスポット例（施設により利用条件が異なります）:</span>
                    </span>
                    <div className="flex flex-wrap gap-2">
                      {area.parks.map((park, i) => (
                        <span
                          key={i}
                          className="text-xs font-bold px-3 py-1 rounded-full bg-white text-[#2C2B29] border border-[#EADBCC]"
                        >
                          {park}
                        </span>
                      ))}
                      <span className="text-xs text-[#5E5B54] self-center">
                        ※その他、実施可能な近隣施設もチャットで相談できます
                      </span>
                    </div>
                  </div>

                  {/* 3つの安心ポイント */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs font-bold text-[#2C2B29]">
                    <div className="bg-[#FDFBF7] p-3 rounded-2xl border border-[#EADBCC] flex items-center gap-2">
                      <Check className="w-3.5 h-3.5 text-[#3E8E84] shrink-0" strokeWidth={2} />
                      <span>入会金・月会費なし</span>
                    </div>
                    <div className="bg-[#FDFBF7] p-3 rounded-2xl border border-[#EADBCC] flex items-center gap-2">
                      <Check className="w-3.5 h-3.5 text-[#3E8E84] shrink-0" strokeWidth={2} />
                      <span>本人確認済みコーチのみ</span>
                    </div>
                    <div className="bg-[#FDFBF7] p-3 rounded-2xl border border-[#EADBCC] flex items-center gap-2">
                      <Check className="w-3.5 h-3.5 text-[#3E8E84] shrink-0" strokeWidth={2} />
                      <span>前日正午まで無料キャンセル</span>
                    </div>
                  </div>
                </div>

                {/* 右側イラストモチーフ */}
                <div className="relative w-36 h-36 sm:w-44 sm:h-44 lg:w-48 lg:h-48 shrink-0 flex items-center justify-center">
                  <div className={`absolute inset-2 ${visual.shapeClass}`} />
                  <img
                    src={visual.src}
                    alt={visual.alt}
                    className="relative z-10 w-full h-full object-contain"
                  />
                </div>
              </div>
            );
          })()}

          {/* 対応コーチ一覧 */}
          <div>
            <div className="mb-6 flex flex-wrap items-end justify-between gap-2">
              <div>
                <h2 className="font-heading text-xl sm:text-2xl font-bold text-[#2C2B29]">
                  {area.name}に対応可能な{category.name}コーチ（{coaches.length}名）
                </h2>
                <p className="text-xs text-[#5E5B54] mt-1">
                  空き枠を確認してコーチと日程調整をご相談いただけます（決定後のカード事前決済）。
                </p>
              </div>
              <Link
                href={`/sports/${category.slug}`}
                className="text-xs font-bold text-[#3E8E84] hover:text-[#2C6B63] transition-colors"
              >
                {category.name}の全エリアを見る →
              </Link>
            </div>

            {coaches.length === 1 ? (
              <div className="space-y-6">
                <CoachCard coach={coaches[0]} wide />
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {coaches.map((coach) => (
                  <CoachCard key={coach.id} coach={coach} />
                ))}
              </div>
            )}
          </div>

          {/* 種目・エリアリクエスト（需要データ収集） */}
          <DemandRequestCard defaultSport={category.name} defaultArea={area.name} />
        </div>
      </main>

      <KidsCoachFooter showCoachRecruit />
    </div>
  );
}
