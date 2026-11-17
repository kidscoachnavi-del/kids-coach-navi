'use client';

import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import {
  Monitor,
  Tablet,
  Smartphone,
  Search,
  MapPin,
  ChevronRight,
  ChevronDown,
  ArrowRight,
  ArrowDown,
  Check,
  Clock,
  Shield,
  ShieldCheck,
  Award,
  Star,
  CreditCard,
  MessageSquare,
  X,
} from 'lucide-react';

type ViewportMode = 'desktop' | 'tablet' | 'mobile';
type SportKey = 'kakekko' | 'swimming' | 'iron-bar' | 'jump-rope';

interface CoachPreviewData {
  id: string;
  sportLabel: string;
  sportSlug: string;
  name: string;
  bio: string;
  rating: string;
  reviewCount: number;
  tag: string;
  title: string;
  summary: string;
  area: string;
  priceAmount: string;
  initial: string;
  nextSlots: { dateLabel: string; timeLabel: string }[];
}

const COACH_DATA: Record<SportKey, CoachPreviewData> = {
  kakekko: {
    id: 'coach-1',
    sportLabel: 'かけっこ',
    sportSlug: 'running',
    name: '田中 健太 コーチ',
    bio: '元インカレ陸上 ｜ 指導歴5年',
    rating: '4.9',
    reviewCount: 42,
    tag: '#かけっこ・走り方',
    title: '【世田谷・駒沢】腕振りと姿勢で劇的に変わる！足が速くなる60分特訓',
    summary: '地面を蹴る感覚と腕振りの連動を楽しく習得。運動会前の単発受講でもフォームの変化を実感できます。',
    area: '世田谷区・目黒区・駒沢公園周辺へ出張',
    priceAmount: '6,500',
    initial: '田中',
    nextSlots: [
      { dateLabel: '11/14 (土)', timeLabel: '10:00〜' },
      { dateLabel: '11/14 (土)', timeLabel: '13:30〜' },
      { dateLabel: '11/15 (日)', timeLabel: '10:00〜' },
    ],
  },
  swimming: {
    id: 'coach-2',
    sportLabel: '水泳',
    sportSlug: 'swimming',
    name: '山本 翔平 コーチ',
    bio: '日本水泳連盟公認指導員 ｜ 元国体選手',
    rating: '5.0',
    reviewCount: 38,
    tag: '#水泳・息継ぎ',
    title: '【江東・中央】苦手克服！クロール息継ぎ・25m完泳マンツーマン 60分',
    summary: '集団スクールで進級できない原因を60分で特定。個人指導が可能なプール施設等へ出張し、怖がらせずに完泳へ導きます。',
    area: '江東区・中央区（レッスン可能なプール施設へ出張）',
    priceAmount: '7,500',
    initial: '山本',
    nextSlots: [
      { dateLabel: '11/14 (土)', timeLabel: '13:30〜' },
      { dateLabel: '11/15 (日)', timeLabel: '10:00〜' },
      { dateLabel: '11/16 (月)', timeLabel: '16:00〜' },
    ],
  },
  'iron-bar': {
    id: 'coach-3',
    sportLabel: '逆上がり・鉄棒',
    sportSlug: 'school-pe',
    name: '佐々木 翼 コーチ',
    bio: '元体操競技選手 ｜ 指導歴6年',
    rating: '4.9',
    reviewCount: 51,
    tag: '#鉄棒・逆上がり',
    title: '【目黒・港】回る感覚がすぐ掴める！恐怖心ゼロの逆上がり特訓 60分',
    summary: '筋力ではなく「目線」と「引きつけ」を段階指導。近所の公園の鉄棒で、お子様の成功体験を引き出します。',
    area: '港区・品川区・目黒区・近隣公園へ出張',
    priceAmount: '6,000',
    initial: '佐々木',
    nextSlots: [
      { dateLabel: '11/14 (土)', timeLabel: '10:00〜' },
      { dateLabel: '11/15 (日)', timeLabel: '15:30〜' },
      { dateLabel: '11/17 (火)', timeLabel: '16:00〜' },
    ],
  },
  'jump-rope': {
    id: 'coach-4',
    sportLabel: 'なわとび',
    sportSlug: 'school-pe',
    name: '高橋 陸 コーチ',
    bio: '小学校体育専門指導員 ｜ 体育大卒',
    rating: '4.8',
    reviewCount: 29,
    tag: '#なわとび・二重跳び',
    title: '【千葉・都内】手首の回旋とリズム感で跳べる！二重跳び・体育基礎 60分',
    summary: 'ジャンプのタイミングと手首の回し方を分解指導。学校体育のテスト前に1〜2回の短期集中で自信がつきます。',
    area: '世田谷区・品川区・浦安市・近隣公園へ出張',
    priceAmount: '5,500',
    initial: '高橋',
    nextSlots: [
      { dateLabel: '11/15 (日)', timeLabel: '13:30〜' },
      { dateLabel: '11/16 (月)', timeLabel: '17:30〜' },
      { dateLabel: '11/18 (水)', timeLabel: '16:00〜' },
    ],
  },
};

type VoiceSportFilter = 'all' | 'kakekko' | 'swimming' | 'iron-bar';
type VoiceAccent = 'coral' | 'sage' | 'sun';

interface LessonModelItem {
  id: string;
  sportKey: Exclude<VoiceSportFilter, 'all'>;
  sportLabel: string;
  planTheme: string;
  durationGuide: string;
  accent: VoiceAccent;
  concernText: string;
  goalText: string;
  coachingTip: string;
  coachId: string;
  coachName: string;
}

const VOICE_THEME_STYLES: Record<
  VoiceAccent,
  {
    sportTag: string;
    sessionBadge: string;
    arrowCircle: string;
    afterBox: string;
    afterBadge: string;
  }
> = {
  coral: {
    sportTag: 'text-[#E3644F] bg-white border-[#E3644F]/30',
    sessionBadge: 'bg-orange-50 text-[#E3644F] border-[#E3644F]/25',
    arrowCircle: 'bg-[#E3644F] text-white',
    afterBox: 'bg-orange-50/75 border-[#E3644F]/35 border-l-4 border-l-[#E3644F]',
    afterBadge: 'bg-[#E3644F] text-white',
  },
  sage: {
    sportTag: 'text-[#3E8E84] bg-white border-[#3E8E84]/35',
    sessionBadge: 'bg-[#D2E7DF]/55 text-[#2C6B63] border-[#3E8E84]/25',
    arrowCircle: 'bg-[#3E8E84] text-white',
    afterBox: 'bg-[#D2E7DF]/35 border-[#3E8E84]/35 border-l-4 border-l-[#3E8E84]',
    afterBadge: 'bg-[#3E8E84] text-white',
  },
  sun: {
    sportTag: 'text-amber-900 bg-white border-[#D4A11D]/45',
    sessionBadge: 'bg-[#FCE7A2]/60 text-amber-950 border-[#D4A11D]/35',
    arrowCircle: 'bg-[#D4A11D] text-white',
    afterBox: 'bg-[#FCE7A2]/30 border-[#D4A11D]/40 border-l-4 border-l-[#D4A11D]',
    afterBadge: 'bg-[#D4A11D] text-white',
  },
};

const LESSON_MODELS: LessonModelItem[] = [
  {
    id: 'model-kakekko',
    sportKey: 'kakekko',
    sportLabel: 'かけっこ',
    planTheme: '運動会・徒競走対策プラン',
    durationGuide: '目安：60分 × 1回〜',
    accent: 'coral',
    concernText: '腕が横に振れてしまい、全力で走ってもスピードに乗りきれない。',
    goalText: '腕振りと地面を蹴る感覚を楽しく掴み、まっすぐ力強く走れるフォームへ！',
    coachingTip:
      'まずは走り方のクセを一緒に確認し、楽しいミニゲームやドリルを通じて正しい腕振りと姿勢を身につけます。',
    coachId: 'coach-1',
    coachName: '田中 健太 コーチ',
  },
  {
    id: 'model-swimming',
    sportKey: 'swimming',
    sportLabel: '水泳',
    planTheme: 'クロール息継ぎ克服プラン',
    durationGuide: '目安：60分 × 1〜2回',
    accent: 'sage',
    concernText: '集団レッスンでは順番待ちが多く、息継ぎのコツを掴みにくい。',
    goalText: '個人指導可能なプールで、お子様のペースに合わせて呼吸と腕の動きを習得！',
    coachingTip:
      '水への不安を丁寧にほぐしながら、顔つけ・バタ足・横向き息継ぎのタイミングを1つずつ分解して練習します。',
    coachId: 'coach-2',
    coachName: '山本 翔平 コーチ',
  },
  {
    id: 'model-iron-bar',
    sportKey: 'iron-bar',
    sportLabel: '逆上がり・鉄棒',
    planTheme: '恐怖心ケア・導入プラン',
    durationGuide: '目安：60分 × 1回〜',
    accent: 'sun',
    concernText: '回る感覚が掴めず怖さがあり、公園の鉄棒を避けてしまっている。',
    goalText: '段階的な補助と声かけで怖さをほぐし、1人で回りきる感覚を習得！',
    coachingTip:
      'いきなり回るのではなく、腕の引きつけや目線の位置を段階練習。小さな「できた！」を積み重ねて自信を育てます。',
    coachId: 'coach-3',
    coachName: '佐々木 翼 コーチ',
  },
];

interface FaqItem {
  id: number;
  category: string;
  question: string;
  answer: string;
}

