import Link from 'next/link'
import { SqulWordmark } from '@/components/brand/SqulMark'

/**
 * Shared chrome for the password-recovery pages.
 * Paper background, hairline edges, one narrow column — no admin-template chrome.
 */
export function AuthRecoveryShell({
  kicker,
  title,
  description,
  children,
}: {
  kicker: string
  title: string
  description: string
  children: React.ReactNode
}) {
  return (
    <div className="onboarding-flow flex min-h-screen flex-col bg-[#f7f4ec] font-sans text-[#14201b]">
      <header className="mx-auto flex w-full max-w-[84rem] items-center justify-between gap-6 px-6 py-6 lg:px-10">
        <Link href="/" aria-label="SQUL home" className="transition-opacity hover:opacity-70">
          <SqulWordmark markSize={28} />
        </Link>
        <Link
          href="/login"
          className="text-[0.625rem] uppercase tracking-[0.16em] text-[#7c857d] transition-colors duration-200 hover:text-[#14201b]"
        >
          Back to sign in
        </Link>
      </header>

      <main className="flex flex-1 items-center justify-center px-6 py-12 sm:py-16">
        <div className="w-full max-w-[26rem]">
          <p className="mk-eyebrow">{kicker}</p>
          <h1 className="mt-6 font-display text-[2.4rem] leading-[1.03] tracking-[-0.02em] text-[#14201b]">
            {title}
          </h1>
          <p className="mt-4 text-[0.8125rem] leading-[1.7] text-[#4d574f]">{description}</p>
          <div className="mt-9">{children}</div>
        </div>
      </main>

      <footer className="mx-auto flex w-full max-w-[84rem] items-center justify-between border-t border-[#14201b]/10 px-6 py-5 lg:px-10">
        <p className="font-mono text-[0.5625rem] uppercase tracking-[0.12em] text-[#7c857d]">
          © {new Date().getFullYear()} SQUL
        </p>
        <div className="flex gap-5 text-[0.625rem] text-[#7c857d]">
          <Link href="/privacy" className="transition-colors hover:text-[#14201b]">
            Privacy
          </Link>
          <Link href="/terms" className="transition-colors hover:text-[#14201b]">
            Terms
          </Link>
        </div>
      </footer>
    </div>
  )
}
