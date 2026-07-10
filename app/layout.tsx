import type { Metadata, Viewport } from "next";
import { Archivo, IBM_Plex_Mono, Libre_Caslon_Text } from "next/font/google";
import "./globals.css";

// Brand type system (kayrage.com parity): Archivo carries UI + display,
// IBM Plex Mono carries metas/labels, Caslon italic carries guidance text.
const archivo = Archivo({
  variable: "--font-archivo",
  subsets: ["latin"],
  display: "swap",
});

const plexMono = IBM_Plex_Mono({
  variable: "--font-plex-mono",
  subsets: ["latin"],
  weight: ["400", "500"],
  display: "swap",
});

const caslon = Libre_Caslon_Text({
  variable: "--font-caslon",
  subsets: ["latin"],
  weight: ["400"],
  style: ["normal", "italic"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "KAYRAGE",
  description: "Internal Training — Consciousness Technology",
  manifest: "/manifest.json",
  icons: {
    icon: "/favicon.png",
    apple: "/favicon.png",
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "KAYRAGE",
  },
};

export const viewport: Viewport = {
  themeColor: "#17150F",
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
        className={`${archivo.variable} ${plexMono.variable} ${caslon.variable} antialiased bg-background text-foreground min-h-dvh`}
      >
        {children}
        <script
          dangerouslySetInnerHTML={{
            __html: `if("serviceWorker"in navigator)window.addEventListener("load",()=>navigator.serviceWorker.register("/sw.js"))`,
          }}
        />
      </body>
    </html>
  );
}
