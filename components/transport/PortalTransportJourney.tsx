"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { io, type Socket } from "socket.io-client";
import { Bus, MapPin, ShieldAlert } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { getDisplayErrorMessage } from "@/lib/utils/graphql-errors";
import { fetchAccessToken } from "@/lib/realtime/getAccessToken";
import {
  fetchLiveTripPosition,
  fetchTransportMapConfig,
  type LiveBus,
  type PortalLivePosition,
  type StudentTransportToday,
  type TransportMapConfig,
} from "@/lib/school/transportApi";
import {
  journeyEventLabel,
  journeyEventTone,
  journeyStage,
  type JourneyTone,
} from "@/lib/school/portalTransport";
import {
  LiveBusesMap,
  type MapStop,
} from "@/components/transport/LiveBusesMap";

/** Trip states where the bus is actually moving — the only time we show "live". */
const LIVE_STATUSES = new Set(["IN_PROGRESS", "EMERGENCY"]);

const TONE_BADGE: Record<JourneyTone, string> = {
  success: "border-emerald-200 bg-emerald-50 text-emerald-700",
  warning: "border-amber-200 bg-amber-50 text-amber-700",
  danger: "border-red-200 bg-red-50 text-red-700",
  neutral: "border-slate-200 bg-slate-50 text-slate-600",
};

const TONE_DOT: Record<JourneyTone, string> = {
  success: "bg-emerald-500",
  warning: "bg-amber-500",
  danger: "bg-red-500",
  neutral: "bg-slate-300",
};

/** Clock time in the school's operating timezone (East Africa Time). */
function clock(iso?: string | null): string {
  if (!iso) return "—";
  try {
    return new Intl.DateTimeFormat("en-KE", {
      hour: "numeric",
      minute: "2-digit",
      timeZone: "Africa/Nairobi",
    }).format(new Date(iso));
  } catch {
    return new Date(iso).toISOString().slice(11, 16);
  }
}

/** "about 7 min" / "less than a minute", or null when there's no estimate. */
function formatEta(seconds?: number | null): string | null {
  if (seconds == null || seconds < 0) return null;
  if (seconds < 60) return "less than a minute";
  const minutes = Math.round(seconds / 60);
  return minutes <= 1 ? "about 1 min" : `about ${minutes} min`;
}

/** Compact minutes for the large tracking badge ("7 min", "<1 min"). */
function formatEtaCompact(seconds?: number | null): string | null {
  if (seconds == null || seconds < 0) return null;
  const minutes = Math.round(seconds / 60);
  return minutes <= 0 ? "<1 min" : `${minutes} min`;
}

function initials(name: string): string {
  return (
    name
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part[0]?.toUpperCase() ?? "")
      .join("") || "?"
  );
}

/** "320 m" / "2.4 km". */
function formatDistance(metres?: number | null): string | null {
  if (metres == null || metres < 0) return null;
  if (metres < 950) return `${Math.round(metres)} m`;
  return `${(metres / 1000).toFixed(1)} km`;
}

function tripStatusTone(status?: string | null): JourneyTone {
  switch (status) {
    case "IN_PROGRESS":
      return "success";
    case "CANCELLED":
    case "EMERGENCY":
      return "danger";
    default:
      return "neutral";
  }
}

function tripStatusLabel(status?: string | null): string {
  if (!status) return "—";
  return status
    .toLowerCase()
    .replace(/_/g, " ")
    .replace(/\b\w/g, (char) => char.toUpperCase());
}

/** One-line live status ("Arriving at Lavington in about 5 min"). */
function liveHeadline(live: PortalLivePosition | null): string | null {
  if (!live) return null;
  if (live.approaching) {
    return live.nextStopName
      ? `The bus is at ${live.nextStopName}`
      : "The bus has arrived at the stop";
  }
  const eta = formatEta(live.etaSeconds);
  if (live.nextStopName) {
    return eta
      ? `Arriving at ${live.nextStopName} in ${eta}`
      : `On the way to ${live.nextStopName}`;
  }
  return "On the way";
}

function InfoRow({
  label,
  value,
  divider,
}: {
  label: string;
  value: string;
  divider?: boolean;
}) {
  return (
    <div
      className={
        divider
          ? "flex items-center justify-between gap-3 border-t border-slate-100 py-2 text-sm dark:border-slate-800"
          : "flex items-center justify-between gap-3 py-2 text-sm"
      }
    >
      <dt className="text-slate-500">{label}</dt>
      <dd className="text-right font-medium text-slate-900 dark:text-slate-100">
        {value}
      </dd>
    </div>
  );
}

