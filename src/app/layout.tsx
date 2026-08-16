import type { Metadata, Viewport } from "next";
import { Hind_Siliguri, Inter } from "next/font/google";
import "./globals.css";
import { getSiteUrl, siteConfig } from "@/config/site";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { Announcement } from "@/components/layout/announcement";
import { BottomNav } from "@/components/layout/bottom-nav";
import { ToastProvider } from "@/components/ui/toast";
import { SettingsProvider } from "@/lib/settings";
import { BackToTop } from "@/components/shared/back-to-top";
import { ServiceWorkerRegister } from "@/components/shared/service-worker-register";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter", display: "optional" });

const hindSiliguri = Hind_Siliguri({
  subsets: ["bengali", "latin"],
  variable: "--font-hind-siliguri",
  weight: ["300", "400", "500", "600", "700"],
  display: "optional",
});

export const metadata: Metadata = {
  metadataBase: new URL(getSiteUrl()),
  title: {
    default: `${siteConfig.brandName} (${siteConfig.brandNameBangla}) — ${siteConfig.tagline}`,
    template: `%s · ${siteConfig.brandName}`,
  },
  description: siteConfig.description,
  applicationName: siteConfig.brandName,
  openGraph: {
    type: "website",
    url: "/",
    siteName: siteConfig.brandName,
    locale: "bn_BD",
    title: `${siteConfig.brandName} (${siteConfig.brandNameBangla}) — ${siteConfig.tagline}`,
    description: siteConfig.description,
    images: [{ url: "/icon-512.png", width: 512, height: 512, alt: `${siteConfig.brandName} logo` }],
  },
  twitter: {
    card: "summary",
    title: `${siteConfig.brandName} — ${siteConfig.tagline}`,
    description: siteConfig.description,
    images: ["/icon-512.png"],
  },
  keywords: ["tuition", "Bangladesh", "শিক্ষক", "শিক্ষার্থী", "টিউশন", "PoraSathi", "পড়াসাথী", "FS Coaching"],
  manifest: "/manifest.webmanifest",
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "any" },
      { url: "/icon-192.png", type: "image/png", sizes: "192x192" },
    ],
    apple: [{ url: "/apple-touch-icon.png", sizes: "180x180" }],
  },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#0f766e" },
    { media: "(prefers-color-scheme: dark)", color: "#0f172a" },
  ],
  colorScheme: "light dark",
};

const themeInitScript = `
  try {
    if (localStorage.getItem("porasathi_theme") === "dark") {
      document.documentElement.classList.add("dark");
    }
  } catch {}
`;

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="bn" className={`${inter.variable} ${hindSiliguri.variable} h-full`} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeInitScript }} />
      </head>
      <body className="flex min-h-full flex-col">
        <a
          href="#main-content"
          className="fixed left-4 top-3 z-[100] -translate-y-20 rounded-lg bg-slate-950 px-4 py-2 font-medium text-white shadow-lg transition-transform focus:translate-y-0"
        >
          মূল কনটেন্টে যান
        </a>
        <SettingsProvider>
          <ToastProvider>
            <Announcement />
            <Header />
            <main id="main-content" className="flex flex-1 flex-col pb-14 md:pb-0">{children}</main>
            <Footer />
            <BackToTop />
            <BottomNav />
            <ServiceWorkerRegister />
          </ToastProvider>
        </SettingsProvider>
      </body>
    </html>
  );
}
