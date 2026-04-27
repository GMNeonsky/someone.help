import Link from "next/link";
import type { Metadata } from "next";
import { CrisisFooter } from "@/components/CrisisFooter";

const SITE = "https://someone.help";

export const metadata: Metadata = {
  title: "About & privacy",
  description:
    "What someone.help is: anonymous AI chat, no account, conversations in your browser only. What we track (visitor counts only) and what we never do.",
  keywords: [
    "someone.help",
    "anonymous AI chat",
    "privacy",
    "no tracking",
    "privacy-friendly analytics",
    "Together AI",
    "localStorage",
  ],
  alternates: {
    canonical: "/about",
  },
  openGraph: {
    title: "About someone.help — privacy & how it works",
    description:
      "Honest details: no accounts, chats stay in your browser, visitor-only analytics, crisis resources.",
    url: `${SITE}/about`,
    type: "article",
  },
};

const jsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "WebSite",
      "@id": `${SITE}/#website`,
      url: SITE,
      name: "someone.help",
      description:
        "Anonymous AI chat when you need someone to listen. No signup.",
      publisher: { "@id": `${SITE}/#org` },
      inLanguage: "en-US",
    },
    {
      "@type": "Organization",
      "@id": `${SITE}/#org`,
      name: "someone.help",
      url: SITE,
    },
    {
      "@type": "WebPage",
      "@id": `${SITE}/about/#webpage`,
      url: `${SITE}/about`,
      name: "About someone.help",
      isPartOf: { "@id": `${SITE}/#website` },
      description:
        "Privacy policy and plain-language explanation of the service.",
      inLanguage: "en-US",
    },
    {
      "@type": "FAQPage",
      "@id": `${SITE}/about/#faq`,
      mainEntity: [
        {
          "@type": "Question",
          name: "Is someone.help anonymous?",
          acceptedAnswer: {
            "@type": "Answer",
            text: "You do not create an account. A random ID is stored in your browser for fair rate limits. Your conversation text is kept in your browser (localStorage), not on our servers.",
          },
        },
        {
          "@type": "Question",
          name: "Does someone.help track me across the web?",
          acceptedAnswer: {
            "@type": "Answer",
            text: "No cross-site tracking or ad pixels. If aggregate pageview analytics are enabled, they are privacy-focused (no cookies for analytics, no behavioral profiling).",
          },
        },
        {
          "@type": "Question",
          name: "Is someone.help therapy?",
          acceptedAnswer: {
            "@type": "Answer",
            text: "No. It is not a human, not a clinician, and not a crisis service. For active crisis, use 988, text HOME to 741741, or findahelpline.com.",
          },
        },
      ],
    },
  ],
};

