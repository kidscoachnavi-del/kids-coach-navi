import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { redirect } from 'next/navigation';
import KcnAdminDashboardClient from '@/components/admin/KcnAdminDashboardClient';

export const dynamic = 'force-dynamic';

export default async function KcnAdminPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login?redirectTo=/admin/kcn');
  }

  const adminClient = createAdminClient();
  const [{ data: kcnUser }, { data: profile }] = await Promise.all([
    adminClient.from('kcn_users').select('role').eq('id', user.id).maybeSingle(),
    adminClient.from('profiles').select('role').eq('id', user.id).maybeSingle(),
  ]);

  const isAdmin = kcnUser?.role === 'admin' || profile?.role === 'admin';
  if (!isAdmin) {
    redirect('/');
  }

  return <KcnAdminDashboardClient />;
}
