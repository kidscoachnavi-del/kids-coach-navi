'use client';

import React, { useState, useMemo, useRef, useEffect } from 'react';
import Link from 'next/link';
import KidsCoachNavbar from '@/components/kids-coach/Navbar';
import {
  INITIAL_BOOKINGS,
  INITIAL_CHAT_MESSAGES,
} from '@/lib/kids-coach-store';
import {
  Booking,
  ChatMessage,
  validateChatMessage,
  isChatActive,
} from '@/types/kids-coach-db';
import {
  Search,
  Send,
  MessageSquareText,
  X,
  Trash2,
  Shield,
  ShieldAlert,
  Lock,
  RotateCcw,
  ChevronLeft,
  Calendar,
  CheckCheck,
  CheckCircle2,
  CreditCard,
  Clock,
  ChevronRight,
  Layers,
} from 'lucide-react';

/** メッセージ時刻をリスト／吹き出し向けの短い表記に整形する */
function formatShortTime(raw: string): string {
  const isoMatch = raw.match(/^\d{4}-(\d{2})-(\d{2})T(\d{2}:\d{2})/);
  if (isoMatch) {
    return `${Number(isoMatch[1])}/${Number(isoMatch[2])} ${isoMatch[3]}`;
  }
  return raw;
}

/** ISO日時文字列から日時ラベル（例: 11/17 15:00〜16:00）を組み立てる */
function formatSlotLabel(startRaw?: string, endRaw?: string): string {
  if (!startRaw || !endRaw) return '日程調整中';
  const s = startRaw.match(/^\d{4}-(\d{2})-(\d{2})T(\d{2}:\d{2})/);
  const e = endRaw.match(/T(\d{2}:\d{2})/);
  if (!s || !e) return '日程調整中';
  return `${Number(s[1])}/${Number(s[2])} ${s[3]}〜${e[1]}`;
}

/** 予約の日程ステータスと決済ステータスを一元的に判定して返す */
function getBookingMeta(booking: Booking, paidInSession: boolean) {
  const isPaid =
    paidInSession ||
    Boolean(booking.stripe_payment_intent_id) ||
    booking.status === 'confirmed' ||
    booking.status === 'completion_reported' ||
    booking.status === 'completed';

  const scheduleStatus =
    booking.status === 'completed'
      ? { label: '受講完了', className: 'bg-[#FCE7A2]/80 text-[#2C2B29]' }
      : booking.status === 'completion_reported'
        ? { label: '確認保留中', className: 'bg-[#E3644F]/15 text-[#E3644F]' }
        : isPaid
          ? { label: '日程確定', className: 'bg-[#D2E7DF]/75 text-[#3E8E84]' }
          : { label: '日程調整中', className: 'bg-[#F3EFE8] text-[#5E5B54]' };

  const paymentStatus = isPaid
    ? { label: '支払い完了', className: 'bg-[#3E8E84] text-white' }
    : { label: '未決済', className: 'bg-[#FCE7A2] text-[#8A5A00]' };

  return { isPaid, scheduleStatus, paymentStatus };
}

/** ルーム内の予約並び順（確認保留 → 確定予定 → 調整中・未決済 → 受講完了） */
function sortRoomBookings(list: Booking[]): Booking[] {
  const rank = (status: Booking['status']) => {
    if (status === 'completion_reported') return 0;
    if (status === 'confirmed') return 1;
    if (status === 'pending') return 2;
    if (status === 'completed') return 3;
    return 4;
  };
  return [...list].sort((a, b) => {
    const diff = rank(a.status) - rank(b.status);
    if (diff !== 0) return diff;
    return (a.slot?.start_time || '').localeCompare(b.slot?.start_time || '');
  });
}

