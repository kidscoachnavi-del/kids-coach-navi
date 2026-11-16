// 保護者の「希望種目・エリア」リクエスト（需要データ収集・分析）ストア

export interface DemandRequest {
  id: string;
  sportName: string;
  areaName: string;
  note?: string;
  contactEmail?: string;
  createdAt: string;
}

const DEMAND_STORAGE_KEY = 'kcn_demand_requests_v1';

/** 初期デモ用の需要データ（テスト顧客は会員番号0035・テスト太郎のみ使用） */
export const INITIAL_DEMAND_REQUESTS: DemandRequest[] = [
  {
    id: 'dem-1',
    sportName: '跳び箱・マット運動',
    areaName: '世田谷区',
    note: '体育の授業前に5段を跳べるようになりたい',
    contactEmail: 'test_taro@wellne.example.com',
    createdAt: '2026-11-12T10:00:00+09:00',
  },
  {
    id: 'dem-2',
    sportName: '跳び箱・マット運動',
    areaName: '世田谷区',
    note: '単発60分で開脚跳びのコツを教えてほしい',
    createdAt: '2026-11-13T15:30:00+09:00',
  },
  {
    id: 'dem-3',
    sportName: '自転車（補助輪外し）',
    areaName: '目黒区',
    note: '公園で1時間だけ補助輪なし練習を見てもらいたい',
    createdAt: '2026-11-14T09:15:00+09:00',
  },
  {
    id: 'dem-4',
    sportName: 'なわとび・二重跳び',
    areaName: '渋谷区',
    note: '冬の体力測定に向けて二重跳びを習得したい',
    createdAt: '2026-11-15T14:20:00+09:00',
  },
];

/** 保存済みの需要リクエスト一覧を取得する（初期値＋ブラウザ保存分） */
export function loadDemandRequests(): DemandRequest[] {
  if (typeof window === 'undefined') return INITIAL_DEMAND_REQUESTS;
  try {
    const raw = localStorage.getItem(DEMAND_STORAGE_KEY);
    if (!raw) return INITIAL_DEMAND_REQUESTS;
    const saved = JSON.parse(raw) as DemandRequest[];
    if (!Array.isArray(saved)) return INITIAL_DEMAND_REQUESTS;
    return [...saved, ...INITIAL_DEMAND_REQUESTS];
  } catch {
    return INITIAL_DEMAND_REQUESTS;
  }
}

/** 新しい需要リクエストをブラウザに保存する */
export function saveDemandRequest(
  input: Omit<DemandRequest, 'id' | 'createdAt'>
): DemandRequest {
  const created: DemandRequest = {
    ...input,
    id: `dem-${Date.now()}`,
    createdAt: new Date().toISOString(),
  };

  if (typeof window !== 'undefined') {
    try {
      const raw = localStorage.getItem(DEMAND_STORAGE_KEY);
      const current = raw ? (JSON.parse(raw) as DemandRequest[]) : [];
      const next = Array.isArray(current) ? [created, ...current] : [created];
      localStorage.setItem(DEMAND_STORAGE_KEY, JSON.stringify(next));
    } catch {
      // ストレージ無効環境は無視
    }
  }
  return created;
}

/** 需要リクエストを「種目 × エリア」単位で件数集計してランキング順に返す */
export function aggregateDemandTrends(requests: DemandRequest[]): Array<{
  key: string;
  sportName: string;
  areaName: string;
  count: number;
  latestNote?: string;
}> {
  const map = new Map<
    string,
    { sportName: string; areaName: string; count: number; latestNote?: string }
  >();

  requests.forEach((req) => {
    const sport = req.sportName.trim();
    const area = req.areaName.trim();
    if (!sport || !area) return;
    const key = `${area}__${sport}`;
    const existing = map.get(key);
    if (existing) {
      existing.count += 1;
      if (!existing.latestNote && req.note) {
        existing.latestNote = req.note;
      }
    } else {
      map.set(key, {
        sportName: sport,
        areaName: area,
        count: 1,
        latestNote: req.note,
      });
    }
  });

  return Array.from(map.entries())
    .map(([key, val]) => ({ key, ...val }))
    .sort((a, b) => b.count - a.count);
}
