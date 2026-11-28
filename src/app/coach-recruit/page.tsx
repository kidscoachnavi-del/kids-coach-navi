import type { Metadata } from 'next';
import Link from 'next/link';
import {
    ArrowRight,
    CalendarClock,
    CheckCircle2,
    CreditCard,
    ShieldCheck,
    Sparkles,
    Users,
} from 'lucide-react';

export const metadata: Metadata = {
    title: '初期パートナーコーチ募集 | キッズコーチナビ (Kids Coach Navi)',
    description:
        '水泳・かけっこ・体育対策の個別指導マッチング「キッズコーチナビ」の初期パートナーコーチ募集ページ。集客・決済丸投げで週末1コマから指導できます。',
};

const ONBOARDING_URL =
    process.env.NEXT_PUBLIC_COACH_ONBOARDING_URL ||
    'https://kids-coach-navi.com/coach/onboarding';

const BENEFITS = [
    {
        icon: CreditCard,
        title: '集客・予約・決済はすべて丸投げ',
        description:
            '個人レッスンで一番大変な集客、日程調整、事前決済、キャンセル対応までシステムが代行。あなたは「教えること」に集中できます。',
    },
    {
        icon: CalendarClock,
        title: '週末1コマ・平日の隙間時間からOK',
        description:
            'シフトの拘束はありません。本業や学業の合間、土日だけの副業など、ご自身のライフスタイルに合わせて活動できます。',
    },
    {
        icon: Sparkles,
        title: '初期パートナー限定の優先案内',
        description:
            'ローンチ初期にご登録いただいた認定コーチには、対応エリアのお子さま・保護者様からのレッスン依頼を優先的にご案内します。',
    },
];

const TARGET_COACHES = [
    '現役・元スイミングスクール／体操教室のコーチ',
    '体育大学・教育学部の学生、教員志望の方',
    '水泳部・陸上部・体操部などの競技経験者',
    '副業やフリーランスで子ども指導を始めたい方',
];

const ONBOARDING_STEPS = [
    { step: '1', title: '情報登録', desc: 'プロフィール・種目・顔写真を入力（約3分）' },
    { step: '2', title: '目視審査', desc: '安全・安心のため運営が内容を確認' },
    { step: '3', title: '審査承認', desc: '承認後、口座・本人確認を連携' },
    { step: '4', title: '登録完了', desc: '空き枠を公開して指導スタート！' },
];

