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
      {
        src: "/icon.svg",
        sizes: "any",
        type: "image/svg+xml",
      },
    ],
  };
}
