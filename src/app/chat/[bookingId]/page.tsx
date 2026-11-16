'use client';

import { useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';

/**
 * 個別予約チャットURLへのアクセスをチャット一覧画面（/chat）へ統一リダイレクトする
 */
export default function BookingChatRedirectPage() {
  const params = useParams();
  const router = useRouter();
  const bookingId = (params?.bookingId as string) || 'bk-demo-001';

  useEffect(() => {
    const search = new URLSearchParams(window.location.search);
    const nextParams = new URLSearchParams();
    nextParams.set('room', bookingId);
    if (search.get('paid') === '1') {
      nextParams.set('paid', '1');
    }
    router.replace(`/chat?${nextParams.toString()}`);
  }, [bookingId, router]);

  return (
    <div className="min-h-screen bg-[#FDFBF7] flex items-center justify-center text-xs font-bold text-[#5E5B54]">
      チャット一覧へ移動しています...
    </div>
  );
}
