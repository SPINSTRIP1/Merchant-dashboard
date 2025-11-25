import type { Metadata } from "next";
import "./globals.css";
import { Toaster } from "react-hot-toast";
import { ReduxProvider } from "@/providers/redux-provider";

export const metadata: Metadata = {
  title: {
    default: "SpinStrip Merchant Dashboard - Business Suite",
    template: "%s | SpinStrip Merchant",
  },
  description:
    "SpinStrip Merchant Dashboard - Business Suite - Powerful merchant dashboard for business owners. Manage payments, compliance, and grow your business with SpinStrip",
  keywords: [
    "SpinStrip",
    "merchant dashboard",
    "content creator",
    "social media",
    "creator economy",
    "payment management",
    "merchant suite",
    "content monetization",
    "creator business",
    "social commerce",
  ],
  authors: [{ name: "SpinStrip" }],
  creator: "SpinStrip",
  publisher: "SpinStrip",
  applicationName: "SpinStrip Merchant Dashboard",
  category: "Business",
  metadataBase: new URL("https://merchant.spinstrip.com"),
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://merchant.spinstrip.com",
    siteName: "SpinStrip Merchant Dashboard",
    title: "SpinStrip Merchant Dashboard - Content Creator Business Suite",
    description:
      "Powerful merchant dashboard for content creators. Manage payments, compliance, and grow your social media business with SpinStrip.",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "SpinStrip Merchant Dashboard",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "SpinStrip Merchant Dashboard - Content Creator Business Suite",
    description:
      "Powerful merchant dashboard for content creators. Manage payments, compliance, and grow your social media business.",
    images: ["/twitter-image.png"],
    creator: "@spinstrip",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  icons: {
    icon: [
      { url: "/favicon.ico" },
      { url: "/icon-16x16.png", sizes: "16x16", type: "image/png" },
      { url: "/icon-32x32.png", sizes: "32x32", type: "image/png" },
    ],
    apple: [{ url: "/apple-touch-icon.png", sizes: "180x180" }],
  },
  manifest: "/site.webmanifest",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`font-sf-pro bg-background h-full text-secondary-text antialiased`}
      >
        <ReduxProvider>
          {children}
          <Toaster
            position="bottom-right"
            toastOptions={{
              duration: 3000,
              style: {
                background: "#EBE2FF",
                color: "#6932E2",
                fontWeight: "500",
              },
            }}
          />
        </ReduxProvider>
      </body>
    </html>
  );
}