const FAQ_ITEMS: FaqItem[] = [
  {
    id: 1,
    category: 'レッスン場所',
    question: 'レッスン場所はどのように決まりますか？',
    answer:
      'かけっこや鉄棒などはご自宅近くの公園や広場で実施可能です。水泳などの施設競技は、個人指導が許可されているプールやスポーツ施設をご利用いただきます（公営施設等では指導が禁止されている場合があるため、対応エリア内であればコーチから実施可能な最適スポットをご提案します）。',
  },
  {
    id: 2,
    category: '対象・レベル',
    question: '運動が極端に苦手・水が怖くても大丈夫ですか？',
    answer:
      '大歓迎です。無理強いは一切せず、お子様の性格やペースに合わせて遊びの延長からスモールステップで進めますのでご安心ください。',
  },
  {
    id: 3,
    category: '予約・お支払い',
    question: '予約の流れとお支払いのタイミングを教えてください。',
    answer:
      'コーチの空き枠を確認したあと、専用チャットで希望日時や実施場所をご相談いただきます。日程と場所が決定した後にクレジットカードで事前決済を行う流れのため、当日の現金手渡しは不要です。',
  },
  {
    id: 4,
    category: '変更・キャンセル',
    question: '急な発熱や雨天時の変更・キャンセルはできますか？',
    answer:
      '通常のご変更・キャンセルは前日正午（12:00）まで無料で対応しています。屋外レッスンにおける雨天時は、当日の開始2時間前まで手数料なしで別日へ振り替え可能です。',
  },
  {
    id: 5,
    category: '料金について',
    question: '表示されているレッスン料金以外にかかる費用はありますか？',
    answer:
      'コーチごとに設定されたレッスン料金（税込・出張交通費込）以外の追加費用はかかりません。入会金や月会費も不要です。有料プール等を利用する場合の施設入場料のみ実費をご負担いただきます。',
  },
  {
    id: 6,
    category: 'ご見学・ご相談',
    question: '保護者の見学や、兄弟・姉妹での受講相談はできますか？',
    answer:
      '保護者様のご見学は自由です。兄弟・姉妹での同時指導や年齢に合わせた進め方については、日程調整時の専用チャットにて担当コーチへお気軽にご相談ください。',
  },
];

