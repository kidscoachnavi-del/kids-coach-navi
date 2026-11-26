import React from 'react';
import { Metadata } from 'next';
import HomePageClient from '@/components/kids-coach/HomePageClient';
import JsonLd from '@/components/kids-coach/JsonLd';

const SITE_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://kids-coach-navi.com';

export const metadata: Metadata = {
  title: 'キッズコーチナビ by SWIM PARTNERS ｜ 子どもの本当の「できた！」に出会う',
  description:
    '子どもには、運動の楽しさに出会って、自信に満ちた笑顔になって欲しい。入会金0円の都度払いで受けられる出張個別スポーツ指導マッチングサービス（世田谷区・目黒区・港区・渋谷区・品川区対応）。',
  keywords: [
    'キッズコーチナビ',
    '子ども スポーツ 個人レッスン',
    'かけっこ 教室 出張',
    '水泳 マンツーマン 子ども',
    '逆上がり 個人指導',
    '世田谷区 目黒区 港区 渋谷区 品川区',
  ],
  alternates: {
    canonical: `${SITE_URL}/`,
  },
  openGraph: {
    type: 'website',
    locale: 'ja_JP',
    url: `${SITE_URL}/`,
    siteName: 'キッズコーチナビ by SWIM PARTNERS',
    title: 'キッズコーチナビ by SWIM PARTNERS ｜ 子どもの本当の「できた！」に出会う',
    description:
      'かけっこ・学校体育（逆上がり/跳び箱/縄跳び）・水泳の出張マンツーマン指導。入会金0円・1回都度払いで、本人確認済みコーチが近隣の公園や利用可能施設へ出張します。',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'キッズコーチナビ by SWIM PARTNERS ｜ 子どもの本当の「できた！」に出会う',
    description:
      '入会金0円・都度払いの子ども向け出張スポーツ個人レッスン。かけっこ・学校体育・水泳に対応。',
  },
};

export default function HomePage() {
  // AIO・Google検索向けの構造化データ（Organization / Service / FAQPage）
  const homeJsonLd = [
    {
      '@context': 'https://schema.org',
      '@type': 'Organization',
      name: 'キッズコーチナビ by SWIM PARTNERS',
      url: SITE_URL,
      parentOrganization: {
        '@type': 'Organization',
        name: 'SWIM PARTNERS',
      },
      areaServed: ['東京都世田谷区', '東京都目黒区', '東京都港区', '東京都渋谷区', '東京都品川区'],
    },
    {
      '@context': 'https://schema.org',
      '@type': 'Service',
      name: 'キッズコーチナビ 出張個別スポーツ指導',
      serviceType: '子ども向け出張マンツーマン運動指導（かけっこ・学校体育克服・水泳）',
      provider: {
        '@type': 'Organization',
        name: 'SWIM PARTNERS',
      },
      areaServed: [
        { '@type': 'City', name: '世田谷区' },
        { '@type': 'City', name: '目黒区' },
        { '@type': 'City', name: '港区' },
        { '@type': 'City', name: '渋谷区' },
        { '@type': 'City', name: '品川区' },
      ],
      offers: {
        '@type': 'AggregateOffer',
        priceCurrency: 'JPY',
        lowPrice: 5000,
        offerCount: 3,
      },
    },
    {
      '@context': 'https://schema.org',
      '@type': 'FAQPage',
      mainEntity: [
        {
          '@type': 'Question',
          name: 'レッスン場所はどのように決まりますか？',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'かけっこや鉄棒などはご自宅近くの公園や広場で実施可能です。水泳などの施設競技は、個人指導が許可されているプールやスポーツ施設をご利用いただきます。対応エリア内であればコーチから実施可能な最適スポットをご提案します。',
          },
        },
        {
          '@type': 'Question',
          name: '運動が極端に苦手・水が怖くても大丈夫ですか？',
          acceptedAnswer: {
            '@type': 'Answer',
            text: '大歓迎です。無理強いは一切せず、お子様の性格やペースに合わせて遊びの延長からスモールステップで進めますのでご安心ください。',
          },
        },
        {
          '@type': 'Question',
          name: '予約の流れとお支払いのタイミングを教えてください。',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'コーチの空き枠を確認したあと、専用チャットで希望日時や実施場所をご相談いただきます。日程と場所が決定した後にクレジットカードで事前決済を行う流れのため、当日の現金手渡しは不要です。',
          },
        },
        {
          '@type': 'Question',
          name: '急な発熱や雨天時の変更・キャンセルはできますか？',
          acceptedAnswer: {
            '@type': 'Answer',
            text: '通常のご変更・キャンセルは前日正午（12:00）まで無料で対応しています。屋外レッスンにおける雨天時は、当日の開始2時間前まで手数料なしで別日へ振り替え可能です。',
          },
        },
        {
          '@type': 'Question',
          name: '表示されているレッスン料金以外にかかる費用はありますか？',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'コーチごとに設定されたレッスン料金（税込・出張交通費込）以外の追加費用はかかりません。入会金や月会費も不要です。有料プール等を利用する場合の施設入場料のみ実費をご負担いただきます。',
          },
        },
      ],
    },
  ];

  return (
    <>
      <JsonLd data={homeJsonLd} />
      <HomePageClient />
    </>
  );
}
