import { NextResponse, type NextRequest } from 'next/server';
import {
  buildSnsRedirectUrl,
  SNS_GO_DESTINATION_ENV,
} from '@/lib/sns-redirect';

export const dynamic = 'force-dynamic';

/**
 * SNSプロフィールリンク用の計測リダイレクトエンドポイント (/go/sns)
 * 環境変数 SNS_GO_DESTINATION の向き先へ UTM パラメータを付与して 302 リダイレクトする。
 */
export function GET(request: NextRequest) {
  const targetUrl = buildSnsRedirectUrl({
    requestUrl: request.nextUrl,
    destination: process.env[SNS_GO_DESTINATION_ENV],
  });

  const response = NextResponse.redirect(targetUrl, { status: 302 });
  response.headers.set(
    'Cache-Control',
    'no-store, no-cache, must-revalidate, max-age=0'
  );
  response.headers.set('Pragma', 'no-cache');
  return response;
}
