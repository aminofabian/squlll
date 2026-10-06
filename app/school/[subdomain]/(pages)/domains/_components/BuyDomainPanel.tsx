"use client";

import { useCallback, useEffect, useState } from "react";
import { Loader2, Search, ShoppingCart, Trash2 } from "lucide-react";
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

function normalizeInput(raw: string): string {
  return raw
    .trim()
    .toLowerCase()
    .replace(/^https?:\/\//, "")
    .replace(/^www\./, "")
    .split(/[/?#:]/)[0]
    .replace(/\.$/, "");
}

function price(quote: { priceCents: string | null; currency: string | null }): string {
  if (!quote.priceCents) return quote.currency ? `pricing in ${quote.currency}` : "price set at order";
  const major = Number(quote.priceCents) / 100;
  return `${quote.currency ?? ""} ${major.toLocaleString()}`.trim();
}

function orderStatus(order: DomainOrder): string {
  switch (order.status) {
    case "QUOTED":
      return "Awaiting payment";
    case "AWAITING_PAYMENT":
      return "Waiting for M-Pesa";
    case "REGISTERING":
      return "Registering…";
    case "OWNED":
      return "Registered";
    case "PROVISIONING":
      return "Setting up site";
    case "LIVE":
      return "Live";
    case "FAILED":
      return "Failed";
    case "CANCELLED":
      return "Cancelled";
    default:
      return order.status;
  }
}

export function BuyDomainPanel() {
  const [query, setQuery] = useState("");
  const [quotes, setQuotes] = useState<RegistrarQuote[]>([]);
  const [searching, setSearching] = useState(false);
  const [busy, setBusy] = useState(false);
  const [phone, setPhone] = useState("");
  const [orders, setOrders] = useState<DomainOrder[]>([]);

  const refresh = useCallback(async () => {
    try {
      setOrders(await fetchMyDomainOrders());
    } catch (err) {
      // Non-fatal — the search panel still works.
      console.error(getDisplayErrorMessage(err));
    }
  }, []);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const handleSearch = async () => {
    const value = normalizeInput(query);
    if (!value) return;
    setSearching(true);
    try {
      setQuotes(await searchRegistrarDomains(value));
    } catch (err) {
      toast.error(getDisplayErrorMessage(err));
    } finally {
      setSearching(false);
    }
  };

  const handleOrder = async (fqdn: string) => {
    setBusy(true);
    try {
      const order = await createDomainOrder(fqdn);
      toast.success("Domain added to your orders");
      setQuotes([]);
      await refresh();
      if (!order.paidAt) {
        toast.info("Enter your M-Pesa number to pay, or pay from the order list.");
      }
    } catch (err) {
      toast.error(getDisplayErrorMessage(err));
    } finally {
      setBusy(false);
    }
  };

  const handlePay = async (order: DomainOrder) => {
    if (!phone.trim()) {
      toast.error("Enter the M-Pesa number to charge.");
      return;
    }
    setBusy(true);
    try {
      const updated = await initiateDomainOrderPayment(order.id, phone.trim());
      toast.success(
        updated.paidAt ? "Payment recorded" : "Check your phone to approve the M-Pesa request",
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
    } catch (err) {
      toast.error(getDisplayErrorMessage(err));
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="space-y-6">
      <Card className="border-2 border-border">
        <CardHeader className="bg-muted/50">
          <div className="flex items-center gap-2">
            <ShoppingCart className="h-5 w-5 text-primary" />
            <CardTitle className="text-primary">Buy a domain</CardTitle>
          </div>
          <CardDescription>
            Get a new domain registered for your school. We register it and set
            up your site.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4 pt-6">
          <div className="flex flex-col gap-2 sm:flex-row">
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="yourschool.ac.ke"
              autoComplete="off"
              spellCheck={false}
              className="h-11 border-2 focus:border-primary"
              onKeyDown={(e) => {
                if (e.key === "Enter") void handleSearch();
              }}
            />
            <Button
              onClick={handleSearch}
              disabled={searching || !query.trim()}
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

          {quotes.length ? (
            <div className="space-y-2">
              {quotes.map((quote) => (
                <div
                  key={quote.fqdn}
                  className="flex flex-wrap items-center justify-between gap-3 rounded-md border px-3 py-2"
                >
                  <div>
                    <p className="font-mono text-sm">{quote.fqdn}</p>
                    <p className="text-xs text-muted-foreground">
                      {price(quote)}
                      {quote.note ? ` · ${quote.note}` : ""}
                    </p>
                  </div>
                  <Button
                    size="sm"
                    disabled={busy || quote.available === false}
                    onClick={() => void handleOrder(quote.fqdn)}
                  >
                    {quote.available === false ? "Unavailable" : "Order"}
                  </Button>
                </div>
              ))}
            </div>
          ) : null}
        </CardContent>
      </Card>

      <Card className="border-2 border-border">
        <CardHeader className="bg-muted/50">
          <CardTitle className="text-base">Your domain orders</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 pt-6">
          <div className="space-y-1.5">
            <Label className="text-sm">M-Pesa number for payment</Label>
            <Input
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="07xx xxx xxx"
              className="h-11 border-2 focus:border-primary"
            />
          </div>

          {orders.length === 0 ? (
            <p className="text-sm text-muted-foreground">No domain orders yet.</p>
          ) : (
            <div className="space-y-2">
              {orders.map((order) => (
                <div
                  key={order.id}
                  className="flex flex-wrap items-center justify-between gap-3 rounded-md border px-3 py-2"
                >
                  <div>
                    <p className="font-mono text-sm">{order.fqdn}</p>
                    <p className="text-xs text-muted-foreground">
                      {orderStatus(order)}
                      {order.lastError ? ` · ${order.lastError}` : ""}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="text-[10px] uppercase">
                      {order.status}
                    </Badge>
                    {!order.paidAt &&
                    (order.status === "QUOTED" ||
                      order.status === "AWAITING_PAYMENT") ? (
                      <>
                        <Button
                          size="sm"
                          disabled={busy}
                          onClick={() => void handlePay(order)}
                        >
                          Pay
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
                    ) : null}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
