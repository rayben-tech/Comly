"use client";

import { useState } from "react";

interface FaviconImgProps {
  domain: string;
  name?: string;
  size?: number;
  className?: string;
  rounded?: "sm" | "md" | "lg" | "xl" | "full";
}

const COLORS = [
  "#5B2D91", "#7c3aed", "#2563eb", "#0891b2",
  "#059669", "#d97706", "#dc2626", "#db2777",
];

function pickColor(domain: string): string {
  let h = 0;
  for (let i = 0; i < domain.length; i++) h = domain.charCodeAt(i) + ((h << 5) - h);
  return COLORS[Math.abs(h) % COLORS.length];
}

const ROUNDED: Record<string, string> = {
  sm: "rounded-sm", md: "rounded-md", lg: "rounded-lg", xl: "rounded-xl", full: "rounded-full",
};

export function FaviconImg({ domain, name, size = 32, className = "", rounded = "md" }: FaviconImgProps) {
  const [failed, setFailed] = useState(false);

  const px = `${size}px`;
  const fontSize = `${Math.max(7, Math.floor(size * 0.42))}px`;
  const letter = (name ?? domain).replace(/^www\./, "").charAt(0).toUpperCase();
  const roundedClass = ROUNDED[rounded] ?? "rounded-md";

  if (failed || !domain) {
    return (
      <span
        className={`inline-flex items-center justify-center font-bold text-white shrink-0 ${roundedClass} ${className}`}
        style={{ width: px, height: px, background: pickColor(domain), fontSize, lineHeight: 1 }}
        aria-label={name ?? domain}
      >
        {letter}
      </span>
    );
  }

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={`https://www.google.com/s2/favicons?domain=${domain}&sz=${size}`}
      alt={name ?? domain}
      width={size}
      height={size}
      className={`object-contain shrink-0 ${roundedClass} ${className}`}
      onError={() => setFailed(true)}
    />
  );
}
