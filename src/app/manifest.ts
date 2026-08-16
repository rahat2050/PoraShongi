import type { MetadataRoute } from "next";

/** PWA manifest — মোবাইলে অ্যাপের মতো install করা যায়। */
export default function manifest(): MetadataRoute.Manifest {
  return {
    id: "/",
    name: "PoraSathi — পড়াসাথী",
    short_name: "PoraSathi",
    description: "সঠিক শিক্ষক, সুন্দর শেখার সঙ্গী — A platform by FS Coaching",
    lang: "bn-BD",
    dir: "ltr",
    start_url: "/",
    scope: "/",
    display: "standalone",
    orientation: "any",
    background_color: "#f8fafc",
    theme_color: "#0f766e",
    categories: ["education", "productivity"],
    icons: [
      { src: "/icon-192.png", sizes: "192x192", type: "image/png", purpose: "any" },
      { src: "/icon-512.png", sizes: "512x512", type: "image/png", purpose: "any" },
      { src: "/icon-512.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
    ],
  };
}
