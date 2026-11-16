import { MetadataRoute } from 'next';

/**
 * 検索エンジン・AIクローラー向け robots.txt (/robots.txt)
 * 公開ページを許可し、認証・決済・チャット・管理系ルートをクロール対象外に設定
 */
export default function robots(): MetadataRoute.Robots {
  const baseUrl =
    process.env.NEXT_PUBLIC_APP_URL || 'https://kids-coach-navi.vercel.app';

  return {
    rules: [
      {
        userAgent: '*',
        allow: ['/', '/sports/', '/coaches/'],
        disallow: [
          '/admin/',
          '/api/',
          '/chat/',
          '/checkout/',
          '/coach/',
          '/login',
          '/member/',
        ],
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}
