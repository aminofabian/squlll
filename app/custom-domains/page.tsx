import type { Metadata } from "next";
import Link from "next/link";
import {
  ArrowRight,
  CreditCard,
  Globe,
  Link2,
  Lock,
  MousePointerClick,
  RefreshCw,
  ShieldCheck,
  Sparkles,
  Star,
  Users2,
} from "lucide-react";
import { Header } from "@/components/Header";
import { SqulWordmark } from "@/components/brand/SqulMark";
import {
  BuyDomainPreview,
  ConnectDomainPreview,
  LiveDomainPreview,
  OperatorRegistryPreview,
  type PreviewImage,
} from "@/components/marketing/DomainPreviews";

export const metadata: Metadata = {
  title: "Custom domains | Give your school its own web address",
  description:
    "Run your SQUL school site on a domain you own — like myschool.ac.ke — with free auto-renewed HTTPS. Or buy a new domain and pay with M-Pesa, all from your dashboard.",
  alternates: { canonical: "/custom-domains" },
};

/**
 * Optional real screenshots. Drop captures into `public/screenshots/` and fill
 * these in to swap a mockup for a bitmap — no markup changes needed.
 */
const SHOTS: {
  connect?: PreviewImage;
  live?: PreviewImage;
  buy?: PreviewImage;
  registry?: PreviewImage;
} = {};

const STEPS = [
  {
    icon: Globe,
    title: "Connect your domain",
    body: "Open Dashboard → Settings → Custom domain and type the address you already own. No developer, no support ticket.",
  },
  {
    icon: Link2,
    title: "Add two DNS records",
    body: "We show exactly what to paste at your registrar — an A or CNAME record, plus a TXT record that proves the domain is yours. Leave your email records alone.",
  },
  {
    icon: RefreshCw,
    title: "Check the connection",
    body: "One click verifies your DNS and attaches the hostname. We then issue a free TLS certificate so the site loads over HTTPS.",
  },
  {
    icon: Sparkles,
    title: "Go live",
    body: "Your school opens on your own domain, secured and renewed automatically. Set it as primary and every shared link uses it.",
  },
];

const BENEFITS = [
  {
    icon: ShieldCheck,
    title: "Free, auto-renewed HTTPS",
    body: "Certificates are issued and renewed for you — no expiry surprises, no mixed-content warnings.",
  },
  {
    icon: Lock,
    title: "Your email keeps working",
    body: "We only ask for web records. Your MX and mailboxes stay exactly where they are.",
  },
  {
    icon: Users2,
    title: "Parents recognise you",
    body: "A real address like myschool.ac.ke reads as legitimate — better than a long shared link.",
  },
  {
    icon: Star,
    title: "Choose a primary domain",
    body: "Keep your free SQUL address as a fallback and make the custom domain the one people use.",
  },
  {
    icon: CreditCard,
    title: "Buy a domain with M-Pesa",
    body: "Don't own one yet? Search, order, and pay from the dashboard — we register it and wire up the site.",
  },
  {
    icon: MousePointerClick,
    title: "Managed from Super Admin",
    body: "Providers, DNS targets, and approvals are configured by the platform owner — not buried in config files.",
  },
];

const FAQ = [
  {
    q: "Do I need a developer?",
    a: "No. You paste the records we show into your domain provider's DNS page — the same place you'd change anything else. Most schools finish in a few minutes.",
  },
  {
    q: "Will switching break our school email?",
    a: "No. We only ask for a web A/CNAME record and a verification TXT record. We never touch your MX (mail) records, so inboxes keep working.",
  },
  {
    q: "How long until it's live?",
    a: "As soon as your DNS changes propagate — usually minutes, occasionally a few hours depending on your provider. We can keep checking for you.",
  },
  {
    q: "Does it cost anything?",
    a: "Connecting a domain you already own is included. If you buy a new domain through SQUL, you pay the registrar price at checkout.",
  },
  {
    q: "Can we go back to the SQUL address?",
    a: "Yes. Your free SQUL subdomain stays available; you can remove the custom domain or change which one is primary at any time.",
  },
];

