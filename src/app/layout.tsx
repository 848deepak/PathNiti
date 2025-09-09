import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Providers } from "./providers";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

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
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={inter.variable}>
      <body className="min-h-screen bg-background font-sans antialiased">
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  );
}
