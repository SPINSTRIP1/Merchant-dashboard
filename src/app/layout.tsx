import type { Metadata } from "next";
import { Outfit, Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";
import { Toaster } from "react-hot-toast";
import { ReduxProvider } from "@/providers/redux-provider";
import { ThemeProvider } from "@/providers/theme-provider";

const fontSans = Plus_Jakarta_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-sans",
  display: "swap",
});

// Headings, big numbers and money totals (`font-display`)
const fontDisplay = Outfit({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800"],
  variable: "--font-display",
  display: "swap",
});

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
  // manifest: "/site.webmanifest",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${fontSans.variable} ${fontDisplay.variable}`} suppressHydrationWarning>
      <body
        className="font-sans bg-background h-full text-secondary-text antialiased overflow-x-hidden"
      >
        <ReduxProvider>
          <ThemeProvider>{children}</ThemeProvider>
          <Toaster
            position="top-center"
            toastOptions={{
              duration: 3000,
              style: {
                background: "hsl(var(--card))",
                color: "hsl(var(--foreground))",
                border: "1px solid hsl(var(--border))",
                borderRadius: "14px",
                boxShadow: "0 10px 25px -5px rgb(0 0 0 / 0.1)",
                fontSize: "14px",
                fontWeight: 500,
              },
              success: { iconTheme: { primary: "#10b981", secondary: "#fff" } },
              error: { iconTheme: { primary: "#f43f5e", secondary: "#fff" } },
            }}
          />
        </ReduxProvider>
      </body>
    </html>
  );
}
