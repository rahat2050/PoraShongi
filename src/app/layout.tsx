import type { Metadata, Viewport } from "next";
import "./globals.css";
import { DEFAULT_OG_IMAGE } from "@/config/seo";
import { siteConfig } from "@/config/site";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { Announcement } from "@/components/layout/announcement";
import { BottomNav } from "@/components/layout/bottom-nav";
import { ToastProvider } from "@/components/ui/toast";
import { SettingsProvider } from "@/lib/settings";
import { BackToTop } from "@/components/shared/back-to-top";
import { ServiceWorkerRegister } from "@/components/shared/service-worker-register";
import { VisitorTracker } from "@/components/shared/visitor-tracker";
import { ScrollProgress } from "@/components/motion/scroll-progress";
import { JsonLd } from "@/components/seo/json-ld";
import { websiteGraph } from "@/lib/seo/jsonld";
import { googleSiteVerification, metadataBaseUrl } from "@/lib/seo/metadata";

export const metadata: Metadata = {
  metadataBase: metadataBaseUrl(),
  title: {
    default: siteConfig.defaultTitle,
    template: `%s · ${siteConfig.brandName}`,
  },
  description: siteConfig.description,
  applicationName: siteConfig.brandName,
  authors: [{ name: siteConfig.brandName }],
  creator: siteConfig.brandName,
  publisher: siteConfig.branding,
  category: "education",
  robots: { index: true, follow: true },
  verification: googleSiteVerification(),
  openGraph: {
    type: "website",
    url: "/",
    siteName: siteConfig.brandName,
    locale: "bn_BD",
    title: siteConfig.defaultTitle,
    description: siteConfig.description,
    images: [DEFAULT_OG_IMAGE],
  },
  twitter: {
    card: "summary_large_image",
    title: siteConfig.defaultTitle,
    description: siteConfig.description,
    images: [DEFAULT_OG_IMAGE.url],
  },
  manifest: "/manifest.webmanifest",
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "any" },
      { url: "/favicon-32.png", type: "image/png", sizes: "32x32" },
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
    <html lang="bn" className="h-full" suppressHydrationWarning>
      <head>
        {process.env.NEXT_PUBLIC_SUPABASE_URL && (
          <>
            <link rel="preconnect" href={process.env.NEXT_PUBLIC_SUPABASE_URL} crossOrigin="anonymous" />
            <link rel="dns-prefetch" href={process.env.NEXT_PUBLIC_SUPABASE_URL} />
          </>
        )}
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
            <JsonLd data={websiteGraph()} />
            <ScrollProgress />
            <Announcement />
            <Header />
            <main id="main-content" className="flex flex-1 flex-col pb-14 md:pb-0">{children}</main>
            <Footer />
            <BackToTop />
            <BottomNav />
            <ServiceWorkerRegister />
            <VisitorTracker enabled={Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY)} />
          </ToastProvider>
        </SettingsProvider>
      </body>
    </html>
  );
}