function SectionIntro({
  kicker,
  title,
  description,
  tone = "dark",
}: {
  kicker: string;
  title: React.ReactNode;
  description: string;
  tone?: "dark" | "light";
}) {
  return (
    <div className="grid gap-8 lg:grid-cols-12 lg:gap-10">
      <div className="lg:col-span-6">
        <p className={`mk-eyebrow ${tone === "light" ? "mk-eyebrow--light" : ""}`}>
          {kicker}
        </p>
        <h2 className="mk-h2 mt-6">{title}</h2>
      </div>
      <div className="flex items-end lg:col-span-5 lg:col-start-8">
        <p className="mk-lede">{description}</p>
      </div>
    </div>
  );
}

function StepCard({
  index,
  step,
}: {
  index: number;
  step: (typeof STEPS)[number];
}) {
  const Icon = step.icon;
  return (
    <div className="border-t border-[#14201b]/12 pt-6">
      <div className="flex items-center justify-between">
        <span className="font-mono text-[0.625rem] tabular-nums text-[#14201b]/30">
          {String(index + 1).padStart(2, "0")}
        </span>
        <Icon className="h-4 w-4 text-[#1c3d32]/45" strokeWidth={1.5} aria-hidden />
      </div>
      <h3 className="mt-5 font-display text-[1.25rem] leading-tight tracking-[-0.01em] text-[#14201b]">
        {step.title}
      </h3>
      <p className="mt-2.5 text-[0.8125rem] leading-[1.65] text-[#4d574f]">{step.body}</p>
    </div>
  );
}

