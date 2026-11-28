import {
  AREA_LIST,
  AreaInfo,
  Coach,
  SPORT_CATEGORIES,
} from '@/data/kids-coach-mock';

const SPORT_KEYWORDS: Record<string, string[]> = {
  running: ['running', 'かけっこ', '走り', '陸上', '徒競走', '短距離', 'リレー'],
  'school-pe': [
    'school-pe',
    '学校体育',
    '体育',
    '鉄棒',
    '逆上がり',
    '跳び箱',
    'なわとび',
    '縄跳び',
    'マット',
    '体操',
  ],
  swimming: [
    'swimming',
    '水泳',
    'スイミング',
    'スイマー',
    '競泳',
    'プール',
    '泳法',
    'クロール',
    '平泳ぎ',
    '背泳ぎ',
    'バタフライ',
    '水慣れ',
    '息継ぎ',
    '完泳',
  ],
  'niche-sports': [
    'niche-sports',
    '専門',
    'ニッチ',
    '一輪車',
    'バク転',
    'ダブルダッチ',
    'フェンシング',
    'ボルダリング',
  ],
};

const SWIMMING_EVIDENCE_REGEX =
  /水泳|スイミング|スイマー|競泳|プール|泳法|クロール|平泳ぎ|背泳ぎ|バタフライ|水慣れ|息継ぎ|完泳|泳ぐ|泳げ/;

const FACILITY_NAME_REGEX =
  /(公園|スポーツセンター|体育館|運動公園|緑地|プール|広場|時計台)/;

/** 種目ラベル文字列を正規の sport_slug に変換する */
export function mapSportLabelToSlug(label: string): string | null {
  const normalized = label.trim().toLowerCase();
  if (!normalized) return null;

  for (const cat of SPORT_CATEGORIES) {
    if (cat.slug === normalized) return cat.slug;
  }
  for (const [slug, keywords] of Object.entries(SPORT_KEYWORDS)) {
    if (keywords.some((kw) => normalized.includes(kw.toLowerCase()))) {
      return slug;
    }
  }
  return null;
}

/** 種目ラベル配列を重複なしの sport_slug 配列に変換する */
export function mapSportToSlugs(sports: string[]): string[] {
  const slugs = new Set<string>();
  for (const label of sports) {
    const slug = mapSportLabelToSlug(label);
    if (slug) slugs.add(slug);
  }
  return Array.from(slugs);
}

/** 対応エリア文字列配列から都内対象区の area_slug 配列を抽出する */
export function mapAreaToSlugs(areas: string[]): string[] {
  const slugs = new Set<string>();
  for (const raw of areas) {
    const found = AREA_LIST.find(
      (area) => raw.includes(area.name) || area.slug === raw.trim()
    );
    if (found) slugs.add(found.slug);
  }
  return Array.from(slugs);
}

/** 施設・公園名を除き、区・エリア表記のみに正規化する */
export function sanitizeCoachAreas(areas: string[]): string[] {
  const cleaned = areas
    .map((a) => a.trim())
    .filter((a) => a.length > 0 && !FACILITY_NAME_REGEX.test(a));

  if (cleaned.length > 0) {
    return Array.from(new Set(cleaned));
  }

  // 施設名しか入っていなかった場合は対象区にマッピングできた区名へフォールバック
  const matchedWards = mapAreaToSlugs(areas)
    .map((slug) => AREA_LIST.find((area) => area.slug === slug)?.name)
    .filter((name): name is string => Boolean(name));

  return Array.from(new Set(matchedWards));
}

/** プロフィールやレッスン文言に水泳指導の根拠があるか判定する */
export function hasSwimmingEvidence(text: string): boolean {
  return SWIMMING_EVIDENCE_REGEX.test(text);
}

/** コーチが指定種目ページの担当として掲載妥当かを判定する */
export function isCoachEligibleForSport(
  coach: Coach,
  sportSlug: string
): boolean {
  const published = coach.publishedServices || [];

  // 公開済みレッスン商品が存在する場合は、出品実態（kcn_services）を優先して判定する
  if (published.length > 0) {
    const matchingServices = published.filter(
      (svc) => svc.sportSlug === sportSlug
    );
    if (matchingServices.length === 0) {
      return false;
    }
    if (sportSlug === 'swimming') {
      const evidenceText = [
        coach.title,
        coach.bio,
        ...matchingServices.map((s) => `${s.title} ${s.description}`),
      ].join(' ');
      return hasSwimmingEvidence(evidenceText);
    }
    return true;
  }

  // 公開レッスン商品が未登録の場合はプロフィール種目と紹介文の整合を確認する
  const hasSportSlug =
    coach.sportsSlugs.includes(sportSlug) ||
    mapSportToSlugs(coach.sports).includes(sportSlug);

  if (!hasSportSlug) {
    return false;
  }

  if (sportSlug === 'swimming') {
    return hasSwimmingEvidence(`${coach.title} ${coach.bio}`);
  }

  return true;
}

/** 種目ページ表示向けにコーチ情報（紹介文・料金・タグ・エリア）を該当種目の実態に揃える */
export function projectCoachForSport(coach: Coach, sportSlug: string): Coach {
  const published = coach.publishedServices || [];
  const matchingServices = published.filter(
    (svc) => svc.sportSlug === sportSlug
  );
  const sanitizedAreas = sanitizeCoachAreas(coach.areas);

  if (matchingServices.length > 0) {
    const primary = matchingServices[0];
    const minPrice = Math.min(...matchingServices.map((s) => s.price));
    const serviceAreas = sanitizeCoachAreas(
      matchingServices.flatMap((s) => s.targetAreas)
    );
    const serviceSpecialties = Array.from(
      new Set(matchingServices.map((s) => s.sportCategory).filter(Boolean))
    );

    return {
      ...coach,
      hourlyRate: minPrice,
      durationMinutes: primary.durationMinutes || coach.durationMinutes,
      targetAges: primary.targetAges || coach.targetAges,
      bio: primary.description || coach.bio,
      specialties:
        serviceSpecialties.length > 0 ? serviceSpecialties : coach.specialties,
      areas: serviceAreas.length > 0 ? serviceAreas : sanitizedAreas,
      areaSlugs: mapAreaToSlugs(
        serviceAreas.length > 0 ? serviceAreas : sanitizedAreas
      ),
    };
  }

  const consistentSpecialties = coach.specialties.filter((spec) => {
    const slug = mapSportLabelToSlug(spec);
    if (slug === 'swimming' && !hasSwimmingEvidence(`${coach.title} ${coach.bio}`)) {
      return false;
    }
    return true;
  });

  return {
    ...coach,
    specialties:
      consistentSpecialties.length > 0
        ? consistentSpecialties
        : coach.specialties,
    areas: sanitizedAreas,
    areaSlugs: mapAreaToSlugs(sanitizedAreas),
  };
}

/** 指定種目ページの担当コーチ一覧を抽出する */
export function filterCoachesForSport(
  coaches: Coach[],
  sportSlug: string
): Coach[] {
  return coaches
    .filter((coach) => isCoachEligibleForSport(coach, sportSlug))
    .map((coach) => projectCoachForSport(coach, sportSlug));
}

/** 指定種目 × 指定エリア（東京都内）の担当コーチを厳密に抽出する（他エリアへのフォールバック禁止） */
export function filterCoachesForSportAndArea(
  coaches: Coach[],
  sportSlug: string,
  area: AreaInfo
): Coach[] {
  return filterCoachesForSport(coaches, sportSlug).filter(
    (coach) =>
      coach.areaSlugs.includes(area.slug) ||
      coach.areas.some((a) => a.includes(area.name))
  );
}
