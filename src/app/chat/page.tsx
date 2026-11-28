import type { Metadata } from 'next';
import { resolveAndFetchChatData } from '@/lib/kcn-chat';
import ChatClient from '@/components/kids-coach/ChatClient';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'チャット一覧・予約管理 | キッズコーチナビ',
  robots: { index: false, follow: false },
};

interface ChatPageProps {
  searchParams: Promise<{
    room?: string;
    paid?: string;
    role?: string;
  }>;
}

export default async function ChatPage({ searchParams }: ChatPageProps) {
  const resolvedSearch = await searchParams;
  const redirectParams = new URLSearchParams();
  if (resolvedSearch.room) redirectParams.set('room', resolvedSearch.room);
  if (resolvedSearch.paid === '1') redirectParams.set('paid', '1');
  if (resolvedSearch.role === 'coach' || resolvedSearch.role === 'parent') {
    redirectParams.set('role', resolvedSearch.role);
  }
  const queryStr = redirectParams.toString();
  const loginRedirectTo = queryStr ? `/chat?${queryStr}` : '/chat';

  const result = await resolveAndFetchChatData();

  if (!result.ok) {
    return (
      <ChatClient
        initialAuthRequired={result.status === 401}
        initialError={result.status === 401 ? null : result.error}
        loginRedirectTo={loginRedirectTo}
      />
    );
  }

  return (
    <ChatClient
      initialData={result.data}
      loginRedirectTo={loginRedirectTo}
    />
  );
}
