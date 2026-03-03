import type { Metadata, Viewport } from "next";
import { Inter, DM_Mono } from "next/font/google";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

const dmMono = DM_Mono({
  variable: "--font-dm-mono",
  subsets: ["latin"],
  weight: ["400", "500"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "KAY-OS",
  description: "Internal Training — Consciousness Technology",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "KAY-OS",
  },
  openGraph: {
    title: "KAY-OS",
    description: "Internal Training — Consciousness Technology",
    images: [{ url: "/og-image.png", width: 1200, height: 630 }],
  },
  twitter: {
    card: "summary_large_image",
    title: "KAY-OS",
    description: "Internal Training — Consciousness Technology",
    images: ["/og-image.png"],
  },
};

export const viewport: Viewport = {
  themeColor: "#05050C",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body
        className={`${inter.variable} ${dmMono.variable} antialiased bg-background text-foreground min-h-dvh`}
      >
        {children}
      </body>
    </html>
  );
}
