import Link from "next/link";
import { CrisisFooter } from "@/components/CrisisFooter";

export default function NotFound() {
  return (
    <>
      <main className="flex-1 w-full flex items-center justify-center px-3 min-[400px]:px-4 py-10 min-h-[70dvh] pt-[max(2.5rem,env(safe-area-inset-top))]">
        <div className="text-center max-w-md">
          <p className="text-sm uppercase tracking-widest text-[var(--color-fg-dim)] mb-3">
            404
          </p>
          <h1 className="text-xl min-[400px]:text-2xl font-semibold mb-3 px-1">
            this page took a wrong turn
          </h1>
          <p className="text-[var(--color-fg-muted)] mb-8 text-base leading-relaxed">
            but you&rsquo;re still welcome here. wanna chat?
          </p>
          <Link
            href="/"
            className="touch-manip inline-flex min-h-11 items-center justify-center rounded-xl px-6 text-base font-medium bg-[var(--color-accent)] text-[var(--color-bg)] hover:opacity-90 active:opacity-80 transition"
          >
            go to chat
          </Link>
        </div>
      </main>
      <CrisisFooter />
    </>
  );
}
