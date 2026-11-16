// キッズコーチナビ モックデータ＆SEOマスタデータ定義（運営会社: 株式会社Wellne）

export interface Coach {
  id: string;
  name: string;
  kana: string;
  initial: string;
  title: string;
  avatar: string;
  rating: number;
  reviewCount: number;
  hourlyRate: number; // 単位: 円
  durationMinutes: number;
  sports: string[]; // 例: ["水泳", "かけっこ"]
  sportsSlugs: string[]; // 例: ["swimming", "running"]
  specialties: string[]; // 得意分野タグ
  areas: string[]; // 対応エリア 例: ["世田谷区", "目黒区", "駒沢公園周辺"]
  areaSlugs: string[]; // 例: ["setagaya", "meguro"]
  bio: string;
  achievements: string[]; // 競技実績
  coachingHistory: string[]; // 指導歴
  targetAges: string; // 対象年齢
  message: string;
  isVerified: boolean; // 身元確認済みフラグ
}

export interface AvailableSlot {
  id: string;
  coachId: string;
  date: string; // "2026-11-14"
  dayOfWeek: string; // "土"
  startTime: string; // "10:00"
  endTime: string; // "11:00"
  status: 'available' | 'booked';
}

// 種目カテゴリーマスタ（SEO / AIO対応）
export interface SportCategory {
  slug: string;
  name: string;
  badge: string;
  code: string;
  shortDesc: string;
  longDesc: string;
  subCategories: string[];
  recommendedAges: string;
  priceFrom: number;
}

export const SPORT_CATEGORIES: SportCategory[] = [
  {
    slug: 'running',
    name: 'かけっこ・陸上',
    badge: '運動会対策No.1',
    code: '01 / RUNNING',
    shortDesc: '走り方フォーム改善、運動会1等賞対策、スタートダッシュ特訓',
    longDesc: '「走るのが遅い」「腕振りがぎこちない」をプロが分析。足の接地、腕振り、姿勢を楽しく改善し、短期間で目に見えてタイムが縮まります。',
    subCategories: ['走り方フォーム改善', '運動会1等賞対策', 'スタートダッシュ特訓', '姿勢・体幹強化'],
    recommendedAges: '年中〜小学6年生',
    priceFrom: 5000,
  },
  {
    slug: 'school-pe',
    name: '学校体育克服',
    badge: '苦手ゼロへ',
    code: '02 / GYMNASTICS',
    shortDesc: '逆上がり・鉄棒、跳び箱、縄跳び・二重跳び、球技基礎',
    longDesc: '体育の授業でつまずきがちな鉄棒や跳び箱を完全マンツーマンで指導。スモールステップで恐怖心を取り除き、「できた！」の達成感を育みます。',
    subCategories: ['逆上がり・鉄棒', '跳び箱（開脚跳び）', '縄跳び・二重跳び', 'マット運動・球技基礎'],
    recommendedAges: '年少〜小学6年生',
    priceFrom: 5500,
  },
  {
    slug: 'swimming',
    name: '水泳',
    badge: '人気急上昇',
    code: '03 / SWIMMING',
    shortDesc: '水慣れ・顔つけ、バタ足・息継ぎ、クロール25m完泳、4泳法',
    longDesc: '個人レッスンが利用可能なプール施設へ出張。集団スイミングスクールで順番待ちばかりだったお子様も、マンツーマンなら60分フルで練習できて驚異的なスピードで進級・完泳。',
    subCategories: ['水慣れ・顔つけ', 'バタ足・息継ぎ克服', 'クロール25m完泳', '平泳ぎ・背泳ぎ・バタフライ'],
    recommendedAges: '3歳〜中学生',
    priceFrom: 6000,
  },
  {
    slug: 'niche-sports',
    name: '専門・ニッチスポーツ',
    badge: '個性を伸ばす',
    code: '04 / SPECIALTY',
    shortDesc: '一輪車、体操・バク転、ダブルダッチ、フェンシング、ボルダリング等',
    longDesc: '近くにスクールがないマイナースポーツや専門競技も、経験豊富な専任コーチが出張指導。お子様の個性と「やってみたい！」を全力で応援します。',
    subCategories: ['一輪車', '体操・バク転', 'ダブルダッチ', 'フェンシング', 'ボルダリング'],
    recommendedAges: '5歳〜高校生',
    priceFrom: 6500,
  },
];

// 対応エリアマスタ（SEO / AIO対応）
export interface AreaInfo {
  slug: string;
  name: string;
  prefecture: string;
  parks: string[];
}

