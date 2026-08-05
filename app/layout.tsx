import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "OFF/BEAT Brand Guidelines · Lore",
    template: "%s · Lore",
  },
  description:
    "A living brand book for OFF/BEAT, with approved guidelines, downloadable assets, and embedded design tools.",
  applicationName: "Lore",
  authors: [{ name: "Lore" }],
  keywords: ["OFF/BEAT", "brand guidelines", "brand book", "Lore"],
  icons: {
    icon: "/favicon.svg",
    shortcut: "/favicon.svg",
  },
  // Client brand material: keep the prototype out of search indexes.
  robots: {
    index: false,
    follow: false,
    nocache: true,
    googleBot: { index: false, follow: false },
  },
  openGraph: {
    type: "website",
    title: "OFF/BEAT Brand Guidelines",
    description: "The living guide, built on Lore.",
    images: [{ url: "/og.png", width: 1200, height: 630, alt: "OFF/BEAT Brand Guidelines on Lore" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "OFF/BEAT Brand Guidelines",
    description: "The living guide, built on Lore.",
    images: ["/og.png"],
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#FF00B4",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
