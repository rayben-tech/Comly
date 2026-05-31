import type { Metadata } from "next";
import { Inter, DM_Sans, Outfit } from "next/font/google";
import { Analytics } from "@vercel/analytics/react";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });
const dmSans = DM_Sans({
  subsets: ["latin"],
  weight: ["300", "400"],
  variable: "--font-dm-sans",
});
const outfit = Outfit({
  subsets: ["latin"],
  weight: ["700", "800", "900"],
  variable: "--font-outfit",
});

export const metadata: Metadata = {
  title: "Comly — Get Recommended by AI",
  description:
    "Find out why AI recommends your competitors instead of you — and fix it. Audit your brand's visibility across ChatGPT, Gemini & Perplexity in 60 seconds.",
  metadataBase: new URL("https://www.trycomly.com"),
  openGraph: {
    title: "Comly — Get Recommended by AI",
    description: "Find out why AI recommends your competitors instead of you — and fix it. Audit your brand's visibility across ChatGPT, Gemini & Perplexity in 60 seconds.",
    siteName: "Comly",
    type: "website",
    url: "https://www.trycomly.com",
    images: [{ url: "/og-banner.png", width: 1200, height: 630 }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Comly — Get Recommended by AI",
    description: "Find out why AI recommends your competitors instead of you — and fix it. Audit your brand's visibility across ChatGPT, Gemini & Perplexity in 60 seconds.",
    images: ["/og-banner.png"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "WebSite",
              name: "Comly",
              url: "https://www.trycomly.com",
            }),
          }}
        />
      </head>
      <body className={`${inter.className} ${dmSans.variable} ${outfit.variable} bg-gray-50 text-gray-900 antialiased`}>
        {children}
        <Analytics />
      </body>
    </html>
  );
}
