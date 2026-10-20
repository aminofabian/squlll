import Link from "next/link";
import { SqulWordmark } from "@/components/brand/SqulMark";
import { LEGAL_META } from "@/lib/legal/legal-meta";

type LegalSection = {
  heading: string;
  paragraphs: string[];
};

type LegalDocumentProps = {
  title: string;
  sections: LegalSection[];
};

const FOOTER_LINKS = [
  { label: "Privacy", href: "/privacy" },
  { label: "Terms", href: "/terms" },
  { label: "Delete account", href: "/account-deletion" },
];

const CONTACT_ITEMS = [
  { label: "Email", value: LEGAL_META.contactEmail, href: `mailto:${LEGAL_META.contactEmail}` },
  { label: "Phone", value: LEGAL_META.contactPhone, href: `tel:${LEGAL_META.contactPhoneHref}` },
  { label: "Post", value: LEGAL_META.postalAddress, href: null },
];

function sectionId(index: number) {
  return `section-${index + 1}`;
}

export function LegalDocument({ title, sections }: LegalDocumentProps) {
  return (
    <div className="squl-marketing flex min-h-screen flex-col bg-[#f7f4ec] text-[#14201b]">
      <header className="border-b border-[#14201b]/10">
        <div className="mk-container flex h-[4.5rem] items-center justify-between gap-6">
          <Link href="/" aria-label="SQUL home" className="transition-opacity hover:opacity-70">
            <SqulWordmark markSize={28} />
          </Link>
          <Link
            href="/"
            className="text-[0.625rem] uppercase tracking-[0.16em] text-[#7c857d] transition-colors duration-200 hover:text-[#14201b]"
          >
            Back to home
          </Link>
        </div>
      </header>

      <main className="flex-1">
        <div className="mk-container border-b border-[#14201b]/10 pb-12 pt-16 sm:pt-20">
          <p className="mk-eyebrow">Legal</p>
          <h1 className="mt-7 max-w-3xl font-display text-[clamp(2.5rem,4.6vw,3.9rem)] leading-[1.02] tracking-[-0.025em] text-[#14201b]">
            {title}
          </h1>
          <p className="mt-5 text-[0.625rem] uppercase tracking-[0.16em] text-[#7c857d]">
            Last updated · {LEGAL_META.lastUpdated}
          </p>
        </div>

        <div className="mk-container grid gap-12 py-14 lg:grid-cols-12 lg:gap-10">
          <aside className="lg:col-span-3">
            <nav aria-label="Contents" className="lg:sticky lg:top-8">
              <p className="mk-caption">Contents</p>
              <ol className="mt-4 border-t border-[#14201b]/10">
                {sections.map((section, index) => (
                  <li key={section.heading}>
                    <a
                      href={`#${sectionId(index)}`}
                      className="group flex items-baseline gap-3 border-b border-[#14201b]/8 py-2.5 text-[0.6875rem] leading-snug text-[#4d574f] transition-colors duration-200 hover:text-[#14201b]"
                    >
                      <span className="font-mono text-[0.5rem] tabular-nums text-[#14201b]/30">
                        {String(index + 1).padStart(2, "0")}
                      </span>
                      {section.heading.replace(/^\d+\.\s*/, "")}
                    </a>
                  </li>
                ))}
              </ol>
            </nav>
          </aside>

          <article className="lg:col-span-8 lg:col-start-5">
            {sections.map((section, index) => (
              <section
                key={section.heading}
                id={sectionId(index)}
                className="scroll-mt-24 border-t border-[#14201b]/10 py-8 first:border-t-0 first:pt-0"
              >
                <h2 className="font-display text-[1.5rem] leading-[1.2] tracking-[-0.015em] text-[#14201b]">
                  {section.heading}
                </h2>
                {section.paragraphs.map((paragraph) => (
                  <p
                    key={paragraph.slice(0, 48)}
                    className="mt-4 text-[0.9375rem] leading-[1.8] text-[#3f4a43]"
                  >
                    {paragraph}
                  </p>
                ))}
              </section>
            ))}
          </article>
        </div>
      </main>

      <footer className="border-t border-[#14201b]/10 bg-[#f2ede0]">
        <div className="mk-container py-12">
          <div className="grid gap-8 sm:grid-cols-3">
            {CONTACT_ITEMS.map((item) => (
              <div key={item.label}>
                <p className="text-[0.5625rem] uppercase tracking-[0.18em] text-[#7c857d]">
                  {item.label}
                </p>
                {item.href ? (
                  <a
                    href={item.href}
                    className="mt-2 block break-words text-[0.8125rem] text-[#14201b] transition-colors hover:text-[#1c3d32]"
                  >
                    {item.value}
                  </a>
                ) : (
                  <p className="mt-2 break-words text-[0.8125rem] leading-relaxed text-[#4d574f]">
                    {item.value}
                  </p>
                )}
              </div>
            ))}
          </div>

          <div className="mt-10 flex flex-col gap-4 border-t border-[#14201b]/10 pt-6 sm:flex-row sm:items-center sm:justify-between">
            <p className="font-mono text-[0.5625rem] uppercase tracking-[0.12em] text-[#7c857d]">
              © {new Date().getFullYear()} {LEGAL_META.productName} · {LEGAL_META.entityName}
            </p>
            <nav className="flex flex-wrap gap-x-6 gap-y-2 text-[0.625rem] text-[#7c857d]">
              {FOOTER_LINKS.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="transition-colors duration-200 hover:text-[#14201b]"
                >
                  {link.label}
                </Link>
              ))}
            </nav>
          </div>
        </div>
      </footer>
    </div>
  );
}
