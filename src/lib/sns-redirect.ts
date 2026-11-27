export const SNS_GO_DESTINATION_ENV = 'SNS_GO_DESTINATION';
export const DEFAULT_SNS_GO_DESTINATION = '/coach-recruit';

export const DEFAULT_UTM_SOURCE = 'sns';
export const DEFAULT_UTM_MEDIUM = 'sns_profile';
export const DEFAULT_UTM_CAMPAIGN = 'coach_recruit';

const SAFE_SOURCE_PATTERN = /^[a-z0-9_-]{1,64}$/;

/**
 * 環境変数 SNS_GO_DESTINATION から遷移先 URL を解決する。
 * 未設定・空文字・不正なスキームの場合は初期値 (/coach-recruit) にフォールバックする。
 */
export function resolveDestinationUrl(
  destinationEnv: string | undefined,
  requestOrigin: string
): URL {
  const trimmed = destinationEnv?.trim();
  if (!trimmed) {
    return new URL(DEFAULT_SNS_GO_DESTINATION, requestOrigin);
  }

  // アプリ内相対パス（プロトコル相対 "//..." は除外）
  if (trimmed.startsWith('/') && !trimmed.startsWith('//')) {
    try {
      return new URL(trimmed, requestOrigin);
    } catch {
      return new URL(DEFAULT_SNS_GO_DESTINATION, requestOrigin);
    }
  }

  // 絶対 URL（http / https のみ許可）
  try {
    const parsed = new URL(trimmed);
    if (parsed.protocol === 'http:' || parsed.protocol === 'https:') {
      return parsed;
    }
  } catch {
    // 無効な URL は初期値へフォールバック
  }

  return new URL(DEFAULT_SNS_GO_DESTINATION, requestOrigin);
}

/**
 * クエリパラメータ ?src=... を utm_source 値へ正規化する。
 * 未指定・空文字・許可文字外の場合はデフォルト値 "sns" を返す。
 */
export function resolveUtmSourceFromSrc(rawSrc: string | null): string {
  const normalized = rawSrc?.trim().toLowerCase() ?? '';
  if (SAFE_SOURCE_PATTERN.test(normalized)) {
    return normalized;
  }
  return DEFAULT_UTM_SOURCE;
}

/**
 * /go/sns の最終リダイレクト先 URL を組み立てる。
 * - 遷移先は destination（未指定時は /coach-recruit）を使用
 * - 既存の utm_* がリクエストまたは遷移先に含まれる場合はそちらを優先し二重付与しない
 * - 未設定の utm_source / utm_medium / utm_campaign にデフォルト値を付与する
 */
export function buildSnsRedirectUrl(options: {
  requestUrl: URL;
  destination?: string;
}): URL {
  const targetUrl = resolveDestinationUrl(
    options.destination,
    options.requestUrl.origin
  );

  // 遷移先 URL に既存の utm_* が含まれる場合、キーを小文字に統一して重複を防止
  const existingTargetUtms = new Map<string, string>();
  const targetKeysToDelete: string[] = [];
  for (const [key, value] of targetUrl.searchParams.entries()) {
    if (key.toLowerCase().startsWith('utm_')) {
      const normalizedKey = key.toLowerCase();
      const trimmedValue = value.trim();
      targetKeysToDelete.push(key);
      if (trimmedValue && !existingTargetUtms.has(normalizedKey)) {
        existingTargetUtms.set(normalizedKey, trimmedValue);
      }
    }
  }
  for (const key of targetKeysToDelete) {
    targetUrl.searchParams.delete(key);
  }
  for (const [key, value] of existingTargetUtms.entries()) {
    targetUrl.searchParams.set(key, value);
  }

  // リクエスト側のクエリパラメータを反映（src 自体は遷移先に残さない）
  const seenRequestUtms = new Set<string>();
  for (const [key, value] of options.requestUrl.searchParams.entries()) {
    const lowerKey = key.toLowerCase();
    if (lowerKey === 'src') {
      continue;
    }

    if (lowerKey.startsWith('utm_')) {
      const trimmedValue = value.trim();
      if (trimmedValue && !seenRequestUtms.has(lowerKey)) {
        seenRequestUtms.add(lowerKey);
        targetUrl.searchParams.set(lowerKey, trimmedValue);
      }
      continue;
    }

    if (!targetUrl.searchParams.has(key)) {
      targetUrl.searchParams.set(key, value);
    }
  }

  // 未設定の必須 UTM パラメータにデフォルト値を付与
  const resolvedSource = resolveUtmSourceFromSrc(
    options.requestUrl.searchParams.get('src')
  );

  if (!targetUrl.searchParams.get('utm_source')?.trim()) {
    targetUrl.searchParams.set('utm_source', resolvedSource);
  }
  if (!targetUrl.searchParams.get('utm_medium')?.trim()) {
    targetUrl.searchParams.set('utm_medium', DEFAULT_UTM_MEDIUM);
  }
  if (!targetUrl.searchParams.get('utm_campaign')?.trim()) {
    targetUrl.searchParams.set('utm_campaign', DEFAULT_UTM_CAMPAIGN);
  }

  return targetUrl;
}
