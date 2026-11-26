'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import {
  Users,
  CalendarCheck2,
  ShieldCheck,
  Sparkles,
  Search,
  CheckCircle2,
  XCircle,
  Loader2,
  RefreshCw,
  ExternalLink,
  Wallet,
  ZoomIn,
  X,
} from 'lucide-react';

type TabKey = 'parents' | 'bookings' | 'coaches' | 'demands';

interface KcnSummary {
  totalSales: number;
  totalPlatformFee: number;
  totalBookings: number;
  activeBookingsCount: number;
  parentCount: number;
  coachCount: number;
  pendingReviewCount: number;
  demandCount: number;
}

interface KcnParent {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  membership_number: string | null;
  stripe_customer_id: string | null;
  created_at: string;
  booking_count: number;
  paid_total: number;
}

interface KcnCoach {
  id: string;
  display_name: string;
  title: string;
  bio: string;
  avatar_url: string;
  compliance_selfie_path: string;
  selfie_captured_at: string;
  sport_categories: string[];
  target_areas: string[];
  review_status: 'pending_review' | 'approved' | 'rejected';
  stripe_account_id: string | null;
  stripe_payouts_enabled: boolean;
  created_at: string;
}

interface KcnBooking {
  id: string;
  service_title: string;
  parent_name: string;
  parent_email: string;
  membership_number: string;
  coach_name: string;
  student_name: string;
  student_age: string;
  status: string;
  total_amount: number;
  platform_fee: number;
  coach_payout: number;
  created_at: string;
}

interface KcnDemand {
  id: string;
  sport_name: string;
  area_name: string;
  note: string | null;
  contact_email: string | null;
  created_at: string;
}

