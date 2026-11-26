'use client';

import React, { useState, useMemo } from 'react';
import { Coach, AvailableSlot, getTodayJstYmd } from '@/data/kids-coach-mock';
import {
  Clock,
  ChevronLeft,
  ChevronRight,
  CalendarDays,
  List,
} from 'lucide-react';
import BookingModal from './BookingModal';

interface BookingCalendarSectionProps {
  coach: Coach;
  initialSlots?: AvailableSlot[];
}

type CalendarViewMode = 'list' | 'month';

const WEEKDAY_HEADERS = ['日', '月', '火', '水', '木', '金', '土'] as const;

const DURATION_OPTIONS = [
  { minutes: 60, label: '60分', badge: '標準' },
  { minutes: 90, label: '90分', badge: 'じっくり' },
  { minutes: 120, label: '120分', badge: '集中' },
] as const;

/** HH:MM 形式の時刻に指定分数を加算した HH:MM 文字列を返す */
function addMinutesToTime(timeStr: string, minutesToAdd: number): string {
  const [h, m] = timeStr.split(':').map(Number);
  if (Number.isNaN(h) || Number.isNaN(m)) return timeStr;
  const total = h * 60 + m + minutesToAdd;
  const nextH = Math.floor(total / 60) % 24;
  const nextM = total % 60;
  return `${String(nextH).padStart(2, '0')}:${String(nextM).padStart(2, '0')}`;
}

/** 選択されたコマ時間に応じたレッスン料金（税込）を算出する */
function calcLessonPrice(
  baseRate: number,
  baseMinutes: number,
  selectedMinutes: number
): number {
  const denom = baseMinutes > 0 ? baseMinutes : 60;
  return Math.round((baseRate * selectedMinutes) / denom);
}

/** YYYY-MM-DD を数値の年月日に分解する（タイムゾーン差を回避） */
function parseYmd(dateStr: string): { year: number; month: number; day: number } {
  const [y, m, d] = dateStr.split('-').map(Number);
  return { year: y, month: m, day: d };
}