function Card({
  title,
  icon: Icon,
  action,
  children,
}: {
  title: string;
  icon: typeof Bus;
  action?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900">
      <div className="mb-2 flex items-center justify-between gap-3">
        <h3 className="flex items-center gap-2 font-semibold text-slate-900 dark:text-slate-100">
          <Icon className="h-4 w-4 text-primary" />
          {title}
        </h3>
        {action}
      </div>
      {children}
    </section>
  );
}

export interface PortalTransportJourneyProps {
  /** Loads today's transport picture for the viewer (own, or a parent's child). */
  loadToday: () => Promise<StudentTransportToday>;
  /** Optional heading, e.g. the child's name in the parent portal. */
  title?: string;
  /** True when the viewer is the student themselves (affects "you're next" copy). */
  self?: boolean;
}

/**
 * "Safe Journey" transport view shared by the student and parent portals: today's
 * trip, the live bus (map + ETA) while it is running, and the ordered journey
 * timeline (waiting → boarded → arrived → dropped off).
 */
export function PortalTransportJourney({
  loadToday,
  title,
  self = false,
}: PortalTransportJourneyProps) {
  const [today, setToday] = useState<StudentTransportToday | null>(null);
  const [mapConfig, setMapConfig] = useState<TransportMapConfig | null>(null);
  const [live, setLive] = useState<PortalLivePosition | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [connected, setConnected] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    setRefreshing(true);
    try {
      const data = await loadToday();
      setToday(data);
      setError(null);
    } catch (err) {
      setError(getDisplayErrorMessage(err));
    } finally {
      setRefreshing(false);
    }
  }, [loadToday]);

  // Initial load: today's journey + the platform map style (independent failures).
  useEffect(() => {
    let active = true;
    void (async () => {
      const [todayResult, configResult] = await Promise.allSettled([
        loadToday(),
        fetchTransportMapConfig(),
      ]);
      if (!active) return;
      if (todayResult.status === "fulfilled") {
        setToday(todayResult.value);
      } else {
        setError(getDisplayErrorMessage(todayResult.reason));
      }
      if (configResult.status === "fulfilled") {
        setMapConfig(configResult.value);
      }
      setLoading(false);
    })();
    return () => {
      active = false;
    };
  }, [loadToday]);

  const trip = today?.trip ?? null;
  const tripId = trip?.id ?? null;
  const isLive = Boolean(trip && LIVE_STATUSES.has(trip.status));

  // Live position for the running trip: cold-load snapshot, then the `/transport`
  // socket (`join_trip` → `trip:position`), with a slow poll as a safety net.
  useEffect(() => {
    if (!tripId || !isLive) {
      return;
    }

    let active = true;
    let client: Socket | null = null;

    const pull = async () => {
      try {
        const snapshot = await fetchLiveTripPosition(tripId);
        if (active) setLive(snapshot);
      } catch {
        /* transient — the next poll retries */
      }
      if (active) void refresh();
    };

    void (async () => {
      await pull();
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
      client.on("connect", () => {
        setConnected(true);
        client?.emit("join_trip", { tripId });
      });
      client.on("disconnect", () => setConnected(false));
      client.on("trip:position", (payload: PortalLivePosition) => {
        if (payload?.tripId === tripId) setLive(payload);
      });
    })();

    const poll = window.setInterval(() => {
      if (!document.hidden) void pull();
    }, 30000);

    return () => {
      active = false;
      if (client) {
        client.emit("leave_trip", { tripId });
        client.disconnect();
      }
      window.clearInterval(poll);
      setConnected(false);
    };
  }, [tripId, isLive, refresh]);

  const events = today?.events ?? [];
  const stage = journeyStage(events);

  // Only surface a live position while the trip is actually running; a stale
  // snapshot from a finished trip is ignored rather than reset inside an effect.
  const activeLive = isLive ? live : null;

  const buses = useMemo<LiveBus[]>(() => {
    if (!activeLive || !trip) return [];
    return [
      {
        tripId: activeLive.tripId,
        routeId: trip.route?.id ?? null,
        routeName: trip.route?.name ?? null,
        vehicleLabel: trip.vehicle?.label ?? null,
        lat: activeLive.lat,
        lng: activeLive.lng,
        updatedAt: activeLive.updatedAt,
      },
    ];
  }, [activeLive, trip]);

  const stops = useMemo<MapStop[]>(() => {
    const stop = today?.routeStop;
    if (!stop) return [];
    return [{ id: stop.id, lat: stop.lat, lng: stop.lng, name: stop.name }];
  }, [today?.routeStop]);

  const showMap = Boolean(
    isLive && activeLive && mapConfig?.enabled && mapConfig.styleUrl,
  );

  if (loading && !today) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-40 w-full rounded-xl" />
        <Skeleton className="h-64 w-full rounded-xl" />
      </div>
    );
  }

  const headline = liveHeadline(activeLive);
  const distance = formatDistance(activeLive?.distanceM);
  const eta = formatEta(activeLive?.etaSeconds);
  const etaCompact = formatEtaCompact(activeLive?.etaSeconds);
  const driverName = trip?.driver?.user?.name ?? null;
  const vehicleLabel = trip?.vehicle?.label ?? null;
  const vehiclePlate = trip?.vehicle?.registrationNo ?? null;
  const toChildStop =
    activeLive?.nextStopId && today?.routeStop
      ? activeLive.nextStopId === today.routeStop.id
      : false;

  const isNextPick =
    Boolean(activeLive?.nextPickStudentId) &&
    activeLive?.nextPickStudentId === today?.studentId;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold text-slate-900 dark:text-slate-100">
            Transport
          </h1>
          <p className="text-sm text-slate-500">
            {title ?? today?.studentName ?? "Today's school transport"}
          </p>
        </div>
        <div className="flex items-center gap-2">
          {isLive ? (
            <Badge variant={connected ? "default" : "secondary"}>
              {connected ? "Live" : "Polling"}
            </Badge>
          ) : null}
          <Button
            variant="outline"
            size="sm"
            onClick={() => void refresh()}
            disabled={refreshing}
          >
            Refresh
          </Button>
        </div>
      </div>

      {error ? (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
          {error}
        </div>
      ) : null}

      {!today || !today.isAssigned ? (
        <div className="rounded-xl border border-dashed border-slate-200 px-4 py-10 text-center text-sm text-slate-500 dark:border-slate-800">
          <Bus className="mx-auto mb-2 h-6 w-6 text-slate-400" />
          You have no transport assigned today.
        </div>
      ) : (
        <>
          <Card
            title="Today's trip"
            icon={Bus}
            action={
              <Badge
                className={TONE_BADGE[tripStatusTone(trip?.status)]}
                variant="outline"
              >
                {tripStatusLabel(trip?.status)}
              </Badge>
            }
          >
            <p className="text-lg font-semibold text-slate-900 dark:text-slate-100">
              {trip?.route?.name ?? "Route"}
            </p>
            <dl className="mt-1">
              <InfoRow label="Direction" value={trip?.direction ?? "—"} divider />
              <InfoRow
                label="Pickup point"
                value={today.pickupPoint ?? "—"}
                divider
              />
              <InfoRow
                label="Pickup time"
                value={clock(trip?.scheduledStartAt)}
                divider
              />
              {trip?.vehicle?.label ? (
                <InfoRow label="Vehicle" value={trip.vehicle.label} divider />
              ) : null}
              {trip?.actualStartAt ? (
                <InfoRow
                  label="Departed"
                  value={clock(trip.actualStartAt)}
                  divider
                />
              ) : null}
              {trip?.delayMinutes ? (
                <InfoRow
                  label="Delay"
                  value={`${trip.delayMinutes} min`}
                  divider
                />
              ) : null}
            </dl>
            <div className="mt-2 flex items-center gap-2">
              <span className={`h-2.5 w-2.5 rounded-full ${TONE_DOT[stage.tone]}`} />
              <span className="text-sm text-slate-600 dark:text-slate-300">
                {stage.label}
              </span>
            </div>
          </Card>

          {trip?.status === "EMERGENCY" ? (
            <div className="flex items-start gap-2 rounded-xl border border-red-300 bg-red-50 px-4 py-3 text-sm text-red-800">
              <ShieldAlert className="mt-0.5 h-4 w-4 shrink-0" />
              <p>
                An emergency was reported on this bus. The school is responding —
                the live location is shown below.
              </p>
            </div>
          ) : null}

          {isLive && isNextPick ? (
            <div className="flex items-start gap-2 rounded-xl border border-emerald-300 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
              <MapPin className="mt-0.5 h-4 w-4 shrink-0" />
              <p>
                {self
                  ? "You're the next pick"
                  : `${today?.studentName ?? "Your child"} is the next pick`}
                {formatDistance(activeLive?.nextPickDistanceM)
                  ? ` — the bus is ${formatDistance(activeLive?.nextPickDistanceM)} away.`
                  : "."}
              </p>
            </div>
          ) : null}

          {isLive ? (
            <Card title="Track bus" icon={MapPin}>
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <div className="flex items-baseline gap-2">
                    <span className="text-3xl font-bold tabular-nums text-slate-900 dark:text-slate-100">
                      {etaCompact ?? "—"}
                    </span>
                    {etaCompact ? (
                      <span className="text-sm text-slate-500">away</span>
                    ) : null}
                  </div>
                  <p className="text-sm text-slate-600 dark:text-slate-300">
                    {headline ?? "Waiting for the bus to start moving…"}
                  </p>
                </div>
                {activeLive ? (
                  <Badge
                    className={TONE_BADGE[activeLive.approaching ? "success" : "neutral"]}
                    variant="outline"
                  >
                    {activeLive.approaching
                      ? "Arriving"
                      : connected
                        ? "Live"
                        : "Polling"}
                  </Badge>
                ) : null}
              </div>

              {driverName || vehicleLabel || vehiclePlate ? (
                <div className="mt-3 flex items-center gap-3 rounded-lg border border-slate-100 p-2.5 dark:border-slate-800">
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-slate-100 text-sm font-semibold text-slate-600 dark:bg-slate-800 dark:text-slate-300">
                    {initials(driverName ?? vehicleLabel ?? "?")}
                  </span>
                  <div className="min-w-0">
                    {driverName ? (
                      <p className="truncate text-sm font-medium text-slate-900 dark:text-slate-100">
                        {driverName}
                      </p>
                    ) : null}
                    <p className="truncate text-xs text-slate-500">
                      {[vehicleLabel, vehiclePlate].filter(Boolean).join(" · ") ||
                        "School bus"}
                    </p>
                  </div>
                </div>
              ) : null}

              {showMap && mapConfig?.styleUrl ? (
                <div className="mt-3">
                  <LiveBusesMap
                    styleUrl={mapConfig.styleUrl}
                    buses={buses}
                    stops={stops}
                    selectedTripId={tripId}
                    onSelect={() => undefined}
                  />
                  <p className="mt-2 text-xs text-slate-400">
                    🚌 the bus · 🔵 {today.routeStop?.name ?? "your pickup point"}
                  </p>
                </div>
              ) : activeLive ? (
                <div className="mt-3 rounded-lg border border-dashed border-slate-200 px-3 py-4 text-xs text-slate-500 dark:border-slate-800">
                  A live map is not configured for this school. Live updates are
                  shown below.
                </div>
              ) : null}

              <dl className="mt-2">
                {activeLive?.nextStopName ? (
                  <InfoRow
                    label={toChildStop ? "Your pickup point" : "Next stop"}
                    value={activeLive.nextStopName}
                    divider
                  />
                ) : null}
                {distance ? (
                  <InfoRow
                    label={toChildStop ? "Distance to you" : "Distance to stop"}
                    value={distance}
                    divider
                  />
                ) : null}
                {eta ? (
                  <InfoRow
                    label={toChildStop ? "Arriving in" : "ETA"}
                    value={eta}
                    divider
                  />
                ) : null}
              </dl>
            </Card>
          ) : null}

          <Card title="Your journey" icon={MapPin}>
            {events.length === 0 ? (
              <p className="py-6 text-center text-sm text-slate-500">
                No journey events yet today.
              </p>
            ) : (
              <ul>
                {events.map((event, index) => {
                  const tone = journeyEventTone(event.type);
                  return (
                    <li
                      key={event.id}
                      className={
                        index > 0
                          ? "flex items-center gap-3 border-t border-slate-100 py-2.5 dark:border-slate-800"
                          : "flex items-center gap-3 py-2.5"
                      }
                    >
                      <span className="w-16 shrink-0 text-xs tabular-nums text-slate-500">
                        {clock(event.occurredAt)}
                      </span>
                      <span
                        className={`h-2.5 w-2.5 shrink-0 rounded-full ${TONE_DOT[tone]}`}
                      />
                      <span className="flex-1 text-sm text-slate-800 dark:text-slate-200">
                        {journeyEventLabel(event.type)}
                        {event.routeStop?.name ? (
                          <span className="text-slate-500">
                            {" "}
                            · {event.routeStop.name}
                          </span>
                        ) : null}
                      </span>
                    </li>
                  );
                })}
              </ul>
            )}
          </Card>
        </>
      )}
    </div>
  );
}
