import { createClient } from '@/lib/supabase/server';
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

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .maybeSingle();

  if (!profile || profile.role !== 'admin') {
    redirect('/');
  }

  return <KcnAdminDashboardClient />;
}