/** YYYY-MM-DD 文字列を生成する */
function formatYmd(year: number, month: number, day: number): string {
  return `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
}

export default function BookingCalendarSection({
  coach,
  initialSlots,
}: BookingCalendarSectionProps) {
  // DBから取得した今日以降の実スロットのみを使用（モック生成は行わない）
  const allSlots = useMemo(() => {
    const todayYmd = getTodayJstYmd();
    return (initialSlots || []).filter((s) => s.date >= todayYmd);
  }, [initialSlots]);

  // 日付ごとのサマリー情報をマップ化
  const dateSummaryMap = useMemo(() => {
    const map = new Map<
      string,
      { date: string; dayOfWeek: string; count: number }
    >();
    allSlots.forEach((slot) => {
      const existing = map.get(slot.date);
      if (!existing) {
        map.set(slot.date, {
          date: slot.date,
          dayOfWeek: slot.dayOfWeek,
          count: slot.status === 'available' ? 1 : 0,
        });
      } else if (slot.status === 'available') {
        existing.count++;
      }
    });
    return map;
  }, [allSlots]);

  // 横スクロールリスト用の直近14日間
  const listDates = useMemo(
    () => Array.from(dateSummaryMap.values()).slice(0, 14),
    [dateSummaryMap]
  );

  // 最短空き日の取得
  const firstAvailableDate = useMemo(() => {
    const found = Array.from(dateSummaryMap.values()).find((d) => d.count > 0);
    return found?.date || listDates[0]?.date || '';
  }, [dateSummaryMap, listDates]);

  // 表示モード（横並び14日リスト / 月カレンダー）
  const [viewMode, setViewMode] = useState<CalendarViewMode>('list');

  // 選択中の日付
  const [selectedDate, setSelectedDate] = useState<string>(firstAvailableDate);

  // 選択中の1コマ受講時間（分）
  const [selectedDuration, setSelectedDuration] = useState<number>(
    coach.durationMinutes || 60
  );

  // 選択時間に合わせたレッスン料金（税込・交通費込）
  const calculatedPrice = useMemo(
    () => calcLessonPrice(coach.hourlyRate, coach.durationMinutes, selectedDuration),
    [coach.hourlyRate, coach.durationMinutes, selectedDuration]
  );

  // 月カレンダーで表示中の年月（初期値は最初の予約可能月）
  const initialYm = useMemo(() => {
    if (!firstAvailableDate) return { year: 2026, month: 11 };
    const { year, month } = parseYmd(firstAvailableDate);
    return { year, month };
  }, [firstAvailableDate]);

  const [displayYearMonth, setDisplayYearMonth] = useState<{
    year: number;
    month: number;
  }>(initialYm);

  // 選択されたスロット（予約モーダル用）
  const [selectedSlotForBooking, setSelectedSlotForBooking] =
    useState<AvailableSlot | null>(null);

  // 選択中の日付のスロット
  const currentSlots = useMemo(() => {
    return allSlots.filter((s) => s.date === selectedDate);
  }, [allSlots, selectedDate]);

  // スロットが存在する月の最小・最大（月送り範囲制御用）
  const availableMonths = useMemo(() => {
    const keys = Array.from(
      new Set(allSlots.map((s) => s.date.slice(0, 7)))
    ).sort();
    return keys;
  }, [allSlots]);

  const currentYmKey = `${displayYearMonth.year}-${String(displayYearMonth.month).padStart(2, '0')}`;
  const currentMonthIdx = availableMonths.indexOf(currentYmKey);
  const canPrevMonth = currentMonthIdx > 0;
  const canNextMonth =
    currentMonthIdx !== -1 && currentMonthIdx < availableMonths.length - 1;

  // 月変更時に、その月の最初の空き枠日付へ自動選択を切り替える
  const handleChangeMonth = (offset: -1 | 1) => {
    const targetIdx = currentMonthIdx + offset;
    if (targetIdx < 0 || targetIdx >= availableMonths.length) return;
    const [nextY, nextM] = availableMonths[targetIdx].split('-').map(Number);
    setDisplayYearMonth({ year: nextY, month: nextM });

    const prefix = availableMonths[targetIdx];
    const firstInMonth = Array.from(dateSummaryMap.values()).find(
      (d) => d.date.startsWith(prefix) && d.count > 0
    );
    if (firstInMonth) {
      setSelectedDate(firstInMonth.date);
    }
  };

  // 月カレンダーのセル配列を生成（前月分の空白セル + 当月1日〜末日）
  const calendarCells = useMemo(() => {
    const { year, month } = displayYearMonth;
    const firstDayWeekday = new Date(Date.UTC(year, month - 1, 1)).getUTCDay();
    const daysInMonth = new Date(Date.UTC(year, month, 0)).getUTCDate();

    const cells: Array<
      | { type: 'empty'; key: string }
      | {
          type: 'day';
          key: string;
          day: number;
          dateStr: string;
          weekday: number;
          availableCount: number;
          hasSlots: boolean;
        }
    > = [];

    for (let i = 0; i < firstDayWeekday; i++) {
      cells.push({ type: 'empty', key: `empty-${i}` });
    }
    for (let day = 1; day <= daysInMonth; day++) {
      const dateStr = formatYmd(year, month, day);
      const summary = dateSummaryMap.get(dateStr);
      const weekday = new Date(Date.UTC(year, month - 1, day)).getUTCDay();
      cells.push({
        type: 'day',
        key: dateStr,
        day,
        dateStr,
        weekday,
        availableCount: summary?.count || 0,
        hasSlots: Boolean(summary),
      });
    }
    return cells;
  }, [displayYearMonth, dateSummaryMap]);

  return (
    <section className="bg-white rounded-3xl border border-[#EADBCC] p-6 sm:p-8 shadow-xs">
      {/* 見出し */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
        <div>
          <span className="font-en text-[10px] font-bold text-[#3E8E84] uppercase tracking-widest block mb-1">
            SCHEDULE &amp; BOOKING
          </span>
          <h2 className="font-heading text-xl sm:text-2xl font-bold text-[#2C2B29] tracking-tight">
            空き日程カレンダー
          </h2>
          <p className="text-xs text-[#5E5B54] mt-0.5">
            ご希望の日付と時間帯を選ぶと、コーチへの相談・お申し込み入力へ進めます。
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs font-bold text-[#2C2B29] bg-[#FDFBF7] px-3.5 py-2 rounded-full border border-[#EADBCC] self-start sm:self-auto whitespace-nowrap">
          <span>空き枠を選択して相談・予約へ</span>
        </div>
      </div>

      {/* 日付選択（リスト / 月カレンダー切替対応） */}
      <div className="mb-6">
        <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
          <label className="text-xs font-bold text-[#2C2B29]">
            STEP 1. 受講希望日を選択
          </label>

          {/* 表示形式切替スイッチ */}
          <div
            role="tablist"
            aria-label="カレンダー表示形式"
            className="inline-flex items-center bg-[#FDFBF7] p-1 rounded-full border border-[#EADBCC]"
          >
            <button
              type="button"
              role="tab"
              aria-selected={viewMode === 'list'}
              onClick={() => setViewMode('list')}
              className={`px-3 py-1 rounded-full text-[11px] font-bold inline-flex items-center gap-1.5 transition-colors cursor-pointer whitespace-nowrap ${
                viewMode === 'list'
                  ? 'bg-[#2C2B29] text-white'
                  : 'text-[#5E5B54] hover:text-[#2C2B29]'
              }`}
            >
              <List className="w-3.5 h-3.5 shrink-0" strokeWidth={1.75} />
              <span>直近14日</span>
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={viewMode === 'month'}
              onClick={() => setViewMode('month')}
              className={`px-3 py-1 rounded-full text-[11px] font-bold inline-flex items-center gap-1.5 transition-colors cursor-pointer whitespace-nowrap ${
                viewMode === 'month'
                  ? 'bg-[#2C2B29] text-white'
                  : 'text-[#5E5B54] hover:text-[#2C2B29]'
              }`}
            >
              <CalendarDays className="w-3.5 h-3.5 shrink-0" strokeWidth={1.75} />
              <span>月カレンダー</span>
            </button>
          </div>
        </div>

        {viewMode === 'list' ? (
          <div>
            <div className="flex items-center justify-end mb-1">
              <span className="text-[11px] text-[#5E5B54]">
                横スクロールで14日間を表示
              </span>
            </div>
            <div className="flex items-center gap-2 overflow-x-auto pb-3 pt-2 scrollbar-none -mx-1 px-1">
              {listDates.map((item, index) => {
                const isSelected = item.date === selectedDate;
                const isWeekend = item.dayOfWeek === '土' || item.dayOfWeek === '日';
                const { month, day: dateNum } = parseYmd(item.date);

                return (
                  <button
                    key={item.date}
                    type="button"
                    onClick={() => setSelectedDate(item.date)}
                    className={`relative flex flex-col items-center justify-center min-w-[76px] py-2.5 px-2 rounded-2xl border transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-[#2C2B29] text-white border-[#2C2B29] shadow-xs'
                        : 'bg-[#FDFBF7] border-[#EADBCC] hover:border-[#E3644F] text-[#2C2B29]'
                    }`}
                  >
                    {index === 0 && (
                      <span
                        className={`absolute -top-2 left-1/2 -translate-x-1/2 text-[9px] font-bold px-2 py-0.5 rounded-full whitespace-nowrap ${
                          isSelected
                            ? 'bg-[#E3644F] text-white'
                            : 'bg-[#FCE7A2] text-[#2C2B29] border border-[#2C2B29]/20'
                        }`}
                      >
                        最短
                      </span>
                    )}

                    <span
                      className={`text-[10px] font-bold ${
                        isSelected
                          ? 'text-white/80'
                          : isWeekend
                          ? 'text-[#E3644F]'
                          : 'text-[#5E5B54]'
                      }`}
                    >
                      {month}/{dateNum} ({item.dayOfWeek})
                    </span>

                    <span className="font-en text-base font-extrabold my-0.5">
                      {dateNum}日
                    </span>

                    <span
                      className={`text-[9px] font-bold px-2 py-0.5 rounded-full ${
                        isSelected
                          ? 'bg-[#F7D668] text-[#2C2B29]'
                          : item.count > 0
                          ? 'bg-[#3E8E84]/10 text-[#3E8E84]'
                          : 'bg-gray-100 text-gray-400'
                      }`}
                    >
                      {item.count > 0 ? `空き ${item.count}` : '満枠'}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        ) : (
          /* 月カレンダーグリッド表示 */
          <div className="bg-[#FDFBF7] rounded-2xl border border-[#EADBCC] p-3.5 sm:p-5 space-y-3">
            {/* 月送りヘッダー */}
            <div className="flex items-center justify-between gap-2">
              <button
                type="button"
                disabled={!canPrevMonth}
                onClick={() => handleChangeMonth(-1)}
                aria-label="前の月へ"
                className="w-8 h-8 rounded-full bg-white border border-[#EADBCC] flex items-center justify-center text-[#2C2B29] hover:border-[#E3644F] disabled:opacity-35 disabled:cursor-not-allowed transition-colors cursor-pointer"
              >
                <ChevronLeft className="w-4 h-4" strokeWidth={2} />
              </button>

              <div className="font-heading text-sm sm:text-base font-bold text-[#2C2B29]">
                <span className="font-en">{displayYearMonth.year}</span>年{' '}
                <span className="font-en">{displayYearMonth.month}</span>月
              </div>

              <button
                type="button"
                disabled={!canNextMonth}
                onClick={() => handleChangeMonth(1)}
                aria-label="次の月へ"
                className="w-8 h-8 rounded-full bg-white border border-[#EADBCC] flex items-center justify-center text-[#2C2B29] hover:border-[#E3644F] disabled:opacity-35 disabled:cursor-not-allowed transition-colors cursor-pointer"
              >
                <ChevronRight className="w-4 h-4" strokeWidth={2} />
              </button>
            </div>

            {/* 曜日ヘッダー */}
            <div className="grid grid-cols-7 gap-1 sm:gap-1.5 text-center text-[10px] sm:text-xs font-bold pb-1 border-b border-[#EADBCC]/60">
              {WEEKDAY_HEADERS.map((label, idx) => (
                <div
                  key={label}
                  className={
                    idx === 0
                      ? 'text-[#E3644F]'
                      : idx === 6
                      ? 'text-[#3E8E84]'
                      : 'text-[#5E5B54]'
                  }
                >
                  {label}
                </div>
              ))}
            </div>

            {/* 日付グリッド */}
            <div className="grid grid-cols-7 gap-1 sm:gap-1.5">
              {calendarCells.map((cell) => {
                if (cell.type === 'empty') {
                  return <div key={cell.key} className="h-14 sm:h-16" />;
                }

                const isSelected = cell.dateStr === selectedDate;
                const isFirstAvail = cell.dateStr === firstAvailableDate;
                const isClickable = cell.hasSlots && cell.availableCount > 0;

                return (
                  <button
                    key={cell.key}
                    type="button"
                    disabled={!cell.hasSlots}
                    onClick={() => setSelectedDate(cell.dateStr)}
                    className={`relative h-14 sm:h-16 rounded-xl border flex flex-col items-center justify-center gap-0.5 px-0.5 transition-all ${
                      isSelected
                        ? 'bg-[#2C2B29] text-white border-[#2C2B29] shadow-xs cursor-pointer'
                        : isClickable
                        ? 'bg-white border-[#EADBCC] hover:border-[#E3644F] text-[#2C2B29] cursor-pointer'
                        : cell.hasSlots
                        ? 'bg-white/60 border-[#EADBCC]/60 text-[#8A857B] cursor-pointer'
                        : 'bg-transparent border-transparent text-[#8A857B]/45 cursor-default'
                    }`}
                  >
                    {isFirstAvail && (
                      <span
                        className={`hidden sm:inline-block absolute -top-1.5 right-1 text-[8px] font-bold px-1.5 rounded-full ${
                          isSelected
                            ? 'bg-[#E3644F] text-white'
                            : 'bg-[#FCE7A2] text-[#2C2B29] border border-[#2C2B29]/15'
                        }`}
                      >
                        最短
                      </span>
                    )}

                    <span
                      className={`font-en text-xs sm:text-sm font-extrabold leading-none ${
                        isSelected
                          ? 'text-white'
                          : !cell.hasSlots
                          ? 'text-[#8A857B]/50'
                          : cell.weekday === 0
                          ? 'text-[#E3644F]'
                          : cell.weekday === 6
                          ? 'text-[#3E8E84]'
                          : 'text-[#2C2B29]'
                      }`}
                    >
                      {cell.day}
                    </span>

                    {cell.hasSlots ? (
                      <span
                        className={`text-[9px] sm:text-[10px] font-bold px-1.5 py-0.5 rounded-full leading-none whitespace-nowrap ${
                          isSelected
                            ? 'bg-[#F7D668] text-[#2C2B29]'
                            : cell.availableCount > 0
                            ? 'bg-[#D2E7DF]/65 text-[#2C6B63]'
                            : 'bg-gray-100 text-gray-400'
                        }`}
                      >
                        {cell.availableCount > 0 ? (
                          <>
                            <span className="sm:hidden">○{cell.availableCount}</span>
                            <span className="hidden sm:inline">空き {cell.availableCount}</span>
                          </>
                        ) : (
                          '満枠'
                        )}
                      </span>
                    ) : (
                      <span className="text-[9px] text-[#8A857B]/40 leading-none">-</span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* STEP 2. 1コマの受講時間を選択 */}
      <div className="border-t border-[#EADBCC] pt-5 mb-6">
        <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
          <label className="text-xs font-bold text-[#2C2B29]">
            STEP 2. 1コマの時間を選択
          </label>
          <span className="text-[11px] font-bold text-[#3E8E84]">
            選択中: {selectedDuration}分（￥{calculatedPrice.toLocaleString()}・税込）
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
          {DURATION_OPTIONS.map((opt) => {
            const active = selectedDuration === opt.minutes;
            const optPrice = calcLessonPrice(
              coach.hourlyRate,
              coach.durationMinutes,
              opt.minutes
            );
            return (
              <button
                key={opt.minutes}
                type="button"
                onClick={() => setSelectedDuration(opt.minutes)}
                className={`px-4 py-3 sm:p-3.5 rounded-2xl border text-left transition-all cursor-pointer flex sm:flex-col items-center sm:items-stretch justify-between gap-2 ${
                  active
                    ? 'bg-[#2C2B29] text-white border-[#2C2B29] shadow-xs'
                    : 'bg-[#FDFBF7] border-[#EADBCC] hover:border-[#E3644F] text-[#2C2B29]'
                }`}
              >
                <div className="flex items-center sm:justify-between gap-2">
                  <span className="font-heading text-base font-extrabold whitespace-nowrap">
                    {opt.label}
                  </span>
                  <span
                    className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full whitespace-nowrap ${
                      active
                        ? 'bg-[#F7D668] text-[#2C2B29]'
                        : 'bg-white text-[#5E5B54] border border-[#EADBCC]'
                    }`}
                  >
                    {opt.badge}
                  </span>
                </div>
                <span
                  className={`font-en text-base sm:text-sm font-extrabold whitespace-nowrap ${
                    active ? 'text-white' : 'text-[#2C2B29]'
                  }`}
                >
                  ￥{optPrice.toLocaleString()}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* STEP 3. スロット選択 */}
      <div className="border-t border-[#EADBCC] pt-5">
        <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
          <label className="text-xs font-bold text-[#2C2B29]">
            STEP 3. 時間帯枠を選択（1コマ{selectedDuration}分）
          </label>
          <span className="text-xs text-[#5E5B54] font-bold">
            選択日: <strong className="text-[#2C2B29] font-en">{selectedDate}</strong>
          </span>
        </div>

        {currentSlots.length > 0 ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
            {currentSlots.map((slot) => {
              const isAvailable = slot.status === 'available';
              const computedEndTime = addMinutesToTime(
                slot.startTime,
                selectedDuration
              );
              const computedSlot: AvailableSlot = {
                ...slot,
                endTime: computedEndTime,
              };

              return (
                <div
                  key={slot.id}
                  className={`p-3.5 sm:p-4 rounded-2xl border transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                    isAvailable
                      ? 'bg-[#FDFBF7] border-[#EADBCC] hover:border-[#E3644F] hover:bg-white hover:shadow-xs group cursor-pointer'
                      : 'bg-gray-50 border-[#EADBCC] opacity-50'
                  }`}
                  onClick={() => {
                    if (isAvailable) setSelectedSlotForBooking(computedSlot);
                  }}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div
                      className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                        isAvailable
                          ? 'bg-[#FCE7A2]/80 text-[#2C2B29] group-hover:bg-[#E3644F] group-hover:text-white transition-colors'
                          : 'bg-gray-200 text-gray-400'
                      }`}
                    >
                      <Clock className="w-4 h-4" strokeWidth={1.75} />
                    </div>
                    <div className="min-w-0">
                      <div className="font-en text-sm sm:text-base font-extrabold text-[#2C2B29] group-hover:text-[#E3644F] transition-colors whitespace-nowrap">
                        {slot.startTime} - {computedEndTime}
                      </div>
                      <span className="text-[11px] text-[#5E5B54] font-bold block whitespace-nowrap">
                        {selectedDuration}分・￥{calculatedPrice.toLocaleString()}
                      </span>
                    </div>
                  </div>

                  <div className="shrink-0 w-full sm:w-auto">
                    {isAvailable ? (
                      <button
                        type="button"
                        className="w-full sm:w-auto py-2 px-3.5 rounded-full bg-[#E3644F] hover:bg-[#d05540] text-white font-bold text-xs inline-flex items-center justify-center gap-1 transition-colors shadow-2xs whitespace-nowrap shrink-0 cursor-pointer"
                      >
                        <span>この枠を選ぶ</span>
                        <ChevronRight className="w-3.5 h-3.5 shrink-0" strokeWidth={1.75} />
                      </button>
                    ) : (
                      <span className="inline-flex w-full sm:w-auto justify-center text-xs font-bold text-[#5E5B54] bg-[#EADBCC]/50 px-2.5 py-1 rounded-full whitespace-nowrap">
                        受付終了
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="p-8 text-center text-[#5E5B54] bg-[#FDFBF7] rounded-2xl text-xs border border-[#EADBCC]">
            この日の空き枠はありません。別の日程を選択してください。
          </div>
        )}
      </div>

      {/* 予約手続きモーダル */}
      {selectedSlotForBooking && (
        <BookingModal
          isOpen={!!selectedSlotForBooking}
          onClose={() => setSelectedSlotForBooking(null)}
          coach={coach}
          slot={selectedSlotForBooking}
          durationMinutes={selectedDuration}
          priceAmount={calculatedPrice}
        />
      )}
    </section>
  );
}