export default function AboutPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <main className="flex-1 w-full">
        <header className="w-full shrink-0 border-b border-[var(--color-border)] bg-[var(--color-bg)]/80 backdrop-blur sticky top-0 z-10 pt-[env(safe-area-inset-top,0px)] supports-[backdrop-filter]:bg-[var(--color-bg)]/70">
          <div className="mx-auto max-w-2xl px-3 min-[400px]:px-4 py-3 flex flex-wrap items-center justify-between gap-2">
            <h1 className="text-sm font-medium tracking-tight text-[var(--color-fg)] min-h-11 inline-flex items-center">
              someone.help / about
            </h1>
            <Link
              href="/"
              className="touch-manip inline-flex min-h-11 items-center text-xs text-[var(--color-fg-muted)] hover:text-[var(--color-fg)] active:opacity-80 transition rounded-lg px-1 -mr-1"
            >
              ← back to chat
            </Link>
          </div>
        </header>

        <article className="mx-auto max-w-2xl px-3 min-[400px]:px-4 py-8 sm:py-10 pb-[max(2.5rem,env(safe-area-inset-bottom))] text-base sm:text-[15px] leading-relaxed text-[var(--color-fg)] [overflow-wrap:anywhere]">
          <p className="text-[var(--color-fg-muted)] mb-10">
            This page exists for humans <em>and</em> search engines: what this
            site is, what it isn&rsquo;t, and exactly what happens to what you
            type.
          </p>

          <h2 className="text-2xl font-semibold tracking-tight mb-4 text-[var(--color-fg)]">
            what this is
          </h2>
          <p className="mb-4 text-[var(--color-fg-muted)]">
            someone.help is a free, anonymous AI you can talk to when you want
            a stranger on the other end of the line — not a profile, not a
            performance, no signup. Open the page, pick a tone that fits you,
            and start typing.
          </p>
          <p className="mb-8 text-[var(--color-fg-muted)]">
            It&rsquo;s for the small kind of bad day: venting, thinking out
            loud, needing a back-and-forth with someone who isn&rsquo;t already
            in your life.
          </p>

          <h2 className="text-2xl font-semibold tracking-tight mb-4 text-[var(--color-fg)]">
            what this isn&rsquo;t
          </h2>
          <ul className="mb-8 space-y-2 text-[var(--color-fg-muted)] list-disc pl-5">
            <li>Not a real person.</li>
            <li>Not therapy, counseling, or clinical care.</li>
            <li>Not a coach, doctor, lawyer, or financial advisor.</li>
            <li>
              Not the right place for an active crisis. If you might hurt
              yourself or someone else, please reach humans who are trained
              for this:
            </li>
          </ul>
          <ul className="mb-8 space-y-1 text-[var(--color-fg)] list-none pl-5">
            <li>
              <strong>US:</strong>{" "}
              <a
                className="underline hover:text-[var(--color-accent)]"
                href="tel:988"
              >
                988
              </a>{" "}
              (call or text — Suicide &amp; Crisis Lifeline)
            </li>
            <li>
              <strong>US text:</strong>{" "}
              <a
                className="underline hover:text-[var(--color-accent)]"
                href="sms:741741?body=HOME"
              >
                text HOME to 741741
              </a>{" "}
              (Crisis Text Line)
            </li>
            <li>
              <strong>UK / IE:</strong> Samaritans —{" "}
              <a
                className="underline hover:text-[var(--color-accent)]"
                href="tel:116123"
              >
                116 123
              </a>{" "}
              (free, 24/7)
            </li>
            <li>
              <strong>Anywhere else:</strong>{" "}
              <a
                className="underline hover:text-[var(--color-accent)]"
                href="https://findahelpline.com"
                target="_blank"
                rel="noopener noreferrer"
              >
                findahelpline.com
              </a>
            </li>
          </ul>

          <h2 className="text-2xl font-semibold tracking-tight mb-4 text-[var(--color-fg)]">
            analytics &amp; privacy (the honest version)
          </h2>
          <p className="mb-4 text-[var(--color-fg-muted)]">
            We are aggressively boring about tracking.
          </p>
          <ul className="mb-8 space-y-2 text-[var(--color-fg-muted)] list-disc pl-5">
            <li>
              <strong>Visitor counts only (if enabled).</strong> The public
              deployment may use privacy-focused aggregate analytics so we can
              see things like &ldquo;how many people opened the site
              today&rdquo; — not who they are, not what they typed, not where
              they clicked after. Your chat content is never sent to analytics.
            </li>
            <li>
              <strong>No creepy stuff:</strong> no ad pixels, no cross-site
              tracking, no analytics cookies for behavior, no selling data.
            </li>
            <li>
              <strong>Your thread stays in your browser.</strong> It lives in{" "}
              <code className="text-[var(--color-fg)] text-sm bg-[var(--color-bg-elev)] px-1 rounded">
                localStorage
              </code>
              . Clear storage, close the tab, or hit <em>start fresh</em> on
              the chat page — we don&rsquo;t keep a copy.
            </li>
            <li>
              <strong>Anonymous ID for fairness.</strong> A UUID is generated in
              your browser so we can rate-limit without knowing your name,
              email, or IP inside the app. (A CDN or host may still see network
              data for abuse protection — the app does not store chat or IP
              addresses.)
            </li>
            <li>
              <strong>AI provider.</strong> Messages are sent to Together AI to
              generate a reply. They may retain content briefly for abuse
              review per their policy; they do <strong>not</strong> train on
              your conversations. If that ever changes, we change provider or
              this page.
            </li>
          </ul>

          <h2 className="text-2xl font-semibold tracking-tight mb-4 text-[var(--color-fg)]">
            SEO &amp; findability
          </h2>
          <p className="mb-8 text-[var(--color-fg-muted)]">
            We publish a public{" "}
            <Link
              href="/sitemap.xml"
              className="underline hover:text-[var(--color-accent)]"
            >
              sitemap
            </Link>{" "}
            and{" "}
            <Link
              href="/robots.txt"
              className="underline hover:text-[var(--color-accent)]"
            >
              robots.txt
            </Link>{" "}
            so search engines can index this about page and the home
            experience fairly — without hiding how the service works.
          </p>

          <h2 className="text-2xl font-semibold tracking-tight mb-4 text-[var(--color-fg)]">
            helper tones
          </h2>
          <p className="mb-8 text-[var(--color-fg-muted)]">
            On the chat page you can pick a style — nice, stern, fun, chill,
            or the default &ldquo;real&rdquo; voice. Same safety rules
            everywhere; the model just leans the vibe you asked for.
          </p>

          <h2 className="text-2xl font-semibold tracking-tight mb-4 text-[var(--color-fg)]">
            if this grows
          </h2>
          <p className="mb-8 text-[var(--color-fg-muted)]">
            If enough people use it, we can run the model on our own hardware
            so fewer bits leave our network. The architecture is meant to
            make that swap invisible to you.
          </p>

          <h2 className="text-2xl font-semibold tracking-tight mb-4 text-[var(--color-fg)]">
            who made this
          </h2>
          <p className="mb-8 text-[var(--color-fg-muted)]">
            People who think the world could use a few more places to be heard.
            If you have a source checkout, use the repository it came from for
            issues and changes.
          </p>

          <p className="text-xs text-[var(--color-fg-dim)] mt-12">
            This page is the truth. If anything material changes — data flow,
            providers, retention — we update here first.
          </p>
        </article>
      </main>
      <CrisisFooter />
    </>
  );
}