const STATUS_BADGE: Record<string, { label: string; className: string }> = {
  pending: { label: '決済待ち', className: 'bg-amber-50 text-amber-700 border-amber-200' },
  confirmed: { label: '予約確定', className: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
  completion_reported: { label: '完了報告済', className: 'bg-sky-50 text-sky-700 border-sky-200' },
  completed: { label: '完了', className: 'bg-slate-100 text-slate-700 border-slate-200' },
  cancelled: { label: 'キャンセル', className: 'bg-rose-50 text-rose-700 border-rose-200' },
};

const REVIEW_BADGE: Record<string, { label: string; className: string }> = {
  pending_review: { label: '目視審査待ち', className: 'bg-amber-50 text-amber-700 border-amber-200' },
  approved: { label: '承認済（公開中）', className: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
  rejected: { label: '却下', className: 'bg-rose-50 text-rose-700 border-rose-200' },
};

export default function KcnAdminDashboardClient() {
  const [activeTab, setActiveTab] = useState<TabKey>('parents');
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [updatingCoachId, setUpdatingCoachId] = useState<string | null>(null);
  const [previewCoach, setPreviewCoach] = useState<KcnCoach | null>(null);

  useEffect(() => {
    if (!previewCoach) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setPreviewCoach(null);
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [previewCoach]);

  const [summary, setSummary] = useState<KcnSummary>({
    totalSales: 0,
    totalPlatformFee: 0,
    totalBookings: 0,
    activeBookingsCount: 0,
    parentCount: 0,
    coachCount: 0,
    pendingReviewCount: 0,
    demandCount: 0,
  });
  const [parents, setParents] = useState<KcnParent[]>([]);
  const [coaches, setCoaches] = useState<KcnCoach[]>([]);
  const [bookings, setBookings] = useState<KcnBooking[]>([]);
  const [demands, setDemands] = useState<KcnDemand[]>([]);

  const loadData = async () => {
    setLoading(true);
    setErrorMsg(null);
    try {
      const res = await fetch('/api/admin/kcn', { cache: 'no-store' });
      const data = await res.json();
      if (!res.ok) {
        setErrorMsg(data?.error || 'データの取得に失敗しました。');
        setLoading(false);
        return;
      }
      setSummary(data.summary);
      setParents(data.parents || []);
      setCoaches(data.coaches || []);
      setBookings(data.bookings || []);
      setDemands(data.demands || []);
    } catch {
      setErrorMsg('通信エラーが発生しました。');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleReviewAction = async (coachId: string, action: 'approve' | 'reject') => {
    setUpdatingCoachId(coachId);
    try {
      const res = await fetch('/api/admin/kcn', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ coachId, action }),
      });
      if (res.ok) {
        await loadData();
      }
    } finally {
      setUpdatingCoachId(null);
    }
  };

  const q = searchQuery.trim().toLowerCase();
  const filteredParents = useMemo(() => {
    if (!q) return parents;
    return parents.filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        p.email.toLowerCase().includes(q) ||
        (p.membership_number || '').toLowerCase().includes(q) ||
        (p.phone || '').includes(q)
    );
  }, [parents, q]);

  const filteredBookings = useMemo(() => {
    if (!q) return bookings;
    return bookings.filter(
      (b) =>
        b.parent_name.toLowerCase().includes(q) ||
        b.coach_name.toLowerCase().includes(q) ||
        b.service_title.toLowerCase().includes(q) ||
        b.student_name.toLowerCase().includes(q)
    );
  }, [bookings, q]);

  const sortedCoaches = useMemo(() => {
    return [...coaches].sort((a, b) => {
      if (a.review_status === 'pending_review' && b.review_status !== 'pending_review') return -1;
      if (a.review_status !== 'pending_review' && b.review_status === 'pending_review') return 1;
      return 0;
    });
  }, [coaches]);

  return (
    <div className="space-y-6 pb-12 px-4 md:px-0">
      {/* ヘッダー */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-bold text-[#3E8E84] tracking-wider uppercase">
            KIDS COACH NAVI ADMIN
          </span>
          <h1 className="text-2xl md:text-3xl font-black text-slate-900 tracking-tight mt-0.5">
            キッズコーチナビ 顧客・運営管理
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            保護者（顧客）データ・予約決済・コーチ目視審査・需要リクエストを一元管理します。
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Link
            href="/"
            target="_blank"
            className="h-9 px-3.5 rounded-full bg-white border border-slate-200 hover:border-slate-400 text-xs font-bold text-slate-700 inline-flex items-center gap-1.5"
          >
            <ExternalLink className="w-3.5 h-3.5" />
            <span>公開サイトを見る</span>
          </Link>
          <button
            type="button"
            onClick={loadData}
            disabled={loading}
            className="h-9 px-4 rounded-full bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold inline-flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            <span>最新化</span>
          </button>
        </div>
      </div>

      {errorMsg && (
        <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-bold">
          {errorMsg}
        </div>
      )}

      {/* KPI カード */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-1">
          <div className="flex items-center justify-between text-xs font-bold text-slate-500">
            <span>登録保護者（顧客）数</span>
            <Users className="w-4 h-4 text-[#3E8E84]" />
          </div>
          <p className="text-2xl font-black text-slate-900">{summary.parentCount} 名</p>
          <p className="text-[11px] text-slate-400">全予約件数：{summary.totalBookings} 件</p>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-1">
          <div className="flex items-center justify-between text-xs font-bold text-slate-500">
            <span>総決済額（確定・完了）</span>
            <Wallet className="w-4 h-4 text-[#E3644F]" />
          </div>
          <p className="text-2xl font-black text-slate-900">
            ¥{summary.totalSales.toLocaleString()}
          </p>
          <p className="text-[11px] text-slate-500 font-bold">
            運営手数料（25%）：¥{summary.totalPlatformFee.toLocaleString()}
          </p>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-1">
          <div className="flex items-center justify-between text-xs font-bold text-slate-500">
            <span>コーチ審査待ち</span>
            <ShieldCheck className="w-4 h-4 text-amber-500" />
          </div>
          <p className="text-2xl font-black text-slate-900">
            {summary.pendingReviewCount} 名
          </p>
          <p className="text-[11px] text-slate-400">全登録コーチ：{summary.coachCount} 名</p>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-1">
          <div className="flex items-center justify-between text-xs font-bold text-slate-500">
            <span>需要リクエスト</span>
            <Sparkles className="w-4 h-4 text-sky-500" />
          </div>
          <p className="text-2xl font-black text-slate-900">{summary.demandCount} 件</p>
          <p className="text-[11px] text-slate-400">種目・エリア希望データ</p>
        </div>
      </div>

      {/* タブ＆検索バー */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div className="flex flex-wrap gap-2">
          {[
            { key: 'parents' as TabKey, label: `顧客（保護者）(${parents.length})`, icon: Users },
            { key: 'bookings' as TabKey, label: `予約・決済 (${bookings.length})`, icon: CalendarCheck2 },
            {
              key: 'coaches' as TabKey,
              label: `コーチ審査 (${summary.pendingReviewCount}件待ち)`,
              icon: ShieldCheck,
            },
            { key: 'demands' as TabKey, label: `需要リクエスト (${demands.length})`, icon: Sparkles },
          ].map((tab) => {
            const Icon = tab.icon;
            const active = activeTab === tab.key;
            return (
              <button
                key={tab.key}
                type="button"
                onClick={() => setActiveTab(tab.key)}
                className={`px-3.5 py-2 rounded-xl text-xs font-bold inline-flex items-center gap-1.5 transition-colors cursor-pointer ${
                  active
                    ? 'bg-slate-900 text-white'
                    : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {(activeTab === 'parents' || activeTab === 'bookings') && (
          <div className="relative w-full md:w-72">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="氏名・メール・会員番号・コーチで検索"
              className="w-full h-9 pl-9 pr-3 rounded-xl border border-slate-200 bg-white text-xs font-medium focus:outline-none focus:border-slate-400"
            />
          </div>
        )}
      </div>

      {/* メインコンテンツ */}
      {loading ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-12 flex items-center justify-center gap-2 text-xs font-bold text-slate-500">
          <Loader2 className="w-4 h-4 animate-spin" />
          <span>読み込み中...</span>
        </div>
      ) : activeTab === 'parents' ? (
        <div className="bg-white rounded-2xl border border-slate-200 overflow-x-auto shadow-xs">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold">
              <tr>
                <th className="py-3 px-4">お名前</th>
                <th className="py-3 px-4">会員番号</th>
                <th className="py-3 px-4">メールアドレス</th>
                <th className="py-3 px-4">電話番号</th>
                <th className="py-3 px-4">予約数</th>
                <th className="py-3 px-4">累計決済額</th>
                <th className="py-3 px-4">登録日</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredParents.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-slate-400">
                    該当する顧客データはありません。
                  </td>
                </tr>
              ) : (
                filteredParents.map((p) => (
                  <tr key={p.id} className="hover:bg-slate-50/70">
                    <td className="py-3 px-4 font-bold text-slate-900">{p.name}</td>
                    <td className="py-3 px-4 font-mono text-slate-600">
                      {p.membership_number || '-'}
                    </td>
                    <td className="py-3 px-4 text-slate-600">{p.email}</td>
                    <td className="py-3 px-4 text-slate-600">{p.phone || '-'}</td>
                    <td className="py-3 px-4 font-bold">{p.booking_count} 回</td>
                    <td className="py-3 px-4 font-bold text-[#3E8E84]">
                      ¥{p.paid_total.toLocaleString()}
                    </td>
                    <td className="py-3 px-4 text-slate-400">
                      {new Date(p.created_at).toLocaleDateString('ja-JP')}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      ) : activeTab === 'bookings' ? (
        <div className="bg-white rounded-2xl border border-slate-200 overflow-x-auto shadow-xs">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold">
              <tr>
                <th className="py-3 px-4">状態</th>
                <th className="py-3 px-4">保護者 / お子様</th>
                <th className="py-3 px-4">担当コーチ / レッスン</th>
                <th className="py-3 px-4">決済額</th>
                <th className="py-3 px-4">運営25% / コーチ75%</th>
                <th className="py-3 px-4">申込日時</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredBookings.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-slate-400">
                    該当する予約データはありません。
                  </td>
                </tr>
              ) : (
                filteredBookings.map((b) => {
                  const badge = STATUS_BADGE[b.status] || {
                    label: b.status,
                    className: 'bg-slate-100 text-slate-700 border-slate-200',
                  };
                  return (
                    <tr key={b.id} className="hover:bg-slate-50/70">
                      <td className="py-3 px-4">
                        <span
                          className={`inline-block px-2 py-0.5 rounded-full border text-[10px] font-bold ${badge.className}`}
                        >
                          {badge.label}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <div className="font-bold text-slate-900">
                          {b.parent_name}
                          {b.membership_number ? ` (#${b.membership_number})` : ''}
                        </div>
                        <div className="text-[11px] text-slate-500">
                          生徒：{b.student_name}（{b.student_age}）
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <div className="font-bold text-slate-800">{b.coach_name}</div>
                        <div className="text-[11px] text-slate-500 truncate max-w-xs">
                          {b.service_title}
                        </div>
                      </td>
                      <td className="py-3 px-4 font-bold text-slate-900">
                        ¥{(b.total_amount || 0).toLocaleString()}
                      </td>
                      <td className="py-3 px-4 text-slate-600">
                        ¥{(b.platform_fee || 0).toLocaleString()} / ¥
                        {(b.coach_payout || 0).toLocaleString()}
                      </td>
                      <td className="py-3 px-4 text-slate-400">
                        {new Date(b.created_at).toLocaleString('ja-JP')}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      ) : activeTab === 'coaches' ? (
        <div className="space-y-4">
          {sortedCoaches.length === 0 ? (
            <div className="bg-white rounded-2xl border border-slate-200 p-8 text-center text-xs text-slate-400">
              登録されているコーチはまだありません。
            </div>
          ) : (
            sortedCoaches.map((c) => {
              const badge = REVIEW_BADGE[c.review_status] || REVIEW_BADGE.pending_review;
              const isBusy = updatingCoachId === c.id;
              return (
                <div
                  key={c.id}
                  className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs flex flex-col lg:flex-row lg:items-center justify-between gap-4"
                >
                  <div className="flex flex-col sm:flex-row items-start gap-4">
                    <div className="flex flex-wrap items-start gap-3 shrink-0">
                      <button
                        type="button"
                        onClick={() => setPreviewCoach(c)}
                        className="group relative text-left cursor-pointer"
                        title="クリックで拡大表示"
                      >
                        <span className="block text-[10px] font-bold text-slate-500 mb-1">
                          公開顔写真
                        </span>
                        {c.avatar_url ? (
                          <div className="relative">
                            <img
                              src={c.avatar_url}
                              alt="公開顔写真"
                              className="w-28 h-28 sm:w-32 sm:h-32 rounded-2xl object-cover border border-slate-200 group-hover:border-[#3E8E84] transition-colors"
                            />
                            <span className="absolute bottom-1.5 right-1.5 w-6 h-6 rounded-full bg-slate-900/75 text-white flex items-center justify-center">
                              <ZoomIn className="w-3.5 h-3.5" />
                            </span>
                          </div>
                        ) : (
                          <div className="w-28 h-28 sm:w-32 sm:h-32 rounded-2xl bg-slate-100 flex items-center justify-center text-[11px] text-slate-400">
                            顔写真なし
                          </div>
                        )}
                      </button>

                      <button
                        type="button"
                        onClick={() => setPreviewCoach(c)}
                        className="group relative text-left cursor-pointer"
                        title="クリックで拡大表示"
                      >
                        <span className="block text-[10px] font-bold text-amber-700 mb-1">
                          カメラ撮影（本人確認）
                        </span>
                        {c.compliance_selfie_path ? (
                          <div className="relative">
                            <img
                              src={c.compliance_selfie_path}
                              alt="本人確認撮影"
                              className="w-28 h-28 sm:w-32 sm:h-32 rounded-2xl object-cover border-2 border-amber-300 group-hover:border-[#E3644F] transition-colors"
                            />
                            <span className="absolute bottom-1.5 right-1.5 w-6 h-6 rounded-full bg-slate-900/75 text-white flex items-center justify-center">
                              <ZoomIn className="w-3.5 h-3.5" />
                            </span>
                          </div>
                        ) : (
                          <div className="w-28 h-28 sm:w-32 sm:h-32 rounded-2xl bg-slate-100 flex items-center justify-center text-[11px] text-slate-400">
                            撮影なし
                          </div>
                        )}
                      </button>
                    </div>

                    <div className="space-y-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span
                          className={`px-2 py-0.5 rounded-full border text-[10px] font-bold ${badge.className}`}
                        >
                          {badge.label}
                        </span>
                        <span className="text-sm font-black text-slate-900">
                          {c.display_name}
                        </span>
                        <span className="text-xs text-slate-500">{c.title}</span>
                      </div>
                      <div className="text-[11px] text-slate-600">
                        種目：{(c.sport_categories || []).join('・') || '未設定'} ／ エリア：
                        {(c.target_areas || []).join('・') || '未設定'}
                      </div>
                      <div className="text-[11px] text-slate-500">
                        Stripe Connect：{c.stripe_account_id || '未連携'}（入金有効：
                        {c.stripe_payouts_enabled ? '有効' : '確認中'}）
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-2 shrink-0">
                    <button
                      type="button"
                      onClick={() => setPreviewCoach(c)}
                      className="h-9 px-3.5 rounded-full bg-white border border-slate-200 hover:border-slate-400 text-slate-700 text-xs font-bold inline-flex items-center gap-1.5 cursor-pointer"
                    >
                      <ZoomIn className="w-3.5 h-3.5" />
                      <span>写真を拡大比較</span>
                    </button>
                    <button
                      type="button"
                      disabled={isBusy || c.review_status === 'approved'}
                      onClick={() => handleReviewAction(c.id, 'approve')}
                      className="h-9 px-4 rounded-full bg-[#3E8E84] hover:bg-[#32756d] text-white text-xs font-bold inline-flex items-center gap-1.5 cursor-pointer disabled:opacity-45"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>承認（公開する）</span>
                    </button>
                    <button
                      type="button"
                      disabled={isBusy || c.review_status === 'rejected'}
                      onClick={() => handleReviewAction(c.id, 'reject')}
                      className="h-9 px-4 rounded-full bg-white border border-rose-200 hover:bg-rose-50 text-rose-600 text-xs font-bold inline-flex items-center gap-1.5 cursor-pointer disabled:opacity-45"
                    >
                      <XCircle className="w-3.5 h-3.5" />
                      <span>却下</span>
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-slate-200 overflow-x-auto shadow-xs">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold">
              <tr>
                <th className="py-3 px-4">希望種目</th>
                <th className="py-3 px-4">希望エリア</th>
                <th className="py-3 px-4">ご要望メモ</th>
                <th className="py-3 px-4">連絡先メール</th>
                <th className="py-3 px-4">受付日時</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {demands.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-slate-400">
                    需要リクエストはまだありません。
                  </td>
                </tr>
              ) : (
                demands.map((d) => (
                  <tr key={d.id} className="hover:bg-slate-50/70">
                    <td className="py-3 px-4 font-bold text-slate-900">{d.sport_name}</td>
                    <td className="py-3 px-4 text-slate-700">{d.area_name}</td>
                    <td className="py-3 px-4 text-slate-600 max-w-sm">{d.note || '-'}</td>
                    <td className="py-3 px-4 text-slate-600">{d.contact_email || '-'}</td>
                    <td className="py-3 px-4 text-slate-400">
                      {new Date(d.created_at).toLocaleString('ja-JP')}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* コーチ本人確認写真の拡大比較モーダル */}
      {previewCoach && (
        <div
          role="dialog"
          aria-modal="true"
          onClick={() => setPreviewCoach(null)}
          className="fixed inset-0 z-50 bg-slate-900/75 backdrop-blur-xs flex items-center justify-center p-4"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="bg-white w-full max-w-4xl max-h-[calc(100dvh-2rem)] rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col"
          >
            <div className="px-5 py-4 bg-slate-900 text-white flex items-center justify-between shrink-0">
              <div>
                <p className="text-[10px] font-bold text-amber-300 uppercase tracking-wider">
                  IDENTITY REVIEW
                </p>
                <h3 className="text-sm sm:text-base font-bold">
                  {previewCoach.display_name} コーチの本人確認写真比較
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setPreviewCoach(null)}
                aria-label="閉じる"
                className="p-2 rounded-full text-white/80 hover:text-white hover:bg-white/10 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-5 sm:p-6 overflow-y-auto grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div className="space-y-2">
                <div className="text-xs font-bold text-slate-700">
                  1. 公開プロフィール用 顔写真
                </div>
                {previewCoach.avatar_url ? (
                  <img
                    src={previewCoach.avatar_url}
                    alt="公開プロフィール顔写真（拡大）"
                    className="w-full max-h-[55vh] object-contain rounded-2xl border border-slate-200 bg-slate-50"
                  />
                ) : (
                  <div className="h-64 rounded-2xl bg-slate-100 flex items-center justify-center text-xs text-slate-400">
                    画像なし
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <div className="text-xs font-bold text-amber-700">
                  2. 登録時リアルタイム撮影（本人確認用）
                </div>
                {previewCoach.compliance_selfie_path ? (
                  <img
                    src={previewCoach.compliance_selfie_path}
                    alt="登録時カメラ撮影（拡大）"
                    className="w-full max-h-[55vh] object-contain rounded-2xl border-2 border-amber-300 bg-slate-50"
                  />
                ) : (
                  <div className="h-64 rounded-2xl bg-slate-100 flex items-center justify-center text-xs text-slate-400">
                    撮影画像なし
                  </div>
                )}
              </div>
            </div>

            <div className="px-5 py-4 border-t border-slate-200 bg-slate-50 flex flex-wrap items-center justify-between gap-3 shrink-0">
              <button
                type="button"
                onClick={() => setPreviewCoach(null)}
                className="h-9 px-4 rounded-full bg-white border border-slate-200 hover:border-slate-400 text-xs font-bold text-slate-700 cursor-pointer"
              >
                閉じる
              </button>
              <div className="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  disabled={
                    updatingCoachId === previewCoach.id ||
                    previewCoach.review_status === 'approved'
                  }
                  onClick={async () => {
                    await handleReviewAction(previewCoach.id, 'approve');
                    setPreviewCoach(null);
                  }}
                  className="h-9 px-4 rounded-full bg-[#3E8E84] hover:bg-[#32756d] text-white text-xs font-bold inline-flex items-center gap-1.5 cursor-pointer disabled:opacity-45"
                >
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>承認（公開する）</span>
                </button>
                <button
                  type="button"
                  disabled={
                    updatingCoachId === previewCoach.id ||
                    previewCoach.review_status === 'rejected'
                  }
                  onClick={async () => {
                    await handleReviewAction(previewCoach.id, 'reject');
                    setPreviewCoach(null);
                  }}
                  className="h-9 px-4 rounded-full bg-white border border-rose-200 hover:bg-rose-50 text-rose-600 text-xs font-bold inline-flex items-center gap-1.5 cursor-pointer disabled:opacity-45"
                >
                  <XCircle className="w-3.5 h-3.5" />
                  <span>却下</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
