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
import { filterCoachesForSport } from '@/lib/kcn-sport-matching';
import {
  SPORT_CATEGORIES,
  AREA_LIST,
  SPORT_VISUALS,
} from '@/data/kids-coach-mock';
import { ChevronRight, MapPin, Check, ArrowRight } from 'lucide-react';

interface SportPageProps {
  params: Promise<{
    sport_slug: string;
  }>;
}

export async function generateMetadata({
  params,
}: SportPageProps): Promise<Metadata> {
  const { sport_slug } = await params;
  const category = SPORT_CATEGORIES.find((c) => c.slug === sport_slug);

  if (!category) {
    return {
      title: '種目が見つかりません | キッズコーチナビ by SWIM PARTNERS',
    };
  }

  const siteUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://kids-coach-navi.com';
  const title = `子ども向け${category.name}の出張マンツーマン指導 | キッズコーチナビ by SWIM PARTNERS`;
  const description = `${category.name}のマンツーマン指導・出張個人レッスン。${category.shortDesc}。入会金・月会費なしの都度払いで、東京都内5区（世田谷区・目黒区・港区・渋谷区・品川区）を中心に認定コーチが出張指導。運営：SWIM PARTNERS。`;

  return {
    title,
    description,
    alternates: {
      canonical: `${siteUrl}/sports/${category.slug}`,
    },
    openGraph: {
      type: 'website',
      locale: 'ja_JP',
      url: `${siteUrl}/sports/${category.slug}`,
      title,
      description,
    },
  };
}

