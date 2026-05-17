import type { Metadata } from "next";
import { Inter, DM_Sans } from "next/font/google";
import { Analytics } from "@vercel/analytics/react";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });
const dmSans = DM_Sans({
  subsets: ["latin"],
  weight: ["300", "400"],
  variable: "--font-dm-sans",
});

export const metadata: Metadata = {
  title: "Comly — AI Visibility Audit for Your Brand",
  description:
    "Find out if AI recommends your brand. Run an AI visibility audit and see how you rank against competitors in AI-generated responses.",
  metadataBase: new URL("https://www.trycomly.com"),
  openGraph: {
    title: "Comly — AI Visibility Audit for Your Brand",
    description: "See how ChatGPT, Claude, Gemini & Perplexity talk about you — and outrank competitors.",
    type: "website",
    url: "https://www.trycomly.com",
    images: [{ url: "/og-image.png?v=2", width: 1200, height: 630 }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Comly — AI Visibility Audit for Your Brand",
    description: "See how ChatGPT, Claude, Gemini & Perplexity talk about you — and outrank competitors.",
    images: ["/og-image.png?v=2"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.className} ${dmSans.variable} bg-gray-50 text-gray-900 antialiased`}>
        {children}
        <Analytics />
      </body>
    </html>
  );
}
