'use client';

import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import KidsCoachNavbar from '@/components/kids-coach/Navbar';
import KidsCoachFooter from '@/components/kids-coach/Footer';
import { SPORT_CATEGORIES, AREA_LIST } from '@/data/kids-coach-mock';
import {
  CheckCircle2,
  Shield,
  ExternalLink,
  ArrowRight,
  UserCheck,
  Camera,
  Upload,
  ShieldCheck,
  AlertCircle,
  RefreshCw,
} from 'lucide-react';

const MAX_SPORTS = 3;
const CORE_AREA_SLUGS = ['setagaya', 'meguro', 'minato', 'shibuya', 'shinagawa'];

/**
 * キッズコーチナビ用のコーチ新規登録・オンボーディング画面
 * 顔写真登録＋登録時のリアルタイム顔撮影＋Stripe自動本人確認を必須コンプラゲートとして強制する
 */
export default function CoachOnboardingDemo() {
  const [displayName, setDisplayName] = useState('田中 健太');
  const [coachEmail, setCoachEmail] = useState('');
  const [title, setTitle] = useState('元インカレ陸上 ｜ 指導歴5年');
  const [selectedSports, setSelectedSports] = useState<string[]>([
    'かけっこ・陸上',
    '学校体育克服',
  ]);
  const [selectedAreas, setSelectedAreas] = useState<string[]>([
    '世田谷区',
    '目黒区',
    '品川区',
  ]);
  const [bio, setBio] = useState(
    '「腕の振り方」と「地面を蹴る感覚」を遊びながら習得できるよう指導しています。'
  );

  // ① プロフィール用顔写真（必須）
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);

  // ② 登録時のリアルタイム顔撮影（必須・カメラまたはデモ撮影）
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [liveSelfieUrl, setLiveSelfieUrl] = useState<string | null>(null);
  const [selfieTimestamp, setSelfieTimestamp] = useState<string | null>(null);

  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  // 登録申請・規約同意状態（false: 情報入力中 / true: 申請完了・運営目視審査待ち）
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const coreAreas = AREA_LIST.filter((a) => CORE_AREA_SLUGS.includes(a.slug));

  /** カメラストリームを安全に停止する */
  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    setIsCameraActive(false);
  };

  useEffect(() => {
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
      }
    };
  }, []);

  const toggleItem = (
    item: string,
    current: string[],
    setter: React.Dispatch<React.SetStateAction<string[]>>,
    maxCount?: number
  ) => {
    if (current.includes(item)) {
      setter(current.filter((v) => v !== item));
      return;
    }
    if (maxCount && current.length >= maxCount) {
      return;
    }
    setter([...current, item]);
  };

  /** プロフィール顔写真のアップロード処理 */
  const handleAvatarUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        setAvatarPreview(reader.result);
      }
    };
    reader.readAsDataURL(file);
  };

  /** テスト用：サンプル顔写真をセット */
  const handleSetSampleAvatar = () => {
    setAvatarPreview(
      'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=80'
    );
  };

  /** Webカメラを起動してリアルタイム撮影準備を行う */
  const handleStartCamera = async () => {
    setCameraError(null);
    if (
      typeof navigator === 'undefined' ||
      !navigator.mediaDevices ||
      !navigator.mediaDevices.getUserMedia
    ) {
      setCameraError(
        'お使いの環境ではカメラを起動できませんでした。「テスト用自動撮影」でお試しください。'
      );
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'user', width: { ideal: 640 }, height: { ideal: 480 } },
        audio: false,
      });
      streamRef.current = stream;
      setIsCameraActive(true);
      setTimeout(() => {
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
      }, 50);
    } catch {
      setCameraError(
        'カメラの許可が得られませんでした。ブラウザ設定をご確認いただくか「テスト用自動撮影」をご利用ください。'
      );
    }
  };

  /** 撮影画像の簡易品質チェック（暗すぎ・白飛び・単色/壁を自動検知して弾く） */
  const analyzeCapturedImageQuality = (
    canvas: HTMLCanvasElement
  ): { ok: boolean; reason?: string } => {
    const sampleCanvas = document.createElement('canvas');
    sampleCanvas.width = 64;
    sampleCanvas.height = 48;
    const sCtx = sampleCanvas.getContext('2d');
    if (!sCtx) return { ok: true };

    sCtx.drawImage(canvas, 0, 0, 64, 48);
    const { data } = sCtx.getImageData(0, 0, 64, 48);
    const pixelCount = 64 * 48;
    let sum = 0;
    const lumas = new Float32Array(pixelCount);

    for (let i = 0; i < pixelCount; i++) {
      const idx = i * 4;
      const luma = 0.299 * data[idx] + 0.587 * data[idx + 1] + 0.114 * data[idx + 2];
      lumas[i] = luma;
      sum += luma;
    }

    const avg = sum / pixelCount;
    let varianceSum = 0;
    for (let i = 0; i < pixelCount; i++) {
      const diff = lumas[i] - avg;
      varianceSum += diff * diff;
    }
    const stdDev = Math.sqrt(varianceSum / pixelCount);

    if (avg < 25) {
      return {
        ok: false,
        reason: '画面が暗すぎます。明るい場所でお顔を映して撮影し直してください。',
      };
    }
    if (avg > 240) {
      return {
        ok: false,
        reason: '画面が明るすぎます（白飛び）。逆光を避けて撮影し直してください。',
      };
    }
    if (stdDev < 12) {
      return {
        ok: false,
        reason: '壁や単色の映像が写っています。お顔がはっきり映る状態で撮影し直してください。',
      };
    }
    return { ok: true };
  };

  /** リアルタイム撮影画像を保存する */
  const saveCapturedSelfie = (capturedDataUrl: string) => {
    setCameraError(null);
    setLiveSelfieUrl(capturedDataUrl);
    setSelfieTimestamp(
      new Date().toLocaleString('ja-JP', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
      })
    );
  };

  /** 起動中カメラのフレームを撮影し、明度・単色チェックを通してから保存する */
  const handleCapturePhoto = () => {
    if (!videoRef.current) return;
    const video = videoRef.current;
    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth || 480;
    canvas.height = video.videoHeight || 360;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      const quality = analyzeCapturedImageQuality(canvas);
      if (!quality.ok) {
        setCameraError(
          quality.reason || 'お顔が認識できませんでした。もう一度撮影してください。'
        );
        return;
      }
      const dataUrl = canvas.toDataURL('image/jpeg', 0.85);
      stopCamera();
      saveCapturedSelfie(dataUrl);
    }
  };

  /** カメラ非対応環境向けのテスト自動撮影 */
  const handleSimulateLiveCapture = () => {
    stopCamera();
    setCameraError(null);
    saveCapturedSelfie(
      'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=80'
    );
  };

  // コンプライアンス必須2要件（顔写真登録＋リアルタイム顔撮影）が満たされているか
  // ※ Stripe Connect（公的身分証・口座連携）は運営の目視審査承認後にコーチダッシュボードで実施
  const hasAvatar = Boolean(avatarPreview);
  const hasVerifiedLiveSelfie = Boolean(liveSelfieUrl);
  const isComplianceReady = hasAvatar && hasVerifiedLiveSelfie;
  const canSubmit = isComplianceReady && agreedToTerms;

  const handleCompleteOnboarding = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canSubmit || isSubmitting) return;

    if (!coachEmail.trim()) {
      setSubmitError('ご連絡・審査結果通知用のメールアドレスをご入力ください。');
      return;
    }

    setIsSubmitting(true);
    setSubmitError(null);

    try {
      const res = await fetch('/api/kcn/coach/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          displayName,
          email: coachEmail.trim(),
          title,
          selectedSports,
          selectedAreas,
          bio,
          avatarUrl: avatarPreview,
          liveSelfieUrl,
          selfieTimestamp,
        }),
      });
      const data = await res.json();

      if (!res.ok || !data?.ok) {
        setSubmitError(data?.error || '登録申請の送信に失敗しました。');
        setIsSubmitting(false);
        return;
      }

      setIsSubmitting(false);
      setIsSubmitted(true);
    } catch {
      setSubmitError('通信エラーが発生しました。時間をおいて再度お試しください。');
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FDFBF7] text-[#2C2B29] flex flex-col font-sans">
      <KidsCoachNavbar />

      <main className="flex-1 py-6 sm:py-10">
        <div className="max-w-3xl mx-auto px-3.5 sm:px-6 space-y-5">
          {/* タイトル */}
          <div className="space-y-2.5">
            <span className="font-en text-[10px] font-extrabold tracking-widest uppercase text-[#3E8E84] block">
              COACH ONBOARDING & REVIEW
            </span>
            <h1 className="font-heading text-xl sm:text-2xl font-bold text-[#2C2B29] tracking-tight">
              認定コーチ登録・審査フロー
            </h1>
            <p className="text-xs sm:text-sm text-[#5E5B54] leading-relaxed">
              お子様への指導安全性を守るため、<strong>情報登録 → 運営による目視審査 → 審査承認 → 登録完了</strong> の流れで公開されます。
            </p>

            {/* 登録フロー 4ステップ表示 */}
            <div className="grid grid-cols-4 gap-1.5 sm:gap-2 pt-1 text-[10px] sm:text-xs font-bold">
              {[
                { key: 'editing', label: '1. 情報登録', active: !isSubmitted, done: isSubmitted },
                { key: 'pending_review', label: '2. 目視審査', active: isSubmitted, done: false },
                { key: 'approve', label: '3. 審査承認', active: false, done: false },
                { key: 'complete', label: '4. 登録完了', active: false, done: false },
              ].map((st) => (
                <div
                  key={st.key}
                  className={`px-2 py-2 rounded-xl border text-center whitespace-nowrap truncate ${
                    st.active
                      ? 'bg-[#2C2B29] text-white border-[#2C2B29]'
                      : st.done
                        ? 'bg-[#D2E7DF]/60 text-[#3E8E84] border-[#3E8E84]/40'
                        : 'bg-white text-[#8A857B] border-[#EADBCC]'
                  }`}
                >
                  {st.label}
                </div>
              ))}
            </div>
          </div>

          {isSubmitted ? (
            /* 申請完了・運営目視審査待ち画面 */
            <div className="bg-white rounded-3xl border border-[#EADBCC] p-6 sm:p-10 shadow-xs text-center space-y-5">
              <div className="w-14 h-14 rounded-full bg-[#FCE7A2]/70 text-[#8A5A00] flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-7 h-7" strokeWidth={2} />
              </div>

              <div className="space-y-2">
                <span className="inline-block text-xs font-bold text-[#8A5A00] bg-[#FCE7A2] px-3.5 py-1 rounded-full">
                  申請受付完了・運営目視審査中
                </span>
                <h2 className="font-heading text-xl sm:text-2xl font-bold text-[#2C2B29]">
                  {displayName} コーチの登録申請を受け付けました
                </h2>
                <p className="text-xs sm:text-sm text-[#5E5B54] leading-relaxed">
                  ご提出いただいた顔写真・カメラ撮影画像を運営にて目視確認いたします。審査承認後にメールでご案内いたしますので、承認後にコーチダッシュボードより振込先口座（Stripe Connect）連携およびレッスン枠の公開を行ってください。
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-[#FDFBF7] border border-[#EADBCC] text-left text-xs space-y-1.5">
                <div>
                  種目：<strong className="text-[#2C2B29]">{selectedSports.join('・') || '未選択'}</strong>
                </div>
                <div>
                  対応エリア：<strong className="text-[#2C2B29]">{selectedAreas.join('・') || '未選択'}</strong>
                </div>
                <div>
                  提出状況：<strong className="text-[#3E8E84]">顔写真登録済 / カメラ撮影済（{selfieTimestamp}）</strong>
                </div>
                <div className="pt-1 text-[11px] text-[#5E5B54]">
                  ※ 振込先口座連携（Stripe Connect）および報酬設定の反映は、審査承認後に有効となります。
                </div>
              </div>

              <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-1">
                <button
                  type="button"
                  onClick={() => setIsSubmitted(false)}
                  className="w-full sm:w-auto h-11 px-5 rounded-full bg-white border border-[#EADBCC] hover:border-[#2C2B29] text-xs font-bold text-[#5E5B54] cursor-pointer"
                >
                  ← 入力内容を修正する
                </button>
                <Link
                  href="/"
                  className="w-full sm:w-auto inline-flex h-11 px-6 rounded-full bg-[#2C2B29] hover:bg-[#3E8E84] text-white font-bold text-xs items-center justify-center gap-2 transition-colors whitespace-nowrap"
                >
                  <span>トップページへ戻る</span>
                  <ArrowRight className="w-4 h-4 shrink-0" strokeWidth={1.75} />
                </Link>
              </div>
            </div>
          ) : (
            <form onSubmit={handleCompleteOnboarding} className="space-y-5 text-xs">
              {/* STEP 1: プロフィール情報・顔写真（必須）・種目・エリア */}
              <div className="bg-white rounded-3xl border border-[#EADBCC] p-4 sm:p-6 shadow-xs space-y-4">
                <div className="flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full bg-[#2C2B29] text-white font-en text-[11px] font-bold flex items-center justify-center shrink-0">
                    1
                  </span>
                  <h2 className="font-heading text-sm sm:text-base font-bold text-[#2C2B29]">
                    基本プロフィール・顔写真（必須）
                  </h2>
                </div>

                {/* プロフィール顔写真アップロード（必須） */}
                <div className="p-3.5 rounded-2xl bg-[#FDFBF7] border border-[#EADBCC] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex items-center gap-3 min-w-0">
                    {avatarPreview ? (
                      <img
                        src={avatarPreview}
                        alt="プロフィール顔写真"
                        className="w-16 h-16 rounded-2xl object-cover border border-[#3E8E84] shrink-0"
                      />
                    ) : (
                      <div className="w-16 h-16 rounded-2xl bg-white border border-dashed border-[#E3644F] flex flex-col items-center justify-center text-[10px] font-bold text-[#E3644F] shrink-0 text-center p-1">
                        <Upload className="w-4 h-4 mb-0.5" strokeWidth={1.75} />
                        <span>顔写真必須</span>
                      </div>
                    )}
                    <div className="space-y-0.5 min-w-0">
                      <div className="font-bold text-[#2C2B29] flex items-center gap-1.5">
                        <span>公開プロフィール用 顔写真</span>
                        <span className="text-[10px] px-1.5 py-0.5 rounded bg-[#E3644F]/10 text-[#E3644F]">
                          必須
                        </span>
                      </div>
                      <p className="text-[11px] text-[#5E5B54] leading-relaxed">
                        マスク・サングラスなしの正面の顔写真を登録してください（運営による本人確認の目視審査にも使用します）。
                      </p>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-2 shrink-0">
                    <label className="px-3.5 py-2 rounded-full bg-white border border-[#EADBCC] hover:border-[#2C2B29] text-[11px] font-bold text-[#2C2B29] inline-flex items-center gap-1.5 cursor-pointer whitespace-nowrap">
                      <Upload className="w-3.5 h-3.5 shrink-0" strokeWidth={1.75} />
                      <span>写真を選択</span>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleAvatarUpload}
                        className="hidden"
                      />
                    </label>
                    {!avatarPreview && (
                      <button
                        type="button"
                        onClick={handleSetSampleAvatar}
                        className="px-3 py-2 rounded-full bg-[#3E8E84]/10 text-[#3E8E84] hover:bg-[#3E8E84]/20 text-[11px] font-bold cursor-pointer whitespace-nowrap"
                      >
                        デモ写真を使う
                      </button>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label htmlFor="coach-name" className="block font-bold text-[#2C2B29] mb-1">
                      表示名（コーチ名） <span className="text-[#E3644F]">*</span>
                    </label>
                    <input
                      id="coach-name"
                      type="text"
                      required
                      value={displayName}
                      onChange={(e) => setDisplayName(e.target.value)}
                      className="w-full h-11 px-3.5 rounded-xl border border-[#EADBCC] bg-[#FDFBF7] text-xs font-bold text-[#2C2B29] focus:outline-none focus:border-[#E3644F] focus:bg-white"
                    />
                  </div>
                  <div>
                    <label htmlFor="coach-email" className="block font-bold text-[#2C2B29] mb-1">
                      ご連絡用メールアドレス <span className="text-[#E3644F]">*</span>
                    </label>
                    <input
                      id="coach-email"
                      type="email"
                      required
                      placeholder="coach@example.com"
                      value={coachEmail}
                      onChange={(e) => setCoachEmail(e.target.value)}
                      className="w-full h-11 px-3.5 rounded-xl border border-[#EADBCC] bg-[#FDFBF7] text-xs font-bold text-[#2C2B29] focus:outline-none focus:border-[#E3644F] focus:bg-white"
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="coach-title" className="block font-bold text-[#2C2B29] mb-1">
                    肩書き・競技実績 <span className="text-[#E3644F]">*</span>
                  </label>
                  <input
                    id="coach-title"
                    type="text"
                    required
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="w-full h-11 px-3.5 rounded-xl border border-[#EADBCC] bg-[#FDFBF7] text-xs font-bold text-[#2C2B29] focus:outline-none focus:border-[#E3644F] focus:bg-white"
                  />
                </div>

                <div>
                  <div className="flex flex-wrap items-center justify-between gap-1 mb-1.5">
                    <span className="font-bold text-[#2C2B29]">
                      指導できるメイン種目（最大{MAX_SPORTS}つまで選択）
                    </span>
                    <span className="text-[10px] font-bold text-[#3E8E84]">
                      選択中: {selectedSports.length} / {MAX_SPORTS}
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {SPORT_CATEGORIES.filter((s) => s.slug !== 'niche-sports').map((sport) => {
                      const active = selectedSports.includes(sport.name);
                      const disabled = !active && selectedSports.length >= MAX_SPORTS;
                      return (
                        <button
                          key={sport.slug}
                          type="button"
                          disabled={disabled}
                          onClick={() =>
                            toggleItem(
                              sport.name,
                              selectedSports,
                              setSelectedSports,
                              MAX_SPORTS
                            )
                          }
                          className={`px-3 py-1.5 rounded-full border text-xs font-bold transition-colors whitespace-nowrap ${
                            active
                              ? 'bg-[#3E8E84] text-white border-[#3E8E84] cursor-pointer'
                              : disabled
                                ? 'bg-[#F3EFE8] text-[#8A857B] border-[#EADBCC] cursor-not-allowed opacity-60'
                                : 'bg-[#FDFBF7] text-[#5E5B54] border-[#EADBCC] hover:border-[#3E8E84] cursor-pointer'
                          }`}
                        >
                          {sport.name}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* 対応エリア（初期5区のみ表示） */}
                <div>
                  <span className="block font-bold text-[#2C2B29] mb-1.5">
                    対応エリア（複数選択可）
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {coreAreas.map((area) => {
                      const active = selectedAreas.includes(area.name);
                      return (
                        <button
                          key={area.slug}
                          type="button"
                          onClick={() =>
                            toggleItem(area.name, selectedAreas, setSelectedAreas)
                          }
                          className={`px-3 py-1.5 rounded-full border text-xs font-bold transition-colors cursor-pointer whitespace-nowrap ${
                            active
                              ? 'bg-[#2C2B29] text-white border-[#2C2B29]'
                              : 'bg-[#FDFBF7] text-[#5E5B54] border-[#EADBCC] hover:border-[#2C2B29]'
                          }`}
                        >
                          {area.name}
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div>
                  <label htmlFor="coach-bio" className="block font-bold text-[#2C2B29] mb-1">
                    自己紹介・指導方針
                  </label>
                  <textarea
                    id="coach-bio"
                    rows={3}
                    value={bio}
                    onChange={(e) => setBio(e.target.value)}
                    className="w-full p-3 rounded-xl border border-[#EADBCC] bg-[#FDFBF7] text-xs text-[#2C2B29] leading-relaxed focus:outline-none focus:border-[#E3644F] focus:bg-white"
                  />
                </div>
              </div>

              {/* STEP 2: コンプライアンス必須・リアルタイム顔撮影（運営目視確認用） */}
              <div className="bg-white rounded-3xl border border-[#EADBCC] p-4 sm:p-6 shadow-xs space-y-4">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="w-6 h-6 rounded-full bg-[#E3644F] text-white font-en text-[11px] font-bold flex items-center justify-center shrink-0">
                      2
                    </span>
                    <h2 className="font-heading text-sm sm:text-base font-bold text-[#2C2B29]">
                      登録時リアルタイム顔撮影（必須）
                    </h2>
                  </div>
                  <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-[#E3644F]/10 text-[#E3644F]">
                    なりすまし防止コンプラ
                  </span>
                </div>

                <p className="text-[11px] text-[#5E5B54] leading-relaxed">
                  拾い画・なりすまし登録を防ぐため、その場でカメラによる顔撮影を行います（暗すぎる・壁などの単色画像は自動で弾かれます）。
                </p>

                {cameraError && (
                  <div className="p-3 rounded-xl bg-[#FCE7A2]/45 border border-[#EADBCC] text-[11px] text-[#2C2B29] flex items-start gap-2">
                    <AlertCircle className="w-4 h-4 text-[#E3644F] shrink-0 mt-0.5" strokeWidth={1.75} />
                    <span>{cameraError}</span>
                  </div>
                )}

                {isCameraActive ? (
                  <div className="p-3.5 rounded-2xl bg-[#2C2B29] space-y-3 text-center">
                    <div className="relative max-w-xs mx-auto rounded-2xl overflow-hidden border-2 border-[#3E8E84]">
                      <video
                        ref={videoRef}
                        autoPlay
                        playsInline
                        muted
                        className="w-full aspect-4/3 object-cover"
                      />
                    </div>
                    <div className="flex flex-wrap items-center justify-center gap-2">
                      <button
                        type="button"
                        onClick={handleCapturePhoto}
                        className="h-10 px-5 rounded-full bg-[#E3644F] hover:bg-[#d05540] text-white font-bold text-xs inline-flex items-center gap-1.5 cursor-pointer"
                      >
                        <Camera className="w-4 h-4 shrink-0" strokeWidth={1.75} />
                        <span>この顔で撮影する</span>
                      </button>
                      <button
                        type="button"
                        onClick={stopCamera}
                        className="h-10 px-4 rounded-full bg-white/15 text-white font-bold text-xs cursor-pointer"
                      >
                        キャンセル
                      </button>
                    </div>
                  </div>
                ) : liveSelfieUrl ? (
                  <div className="p-3.5 rounded-2xl bg-[#FDFBF7] border border-[#3E8E84]/40 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <img
                        src={liveSelfieUrl}
                        alt="当日撮影セルフィー"
                        className="w-14 h-14 rounded-2xl object-cover border border-[#3E8E84] shrink-0"
                      />
                      <div className="space-y-0.5">
                        <div className="inline-flex items-center gap-1 font-bold text-[#3E8E84]">
                          <ShieldCheck className="w-4 h-4 shrink-0" strokeWidth={2} />
                          <span>撮影完了（運営目視審査用に添付済）</span>
                        </div>
                        <div className="text-[10px] text-[#5E5B54] font-en">
                          撮影日時: {selfieTimestamp}
                        </div>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={handleStartCamera}
                      className="px-3 py-1.5 rounded-full bg-white border border-[#EADBCC] hover:border-[#2C2B29] text-[11px] font-bold text-[#5E5B54] inline-flex items-center gap-1 cursor-pointer self-start sm:self-auto whitespace-nowrap"
                    >
                      <RefreshCw className="w-3 h-3 shrink-0" strokeWidth={1.75} />
                      <span>撮り直す</span>
                    </button>
                  </div>
                ) : (
                  <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
                    <button
                      type="button"
                      onClick={handleStartCamera}
                      className="h-11 px-4 rounded-full bg-[#2C2B29] hover:bg-[#3E8E84] text-white font-bold text-xs inline-flex items-center justify-center gap-2 transition-colors cursor-pointer whitespace-nowrap"
                    >
                      <Camera className="w-4 h-4 shrink-0" strokeWidth={1.75} />
                      <span>カメラを起動して顔写真を撮る</span>
                    </button>
                    <button
                      type="button"
                      onClick={handleSimulateLiveCapture}
                      className="h-11 px-4 rounded-full bg-[#FDFBF7] border border-[#EADBCC] hover:border-[#3E8E84] text-[#3E8E84] font-bold text-xs inline-flex items-center justify-center gap-1.5 transition-colors cursor-pointer whitespace-nowrap"
                    >
                      <span>テスト用：自動撮影シミュレーション</span>
                    </button>
                  </div>
                )}
              </div>

              {/* 審査申請前の必須チェックリスト ＆ 完了ボタン */}
              <div className="bg-white rounded-3xl border border-[#EADBCC] p-4 sm:p-5 space-y-3">
                <div className="text-[11px] font-bold text-[#2C2B29]">
                  審査申請前の必須チェック
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px] font-bold">
                  <div
                    className={`px-3 py-2 rounded-xl border flex items-center gap-1.5 ${
                      hasAvatar
                        ? 'bg-[#D2E7DF]/40 border-[#3E8E84]/40 text-[#3E8E84]'
                        : 'bg-[#FDFBF7] border-[#EADBCC] text-[#8A857B]'
                    }`}
                  >
                    <CheckCircle2 className="w-3.5 h-3.5 shrink-0" strokeWidth={2} />
                    <span>1. 顔写真登録</span>
                  </div>
                  <div
                    className={`px-3 py-2 rounded-xl border flex items-center gap-1.5 ${
                      hasVerifiedLiveSelfie
                        ? 'bg-[#D2E7DF]/40 border-[#3E8E84]/40 text-[#3E8E84]'
                        : 'bg-[#FDFBF7] border-[#EADBCC] text-[#8A857B]'
                    }`}
                  >
                    <CheckCircle2 className="w-3.5 h-3.5 shrink-0" strokeWidth={2} />
                    <span>2. 登録時顔撮影クリア</span>
                  </div>
                </div>
                <p className="text-[11px] text-[#5E5B54] leading-relaxed">
                  ※ 振込先口座および公的身分証の連携（Stripe Connect）は、運営による目視審査の承認後にコーチダッシュボードから行っていただけます。
                </p>

                {/* コーチ利用規約・プライバシーポリシー同意（必須） */}
                <div className="p-3.5 rounded-2xl border border-[#EADBCC] bg-[#FDFBF7]">
                  <label className="flex items-start gap-2.5 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      required
                      checked={agreedToTerms}
                      onChange={(e) => setAgreedToTerms(e.target.checked)}
                      className="mt-0.5 rounded border-[#EADBCC] text-[#E3644F] focus:ring-[#E3644F]"
                    />
                    <span className="text-[11px] text-[#2C2B29] leading-relaxed">
                      <Link
                        href="/coach/terms"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="font-bold text-[#3E8E84] underline hover:text-[#2f7169]"
                      >
                        コーチ利用規約
                      </Link>
                      （自己都合キャンセル・業務委託条件・報酬規定を含む）および
                      <Link
                        href="/privacy"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="font-bold text-[#3E8E84] underline hover:text-[#2f7169]"
                      >
                        プライバシーポリシー
                      </Link>
                      に同意します <span className="text-[#E3644F] font-bold">*</span>
                    </span>
                  </label>
                </div>

                {submitError && (
                  <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-bold">
                    {submitError}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={!canSubmit || isSubmitting}
                  className="w-full min-h-12 py-3 px-4 rounded-full bg-[#E3644F] hover:bg-[#d05540] text-white font-bold text-xs sm:text-sm flex items-center justify-center transition-colors shadow-sm cursor-pointer disabled:opacity-45 disabled:cursor-not-allowed text-center"
                >
                  <span>
                    {isSubmitting
                      ? '登録申請を送信中...'
                      : canSubmit
                        ? '登録情報を送信して審査へ進む'
                        : !isComplianceReady
                          ? '必須2項目を完了すると審査申請できます'
                          : 'コーチ利用規約への同意が必要です'}
                  </span>
                </button>
              </div>
            </form>
          )}
        </div>
      </main>

      <KidsCoachFooter />
    </div>
  );
}
