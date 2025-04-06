import "./globals.css";
import type { Metadata } from "next";
import { Asap } from "next/font/google";
import { Footer } from "@/components/footer";
import { GlobalSearchDialog } from "@/components/global-search-dialog";
import Providers from "@/components/providers";

const asap = Asap({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-asap",
  weight: ["400", "500", "600", "700"],
});

export const viewport = {
  maximumScale: 1,
  userScalable: false,
};

export const metadata: Metadata = {
  title: {
    default: "Docmentic AI - Generate & Interact with Business Documents",
    template: "%s | Docmentic AI",
  },
  description:
    "Streamline your business document creation with AI. Generate professional documents instantly and engage in intelligent conversations with your content across multiple platforms.",
  keywords: [
    "AI document generator",
    "business document creation",
    "document chat",
    "AI business tools",
    "document analysis",
    "enterprise document solution",
    "semantic document processing",
  ],
  authors: [
    { name: "Docmentic", url: "https://www.docmentic.com" },
    { name: "Docmentic", url: "https://www.docmentic.ai" },
  ],
  openGraph: {
    title: "Docmentic AI - Revolutionizing Business Document Management",
    description:
      "Create, generate, and interact with business documents using advanced AI technology.",
    type: "website",
    locale: "en_US",
    images: [
      {
        url: "https://firebasestorage.googleapis.com/v0/b/sambeel.appspot.com/o/Documentic%2Fog-image%20(2).png?alt=media&token=1b09e7aa-61eb-48c7-9d9f-d57a904f540a",
        width: 1200,
        height: 630,
        alt: "Docmentic AI - Smart Document Solutions",
      },
    ],
    url: "https://www.docmentic.com",
    siteName: "Docmentic AI",
  },
  twitter: {
    card: "summary_large_image",
    title: "Docmentic AI - Smart Document Solutions",
    description: "AI-powered document generation and interaction platform",
    creator: "@docmentic",
    images: ["/twitter-image.png"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": 231,
    },
  },
  verification: {
    google: "your-google-site-verification-code",
  },
  alternates: {
    canonical: "https://www.docmentic.com",
    languages: {
      "en-US": "https://www.docmentic.com",
      "en-GB": "https://www.docmentic.com",
    },
    types: {
      "application/rss+xml": "https://www.docmentic.com/rss",
    },
  },
  category: "Technology",
  metadataBase: new URL("https://www.docmentic.com"),
  other: {
    "msvalidate.01": "your-microsoft-verification-code",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning className={asap.variable}>
      <head>
        <link rel="icon" href="/favicon.ico" sizes="any" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      </head>
      <body
        className="font-asap bg-background text-foreground antialiased min-h-screen transition-colors duration-300"
        data-cjcrx="addYes"
        cz-shortcut-listen="true"
      >
        <GlobalSearchDialog />
        <Providers>
          {children}
          <Footer />
        </Providers>
      </body>
    </html>
  );
}
