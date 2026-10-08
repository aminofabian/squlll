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
  acknowledgeEmergency,
  fetchEmergencyAlerts,
  fetchTransportOverviewMetrics,
  resolveEmergency,
  type EmergencyAlert,
  type TransportOverviewMetrics,
} from "@/lib/school/transportApi";
import {
  alertSourceLabel,
  alertStatusTone,
  alertTypeLabel,
  alertTypeTone,
  formatMttr,
} from "@/lib/school/emergency";

const BADGE_VARIANT: Record<string, "destructive" | "secondary" | "default"> = {
  danger: "destructive",
  warning: "secondary",
  success: "default",
};

function clock(iso?: string | null): string {
  return iso ? new Date(iso).toLocaleTimeString() : "—";
}

const TILES: { key: keyof TransportOverviewMetrics; label: string }[] = [
  { key: "activeTrips", label: "Active trips" },
  { key: "studentsTransported", label: "Students moved" },
  { key: "onTimeRoutes", label: "On-time routes" },
  { key: "delayedRoutes", label: "Delayed routes" },
  { key: "studentsAbsent", label: "Students absent" },
  { key: "openAlerts", label: "Open alerts" },
];

/**
 * School command centre: today's transport metrics plus the live safety-alert
 * queue, refreshed over the `/transport` socket and a slow poll. Ack/resolve
 * close the loop on alerts the driver or the detectors raised.
 */
export function CommandCentrePanel() {
  const [metrics, setMetrics] = useState<TransportOverviewMetrics | null>(null);
  const [alerts, setAlerts] = useState<EmergencyAlert[]>([]);
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      const [m, a] = await Promise.all([
        fetchTransportOverviewMetrics(),
        fetchEmergencyAlerts(),
      ]);
      setMetrics(m);
      setAlerts(a);
    } catch (err) {
      toast.error(getDisplayErrorMessage(err));
    }
  }, []);

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const [m, a] = await Promise.all([
          fetchTransportOverviewMetrics(),
          fetchEmergencyAlerts(),
        ]);
        if (!active) return;
        setMetrics(m);
        setAlerts(a);
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
      client.on("trip:emergency", () => {
        void load();
      });
      client.on("trip:status", () => {
        void load();
      });
    })();

    const poll = window.setInterval(() => {
      if (!document.hidden) void load();
    }, 15000);

    return () => {
      active = false;
      client?.disconnect();
      window.clearInterval(poll);
    };
  }, [load]);

  const act = async (alert: EmergencyAlert, action: "ack" | "resolve") => {
    setBusyId(alert.id);
    try {
      if (action === "ack") {
        await acknowledgeEmergency(alert.id);
        toast.success("Alert acknowledged");
      } else {
        await resolveEmergency(alert.id);
        toast.success("Alert resolved");
      }
      await load();
    } catch (err) {
      toast.error(getDisplayErrorMessage(err));
    } finally {
      setBusyId(null);
    }
  };

  const openCount = alerts.filter((a) => a.status !== "RESOLVED").length;

  return (
    <section className="space-y-6">
      {loading ? (
        <Skeleton className="h-28 w-full rounded-2xl" />
      ) : (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
          {TILES.map((tile) => (
            <div
              key={tile.key}
              className="rounded-2xl border border-border bg-card p-4"
            >
              <div className="text-2xl font-semibold text-foreground">
                {metrics ? metrics[tile.key] : "—"}
              </div>
              <div className="mt-1 text-xs text-muted-foreground">{tile.label}</div>
            </div>
          ))}
        </div>
      )}

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <h2 className="text-sm font-medium text-muted-foreground">Safety alerts</h2>
          <Badge variant={openCount > 0 ? "destructive" : "secondary"}>
            {openCount} open
          </Badge>
          <span className="text-xs text-muted-foreground">
            MTTR {formatMttr(metrics?.alertMttrSeconds ?? null)}
          </span>
        </div>
        <Button variant="outline" size="sm" onClick={() => void load()}>
          Refresh
        </Button>
      </div>

      {alerts.length === 0 ? (
        <p className="text-sm text-muted-foreground">No safety alerts today.</p>
      ) : (
        <ul className="divide-y divide-border rounded-2xl border border-border">
          {alerts.map((alert) => (
            <li
              key={alert.id}
              className="flex flex-col gap-3 px-4 py-3 sm:flex-row sm:items-center sm:justify-between"
            >
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <Badge variant={BADGE_VARIANT[alertTypeTone(alert.type)]}>
                    {alertTypeLabel(alert.type)}
                  </Badge>
                  <Badge variant={BADGE_VARIANT[alertStatusTone(alert.status)]}>
                    {alert.status}
                  </Badge>
                  <span className="text-xs text-muted-foreground">
                    {alertSourceLabel(alert.source)}
                  </span>
                </div>
                <div className="mt-1 text-xs text-muted-foreground">
                  Trip {alert.tripId.slice(0, 8)} · raised {clock(alert.createdAt)}
                  {alert.note ? ` · ${alert.note}` : ""}
                </div>
              </div>
              <div className="flex gap-2">
                {alert.status === "OPEN" ? (
                  <Button
                    size="sm"
                    variant="outline"
                    disabled={busyId === alert.id}
                    onClick={() => void act(alert, "ack")}
                  >
                    Acknowledge
                  </Button>
                ) : null}
                {alert.status !== "RESOLVED" ? (
                  <Button
                    size="sm"
                    disabled={busyId === alert.id}
                    onClick={() => void act(alert, "resolve")}
                  >
                    Resolve
                  </Button>
                ) : null}
              </div>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
