import type { Metadata } from 'next';
import { resolveAndFetchCoachDashboard } from '@/lib/kcn-coach-dashboard';
import CoachDashboardClient from '@/components/kids-coach/CoachDashboardClient';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'コーチダッシュボード | キッズコーチナビ',
  robots: { index: false, follow: false },
};

export default async function CoachDashboardPage() {
  const result = await resolveAndFetchCoachDashboard();

  if (!result.ok) {
    return (
      <CoachDashboardClient
        initialAuthRequired={result.status === 401}
        initialError={result.status === 401 ? null : result.error}
      />
    );
  }

  return <CoachDashboardClient initialData={result.data} />;
}