export default async function SportCategoryPage({ params }: SportPageProps) {
  const { sport_slug } = await params;
  const category = SPORT_CATEGORIES.find((c) => c.slug === sport_slug);

  if (!category) {
    notFound();
  }

  // 該当種目のコーチを抽出（承認済みDB実データ＋種目整合チェック）
  const { coaches: allCoaches, slots: allSlots } = await fetchApprovedCoachesWithSlots();
  const coaches = filterCoachesForSport(allCoaches, sport_slug);

  // Service 構造化データ（JSON-LD）
  const serviceJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Service',
    serviceType: `子ども向け${category.name}出張マンツーマン指導`,
    name: `キッズコーチナビ ${category.name}指導`,
    provider: {
      '@type': 'Organization',
      name: 'SWIM PARTNERS',
      url: 'https://kids-coach-navi.com',
    },
    description: category.longDesc,
    offers: {
      '@type': 'Offer',
      price: category.priceFrom,
      priceCurrency: 'JPY',
      availability:
        coaches.length > 0
          ? 'https://schema.org/InStock'
          : 'https://schema.org/PreOrder',
    },
    areaServed: AREA_LIST.map((area) => `${area.prefecture}${area.name}`),
    audience: {
      '@type': 'Audience',
      audienceType: '保護者・お子様（3歳〜高校生）',
    },
  };

  return (
    <div className="min-h-screen bg-[#FDFBF7] text-[#2C2B29] flex flex-col font-sans">
      <JsonLd data={serviceJsonLd} />
      <KidsCoachNavbar />

      <main className="flex-1 py-8 md:py-12">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 space-y-10">
          {/* パンくずリスト */}
          <nav className="flex items-center gap-1.5 text-xs text-[#5E5B54] overflow-x-auto whitespace-nowrap font-bold">
            <Link href="/" className="hover:text-[#E3644F] transition-colors">
              ホーム
            </Link>
            <ChevronRight className="w-3.5 h-3.5 text-[#5E5B54]/60 shrink-0" strokeWidth={1.75} />
            <Link href="/#coaches" className="hover:text-[#E3644F] transition-colors">
              種目カテゴリー
            </Link>
            <ChevronRight className="w-3.5 h-3.5 text-[#5E5B54]/60 shrink-0" strokeWidth={1.75} />
            <span className="text-[#2C2B29] font-bold truncate">
              {category.name}
            </span>
          </nav>

          {/* 他種目クイック切替バー */}
          <div className="flex flex-wrap items-center gap-2">
            {SPORT_CATEGORIES.map((item) => {
              const active = item.slug === category.slug;
              return (
                <Link
                  key={item.slug}
                  href={`/sports/${item.slug}`}
                  className={`px-3.5 py-1.5 rounded-full text-xs font-bold border transition-colors ${
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

          {/* 種目ヘッダーHero */}
          {(() => {
            const visual = SPORT_VISUALS[category.slug] || SPORT_VISUALS.running;
            return (
              <div className="bg-white rounded-3xl p-6 sm:p-10 border border-[#EADBCC] shadow-xs flex flex-col md:flex-row items-center justify-between gap-6 md:gap-8">
                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2 mb-3">
                    <span className="font-en text-[11px] font-extrabold tracking-widest text-[#E3644F] bg-orange-50 px-3 py-1 rounded-full">
                      {category.code}
                    </span>
                    <span className="text-xs font-bold text-[#3E8E84] bg-[#3E8E84]/10 px-3 py-1 rounded-full">
                      {category.badge}
                    </span>
                  </div>

                  <h1 className="font-heading tracking-tight mb-3.5 space-y-1">
                    <span className="block text-2xl sm:text-3xl lg:text-4xl font-extrabold text-[#2C2B29] leading-tight">
                      {category.name}
                    </span>
                    <span className="block text-sm sm:text-base font-bold text-[#3E8E84] tracking-wide">
                      出張マンツーマンレッスン
                    </span>
                  </h1>

                  <p className="text-xs sm:text-sm text-[#5E5B54] leading-relaxed mb-5">
                    {category.longDesc}
                  </p>

                  {/* サブカテゴリーピル */}
                  <div className="flex flex-wrap gap-2 mb-5">
                    {category.subCategories.map((sub, i) => (
                      <span
                        key={i}
                        className="inline-flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-full bg-[#FDFBF7] text-[#2C2B29] border border-[#EADBCC]"
                      >
                        <Check className="w-3 h-3 text-[#3E8E84]" strokeWidth={2} />
                        <span>{sub}</span>
                      </span>
                    ))}
                  </div>

                  <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-xs font-bold text-[#5E5B54] bg-[#FDFBF7] p-4 rounded-2xl border border-[#EADBCC]">
                    <div>
                      レッスン料金:{' '}
                      <strong className="font-en text-base text-[#E3644F] font-extrabold">
                        ￥{category.priceFrom.toLocaleString()}〜
                      </strong>{' '}
                      / 60分（税込・交通費込）
                    </div>
                    <div className="h-3 w-[1px] bg-[#EADBCC] hidden sm:block" />
                    <div>
                      推奨年齢: <strong className="text-[#2C2B29]">{category.recommendedAges}</strong>
                    </div>
                    <div className="h-3 w-[1px] bg-[#EADBCC] hidden sm:block" />
                    <div className="text-[#3E8E84]">
                      入会金・月会費なし（都度払い）
                    </div>
                  </div>
                </div>

                {/* 右側イラストモチーフ */}
                <div className="relative w-40 h-40 sm:w-48 sm:h-48 lg:w-52 lg:h-52 shrink-0 flex items-center justify-center">
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

          {/* この種目のコーチ一覧 */}
          <div>
            <div className="mb-6 flex flex-wrap items-end justify-between gap-2">
              <div>
                <h2 className="font-heading text-xl sm:text-2xl font-bold text-[#2C2B29]">
                  {category.name}の担当コーチ（{coaches.length}名）
                </h2>
                <p className="text-xs text-[#5E5B54] mt-1">
                  事前審査・本人確認済みの認定コーチです。空き枠を確認して日程調整をご相談いただけます。
                </p>
              </div>
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
                  現在、{category.name}を担当できる認定コーチを順次募集・審査中です。
                </p>
                <p>
                  ご希望のエリア・条件は下記リクエストフォームよりお寄せください。対応可能なコーチが登録され次第ご案内します。
                </p>
                <div>
                  <Link
                    href="/coach-recruit"
                    className="inline-flex items-center gap-1.5 text-xs font-bold text-[#3E8E84] hover:text-[#2C6B63] underline underline-offset-4"
                  >
                    <span>{category.name}の指導経験がある方へ：初期パートナーコーチ募集を見る</span>
                    <ArrowRight className="w-3.5 h-3.5" strokeWidth={1.75} />
                  </Link>
                </div>
              </div>
            )}
          </div>

          {/* 種目・エリアリクエスト（需要データ収集） */}
          <DemandRequestCard defaultSport={category.name} />

          {/* 地域別ページへのSEO内部リンク（SSoT：初期エリアは東京都内5区のみ） */}
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#EADBCC] shadow-xs">
            <h3 className="font-heading text-base sm:text-lg font-bold text-[#2C2B29] mb-2 flex items-center gap-2">
              <MapPin className="w-4 h-4 text-[#E3644F]" strokeWidth={1.75} />
              <span>東京都内の{category.name} 対応エリア（初期対象5区）</span>
            </h3>
            <p className="text-xs text-[#5E5B54] mb-6">
              現在は東京都内5区を中心に展開しています。ご希望の区を選択すると、駅・エリア別の対応状況や認定コーチをご確認いただけます。
            </p>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
              {AREA_LIST.map((area) => (
                <Link
                  key={area.slug}
                  href={`/sports/${category.slug}/${area.slug}`}
                  className="p-3.5 rounded-2xl bg-[#FDFBF7] hover:bg-[#FCE7A2]/40 border border-[#EADBCC] hover:border-[#E3644F] text-xs font-bold text-[#2C2B29] transition-all flex items-center justify-between group"
                >
                  <span className="truncate">{area.name}</span>
                  <ArrowRight className="w-3.5 h-3.5 text-[#5E5B54] group-hover:text-[#E3644F] group-hover:translate-x-0.5 transition-all shrink-0" strokeWidth={1.75} />
                </Link>
              ))}
            </div>

            <p className="text-[11px] text-[#5E5B54] mt-4">
              ※上記以外の区・エリアは順次拡大予定です。ご希望エリアがある場合は上記のリクエストフォームよりお寄せください。
            </p>
          </div>
        </div>
      </main>

      <KidsCoachFooter showCoachRecruit />
    </div>
  );
}
