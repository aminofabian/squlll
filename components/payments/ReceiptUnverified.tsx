import { ShieldAlert } from "lucide-react";

export function ReceiptUnverified() {
  return (
    <div className="mx-auto w-full max-w-lg rounded-2xl border border-border bg-card px-6 py-12 text-center text-card-foreground">
      <ShieldAlert className="mx-auto size-6 text-muted-foreground" aria-hidden />
      <h1 className="mt-4 font-display text-3xl tracking-tight">
        We couldn&apos;t verify this receipt
      </h1>
      <p className="mx-auto mt-2 max-w-sm text-sm leading-relaxed text-muted-foreground">
        The link may be incomplete or out of date. Ask the school office to send
        you a new receipt link.
      </p>
    </div>
  );
}
