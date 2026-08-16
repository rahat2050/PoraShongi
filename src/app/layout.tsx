import type { Metadata } from "next";
import { Hind_Siliguri, Inter } from "next/font/google";
import "./globals.css";
import { siteConfig } from "@/config/site";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { Announcement } from "@/components/layout/announcement";
import { BottomNav } from "@/components/layout/bottom-nav";
import { ToastProvider } from "@/components/ui/toast";
import { SettingsProvider } from "@/lib/settings";
import { BackToTop } from "@/components/shared/back-to-top";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter", display: "swap" });

const hindSiliguri = Hind_Siliguri({
  subsets: ["bengali", "latin"],
  variable: "--font-hind-siliguri",
  weight: ["300", "400", "500", "600", "700"],
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: `${siteConfig.brandName} (${siteConfig.brandNameBangla}) — ${siteConfig.tagline}`,
    template: `%s · ${siteConfig.brandName}`,
  },
  description: siteConfig.description,
  keywords: ["tuition", "Bangladesh", "শিক্ষক", "শিক্ষার্থী", "টিউশন", "PoraSathi", "পড়াসাথী", "FS Coaching"],
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "any" },
      { url: "/icon-192.png", type: "image/png", sizes: "192x192" },
    ],
    apple: [{ url: "/apple-touch-icon.png", sizes: "180x180" }],
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="bn" className={`${inter.variable} ${hindSiliguri.variable} h-full`}>
      <body className="flex min-h-full flex-col">
        <SettingsProvider>
          <ToastProvider>
            <Announcement />
            <Header />
            <main className="flex flex-1 flex-col pb-14 md:pb-0">{children}</main>
            <Footer />
            <BackToTop />
            <BottomNav />
          </ToastProvider>
        </SettingsProvider>
      </body>
    </html>
  );
}
