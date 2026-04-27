import type { Metadata, Viewport } from "next";
import Script from "next/script";
import "./globals.css";

/** Page analytics: only loads when both are set in the deployment environment (never commit real values). */
const umamiScriptUrl = process.env.NEXT_PUBLIC_UMAMI_SCRIPT_URL?.trim();
const umamiWebsiteId = process.env.NEXT_PUBLIC_UMAMI_WEBSITE_ID?.trim();
const umamiEnabled = Boolean(umamiScriptUrl && umamiWebsiteId);

export const metadata: Metadata = {
  title: {
    default: "someone.help — someone to talk to",
    template: "%s — someone.help",
  },
  description:
    "Free anonymous AI chat when you need someone to listen. No account. Conversations stay in your browser. Visitor counts only (self-hosted analytics) — no creepy tracking.",
  applicationName: "someone.help",
  authors: [{ name: "someone.help" }],
  keywords: [
    "AI chat",
    "someone to talk to",
    "anonymous chat",
    "vent online",
    "listen without judgment",
    "private chat",
    "mental health adjacent",
    "Llama chat",
  ],
  metadataBase: new URL("https://someone.help"),
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: "someone.help — someone to talk to",
    description:
      "Anonymous AI chat. No signup. Your thread stays in this browser. Visitor analytics only.",
    url: "https://someone.help",
    siteName: "someone.help",
    type: "website",
    locale: "en_US",
  },
  twitter: {
    card: "summary",
    title: "someone.help",
    description:
      "Anonymous AI chat — someone to talk to. No accounts. No cross-site tracking.",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true },
  },
};

export const viewport: Viewport = {
  themeColor: "#0b0d10",
  width: "device-width",
  initialScale: 1,
  // Allow pinch-zoom (accessibility). `maximumScale: 1` traps low-vision users.
  viewportFit: "cover",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="flex min-h-dvh flex-col">
        <Script
          id="theme-init"
          strategy="beforeInteractive"
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var t=localStorage.getItem('someone.help/theme');if(t==='warm')document.documentElement.setAttribute('data-theme','warm');}catch(e){}})();`,
          }}
        />
        {children}
        {umamiEnabled ? (
          <Script
            src={umamiScriptUrl}
            data-website-id={umamiWebsiteId}
            strategy="afterInteractive"
            defer
          />
        ) : null}
      </body>
    </html>
  );
}
