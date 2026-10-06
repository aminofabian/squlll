import type { Metadata } from "next";
import Link from "next/link";
import {
  ArrowRight,
  CheckCircle2,
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
import { Button } from "@/components/ui/button";
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
} = {
  // connect: { src: "/screenshots/custom-domain-connect.png", alt: "Connecting a custom domain in SQUL" },
  // live: { src: "/screenshots/custom-domain-live.png", alt: "A live custom domain in SQUL" },
  // buy: { src: "/screenshots/custom-domain-buy.png", alt: "Buying a domain with M-Pesa" },
  // registry: { src: "/screenshots/custom-domain-registry.png", alt: "Super-admin domains registry" },
};

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

function StepCard({
  index,
  step,
}: {
  index: number;
  step: (typeof STEPS)[number];
}) {
  const Icon = step.icon;
  return (
    <div className="relative flex h-full flex-col border border-[#1a4d42]/12 bg-white p-6 shadow-sm">
      <div className="mb-4 flex items-center gap-3">
        <span className="flex h-9 w-9 items-center justify-center rounded-full bg-[#1d5547] font-display text-sm font-semibold text-white">
          {index + 1}
        </span>
        <Icon className="h-5 w-5 text-[#246a59]" />
      </div>
      <h3 className="font-display text-lg tracking-tight text-[#0a1f1a]">
        {step.title}
      </h3>
      <p className="mt-2 text-sm leading-relaxed text-[#1a4d42]/70">
        {step.body}
      </p>
    </div>
  );
}