export const AREA_LIST: AreaInfo[] = [
  { slug: 'setagaya', name: '世田谷区', prefecture: '東京都', parks: ['駒沢オリンピック公園', '世田谷公園', '二子玉川公園'] },
  { slug: 'meguro', name: '目黒区', prefecture: '東京都', parks: ['林試の森公園', '中目黒公園', '駒場野公園'] },
  { slug: 'minato', name: '港区', prefecture: '東京都', parks: ['芝公園', '有栖川宮記念公園', '港区立スポーツセンター'] },
  { slug: 'shibuya', name: '渋谷区', prefecture: '東京都', parks: ['代々木公園', '宮下公園', '渋谷区スポーツセンター'] },
  { slug: 'shinagawa', name: '品川区', prefecture: '東京都', parks: ['しながわ区民公園', '大井ふ頭中央海浜公園', '戸越公園'] },
  { slug: 'chuo', name: '中央区', prefecture: '東京都', parks: ['浜町公園', '晴海ふ頭公園', '中央体育館'] },
  { slug: 'koto', name: '江東区', prefecture: '東京都', parks: ['木場公園', '豊洲公園', '夢の島公園'] },
  { slug: 'chiba', name: '浦安市・市川市', prefecture: '千葉県', parks: ['浦安市総合公園', '行徳駅前公園', '国府台スポーツセンター'] },
  { slug: 'funabashi-matsudo', name: '船橋市・松戸市', prefecture: '千葉県', parks: ['船橋市運動公園', '21世紀の森と広場', '秋津公園'] },
  { slug: 'kanagawa', name: '横浜・川崎エリア', prefecture: '神奈川県', parks: ['等々力緑地', '山下公園', '新横浜公園'] },
  { slug: 'saitama', name: 'さいたま・南部エリア', prefecture: '埼玉県', parks: ['大宮公園', '別所沼公園', '青木町公園'] },
];

export const MOCK_COACHES: Coach[] = [
  {
    id: 'coach-1',
    name: '田中 健太',
    kana: 'タナカ ケンタ',
    initial: '田',
    title: '元インカレ陸上 ｜ 指導歴5年',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=600&q=80',
    rating: 4.9,
    reviewCount: 42,
    hourlyRate: 6500,
    durationMinutes: 60,
    sports: ['かけっこ・走り方'],
    sportsSlugs: ['running'],
    specialties: ['かけっこ・走り方', '運動会対策', 'スタートダッシュ', '姿勢改善'],
    areas: ['世田谷区', '目黒区', '駒沢公園周辺', '渋谷区'],
    areaSlugs: ['setagaya', 'meguro', 'shibuya'],
    bio: '「腕の振り方」と「地面を蹴る感覚」を遊びながら習得。運動会前に1回だけでも劇的にフォームが変わります！駒沢公園や世田谷公園など近隣の公園へ出張します。',
    achievements: [
      '全日本インカレ 4×100mリレー 出場',
      '100m自己ベスト: 10秒68',
    ],
    coachingHistory: [
      'キッズかけっこ教室 ヘッドコーチ 3年間',
      '小学生向け運動能力向上プログラム 開発担当（指導実績350名超）',
    ],
    targetAges: '4歳〜小学6年生',
    message: '正しいフォームを身につけるだけで、走りは驚くほど速く、楽しくなります！',
    isVerified: true,
  },
  {
    id: 'coach-2',
    name: '山本 翔平',
    kana: 'ヤマモト ショウヘイ',
    initial: '山',
    title: '日本水泳連盟公認指導員 ｜ 元国体選手',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=600&q=80',
    rating: 5.0,
    reviewCount: 38,
    hourlyRate: 7500,
    durationMinutes: 60,
    sports: ['水泳・息継ぎ'],
    sportsSlugs: ['swimming'],
    specialties: ['水泳・息継ぎ', '水慣れ・顔つけ', 'クロール25m完泳', '4泳法フォーム改善'],
    areas: ['港区', '中央区', '江東区', '渋谷区'],
    areaSlugs: ['minato', 'chuo', 'koto', 'shibuya'],
    bio: '集団スクールで何ヶ月も進級できない原因を60分で特定。個人指導が可能なプール施設へ出張し、怖がらせずに息継ぎと25m完泳へ導きます。',
    achievements: [
      '国民体育大会（国体）水泳競技 出場',
      '日本水泳連盟公認指導員資格 保持',
    ],
    coachingHistory: [
      '大手スイミングスクール 指導員 5年間',
      '個人レッスン・プール施設出張指導 3年間（完泳達成率96%）',
    ],
    targetAges: '3歳〜小学6年生',
    message: 'お子様のペースに合わせ、「できた！」の喜びを全力でサポートします！',
    isVerified: true,
  },
  {
    id: 'coach-3',
    name: '佐々木 翼',
    kana: 'ササキ ツバサ',
    initial: '佐',
    title: '元体操競技選手 ｜ 指導歴6年',
    avatar: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&w=600&q=80',
    rating: 4.9,
    reviewCount: 51,
    hourlyRate: 6000,
    durationMinutes: 60,
    sports: ['鉄棒・逆上がり'],
    sportsSlugs: ['school-pe'],
    specialties: ['鉄棒・逆上がり', '跳び箱（開脚跳び）', 'マット運動', '体幹バランス'],
    areas: ['中央区', '江東区', '港区', '世田谷区'],
    areaSlugs: ['chuo', 'koto', 'minato', 'setagaya'],
    bio: '逆上がりができないのは筋力不足ではなく「回る感覚」と「目線」が原因です。近所の公園の鉄棒で楽しく克服しましょう！',
    achievements: [
      '全日本学生体操競技選手権 出場',
      '日本体操協会公認指導員',
    ],
    coachingHistory: [
      '幼児・児童体育スクール 専任講師 4年間',
      'プライベート出張指導 2年間（逆上がり成功率94%）',
    ],
    targetAges: '年中〜小学5年生',
    message: '苦手な体育の時間を「一番大好きな時間」に変えるお手伝いをします！',
    isVerified: true,
  },
  {
    id: 'coach-4',
    name: '高橋 陸',
    kana: 'タカハシ リク',
    initial: '高',
    title: '小学校体育専門指導員 ｜ 体育大卒',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=600&q=80',
    rating: 4.8,
    reviewCount: 29,
    hourlyRate: 5500,
    durationMinutes: 60,
    sports: ['なわとび・二重跳び'],
    sportsSlugs: ['school-pe', 'niche-sports'],
    specialties: ['なわとび・二重跳び', '跳び箱・マット', 'ボール投げ・球技基礎', 'リズムトレーニング'],
    areas: ['世田谷区', '目黒区', '渋谷区', '横浜・川崎エリア'],
    areaSlugs: ['setagaya', 'meguro', 'shibuya', 'kanagawa'],
    bio: '手首の回し方とジャンプのリズムを分解して指導。学校の体育テスト前に1〜2回の短期集中で自信をつけさせます。',
    achievements: [
      '体育大学 児童スポーツ教育専攻 卒業',
      '小学校教諭一種免許・中高保健体育免許 保持',
    ],
    coachingHistory: [
      '都内公立小学校 体育専科講師 3年間',
      'キッズ出張パーソナル指導 2年間',
    ],
    targetAges: '4歳〜小学6年生',
    message: 'スモールステップで「昨日よりできた！」を一緒に積み重ねましょう。',
    isVerified: true,
  },
];