export default function CustomDomainsPage() {
  return (
    <div className="squl-marketing min-h-screen bg-[#f7f4ec] text-[#14201b]">
      {/* ── Hero ─────────────────────────────────────────────────────────── */}
      <div className="relative overflow-hidden bg-[#0d201a] text-white">
        <div
          className="pointer-events-none absolute inset-0 opacity-70"
          style={{
            backgroundImage:
              "radial-gradient(ellipse 65% 60% at 18% 15%, rgba(44,87,74,0.55), transparent 62%), radial-gradient(ellipse 40% 40% at 92% 5%, rgba(169,138,85,0.12), transparent 60%)",
          }}
          aria-hidden
        />
        <div className="mk-grain mk-grain--light" aria-hidden />
        <Header variant="hero" />

        <div className="relative mk-container grid items-center gap-14 pb-20 pt-32 lg:grid-cols-12 lg:gap-10 lg:pb-24 lg:pt-40">
          <div className="lg:col-span-6">
            <p className="mk-eyebrow mk-eyebrow--light">Custom domains</p>
            <h1 className="mt-8 font-display text-[clamp(2.7rem,5vw,4.2rem)] leading-[1.0] tracking-[-0.025em] text-[#f7f4ec]">
              Your school.
              <span className="mt-1 block italic text-[#d8c9ab]">
                Your name. Your domain.
              </span>
            </h1>
            <p className="mt-7 max-w-xl text-[1.0625rem] leading-[1.7] text-white/60">
              Put your school site on an address parents already trust —
              <span className="whitespace-nowrap text-white/85"> myschool.ac.ke</span>
              — with free, automatically renewed HTTPS. Connect a domain you own,
              or buy a new one and pay with M-Pesa.
            </p>
            <div className="mt-9 flex flex-col items-stretch gap-3 sm:flex-row sm:items-center">
              <Link href="/register" className="mk-btn mk-btn--paper w-full sm:w-auto">
                Start your free term
                <ArrowRight className="mk-arrow h-4 w-4" aria-hidden />
              </Link>
              <a href="#how-it-works" className="mk-btn mk-btn--ghost-light w-full sm:w-auto">
                See how it works
              </a>
            </div>
          </div>

          <div className="lg:col-span-5 lg:col-start-8">
            <div className="space-y-4">
              <LiveDomainPreview image={SHOTS.live} />
              <div className="sm:ml-8">
                <ConnectDomainPreview image={SHOTS.connect} />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── How it works ─────────────────────────────────────────────────── */}
      <section id="how-it-works" className="mk-section scroll-mt-24">
        <div className="mk-container">
          <SectionIntro
            kicker="How it works"
            title={
              <>
                From a domain you own
                <span className="block">
                  <em>to a live, secure school site.</em>
                </span>
              </>
            }
            description="Four steps, no developers. Everything happens inside your SQUL dashboard."
          />
          <div className="mt-14 grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {STEPS.map((step, i) => (
              <StepCard key={step.title} index={i} step={step} />
            ))}
          </div>
        </div>
      </section>

      {/* ── In the product ───────────────────────────────────────────────── */}
      <section className="mk-section border-t border-[#14201b]/10 bg-[#f2ede0]">
        <div className="mk-container">
          <SectionIntro
            kicker="In the product"
            title="What you'll see."
            description="No DNS jargon in the way — the dashboard tells you exactly which records to add, then verifies them for you."
          />

          <div className="mt-14 grid gap-10 lg:grid-cols-2">
            <figure>
              <ConnectDomainPreview image={SHOTS.connect} />
              <figcaption className="mt-3 text-[0.75rem] leading-relaxed text-[#4d574f]">
                <span className="font-medium text-[#14201b]">
                  Connect and copy the records.
                </span>{" "}
                Paste the A/CNAME and the verification TXT at your registrar.
              </figcaption>
            </figure>
            <figure>
              <LiveDomainPreview image={SHOTS.live} />
              <figcaption className="mt-3 text-[0.75rem] leading-relaxed text-[#4d574f]">
                <span className="font-medium text-[#14201b]">
                  Verified, secured, live.
                </span>{" "}
                We attach the hostname and issue the certificate.
              </figcaption>
            </figure>
            <figure className="lg:col-span-2">
              <div className="mx-auto max-w-2xl">
                <BuyDomainPreview image={SHOTS.buy} />
              </div>
              <figcaption className="mt-3 text-center text-[0.75rem] leading-relaxed text-[#4d574f]">
                <span className="font-medium text-[#14201b]">
                  Don&apos;t own one yet?
                </span>{" "}
                Search, order, and pay with M-Pesa — we register it and set it up.
              </figcaption>
            </figure>
          </div>
        </div>
      </section>

      {/* ── Benefits ─────────────────────────────────────────────────────── */}
      <section className="mk-section">
        <div className="mk-container">
          <SectionIntro
            kicker="Why schools use it"
            title={
              <>
                A professional address,
                <span className="block">
                  <em>handled for you.</em>
                </span>
              </>
            }
            description="One small detail that quietly tells parents, auditors and new staff that the school is well run."
          />

          <div className="mt-14 grid gap-x-10 gap-y-10 sm:grid-cols-2 lg:grid-cols-3">
            {BENEFITS.map((b) => {
              const Icon = b.icon;
              return (
                <div key={b.title} className="border-t border-[#14201b]/12 pt-5">
                  <Icon className="h-4 w-4 text-[#1c3d32]/55" strokeWidth={1.5} aria-hidden />
                  <h3 className="mt-4 text-[0.8125rem] font-medium text-[#14201b]">
                    {b.title}
                  </h3>
                  <p className="mt-2 text-[0.8125rem] leading-[1.65] text-[#4d574f]">
                    {b.body}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── For platform operators ───────────────────────────────────────── */}
      <section className="relative overflow-hidden bg-[#0d201a] text-white">
        <div className="mk-grain mk-grain--light" aria-hidden />
        <div className="relative mk-container grid items-center gap-12 py-20 lg:grid-cols-12 lg:py-24">
          <div className="lg:col-span-5">
            <p className="mk-eyebrow mk-eyebrow--light">For platform owners</p>
            <h2 className="mt-6 font-display text-[clamp(2rem,3.4vw,2.9rem)] leading-[1.05] tracking-[-0.02em]">
              Every domain,
              <span className="block italic text-[#d8c9ab]">one console.</span>
            </h2>
            <p className="mt-5 max-w-xl text-[0.9375rem] leading-[1.7] text-white/55">
              Configure the hosting provider, connect targets, and policy from the
              Super Admin — then keep an eye on every school&apos;s domains in one
              registry. Force a re-check, approve a pending domain, or suspend one
              without touching a database.
            </p>
            <ul className="mt-7">
              {[
                "Provider credentials & DNS targets in the database, not env files",
                "Approve, suspend, or force-verify any domain",
                "Connect / verify / purchase activity is audited",
              ].map((item) => (
                <li
                  key={item}
                  className="flex items-baseline gap-3 border-t border-white/10 py-3 text-[0.8125rem] leading-relaxed text-white/65 last:border-b"
                >
                  <span className="h-[3px] w-[3px] shrink-0 translate-y-[-2px] rounded-full bg-[#d8c9ab]" />
                  {item}
                </li>
              ))}
            </ul>
          </div>
          <div className="lg:col-span-6 lg:col-start-7">
            <OperatorRegistryPreview image={SHOTS.registry} />
          </div>
        </div>
      </section>

      {/* ── FAQ ──────────────────────────────────────────────────────────── */}
      <section className="mk-section">
        <div className="mk-container">
          <div className="grid gap-12 lg:grid-cols-12 lg:gap-8">
            <div className="lg:col-span-4">
              <p className="mk-eyebrow">Questions, answered</p>
              <h2 className="mk-h2 mt-6">
                Before you connect
                <span className="block">
                  <em>a domain.</em>
                </span>
              </h2>
            </div>
            <div className="lg:col-span-7 lg:col-start-6">
              {FAQ.map((item, index) => (
                <details key={item.q} className="group border-t border-[#14201b]/10 last:border-b">
                  <summary className="flex cursor-pointer list-none items-start justify-between gap-6 py-5">
                    <span className="flex items-baseline gap-5">
                      <span className="font-mono text-[0.5625rem] tabular-nums text-[#14201b]/25">
                        {String(index + 1).padStart(2, "0")}
                      </span>
                      <span className="font-display text-[1.25rem] leading-snug tracking-[-0.01em] text-[#14201b] transition-colors duration-200 group-hover:text-[#1c3d32]">
                        {item.q}
                      </span>
                    </span>
                    <span className="relative mt-2 flex h-3 w-3 shrink-0 items-center justify-center">
                      <span className="absolute h-px w-3 bg-[#14201b]/45" aria-hidden />
                      <span className="absolute h-3 w-px bg-[#14201b]/45 transition-transform duration-200 group-open:rotate-90 group-open:opacity-0" aria-hidden />
                    </span>
                  </summary>
                  <p className="max-w-[58ch] pb-6 pl-[2.3rem] pr-10 text-[0.8125rem] leading-[1.7] text-[#4d574f]">
                    {item.a}
                  </p>
                </details>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── CTA ──────────────────────────────────────────────────────────── */}
      <section className="relative overflow-hidden bg-[#0d201a]">
        <div
          className="pointer-events-none absolute inset-0 opacity-60"
          style={{
            backgroundImage:
              "linear-gradient(to right, rgba(247,244,236,0.045) 1px, transparent 1px), linear-gradient(to bottom, rgba(247,244,236,0.045) 1px, transparent 1px)",
            backgroundSize: "88px 44px",
          }}
          aria-hidden
        />
        <div className="mk-grain mk-grain--light" aria-hidden />
        <div className="relative mk-container py-20 text-center sm:py-24">
          <p className="mk-eyebrow mk-eyebrow--light justify-center">Your address</p>
          <h2 className="mx-auto mt-7 max-w-2xl font-display text-[clamp(2.3rem,4.6vw,3.8rem)] leading-[1.04] tracking-[-0.025em] text-[#f7f4ec]">
            Ready to put your school
            <span className="mt-1 block italic text-[#d8c9ab]">on its own domain?</span>
          </h2>
          <p className="mx-auto mt-6 max-w-lg text-[0.9375rem] leading-[1.7] text-white/50">
            Start a 90-day free term — then connect or buy your domain in a few
            minutes.
          </p>
          <div className="mt-9 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Link href="/register" className="mk-btn mk-btn--paper w-full sm:w-auto">
              Start your free term
              <ArrowRight className="mk-arrow h-4 w-4" aria-hidden />
            </Link>
            <Link href="/login" className="mk-btn mk-btn--ghost-light w-full sm:w-auto">
              Sign in
            </Link>
          </div>
        </div>
      </section>

      {/* ── Footer ───────────────────────────────────────────────────────── */}
      <footer className="bg-[#0d201a] text-[#f7f4ec]">
        <div className="mk-container flex flex-col gap-6 border-t border-white/10 py-10 sm:flex-row sm:items-center sm:justify-between">
          <Link href="/" aria-label="SQUL home" className="w-fit">
            <SqulWordmark tone="light" markSize={28} />
          </Link>
          <p className="text-[0.6875rem] leading-relaxed text-white/35">
            School management built for Kenyan classrooms.
          </p>
          <div className="flex gap-6 text-[0.6875rem] text-white/45">
            <Link href="/schools" className="transition-colors hover:text-[#d8c9ab]">
              Schools
            </Link>
            <Link href="/blog" className="transition-colors hover:text-[#d8c9ab]">
              Guides
            </Link>
            <Link href="/privacy" className="transition-colors hover:text-[#d8c9ab]">
              Privacy
            </Link>
            <Link href="/terms" className="transition-colors hover:text-[#d8c9ab]">
              Terms
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
