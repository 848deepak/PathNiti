import type { Metadata, Viewport } from "next";
import "./globals.css";
import { Providers } from "./providers";
import { ServiceWorkerProvider } from "@/components/ServiceWorkerProvider";

export const metadata: Metadata = {
  title: "PathNiti - Your Path. Your Future. Simplified.",
  description: "One-Stop Personalized Career & Education Advisor for Indian Students",
  keywords: ["education", "career", "guidance", "colleges", "admissions", "scholarships", "India"],
  authors: [{ name: "PathNiti Team" }],
  creator: "PathNiti",
  publisher: "PathNiti",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"),
  openGraph: {
    title: "PathNiti - Your Path. Your Future. Simplified.",
    description: "One-Stop Personalized Career & Education Advisor for Indian Students",
    url: "/",
    siteName: "PathNiti",
    locale: "en_IN",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "PathNiti - Your Path. Your Future. Simplified.",
    description: "One-Stop Personalized Career & Education Advisor for Indian Students",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "PathNiti",
  },
  other: {
    "mobile-web-app-capable": "yes",
    "apple-mobile-web-app-capable": "yes",
    "apple-mobile-web-app-status-bar-style": "default",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: "#1E40AF",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@100..900&display=swap" rel="stylesheet" />
        <link rel="manifest" href="/manifest.json" />
        <link rel="icon" href="/icons/favicon.svg" type="image/svg+xml" />
        <link rel="apple-touch-icon" href="/icons/icon-192x192.svg" />
        <meta name="theme-color" content="#1E40AF" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="PathNiti" />
        <meta name="mobile-web-app-capable" content="yes" />
      </head>
      <body className="min-h-screen bg-background font-sans antialiased">
        <Providers>
          <ServiceWorkerProvider>
            {children}
          </ServiceWorkerProvider>
        </Providers>
      </body>
    </html>
  );
}
