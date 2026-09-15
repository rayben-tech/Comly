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
  title: "Spico — A head of marketing that works 24/7",
  description:
    "Spico is an AI head of marketing. It finds marketing opportunities around the clock and hands them to you to act on with one click.",
  metadataBase: new URL("https://spico.io"),
  alternates: {
    canonical: "https://spico.io",
  },
  openGraph: {
    title: "Spico — A head of marketing that works 24/7",
    description: "Spico is an AI head of marketing. It finds marketing opportunities around the clock and hands them to you to act on with one click.",
    siteName: "Spico",
    type: "website",
    url: "https://spico.io",
    images: [{ url: "/og-image.png", width: 1200, height: 630 }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Spico — A head of marketing that works 24/7",
    description: "Spico is an AI head of marketing. It finds marketing opportunities around the clock and hands them to you to act on with one click.",
    images: ["/og-image.png"],
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
