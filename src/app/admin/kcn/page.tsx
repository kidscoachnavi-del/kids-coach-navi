import type { Metadata } from 'next';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { redirect } from 'next/navigation';
import KidsCoachNavbar from '@/components/kids-coach/Navbar';
import KidsCoachFooter from '@/components/kids-coach/Footer';
import KcnAdminDashboardClient from '@/components/admin/KcnAdminDashboardClient';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: '運営・コーチ審査ダッシュボード | キッズコーチナビ',
  robots: { index: false, follow: false },
};

export default async function KcnAdminPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login?redirectTo=/admin/kcn');
  }

  const isAdminEmail = user.email?.toLowerCase() === 'info@swim-partners.com';
  const adminClient = createAdminClient();
  const [{ data: kcnUser }, { data: profile }] = await Promise.all([
    adminClient.from('kcn_users').select('role').eq('id', user.id).maybeSingle(),
    adminClient.from('profiles').select('role').eq('id', user.id).maybeSingle(),
  ]);

  if (isAdminEmail && kcnUser?.role !== 'admin') {
    await adminClient.from('kcn_users').upsert(
      {
        id: user.id,
        role: 'admin',
        name: 'SWIM PARTNERS 管理者',
        email: user.email!,
      },
      { onConflict: 'id' }
    );
  }

  const isAdmin = isAdminEmail || kcnUser?.role === 'admin' || profile?.role === 'admin';
  if (!isAdmin) {
    redirect('/');
  }

  return (
    <div className="min-h-screen bg-[#FDFBF7] text-[#2C2B29] flex flex-col font-sans">
      <KidsCoachNavbar />
      <main className="flex-1 py-6 sm:py-10">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <KcnAdminDashboardClient />
        </div>
      </main>
      <KidsCoachFooter />
    </div>
  );
}
