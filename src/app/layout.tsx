import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import CookieConsent from "@/components/CookieConsent";
// Αν θέλεις αργότερα να κάνεις gate τα analytics με consent:
// import ConsentGate from "@/components/ConsentGate";
import { Analytics } from "@vercel/analytics/next"
import { SpeedInsights } from '@vercel/speed-insights/next';

const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });
const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"] });


export const metadata: Metadata = {
  metadataBase: new URL("https://www.ezpark.gr"),
  title: {
    default: "EzPark – Βρες εύκολα parking στην Αθήνα",
    template: "%s | EzPark",
  },
  description:
    "Το EzPark σε βοηθά να βρίσκεις ‘φιλικούς’ δρόμους στάθμευσης στην Αθήνα και στα προάστια, παρουσιάζοντας αποτελέσματα στον χάρτη και έξυπνη λίστα.",
  alternates: {
    canonical: "/",
  },
  keywords: [
    "ezpark",
    "ezparkgr",
    "parking",
    "παρκινγκ",
    "στάθμευση",
    "σταθμευση Αθήνα",
    "Αθήνα parking",
    "παρκάρισμα Αθήνα",
    "σταθμευση",
    "λαϊκές αγορές",
    "EzPark",
  ],
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
    },
  },
  openGraph: {
    type: "website",
    siteName: "EzPark",
    url: "https://www.ezpark.gr/",
    title: "EzPark – Βρες εύκολα parking στην Αθήνα",
    description:
      "Βρες ‘φιλικούς’ δρόμους στάθμευσης στην Αθήνα και στα προάστια – δες τα αποτελέσματα στον χάρτη και σε λίστα.",
    images: [
      {
        url: "/og.png",
        width: 1200,
        height: 630,
        alt: "EzPark preview",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "EzPark – Βρες εύκολα parking στην Αθήνα",
    description:
      "Χάρτης + λίστα με ‘φιλικούς’ δρόμους στάθμευσης στην Αθήνα/προάστια.",
    images: ["/og.png"],
  },
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#0b1f17" },
    { media: "(prefers-color-scheme: dark)", color: "#0b1f17" },
  ],
  icons: {
    icon: "/favicon.ico",
    apple: "/apple-touch-icon.png",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="el">
      <head>
        {/* JSON-LD: WebSite */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "WebSite",
              name: "EzPark",
              url: "https://www.ezpark.gr",
              potentialAction: {
                "@type": "SearchAction",
                target: "https://www.ezpark.gr/?q={search_term_string}",
                "query-input": "required name=search_term_string",
              },
            }),
          }}
        />
        {/* JSON-LD: Organization */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "Organization",
              name: "EzPark",
              url: "https://www.ezpark.gr",
              logo: "https://www.ezpark.gr/icon.png",
            }),
          }}
        />
        <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png" />
        <link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png" />
        <link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png" />
        <link rel="manifest" href="/site.webmanifest" />
        <link rel="shortcut icon" href="/favicon.ico" />
      </head>

      <body className={`min-h-screen bg-[#181A17] text-white ${geistSans.variable} ${geistMono.variable}`}>
        {children}

        {/* Client component – render απευθείας */}
        <CookieConsent />

        {/* Αν κάποια στιγμή θες gating για analytics με συναίνεση: 
        <ConsentGate>
          <Analytics />
        </ConsentGate>
        */}

        {/* Όπως το έχεις τώρα: */}
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}
