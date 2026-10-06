import {
  ArrowRight,
  CheckCircle2,
  Copy,
  Globe,
  Loader2,
  Lock,
  RefreshCw,
  Search,
  ShieldCheck,
  Star,
} from "lucide-react";

/**
 * Product previews used on marketing surfaces.
 *
 * By default these render hand-built UI mockups so they stay crisp and themed.
 * Pass an `image` (a real capture dropped into `public/screenshots/`) to swap a
 * mockup for a bitmap without touching the page — see `PreviewImage`.
 */
export interface PreviewImage {
  src: string;
  alt: string;
}

function BrowserFrame({
  url,
  image,
  children,
  className = "",
}: {
  url: string;
  image?: PreviewImage;
  children?: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={`overflow-hidden rounded-xl border border-[#1a4d42]/15 bg-white shadow-[0_24px_60px_-30px_rgba(10,31,26,0.45)] ${className}`}
    >
      <div className="flex items-center gap-2 border-b border-[#1a4d42]/10 bg-[#f3f7f5] px-3 py-2">
        <span className="h-2.5 w-2.5 rounded-full bg-[#e0736a]" />
        <span className="h-2.5 w-2.5 rounded-full bg-[#e6b95c]" />
        <span className="h-2.5 w-2.5 rounded-full bg-[#63b37a]" />
        <div className="ml-3 flex min-w-0 flex-1 items-center gap-1.5 rounded-md border border-[#1a4d42]/10 bg-white px-2 py-1">
          <Lock className="h-3 w-3 shrink-0 text-emerald-600" />
          <span className="truncate font-mono text-[11px] text-[#1a4d42]/70">
            {url}
          </span>
        </div>
      </div>
      {image ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={image.src}
          alt={image.alt}
          loading="lazy"
          className="block w-full"
        />
      ) : (
        <div className="bg-white p-3 sm:p-4">{children}</div>
      )}
    </div>
  );
}

