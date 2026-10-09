import Link from "next/link";
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
  { label: "Privacy Policy", href: "/privacy" },
  { label: "Terms of Service", href: "/terms" },
];

export function LegalDocument({ title, sections }: LegalDocumentProps) {
  return (
    <div className="min-h-screen bg-white text-gray-800">
      <header className="border-b border-gray-200">
        <nav className="mx-auto flex max-w-3xl items-center justify-between px-4 py-4">
          <Link href="/" className="font-semibold text-emerald-900">
            {LEGAL_META.productName}
          </Link>
          <Link href="/" className="text-sm text-gray-600 hover:text-emerald-800">
            Back to home
          </Link>
        </nav>
      </header>

      <main className="mx-auto max-w-3xl px-4 py-10">
        <h1 className="mb-2 text-3xl font-bold text-gray-900">{title}</h1>
        <p className="mb-8 text-sm text-gray-500">Last updated: {LEGAL_META.lastUpdated}</p>

        {sections.map((section) => (
          <section key={section.heading} className="mb-8">
            <h2 className="mb-3 text-xl font-semibold text-gray-900">{section.heading}</h2>
            {section.paragraphs.map((paragraph) => (
              <p key={paragraph} className="mb-3 leading-relaxed">
                {paragraph}
              </p>
            ))}
          </section>
        ))}
      </main>

      <footer className="border-t border-gray-200">
        <div className="mx-auto flex max-w-3xl flex-wrap justify-between gap-4 px-4 py-6 text-sm text-gray-500">
          <span>© {new Date().getFullYear()} {LEGAL_META.productName}</span>
          <div className="flex gap-6">
            {FOOTER_LINKS.map((link) => (
              <Link key={link.href} href={link.href} className="hover:text-emerald-800">
                {link.label}
              </Link>
            ))}
          </div>
        </div>
      </footer>
    </div>
  );
}
