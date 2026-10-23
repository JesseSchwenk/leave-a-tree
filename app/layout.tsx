import type { Metadata, Viewport } from "next";
import { Climate_Crisis, Schibsted_Grotesk } from "next/font/google";
import { SITE_URL } from "@/lib/site";
import "./globals.css";

// A typeface that melts with each year of warming (YEAR axis 1979–2050).
const display = Climate_Crisis({
  subsets: ["latin", "latin-ext"],
  axes: ["YEAR"],
  variable: "--font-display",
});

const body = Schibsted_Grotesk({
  subsets: ["latin", "latin-ext"],
  variable: "--font-body",
});

const title = "Leave a Tree: plant a tree with your name on it";
const description =
  "We plant a native tree in a regulated Lithuanian forest, tag it with your name, and AI keeps you updated as it grows. Seed-funded by Tomorrow University.";

// Icons and the share image come from app/icon.svg, app/apple-icon.png and
// app/opengraph-image.png.
export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title,
  description,
  openGraph: { title, description, siteName: "Leave a Tree", type: "website", locale: "en" },
  twitter: { card: "summary_large_image", title, description },
};

export const viewport: Viewport = {
  themeColor: "#183324",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${display.variable} ${body.variable}`}>
      {/* Browser extensions (e.g. ColorZilla) add attributes to <body> before React loads. */}
      <body suppressHydrationWarning>{children}</body>
    </html>
  );
}
