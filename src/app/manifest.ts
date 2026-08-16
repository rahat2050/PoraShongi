import type { MetadataRoute } from "next";

/** PWA manifest — মোবাইলে অ্যাপের মতো install করা যায়। */
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "PoraSathi — পড়াসাথী",
    short_name: "PoraSathi",
    description: "সঠিক শিক্ষক, সুন্দর শেখার সঙ্গী — A platform by FS Coaching",
    start_url: "/",
    display: "standalone",
    background_color: "#f8fafc",
    theme_color: "#0d9488",
    icons: [
      { src: "/icon-192.png", sizes: "192x192", type: "image/png" },
      { src: "/icon-512.png", sizes: "512x512", type: "image/png" },
    ],
  };
}
