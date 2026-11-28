import assert from 'node:assert/strict';
import {
  buildSnsRedirectUrl,
  DEFAULT_SNS_GO_DESTINATION,
} from '../src/lib/sns-redirect';

const ORIGIN = 'https://kids-coach-navi.com';

interface TestCase {
  name: string;
  inputPath: string;
  destination?: string;
  expectedUrl: string;
}

const cases: TestCase[] = [
  {
    name: 'a. srcなし・環境変数未設定 -> /coach-recruit + utm_source=sns',
    inputPath: '/go/sns',
    expectedUrl:
      'https://kids-coach-navi.com/coach-recruit?utm_source=sns&utm_medium=sns_profile&utm_campaign=coach_recruit',
  },
  {
    name: 'b-1. ?src=x -> utm_source=x',
    inputPath: '/go/sns?src=x',
    expectedUrl:
      'https://kids-coach-navi.com/coach-recruit?utm_source=x&utm_medium=sns_profile&utm_campaign=coach_recruit',
  },
  {
    name: 'b-2. ?src=threads -> utm_source=threads',
    inputPath: '/go/sns?src=threads',
    expectedUrl:
      'https://kids-coach-navi.com/coach-recruit?utm_source=threads&utm_medium=sns_profile&utm_campaign=coach_recruit',
  },
  {
    name: 'b-3. ?src=instagram -> utm_source=instagram',
    inputPath: '/go/sns?src=instagram',
    expectedUrl:
      'https://kids-coach-navi.com/coach-recruit?utm_source=instagram&utm_medium=sns_profile&utm_campaign=coach_recruit',
  },
  {
    name: '既存 utm_source が付いている場合はそちらを優先し二重付与しない',
    inputPath: '/go/sns?src=x&utm_source=custom_x',
    expectedUrl:
      'https://kids-coach-navi.com/coach-recruit?utm_source=custom_x&utm_medium=sns_profile&utm_campaign=coach_recruit',
  },
  {
    name: '既存 utm_* が複数付いている場合は全て優先し二重付与しない',
    inputPath:
      '/go/sns?src=instagram&utm_source=ig_bio&utm_medium=organic_social&utm_campaign=spring2026&utm_content=reel1',
    expectedUrl:
      'https://kids-coach-navi.com/coach-recruit?utm_source=ig_bio&utm_medium=organic_social&utm_campaign=spring2026&utm_content=reel1',
  },
  {
    name: '空の src や不正文字の src は sns にフォールバック',
    inputPath: '/go/sns?src=',
    expectedUrl:
      'https://kids-coach-navi.com/coach-recruit?utm_source=sns&utm_medium=sns_profile&utm_campaign=coach_recruit',
  },
  {
    name: '大文字の src は小文字正規化される',
    inputPath: '/go/sns?src=Threads',
    expectedUrl:
      'https://kids-coach-navi.com/coach-recruit?utm_source=threads&utm_medium=sns_profile&utm_campaign=coach_recruit',
  },
  {
    name: 'c-1. 環境変数でアプリ内別パス (/) へ変更できる',
    inputPath: '/go/sns?src=x',
    destination: '/',
    expectedUrl:
      'https://kids-coach-navi.com/?utm_source=x&utm_medium=sns_profile&utm_campaign=coach_recruit',
  },
  {
    name: 'c-2. 環境変数でクエリ付きパスへ変更した場合も既存 utm_* を二重付与しない',
    inputPath: '/go/sns?src=threads',
    destination: '/trial?utm_campaign=parent_launch',
    expectedUrl:
      'https://kids-coach-navi.com/trial?utm_campaign=parent_launch&utm_source=threads&utm_medium=sns_profile',
  },
  {
    name: 'c-3. 環境変数で絶対 URL (https) へ変更できる',
    inputPath: '/go/sns?src=instagram',
    destination: 'https://kids-coach-navi.com/sports/swimming',
    expectedUrl:
      'https://kids-coach-navi.com/sports/swimming?utm_source=instagram&utm_medium=sns_profile&utm_campaign=coach_recruit',
  },
  {
    name: '危険なスキーム (javascript:) の環境変数は初期値へフォールバック',
    inputPath: '/go/sns?src=x',
    destination: 'javascript:alert(1)',
    expectedUrl: `https://kids-coach-navi.com${DEFAULT_SNS_GO_DESTINATION}?utm_source=x&utm_medium=sns_profile&utm_campaign=coach_recruit`,
  },
  {
    name: 'プロトコル相対 URL (//evil.com) の環境変数は初期値へフォールバック',
    inputPath: '/go/sns?src=x',
    destination: '//evil.com/phish',
    expectedUrl: `https://kids-coach-navi.com${DEFAULT_SNS_GO_DESTINATION}?utm_source=x&utm_medium=sns_profile&utm_campaign=coach_recruit`,
  },
];

let passed = 0;
for (const tc of cases) {
  const actual = buildSnsRedirectUrl({
    requestUrl: new URL(tc.inputPath, ORIGIN),
    destination: tc.destination,
  }).toString();

  assert.equal(actual, tc.expectedUrl, `Failed: ${tc.name}`);
  passed += 1;
  console.log(`PASS: ${tc.name}\n  -> ${actual}`);
}

console.log(`\nAll ${passed}/${cases.length} tests passed.`);