export default function CoachRecruitPage() {
    return (
        <div className="min-h-screen bg-[#FAF8F5] text-[#1C1917]">
            {/* ヘッダー */}
            <header className="sticky top-0 z-20 border-b border-[#E6E1D8] bg-[#FAF8F5]/95 backdrop-blur-sm">
                <div className="mx-auto flex max-w-5xl items-center justify-between gap-3 px-4 py-3.5">
                    <Link
                        href="https://kids-coach-navi.com/"
                        className="flex flex-col min-w-0"
                    >
                        <span className="text-base sm:text-lg font-extrabold tracking-tight text-[#1C1917] truncate">
                            Kids Coach Navi
                        </span>
                        <span className="text-[10px] font-medium tracking-wider text-[#0D9488]">
                            by SWIM PARTNERS
                        </span>
                    </Link>

                    <a
                        href={ONBOARDING_URL}
                        className="inline-flex items-center justify-center gap-1.5 rounded-full bg-[#F26B5B] hover:bg-[#E05A4A] px-4 py-2 text-xs sm:text-sm font-bold text-white shadow-xs transition-colors whitespace-nowrap shrink-0"
                    >
                        <span>コーチ登録へ</span>
                        <ArrowRight className="h-3.5 w-3.5 shrink-0" />
                    </a>
                </div>
            </header>

            {/* ヒーローセクション */}
            <section className="border-b border-[#E6E1D8] bg-gradient-to-b from-[#FAF8F5] to-[#F3EFE6]">
                <div className="mx-auto max-w-4xl px-4 py-12 sm:py-20 text-center space-y-6">
                    <div className="space-y-2">
                        <p className="text-xs font-bold tracking-[0.2em] text-[#0D9488] uppercase">
                            COACH RECRUITMENT
                        </p>
                        <span className="inline-flex max-w-full items-center justify-center gap-1.5 rounded-xl sm:rounded-full border border-[#0D9488]/30 bg-[#0D9488]/10 px-3.5 py-1.5 text-[11px] sm:text-xs font-bold text-[#0F766E] text-center">
                            <ShieldCheck className="h-3.5 w-3.5 shrink-0" />
                            <span>水泳・かけっこ・体育対策｜初期パートナー募集中</span>
                        </span>
                    </div>

                    <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight text-[#1C1917] leading-snug">
                        あなたの指導スキルを、
                        <br />
                        子どもたちの「できた！」へ。
                    </h1>

                    <p className="mx-auto max-w-xl text-sm sm:text-base text-stone-600 leading-relaxed">
                        キッズコーチナビは、スポーツを教えたい指導者と
                        <br className="hidden sm:inline" />
                        お子さまの成長を願う保護者をつなぐ個別指導サービスです。
                        <br />
                        集客や決済はすべてお任せで、週末1コマから指導できます。
                    </p>

                    <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
                        <a
                            href={ONBOARDING_URL}
                            className="w-full sm:w-auto max-w-full px-4 sm:px-8 py-3.5 sm:py-4 rounded-full bg-[#F26B5B] hover:bg-[#E05A4A] text-white font-bold text-xs sm:text-sm shadow-sm transition-colors whitespace-nowrap inline-flex items-center justify-center gap-2"
                        >
                            <span>認定コーチ登録へ進む（無料）</span>
                            <ArrowRight className="h-4 w-4 shrink-0" />
                        </a>
                    </div>
                </div>
            </section>

            <main className="mx-auto max-w-4xl px-4 py-12 sm:py-16 space-y-14">
                {/* 選ばれる3つの理由 */}
                <section className="space-y-6">
                    <div className="text-center space-y-2">
                        <p className="text-xs font-bold tracking-[0.18em] text-[#0D9488] uppercase">
                            WHY KIDS COACH NAVI
                        </p>
                        <h2 className="text-xl sm:text-2xl font-extrabold text-[#1C1917]">
                            キッズコーチナビで教える
                            <br className="sm:hidden" />
                            3つのメリット
                        </h2>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {BENEFITS.map((item) => {
                            const Icon = item.icon;
                            return (
                                <div
                                    key={item.title}
                                    className="rounded-2xl border border-[#E6E1D8] bg-white p-6 shadow-xs space-y-3 overflow-hidden"
                                >
                                    <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#0D9488]/10 text-[#0D9488]">
                                        <Icon className="h-5 w-5 shrink-0" />
                                    </div>
                                    <h3 className="text-base font-bold text-[#1C1917]">
                                        {item.title}
                                    </h3>
                                    <p className="text-xs sm:text-sm text-stone-600 leading-relaxed">
                                        {item.description}
                                    </p>
                                </div>
                            );
                        })}
                    </div>
                </section>

                {/* こんな方におすすめ */}
                <section className="rounded-2xl border border-[#E6E1D8] bg-white p-6 sm:p-8 shadow-xs space-y-5">
                    <div className="flex items-center gap-2.5">
                        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#F26B5B]/10 text-[#F26B5B]">
                            <Users className="h-5 w-5 shrink-0" />
                        </div>
                        <h2 className="text-lg sm:text-xl font-extrabold text-[#1C1917]">
                            こんな方を募集しています
                        </h2>
                    </div>

                    <ul className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {TARGET_COACHES.map((text) => (
                            <li
                                key={text}
                                className="flex items-start gap-2.5 rounded-xl bg-[#FAF8F5] px-4 py-3 text-xs sm:text-sm font-medium text-[#1C1917]"
                            >
                                <CheckCircle2 className="h-4 w-4 text-[#0D9488] shrink-0 mt-0.5" />
                                <span className="min-w-0 flex-1">{text}</span>
                            </li>
                        ))}
                    </ul>
                </section>

                {/* 登録フロー（/coach/onboarding の4ステップと完全同期） */}
                <section className="space-y-6">
                    <div className="text-center space-y-2">
                        <p className="text-xs font-bold tracking-[0.18em] text-[#0D9488] uppercase">
                            ONBOARDING FLOW
                        </p>
                        <h2 className="text-xl sm:text-2xl font-extrabold text-[#1C1917]">
                            認定コーチ登録・審査の4ステップ
                        </h2>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
                        {ONBOARDING_STEPS.map((s) => (
                            <div
                                key={s.step}
                                className="rounded-2xl border border-[#E6E1D8] bg-white p-4 space-y-2"
                            >
                                <span className="inline-flex items-center rounded-full bg-[#1C1917] px-2.5 py-0.5 text-[11px] font-bold text-white">
                                    STEP {s.step}
                                </span>
                                <h3 className="text-sm font-bold text-[#1C1917]">{s.title}</h3>
                                <p className="text-xs text-stone-600 leading-relaxed">{s.desc}</p>
                            </div>
                        ))}
                    </div>
                </section>

                {/* 下部CTA */}
                <section className="rounded-2xl border border-[#0D9488]/25 bg-white p-6 sm:p-10 text-center space-y-5 shadow-sm">
                    <h2 className="text-xl sm:text-2xl font-extrabold text-[#1C1917]">
                        まずは認定コーチ登録へ
                    </h2>
                    <p className="mx-auto max-w-lg text-xs sm:text-sm text-stone-600 leading-relaxed">
                        ご登録内容をもとに簡単な審査を行ったあと、レッスン受付を開始できます。
                        <br className="hidden sm:inline" />
                        下のボタンから公式の「認定コーチ登録・審査フロー」へお進みください。
                    </p>
                    <div className="pt-1 flex justify-center">
                        <a
                            href={ONBOARDING_URL}
                            className="w-full sm:w-auto max-w-full px-4 sm:px-10 py-4 rounded-full bg-[#F26B5B] hover:bg-[#E05A4A] text-white font-bold text-xs sm:text-sm shadow-sm transition-colors whitespace-nowrap inline-flex items-center justify-center gap-2"
                        >
                            <span>認定コーチ登録・審査へ進む</span>
                            <ArrowRight className="h-4 w-4 shrink-0" />
                        </a>
                    </div>
                </section>
            </main>

            <footer className="border-t border-[#E6E1D8] bg-[#F3EFE6] py-10 text-center text-xs text-stone-500">
                <div className="mx-auto max-w-4xl px-4 space-y-4">
                    <div>
                        <p className="font-bold text-[#1C1917] text-sm">
                            キッズコーチナビ（Kids Coach Navi）
                        </p>
                        <p className="text-[11px] text-stone-500 mt-0.5">
                            運営事業者：SWIM PARTNERS
                        </p>
                    </div>
                    <nav
                        aria-label="フッターナビゲーション"
                        className="flex flex-wrap justify-center gap-x-5 gap-y-2 text-xs font-medium text-stone-600"
                    >
                        <Link href="/faq" className="hover:text-[#1C1917] transition-colors">
                            よくある質問
                        </Link>
                        <Link href="/contact" className="hover:text-[#1C1917] transition-colors">
                            お問い合わせ
                        </Link>
                        <Link href="/terms" className="hover:text-[#1C1917] transition-colors">
                            利用規約
                        </Link>
                        <Link href="/privacy" className="hover:text-[#1C1917] transition-colors">
                            プライバシー
                        </Link>
                        <Link href="/tokushoho" className="hover:text-[#1C1917] transition-colors">
                            特定商取引法
                        </Link>
                    </nav>
                    <p className="text-[11px] text-stone-500 pt-1">
                        © {new Date().getFullYear()} SWIM PARTNERS. All rights reserved.
                    </p>
                </div>
            </footer>
        </div>
    );
}
