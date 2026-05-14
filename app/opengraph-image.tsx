import { ImageResponse } from "next/og";

export const runtime = "edge";
export const alt = "Comly — AI Visibility Audit for Your Brand";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OGImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "1200px",
          height: "630px",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          background: "linear-gradient(135deg, #0d0d1a 0%, #1a0a3d 50%, #0d0d1a 100%)",
          position: "relative",
          overflow: "hidden",
        }}
      >
        {/* Background glow */}
        <div
          style={{
            position: "absolute",
            top: "-100px",
            left: "50%",
            transform: "translateX(-50%)",
            width: "800px",
            height: "500px",
            borderRadius: "50%",
            background: "radial-gradient(circle, rgba(91,45,145,0.4) 0%, transparent 70%)",
            display: "flex",
          }}
        />

        {/* Logo + name row */}
        <div style={{ display: "flex", alignItems: "center", gap: "16px", marginBottom: "32px" }}>
          {/* SVG logo */}
          <svg width="52" height="58" viewBox="0 0 100 110" fill="none">
            <path
              d="M50 4 C54 4 57 6 59.5 10 L93 68 C97 74 97 80 93.5 85 C90 90 84 93 77 93 L23 93 C16 93 10 90 6.5 85 C3 80 3 74 7 68 L40.5 10 C43 6 46 4 50 4Z"
              fill="#ffffff"
            />
            <path
              d="M28 72 C32 62 44 56 58 60 C66 62.5 70 67 68 70 C66 73 60 72 52 69 C44 66 36 68 32 74 C30 77 28 75 28 72Z"
              fill="url(#g)"
            />
            <defs>
              <linearGradient id="g" x1="28" y1="65" x2="70" y2="65" gradientUnits="userSpaceOnUse">
                <stop offset="0%" stopColor="#5b21b6" />
                <stop offset="100%" stopColor="#a855f7" />
              </linearGradient>
            </defs>
          </svg>
          <span style={{ fontSize: "42px", fontWeight: "800", color: "#ffffff", letterSpacing: "-1px" }}>
            Comly
          </span>
        </div>

        {/* Headline */}
        <div
          style={{
            fontSize: "58px",
            fontWeight: "900",
            color: "#ffffff",
            textAlign: "center",
            lineHeight: "1.1",
            maxWidth: "900px",
            letterSpacing: "-2px",
            marginBottom: "20px",
            display: "flex",
          }}
        >
          AI Visibility Audit
          <br />
          for Your Brand.
        </div>

        {/* Subtext */}
        <div
          style={{
            fontSize: "22px",
            color: "rgba(255,255,255,0.5)",
            textAlign: "center",
            maxWidth: "640px",
            lineHeight: "1.5",
            marginBottom: "40px",
            display: "flex",
          }}
        >
          See how ChatGPT, Claude, Gemini & Perplexity talk about you — and outrank competitors.
        </div>

        {/* Score badge row */}
        <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
          {[
            { label: "ChatGPT", score: "74" },
            { label: "Claude", score: "68" },
            { label: "Gemini", score: "71" },
            { label: "Perplexity", score: "65" },
          ].map(({ label, score }) => (
            <div
              key={label}
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                background: "rgba(255,255,255,0.07)",
                border: "1px solid rgba(255,255,255,0.12)",
                borderRadius: "16px",
                padding: "14px 22px",
                gap: "4px",
              }}
            >
              <span style={{ fontSize: "28px", fontWeight: "800", color: "#a78bfa", display: "flex" }}>{score}</span>
              <span style={{ fontSize: "13px", color: "rgba(255,255,255,0.4)", display: "flex" }}>{label}</span>
            </div>
          ))}
        </div>

        {/* Domain pill */}
        <div
          style={{
            position: "absolute",
            bottom: "32px",
            display: "flex",
            alignItems: "center",
            background: "rgba(255,255,255,0.06)",
            border: "1px solid rgba(255,255,255,0.1)",
            borderRadius: "100px",
            padding: "8px 20px",
          }}
        >
          <span style={{ fontSize: "15px", color: "rgba(255,255,255,0.35)", display: "flex" }}>trycomly.com</span>
        </div>
      </div>
    ),
    { width: 1200, height: 630 }
  );
}
