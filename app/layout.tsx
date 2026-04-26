import type { Metadata } from "next";
import { Inter, DM_Sans } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });
const dmSans = DM_Sans({
  subsets: ["latin"],
  weight: ["300", "400"],
  variable: "--font-dm-sans",
});

export const metadata: Metadata = {
  title: "Comly — AI Visibility Audit for Your SaaS",
  description:
    "Find out if AI recommends your brand. Run a free AI visibility audit and see how you rank against competitors in AI-generated responses.",
  openGraph: {
    title: "Comly — AI Visibility Audit for Your SaaS",
    description: "Find out if AI recommends your brand. Run a free AI visibility audit.",
    type: "website",
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
      </body>
    </html>
  );
}