// 直近の空きスロット生成（デフォルト14日間、月カレンダー用に日数指定可能）
export function generateMockSlots(coachId: string, days = 14): AvailableSlot[] {
  const slots: AvailableSlot[] = [];
  const today = new Date('2026-11-10T00:00:00+09:00');
  const dayNames = ['日', '月', '火', '水', '木', '金', '土'];

  for (let i = 1; i <= days; i++) {
    const d = new Date(today);
    d.setDate(today.getDate() + i);
    const dateStr = d.toISOString().split('T')[0];
    const dayOfWeek = dayNames[d.getDay()];

    const isWeekend = d.getDay() === 0 || d.getDay() === 6;
    const timeTemplates = isWeekend
      ? [
          { start: '10:00', end: '11:00' },
          { start: '13:30', end: '14:30' },
          { start: '15:30', end: '16:30' },
        ]
      : [
          { start: '16:00', end: '17:00' },
          { start: '17:30', end: '18:30' },
        ];

    timeTemplates.forEach((t, idx) => {
      const isBooked = (i * 3 + idx) % 5 === 0;
      slots.push({
        id: `slot-${coachId}-${dateStr}-${t.start.replace(':', '')}`,
        coachId,
        date: dateStr,
        dayOfWeek,
        startTime: t.start,
        endTime: t.end,
        status: isBooked ? 'booked' : 'available',
      });
    });
  }

  return slots;
}

export interface SportVisualAsset {
  src: string;
  alt: string;
  shapeClass: string;
}

// 種目別Heroで利用するリソグラフイラストと背景モチーフ定義
export const SPORT_VISUALS: Record<string, SportVisualAsset> = {
  running: {
    src: '/images/kids-coach/feature-01.png',
    alt: 'かけっこフォーム指導のイラスト',
    shapeClass: 'rounded-full bg-[#FCE7A2]/75',
  },
  'school-pe': {
    src: '/images/kids-coach/feature-02-park.png',
    alt: '公園での鉄棒・逆上がり指導のイラスト',
    shapeClass: 'rounded-[32px] -rotate-6 bg-[#D2E7DF]/75',
  },
  swimming: {
    src: '/images/kids-coach/hero-trio.png',
    alt: '水泳・かけっこ・鉄棒の出張スポーツ指導イラスト',
    shapeClass: 'rounded-full bg-[#88C8D8]/30',
  },
  'niche-sports': {
    src: '/images/kids-coach/hero-trio.png',
    alt: '多彩なスポーツの個別指導イラスト',
    shapeClass: 'rounded-full bg-[#FCE7A2]/70',
  },
};
