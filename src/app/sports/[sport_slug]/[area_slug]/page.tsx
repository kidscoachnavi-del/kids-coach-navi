import React from 'react';
import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import KidsCoachNavbar from '@/components/kids-coach/Navbar';
import CoachCard from '@/components/kids-coach/CoachCard';
import DemandRequestCard from '@/components/kids-coach/DemandRequestCard';
import KidsCoachFooter from '@/components/kids-coach/Footer';
import JsonLd from '@/components/kids-coach/JsonLd';
import { fetchApprovedCoachesWithSlots } from '@/lib/kcn-coaches';
import { filterCoachesForSportAndArea } from '@/lib/kcn-sport-matching';
import {
  SPORT_CATEGORIES,
  AREA_LIST,
  SPORT_VISUALS,
} from '@/data/kids-coach-mock';
import { ChevronRight, MapPin, Check, ArrowRight } from 'lucide-react';

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
      title: 'ページが見つかりません | キッズコーチナビ by SWIM PARTNERS',
    };
  }

  return {
    title: `【${area.name}】子ども向け${category.name}の出張マンツーマン指導 | キッズコーチナビ`,
    description: `${area.prefecture}${area.name}で受けられる子ども向け${category.name}の出張レッスン。ご希望の駅・エリア周辺での個別指導に対応。入会金・月会費なしの都度払い。運営：SWIM PARTNERS。`,
  };
}

export default async function SportAreaPage({ params }: SportAreaPageProps) {
  const { sport_slug, area_slug } = await params;
  const category = SPORT_CATEGORIES.find((c) => c.slug === sport_slug);
  const area = AREA_LIST.find((a) => a.slug === area_slug);

  if (!category || !area) {
    notFound();
  }

  // 該当種目 ＆ 該当エリアのコーチを厳密に抽出（承認済みDB実データのみ・他エリアへのフォールバックなし）
  const { coaches: allCoaches, slots: allSlots } = await fetchApprovedCoachesWithSlots();
  const coaches = filterCoachesForSportAndArea(allCoaches, sport_slug, area);
  const hasAvailableSlots = coaches.some((coach) =>
    allSlots.some((slot) => slot.coachId === coach.id && slot.status === 'available')
  );

  // 構造化データ（LocalBusiness + Service 複合）
  const localBusinessJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'LocalBusiness',
    name: `キッズコーチナビ ${area.name} ${category.name}出張指導`,
    image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=600&q=80',
    '@id': `https://kids-coach-navi.com/sports/${sport_slug}/${area_slug}`,
    url: `https://kids-coach-navi.com/sports/${sport_slug}/${area_slug}`,
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
      name: 'SWIM PARTNERS',
      url: 'https://kids-coach-navi.com',
    },
    makesOffer: {
      '@type': 'Offer',
      itemOffered: {
        '@type': 'Service',
        name: `${area.name}での子ども向け${category.name}マンツーマン指導`,
        description: `${area.prefecture}${area.name}（${area.stationAreas.join('・')}）を中心とした出張個人指導。`,
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

          {/* 近隣エリアクイック切替バー（SSoT：東京都内5区のみ） */}
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
                    {coaches.length > 0 ? (
                      <span className="text-xs font-bold text-[#3E8E84] bg-[#3E8E84]/10 px-2.5 py-1 rounded-full">
                        {hasAvailableSlots ? '空き枠・日程相談受付中' : '日程相談受付中'}
                      </span>
                    ) : (
                      <span className="text-xs font-bold text-[#5E5B54] bg-[#F3EFE8] px-2.5 py-1 rounded-full">
                        認定コーチ募集中・順次拡大中
                      </span>
                    )}
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
                    {area.prefecture}{area.name}内のご希望エリアにて、認定コーチが出張してマンツーマンで指導します。具体的な実施場所は利用条件を確認のうえチャットで調整でき、入会金・月会費なしの都度払いで1回から気軽に始められます。
                  </p>

                  {/* 対応駅・エリア目安一覧（SSoT：施設名ではなく区・駅エリア表記） */}
                  <div className="bg-[#FDFBF7] p-4 rounded-2xl border border-[#EADBCC] mb-6 space-y-2">
                    <span className="text-[11px] font-bold text-[#5E5B54] flex items-center gap-1.5">
                      <MapPin className="w-3.5 h-3.5 text-[#3E8E84]" strokeWidth={1.75} />
                      <span>{area.name}の主な対応駅・エリア目安（具体的な実施場所はご希望に合わせて調整）:</span>
                    </span>
                    <div className="flex flex-wrap gap-2">
                      {area.stationAreas.map((stationArea, i) => (
                        <span
                          key={i}
                          className="text-xs font-bold px-3 py-1 rounded-full bg-white text-[#2C2B29] border border-[#EADBCC]"
                        >
                          {stationArea}
                        </span>
                      ))}
                      <span className="text-xs text-[#5E5B54] self-center">
                        ※具体的な実施場所はご予約時のチャットにて、ご希望エリア・利用条件に合わせてご相談いただけます
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
                  {coaches.length > 0
                    ? '空き枠を確認してコーチと日程調整をご相談いただけます（決定後のカード事前決済）。'
                    : '現在、当エリアの担当コーチを順次募集・審査しています。'}
                </p>
              </div>
              <Link
                href={`/sports/${category.slug}`}
                className="text-xs font-bold text-[#3E8E84] hover:text-[#2C6B63] transition-colors"
              >
                {category.name}の全エリアを見る →
              </Link>
            </div>

            {coaches.length > 0 ? (
              coaches.length === 1 ? (
                <div className="space-y-6">
                  <CoachCard
                    coach={coaches[0]}
                    slots={allSlots.filter((s) => s.coachId === coaches[0].id)}
                    wide
                  />
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {coaches.map((coach) => (
                    <CoachCard
                      key={coach.id}
                      coach={coach}
                      slots={allSlots.filter((s) => s.coachId === coach.id)}
                    />
                  ))}
                </div>
              )
            ) : (
              <div className="p-8 text-center text-[#5E5B54] bg-white rounded-3xl border border-[#EADBCC] text-xs space-y-3">
                <p className="font-bold text-[#2C2B29]">
                  現在、{area.name}で{category.name}を担当できる認定コーチを順次募集・審査中です。
                </p>
                <p>
                  下記リクエストフォームよりご希望をお寄せいただくと、対応コーチが登録され次第優先的にご案内します。
                </p>
                <div>
                  <Link
                    href="/coach-recruit"
                    className="inline-flex items-center gap-1.5 text-xs font-bold text-[#3E8E84] hover:text-[#2C6B63] underline underline-offset-4"
                  >
                    <span>指導経験のある方へ：初期パートナーコーチ募集を見る</span>
                    <ArrowRight className="w-3.5 h-3.5" strokeWidth={1.75} />
                  </Link>
                </div>
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
