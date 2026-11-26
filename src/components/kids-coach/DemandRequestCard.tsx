'use client';

import React, { useState, useEffect } from 'react';
import { saveDemandRequest } from '@/lib/demand-requests';
import { Send, CheckCircle2, Sparkles } from 'lucide-react';

interface DemandRequestCardProps {
  defaultSport?: string;
  defaultArea?: string;
}

const SUGGESTED_SPORTS = [
  '跳び箱・マット運動',
  '自転車（補助輪外し）',
  'なわとび・二重跳び',
  '鉄棒・逆上がり',
  '水泳・クロール',
  'かけっこ・走り方',
];

/**
 * 保護者から「見つからない種目・エリア」の需要を収集するリクエストフォーム
 */
export default function DemandRequestCard({
  defaultSport = '',
  defaultArea = '',
}: DemandRequestCardProps) {
  const [sportName, setSportName] = useState(defaultSport);
  const [areaName, setAreaName] = useState(defaultArea || '世田谷区');
  const [note, setNote] = useState('');
  const [contactEmail, setContactEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showDemoTools, setShowDemoTools] = useState(
    process.env.NODE_ENV !== 'production'
  );

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      if (params.get('demo') === '1') setShowDemoTools(true);
    }
  }, []);

  const handleApplyTestTaro = () => {
    setContactEmail('test_taro@wellne.example.com');
    if (!note) {
      setNote('単発60分で基礎から優しく教えてほしいです（会員番号0035・テスト太郎）');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!sportName.trim() || !areaName.trim() || isSubmitting) return;
    setIsSubmitting(true);

    const payload = {
      sportName: sportName.trim(),
      areaName: areaName.trim(),
      note: note.trim() || undefined,
      contactEmail: contactEmail.trim() || undefined,
    };

    try {
      await fetch('/api/kcn/demand', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
    } catch {
      // ネットワークエラー時もローカル保持にフォールバック
    }

    saveDemandRequest(payload);
    setIsSubmitting(false);
    setSubmitted(true);
  };

  return (
    <div className="bg-white rounded-3xl border border-[#EADBCC] p-5 sm:p-7 shadow-xs space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div>
          <span className="inline-flex items-center gap-1 text-[10px] font-bold text-[#3E8E84] bg-[#D2E7DF]/60 px-2.5 py-0.5 rounded-full">
            <Sparkles className="w-3 h-3 shrink-0" strokeWidth={2} />
            <span>ご希望のコーチが見つからない場合</span>
          </span>
          <h2 className="font-heading text-base sm:text-lg font-bold text-[#2C2B29] mt-1.5">
            種目・エリアをリクエストする
          </h2>
          <p className="text-xs text-[#5E5B54] mt-0.5 leading-relaxed">
            ご希望条件をお送りいただくと、対応可能な認定コーチの募集・優先手配に活用し、見つかり次第ご案内します。
          </p>
        </div>

        {!submitted && showDemoTools && (
          <button
            type="button"
            onClick={handleApplyTestTaro}
            className="text-[11px] font-bold px-3 py-1.5 rounded-full bg-[#FDFBF7] border border-[#EADBCC] hover:border-[#3E8E84] text-[#3E8E84] transition-colors cursor-pointer whitespace-nowrap self-start sm:self-auto"
          >
            テスト太郎（0035）を入力
          </button>
        )}
      </div>

      {submitted ? (
        <div className="p-4 rounded-2xl bg-[#D2E7DF]/40 border border-[#3E8E84]/35 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-start gap-2.5 text-xs">
            <CheckCircle2 className="w-4 h-4 text-[#3E8E84] shrink-0 mt-0.5" strokeWidth={2} />
            <div className="space-y-0.5">
              <p className="font-bold text-[#2C2B29]">
                リクエストを受け付けました（{areaName} × {sportName}）
              </p>
              <p className="text-[11px] text-[#5E5B54]">
                保護者の需要データとして記録され、コーチ管理画面の「いま求められている種目・エリア」にも反映されます。
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => {
              setSubmitted(false);
              setNote('');
            }}
            className="text-[11px] font-bold text-[#3E8E84] hover:underline whitespace-nowrap cursor-pointer self-start sm:self-auto"
          >
            別の条件を送る
          </button>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-3 text-xs">
          {/* よくあるリクエスト種目ピル */}
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="text-[10px] font-bold text-[#8A857B] mr-0.5">
              よく探されている種目:
            </span>
            {SUGGESTED_SPORTS.map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => setSportName(s)}
                className={`px-2.5 py-1 rounded-full border text-[11px] font-bold transition-colors cursor-pointer whitespace-nowrap ${
                  sportName === s
                    ? 'bg-[#2C2B29] text-white border-[#2C2B29]'
                    : 'bg-[#FDFBF7] text-[#5E5B54] border-[#EADBCC] hover:border-[#3E8E84]'
                }`}
              >
                {s}
              </button>
            ))}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label htmlFor="demand-sport" className="block font-bold text-[#2C2B29] mb-1">
                希望種目 <span className="text-[#E3644F]">*</span>
              </label>
              <input
                id="demand-sport"
                type="text"
                required
                placeholder="例: 自転車の補助輪外し、跳び箱"
                value={sportName}
                onChange={(e) => setSportName(e.target.value)}
                className="w-full h-10 px-3 rounded-xl border border-[#EADBCC] bg-[#FDFBF7] text-xs font-bold text-[#2C2B29] focus:outline-none focus:border-[#E3644F] focus:bg-white"
              />
            </div>

            <div>
              <label htmlFor="demand-area" className="block font-bold text-[#2C2B29] mb-1">
                希望エリア <span className="text-[#E3644F]">*</span>
              </label>
              <input
                id="demand-area"
                type="text"
                required
                placeholder="例: 世田谷区、練馬区"
                value={areaName}
                onChange={(e) => setAreaName(e.target.value)}
                className="w-full h-10 px-3 rounded-xl border border-[#EADBCC] bg-[#FDFBF7] text-xs font-bold text-[#2C2B29] focus:outline-none focus:border-[#E3644F] focus:bg-white"
              />
            </div>

            <div>
              <label htmlFor="demand-email" className="block font-bold text-[#2C2B29] mb-1">
                お知らせ先メール（任意）
              </label>
              <input
                id="demand-email"
                type="email"
                placeholder="example@wellne.jp"
                value={contactEmail}
                onChange={(e) => setContactEmail(e.target.value)}
                className="w-full h-10 px-3 rounded-xl border border-[#EADBCC] bg-[#FDFBF7] text-xs font-bold text-[#2C2B29] focus:outline-none focus:border-[#E3644F] focus:bg-white"
              />
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-2.5 items-stretch sm:items-center">
            <input
              type="text"
              placeholder="ご要望メモ（例: 週末午前、60分で逆上がりを教えてほしい）"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              className="flex-1 h-10 px-3.5 rounded-xl border border-[#EADBCC] bg-[#FDFBF7] text-xs text-[#2C2B29] focus:outline-none focus:border-[#E3644F] focus:bg-white"
            />
            <button
              type="submit"
              className="h-10 px-5 rounded-full bg-[#E3644F] hover:bg-[#d05540] text-white font-bold text-xs inline-flex items-center justify-center gap-1.5 transition-colors cursor-pointer whitespace-nowrap shrink-0"
            >
              <Send className="w-3.5 h-3.5 shrink-0" strokeWidth={1.75} />
              <span>リクエストを送信</span>
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
