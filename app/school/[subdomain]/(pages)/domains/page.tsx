"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import { DomainSettingsPanel } from "./_components/DomainSettingsPanel";
import { BuyDomainPanel } from "./_components/BuyDomainPanel";

type Tab = "manage" | "buy";

export default function DomainsPage() {
  const [tab, setTab] = useState<Tab>("manage");

  return (
    <div className="mx-auto w-full max-w-4xl px-4 py-8">
      <div className="mb-6 flex gap-1 border-b border-border">
        {(
          [
            { id: "manage", label: "My domains" },
            { id: "buy", label: "Buy a domain" },
          ] as const
        ).map((item) => (
          <button
            key={item.id}
            type="button"
            onClick={() => setTab(item.id)}
            className={cn(
              "-mb-px border-b-2 px-4 py-2 text-sm font-medium transition-colors",
              tab === item.id
                ? "border-primary text-primary"
                : "border-transparent text-muted-foreground hover:text-foreground",
            )}
          >
            {item.label}
          </button>
        ))}
      </div>

      {tab === "manage" ? <DomainSettingsPanel /> : <BuyDomainPanel />}
    </div>
  );
}
