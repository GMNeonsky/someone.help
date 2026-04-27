import Link from "next/link";
import { ThemeToggle } from "@/components/ThemeToggle";

export function CrisisFooter() {
  return (
    <footer className="w-full shrink-0 border-t border-[var(--color-border)] bg-[var(--color-bg)] text-[var(--color-fg-muted)] text-xs pb-[env(safe-area-inset-bottom,0px)]">
      <div className="mx-auto max-w-2xl px-3 min-[400px]:px-4 py-3 flex flex-col min-[480px]:flex-row min-[480px]:flex-wrap min-[480px]:items-center min-[480px]:justify-between gap-3">
        <p className="leading-relaxed text-[13px] sm:text-xs [overflow-wrap:anywhere]">
          Not a real person. Not therapy. If you&rsquo;re in crisis:{" "}
          <a
            href="tel:988"
            className="touch-manip text-[var(--color-fg)] hover:text-[var(--color-accent)] underline-offset-2 hover:underline py-2 px-0.5 -mx-0.5 rounded-lg inline-block"
          >
            988
          </a>
          {" · "}
          <a
            href="sms:741741?body=HOME"
            className="touch-manip text-[var(--color-fg)] hover:text-[var(--color-accent)] underline-offset-2 hover:underline py-2 px-0.5 -mx-0.5 rounded-lg inline-block"
          >
            text HOME to 741741
          </a>
          {" · "}
          <a
            href="https://findahelpline.com"
            target="_blank"
            rel="noopener noreferrer"
            className="touch-manip text-[var(--color-fg)] hover:text-[var(--color-accent)] underline-offset-2 hover:underline py-2 px-0.5 -mx-0.5 rounded-lg inline-block"
          >
            international
          </a>
        </p>
        <div className="flex items-center gap-3 shrink-0">
          <ThemeToggle />
          <Link
            href="/about"
            className="touch-manip inline-flex min-h-11 items-center text-[var(--color-fg-muted)] hover:text-[var(--color-fg)] underline-offset-2 hover:underline py-1"
          >
            about &amp; privacy
          </Link>
        </div>
      </div>
    </footer>
  );
}
