import { ImageResponse } from "next/og";

export const runtime = "edge";
export const alt = "PoraSathi — সঠিক শিক্ষক, সুন্দর শেখার সঙ্গী";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpenGraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          padding: 72,
          background: "linear-gradient(135deg, #042f2e 0%, #115e59 55%, #0f766e 100%)",
          color: "white",
          fontFamily: "sans-serif",
        }}
      >
        <div style={{ fontSize: 28, fontWeight: 700, letterSpacing: 4, color: "#6ee7b7" }}>
          PORASATHI · পড়াসাথী
        </div>
        <div style={{ marginTop: 24, fontSize: 64, fontWeight: 900, lineHeight: 1.15, maxWidth: 980 }}>
          সঠিক শিক্ষক খুঁজুন, শেখার পথ সহজ করুন
        </div>
        <div style={{ marginTop: 28, fontSize: 28, color: "#ccfbf1" }}>
          বাংলাদেশের টিউশন মার্কেটপ্লেস · A platform by FS Coaching
        </div>
      </div>
    ),
    size,
  );
}