function Chip({
  tone,
  children,
}: {
  tone: "pending" | "verifying" | "live";
  children: React.ReactNode;
}) {
  const tones = {
    pending: "border-[#1a4d42]/20 bg-[#f3f7f5] text-[#1a4d42]/70",
    verifying: "border-amber-300 bg-amber-50 text-amber-700",
    live: "border-emerald-600 bg-emerald-600 text-white",
  } as const;
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide ${tones[tone]}`}
    >
      {children}
    </span>
  );
}

function DnsRow({
  type,
  name,
  value,
}: {
  type: string;
  name: string;
  value: string;
}) {
  return (
    <div className="grid grid-cols-[auto_1fr_auto] items-center gap-2 border-t border-[#1a4d42]/8 px-3 py-2 first:border-t-0">
      <span className="rounded bg-[#eef4f1] px-1.5 py-0.5 font-mono text-[10px] font-bold text-[#1d5547]">
        {type}
      </span>
      <div className="min-w-0">
        <p className="font-mono text-[11px] text-[#0a1f1a]">{name}</p>
        <p className="truncate font-mono text-[10px] text-[#1a4d42]/60">
          {value}
        </p>
      </div>
      <Copy className="h-3.5 w-3.5 text-[#1a4d42]/40" />
    </div>
  );
}

/** Screenshot 1 — the school admin adds their domain and gets DNS records. */
export function ConnectDomainPreview({
  className = "",
  image,
}: {
  className?: string;
  image?: PreviewImage;
}) {
  return (
    <BrowserFrame
      url="mirema.squl.co.ke/settings/domains"
      image={image}
      className={className}
    >
      <div className="mb-3 flex items-center gap-2">
        <span className="flex h-7 w-7 items-center justify-center rounded-md bg-[#eef4f1]">
          <Globe className="h-4 w-4 text-[#246a59]" />
        </span>
        <div>
          <p className="text-sm font-semibold text-[#0a1f1a]">Custom domain</p>
          <p className="text-[11px] text-[#1a4d42]/60">
            Point a domain you own at your school site.
          </p>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <div className="flex h-9 flex-1 items-center rounded-md border border-[#1a4d42]/20 px-3 font-mono text-xs text-[#1a4d42]/50">
          school.ac.ke
        </div>
        <span className="inline-flex h-9 items-center rounded-md bg-[#246a59] px-3 text-xs font-semibold text-white">
          Add domain
        </span>
      </div>

      <div className="mt-3 rounded-lg border border-[#1a4d42]/12">
        <div className="flex items-center justify-between px-3 py-2">
          <span className="font-mono text-xs font-medium text-[#0a1f1a]">
            mirema.ac.ke
          </span>
          <Chip tone="pending">Add DNS records</Chip>
        </div>
        <DnsRow type="A" name="@" value="148.113.255.170" />
        <DnsRow type="CNAME" name="www" value="connect.squl.co.ke" />
        <DnsRow
          type="TXT"
          name="_squl-verify.mirema.ac.ke"
          value="squl-verify=8f3c1a9d…"
        />
      </div>

      <div className="mt-3 flex gap-2">
        <span className="inline-flex h-8 items-center gap-1.5 rounded-md bg-[#246a59] px-3 text-xs font-semibold text-white">
          <RefreshCw className="h-3.5 w-3.5" />
          Check connection
        </span>
        <span className="inline-flex h-8 items-center rounded-md border border-[#1a4d42]/20 px-3 text-xs font-medium text-[#1a4d42]/70">
          Remove
        </span>
      </div>
    </BrowserFrame>
  );
}

/** Screenshot 2 — the domain is live, with the certificate issued. */
export function LiveDomainPreview({
  className = "",
  image,
}: {
  className?: string;
  image?: PreviewImage;
}) {
  const steps = ["DNS records added", "Certificate issued", "Live over HTTPS"];
  return (
    <BrowserFrame url="mirema.ac.ke" image={image} className={className}>
      <div className="flex items-center justify-between rounded-lg border border-[#1a4d42]/12 px-3 py-2.5">
        <div className="flex items-center gap-2">
          <Globe className="h-4 w-4 text-[#246a59]" />
          <span className="text-sm font-medium text-[#0a1f1a]">
            mirema.ac.ke
          </span>
          <span className="rounded-full border border-[#1a4d42]/15 px-2 py-0.5 text-[10px] font-semibold text-[#1a4d42]/70">
            Primary
          </span>
        </div>
        <Chip tone="live">
          <CheckCircle2 className="h-3 w-3" />
          Live
        </Chip>
      </div>

      <div className="mt-3 space-y-2 rounded-lg bg-[#f3f7f5] p-3">
        {steps.map((label) => (
          <div key={label} className="flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4 text-emerald-600" />
            <span className="text-xs text-[#0a1f1a]">{label}</span>
          </div>
        ))}
      </div>

      <div className="mt-3 flex items-center gap-2 rounded-lg border border-emerald-600/25 bg-emerald-50 px-3 py-2">
        <ShieldCheck className="h-4 w-4 text-emerald-700" />
        <span className="text-xs text-emerald-800">
          Secured with a free TLS certificate — renewed automatically.
        </span>
      </div>
    </BrowserFrame>
  );
}

/** Screenshot 3 — buy a brand-new domain, paid with M-Pesa. */
export function BuyDomainPreview({
  className = "",
  image,
}: {
  className?: string;
  image?: PreviewImage;
}) {
  return (
    <BrowserFrame
      url="mirema.squl.co.ke/settings/domains#buy"
      image={image}
      className={className}
    >
      <div className="mb-3 flex items-center gap-2">
        <span className="flex h-7 w-7 items-center justify-center rounded-md bg-[#eef4f1]">
          <Globe className="h-4 w-4 text-[#246a59]" />
        </span>
        <p className="text-sm font-semibold text-[#0a1f1a]">Buy a domain</p>
      </div>

      <div className="flex items-center gap-2">
        <div className="flex h-9 flex-1 items-center gap-2 rounded-md border border-[#1a4d42]/20 px-3">
          <Search className="h-3.5 w-3.5 text-[#1a4d42]/40" />
          <span className="font-mono text-xs text-[#1a4d42]/70">
            myschool.co.ke
          </span>
        </div>
        <span className="inline-flex h-9 items-center rounded-md bg-[#246a59] px-3 text-xs font-semibold text-white">
          Search
        </span>
      </div>

      <div className="mt-3 flex items-center justify-between rounded-lg border border-[#1a4d42]/12 px-3 py-2.5">
        <div>
          <p className="font-mono text-xs text-[#0a1f1a]">myschool.co.ke</p>
          <p className="text-[11px] text-[#1a4d42]/60">KES 1,500 / year</p>
        </div>
        <span className="inline-flex h-8 items-center rounded-md bg-[#246a59] px-3 text-xs font-semibold text-white">
          Order
        </span>
      </div>

      <div className="mt-2 flex items-center justify-between rounded-lg border border-[#1a4d42]/12 px-3 py-2.5">
        <div>
          <p className="font-mono text-xs text-[#0a1f1a]">myschool.co.ke</p>
          <p className="text-[11px] text-[#1a4d42]/60">Waiting for M-Pesa</p>
        </div>
        <Chip tone="verifying">
          <Loader2 className="h-3 w-3" />
          Paying
        </Chip>
      </div>
    </BrowserFrame>
  );
}

/** Screenshot 4 — the platform operator registry (super admin). */
export function OperatorRegistryPreview({
  className = "",
  image,
}: {
  className?: string;
  image?: PreviewImage;
}) {
  const rows: Array<{
    host: string;
    school: string;
    status: string;
    tone: "live" | "verifying" | "pending";
  }> = [
    { host: "mirema.ac.ke", school: "Mirema School", status: "LIVE", tone: "live" },
    { host: "shalom.sc.ke", school: "Shalom Academy", status: "VERIFYING", tone: "verifying" },
    { host: "trinity.co.ke", school: "Trinity High", status: "PENDING", tone: "pending" },
  ];
  return (
    <BrowserFrame
      url="squl.co.ke/dashboard/domains"
      image={image}
      className={className}
    >
      <div className="mb-3 flex items-center justify-between">
        <p className="text-sm font-semibold text-[#0a1f1a]">Domains</p>
        <span className="inline-flex h-7 items-center rounded-md border border-[#1a4d42]/20 px-2.5 text-[11px] font-medium text-[#1a4d42]/70">
          <Star className="mr-1 h-3 w-3" />
          Provider settings
        </span>
      </div>
      <div className="overflow-hidden rounded-lg border border-[#1a4d42]/12">
        <div className="grid grid-cols-[1.2fr_1fr_auto] gap-2 bg-[#f3f7f5] px-3 py-2 text-[10px] font-semibold uppercase tracking-wide text-[#1a4d42]/55">
          <span>Domain</span>
          <span>School</span>
          <span>Status</span>
        </div>
        {rows.map((r) => (
          <div
            key={r.host}
            className="grid grid-cols-[1.2fr_1fr_auto] items-center gap-2 border-t border-[#1a4d42]/8 px-3 py-2"
          >
            <span className="font-mono text-[11px] text-[#0a1f1a]">
              {r.host}
            </span>
            <span className="truncate text-[11px] text-[#1a4d42]/70">
              {r.school}
            </span>
            <Chip tone={r.tone}>{r.status}</Chip>
          </div>
        ))}
      </div>
    </BrowserFrame>
  );
}

/** Compact teaser used on the homepage. */
export function DomainTeaserPreview({
  images,
}: {
  images?: { connect?: PreviewImage; live?: PreviewImage };
}) {
  return (
    <div className="grid gap-4 sm:grid-cols-2">
      <ConnectDomainPreview image={images?.connect} />
      <LiveDomainPreview image={images?.live} />
    </div>
  );
}

export function DomainPreviewArrow() {
  return <ArrowRight className="h-4 w-4" />;
}
