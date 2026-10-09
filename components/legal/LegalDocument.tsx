import Link from "next/link";
import { Mail, MapPin, Phone, type LucideIcon } from "lucide-react";
import { LEGAL_META } from "@/lib/legal/legal-meta";

type LegalSection = {
  heading: string;
  paragraphs: string[];
};

type LegalDocumentProps = {
  title: string;
  sections: LegalSection[];
};

type ContactItem = {
  icon: LucideIcon;
  label: string;
  value: string;
  href: string | null;
};

const FOOTER_LINKS = [
  { label: "Privacy Policy", href: "/privacy" },
  { label: "Terms of Service", href: "/terms" },
  { label: "Delete account", href: "/account-deletion" },
];

const CONTACT_ITEMS: ContactItem[] = [
  {
    icon: Mail,
    label: "Email",
    value: LEGAL_META.contactEmail,
    href: `mailto:${LEGAL_META.contactEmail}`,
  },
  {
    icon: Phone,
    label: "Phone",
    value: LEGAL_META.contactPhone,
    href: `tel:${LEGAL_META.contactPhoneHref}`,
  },
  {
    icon: MapPin,
    label: "Post",
    value: LEGAL_META.postalAddress,
    href: null,
  },
];

export function LegalDocument({ title, sections }: LegalDocumentProps) {
  return (
    <div className="flex min-h-screen flex-col bg-white text-gray-800">
      <header className="border-b border-gray-200">
        <nav className="mx-auto flex max-w-3xl items-center justify-between px-4 py-4">
          <Link href="/" className="flex items-center gap-2">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-900 text-sm font-bold text-white">
              {LEGAL_META.productName.charAt(0)}
            </span>
            <span className="font-semibold text-emerald-900">
              {LEGAL_META.productName}
            </span>
          </Link>
          <Link href="/" className="text-sm text-gray-600 hover:text-emerald-800">
            Back to home
          </Link>
        </nav>
      </header>

      <main className="mx-auto w-full max-w-3xl flex-1 px-4 py-10">
        <h1 className="mb-2 text-3xl font-bold text-gray-900">{title}</h1>
        <p className="mb-8 text-sm text-gray-500">
          Last updated: {LEGAL_META.lastUpdated}
        </p>

        {sections.map((section) => (
          <section key={section.heading} className="mb-8">
            <h2 className="mb-3 text-xl font-semibold text-gray-900">
              {section.heading}
            </h2>
            {section.paragraphs.map((paragraph) => (
              <p key={paragraph} className="mb-3 leading-relaxed">
                {paragraph}
              </p>
            ))}
          </section>
        ))}
      </main>

      <footer className="border-t border-gray-200 bg-gray-50">
        <div className="mx-auto max-w-3xl px-4 py-10">
          <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
            <h2 className="text-xs font-semibold uppercase tracking-wider text-emerald-900">
              Contact {LEGAL_META.productName}
            </h2>
            <p className="mt-1 text-sm text-gray-500">{LEGAL_META.entityName}</p>

            <ul className="mt-6 grid gap-5 sm:grid-cols-3">
              {CONTACT_ITEMS.map(({ icon: Icon, label, value, href }) => (
                <li key={label} className="flex items-start gap-3">
                  <span className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-emerald-50 text-emerald-800">
                    <Icon className="h-4 w-4" aria-hidden="true" />
                  </span>
                  <span className="min-w-0">
                    <span className="block text-xs font-medium uppercase tracking-wide text-gray-400">
                      {label}
                    </span>
                    {href ? (
                      <a
                        href={href}
                        className="block break-words text-sm font-medium text-gray-800 transition-colors hover:text-emerald-800"
                      >
                        {value}
                      </a>
                    ) : (
                      <span className="block text-sm font-medium text-gray-800">
                        {value}
                      </span>
                    )}
                  </span>
                </li>
              ))}
            </ul>
          </div>

          <div className="mt-8 flex flex-col gap-4 text-sm text-gray-500 sm:flex-row sm:items-center sm:justify-between">
            <span>
              © {new Date().getFullYear()} {LEGAL_META.productName}. All rights reserved.
            </span>
            <nav className="flex flex-wrap gap-x-6 gap-y-2">
              {FOOTER_LINKS.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="transition-colors hover:text-emerald-800"
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
