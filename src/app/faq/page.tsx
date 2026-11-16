import React from 'react';
import { Metadata } from 'next';
import Link from 'next/link';
import KidsCoachNavbar from '@/components/kids-coach/Navbar';
import KidsCoachFooter from '@/components/kids-coach/Footer';
import JsonLd from '@/components/kids-coach/JsonLd';
import { ArrowLeft, HelpCircle, MessageSquare } from 'lucide-react';

export const metadata: Metadata = {
  title: 'よくある質問（FAQ） | キッズコーチナビ',
  description:
    'キッズコーチナビ（運営：SWIM PARTNERS）の料金、キャンセル・雨天振替、持ち物、安全管理・保険等に関するよくある質問をまとめています。',
};

const FAQ_SECTIONS = [
  {
    category: '料金・お支払いについて',
    items: [
      {
        q: '入会金や月会費はかかりますか？',
        a: 'いいえ、入会金・月会費・年会費は一切かかりません。必要なのは1回ごとのレッスン料金のみの完全都度払いです。',
      },
      {
        q: 'レッスン料金はいくらですか？交通費は別にかかりますか？',
        a: 'レッスン料金は担当コーチ・種目ごとに設定されており、最低5,000円〜（税込・コーチの出張交通費込み）となっております。有料プール等の施設を利用する場合の入場料・利用料のみ実費をご負担ください。',
      },
      {
        q: '支払い方法は何に対応していますか？',
        a: 'クレジットカード事前決済（Stripe利用）に対応しています。カード番号等の機密情報は決済代行会社のStripeが安全に管理し、当サイト側では一切保持いたしません。',
      },
    ],
  },
  {
    category: '予約・キャンセル・雨天振替について',
    items: [
      {
        q: '子どもの体調不良などでキャンセルしたい場合はどうなりますか？',
        a: 'レッスン前日の正午（12:00）までのご連絡・お手続きであればキャンセル料は無料（全額返金）です。前日正午以降の保護者様都合によるキャンセルは返金対象外となります。',
      },
      {
        q: '当日雨が降った場合はどうなりますか？',
        a: '屋外レッスンの雨天時は、レッスン開始の2時間前までであれば追加費用なしで別日程への振替が可能です。',
      },
      {
        q: 'コーチ側の都合でレッスンが中止になった場合は？',
        a: '急病や交通トラブルなどコーチ都合による中止・キャンセルの場合は、決済手数料等を含め全額返金いたします。',
      },
    ],
  },
  {
    category: 'レッスン当日・安全管理・保険について',
    items: [
      {
        q: '対象年齢は何歳からですか？',
        a: '主に3歳〜小学生（年中・年長・小学生）を中心に対応しておりますが、種目やコーチによって対応年齢が異なります。各コーチの詳細プロフィールにてご確認ください。',
      },
      {
        q: '保護者の見学・同伴は必要ですか？',
        a: 'お子様の安全確保および体調変化への迅速な対応のため、原則として保護者様のご見学・同伴をお願いしております。',
      },
      {
        q: 'スポーツ保険や賠償責任保険は自動付帯していますか？',
        a: '現在、当サービスとして一律に自動付帯する保険制度は設けておりません。安全第一での指導・事前ヒアリングを徹底しておりますが、万が一のケガや事故に備え、必要に応じて各ご家庭にてスポーツ保険等への任意加入をご検討ください。',
      },
      {
        q: '持ち物や服装は何が必要ですか？',
        a: '動きやすい服装・運動靴・飲み物・タオルをお持ちください。水泳の場合は水着・キャップ・ゴーグル、逆上がりや縄跳び等の場合は種目に合わせた道具（お持ちの場合）をご準備いただきます。詳細は予約後のサイト内チャットでコーチと確認できます。',
      },
    ],
  },
  {
    category: '連絡方法・その他',
    items: [
      {
        q: 'コーチと個人のLINEや電話番号で直接連絡・予約できますか？',
        a: '安全管理およびトラブル防止のため、個人の連絡先交換やサイト外での直接取引・現金手渡しは利用規約で禁止しております。待ち合わせ調整や事前相談はすべてサイト内の専用チャットをご利用ください。',
      },
    ],
  },
];

export default function FaqPage() {
  const faqJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: FAQ_SECTIONS.flatMap((sec) =>
      sec.items.map((item) => ({
        '@type': 'Question',
        name: item.q,
        acceptedAnswer: {
          '@type': 'Answer',
          text: item.a,
        },
      }))
    ),
  };

  return (
    <div className="min-h-screen bg-[#FDFBF7] text-[#2C2B29] flex flex-col font-sans">
      <JsonLd data={faqJsonLd} />
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

          <article className="bg-white rounded-3xl border border-[#EADBCC] p-6 sm:p-10 shadow-xs space-y-8">
            <header className="border-b border-[#EADBCC] pb-5 space-y-1.5">
              <span className="font-en text-[10px] font-extrabold tracking-widest uppercase text-[#3E8E84] block">
                FREQUENTLY ASKED QUESTIONS
              </span>
              <h1 className="font-heading text-xl sm:text-2xl font-bold text-[#2C2B29]">
                よくある質問（FAQ）
              </h1>
              <p className="text-[11px] text-[#8A857B]">
                保護者・受講者様からよくいただくご質問をまとめています。
              </p>
            </header>

            <div className="space-y-8">
              {FAQ_SECTIONS.map((section) => (
                <section key={section.category} className="space-y-3.5">
                  <h2 className="font-heading text-base font-bold text-[#2C2B29] flex items-center gap-2">
                    <HelpCircle className="w-4 h-4 text-[#E3644F] shrink-0" strokeWidth={2} />
                    <span>{section.category}</span>
                  </h2>

                  <div className="space-y-3">
                    {section.items.map((item) => (
                      <div
                        key={item.q}
                        className="rounded-2xl border border-[#EADBCC] bg-[#FDFBF7] p-4 sm:p-5 space-y-2"
                      >
                        <h3 className="font-bold text-xs sm:text-sm text-[#2C2B29] flex items-start gap-2">
                          <span className="font-en font-extrabold text-[#E3644F] shrink-0">
                            Q.
                          </span>
                          <span>{item.q}</span>
                        </h3>
                        <p className="text-xs sm:text-sm text-[#5E5B54] leading-relaxed flex items-start gap-2">
                          <span className="font-en font-extrabold text-[#3E8E84] shrink-0">
                            A.
                          </span>
                          <span>{item.a}</span>
                        </p>
                      </div>
                    ))}
                  </div>
                </section>
              ))}
            </div>

            <div className="pt-4 border-t border-[#EADBCC] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="space-y-0.5">
                <p className="font-bold text-xs sm:text-sm text-[#2C2B29]">
                  解決しないご質問がございますか？
                </p>
                <p className="text-[11px] text-[#5E5B54]">
                  運営事務局（SWIM PARTNERS）へ直接お問い合わせいただけます。
                </p>
              </div>
              <Link
                href="/contact"
                className="px-5 py-2.5 rounded-full bg-[#E3644F] hover:bg-[#d05540] text-white text-xs font-bold inline-flex items-center gap-1.5 transition-colors shrink-0"
              >
                <MessageSquare className="w-3.5 h-3.5" strokeWidth={1.75} />
                <span>お問い合わせフォームへ</span>
              </Link>
            </div>
          </article>
        </div>
      </main>

      <KidsCoachFooter />
    </div>
  );
}
