'use client';

import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { Send, CheckCircle2, Loader2, HelpCircle, ShieldCheck, ChevronDown, Check } from 'lucide-react';

const INQUIRY_CATEGORIES = [
  'レッスン・予約に関するご質問',
  'キャンセル・返金・振替について',
  'その他のお問い合わせ',
] as const;

/**
 * キッズコーチナビ お問い合わせフォーム（クライアントコンポーネント）
 */
export default function ContactFormClient() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [category, setCategory] = useState<string>(INQUIRY_CATEGORIES[0]);
  const [isCategoryOpen, setIsCategoryOpen] = useState(false);
  const categoryRef = useRef<HTMLDivElement | null>(null);
  const [message, setMessage] = useState('');
  const [agreedPrivacy, setAgreedPrivacy] = useState(false);

  useEffect(() => {
    const handleOutsideClick = (event: MouseEvent) => {
      if (categoryRef.current && !categoryRef.current.contains(event.target as Node)) {
        setIsCategoryOpen(false);
      }
    };
    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, []);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [submittedResult, setSubmittedResult] = useState<{
    inquiryId: string;
    name: string;
    email: string;
    category: string;
  } | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!agreedPrivacy || isSubmitting) return;

    setIsSubmitting(true);
    setErrorMessage(null);

    try {
      const res = await fetch('/api/kcn/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, category, message }),
      });
      const data = await res.json();

      if (!res.ok || !data?.ok) {
        setErrorMessage(data?.error || '送信に失敗しました。入力内容をご確認ください。');
        return;
      }

      setSubmittedResult({
        inquiryId: data.inquiryId,
        name,
        email,
        category,
      });
    } catch {
      setErrorMessage('通信エラーが発生しました。時間をおいて再度お試しください。');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (submittedResult) {
    return (
      <div className="bg-[#FDFBF7] rounded-2xl border border-[#EADBCC] p-6 sm:p-8 text-center space-y-4">
        <div className="w-12 h-12 rounded-full bg-[#D2E7DF] text-[#3E8E84] flex items-center justify-center mx-auto">
          <CheckCircle2 className="w-6 h-6" strokeWidth={2} />
        </div>
        <div className="space-y-1.5">
          <p className="text-[11px] font-bold text-[#3E8E84] tracking-wider uppercase font-en">
            INQUIRY RECEIVED
          </p>
          <h2 className="font-heading text-lg sm:text-xl font-bold text-[#2C2B29]">
            お問い合わせを受け付けました
          </h2>
          <p className="text-xs text-[#5E5B54] leading-relaxed">
            受付番号：<span className="font-en font-bold text-[#2C2B29]">{submittedResult.inquiryId}</span>
            <br />
            ご入力いただいたメールアドレス（{submittedResult.email}）宛に、運営事務局（SWIM PARTNERS）より順次ご返信いたします。
          </p>
        </div>

        <div className="pt-2 flex flex-wrap justify-center gap-3">
          <button
            type="button"
            onClick={() => {
              setSubmittedResult(null);
              setMessage('');
            }}
            className="px-4 py-2 rounded-full border border-[#EADBCC] bg-white text-xs font-bold text-[#2C2B29] hover:border-[#3E8E84] transition-colors cursor-pointer"
          >
            続けて別の問い合わせを送る
          </button>
          <Link
            href="/"
            className="px-5 py-2 rounded-full bg-[#E3644F] hover:bg-[#d05540] text-white text-xs font-bold transition-colors"
          >
            トップページへ戻る
          </Link>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4 text-xs sm:text-sm">
      {errorMessage && (
        <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-bold">
          {errorMessage}
        </div>
      )}

      <div>
        <label htmlFor="contact-name" className="block font-bold text-[#2C2B29] mb-1.5 text-xs">
          お名前（保護者様等） <span className="text-[#E3644F]">*</span>
        </label>
        <input
          id="contact-name"
          type="text"
          required
          placeholder="例: テスト太郎"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full h-11 px-3.5 rounded-xl border border-[#EADBCC] bg-[#FDFBF7] text-xs font-bold text-[#2C2B29] focus:outline-none focus:border-[#E3644F] focus:bg-white"
        />
      </div>

      <div>
        <label htmlFor="contact-email" className="block font-bold text-[#2C2B29] mb-1.5 text-xs">
          ご返信用メールアドレス <span className="text-[#E3644F]">*</span>
        </label>
        <input
          id="contact-email"
          type="email"
          required
          placeholder="example@email.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full h-11 px-3.5 rounded-xl border border-[#EADBCC] bg-[#FDFBF7] text-xs font-bold text-[#2C2B29] focus:outline-none focus:border-[#E3644F] focus:bg-white"
        />
      </div>

      <div ref={categoryRef} className="relative">
        <label htmlFor="contact-category" className="block font-bold text-[#2C2B29] mb-1.5 text-xs">
          お問い合わせ種別 <span className="text-[#E3644F]">*</span>
        </label>
        <button
          id="contact-category"
          type="button"
          aria-haspopup="listbox"
          aria-expanded={isCategoryOpen}
          onClick={() => setIsCategoryOpen((prev) => !prev)}
          className="w-full h-11 px-3.5 rounded-xl border border-[#EADBCC] bg-[#FDFBF7] text-xs font-bold text-[#2C2B29] flex items-center justify-between gap-2 cursor-pointer focus:outline-none focus:border-[#E3644F] focus:bg-white"
        >
          <span className="truncate">{category}</span>
          <ChevronDown
            className={`w-4 h-4 text-[#5E5B54] shrink-0 transition-transform ${
              isCategoryOpen ? 'rotate-180' : ''
            }`}
            strokeWidth={1.75}
          />
        </button>

        {isCategoryOpen && (
          <ul
            role="listbox"
            aria-labelledby="contact-category"
            className="absolute z-20 mt-1.5 w-full rounded-xl border border-[#EADBCC] bg-white shadow-lg py-1 overflow-hidden"
          >
            {INQUIRY_CATEGORIES.map((item) => {
              const selected = item === category;
              return (
                <li key={item} role="option" aria-selected={selected}>
                  <button
                    type="button"
                    onClick={() => {
                      setCategory(item);
                      setIsCategoryOpen(false);
                    }}
                    className={`w-full px-3.5 py-2.5 text-left text-xs font-bold flex items-center justify-between gap-2 cursor-pointer transition-colors ${
                      selected
                        ? 'bg-[#FDFBF7] text-[#E3644F]'
                        : 'text-[#2C2B29] hover:bg-[#FDFBF7]'
                    }`}
                  >
                    <span>{item}</span>
                    {selected && <Check className="w-3.5 h-3.5 text-[#E3644F] shrink-0" strokeWidth={2} />}
                  </button>
                </li>
              );
            })}
          </ul>
        )}
      </div>

      <div>
        <label htmlFor="contact-message" className="block font-bold text-[#2C2B29] mb-1.5 text-xs">
          お問い合わせ内容 <span className="text-[#E3644F]">*</span>
        </label>
        <textarea
          id="contact-message"
          rows={5}
          required
          placeholder="ご質問内容や確認したい事項をご記入ください。"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          className="w-full p-3.5 rounded-xl border border-[#EADBCC] bg-[#FDFBF7] text-xs font-bold text-[#2C2B29] leading-relaxed focus:outline-none focus:border-[#E3644F] focus:bg-white"
        />
      </div>

      <div className="p-3.5 rounded-2xl border border-[#EADBCC] bg-[#FDFBF7]">
        <label className="flex items-start gap-2.5 cursor-pointer select-none">
          <input
            type="checkbox"
            required
            checked={agreedPrivacy}
            onChange={(e) => setAgreedPrivacy(e.target.checked)}
            className="mt-0.5 rounded border-[#EADBCC] text-[#E3644F] focus:ring-[#E3644F]"
          />
          <span className="text-[11px] text-[#2C2B29] leading-relaxed">
            <Link
              href="/privacy"
              target="_blank"
              rel="noopener noreferrer"
              className="font-bold text-[#3E8E84] underline hover:text-[#2f7169]"
            >
              プライバシーポリシー
            </Link>
            に同意の上、問い合わせ内容を送信します <span className="text-[#E3644F] font-bold">*</span>
          </span>
        </label>
      </div>

      <button
        type="submit"
        disabled={!agreedPrivacy || isSubmitting}
        className="w-full h-12 rounded-full bg-[#E3644F] hover:bg-[#d05540] text-white font-bold text-xs sm:text-sm flex items-center justify-center gap-2 transition-colors shadow-sm cursor-pointer disabled:opacity-45 disabled:cursor-not-allowed"
      >
        {isSubmitting ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin" strokeWidth={1.75} />
            <span>送信中...</span>
          </>
        ) : (
          <>
            <Send className="w-4 h-4" strokeWidth={1.75} />
            <span>お問い合わせを送信する</span>
          </>
        )}
      </button>

      <div className="pt-2 flex flex-wrap items-center justify-between gap-2 text-[11px] text-[#5E5B54]">
        <span className="inline-flex items-center gap-1.5">
          <ShieldCheck className="w-3.5 h-3.5 text-[#3E8E84]" strokeWidth={1.75} />
          <span>通常1〜2営業日以内にご返信いたします</span>
        </span>
        <Link
          href="/faq"
          className="inline-flex items-center gap-1 font-bold text-[#3E8E84] hover:underline"
        >
          <HelpCircle className="w-3.5 h-3.5" strokeWidth={1.75} />
          <span>よくある質問も確認する</span>
        </Link>
      </div>
    </form>
  );
}
