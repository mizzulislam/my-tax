import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { connection } from "next/server";

import { AlertProvider } from '@/contexts/AlertContext';
import "./globals.css";
import Providers from "./providers";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || "https://my-tax.app"),
  title: "My Tax - Asisten Persiapan Pajak Pribadi AI",
  description: "My Tax membantu Anda merapikan data pajak, dokumen, dan melakukan simulasi sebelum lapor ke DJP. Cocok untuk karyawan, freelancer, dan UMKM kecil di Indonesia.",
  openGraph: {
    title: "My Tax - Asisten Persiapan Pajak Pribadi AI",
    description: "My Tax membantu persiapan lapor SPT dengan Readiness Score dan AI Insights. #JuaraVibeCoding",
    url: "/",
    siteName: "My Tax",
    images: [
      {
        url: "/og-image.jpg", // Pastikan file ini ada di folder public/
        width: 1200,
        height: 630,
        alt: "My Tax App Preview",
      },
    ],
    locale: "id_ID",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "My Tax - Asisten Pajak Pintar",
    description: "Persiapan pajak tak pernah semudah ini dengan AI. Cek Readiness Score kamu sekarang!",
  },
  icons: {
    icon: "/logos/my-tax-logo-icon.svg",
    shortcut: "/logos/my-tax-logo-icon.svg",
    apple: "/logos/my-tax-logo-icon.svg",
  },
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  await connection();

  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <body className="min-h-full flex flex-col" suppressHydrationWarning>
        <Providers>
          <AlertProvider>
            {children}
          </AlertProvider>
        </Providers>
      </body>
    </html>
  );
}
