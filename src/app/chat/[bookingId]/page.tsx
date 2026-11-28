import { redirect } from 'next/navigation';

export const dynamic = 'force-dynamic';

interface BookingChatRedirectPageProps {
  params: Promise<{ bookingId: string }>;
  searchParams: Promise<{ paid?: string }>;
}

/**
 * 個別予約チャットURLへのアクセスをチャット一覧画面（/chat）へ統一リダイレクトする
 */
export default async function BookingChatRedirectPage({
  params,
  searchParams,
}: BookingChatRedirectPageProps) {
  const { bookingId } = await params;
  const resolvedSearch = await searchParams;

  const nextParams = new URLSearchParams();
  if (bookingId) {
    nextParams.set('room', bookingId);
  }
  if (resolvedSearch.paid === '1') {
    nextParams.set('paid', '1');
  }

  const query = nextParams.toString();
  redirect(query ? `/chat?${query}` : '/chat');
}
