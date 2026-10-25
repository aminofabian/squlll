"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useParams } from "next/navigation";
import {
  ArrowRight,
  BadgeCheck,
  CheckCircle2,
  Circle,
  Globe,
  Loader2,
  Search,
  ShieldCheck,
  Smartphone,
  Sparkles,
  Trash2,
} from "lucide-react";
import { toast } from "sonner";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import {
  cancelDomainOrder,
  createDomainOrder,
  fetchMyDomainOrders,
  initiateDomainOrderPayment,
  searchRegistrarDomains,
  type DomainOrder,
  type RegistrarQuote,
} from "@/lib/school/domainsApi";
import { getDisplayErrorMessage } from "@/lib/utils/graphql-errors";
import { cn } from "@/lib/utils";

const STANDARD_PRICE = "KES 1,800";
const TLD_OPTIONS = [".co.ke", ".com", ".ac.ke"] as const;
const ORDER_STEPS = ["Paid", "Registering", "Setting up", "Live"] as const;

function normalizeInput(raw: string): string {
  return raw
    .trim()
    .toLowerCase()
    .replace(/^https?:\/\//, "")
    .replace(/^www\./, "")
    .split(/[/?#:]/)[0]
    .replace(/\.$/, "");
}

function formatMoney(cents: string | null, currency: string | null): string {
  if (!cents) return currency ? `Price in ${currency}` : "Price shown at payment";
  const major = Number(cents) / 100;
  if (!Number.isFinite(major)) return "Price shown at payment";
  try {
    return new Intl.NumberFormat("en-KE", {
      style: "currency",
      currency: currency ?? "KES",
      maximumFractionDigits: 0,
    }).format(major);
  } catch {
    return `${currency ?? "KES"} ${major.toLocaleString()}`;
  }
}

function orderStatusLabel(order: DomainOrder): string {
  switch (order.status) {
    case "QUOTED":
      return "Waiting for payment";
    case "AWAITING_PAYMENT":
      return "Approve the M-Pesa request";
    case "REGISTERING":
      return "Registering your domain";
    case "OWNED":
      return "Registered — connecting your site";
    case "PROVISIONING":
      return "Connecting your site";
    case "LIVE":
      return "Live";
    case "FAILED":
      return "Needs attention";
    case "CANCELLED":
      return "Cancelled";
    default:
      return order.status;
  }
}

function orderStep(order: DomainOrder): number {
  switch (order.status) {
    case "REGISTERING":
      return 1;
    case "OWNED":
    case "PROVISIONING":
      return 2;
    case "LIVE":
      return 3;
    case "FAILED":
    case "CANCELLED":
      return -1;
    default:
      return 0;
  }
}

function pipeline(order: DomainOrder) {
  const current = orderStep(order);
  if (current < 0) return null;
  return (
    <ol className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1">
      {ORDER_STEPS.map((label, index) => {
        const done = index < current || order.status === "LIVE";
        return (
          <li
            key={label}
            className={cn(
              "flex items-center gap-1 text-[11px]",
              done
                ? "text-emerald-700 dark:text-emerald-400"
                : index === current
                  ? "font-medium text-foreground"
                  : "text-muted-foreground",
            )}
          >
            {done ? (
              <CheckCircle2 className="h-3.5 w-3.5" />
            ) : (
              <Circle
                className={cn(
                  "h-3.5 w-3.5",
                  index === current ? "text-primary" : "opacity-40",
                )}
              />
            )}
            {label}
          </li>
        );
      })}
    </ol>
  );
}

export function BuyDomainPanel() {
  const routeParams = useParams<{ subdomain?: string }>();
  const subdomain =
    typeof routeParams?.subdomain === "string" ? routeParams.subdomain : "";
  const suggestionName = normalizeInput(subdomain) || "yourschool";

  const [name, setName] = useState(subdomain || "");
  const [tld, setTld] = useState<string>(".co.ke");
  const [quotes, setQuotes] = useState<RegistrarQuote[]>([]);
  const [searchedFor, setSearchedFor] = useState<string | null>(null);
  const [searching, setSearching] = useState(false);
  const [busy, setBusy] = useState(false);
  const [phone, setPhone] = useState("");
  const [orders, setOrders] = useState<DomainOrder[]>([]);
  const ordersRef = useRef<HTMLDivElement | null>(null);

  const nameHasDot = normalizeInput(name).includes(".");

  const chooseTld = (option: string) => {
    const base = normalizeInput(name).replace(/\.(co\.ke|ac\.ke|com|org)$/i, "");
    setName(base);
    setTld(option);
  };

  const fqdn = useMemo(() => {
    const value = normalizeInput(name);
    if (!value) return "";
    return value.includes(".") ? value : `${value}${tld}`;
  }, [name, tld]);

  const refresh = useCallback(async () => {
    try {
      setOrders(await fetchMyDomainOrders());
    } catch (err) {
      // Non-fatal — search and payment help still work.
      console.error(getDisplayErrorMessage(err));
    }
  }, []);

  useEffect(() => {
    let alive = true;
    void (async () => {
      try {
        const rows = await fetchMyDomainOrders();
        if (alive) setOrders(rows);
      } catch (err) {
        // Non-fatal — search and payment help still work.
        console.error(getDisplayErrorMessage(err));
      }
    })();
    return () => {
      alive = false;
    };
  }, []);

  const handleSearch = async (override?: string) => {
    const value = normalizeInput(override ?? fqdn);
    if (!value) return;
    setSearching(true);
    setSearchedFor(value);
    try {
      setQuotes(await searchRegistrarDomains(value));
    } catch (err) {
      toast.error(getDisplayErrorMessage(err));
    } finally {
      setSearching(false);
    }
  };

  const handleOrder = async (target: string) => {
    setBusy(true);
    try {
      await createDomainOrder(target);
      toast.success(`${target} is reserved for you`, {
        description: "Scroll down and pay with M-Pesa to finish.",
      });
      setQuotes([]);
      await refresh();
      ordersRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    } catch (err) {
      toast.error(getDisplayErrorMessage(err));
    } finally {
      setBusy(false);
    }
  };

  const normalizePhone = (raw: string): string | null => {
    const digits = raw.replace(/[^\d+]/g, "");
    return /^(?:\+254|254|0)(7|1)\d{8}$/.test(digits) ? digits : null;
  };

  const handlePay = async (order: DomainOrder) => {
    const msisdn = normalizePhone(phone);
    if (!msisdn) {
      toast.error("Enter a valid M-Pesa number, e.g. 0712 345 678.");
      return;
    }
    setBusy(true);
    try {
      const updated = await initiateDomainOrderPayment(order.id, msisdn);
      toast.success(
        updated.paidAt
          ? "Payment received — we're registering your domain."
          : "Check your phone and enter your M-Pesa PIN to approve.",
      );
      await refresh();
    } catch (err) {
      toast.error(getDisplayErrorMessage(err));
    } finally {
      setBusy(false);
    }
  };

  const handleCancel = async (order: DomainOrder) => {
    setBusy(true);
    try {
      await cancelDomainOrder(order.id);
      await refresh();
      toast.success("Order cancelled.");
    } catch (err) {
      toast.error(getDisplayErrorMessage(err));
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="space-y-6">
      <Card className="overflow-hidden border-2">
        <div className="bg-gradient-to-br from-primary/10 via-background to-emerald-500/10 p-5 sm:p-6">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div className="flex items-start gap-3">
              <div className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-white shadow-sm ring-1 ring-black/5 dark:bg-white/10 dark:ring-white/10">
                <Globe className="h-5 w-5 text-primary" />
              </div>
              <div>
                <h2 className="text-lg font-semibold sm:text-xl">
                  Your school&apos;s name, on the internet
                </h2>
                <p className="mt-1 max-w-xl text-sm leading-relaxed text-muted-foreground">
                  We&apos;ll register it, connect it to your school site and set
                  up the security certificate. You just pick the name and pay
                  with M-Pesa.
                </p>
              </div>
            </div>
            <div className="rounded-xl border bg-background/80 px-4 py-3 text-center">
              <p className="text-[11px] uppercase tracking-wide text-muted-foreground">
                One year
              </p>
              <p className="text-2xl font-semibold">{STANDARD_PRICE}</p>
              <p className="text-[11px] text-muted-foreground">
                final price shown before payment
              </p>
            </div>
          </div>

          <ul className="mt-4 grid gap-2 text-xs text-muted-foreground sm:grid-cols-2">
            {[
              "Your own address, e.g. mirema.co.ke",
              "Security certificate (the padlock)",
              "Connected to your SQUL school site",
              "We handle the technical setup",
            ].map((item) => (
              <li key={item} className="flex items-center gap-2">
                <BadgeCheck className="h-3.5 w-3.5 shrink-0 text-emerald-600" />
                {item}
              </li>
            ))}
          </ul>
        </div>
      </Card>

      <Card className="border-2">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Search className="h-4 w-4 text-primary" />
            Find your address
          </CardTitle>
          <CardDescription>
            Type your school&apos;s name. We&apos;ll check what&apos;s available.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="domain-name" className="text-sm font-medium">
              School name
            </Label>
            <div className="flex flex-col gap-2 sm:flex-row">
              <Input
                id="domain-name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder={suggestionName}
                autoComplete="off"
                spellCheck={false}
                className="h-11 flex-1 border-2 focus:border-primary"
                onKeyDown={(e) => {
                  if (e.key === "Enter") void handleSearch();
                }}
              />
              <Button
                onClick={() => void handleSearch()}
                disabled={searching || !fqdn}
                className="h-11"
              >
                {searching ? (
                  <Loader2 className="mr-1.5 h-4 w-4 animate-spin" />
                ) : (
                  <Search className="mr-1.5 h-4 w-4" />
                )}
                Search
              </Button>
            </div>
          </div>

          <div className="space-y-1.5">
            <p className="text-xs font-medium text-muted-foreground">
              Ending
            </p>
            <div className="flex flex-wrap gap-2">
              {TLD_OPTIONS.map((option) => (
                <button
                  key={option}
                  type="button"
                  onClick={() => chooseTld(option)}
                  className={cn(
                    "rounded-full border px-3 py-1.5 text-sm transition-colors",
                    tld === option && !nameHasDot
                      ? "border-primary bg-primary text-primary-foreground"
                      : "bg-background hover:border-primary/40 hover:bg-primary/5",
                  )}
                >
                  {option}
                </button>
              ))}
              <span className="self-center text-xs text-muted-foreground">
                .co.ke is best for Kenyan schools · .com for international ·
                .ac.ke if you&apos;re an academic institution
              </span>
            </div>
          </div>

          <div className="rounded-lg bg-muted/40 px-3 py-2 text-sm">
            Searching for:{" "}
            <span className="font-mono font-medium">{fqdn || "—"}</span>
          </div>

          <div className="flex flex-wrap gap-2">
            <span className="self-center text-xs text-muted-foreground">
              <Sparkles className="mr-1 inline h-3.5 w-3.5 text-primary" />
              Ideas:
            </span>
            {[`${suggestionName}.co.ke`, `${suggestionName}.com`, `${suggestionName}.org`].map(
              (idea) => (
                <button
                  key={idea}
                  type="button"
                  onClick={() => {
                    setName(idea);
                    void handleSearch(idea);
                  }}
                  className="rounded-full border bg-background px-3 py-1 text-xs hover:border-primary/40 hover:bg-primary/5"
                >
                  {idea}
                </button>
              ),
            )}
          </div>

          {searching ? (
            <p className="flex items-center gap-2 text-sm text-muted-foreground">
              <Loader2 className="h-4 w-4 animate-spin" />
              Checking availability…
            </p>
          ) : null}

          {!searching && searchedFor && quotes.length === 0 ? (
            <div className="rounded-lg border border-dashed p-4 text-sm">
              <p className="font-medium">We couldn&apos;t check that name online.</p>
              <p className="mt-1 text-xs text-muted-foreground">
                You can still buy from a registrar like Truehost or HostPinnacle,
                then add the domain under <strong>My domains</strong> and connect
                it. Or try a different ending above.
              </p>
            </div>
          ) : null}

          {quotes.length ? (
            <div className="space-y-2">
              {quotes.map((quote) => {
                const available = quote.available !== false;
                return (
                  <div
                    key={quote.fqdn}
                    className="flex flex-wrap items-center justify-between gap-3 rounded-xl border p-3"
                  >
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="truncate font-mono text-sm font-medium">
                          {quote.fqdn}
                        </p>
                        <Badge
                          className={cn(
                            "text-[10px] uppercase",
                            available
                              ? "bg-emerald-600 text-white hover:bg-emerald-600"
                              : "bg-red-600 text-white hover:bg-red-600",
                          )}
                        >
                          {quote.available === false
                            ? "Taken"
                            : quote.available === true
                              ? "Available"
                              : "Check at payment"}
                        </Badge>
                      </div>
                      <p className="mt-0.5 text-xs text-muted-foreground">
                        {formatMoney(quote.priceCents, quote.currency)} per year
                        {quote.note ? ` · ${quote.note}` : ""}
                      </p>
                    </div>
                    <Button
                      size="sm"
                      disabled={busy || !available}
                      onClick={() => void handleOrder(quote.fqdn)}
                    >
                      {available ? "Get this domain" : "Unavailable"}
                      {available ? (
                        <ArrowRight className="ml-1.5 h-3.5 w-3.5" />
                      ) : null}
                    </Button>
                  </div>
                );
              })}
            </div>
          ) : null}

          <p className="text-xs text-muted-foreground">
            Prefer to buy elsewhere? Truehost and HostPinnacle work too — then
            add the domain under <strong>My domains</strong> and we&apos;ll help
            you connect it.
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Smartphone className="h-4 w-4 text-primary" />
            Pay with M-Pesa
          </CardTitle>
          <CardDescription>
            Enter the number that should approve the payment. We&apos;ll send a
            request — you enter your PIN on your phone.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-2">
          <Label htmlFor="mpesa-phone" className="text-sm font-medium">
            M-Pesa number
          </Label>
          <Input
            id="mpesa-phone"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="0712 345 678"
            inputMode="tel"
            autoComplete="tel"
            className="h-11 max-w-sm border-2 focus:border-primary"
          />
          <p className="text-xs text-muted-foreground">
            Safaricom line. You can also pay later from your order below — the
            domain is held for you in the meantime.
          </p>
          <div className="flex items-start gap-2 rounded-lg bg-muted/40 p-3 text-xs text-muted-foreground">
            <ShieldCheck className="mt-0.5 h-3.5 w-3.5 shrink-0" />
            <span>
              The exact amount is confirmed before the request is sent. No setup
              fee, no hidden charges.
            </span>
          </div>
        </CardContent>
      </Card>

      <div ref={ordersRef} className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold">Your domain orders</h3>
          {orders.length ? (
            <span className="text-xs text-muted-foreground">
              {orders.length} order{orders.length === 1 ? "" : "s"}
            </span>
          ) : null}
        </div>

        {orders.length === 0 ? (
          <div className="rounded-xl border border-dashed p-6 text-center">
            <Globe className="mx-auto h-8 w-8 text-muted-foreground/60" />
            <p className="mt-2 text-sm font-medium">No orders yet</p>
            <p className="mx-auto mt-1 max-w-sm text-xs text-muted-foreground">
              Search for a name above. Once you pick one, it appears here and you
              can pay with M-Pesa.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {orders.map((order) => {
              const unpaid =
                !order.paidAt &&
                (order.status === "QUOTED" ||
                  order.status === "AWAITING_PAYMENT");
              const failed =
                order.status === "FAILED" || order.status === "CANCELLED";
              return (
                <Card key={order.id}>
                  <CardContent className="space-y-3 pt-5">
                    <div className="flex flex-wrap items-start justify-between gap-2">
                      <div className="min-w-0">
                        <p className="truncate font-mono text-sm font-semibold">
                          {order.fqdn}
                        </p>
                        <p className="mt-0.5 text-xs text-muted-foreground">
                          {orderStatusLabel(order)}
                        </p>
                      </div>
                      <Badge
                        variant="outline"
                        className={cn(
                          "text-[10px]",
                          order.status === "LIVE"
                            ? "border-emerald-600/30 bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400"
                            : failed
                              ? "border-red-300 bg-red-50 text-red-700 dark:bg-red-500/10 dark:text-red-300"
                              : "",
                        )}
                      >
                        {order.status.replace(/_/g, " ")}
                      </Badge>
                    </div>

                    {pipeline(order)}

                    <div className="flex flex-wrap items-center justify-between gap-2 border-t pt-3">
                      <p className="text-sm">
                        <span className="font-semibold">
                          {formatMoney(order.priceCents, order.currency)}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          {" "}
                          · one year
                        </span>
                      </p>
                      <div className="flex items-center gap-2">
                        {unpaid ? (
                          <>
                            <Button
                              size="sm"
                              disabled={busy}
                              onClick={() => void handlePay(order)}
                            >
                              {busy ? (
                                <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />
                              ) : (
                                <Smartphone className="mr-1.5 h-3.5 w-3.5" />
                              )}
                              Pay with M-Pesa
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              className="text-red-600 hover:text-red-700"
                              disabled={busy}
                              onClick={() => void handleCancel(order)}
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </Button>
                          </>
                        ) : order.status === "LIVE" ? (
                          <Button asChild size="sm" variant="outline">
                            <a
                              href={`https://${order.fqdn}`}
                              target="_blank"
                              rel="noreferrer"
                            >
                              Visit site
                              <ArrowRight className="ml-1.5 h-3.5 w-3.5" />
                            </a>
                          </Button>
                        ) : null}
                      </div>
                    </div>

                    {order.lastError ? (
                      <p className="rounded-md bg-amber-50 p-2 text-xs text-amber-800 dark:bg-amber-500/10 dark:text-amber-300">
                        {order.lastError}
                      </p>
                    ) : null}
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">How it works</CardTitle>
        </CardHeader>
        <CardContent>
          <ol className="grid gap-3 sm:grid-cols-3">
            {[
              {
                title: "Pick a name",
                desc: "Search above and choose the address you like.",
              },
              {
                title: "Pay with M-Pesa",
                desc: "Approve the request on your phone. The price is shown first.",
              },
              {
                title: "We do the rest",
                desc: "We register it, connect your site and secure it with a padlock.",
              },
            ].map((step, index) => (
              <li key={step.title} className="rounded-lg border p-3">
                <span className="text-[11px] font-semibold uppercase tracking-wide text-primary">
                  Step {index + 1}
                </span>
                <p className="mt-1 text-sm font-medium">{step.title}</p>
                <p className="mt-0.5 text-xs leading-relaxed text-muted-foreground">
                  {step.desc}
                </p>
              </li>
            ))}
          </ol>
        </CardContent>
      </Card>
    </div>
  );
}
