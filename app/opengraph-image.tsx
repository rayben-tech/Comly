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
          backgroundColor: "#0d0d1a",
          position: "relative",
        }}
      >
        {/* Purple center glow */}
        <div
          style={{
            position: "absolute",
            top: "0px",
            left: "200px",
            width: "800px",
            height: "400px",
            borderRadius: "50%",
            background: "rgba(91,45,145,0.35)",
            filter: "blur(80px)",
            display: "flex",
          }}
        />

        {/* Logo + name */}
        <div style={{ display: "flex", alignItems: "center", gap: "16px", marginBottom: "28px" }}>
          {/* Simple triangle logo — flat colors, no gradients */}
          <div
            style={{
              width: "48px",
              height: "52px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              backgroundColor: "#1a1a2e",
              borderRadius: "10px",
              border: "2px solid rgba(167,85,247,0.4)",
            }}
          >
            <div style={{ width: "24px", height: "24px", backgroundColor: "#a855f7", borderRadius: "4px", display: "flex" }} />
          </div>
          <span style={{ fontSize: "40px", fontWeight: "800", color: "#ffffff", letterSpacing: "-1px", display: "flex" }}>
            Comly
          </span>
        </div>

        {/* Headline */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            marginBottom: "20px",
          }}
        >
          <span style={{ fontSize: "62px", fontWeight: "900", color: "#ffffff", letterSpacing: "-2px", lineHeight: "1.05", display: "flex" }}>
            AI Visibility Audit
          </span>
          <span style={{ fontSize: "62px", fontWeight: "900", color: "#a78bfa", letterSpacing: "-2px", lineHeight: "1.05", display: "flex" }}>
            for Your Brand.
          </span>
        </div>

        {/* Subtext */}
        <div style={{ display: "flex", marginBottom: "40px" }}>
          <span style={{ fontSize: "22px", color: "rgba(255,255,255,0.45)", textAlign: "center", display: "flex" }}>
            See how ChatGPT, Claude, Gemini &amp; Perplexity talk about you.
          </span>
        </div>

        {/* Score badges */}
        <div style={{ display: "flex", gap: "16px" }}>
          {[
            { label: "ChatGPT", score: "74", color: "#10b981" },
            { label: "Claude",  score: "68", color: "#a78bfa" },
            { label: "Gemini",  score: "71", color: "#60a5fa" },
            { label: "Perplexity", score: "65", color: "#f59e0b" },
          ].map(({ label, score, color }) => (
            <div
              key={label}
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                backgroundColor: "rgba(255,255,255,0.07)",
                border: "1px solid rgba(255,255,255,0.12)",
                borderRadius: "16px",
                padding: "14px 24px",
                gap: "4px",
              }}
            >
              <span style={{ fontSize: "30px", fontWeight: "800", color, display: "flex" }}>{score}</span>
              <span style={{ fontSize: "13px", color: "rgba(255,255,255,0.4)", display: "flex" }}>{label}</span>
            </div>
          ))}
        </div>

        {/* Domain */}
        <div
          style={{
            position: "absolute",
            bottom: "32px",
            display: "flex",
            backgroundColor: "rgba(255,255,255,0.06)",
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