export default function HomePageClient() {
  const [viewport, setViewport] = useState<ViewportMode>('desktop');
  const [showPreviewBar, setShowPreviewBar] = useState<boolean>(
    process.env.NODE_ENV !== 'production'
  );
  const [selectedSport, setSelectedSport] = useState<SportKey>('kakekko');
  const [selectedArea, setSelectedArea] = useState<string>('世田谷区');
  const [voiceFilter, setVoiceFilter] = useState<VoiceSportFilter>('all');
  const [cardOpacity, setCardOpacity] = useState<number>(1);
  const [openFaqs, setOpenFaqs] = useState<Record<number, boolean>>({ 1: true });
  const [menuOpen, setMenuOpen] = useState<boolean>(false);
  const [toastMsg, setToastMsg] = useState<string>('操作が完了しました');
  const [toastVisible, setToastVisible] = useState<boolean>(false);
  const toastTimerRef = useRef<NodeJS.Timeout | null>(null);

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setToastVisible(true);
    if (toastTimerRef.current) {
      clearTimeout(toastTimerRef.current);
    }
    toastTimerRef.current = setTimeout(() => {
      setToastVisible(false);
    }, 3000);
  };

  useEffect(() => {
    return () => {
      if (toastTimerRef.current) {
        clearTimeout(toastTimerRef.current);
      }
    };
  }, []);

  const handleSportChange = (newSport: SportKey) => {
    setCardOpacity(0.5);
    setTimeout(() => {
      setSelectedSport(newSport);
      setCardOpacity(1);
    }, 150);
  };

  const toggleFaq = (idx: number) => {
    setOpenFaqs((prev) => ({
      ...prev,
      [idx]: !prev[idx],
    }));
  };

  const allFaqsOpen = FAQ_ITEMS.every((item) => Boolean(openFaqs[item.id]));

  const toggleAllFaqs = () => {
    const nextOpen = !allFaqsOpen;
    const nextState: Record<number, boolean> = {};
    for (const item of FAQ_ITEMS) {
      nextState[item.id] = nextOpen;
    }
    setOpenFaqs(nextState);
  };

  const currentCoach = COACH_DATA[selectedSport] || COACH_DATA.kakekko;

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      if (params.get('preview') === '1') {
        setShowPreviewBar(true);
      }
    }
  }, []);

  const viewportMaxWidth = !showPreviewBar
    ? '100%'
    : viewport === 'desktop'
      ? '100%'
      : viewport === 'tablet'
      ? '768px'
      : '390px';

  return (
    <div
      className={`min-h-screen text-[#2C2B29] font-sans antialiased overflow-x-hidden ${
        showPreviewBar ? 'bg-[#E2E8F0]' : 'bg-[#FDFBF7]'
      }`}
    >
      {/* ============================================================== */}
      {/* プレビューコントロールバー（開発環境・?preview=1時のみ表示）     */}
      {/* ============================================================== */}
      {showPreviewBar && (
      <aside className="sticky top-0 z-100 bg-slate-900 text-white px-3 sm:px-4 py-2 sm:py-2.5 shadow-md flex flex-wrap items-center justify-between gap-2 sm:gap-3 border-b border-slate-800 text-xs sm:text-sm max-w-full overflow-x-hidden">
        <div className="flex items-center gap-2 min-w-0">
          <span className="inline-flex items-center justify-center w-6 h-6 rounded-lg bg-[#E3644F] font-en font-extrabold text-white text-xs shrink-0">
            K
          </span>
          <span className="font-bold tracking-tight truncate">
            キッズコーチナビ
          </span>
          <span className="hidden md:inline-block px-2 py-0.5 rounded-full bg-slate-800 text-amber-200 text-[11px] font-en shrink-0">
            Rubik × M PLUS 1 × BIZ UDPGothic
          </span>
        </div>

        {/* デバイス切り替えボタン（モバイル幅ではコンパクトに収める） */}
        <div className="flex items-center bg-slate-800 p-1 rounded-xl border border-slate-700 max-w-full overflow-x-auto">
          <button
            type="button"
            onClick={() => setViewport('desktop')}
            className={`px-2 sm:px-3 py-1 rounded-lg font-bold text-[11px] sm:text-xs flex items-center gap-1 sm:gap-1.5 transition-all cursor-pointer whitespace-nowrap ${
              viewport === 'desktop'
                ? 'bg-[#E3644F] text-white shadow-sm'
                : 'text-slate-300 hover:text-white'
            }`}
          >
            <Monitor className="w-3.5 h-3.5 shrink-0" strokeWidth={1.75} />
            <span>PC</span>
          </button>
          <button
            type="button"
            onClick={() => setViewport('tablet')}
            className={`px-2 sm:px-3 py-1 rounded-lg font-bold text-[11px] sm:text-xs flex items-center gap-1 sm:gap-1.5 transition-all cursor-pointer whitespace-nowrap ${
              viewport === 'tablet'
                ? 'bg-[#E3644F] text-white shadow-sm'
                : 'text-slate-300 hover:text-white'
            }`}
          >
            <Tablet className="w-3.5 h-3.5 shrink-0" strokeWidth={1.75} />
            <span>Tab</span>
          </button>
          <button
            type="button"
            onClick={() => setViewport('mobile')}
            className={`px-2 sm:px-3 py-1 rounded-lg font-bold text-[11px] sm:text-xs flex items-center gap-1 sm:gap-1.5 transition-all cursor-pointer whitespace-nowrap ${
              viewport === 'mobile'
                ? 'bg-[#E3644F] text-white shadow-sm'
                : 'text-slate-300 hover:text-white'
            }`}
          >
            <Smartphone className="w-3.5 h-3.5 shrink-0" strokeWidth={1.75} />
            <span>Mobile</span>
          </button>
        </div>

        <div className="hidden lg:flex items-center gap-2 text-slate-400 text-xs font-medium">
          <span className="w-1.5 h-1.5 rounded-full bg-[#F7D668]" />
          <span>手触りのある装丁文字・ミニマルアイコン設計</span>
        </div>
      </aside>
      )}

      {/* ============================================================== */}
      {/* プレビューラッパーコンテナ                                      */}
      {/* ============================================================== */}
      <div
        className={`w-full flex justify-center ${
          showPreviewBar ? 'py-0 sm:py-6 bg-slate-200' : 'bg-[#FDFBF7]'
        }`}
      >
        <div
          id="viewport-container"
          style={{ maxWidth: viewportMaxWidth }}
          className={`w-full bg-[#FDFBF7] overflow-hidden ${
            showPreviewBar
              ? 'preview-frame shadow-2xl transition-all duration-300 sm:rounded-3xl border border-[#EADBCC]'
              : ''
          }`}
        >
          {/* ==================== 1. Header ==================== */}
          <header className="w-full pt-6 pb-2 px-6 sm:px-10 flex items-center justify-between max-w-5xl mx-auto relative z-20">
            <Link href="/" className="flex items-center gap-2.5 shrink-0">
              {/* 幾何学カードアイコン */}
              <div className="relative w-7 h-9 shrink-0">
                <div className="absolute inset-0 bg-[#F7D668] rounded-md rotate-12" />
                <div className="absolute top-1.5 left-1 w-2 h-2 bg-[#3E8E84] rounded-full" />
                <div className="absolute top-1.5 right-1 w-2 h-2 bg-[#E3644F] rotate-45" />
                <div className="absolute bottom-1.5 left-2.5 w-2 h-2 bg-[#88C8D8] rounded-xs" />
              </div>
              <span className="font-logo font-bold text-xl sm:text-2xl tracking-tight text-[#3A3834] whitespace-nowrap">
                Kids Coach Navi
              </span>
            </Link>

            {/* 右上ハンバーガーメニュー */}
            <button
              type="button"
              aria-label="Menu"
              onClick={() => {
                setMenuOpen((prev) => !prev);
                showToast('メニューを開きます');
              }}
              className="p-2 -mr-2 text-[#2C2B29] hover:opacity-70 transition-opacity focus:outline-none cursor-pointer"
            >
              {menuOpen ? (
                <X className="w-6 h-6" strokeWidth={1.75} />
              ) : (
                <svg
                  className="w-6 h-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  strokeWidth="1.75"
                  strokeLinecap="round"
                >
                  <path d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              )}
            </button>
          </header>

          {/* ドロップダウンメニュー（ハンバーガー展開時） */}
          {menuOpen && (
            <div className="max-w-xl mx-auto px-6 pb-4">
              <nav className="bg-white rounded-2xl p-4 border border-[#EADBCC] shadow-sm space-y-1.5 text-xs font-bold text-[#2C2B29]">
                <a
                  href="#search-box"
                  onClick={() => setMenuOpen(false)}
                  className="flex items-center justify-between py-2 px-3 rounded-xl hover:bg-[#FDFBF7] transition-colors"
                >
                  <span>種目・エリアからコーチを探す</span>
                  <span className="font-en text-[10px] text-[#8A857B]">01</span>
                </a>
                <a
                  href="#features"
                  onClick={() => setMenuOpen(false)}
                  className="flex items-center justify-between py-2 px-3 rounded-xl hover:bg-[#FDFBF7] transition-colors"
                >
                  <span>選ばれる3つの理由</span>
                  <span className="font-en text-[10px] text-[#8A857B]">02</span>
                </a>
                <a
                  href="#cases"
                  onClick={() => setMenuOpen(false)}
                  className="flex items-center justify-between py-2 px-3 rounded-xl hover:bg-[#FDFBF7] transition-colors"
                >
                  <span>お悩み別レッスンイメージ</span>
                  <span className="font-en text-[10px] text-[#8A857B]">03</span>
                </a>
                <a
                  href="#pricing"
                  onClick={() => setMenuOpen(false)}
                  className="flex items-center justify-between py-2 px-3 rounded-xl hover:bg-[#FDFBF7] transition-colors"
                >
                  <span>料金体系・3ステップ予約手順</span>
                  <span className="font-en text-[10px] text-[#8A857B]">04</span>
                </a>
                <a
                  href="#faq"
                  onClick={() => setMenuOpen(false)}
                  className="flex items-center justify-between py-2 px-3 rounded-xl hover:bg-[#FDFBF7] transition-colors"
                >
                  <span>よくあるご質問</span>
                  <span className="font-en text-[10px] text-[#8A857B]">05</span>
                </a>
                <div className="pt-2.5 border-t border-[#EADBCC]/60 flex flex-wrap gap-2">
                  <Link
                    href={`/coaches/${currentCoach.id}`}
                    className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-[#3E8E84] text-white text-[11px]"
                  >
                    <span>コーチ詳細・予約カレンダーへ</span>
                    <ChevronRight className="w-3.5 h-3.5" strokeWidth={1.75} />
                  </Link>
                  <Link
                    href="/chat"
                    className="px-3 py-1.5 rounded-lg bg-[#FDFBF7] border border-[#EADBCC] text-[#2C2B29] text-[11px]"
                  >
                    チャット一覧・予約管理
                  </Link>
                  <Link
                    href="/coach/onboarding"
                    className="px-3 py-1.5 rounded-lg bg-[#FDFBF7] border border-[#EADBCC] text-[#5E5B54] text-[11px]"
                  >
                    コーチ新規登録
                  </Link>
                  <Link
                    href="/coach/dashboard"
                    className="px-3 py-1.5 rounded-lg bg-[#FDFBF7] border border-[#EADBCC] text-[#5E5B54] text-[11px]"
                  >
                    コーチ管理画面
                  </Link>
                </div>
              </nav>
            </div>
          )}

          <main>
            {/* ==================== 2. Hero Section ==================== */}
            <section className="relative px-4 sm:px-6 pt-2 pb-16 max-w-xl mx-auto flex flex-col items-center text-center overflow-x-hidden">
              {/* 1枚イラスト ＆ 幾何学モチーフエリア（窓なし・透過配置） */}
              <div className="relative w-full max-w-[360px] aspect-[3/4] flex items-center justify-center mb-6">
                {/* 背景の斜めイエロー長方形カード */}
                <div className="absolute w-[220px] h-[310px] bg-[#FCE7A2]/85 rounded-[36px] rotate-10 -translate-y-1 translate-x-1 shadow-xs pointer-events-none" />

                {/* 幾何学図形の浮遊装飾 */}
                <div className="absolute top-10 left-2 w-7 h-7 bg-[#88C8D8]/85 rounded-lg -rotate-12 animate-float-1 pointer-events-none" />
                <div className="absolute top-8 right-6 w-0 h-0 border-l-16 border-l-transparent border-r-16 border-r-transparent border-b-28 border-b-[#E3644F]/85 rotate-15 animate-float-2 pointer-events-none" />
                <div className="absolute top-1 right-36 w-0 h-0 border-l-10 border-l-transparent border-r-10 border-r-transparent border-b-16 border-b-[#EAD7B2] -rotate-45 pointer-events-none" />
                <div className="absolute bottom-14 left-3 w-12 h-12 bg-[#3E8E84]/70 rounded-full animate-float-1 pointer-events-none" />
                <div className="absolute bottom-10 right-3 w-10 h-10 bg-[#88C8D8]/80 rounded-2xl rotate-6 animate-float-2 pointer-events-none" />
                <div className="absolute bottom-2 left-1 w-5 h-5 bg-[#D2E7DF] rounded-full pointer-events-none" />
                <div className="absolute bottom-2 right-1 w-6 h-6 bg-[#F7D668] rounded-full pointer-events-none" />

                {/* 水泳・かけっこ・逆上がり 統合イラスト（透過PNG） */}
                <div className="relative z-10 w-full h-full flex items-center justify-center p-2">
                  <img
                    src="/images/kids-coach/hero-trio.png"
                    alt="逆上がり・かけっこ・水泳を楽しむ子どもたちのイラスト"
                    className="w-full h-full object-contain drop-shadow-[0_6px_14px_rgba(44,43,41,0.06)] select-none pointer-events-none"
                  />
                </div>
              </div>

              {/* タイポグラフィ ＆ コピー（活版印刷の格調ある文字組み） */}
              <p className="font-en font-bold text-xs sm:text-sm tracking-[0.22em] text-[#55524B] mb-3 lowercase">
                meet your best coach!!
              </p>

              <h1 className="font-heading text-3xl sm:text-4xl font-bold text-[#2C2B29] tracking-normal leading-[1.35] mb-3">
                子どもの本当の
                <br />
                「できた！」に出会う
              </h1>

              <p className="text-xs sm:text-sm font-bold text-[#5E5B54] tracking-wider mb-6">
                出張個別スポーツ指導マッチングサービス
              </p>

              <div className="space-y-2.5 text-xs sm:text-sm text-[#5E5B54] leading-relaxed max-w-lg mx-auto mb-8 font-normal">
                <p>
                  子どもには、運動の楽しさに出会って、
                  <br />
                  自信に満ちた笑顔になって欲しい。
                </p>
                <p>
                  「憧れ」で終わらせず、
                  <br className="sm:hidden" />
                  来週の「できた！」を一番近くで育みたい。
                </p>
                <p className="text-[11px] sm:text-xs text-[#8A857B] pt-1">
                  でも、集団スクールでは順番待ちばかりで
                  <br className="sm:hidden" />
                  練習量が足りない…
                </p>
              </div>

              {/* リアルタイム検索カード */}
              <div
                id="search-box"
                className="w-full bg-white/95 backdrop-blur-xs p-4 rounded-3xl border border-[#EADBCC] shadow-xs space-y-3"
              >
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-left">
                  <div>
                    <label
                      htmlFor="sport-select"
                      className="block text-[10px] font-bold text-[#8A857B] mb-1 uppercase tracking-wider"
                    >
                      種目を選択
                    </label>
                    <select
                      id="sport-select"
                      value={selectedSport}
                      onChange={(e) => handleSportChange(e.target.value as SportKey)}
                      className="w-full bg-[#FDFBF7] border border-[#EADBCC] rounded-xl p-2.5 text-xs font-bold text-[#2C2B29] focus:outline-none focus:border-[#E3644F] cursor-pointer"
                    >
                      <option value="kakekko">かけっこ・走り方改善</option>
                      <option value="iron-bar">学校体育・逆上がり・鉄棒</option>
                      <option value="swimming">水泳・息継ぎ・25m完泳</option>
                      <option value="jump-rope">なわとび・二重跳び</option>
                    </select>
                  </div>
                  <div>
                    <label
                      htmlFor="area-select"
                      className="block text-[10px] font-bold text-[#8A857B] mb-1 uppercase tracking-wider"
                    >
                      エリアを選択
                    </label>
                    <select
                      id="area-select"
                      value={selectedArea}
                      onChange={(e) => setSelectedArea(e.target.value)}
                      className="w-full bg-[#FDFBF7] border border-[#EADBCC] rounded-xl p-2.5 text-xs font-bold text-[#2C2B29] focus:outline-none focus:border-[#E3644F] cursor-pointer"
                    >
                      <option>世田谷区</option>
                      <option>目黒区</option>
                      <option>港区</option>
                      <option>渋谷区</option>
                      <option>品川区</option>
                    </select>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    showToast('該当エリアのコーチ空き枠を更新しました');
                    const el = document.getElementById('coach-card-preview');
                    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center' });
                  }}
                  className="w-full py-3.5 bg-[#E3644F] hover:bg-[#cf5440] text-white font-bold text-sm rounded-2xl shadow-xs transition-transform active:scale-95 flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Search className="w-4 h-4" strokeWidth={1.75} />
                  <span>空き枠を見る（入会金0円）</span>
                </button>

                <div className="flex flex-wrap items-center justify-center gap-4 text-[10px] font-bold text-[#5E5B54] pt-1">
                  <span className="inline-flex items-center gap-1">
                    <Check className="w-3 h-3 text-[#3E8E84]" strokeWidth={2} />
                    <span>入会金0円</span>
                  </span>
                  <span className="inline-flex items-center gap-1">
                    <Check className="w-3 h-3 text-[#3E8E84]" strokeWidth={2} />
                    <span>1回ごとの単発予約制</span>
                  </span>
                  <span className="inline-flex items-center gap-1">
                    <Check className="w-3 h-3 text-[#3E8E84]" strokeWidth={2} />
                    <span>前日正午まで無料振替OK</span>
                  </span>
                </div>
              </div>
            </section>

            {/* ==================== 3. 直近で予約できるコーチ例 ==================== */}
            <section id="coaches" className="px-4 sm:px-6 py-14 max-w-xl mx-auto border-t border-[#EADBCC]/60">
              <div className="text-center space-y-2 mb-6">
                <span className="inline-block text-[10px] font-bold tracking-widest uppercase text-[#E3644F] bg-orange-50 px-3 py-1 rounded-full font-en">
                  Live Coaches
                </span>
                <h2 className="font-heading text-xl sm:text-2xl font-bold text-[#2C2B29]">
                  直近で予約できるコーチ
                </h2>
                <p className="text-xs text-[#5E5B54]">
                  種目を切り替えて、今週予約可能な認定コーチと空き枠を確認できます。
                </p>
              </div>

              {/* 種目クイック切替タブ（上の検索セレクトと連動） */}
              <div className="flex flex-wrap items-center justify-center gap-1.5 sm:gap-2 mb-5">
                {(['kakekko', 'swimming', 'iron-bar', 'jump-rope'] as SportKey[]).map((key) => {
                  const item = COACH_DATA[key];
                  const isActive = selectedSport === key;
                  return (
                    <button
                      key={key}
                      type="button"
                      onClick={() => handleSportChange(key)}
                      className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer border ${
                        isActive
                          ? 'bg-[#2C2B29] text-white border-[#2C2B29] shadow-2xs'
                          : 'bg-white text-[#5E5B54] border-[#EADBCC] hover:border-[#E3644F] hover:text-[#2C2B29]'
                      }`}
                    >
                      {item.sportLabel}
                    </button>
                  );
                })}
              </div>

              {/* コーチカード本体 */}
              <div
                id="coach-card-preview"
                style={{ opacity: cardOpacity }}
                className="bg-white rounded-3xl p-5 sm:p-6 border border-[#EADBCC] shadow-xs space-y-4 transition-opacity duration-150"
              >
                {/* 上段ステータス ＆ 料金 */}
                <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[#EADBCC]/70 pb-3.5">
                  <div className="flex items-center gap-2">
                    <span
                      id="coach-status"
                      className="inline-flex items-center gap-1.5 text-[10px] font-bold text-[#3E8E84] bg-[#3E8E84]/10 px-2.5 py-1 rounded-full"
                    >
                      <span className="w-1.5 h-1.5 rounded-full bg-[#3E8E84]" />
                      <span>今週予約受付中</span>
                    </span>
                    <span className="inline-flex items-center gap-1 font-en text-[11px] font-bold text-[#2C2B29] bg-[#FCE7A2] px-2.5 py-1 rounded-full">
                      <Star className="w-3 h-3 fill-[#E3644F] text-[#E3644F] shrink-0" strokeWidth={1.75} />
                      <span>{currentCoach.rating}</span>
                      <span className="font-sans text-[#5E5B54]">({currentCoach.reviewCount}件)</span>
                    </span>
                  </div>

                  <div id="coach-price" className="text-right">
                    <span className="font-en text-lg font-extrabold text-[#2C2B29]">
                      ￥{currentCoach.priceAmount}
                    </span>
                    <span className="text-[11px] text-[#5E5B54] font-bold ml-1">
                      / 60分（交通費込）
                    </span>
                  </div>
                </div>

                {/* コーチ基本プロフィール */}
                <div className="flex items-center gap-3.5">
                  <div
                    id="coach-avatar"
                    className="w-14 h-14 rounded-2xl bg-[#FCE7A2] border border-[#2C2B29]/20 flex items-center justify-center font-heading font-bold text-sm text-[#2C2B29] shrink-0"
                  >
                    {currentCoach.initial}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 id="coach-name" className="font-heading font-bold text-base text-[#2C2B29]">
                        {currentCoach.name}
                      </h3>
                      <span className="inline-flex items-center gap-1 text-[10px] font-bold bg-[#3E8E84]/10 text-[#3E8E84] px-2 py-0.5 rounded-full">
                        <Shield className="w-3 h-3" strokeWidth={1.75} />
                        <span>本人確認済</span>
                      </span>
                    </div>
                    <p id="coach-bio" className="text-xs text-[#5E5B54] mt-0.5 font-bold">
                      {currentCoach.bio}
                    </p>
                  </div>
                </div>

                {/* 提供レッスン概要 */}
                <div className="bg-[#FDFBF7] p-4 rounded-2xl border border-[#EADBCC] space-y-2">
                  <span
                    id="coach-tag"
                    className="text-[10px] font-bold text-[#E3644F] bg-white px-2.5 py-0.5 rounded-full border border-[#EADBCC] inline-block"
                  >
                    {currentCoach.tag}
                  </span>
                  <p
                    id="coach-title"
                    className="font-heading text-xs sm:text-sm font-bold text-[#2C2B29] leading-snug"
                  >
                    {currentCoach.title}
                  </p>
                  <p className="text-[11px] text-[#5E5B54] leading-relaxed">
                    {currentCoach.summary}
                  </p>
                  <p
                    id="coach-area"
                    className="text-[11px] text-[#2C2B29] font-bold flex items-center gap-1.5 pt-1"
                  >
                    <MapPin className="w-3.5 h-3.5 text-[#3E8E84] shrink-0" strokeWidth={1.75} />
                    <span>{currentCoach.area}</span>
                  </p>
                </div>

                {/* 直近の空き枠（クイックプレビュー） */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-[11px] font-bold text-[#5E5B54]">
                    <span className="inline-flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5 text-[#E3644F]" strokeWidth={1.75} />
                      <span>直近の予約可能枠（60分）</span>
                    </span>
                    <span className="text-[10px]">タップで日程確認</span>
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                    {currentCoach.nextSlots.map((slot, idx) => (
                      <Link
                        key={idx}
                        href={`/coaches/${currentCoach.id}`}
                        className="py-2 px-2 rounded-xl bg-[#FDFBF7] hover:bg-[#FCE7A2]/50 border border-[#EADBCC] hover:border-[#E3644F] text-center transition-colors group"
                      >
                        <span className="block font-en text-[10px] font-bold text-[#5E5B54] group-hover:text-[#2C2B29]">
                          {slot.dateLabel}
                        </span>
                        <span className="block font-en text-xs font-extrabold text-[#2C2B29] group-hover:text-[#E3644F]">
                          {slot.timeLabel}
                        </span>
                      </Link>
                    ))}
                  </div>
                </div>

                {/* アクションボタン */}
                <div className="pt-1 space-y-2.5">
                  <Link
                    href={`/coaches/${currentCoach.id}`}
                    onClick={() =>
                      showToast('予約カレンダー画面を開きます')
                    }
                    className="w-full py-3.5 bg-[#3E8E84] hover:bg-[#32756d] text-white text-xs sm:text-sm font-bold rounded-full shadow-xs transition-all flex items-center justify-center gap-1.5"
                  >
                    <span>全14日間の空き日程・詳細を見る</span>
                    <ChevronRight className="w-4 h-4" strokeWidth={1.75} />
                  </Link>

                  <div className="text-center">
                    <Link
                      href={`/sports/${currentCoach.sportSlug}`}
                      className="inline-flex items-center gap-1 text-[11px] font-bold text-[#5E5B54] hover:text-[#E3644F] transition-colors"
                    >
                      <span>{currentCoach.sportLabel}のコーチ一覧・対応エリアを見る</span>
                      <ArrowRight className="w-3 h-3" strokeWidth={1.75} />
                    </Link>
                  </div>
                </div>
              </div>
            </section>

            {/* ==================== 4. 課題提起セクション ==================== */}
            <section id="about" className="py-16 bg-white border-t border-[#EADBCC]/60">
              <div className="max-w-xl mx-auto px-4 sm:px-6 space-y-6">
                <div className="text-center space-y-2">
                  <span className="text-[10px] font-bold tracking-widest uppercase text-[#E3644F] bg-orange-50 px-3 py-1 rounded-full font-en">
                    For Parents
                  </span>
                  <h2 className="font-heading text-xl sm:text-2xl font-bold text-[#2C2B29]">
                    こんな「モヤモヤ」ありませんか？
                  </h2>
                  <p className="text-xs text-[#5E5B54]">
                    集団スクールや日々の送迎で、多くの保護者様が同じ壁を感じています。
                  </p>
                </div>

                <div className="space-y-4">
                  {/* ISSUE 01（左テキスト ＋ 右イラスト） */}
                  <div className="bg-[#FDFBF7] rounded-3xl p-5 sm:p-6 border border-[#EADBCC] flex items-center justify-between gap-3 sm:gap-5">
                    <div className="flex-1 min-w-0 space-y-1.5">
                      <span className="font-en text-[10px] font-extrabold tracking-widest text-[#E3644F] uppercase block">
                        ISSUE 01
                      </span>
                      <h3 className="font-heading text-sm sm:text-base font-bold text-[#2C2B29] leading-snug">
                        「大手の集団指導だと順番待ちばかり…」
                      </h3>
                      <p className="text-xs text-[#5E5B54] leading-relaxed">
                        1クラス十数人のスクールでは列に並んでいる時間が大半。60分のうち実際に体を動かしているのはわずか数分で、上達が遅くなってしまいます。
                      </p>
                    </div>
                    <div className="relative w-28 h-28 sm:w-36 sm:h-36 shrink-0 flex items-center justify-center">
                      <div className="absolute inset-2 rounded-full bg-[#FCE7A2]/65" />
                      <img
                        src="/images/kids-coach/issue-01.png"
                        alt="集団レッスンで順番待ちをしている子どもたちのイラスト"
                        className="relative z-10 w-full h-full object-contain"
                      />
                    </div>
                  </div>

                  {/* ISSUE 02（左イラスト ＋ 右テキスト） */}
                  <div className="bg-[#FDFBF7] rounded-3xl p-5 sm:p-6 border border-[#EADBCC] flex flex-row-reverse items-center justify-between gap-3 sm:gap-5">
                    <div className="flex-1 min-w-0 space-y-1.5">
                      <span className="font-en text-[10px] font-extrabold tracking-widest text-[#3E8E84] uppercase block">
                        ISSUE 02
                      </span>
                      <h3 className="font-heading text-sm sm:text-base font-bold text-[#2C2B29] leading-snug">
                        「進級テストで何ヶ月も足踏み…やる気が落ちてきた」
                      </h3>
                      <p className="text-xs text-[#5E5B54] leading-relaxed">
                        どこでつまずいているのか個別に見てもらえず、同じ練習の繰り返し。不合格が続くことで、お子様の自己肯定感が下がってしまいます。
                      </p>
                    </div>
                    <div className="relative w-24 h-32 sm:w-32 sm:h-36 shrink-0 flex items-center justify-center">
                      <div className="absolute inset-x-1 inset-y-3 rounded-full bg-[#88C8D8]/30" />
                      <img
                        src="/images/kids-coach/issue-02.png"
                        alt="進級できずに悩んでため息をつく子どものイラスト"
                        className="relative z-10 w-full h-full object-contain"
                      />
                    </div>
                  </div>

                  {/* ISSUE 03（左テキスト ＋ 右イラスト） */}
                  <div className="bg-[#FDFBF7] rounded-3xl p-5 sm:p-6 border border-[#EADBCC] flex items-center justify-between gap-3 sm:gap-5">
                    <div className="flex-1 min-w-0 space-y-1.5">
                      <span className="font-en text-[10px] font-extrabold tracking-widest text-[#E3644F] uppercase block">
                        ISSUE 03
                      </span>
                      <h3 className="font-heading text-sm sm:text-base font-bold text-[#2C2B29] leading-snug">
                        「運動会前やテスト前だけピンポイントで習わせたい」
                      </h3>
                      <p className="text-xs text-[#5E5B54] leading-relaxed">
                        逆上がりや走り方のコツだけを短期集中で掴ませたいのに、既存スクールは入会金や指定ウェア代、毎週の固定通学の縛りが重い。
                      </p>
                    </div>
                    <div className="relative w-28 h-28 sm:w-36 sm:h-36 shrink-0 flex items-center justify-center">
                      <div className="absolute inset-2 rounded-[28px] rotate-6 bg-[#D2E7DF]/70" />
                      <img
                        src="/images/kids-coach/issue-03.png"
                        alt="カレンダーとバトンを前に目標を目指す子どものイラスト"
                        className="relative z-10 w-full h-full object-contain"
                      />
                    </div>
                  </div>

                  {/* ISSUE 04（左イラスト ＋ 右テキスト） */}
                  <div className="bg-[#FDFBF7] rounded-3xl p-5 sm:p-6 border border-[#EADBCC] flex flex-row-reverse items-center justify-between gap-3 sm:gap-5">
                    <div className="flex-1 min-w-0 space-y-1.5">
                      <span className="font-en text-[10px] font-extrabold tracking-widest text-[#3E8E84] uppercase block">
                        ISSUE 04
                      </span>
                      <h3 className="font-heading text-sm sm:text-base font-bold text-[#2C2B29] leading-snug">
                        「毎週の送迎が限界…もっと家の近くで完結させたい」
                      </h3>
                      <p className="text-xs text-[#5E5B54] leading-relaxed">
                        共働きで平日の夕方や休日の送迎が重い負担。遠くのスクールへ毎週通うのではなく、ご自宅近くの公園や指定の場所へ先生に出張してほしい。
                      </p>
                    </div>
                    <div className="relative w-28 h-28 sm:w-36 sm:h-36 shrink-0 flex items-center justify-center">
                      <div className="absolute inset-2 rounded-full bg-[#FCE7A2]/75" />
                      <img
                        src="/images/kids-coach/issue-04.png"
                        alt="腕時計を気にしながら子どもと急いで送迎する保護者のイラスト"
                        className="relative z-10 w-full h-full object-contain"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {/* ==================== 5. 解決メッセージ ==================== */}
            <section className="py-16 bg-[#3E8E84] text-white">
              <div className="max-w-xl mx-auto px-4 sm:px-6 space-y-6">
                <div className="text-center space-y-3">
                  <span className="inline-block text-[10px] font-bold tracking-widest uppercase text-[#2C2B29] bg-[#FCE7A2] px-3 py-1 rounded-full font-en">
                    Personal Coaching
                  </span>
                  <h2 className="font-heading text-xl sm:text-2xl font-bold leading-snug">
                    上達しない原因は、運動神経ではなく
                    <br />
                    「指導環境」にあります。
                  </h2>
                  <p className="text-xs sm:text-sm text-white/90 leading-relaxed max-w-md mx-auto">
                    子どもが逆上がりや息継ぎでつまずく理由は、「腕の引き方」「目線の位置」「重心の乗せ方」など、ほんの小さなボタンの掛け違いです。
                  </p>
                </div>

                {/* 60分密度の比較グラフィック */}
                <div className="bg-white/10 backdrop-blur-xs rounded-3xl p-5 sm:p-6 border border-white/20 space-y-4">
                  <div className="flex items-center justify-between border-b border-white/15 pb-3">
                    <span className="font-heading text-xs sm:text-sm font-bold text-white">
                      同じ「60分」でも、実質練習量がここまで変わります
                    </span>
                    <span className="font-en text-[10px] font-bold text-[#F7D668] tracking-widest uppercase shrink-0 ml-2">
                      60 MIN DENSITY
                    </span>
                  </div>

                  {/* 従来の集団スクール */}
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between text-[11px] font-bold text-white/80">
                      <span>一般的な集団スクール（1クラス15名〜）</span>
                      <span className="font-en">実質練習 約10〜15分</span>
                    </div>
                    <div className="w-full h-3 rounded-full bg-black/20 overflow-hidden flex">
                      <div className="w-[22%] bg-white/70 h-full" />
                      <div className="w-[78%] bg-white/15 h-full" />
                    </div>
                    <p className="text-[10px] text-white/70">
                      順番待ち・移動・説明の時間が大半を占め、フォーム修正まで手が回らない
                    </p>
                  </div>

                  {/* キッズコーチナビ */}
                  <div className="space-y-1.5 pt-1">
                    <div className="flex items-center justify-between text-xs font-bold text-[#FCE7A2]">
                      <span>キッズコーチナビ（完全マンツーマン）</span>
                      <span className="font-en text-sm font-extrabold text-[#F7D668]">60分フル指導（練習量 約4倍）</span>
                    </div>
                    <div className="w-full h-3.5 rounded-full bg-black/20 overflow-hidden">
                      <div className="w-full bg-[#F7D668] h-full rounded-full" />
                    </div>
                    <p className="text-[11px] text-white/95 font-bold pt-0.5">
                      開始10分でつまずきの原因を見極め、褒めて自信を育む声かけで「あ、できた！」を引き出します。
                    </p>
                  </div>
                </div>
              </div>
            </section>

            {/* ==================== 6. 選ばれる3つの理由 ==================== */}
            <section
              id="features"
              className="py-16 bg-[#FDFBF7] border-b border-[#EADBCC]/60"
            >
              <div className="max-w-xl mx-auto px-4 sm:px-6 space-y-6">
                <div className="text-center space-y-2">
                  <span className="text-[10px] font-bold tracking-widest uppercase text-[#E3644F] bg-orange-50 px-3 py-1 rounded-full font-en">
                    Features
                  </span>
                  <h2 className="font-heading text-xl sm:text-2xl font-bold text-[#2C2B29]">
                    キッズコーチナビが選ばれる3つの理由
                  </h2>
                  <p className="text-xs text-[#5E5B54]">
                    お子様の上達スピードと、保護者様の通いやすさを両立する仕組みです。
                  </p>
                </div>

                <div className="space-y-4">
                  {/* REASON 01 */}
                  <div className="bg-white rounded-3xl p-5 sm:p-6 border border-[#EADBCC] shadow-xs flex items-center justify-between gap-3 sm:gap-5">
                    <div className="flex-1 min-w-0 space-y-2">
                      <div className="flex items-center gap-2">
                        <span className="font-en text-[10px] font-extrabold tracking-widest text-[#E3644F] uppercase">
                          REASON 01
                        </span>
                        <span className="text-[10px] font-bold text-[#E3644F] bg-orange-50 px-2.5 py-0.5 rounded-full">
                          練習量 約4倍
                        </span>
                      </div>
                      <h3 className="font-heading text-sm sm:text-base font-bold text-[#2C2B29] leading-snug">
                        待ち時間ゼロの60分・完全オーダーメイド指導
                      </h3>
                      <p className="text-xs text-[#5E5B54] leading-relaxed">
                        他の生徒を待つ時間は1秒もありません。水慣れから運動会対策まで、お子様の歩幅に合わせて60分間フルに使います。
                      </p>
                      <div className="flex flex-wrap gap-x-3 gap-y-1 pt-0.5 text-[10px] font-bold text-[#2C2B29]">
                        <span className="inline-flex items-center gap-1">
                          <Check className="w-3 h-3 text-[#3E8E84]" strokeWidth={2} />
                          <span>開始10分で原因を特定</span>
                        </span>
                        <span className="inline-flex items-center gap-1">
                          <Check className="w-3 h-3 text-[#3E8E84]" strokeWidth={2} />
                          <span>褒めて伸ばす個別指導</span>
                        </span>
                      </div>
                    </div>
                    <div className="relative w-28 h-28 sm:w-36 sm:h-36 shrink-0 flex items-center justify-center">
                      <div className="absolute inset-2 rounded-full bg-[#FCE7A2]/75" />
                      <img
                        src="/images/kids-coach/feature-01.png"
                        alt="コーチと子どもが1対1で腕の振り方を練習しているイラスト"
                        className="relative z-10 w-full h-full object-contain"
                      />
                    </div>
                  </div>

                  {/* REASON 02 */}
                  <div className="bg-white rounded-3xl p-5 sm:p-6 border border-[#EADBCC] shadow-xs flex flex-row-reverse items-center justify-between gap-3 sm:gap-5">
                    <div className="flex-1 min-w-0 space-y-2">
                      <div className="flex items-center gap-2">
                        <span className="font-en text-[10px] font-extrabold tracking-widest text-[#3E8E84] uppercase">
                          REASON 02
                        </span>
                        <span className="text-[10px] font-bold text-[#3E8E84] bg-[#3E8E84]/10 px-2.5 py-0.5 rounded-full">
                          出張指導
                        </span>
                      </div>
                      <h3 className="font-heading text-sm sm:text-base font-bold text-[#2C2B29] leading-snug">
                        ご希望の公園や利用可能な場所へコーチが出張
                      </h3>
                      <p className="text-xs text-[#5E5B54] leading-relaxed">
                        遠くの教室へ毎回通う必要はありません。近所の公園や広場、個人指導が許可されているスポーツ施設など、ご希望の場所へコーチが伺います。
                      </p>
                      <div className="flex flex-wrap gap-x-3 gap-y-1 pt-0.5 text-[10px] font-bold text-[#2C2B29]">
                        <span className="inline-flex items-center gap-1">
                          <Check className="w-3 h-3 text-[#3E8E84]" strokeWidth={2} />
                          <span>ご指定の公園・利用可能施設でOK</span>
                        </span>
                        <span className="inline-flex items-center gap-1">
                          <Check className="w-3 h-3 text-[#3E8E84]" strokeWidth={2} />
                          <span>出張交通費込みの明朗価格</span>
                        </span>
                      </div>
                    </div>
                    <div className="relative w-28 h-28 sm:w-36 sm:h-36 shrink-0 flex items-center justify-center">
                      <div className="absolute inset-2 rounded-[28px] -rotate-6 bg-[#D2E7DF]/75" />
                      <img
                        src="/images/kids-coach/feature-02-park.png"
                        alt="近所の公園の鉄棒で楽しく逆上がりを決める子どものイラスト"
                        className="relative z-10 w-full h-full object-contain"
                      />
                    </div>
                  </div>

                  {/* REASON 03 */}
                  <div className="bg-white rounded-3xl p-5 sm:p-6 border border-[#EADBCC] shadow-xs flex items-center justify-between gap-3 sm:gap-5">
                    <div className="flex-1 min-w-0 space-y-2">
                      <div className="flex items-center gap-2">
                        <span className="font-en text-[10px] font-extrabold tracking-widest text-[#E3644F] uppercase">
                          REASON 03
                        </span>
                        <span className="text-[10px] font-bold text-amber-900 bg-[#FCE7A2] px-2.5 py-0.5 rounded-full">
                          入会金 ￥0
                        </span>
                      </div>
                      <h3 className="font-heading text-sm sm:text-base font-bold text-[#2C2B29] leading-snug">
                        必要な時に1回ごとの都度払いで受講
                      </h3>
                      <p className="text-xs text-[#5E5B54] leading-relaxed">
                        入会金や年会費の縛りは一切なし。空き枠カレンダーから日時を選び、クレジットカード事前決済でその場で予約が完了します。
                      </p>
                      <div className="flex flex-wrap gap-x-3 gap-y-1 pt-0.5 text-[10px] font-bold text-[#2C2B29]">
                        <span className="inline-flex items-center gap-1">
                          <Check className="w-3 h-3 text-[#3E8E84]" strokeWidth={2} />
                          <span>単発1回のみも大歓迎</span>
                        </span>
                        <span className="inline-flex items-center gap-1">
                          <Check className="w-3 h-3 text-[#3E8E84]" strokeWidth={2} />
                          <span>前日正午まで無料振替OK</span>
                        </span>
                      </div>
                    </div>
                    <div className="relative w-24 h-32 sm:w-32 sm:h-36 shrink-0 flex items-center justify-center">
                      <div className="absolute inset-x-0 inset-y-2 rounded-full bg-[#88C8D8]/30" />
                      <img
                        src="/images/kids-coach/feature-03.png"
                        alt="スマートフォンで手軽に単発予約を完了して喜ぶ親子のイラスト"
                        className="relative z-10 w-full h-full object-contain"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {/* ==================== 7. お悩み別レッスンモデル（指導イメージ） ==================== */}
            <section
              id="voices"
              className="py-16 bg-white border-b border-[#EADBCC]/60"
            >
              <div id="cases" className="max-w-xl mx-auto px-4 sm:px-6 space-y-6">
                <div className="text-center space-y-2">
                  <span className="text-[10px] font-bold tracking-widest uppercase text-[#E3644F] bg-orange-50 px-3 py-1 rounded-full font-en">
                    Lesson Model
                  </span>
                  <h2 className="font-heading text-xl sm:text-2xl font-bold text-[#2C2B29]">
                    お悩み別・60分レッスンイメージ
                  </h2>
                  <p className="text-xs text-[#5E5B54] leading-relaxed">
                    お子様の「苦手」に合わせたマンツーマンの進め方をご紹介します。
                  </p>
                </div>

                {/* コーチ品質・審査基準（パターンA：運営の審査・透明性） */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                  {(
                    [
                      {
                        key: 'verified',
                        title: '本人確認済み',
                        desc: '運営の事前審査を通過',
                        topBar: 'bg-[#E3644F]',
                        iconWrap: 'bg-orange-50 text-[#E3644F] border-[#E3644F]/25',
                        Icon: ShieldCheck,
                      },
                      {
                        key: 'pro',
                        title: '指導のプロ中心',
                        desc: '元選手・教員・資格保有者',
                        topBar: 'bg-[#3E8E84]',
                        iconWrap: 'bg-[#D2E7DF]/55 text-[#3E8E84] border-[#3E8E84]/25',
                        Icon: Award,
                      },
                      {
                        key: 'review',
                        title: '公開レビュー制度',
                        desc: '受講後の評価を順次公開',
                        topBar: 'bg-[#D4A11D]',
                        iconWrap: 'bg-[#FCE7A2]/50 text-[#A87A0B] border-[#D4A11D]/30',
                        Icon: Star,
                      },
                    ] as const
                  ).map(({ key, title, desc, topBar, iconWrap, Icon }) => (
                    <div
                      key={key}
                      className="bg-[#FDFBF7] px-3.5 py-3 sm:pt-4 sm:pb-3.5 sm:px-2.5 rounded-2xl border border-[#EADBCC] relative overflow-hidden flex sm:flex-col items-center sm:text-center gap-3 sm:gap-2"
                    >
                      <div className={`absolute top-0 inset-x-0 h-1 ${topBar}`} />
                      <div
                        className={`w-9 h-9 rounded-xl border flex items-center justify-center shrink-0 ${iconWrap}`}
                      >
                        <Icon className="w-4 h-4" strokeWidth={1.75} />
                      </div>
                      <div className="min-w-0">
                        <span className="block font-heading text-xs sm:text-[13px] font-bold text-[#2C2B29] leading-snug">
                          {title}
                        </span>
                        <span className="block text-[10px] font-medium text-[#5E5B54] mt-0.5 leading-snug">
                          {desc}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>

                {/* 種目絞り込みピル */}
                <div className="flex flex-wrap items-center justify-center gap-1.5">
                  {(
                    [
                      { key: 'all', label: 'すべて（3種目）' },
                      { key: 'kakekko', label: 'かけっこ' },
                      { key: 'swimming', label: '水泳' },
                      { key: 'iron-bar', label: '逆上がり・鉄棒' },
                    ] as const
                  ).map((tab) => {
                    const active = voiceFilter === tab.key;
                    return (
                      <button
                        key={tab.key}
                        type="button"
                        onClick={() => setVoiceFilter(tab.key)}
                        className={`px-3 py-1.5 rounded-full text-[11px] font-bold border transition-colors cursor-pointer ${
                          active
                            ? 'bg-[#2C2B29] text-white border-[#2C2B29]'
                            : 'bg-[#FDFBF7] text-[#5E5B54] border-[#EADBCC] hover:border-[#2C2B29]/40 hover:text-[#2C2B29]'
                        }`}
                      >
                        {tab.label}
                      </button>
                    );
                  })}
                </div>

                {/* モデルケース一覧（お悩み → 目指すゴール） */}
                <div className="space-y-4">
                  {LESSON_MODELS.filter(
                    (item) => voiceFilter === 'all' || item.sportKey === voiceFilter
                  ).map((item) => {
                    const style = VOICE_THEME_STYLES[item.accent];
                    return (
                      <article
                        key={item.id}
                        className="bg-[#FDFBF7] rounded-3xl p-5 sm:p-6 border border-[#EADBCC] shadow-xs space-y-4"
                      >
                        {/* 上部メタ行：種目・プラン名 × 目安回数 */}
                        <div className="flex flex-wrap items-center justify-between gap-2">
                          <span
                            className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full border inline-flex items-center gap-1.5 ${style.sportTag}`}
                          >
                            <span>{item.sportLabel}</span>
                            <span className="text-[#EADBCC]">|</span>
                            <span className="text-[#2C2B29]">{item.planTheme}</span>
                          </span>
                          <span
                            className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full border ${style.sessionBadge}`}
                          >
                            {item.durationGuide}
                          </span>
                        </div>

                        {/* よくあるお悩み → 目指すゴール */}
                        <div className="flex flex-col">
                          <div className="p-3.5 rounded-2xl bg-white border border-[#EADBCC] text-xs text-[#5E5B54] space-y-1">
                            <span className="inline-block text-[9px] font-extrabold tracking-wider text-[#8A857B] bg-[#F7F3EC] px-2 py-0.5 rounded-sm">
                              よくあるお悩み
                            </span>
                            <p className="leading-relaxed">{item.concernText}</p>
                          </div>

                          <div className="-my-2.5 relative z-10 flex items-center justify-center">
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-white border border-[#EADBCC] shadow-xs text-[10px] font-bold text-[#2C2B29]">
                              <span
                                className={`w-4 h-4 rounded-full inline-flex items-center justify-center ${style.arrowCircle}`}
                              >
                                <ArrowDown className="w-2.5 h-2.5" strokeWidth={2.5} />
                              </span>
                              <span>60分マンツーマン指導</span>
                            </span>
                          </div>

                          <div
                            className={`p-3.5 sm:p-4 rounded-2xl border text-xs text-[#2C2B29] space-y-1 ${style.afterBox}`}
                          >
                            <span
                              className={`inline-block text-[9px] font-extrabold tracking-wider px-2 py-0.5 rounded-sm ${style.afterBadge}`}
                            >
                              目指すゴール
                            </span>
                            <p className="font-bold leading-relaxed text-[13px]">
                              {item.goalText}
                            </p>
                          </div>
                        </div>

                        {/* 指導のポイント ＋ 担当コーチ導線 */}
                        <div className="bg-white rounded-2xl p-3.5 sm:p-4 border border-[#EADBCC]/80 space-y-2.5">
                          <div className="flex items-start gap-2.5">
                            <span className="w-4 h-4 rounded-full bg-[#D2E7DF]/70 text-[#3E8E84] flex items-center justify-center shrink-0 mt-0.5">
                              <Check className="w-2.5 h-2.5" strokeWidth={2.5} />
                            </span>
                            <div className="space-y-0.5">
                              <span className="block text-[10px] font-bold text-[#2C2B29]">
                                指導のポイント
                              </span>
                              <p className="text-[11px] sm:text-xs text-[#5E5B54] leading-relaxed">
                                {item.coachingTip}
                              </p>
                            </div>
                          </div>
                          <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-[#EADBCC]/50 text-[10px]">
                            <span className="text-[#8A857B]">
                              ※マンツーマン指導のモデルケースです
                            </span>
                            <Link
                              href={`/coaches/${item.coachId}`}
                              className="inline-flex items-center gap-0.5 font-bold text-[#3E8E84] hover:text-[#2C6B63] transition-colors"
                            >
                              <span>{item.coachName}の詳細を見る</span>
                              <ChevronRight className="w-3 h-3" strokeWidth={2} />
                            </Link>
                          </div>
                        </div>
                      </article>
                    );
                  })}
                </div>
              </div>
            </section>

            {/* ==================== 8. 料金体系・予約手順 ==================== */}
            <section
              id="price"
              className="py-16 bg-[#FDFBF7] border-b border-[#EADBCC]/60"
            >
              <div id="pricing" className="max-w-xl mx-auto px-4 sm:px-6 space-y-8">
                <div className="text-center space-y-2">
                  <span className="text-[10px] font-bold tracking-widest uppercase text-[#E3644F] bg-orange-50 px-3 py-1 rounded-full font-en">
                    Pricing & Flow
                  </span>
                  <h2 className="font-heading text-xl sm:text-2xl font-bold text-[#2C2B29]">
                    明朗な都度払い ＆ かんたん3ステップ
                  </h2>
                  <p className="text-xs text-[#5E5B54] leading-relaxed">
                    入会金・月会費はなし。1回分の料金だけでご予約いただけます。
                  </p>
                </div>

                {/* 料金サマリーカード（最終価格のみのシンプル設計） */}
                <div className="bg-white rounded-3xl border border-[#EADBCC] shadow-xs overflow-hidden">
                  <div className="bg-[#FCE7A2]/45 px-5 sm:px-6 py-3 border-b border-[#EADBCC]/70 flex flex-wrap items-center justify-between gap-2">
                    <span className="text-xs font-bold text-[#2C2B29]">
                      1回ごとの完全都度払い（単発予約制）
                    </span>
                    <span className="text-[10px] font-bold text-[#E3644F] bg-white px-2.5 py-0.5 rounded-full border border-[#E3644F]/25">
                      表示価格以外の請求なし
                    </span>
                  </div>

                  <div className="p-5 sm:p-6 space-y-5">
                    <div className="space-y-1.5">
                      <span className="text-[11px] font-bold text-[#8A857B] block">
                        レッスン料金（1回60分・コーチにより設定）
                      </span>
                      <div className="flex flex-wrap items-baseline gap-x-2.5 gap-y-1">
                        <p className="text-2xl sm:text-3xl font-extrabold text-[#2C2B29] font-en tracking-tight">
                          ¥5,500〜
                        </p>
                        <span className="text-xs font-bold text-[#3E8E84] bg-[#D2E7DF]/45 px-2.5 py-0.5 rounded-full">
                          税込・交通費込
                        </span>
                      </div>
                    </div>

                    {/* 含まれる安心ポイント（2×2グリッド） */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1">
                      {[
                        '入会金・月会費はかかりません',
                        'コーチの出張交通費も込み',
                        '日程決定後のカード事前決済',
                        '前日正午まで無料振替OK',
                      ].map((point) => (
                        <div
                          key={point}
                          className="flex items-center gap-2 bg-[#FDFBF7] px-3 py-2 rounded-xl border border-[#EADBCC]/80 text-[11px] font-bold text-[#2C2B29]"
                        >
                          <span className="w-4 h-4 rounded-full bg-[#D2E7DF] text-[#3E8E84] flex items-center justify-center shrink-0">
                            <Check className="w-2.5 h-2.5" strokeWidth={2.5} />
                          </span>
                          <span>{point}</span>
                        </div>
                      ))}
                    </div>

                    <p className="text-[10px] text-[#8A857B] leading-relaxed border-t border-[#EADBCC]/50 pt-3">
                      ※コーチごとにレッスン料金を設定しています。有料プール等を利用する場合の入場料を除き、追加の請求は一切ありません。
                    </p>
                  </div>
                </div>

                {/* 予約の流れ（タイムラインコネクター付き3ステップ） */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between px-1">
                    <h3 className="font-heading text-sm font-bold text-[#2C2B29]">
                      ご予約から受講までの流れ
                    </h3>
                    <span className="text-[10px] font-bold text-[#3E8E84] bg-[#D2E7DF]/45 px-2.5 py-0.5 rounded-full">
                      やり取りはWeb完結
                    </span>
                  </div>

                  <div className="relative space-y-3">
                    {/* ステップ間の接続線（アイコン列の中央 35px に配置） */}
                    <div
                      aria-hidden="true"
                      className="absolute left-[35px] top-8 bottom-8 w-px border-l-2 border-dashed border-[#EADBCC]"
                    />

                    {(
                      [
                        {
                          step: '01',
                          title: '空き枠を確認する',
                          desc: '種目や希望エリアからコーチを選び、公開中の空き状況をチェックします。',
                          badgeBg: 'bg-[#E3644F] text-white',
                          iconBg: 'bg-orange-50 text-[#E3644F]',
                          Icon: Search,
                        },
                        {
                          step: '02',
                          title: 'コーチと日程調整の連絡',
                          desc: '専用チャットで希望日時や実施場所（公園・利用可能施設）を相談します。',
                          badgeBg: 'bg-[#3E8E84] text-white',
                          iconBg: 'bg-[#D2E7DF]/55 text-[#3E8E84]',
                          Icon: MessageSquare,
                        },
                        {
                          step: '03',
                          title: '決定後に事前決済で予約確定',
                          desc: '日程と場所が決まったらカードで事前決済。当日の現金手渡しは不要です。',
                          badgeBg: 'bg-[#D4A11D] text-white',
                          iconBg: 'bg-[#FCE7A2]/60 text-[#A87A0B]',
                          Icon: CreditCard,
                        },
                      ] as const
                    ).map(({ step, title, desc, badgeBg, iconBg, Icon }) => (
                      <div
                        key={step}
                        className="relative bg-white rounded-2xl p-4 border border-[#EADBCC] shadow-xs flex items-start gap-3.5"
                      >
                        <div className="relative z-10 flex flex-col items-center shrink-0">
                          <span
                            className={`w-10 h-10 rounded-xl flex items-center justify-center border border-[#EADBCC]/60 ${iconBg}`}
                          >
                            <Icon className="w-4 h-4" strokeWidth={1.75} />
                          </span>
                          <span
                            className={`-mt-2 px-1.5 py-0.2 rounded-full text-[9px] font-extrabold font-en tracking-wider ${badgeBg}`}
                          >
                            {step}
                          </span>
                        </div>
                        <div className="min-w-0 pt-0.5 space-y-1">
                          <h4 className="font-heading text-xs sm:text-sm font-bold text-[#2C2B29]">
                            {title}
                          </h4>
                          <p className="text-[11px] sm:text-xs text-[#5E5B54] leading-relaxed">
                            {desc}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="pt-2 text-center">
                    <a
                      href="#coaches"
                      className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-full bg-[#2C2B29] text-white text-xs font-bold hover:bg-[#3F3D39] transition-colors shadow-xs"
                    >
                      <span>空き枠のあるコーチを探す</span>
                      <ArrowRight className="w-3.5 h-3.5" strokeWidth={2} />
                    </a>
                  </div>
                </div>
              </div>
            </section>

            {/* ==================== 9. よくあるご質問 ==================== */}
            <section
              id="faq"
              className="py-16 bg-white border-b border-[#EADBCC]/60"
            >
              <div className="max-w-xl mx-auto px-4 sm:px-6 space-y-6">
                <div className="text-center space-y-2">
                  <span className="text-[10px] font-bold tracking-widest uppercase text-[#E3644F] bg-orange-50 px-3 py-1 rounded-full font-en">
                    FAQ
                  </span>
                  <h2 className="font-heading text-xl sm:text-2xl font-bold text-[#2C2B29]">
                    よくあるご質問
                  </h2>
                  <p className="text-xs text-[#5E5B54] leading-relaxed">
                    保護者様からよく寄せられる疑問をまとめました。
                  </p>
                </div>

                <div className="flex items-center justify-end">
                  <button
                    type="button"
                    onClick={toggleAllFaqs}
                    className="text-[11px] font-bold text-[#3E8E84] hover:text-[#2C6B63] px-3 py-1 rounded-full bg-[#D2E7DF]/35 border border-[#3E8E84]/20 transition-colors cursor-pointer"
                  >
                    {allFaqsOpen ? 'すべて閉じる' : 'すべて開く'}
                  </button>
                </div>

                <div className="space-y-3">
                  {FAQ_ITEMS.map((item) => {
                    const isOpen = Boolean(openFaqs[item.id]);
                    return (
                      <div
                        key={item.id}
                        className={`rounded-2xl border transition-colors overflow-hidden ${
                          isOpen
                            ? 'bg-[#FDFBF7] border-[#E3644F]/45 shadow-xs'
                            : 'bg-[#FDFBF7] border-[#EADBCC] hover:border-[#2C2B29]/30'
                        }`}
                      >
                        <button
                          type="button"
                          aria-expanded={isOpen}
                          onClick={() => toggleFaq(item.id)}
                          className="w-full p-4 sm:p-4.5 text-left flex items-start justify-between gap-3 cursor-pointer"
                        >
                          <div className="flex items-start gap-2.5 min-w-0">
                            <span className="w-6 h-6 rounded-full bg-[#E3644F] text-white font-en font-extrabold text-[11px] flex items-center justify-center shrink-0 mt-0.5">
                              Q
                            </span>
                            <div className="min-w-0 space-y-1">
                              <span className="inline-block text-[10px] font-bold text-[#8A857B]">
                                {item.category}
                              </span>
                              <span className="block font-heading font-bold text-xs sm:text-sm text-[#2C2B29] leading-snug">
                                {item.question}
                              </span>
                            </div>
                          </div>
                          <ChevronDown
                            strokeWidth={1.75}
                            className={`w-4 h-4 text-[#8A857B] shrink-0 mt-1 transition-transform ${
                              isOpen ? 'rotate-180 text-[#E3644F]' : ''
                            }`}
                          />
                        </button>

                        {isOpen && (
                          <div className="px-4 sm:px-4.5 pb-4 pt-3 border-t border-[#EADBCC]/60 bg-white/75 flex items-start gap-2.5">
                            <span className="w-6 h-6 rounded-full bg-[#D2E7DF]/80 text-[#2C6B63] font-en font-extrabold text-[11px] flex items-center justify-center shrink-0 mt-0.5">
                              A
                            </span>
                            <p className="text-xs text-[#5E5B54] leading-relaxed">
                              {item.answer}
                            </p>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            </section>

            {/* ==================== 10. 最終CTA ==================== */}
            <section className="py-16 bg-[#FDFBF7] text-center">
              <div className="max-w-xl mx-auto px-6 space-y-5">
                <h2 className="font-heading text-xl sm:text-2xl font-bold text-[#2C2B29] leading-snug">
                  「できた！」の笑顔は、
                  <br />
                  たった60分のきっかけから。
                </h2>
                <p className="text-xs text-[#5E5B54] leading-relaxed">
                  まずはご自宅の近くでどんなコーチが出品されているか、空き状況をチェックしてみてください。
                </p>
                <div className="pt-2">
                  <a
                    href="#search-box"
                    className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 sm:px-8 py-3.5 sm:py-4 bg-[#E3644F] hover:bg-[#cf5440] text-white text-xs sm:text-sm font-bold rounded-full shadow-md transition-all active:scale-95 whitespace-nowrap"
                  >
                    <span>ご希望の種目・エリアで空き枠を探す</span>
                    <ArrowRight className="w-4 h-4 shrink-0" strokeWidth={1.75} />
                  </a>
                </div>
                <div className="flex flex-wrap items-center justify-center gap-4 text-[10px] font-bold text-[#8A857B] pt-2">
                  <span className="inline-flex items-center gap-1">
                    <Check className="w-3 h-3 text-[#3E8E84]" strokeWidth={2} />
                    <span>入会金0円</span>
                  </span>
                  <span className="inline-flex items-center gap-1">
                    <Check className="w-3 h-3 text-[#3E8E84]" strokeWidth={2} />
                    <span>前日正午まで無料振替OK</span>
                  </span>
                  <span className="inline-flex items-center gap-1">
                    <Check className="w-3 h-3 text-[#3E8E84]" strokeWidth={2} />
                    <span>1回のみの受講も歓迎</span>
                  </span>
                </div>
              </div>
            </section>
          </main>

          {/* ==================== 11. Footer ==================== */}
          <footer className="bg-[#2C2B29] text-white/75 py-10 text-xs">
            <div className="max-w-xl mx-auto px-6 space-y-4 text-center">
              <div>
                <p className="font-heading font-bold text-white text-sm">
                  キッズコーチナビ（Kids Coach Navi）
                </p>
                <p className="text-white/50 text-[10px] mt-0.5">
                  運営事業者：SWIM PARTNERS
                </p>
              </div>
              <div className="flex flex-wrap justify-center gap-4 text-white/70 text-[11px]">
                <Link href="/faq" className="hover:text-white transition-colors">
                  よくある質問
                </Link>
                <Link href="/contact" className="hover:text-white transition-colors">
                  お問い合わせ
                </Link>
                <Link href="/terms" className="hover:text-white transition-colors">
                  利用規約
                </Link>
                <Link href="/privacy" className="hover:text-white transition-colors">
                  プライバシー
                </Link>
                <Link href="/tokushoho" className="hover:text-white transition-colors">
                  特定商取引法
                </Link>
              </div>
              <p className="text-white/40 text-[10px] pt-2 font-en">
                © 2026 SWIM PARTNERS. All rights reserved.
              </p>
            </div>
          </footer>
        </div>
      </div>

      {/* トースト通知 */}
      <div
        id="toast"
        className={`fixed bottom-6 right-6 z-200 bg-[#2C2B29] text-white px-4 py-3 rounded-2xl shadow-xl border border-white/10 text-xs font-bold flex items-center gap-2 transform transition-all duration-300 pointer-events-none ${
          toastVisible
            ? 'translate-y-0 opacity-100'
            : 'translate-y-20 opacity-0'
        }`}
      >
        <Check className="w-4 h-4 text-[#3E8E84] shrink-0" strokeWidth={2} />
        <span id="toast-message">{toastMsg}</span>
      </div>
    </div>
  );
}