export default function ChatListPage() {
  // 体験用ロール切替（生徒・保護者 / コーチ）
  const [activeRole, setActiveRole] = useState<'parent' | 'coach'>('parent');
  const [showDemoTools, setShowDemoTools] = useState(
    process.env.NODE_ENV !== 'production'
  );

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      if (params.get('demo') === '1') setShowDemoTools(true);
    }
  }, []);

  // 検索・フィルタ状態
  const [searchQuery, setSearchQuery] = useState('');
  const [roomFilter, setRoomFilter] = useState<'all' | 'unread' | 'deleted'>('all');
  const [sportFilter, setSportFilter] = useState<string>('all');

  // 全メッセージ・削除状態（roomKey単位）・セッション内決済完了状態
  const [messages, setMessages] = useState<ChatMessage[]>(INITIAL_CHAT_MESSAGES);
  const [deletedMap, setDeletedMap] = useState<
    Record<string, 'parent' | 'coach' | null>
  >({});
  const [paidBookingIds, setPaidBookingIds] = useState<Record<string, boolean>>({});
  const [showPaidBanner, setShowPaidBanner] = useState(false);

  // 選択中のトークルーム（parentId__coachId）と、各ルーム内で選択中の予約ID
  const [selectedRoomKey, setSelectedRoomKey] = useState<string>('parent-0035__coach-1');
  const [selectedBookingByRoom, setSelectedBookingByRoom] = useState<
    Record<string, string>
  >({});

  // スマホ用：トーク画面を開いているかどうか
  const [mobileShowRoom, setMobileShowRoom] = useState(false);

  // 入力欄・定型文・削除確認・規約警告状態
  const [inputText, setInputText] = useState('');
  const [showQuickTemplates, setShowQuickTemplates] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [warningAlert, setWarningAlert] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // URLパラメータ（?room=...&paid=1&role=coach）および sessionStorage からの初期反映
  useEffect(() => {
    try {
      const search = new URLSearchParams(window.location.search);
      const roomParam = search.get('room');
      const roleParam = search.get('role');
      const paidParam = search.get('paid') === '1';

      if (roleParam === 'coach' || roleParam === 'parent') {
        setActiveRole(roleParam);
      }
      if (roomParam) {
        const matchedBooking = INITIAL_BOOKINGS.find((b) => b.id === roomParam);
        if (matchedBooking) {
          const rKey = `${matchedBooking.parent_id}__${matchedBooking.coach_id}`;
          setSelectedRoomKey(rKey);
          setSelectedBookingByRoom((prev) => ({ ...prev, [rKey]: matchedBooking.id }));
          setMobileShowRoom(true);
        }
      }

      const sessionPaidMap: Record<string, boolean> = {};
      INITIAL_BOOKINGS.forEach((b) => {
        if (sessionStorage.getItem(`kcn_paid_${b.id}`) === '1') {
          sessionPaidMap[b.id] = true;
        }
      });
      if (paidParam && roomParam) {
        sessionPaidMap[roomParam] = true;
        setShowPaidBanner(true);
      } else if (paidParam) {
        sessionPaidMap[INITIAL_BOOKINGS[0]?.id || 'bk-demo-001'] = true;
        setShowPaidBanner(true);
      }
      if (Object.keys(sessionPaidMap).length > 0) {
        setPaidBookingIds((prev) => ({ ...prev, ...sessionPaidMap }));
      }
    } catch {
      // ストレージ無効環境は無視
    }
  }, []);

  const quickTemplates = [
    'こちらの日程と場所でお願いしたいです。',
    '待ち合わせ場所に到着しました。',
    '交通状況により5分ほど遅れます。',
    '当日の持ち物の確認をさせていただけますか？',
    '本日はありがとうございました！次回のレッスンについても相談できますか？',
  ];

  // 生徒×コーチの相手ごとにトークルームを集約構築
  const rooms = useMemo(() => {
    const groupMap = new Map<string, Booking[]>();
    INITIAL_BOOKINGS.forEach((booking) => {
      const rKey = `${booking.parent_id}__${booking.coach_id}`;
      const list = groupMap.get(rKey) || [];
      list.push(booking);
      groupMap.set(rKey, list);
    });

    return Array.from(groupMap.entries()).map(([roomKey, rawBookings]) => {
      const bookings = sortRoomBookings(rawBookings);
      const bookingIds = new Set(bookings.map((b) => b.id));
      const roomMessages = messages
        .filter((m) => bookingIds.has(m.booking_id))
        .sort((a, b) => a.created_at.localeCompare(b.created_at));
      const lastMessage = roomMessages[roomMessages.length - 1];
      const unreadCount = roomMessages.filter(
        (m) => !m.is_read && m.sender_role !== activeRole
      ).length;
      const deletedBy = deletedMap[roomKey] || null;
      const primaryBooking = bookings[0];
      const bookingMetas = bookings.map((b) => ({
        booking: b,
        meta: getBookingMeta(b, Boolean(paidBookingIds[b.id])),
      }));
      const unpaidCount = bookingMetas.filter((item) => !item.meta.isPaid).length;
      const hasUpcoming = bookings.some(
        (b) =>
          b.status === 'confirmed' ||
          b.status === 'pending' ||
          b.status === 'completion_reported'
      );

      return {
        roomKey,
        bookings,
        bookingIds,
        bookingMetas,
        primaryBooking,
        roomMessages,
        lastMessage,
        unreadCount,
        deletedBy,
        unpaidCount,
        hasUpcoming,
      };
    });
  }, [messages, deletedMap, activeRole, paidBookingIds]);

  // トークルームに存在する種目一覧を抽出（重複除去）
  const availableSports = useMemo(() => {
    const set = new Set<string>();
    rooms.forEach(({ bookings }) => {
      bookings.forEach((b) => {
        if (b.service?.sport_category) {
          set.add(b.service.sport_category);
        }
      });
    });
    return Array.from(set);
  }, [rooms]);

  // 検索とタブ（状態・種目）による絞り込み
  const filteredRooms = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return rooms.filter(({ primaryBooking, bookings, lastMessage, unreadCount, deletedBy }) => {
      if (roomFilter === 'unread' && unreadCount === 0) return false;
      if (roomFilter === 'deleted' && !deletedBy) return false;
      if (
        sportFilter !== 'all' &&
        !bookings.some((b) => b.service?.sport_category === sportFilter)
      ) {
        return false;
      }
      if (!q) return true;

      const coachName = primaryBooking.coach?.display_name || '';
      const studentName = primaryBooking.student_name || '';
      const serviceTitles = bookings.map((b) => b.service?.title || '').join(' ');
      const sports = bookings.map((b) => b.service?.sport_category || '').join(' ');
      const lastText = lastMessage?.message || '';
      return (
        coachName.toLowerCase().includes(q) ||
        studentName.toLowerCase().includes(q) ||
        serviceTitles.toLowerCase().includes(q) ||
        sports.toLowerCase().includes(q) ||
        lastText.toLowerCase().includes(q)
      );
    });
  }, [rooms, roomFilter, sportFilter, searchQuery]);

  // 現在選択中のルームと、ルーム内で選択中の予約
  const selectedRoom =
    rooms.find((r) => r.roomKey === selectedRoomKey) || rooms[0];
  const activeBookingId =
    (selectedRoom && selectedBookingByRoom[selectedRoom.roomKey]) ||
    selectedRoom?.primaryBooking.id;
  const selectedBookingItem =
    selectedRoom?.bookingMetas.find((item) => item.booking.id === activeBookingId) ||
    selectedRoom?.bookingMetas[0];
  const selectedBooking = selectedBookingItem?.booking;
  const selectedMeta = selectedBookingItem?.meta;
  const selectedMessages = selectedRoom?.roomMessages || [];
  const selectedDeletedBy = selectedRoom?.deletedBy || null;
  const chatStatus = isChatActive(
    selectedBooking?.slot?.end_time || '',
    selectedDeletedBy
  );

  // 総未読数
  const totalUnreadCount = rooms.reduce((acc, r) => acc + r.unreadCount, 0);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [selectedRoomKey, selectedMessages.length]);

  /** トークルームを選択し、相手からの未読メッセージを既読に更新する */
  const handleSelectRoom = (roomKey: string, bookingIds: Set<string>) => {
    setSelectedRoomKey(roomKey);
    setMobileShowRoom(true);
    setShowDeleteConfirm(false);
    setShowQuickTemplates(false);
    setWarningAlert(null);

    setMessages((prev) =>
      prev.map((m) =>
        bookingIds.has(m.booking_id) && m.sender_role !== activeRole && !m.is_read
          ? { ...m, is_read: true }
          : m
      )
    );
  };

  /** 定型文を入力欄にセットする */
  const handleSelectTemplate = (template: string) => {
    setInputText(template);
    setShowQuickTemplates(false);
    setTimeout(() => inputRef.current?.focus(), 0);
  };

  /** メッセージを送信する（中抜き防止フィルター適用） */
  const handleSendMessage = () => {
    if (!selectedBooking || !chatStatus.isActive) return;
    const rawText = inputText;
    if (!rawText.trim()) return;

    const check = validateChatMessage(rawText);
    const senderName =
      activeRole === 'parent'
        ? 'テスト太郎（保護者）'
        : `${selectedBooking.coach?.display_name || '担当'}（コーチ）`;

    const newMsg: ChatMessage = {
      id: `msg-${Date.now()}`,
      booking_id: selectedBooking.id,
      sender_id:
        activeRole === 'parent'
          ? 'parent-0035'
          : selectedBooking.coach_id || 'coach-1',
      sender_name: senderName,
      sender_role: activeRole,
      message: check.hasViolation ? check.maskedMessage : rawText,
      is_read: true,
      created_at: new Date().toLocaleTimeString([], {
        hour: '2-digit',
        minute: '2-digit',
        hour12: false,
      }),
    };

    setWarningAlert(
      check.hasViolation
        ? `【規約警告】${check.reason} （該当: ${check.detectedWord}）`
        : null
    );
    setMessages((prev) => [...prev, newMsg]);
    setInputText('');
  };

  /** 選択中のトークルームを削除する（進行中・確認保留中の予約がある場合はブロック） */
  const handleDeleteChat = () => {
    if (!selectedRoom || selectedRoom.hasUpcoming) return;
    setDeletedMap((prev) => ({ ...prev, [selectedRoom.roomKey]: activeRole }));
    setShowDeleteConfirm(false);
    setShowQuickTemplates(false);
  };

  /** デモ用：削除したトークルームを復元する */
  const handleRestoreChat = () => {
    if (!selectedRoom) return;
    setDeletedMap((prev) => ({ ...prev, [selectedRoom.roomKey]: null }));
  };

  return (
    <div className="min-h-screen bg-[#FDFBF7] text-[#2C2B29] flex flex-col font-sans">
      <KidsCoachNavbar />

      <main className="flex-1 py-3 sm:py-5 flex flex-col">
        <div className="max-w-6xl w-full mx-auto px-3 sm:px-6 flex-1 flex flex-col gap-3">
          {/* 上部タイトル ＆ ロール切替（生徒・保護者 / コーチ） */}
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-2.5">
              <h1 className="font-heading text-base sm:text-lg font-bold text-[#2C2B29]">
                チャット一覧・予約管理
              </h1>
              {totalUnreadCount > 0 && (
                <span className="px-2 py-0.5 rounded-full bg-[#3E8E84] text-white text-[11px] font-bold font-en">
                  未読 {totalUnreadCount}
                </span>
              )}
            </div>

            <div className="flex flex-wrap items-center gap-1.5 bg-white p-1.5 rounded-2xl sm:rounded-full border border-[#EADBCC] text-[11px] sm:text-xs shadow-2xs">
              <span className="text-[10px] text-[#5E5B54] font-bold px-2 whitespace-nowrap">
                表示視点:
              </span>
              <button
                type="button"
                onClick={() => {
                  setActiveRole('parent');
                  setShowDeleteConfirm(false);
                }}
                className={`px-3 py-1 rounded-full font-bold transition-all cursor-pointer whitespace-nowrap ${
                  activeRole === 'parent'
                    ? 'bg-[#E3644F] text-white'
                    : 'text-[#5E5B54] hover:bg-[#FDFBF7]'
                }`}
              >
                生徒・保護者（0035・テスト太郎）
              </button>
              <button
                type="button"
                onClick={() => {
                  setActiveRole('coach');
                  setShowDeleteConfirm(false);
                }}
                className={`px-3 py-1 rounded-full font-bold transition-all cursor-pointer whitespace-nowrap ${
                  activeRole === 'coach'
                    ? 'bg-[#3E8E84] text-white'
                    : 'text-[#5E5B54] hover:bg-[#FDFBF7]'
                }`}
              >
                コーチ側で一覧を見る
              </button>
            </div>
          </div>

          {/* 決済直後の完了通知バナー */}
          {showPaidBanner && (
            <div className="p-3.5 rounded-2xl bg-[#D2E7DF]/50 border border-[#3E8E84]/40 flex items-start justify-between gap-3">
              <div className="flex items-start gap-2.5 text-xs">
                <CheckCircle2 className="w-4 h-4 text-[#3E8E84] shrink-0 mt-0.5" strokeWidth={2} />
                <div className="space-y-0.5">
                  <p className="font-bold text-[#2C2B29]">
                    お支払いが完了し、レッスン日程が確定しました！
                  </p>
                  <p className="text-[11px] text-[#5E5B54]">
                    選択中のトークで当日の待ち合わせ場所や持ち物の確認を引き続き行えます。
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowPaidBanner(false)}
                aria-label="通知を閉じる"
                className="p-1 rounded-full text-[#5E5B54] hover:text-[#2C2B29] cursor-pointer shrink-0"
              >
                <X className="w-4 h-4" strokeWidth={1.75} />
              </button>
            </div>
          )}

          {/* LINE風 2ペインチャットコンテナ */}
          <div className="bg-white rounded-3xl border border-[#EADBCC] shadow-xs flex-1 flex overflow-hidden min-h-[460px] sm:min-h-[560px] h-[calc(100dvh-185px)] sm:h-[calc(100dvh-205px)] max-h-[820px]">
            {/* 左ペイン：相手ごとのトークルーム一覧（スマホではルーム未選択時のみ表示） */}
            <aside
              className={`w-full md:w-[350px] lg:w-[385px] shrink-0 border-r border-[#EADBCC] flex flex-col bg-white ${
                mobileShowRoom ? 'hidden md:flex' : 'flex'
              }`}
            >
              {/* 検索バー＆絞り込みタブ */}
              <div className="p-3 border-b border-[#EADBCC] space-y-2.5 bg-[#FDFBF7]/70">
                <div className="relative">
                  <Search
                    className="w-4 h-4 text-[#8A857B] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none"
                    strokeWidth={1.75}
                  />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder={
                      activeRole === 'parent'
                        ? 'コーチ名・種目・メッセージで検索'
                        : '生徒名・種目・メッセージで検索'
                    }
                    className="w-full h-9 pl-9 pr-3 rounded-full border border-[#EADBCC] bg-white text-xs font-bold text-[#2C2B29] placeholder:text-[#8A857B] focus:outline-none focus:border-[#3E8E84]"
                  />
                </div>

                <div className="flex items-center gap-1.5 text-[11px] font-bold">
                  {[
                    { key: 'all' as const, label: `すべて (${rooms.length})` },
                    { key: 'unread' as const, label: `未読 (${totalUnreadCount})` },
                    {
                      key: 'deleted' as const,
                      label: `削除済み (${rooms.filter((r) => r.deletedBy).length})`,
                    },
                  ].map((tab) => (
                    <button
                      key={tab.key}
                      type="button"
                      onClick={() => setRoomFilter(tab.key)}
                      className={`px-3 py-1 rounded-full transition-colors cursor-pointer whitespace-nowrap ${
                        roomFilter === tab.key
                          ? 'bg-[#2C2B29] text-white'
                          : 'bg-white text-[#5E5B54] border border-[#EADBCC] hover:border-[#3E8E84]'
                      }`}
                    >
                      {tab.label}
                    </button>
                  ))}
                </div>

                {/* 種目フィルタ（横スクロール1行で縦幅を取らない設計） */}
                {availableSports.length > 0 && (
                  <div className="flex items-center gap-1.5 overflow-x-auto pb-0.5 text-[10px] font-bold">
                    <span className="text-[#8A857B] whitespace-nowrap shrink-0">
                      種目:
                    </span>
                    <button
                      type="button"
                      onClick={() => setSportFilter('all')}
                      className={`px-2.5 py-1 rounded-full transition-colors cursor-pointer whitespace-nowrap shrink-0 ${
                        sportFilter === 'all'
                          ? 'bg-[#3E8E84] text-white'
                          : 'bg-white text-[#5E5B54] border border-[#EADBCC] hover:border-[#3E8E84]'
                      }`}
                    >
                      全種目
                    </button>
                    {availableSports.map((sport) => (
                      <button
                        key={sport}
                        type="button"
                        onClick={() => setSportFilter(sport)}
                        className={`px-2.5 py-1 rounded-full transition-colors cursor-pointer whitespace-nowrap shrink-0 ${
                          sportFilter === sport
                            ? 'bg-[#3E8E84] text-white'
                            : 'bg-white text-[#5E5B54] border border-[#EADBCC] hover:border-[#3E8E84]'
                        }`}
                      >
                        {sport}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* トークルームリスト */}
              <div className="flex-1 overflow-y-auto divide-y divide-[#EADBCC]/60">
                {filteredRooms.length === 0 ? (
                  <div className="p-8 text-center text-xs text-[#8A857B] font-bold">
                    該当するトークはありません
                  </div>
                ) : (
                  filteredRooms.map(
                    ({
                      roomKey,
                      bookings,
                      bookingIds,
                      bookingMetas,
                      primaryBooking,
                      lastMessage,
                      unreadCount,
                      deletedBy,
                      unpaidCount,
                    }) => {
                      const isSelected = roomKey === selectedRoom?.roomKey;
                      const primaryMeta = bookingMetas[0]?.meta;
                      const partnerName =
                        activeRole === 'parent'
                          ? `${primaryBooking.coach?.display_name || '担当'} コーチ`
                          : `${primaryBooking.student_name} 様（0035）`;
                      const avatarInitial =
                        activeRole === 'parent'
                          ? primaryBooking.coach?.display_name?.charAt(0) || 'コ'
                          : primaryBooking.student_name?.charAt(0) || 'テ';

                      return (
                        <button
                          key={roomKey}
                          type="button"
                          onClick={() => handleSelectRoom(roomKey, bookingIds)}
                          className={`w-full text-left p-3 sm:p-3.5 flex items-start gap-2.5 sm:gap-3 transition-colors cursor-pointer ${
                            isSelected
                              ? 'bg-[#FCE7A2]/35'
                              : 'hover:bg-[#FDFBF7]'
                          }`}
                        >
                          {/* アイコン（正方形・角丸） */}
                          {activeRole === 'parent' && primaryBooking.coach?.avatar_url ? (
                            <img
                              src={primaryBooking.coach.avatar_url}
                              alt={partnerName}
                              className="w-12 h-12 rounded-2xl object-cover border border-[#EADBCC] shrink-0"
                            />
                          ) : (
                            <div className="w-12 h-12 rounded-2xl bg-[#FCE7A2] border border-[#2C2B29]/15 flex items-center justify-center font-heading font-bold text-base text-[#2C2B29] shrink-0">
                              {avatarInitial}
                            </div>
                          )}

                          {/* トーク情報 */}
                          <div className="flex-1 min-w-0 space-y-1">
                            <div className="flex items-center justify-between gap-2">
                              <div className="flex items-center gap-1.5 min-w-0">
                                <span className="font-bold text-xs sm:text-sm text-[#2C2B29] truncate">
                                  {partnerName}
                                </span>
                                {primaryBooking.service?.sport_category && (
                                  <span className="text-[9px] font-bold text-[#3E8E84] bg-[#D2E7DF]/60 px-1.5 py-0.5 rounded-md whitespace-nowrap shrink-0">
                                    {primaryBooking.service.sport_category}
                                  </span>
                                )}
                                {bookings.length > 1 && (
                                  <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-full bg-[#2C2B29] text-white text-[9px] font-bold whitespace-nowrap shrink-0">
                                    <Layers className="w-2.5 h-2.5" strokeWidth={2} />
                                    予約 {bookings.length}件
                                  </span>
                                )}
                              </div>
                              <span className="text-[10px] text-[#8A857B] font-en whitespace-nowrap shrink-0">
                                {lastMessage
                                  ? formatShortTime(lastMessage.created_at)
                                  : ''}
                              </span>
                            </div>

                            {/* 代表予約の日程 ＆ 決済ステータス */}
                            <div className="flex flex-wrap items-center gap-1">
                              <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md bg-[#FDFBF7] border border-[#EADBCC] text-[10px] font-bold text-[#2C2B29] font-en whitespace-nowrap">
                                <Calendar className="w-2.5 h-2.5 text-[#E3644F] shrink-0" strokeWidth={2} />
                                {formatSlotLabel(
                                  primaryBooking.slot?.start_time,
                                  primaryBooking.slot?.end_time
                                )}
                              </span>
                              {primaryMeta && (
                                <span
                                  className={`text-[10px] font-bold px-1.5 py-0.5 rounded-md whitespace-nowrap ${primaryMeta.scheduleStatus.className}`}
                                >
                                  {primaryMeta.scheduleStatus.label}
                                </span>
                              )}
                              {unpaidCount > 0 ? (
                                <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-md bg-[#FCE7A2] text-[#8A5A00] whitespace-nowrap">
                                  {bookings.length > 1
                                    ? `未決済 ${unpaidCount}件`
                                    : '未決済'}
                                </span>
                              ) : (
                                <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-md bg-[#3E8E84] text-white whitespace-nowrap">
                                  支払い完了
                                </span>
                              )}
                              {deletedBy && (
                                <span className="text-[10px] font-bold text-[#E3644F] whitespace-nowrap">
                                  ・削除済
                                </span>
                              )}
                            </div>

                            <div className="flex items-center justify-between gap-2">
                              <p
                                className={`text-xs truncate ${
                                  unreadCount > 0
                                    ? 'font-bold text-[#2C2B29]'
                                    : 'text-[#5E5B54]'
                                }`}
                              >
                                {lastMessage?.message || 'メッセージはまだありません'}
                              </p>
                              {unreadCount > 0 && (
                                <span className="min-w-5 h-5 px-1.5 rounded-full bg-[#3E8E84] text-white text-[10px] font-bold font-en flex items-center justify-center shrink-0">
                                  {unreadCount}
                                </span>
                              )}
                            </div>
                          </div>
                        </button>
                      );
                    }
                  )
                )}
              </div>
            </aside>

            {/* 右ペイン：選択中のトーク画面（スマホではルーム選択時のみ表示） */}
            <section
              className={`flex-1 flex flex-col min-w-0 bg-[#FDFBF7] ${
                mobileShowRoom ? 'flex' : 'hidden md:flex'
              }`}
            >
              {selectedRoom && selectedBooking && selectedMeta ? (
                <>
                  {/* トークルームヘッダー（スマホでも縦幅を取りすぎないコンパクト設計） */}
                  <div className="p-2.5 sm:p-4 bg-white border-b border-[#EADBCC] space-y-2">
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-1.5 sm:gap-2 min-w-0">
                        <button
                          type="button"
                          onClick={() => setMobileShowRoom(false)}
                          className="md:hidden p-1.5 -ml-1 rounded-full text-[#5E5B54] hover:bg-[#FDFBF7] cursor-pointer shrink-0"
                          aria-label="トーク一覧に戻る"
                        >
                          <ChevronLeft className="w-5 h-5" strokeWidth={2} />
                        </button>
                        <div className="min-w-0">
                          <div className="flex items-center gap-1.5 min-w-0">
                            <h2 className="font-heading text-sm sm:text-base font-bold text-[#2C2B29] truncate">
                              {activeRole === 'parent'
                                ? `${selectedBooking.coach?.display_name || '担当'} コーチ`
                                : `${selectedBooking.student_name} 様（0035）`}
                            </h2>
                            <span className="text-[10px] font-bold text-[#3E8E84] bg-[#D2E7DF]/60 px-2 py-0.5 rounded-full whitespace-nowrap shrink-0">
                              {selectedBooking.service?.sport_category}
                            </span>
                            {selectedRoom.bookings.length > 1 && (
                              <span className="hidden sm:inline-block text-[10px] font-bold text-[#2C2B29] bg-[#FCE7A2]/80 px-2 py-0.5 rounded-full whitespace-nowrap shrink-0">
                                全{selectedRoom.bookings.length}件の予約を統合管理中
                              </span>
                            )}
                          </div>
                          <p className="hidden sm:block text-[11px] text-[#5E5B54] font-bold truncate mt-0.5">
                            {selectedBooking.service?.title}
                          </p>
                        </div>
                      </div>

                      {chatStatus.isActive && (
                        selectedRoom.hasUpcoming ? (
                          <span
                            title="予定中・確認保留中の予約があるため削除できません（連絡遮断・不正防止）"
                            className="h-7 sm:h-8 px-2.5 rounded-full border border-[#EADBCC] bg-[#F3EFE8] text-[10px] sm:text-[11px] font-bold text-[#8A857B] inline-flex items-center gap-1 whitespace-nowrap shrink-0 cursor-not-allowed"
                          >
                            <Lock className="w-3 h-3 shrink-0" strokeWidth={1.75} />
                            <span>進行中ロック</span>
                          </span>
                        ) : (
                          <button
                            type="button"
                            onClick={() => setShowDeleteConfirm((prev) => !prev)}
                            className="h-7 sm:h-8 px-2.5 rounded-full border border-[#EADBCC] bg-[#FDFBF7] hover:bg-[#E3644F]/10 hover:border-[#E3644F]/40 text-[10px] sm:text-[11px] font-bold text-[#5E5B54] hover:text-[#E3644F] inline-flex items-center gap-1 transition-colors cursor-pointer whitespace-nowrap shrink-0"
                          >
                            <Trash2 className="w-3 h-3" strokeWidth={1.75} />
                            <span>削除</span>
                          </button>
                        )
                      )}
                    </div>

                    {/* 複数予約がある場合の切り替えバー（横スクロール1行で縦幅を固定） */}
                    {selectedRoom.bookings.length > 1 && (
                      <div className="space-y-1">
                        <div className="flex items-center justify-between text-[10px] font-bold text-[#5E5B54]">
                          <span className="inline-flex items-center gap-1 whitespace-nowrap">
                            <Layers className="w-3 h-3 text-[#3E8E84]" strokeWidth={2} />
                            <span>予約一覧 ({selectedRoom.bookings.length}件)</span>
                          </span>
                          {selectedRoom.unpaidCount > 0 && (
                            <span className="text-[#8A5A00] whitespace-nowrap">
                              未決済 {selectedRoom.unpaidCount}件
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-1.5 overflow-x-auto pb-0.5 no-scrollbar">
                          {selectedRoom.bookingMetas.map(({ booking, meta }) => {
                            const isActiveTab = booking.id === selectedBooking.id;
                            return (
                              <button
                                key={booking.id}
                                type="button"
                                onClick={() =>
                                  setSelectedBookingByRoom((prev) => ({
                                    ...prev,
                                    [selectedRoom.roomKey]: booking.id,
                                  }))
                                }
                                className={`px-2.5 py-1 rounded-xl border text-[11px] font-bold inline-flex items-center gap-1.5 transition-colors cursor-pointer whitespace-nowrap shrink-0 ${
                                  isActiveTab
                                    ? 'bg-[#2C2B29] text-white border-[#2C2B29]'
                                    : 'bg-[#FDFBF7] text-[#2C2B29] border-[#EADBCC] hover:border-[#3E8E84]'
                                }`}
                              >
                                <span className="font-en">
                                  {formatSlotLabel(
                                    booking.slot?.start_time,
                                    booking.slot?.end_time
                                  )}
                                </span>
                                <span
                                  className={`text-[9px] px-1.5 py-0.5 rounded-full ${
                                    meta.isPaid
                                      ? 'bg-[#3E8E84] text-white'
                                      : 'bg-[#FCE7A2] text-[#8A5A00]'
                                  }`}
                                >
                                  {meta.isPaid ? '決済済' : '未決済'}
                                </span>
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    )}

                    {/* 選択中予約の日程 ＆ 決済ステータス（スマホは1カードに凝縮、PCは2列） */}
                    <div className="p-2 sm:p-0 rounded-2xl sm:rounded-none bg-[#FDFBF7] sm:bg-transparent border border-[#EADBCC] sm:border-0 flex flex-col gap-1.5 sm:grid sm:grid-cols-2 sm:gap-2">
                      {/* 予約日程 */}
                      <div className="sm:p-2.5 sm:rounded-2xl sm:bg-[#FDFBF7] sm:border sm:border-[#EADBCC] flex items-center justify-between gap-2">
                        <div className="flex sm:block items-center gap-1.5 min-w-0">
                          <span className="hidden sm:block text-[10px] font-bold text-[#8A857B]">
                            予約日程
                          </span>
                          <span className="text-[11px] sm:text-xs font-bold text-[#2C2B29] font-en inline-flex items-center gap-1 sm:mt-0.5 whitespace-nowrap">
                            <Calendar className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-[#E3644F] shrink-0" strokeWidth={1.75} />
                            {formatSlotLabel(
                              selectedBooking.slot?.start_time,
                              selectedBooking.slot?.end_time
                            )}
                          </span>
                        </div>
                        <span
                          className={`text-[10px] font-bold px-2 sm:px-2.5 py-0.5 sm:py-1 rounded-full whitespace-nowrap shrink-0 ${selectedMeta.scheduleStatus.className}`}
                        >
                          {selectedMeta.scheduleStatus.label}
                        </span>
                      </div>

                      {/* 決済ステータス */}
                      <div className="pt-1.5 border-t border-[#EADBCC]/60 sm:border-t-0 sm:pt-0 sm:p-2.5 sm:rounded-2xl sm:bg-[#FDFBF7] sm:border sm:border-[#EADBCC] flex items-center justify-between gap-2">
                        <div className="min-w-0">
                          <span className="hidden sm:block text-[10px] font-bold text-[#8A857B]">
                            決済ステータス
                          </span>
                          <div className="flex items-center gap-1.5 sm:mt-0.5">
                            <span className="text-[11px] sm:text-xs font-extrabold text-[#2C2B29] font-en whitespace-nowrap">
                              ￥{selectedBooking.total_amount.toLocaleString()}
                            </span>
                            <span className="text-[10px] font-bold text-[#5E5B54] truncate">
                              {selectedMeta.isPaid
                                ? activeRole === 'parent'
                                  ? '当日現金不要'
                                  : '事前決済済'
                                : activeRole === 'parent'
                                  ? 'お支払い前'
                                  : '入金待ち'}
                            </span>
                          </div>
                        </div>

                        {selectedMeta.isPaid ? (
                          <span className="inline-flex items-center gap-1 px-2 sm:px-2.5 py-0.5 sm:py-1 rounded-full bg-[#3E8E84] text-white text-[10px] font-bold whitespace-nowrap shrink-0">
                            <CheckCircle2 className="w-3 h-3 shrink-0" strokeWidth={2} />
                            <span>支払い完了</span>
                          </span>
                        ) : activeRole === 'parent' ? (
                          <Link
                            href={`/checkout/${selectedBooking.slot_id || 'slot-101'}`}
                            className="inline-flex items-center gap-1 px-2.5 py-0.5 sm:py-1 rounded-full bg-[#E3644F] hover:bg-[#d05540] text-white text-[10px] font-bold whitespace-nowrap shrink-0 transition-colors"
                          >
                            <CreditCard className="w-3 h-3 shrink-0" strokeWidth={2} />
                            <span>事前決済へ</span>
                            <ChevronRight className="w-3 h-3 shrink-0" strokeWidth={2} />
                          </Link>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2 sm:px-2.5 py-0.5 sm:py-1 rounded-full bg-[#FCE7A2] text-[#8A5A00] text-[10px] font-bold whitespace-nowrap shrink-0">
                            <Clock className="w-3 h-3 shrink-0" strokeWidth={2} />
                            <span>未決済</span>
                          </span>
                        )}
                      </div>
                    </div>

                    {/* 削除確認パネル */}
                    {showDeleteConfirm && chatStatus.isActive && (
                      <div className="p-3 rounded-2xl bg-[#E3644F]/8 border border-[#E3644F]/30 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
                        <div className="text-[11px] text-[#2C2B29] space-y-0.5">
                          <p className="font-bold">
                            どちらかがチャットを削除すると、以降双方ともメッセージ送信できなくなります。削除しますか？
                          </p>
                          {(selectedRoom.hasUpcoming || selectedRoom.unpaidCount > 0) && (
                            <p className="text-[#E3644F] font-bold">
                              ※このトークには実施予定または未決済の予約が含まれています。
                            </p>
                          )}
                        </div>
                        <div className="flex items-center gap-2 shrink-0">
                          <button
                            type="button"
                            onClick={() => setShowDeleteConfirm(false)}
                            className="px-3 py-1 rounded-full bg-white border border-[#EADBCC] text-[11px] font-bold text-[#5E5B54] cursor-pointer"
                          >
                            キャンセル
                          </button>
                          <button
                            type="button"
                            onClick={handleDeleteChat}
                            className="px-3 py-1 rounded-full bg-[#E3644F] text-white text-[11px] font-bold cursor-pointer"
                          >
                            削除する
                          </button>
                        </div>
                      </div>
                    )}

                    {/* 中抜き防止アラート */}
                    {warningAlert && (
                      <div className="p-3 rounded-2xl bg-[#E3644F]/10 border border-[#E3644F]/30 text-[11px] text-[#2C2B29] flex items-start gap-2">
                        <ShieldAlert className="w-4 h-4 text-[#E3644F] shrink-0 mt-0.5" strokeWidth={1.75} />
                        <span>{warningAlert}</span>
                      </div>
                    )}
                  </div>

                  {/* メッセージログ */}
                  <div className="flex-1 p-4 sm:p-5 overflow-y-auto space-y-4">
                    <div className="text-center">
                      <span className="inline-block text-[10px] sm:text-[11px] font-bold text-[#5E5B54] bg-white px-3 py-1 rounded-full border border-[#EADBCC]">
                        予約後も削除するまでいつでもやり取りできます
                      </span>
                    </div>

                    {selectedMeta.isPaid ? (
                      <div className="mx-auto max-w-md p-2.5 sm:p-3 rounded-2xl bg-white border border-[#3E8E84]/35 text-center space-y-0.5 shadow-2xs">
                        <div className="inline-flex items-center gap-1 text-[11px] font-bold text-[#3E8E84]">
                          <CheckCircle2 className="w-3.5 h-3.5 shrink-0" strokeWidth={2} />
                          <span>選択中の予約：日程確定・支払い完了</span>
                        </div>
                        <div className="text-[11px] text-[#5E5B54] font-bold">
                          予約日時：<span className="font-en text-[#2C2B29]">{formatSlotLabel(selectedBooking.slot?.start_time, selectedBooking.slot?.end_time)}</span> ／ <span className="font-en text-[#E3644F]">￥{selectedBooking.total_amount.toLocaleString()}</span>
                        </div>
                      </div>
                    ) : (
                      <div className="mx-auto max-w-md p-2.5 sm:p-3 rounded-2xl bg-[#FCE7A2]/35 border border-[#EADBCC] text-center space-y-0.5">
                        <div className="inline-flex items-center gap-1 text-[11px] font-bold text-[#8A5A00]">
                          <Clock className="w-3.5 h-3.5 shrink-0" strokeWidth={2} />
                          <span>選択中の予約：日程調整中・お支払い前</span>
                        </div>
                        <div className="text-[11px] text-[#5E5B54] font-bold">
                          希望日時：<span className="font-en text-[#2C2B29]">{formatSlotLabel(selectedBooking.slot?.start_time, selectedBooking.slot?.end_time)}</span> ／ <span className="font-en text-[#2C2B29]">￥{selectedBooking.total_amount.toLocaleString()}</span>
                        </div>
                      </div>
                    )}

                    {selectedMessages.map((msg) => {
                      const isMe = msg.sender_role === activeRole;
                      const formattedTime = formatShortTime(msg.created_at);

                      return (
                        <div
                          key={msg.id}
                          className={`flex flex-col ${
                            isMe ? 'items-end' : 'items-start'
                          }`}
                        >
                          <span className="text-[10px] font-bold text-[#5E5B54] mb-1 px-1">
                            {msg.sender_name}
                          </span>
                          <div className="flex items-end gap-2 max-w-[85%] sm:max-w-[78%]">
                            {isMe && (
                              <div className="flex flex-col items-end shrink-0 text-[10px] text-[#8A857B] font-en leading-tight">
                                {msg.is_read && (
                                  <span className="text-[9px] font-sans font-bold text-[#3E8E84] inline-flex items-center gap-0.5">
                                    <CheckCheck className="w-3 h-3" strokeWidth={2} />
                                    既読
                                  </span>
                                )}
                                <span className="whitespace-nowrap">{formattedTime}</span>
                              </div>
                            )}
                            <div
                              className={`p-3 rounded-2xl text-xs sm:text-sm leading-relaxed whitespace-pre-wrap break-words ${
                                isMe
                                  ? 'bg-[#3E8E84] text-white rounded-br-xs'
                                  : 'bg-white text-[#2C2B29] rounded-bl-xs border border-[#EADBCC]'
                              }`}
                            >
                              {msg.message}
                            </div>
                            {!isMe && (
                              <span className="text-[10px] text-[#8A857B] font-en whitespace-nowrap shrink-0">
                                {formattedTime}
                              </span>
                            )}
                          </div>
                        </div>
                      );
                    })}
                    <div ref={messagesEndRef} />
                  </div>

                  {/* 定型文選択パネル */}
                  {chatStatus.isActive && showQuickTemplates && (
                    <div className="p-3 bg-[#FDFBF7] border-t border-[#EADBCC] space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-[11px] font-bold text-[#2C2B29] flex items-center gap-1.5">
                          <MessageSquareText className="w-3.5 h-3.5 text-[#3E8E84]" strokeWidth={1.75} />
                          <span>定型文を選択（タップで入力欄に入ります）</span>
                        </span>
                        <button
                          type="button"
                          onClick={() => setShowQuickTemplates(false)}
                          aria-label="定型文パネルを閉じる"
                          className="p-1 rounded-full text-[#8A857B] hover:text-[#2C2B29] cursor-pointer"
                        >
                          <X className="w-4 h-4" strokeWidth={1.75} />
                        </button>
                      </div>
                      <div className="flex flex-wrap gap-1.5">
                        {quickTemplates.map((tpl, idx) => (
                          <button
                            key={idx}
                            type="button"
                            onClick={() => handleSelectTemplate(tpl)}
                            className="px-3 py-1.5 rounded-xl bg-white hover:bg-[#FCE7A2]/55 text-[#2C2B29] border border-[#EADBCC] hover:border-[#E3644F] text-xs font-bold text-left transition-colors cursor-pointer"
                          >
                            {tpl}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* メッセージ入力エリア */}
                  <div className="p-3 bg-white border-t border-[#EADBCC]">
                    {chatStatus.isActive ? (
                      <form
                        onSubmit={(e) => {
                          e.preventDefault();
                          handleSendMessage();
                        }}
                        className="flex items-center gap-2"
                      >
                        <button
                          type="button"
                          onClick={() => setShowQuickTemplates((prev) => !prev)}
                          aria-expanded={showQuickTemplates}
                          className={`h-10 px-3 rounded-full border text-xs font-bold inline-flex items-center gap-1.5 shrink-0 transition-colors cursor-pointer whitespace-nowrap ${
                            showQuickTemplates
                              ? 'bg-[#2C2B29] text-white border-[#2C2B29]'
                              : 'bg-[#FDFBF7] text-[#2C2B29] border-[#EADBCC] hover:border-[#3E8E84] hover:text-[#3E8E84]'
                          }`}
                        >
                          <MessageSquareText className="w-4 h-4 shrink-0" strokeWidth={1.75} />
                          <span>定型文</span>
                        </button>
                        <input
                          ref={inputRef}
                          type="text"
                          placeholder="メッセージを入力（連絡先交換は不要です）"
                          value={inputText}
                          onChange={(e) => setInputText(e.target.value)}
                          className="flex-1 min-w-0 h-10 px-4 rounded-full border border-[#EADBCC] bg-[#FDFBF7] text-xs sm:text-sm font-bold text-[#2C2B29] focus:outline-none focus:border-[#E3644F] focus:bg-white"
                        />
                        <button
                          type="submit"
                          aria-label="メッセージを送信"
                          className="w-10 h-10 rounded-full bg-[#E3644F] hover:bg-[#d05540] text-white flex items-center justify-center shrink-0 transition-colors cursor-pointer"
                        >
                          <Send className="w-4 h-4" strokeWidth={1.75} />
                        </button>
                      </form>
                    ) : (
                      <div className="p-3 bg-[#FDFBF7] rounded-2xl text-xs font-bold text-[#5E5B54] flex flex-col sm:flex-row items-center justify-between gap-2 border border-[#EADBCC]">
                        <div className="flex items-center gap-2 text-center sm:text-left">
                          <Lock className="w-4 h-4 text-[#E3644F] shrink-0" strokeWidth={1.75} />
                          <span>
                            {chatStatus.deletedBy === 'coach'
                              ? 'コーチがチャットを削除したため、新規メッセージは送信できません。'
                              : '生徒・保護者（テスト太郎）がチャットを削除したため、新規メッセージは送信できません。'}
                          </span>
                        </div>
                        {showDemoTools && (
                          <button
                            type="button"
                            onClick={handleRestoreChat}
                            className="px-3 py-1 rounded-full bg-white border border-[#EADBCC] text-[11px] font-bold text-[#3E8E84] inline-flex items-center gap-1 shrink-0 cursor-pointer"
                          >
                            <RotateCcw className="w-3 h-3" strokeWidth={1.75} />
                            <span>デモ用：チャットを復元</span>
                          </button>
                        )}
                      </div>
                    )}

                    <div className="flex flex-wrap items-center justify-between gap-2 text-[10px] text-[#5E5B54] font-bold mt-2 px-1">
                      <span className="inline-flex items-center gap-1 whitespace-nowrap">
                        <Shield className="w-3.5 h-3.5 text-[#3E8E84] shrink-0" strokeWidth={1.75} />
                        <span>個人情報保護フィルター稼働中（連絡先非公開）</span>
                      </span>
                      <span className="whitespace-nowrap">
                        コーチまたは生徒がチャットを削除するまで利用可能
                      </span>
                    </div>
                  </div>
                </>
              ) : null}
            </section>
          </div>
        </div>
      </main>

      {/* チャット操作を邪魔しない最小限フッター */}
      <footer className="border-t border-[#EADBCC]/70 bg-[#FDFBF7] py-3 px-4 text-[11px] text-[#8A857B]">
        <div className="max-w-6xl mx-auto flex flex-wrap items-center justify-between gap-2">
          <span>キッズコーチナビ by SWIM PARTNERS</span>
          <span className="font-en">© 2026 SWIM PARTNERS</span>
        </div>
      </footer>
    </div>
  );
}
