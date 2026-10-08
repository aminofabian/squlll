"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import { RoutesPanel } from "./_components/RoutesPanel";
import { TripsPanel } from "./_components/TripsPanel";
import { VehiclesPanel } from "./_components/VehiclesPanel";
import { DriversPanel } from "./_components/DriversPanel";
import { LiveMapPanel } from "./_components/LiveMapPanel";
import { CommandCentrePanel } from "./_components/CommandCentrePanel";
import { SafetySettingsPanel } from "./_components/SafetySettingsPanel";

type Tab = "overview" | "live" | "routes" | "trips" | "vehicles" | "drivers" | "settings";

const TABS: { id: Tab; label: string }[] = [
  { id: "overview", label: "Overview" },
  { id: "live", label: "Live map" },
  { id: "routes", label: "Routes & stops" },
  { id: "trips", label: "Trips" },
  { id: "vehicles", label: "Vehicles" },
  { id: "drivers", label: "Drivers" },
  { id: "settings", label: "Settings" },
];

/** School transport administration: the live command map plus route/trip setup. */
export default function TransportPage() {
  const [tab, setTab] = useState<Tab>("overview");

  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-8">
      <div className="mb-6 flex gap-1 overflow-x-auto border-b border-border">
        {TABS.map((item) => (
          <button
            key={item.id}
            type="button"
            onClick={() => setTab(item.id)}
            className={cn(
              "-mb-px whitespace-nowrap border-b-2 px-4 py-2 text-sm font-medium transition-colors",
              tab === item.id
                ? "border-primary text-primary"
                : "border-transparent text-muted-foreground hover:text-foreground",
            )}
          >
            {item.label}
          </button>
        ))}
      </div>

      {tab === "overview" ? <CommandCentrePanel /> : null}
      {tab === "live" ? <LiveMapPanel /> : null}
      {tab === "routes" ? <RoutesPanel /> : null}
      {tab === "trips" ? <TripsPanel /> : null}
      {tab === "vehicles" ? <VehiclesPanel /> : null}
      {tab === "drivers" ? <DriversPanel /> : null}
      {tab === "settings" ? <SafetySettingsPanel /> : null}
    </div>
  );
}
