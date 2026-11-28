import Link from 'next/link';
import KidsCoachNavbar from '@/components/kids-coach/Navbar';
import KidsCoachFooter from '@/components/kids-coach/Footer';
import { SPORT_CATEGORIES } from '@/data/kids-coach-mock';
import { Home, ArrowRight, Compass, Users } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-[#FDFBF7] text-[#2C2B29] flex flex-col font-sans">
      <KidsCoachNavbar />

      <main className="flex-1 py-12 sm:py-16 md:py-20">
        <div className="max-w-3xl mx-auto px-4 sm:px-6">
          <div className="bg-white rounded-3xl border border-[#EADBCC] shadow-xs p-7 sm:p-10 md:p-12 text-center space-y-6">
            <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-[#FCE7A2]/80 border border-[#EADBCC] text-[#2C2B29] mx-auto">
              <Compass className="w-7 h-7 text-[#E3644F]" strokeWidth={1.75} />
            </div>

            <div className="space-y-2.5">
              <span className="inline-block font-en text-[11px] font-extrabold tracking-widest uppercase text-[#E3644F] bg-orange-50 px-3 py-1 rounded-full">
                404 NOT FOUND
              </span>
              <h1 className="font-heading text-2xl sm:text-3xl font-bold text-[#2C2B29] tracking-tight">
                お探しのページが見つかりませんでした
              </h1>
              <p className="text-xs sm:text-sm text-[#5E5B54] leading-relaxed max-w-lg mx-auto">
                URLが変更されたか、ページが削除・移動された可能性があります。
                <br className="hidden sm:inline" />
                トップページや種目別ページから、ご希望のレッスンをお探しください。
              </p>
            </div>

            {/* 主要導線 */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-1">
              <Link
                href="/"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-full bg-[#3E8E84] hover:bg-[#32756d] text-white font-bold text-xs sm:text-sm transition-colors shadow-xs"
              >
                <Home className="w-4 h-4 shrink-0" strokeWidth={1.75} />
                <span>トップページへ戻る</span>
              </Link>
              <Link
                href="/coach-recruit"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-full bg-[#FDFBF7] hover:bg-[#FCE7A2]/45 border border-[#EADBCC] hover:border-[#E3644F] text-[#2C2B29] font-bold text-xs sm:text-sm transition-colors"
              >
                <Users className="w-4 h-4 text-[#E3644F] shrink-0" strokeWidth={1.75} />
                <span>コーチ募集を見る</span>
              </Link>
            </div>

            {/* 種目ページリンク */}
            <div className="pt-6 border-t border-[#EADBCC] text-left space-y-3">
              <p className="text-xs font-bold text-[#5E5B54] text-center">
                種目から出張マンツーマン指導を探す
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {SPORT_CATEGORIES.map((category) => (
                  <Link
                    key={category.slug}
                    href={`/sports/${category.slug}`}
                    className="p-3.5 rounded-2xl bg-[#FDFBF7] hover:bg-[#FCE7A2]/40 border border-[#EADBCC] hover:border-[#E3644F] transition-all flex items-center justify-between gap-2 group"
                  >
                    <div className="min-w-0">
                      <span className="font-en text-[10px] font-extrabold tracking-widest text-[#3E8E84] block">
                        {category.code}
                      </span>
                      <span className="text-xs sm:text-sm font-bold text-[#2C2B29] block truncate">
                        {category.name}
                      </span>
                    </div>
                    <ArrowRight
                      className="w-4 h-4 text-[#5E5B54] group-hover:text-[#E3644F] group-hover:translate-x-0.5 transition-all shrink-0"
                      strokeWidth={1.75}
                    />
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </div>
      </main>

      <KidsCoachFooter />
    </div>
  );
}
