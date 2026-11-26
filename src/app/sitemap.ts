import { MetadataRoute } from 'next';
import { AREA_SEO_AUDIT_DATA } from '@/lib/area-seo-audit';
import { SPORT_CATEGORIES, AREA_LIST, MOCK_COACHES } from '@/data/kids-coach-mock';

const CORE_AREA_SLUGS = ['setagaya', 'meguro', 'minato', 'shibuya', 'shinagawa'];

/**
 * Googleクローラー・AI検索エンジン向け動的サイトマップ (/sitemap.xml)
 * キッズコーチナビの公開ページ群（トップ・種目・種目×初期5区・コーチ詳細）と既存LPを自動通知
 */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl =
    process.env.NEXT_PUBLIC_APP_URL || 'https://kids-coach-navi.com';

  // 1. 静的・主要ページ
  const staticRoutes: MetadataRoute.Sitemap = [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1.0,
    },
    {
      url: `${baseUrl}/faq`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.6,
    },
    {
      url: `${baseUrl}/contact`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.5,
    },
    {
      url: `${baseUrl}/terms`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.4,
    },
    {
      url: `${baseUrl}/privacy`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.4,
    },
    {
      url: `${baseUrl}/tokushoho`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.4,
    },
    {
      url: `${baseUrl}/trial`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.7,
    },
  ];

  // 2. キッズコーチナビ 種目ページ (/sports/[sport_slug])
  const activeSports = SPORT_CATEGORIES.filter((s) => s.slug !== 'niche-sports');
  const sportRoutes: MetadataRoute.Sitemap = activeSports.map((sport) => ({
    url: `${baseUrl}/sports/${sport.slug}`,
    lastModified: new Date(),
    changeFrequency: 'weekly',
    priority: 0.9,
  }));

  // 3. キッズコーチナビ 種目×初期5区エリアページ (/sports/[sport_slug]/[area_slug])
  const coreAreas = AREA_LIST.filter((a) => CORE_AREA_SLUGS.includes(a.slug));
  const sportAreaRoutes: MetadataRoute.Sitemap = activeSports.flatMap((sport) =>
    coreAreas.map((area) => ({
      url: `${baseUrl}/sports/${sport.slug}/${area.slug}`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.85,
    }))
  );

  // 4. キッズコーチナビ コーチ詳細ページ (/coaches/[id])
  const coachRoutes: MetadataRoute.Sitemap = MOCK_COACHES.map((coach) => ({
    url: `${baseUrl}/coaches/${coach.id}`,
    lastModified: new Date(),
    changeFrequency: 'weekly',
    priority: 0.8,
  }));

  // 5. 既存商圏エリアLP (/personal_swim/[area])
  const legacyAreaRoutes: MetadataRoute.Sitemap = AREA_SEO_AUDIT_DATA.map((area) => ({
    url: `${baseUrl}/personal_swim/${area.areaKey}`,
    lastModified: new Date(),
    changeFrequency: 'weekly',
    priority: 0.6,
  }));

  return [
    ...staticRoutes,
    ...sportRoutes,
    ...sportAreaRoutes,
    ...coachRoutes,
    ...legacyAreaRoutes,
  ];
}
