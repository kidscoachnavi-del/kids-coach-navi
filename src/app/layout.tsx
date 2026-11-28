import type { Metadata, Viewport } from "next";
import Script from "next/script";
import { Toaster } from "@/components/ui/sonner";
import "./globals.css";

export const metadata: Metadata = {
  title: "キッズコーチナビ ｜ Kids Coach Navi by SWIM PARTNERS",
  description: "子ども向け出張マンツーマンスポーツ指導プラットフォーム「キッズコーチナビ」",
  manifest: "/manifest.json",
};

// 全ページ共通のビューポート設定（スケーリング・ズーム制御）
export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: "cover", // safe-area-inset 対応（ノッチ付き端末）
  interactiveWidget: "resizes-content", // ソフトキーボード展開時のレイアウトシフト防止
};

import AuthProvider from "@/components/providers/AuthProvider";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const gaMeasurementId = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID?.trim();

  return (
    <html lang="ja" suppressHydrationWarning>
      <body
        className="antialiased font-sans relative min-h-screen bg-background text-foreground selection:bg-sky-100"
        suppressHydrationWarning
      >
        {gaMeasurementId && (
          <>
            <Script
              src={`https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(gaMeasurementId)}`}
              strategy="afterInteractive"
            />
            <Script id="ga4-gtag-init" strategy="afterInteractive">
              {`window.dataLayer = window.dataLayer || [];
function gtag(){dataLayer.push(arguments);}
gtag('js', new Date());
gtag('config', ${JSON.stringify(gaMeasurementId)});`}
            </Script>
          </>
        )}
        <AuthProvider>
          {children}
        </AuthProvider>
        <Toaster />
      </body>
    </html>
  );
}