export default function CustomDomainsPage() {
  return (
    <div className="squl-marketing min-h-screen bg-[#f3f7f5] font-sans text-[#0a1f1a]">
      {/* Hero */}
      <div className="relative overflow-hidden bg-[#0a1f1a] text-white">
        <div
          className="pointer-events-none absolute inset-0 opacity-40"
          aria-hidden
          style={{
            backgroundImage:
              "radial-gradient(ellipse 80% 60% at 15% 20%, rgba(36,106,89,0.55), transparent 55%), radial-gradient(ellipse 50% 40% at 90% 10%, rgba(45,133,112,0.35), transparent 50%), linear-gradient(180deg, transparent 60%, #0a1f1a)",
          }}
        />
        <Header variant="hero" />

        <div className="relative mx-auto grid max-w-6xl items-center gap-12 px-4 pb-16 pt-28 sm:px-6 sm:pb-20 sm:pt-32 lg:grid-cols-[1fr_1.05fr] lg:px-8">
          <div>
            <p className="font-ui text-[11px] font-semibold uppercase tracking-[0.2em] text-emerald-300/90">
              Custom domains
            </p>
            <h1 className="mt-3 font-display text-[clamp(2.4rem,6vw,3.75rem)] leading-[1.05] tracking-tight text-white">
              Your school.
              <span className="block">Your name. Your domain.</span>
            </h1>
            <p className="mt-5 max-w-xl text-base leading-relaxed text-white/70 sm:text-lg">
              Put your school site on an address parents already trust —
              <span className="whitespace-nowrap font-medium text-white">
                {" "}
                myschool.ac.ke
              </span>
              — with free, automatically renewed HTTPS. Connect a domain you own,
              or buy a new one and pay with M-Pesa.
            </p>
            <div className="mt-8 flex flex-wrap items-center gap-3">
              <Link href="/register">
                <Button className="h-11 rounded-lg border-0 bg-emerald-500 px-6 font-semibold text-[#0a1f1a] hover:bg-emerald-400">
                  Start free term
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
              <Link href="#how-it-works">
                <Button
                  variant="outline"
                  className="h-11 rounded-lg border-white/25 bg-white/5 px-6 font-semibold text-white hover:bg-white/10"
                >
                  See how it works
                </Button>
              </Link>
            </div>
          </div>

          <div className="relative">
            <LiveDomainPreview image={SHOTS.live} />
            <div className="mt-4 sm:max-w-md">
              <ConnectDomainPreview image={SHOTS.connect} />
            </div>
          </div>
        </div>
      </div>

      {/* How it works */}
      <section id="how-it-works" className="border-b border-[#1a4d42]/10 bg-white">
        <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-20 lg:px-8">
          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#1d5547]">
            How it works
          </p>
          <h2 className="mt-3 max-w-2xl font-display text-3xl tracking-tight text-[#0a1f1a] sm:text-4xl">
            From a domain you own to a live, secure school site
          </h2>
          <p className="mt-4 max-w-2xl text-base leading-relaxed text-[#1a4d42]/70">
            Four steps, no developers. Everything happens inside your SQUL
            dashboard.
          </p>

          <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {STEPS.map((step, i) => (
              <StepCard key={step.title} index={i} step={step} />
            ))}
          </div>
        </div>
      </section>

      {/* Screenshots */}
      <section className="border-b border-[#1a4d42]/10 bg-[#f3f7f5]">
        <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-20 lg:px-8">
          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#1d5547]">
            In the product
          </p>
          <h2 className="mt-3 max-w-2xl font-display text-3xl tracking-tight text-[#0a1f1a] sm:text-4xl">
            What you&apos;ll see
          </h2>

          <div className="mt-10 grid gap-8 lg:grid-cols-2">
            <figure>
              <ConnectDomainPreview image={SHOTS.connect} />
              <figcaption className="mt-3 text-sm text-[#1a4d42]/70">
                <span className="font-semibold text-[#0a1f1a]">
                  Connect and copy the records.
                </span>{" "}
                Paste the A/CNAME and the verification TXT at your registrar.
              </figcaption>
            </figure>
            <figure>
              <LiveDomainPreview image={SHOTS.live} />
              <figcaption className="mt-3 text-sm text-[#1a4d42]/70">
                <span className="font-semibold text-[#0a1f1a]">
                  Verified, secured, live.
                </span>{" "}
                We attach the hostname and issue the certificate.
              </figcaption>
            </figure>
            <figure className="lg:col-span-2">
              <div className="mx-auto max-w-2xl">
                <BuyDomainPreview image={SHOTS.buy} />
              </div>
              <figcaption className="mt-3 text-center text-sm text-[#1a4d42]/70">
                <span className="font-semibold text-[#0a1f1a]">
                  Don&apos;t own one yet?
                </span>{" "}
                Search, order, and pay with M-Pesa — we register it and set it
                up.
              </figcaption>
            </figure>
          </div>
        </div>
      </section>

      {/* Benefits */}
      <section className="border-b border-[#1a4d42]/10 bg-white">
        <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-20 lg:px-8">
          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#1d5547]">
            Why schools use it
          </p>
          <h2 className="mt-3 max-w-2xl font-display text-3xl tracking-tight text-[#0a1f1a] sm:text-4xl">
            A professional address, handled for you
          </h2>

          <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {BENEFITS.map((b) => {
              const Icon = b.icon;
              return (
                <div
                  key={b.title}
                  className="border border-[#1a4d42]/12 bg-[#f8fbfa] p-6"
                >
                  <Icon className="h-5 w-5 text-[#246a59]" />
                  <h3 className="mt-4 font-semibold text-[#0a1f1a]">
                    {b.title}
                  </h3>
                  <p className="mt-2 text-sm leading-relaxed text-[#1a4d42]/70">
                    {b.body}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* For platform operators */}
      <section className="bg-[#0a1f1a] text-white">
        <div className="mx-auto grid max-w-6xl items-center gap-12 px-4 py-16 sm:px-6 sm:py-20 lg:grid-cols-[1fr_1.1fr] lg:px-8">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-emerald-300/90">
              For platform owners
            </p>
            <h2 className="mt-3 font-display text-3xl tracking-tight sm:text-4xl">
              Every domain, one console
            </h2>
            <p className="mt-4 max-w-xl text-base leading-relaxed text-white/70">
              Configure the hosting provider, connect targets, and policy from
              the Super Admin — then keep an eye on every school&apos;s domains
              in one registry. Force a re-check, approve a pending domain, or
              suspend one without touching a database.
            </p>
            <ul className="mt-6 space-y-3 text-sm text-white/80">
              {[
                "Provider credentials & DNS targets in the database, not env files",
                "Approve, suspend, or force-verify any domain",
                "Connect / verify / purchase activity is audited",
              ].map((item) => (
                <li key={item} className="flex items-start gap-2">
                  <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-400" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
          <OperatorRegistryPreview image={SHOTS.registry} />
        </div>
      </section>

      {/* FAQ */}
      <section className="bg-white">
        <div className="mx-auto max-w-4xl px-4 py-16 sm:px-6 sm:py-20 lg:px-8">
          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#1d5547]">
            Questions, answered
          </p>
          <h2 className="mt-3 font-display text-3xl tracking-tight text-[#0a1f1a] sm:text-4xl">
            Before you connect a domain
          </h2>

          <div className="mt-8 divide-y divide-[#1a4d42]/10 border-y border-[#1a4d42]/10">
            {FAQ.map((item) => (
              <details key={item.q} className="group py-5">
                <summary className="flex cursor-pointer list-none items-center justify-between gap-4">
                  <span className="font-medium text-[#0a1f1a]">{item.q}</span>
                  <span className="text-[#246a59] transition-transform group-open:rotate-45">
                    +
                  </span>
                </summary>
                <p className="mt-3 text-sm leading-relaxed text-[#1a4d42]/70">
                  {item.a}
                </p>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="border-t border-[#1a4d42]/12 bg-[#f3f7f5]">
        <div className="mx-auto flex max-w-6xl flex-col items-start justify-between gap-6 px-4 py-14 sm:flex-row sm:items-center sm:px-6 lg:px-8">
          <div>
            <h2 className="font-display text-2xl tracking-tight text-[#0a1f1a] sm:text-3xl">
              Ready to put your school on its own domain?
            </h2>
            <p className="mt-2 max-w-xl text-sm text-[#1a4d42]/70 sm:text-base">
              Start a 90-day free term — then connect or buy your domain in a few
              minutes.
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Link href="/register">
              <Button className="h-11 rounded-lg bg-[#1d5547] px-6 font-semibold text-white hover:bg-[#246a59]">
                Start free term
              </Button>
            </Link>
            <Link href="/login">
              <Button
                variant="outline"
                className="h-11 rounded-lg border-[#1a4d42]/25 px-6 font-semibold text-[#0a1f1a]"
              >
                Sign in
              </Button>
            </Link>
          </div>
        </div>
      </section>

      <footer className="border-t border-emerald-900/25 bg-[#0a1f1a] py-10 text-white">
        <div className="mx-auto flex max-w-6xl flex-col items-start justify-between gap-4 px-4 sm:flex-row sm:items-center sm:px-6 lg:px-8">
          <Link href="/" className="inline-flex items-center gap-2">
            <Globe className="h-5 w-5 text-emerald-300" />
            <span className="font-display text-lg tracking-wide">SQUL</span>
          </Link>
          <p className="text-sm text-white/55">
            School management built for Kenyan classrooms.
          </p>
        </div>
      </footer>
    </div>
  );
}
