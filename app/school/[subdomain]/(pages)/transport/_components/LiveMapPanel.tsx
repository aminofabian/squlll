"use client";

import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import { io, type Socket } from "socket.io-client";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { getDisplayErrorMessage } from "@/lib/utils/graphql-errors";
import { fetchAccessToken } from "@/lib/realtime/getAccessToken";
import {
  fetchLiveBuses,
  fetchTransportMapConfig,
  type LiveBus,
  type TransportMapConfig,
} from "@/lib/school/transportApi";
import { upsertLiveBus, type PositionEvent } from "@/lib/school/transportLive";
import { LiveBusesMap } from "@/components/transport/LiveBusesMap";

function clock(iso?: string | null): string {
  return iso ? new Date(iso).toLocaleTimeString() : "—";
}

/**
 * School command map: every active bus in the tenant, live over the `/transport`
 * socket (admins auto-join the tenant room), with a `liveTenantBuses` snapshot for
 * cold load and a slow poll as a safety net.
 */
export function LiveMapPanel() {
  const [buses, setBuses] = useState<LiveBus[]>([]);
  const [config, setConfig] = useState<TransportMapConfig | null>(null);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<string | null>(null);
  const [connected, setConnected] = useState(false);

  const load = useCallback(async () => {
    try {
      setBuses(await fetchLiveBuses());
    } catch (err) {
      toast.error(getDisplayErrorMessage(err));
    }
  }, []);

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const [cfg, list] = await Promise.all([
          fetchTransportMapConfig(),
          fetchLiveBuses(),
        ]);
        if (!active) return;
        setConfig(cfg);
        setBuses(list);
      } catch (err) {
        toast.error(getDisplayErrorMessage(err));
      } finally {
        if (active) setLoading(false);
      }
    })();
    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    let active = true;
    let client: Socket | null = null;

    void (async () => {
      const token = await fetchAccessToken();
      if (!active || !token) return;
      const wsUrl = process.env.NEXT_PUBLIC_WS_URL || "http://localhost:3001";
      client = io(`${wsUrl}/transport`, {
        auth: { token },
        transports: ["websocket", "polling"],
        reconnection: true,
        reconnectionAttempts: 5,
        reconnectionDelay: 2000,
      });
      client.on("connect", () => setConnected(true));
      client.on("disconnect", () => setConnected(false));
      client.on("trip:position", (event: PositionEvent) => {
        if (!event?.tripId) return;
        setBuses((prev) => upsertLiveBus(prev, event));
      });
      client.on("trip:status", () => {
        void load();
      });
    })();

    const poll = window.setInterval(() => {
      if (!document.hidden) void load();
    }, 20000);

    return () => {
      active = false;
      client?.disconnect();
      window.clearInterval(poll);
    };
  }, [load]);

  const selectedBus = buses.find((bus) => bus.tripId === selected) ?? null;

  return (
    <section className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <h2 className="text-sm font-medium text-muted-foreground">Live buses</h2>
          <Badge variant={connected ? "default" : "secondary"}>
            {connected ? "Live" : "Polling"}
          </Badge>
          <span className="text-xs text-muted-foreground">{buses.length} active</span>
        </div>
        <Button variant="outline" size="sm" onClick={() => void load()}>
          Refresh
        </Button>
      </div>

      {loading ? (
        <Skeleton className="h-[420px] w-full rounded-2xl" />
      ) : config?.enabled && config.styleUrl ? (
        <LiveBusesMap
          styleUrl={config.styleUrl}
          buses={buses}
          selectedTripId={selected}
          onSelect={setSelected}
        />
      ) : (
        <div className="rounded-2xl border border-dashed border-border p-6 text-sm text-muted-foreground">
          Live maps are not configured. A super admin can set a tile provider under{" "}
          <span className="font-medium text-foreground">Dashboard → Maps</span>. Buses
          are still listed below.
        </div>
      )}

      {selectedBus ? (
        <div className="rounded-2xl border border-border bg-card p-4">
          <div className="flex items-center justify-between">
            <span className="font-medium text-foreground">
              {selectedBus.routeName ?? "Route"}
            </span>
            <Badge>Live</Badge>
          </div>
          <dl className="mt-3 grid grid-cols-2 gap-2 text-sm">
            <div>
              <dt className="text-muted-foreground">Vehicle</dt>
              <dd>{selectedBus.vehicleLabel ?? "—"}</dd>
            </div>
            <div>
              <dt className="text-muted-foreground">Last update</dt>
              <dd>{clock(selectedBus.updatedAt)}</dd>
            </div>
            <div>
              <dt className="text-muted-foreground">Position</dt>
              <dd>
                {selectedBus.lat.toFixed(4)}, {selectedBus.lng.toFixed(4)}
              </dd>
            </div>
          </dl>
        </div>
      ) : null}

      {buses.length > 0 ? (
        <ul className="divide-y divide-border rounded-2xl border border-border">
          {buses.map((bus) => (
            <li key={bus.tripId}>
              <button
                type="button"
                onClick={() => setSelected(bus.tripId)}
                className="flex w-full items-center justify-between px-4 py-3 text-left text-sm hover:bg-muted/40"
              >
                <span className="font-medium text-foreground">
                  {bus.routeName ?? "Route"}
                </span>
                <span className="text-muted-foreground">
                  {bus.vehicleLabel ?? "—"} · {clock(bus.updatedAt)}
                </span>
              </button>
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-sm text-muted-foreground">No buses are reporting right now.</p>
      )}
    </section>
  );
}
