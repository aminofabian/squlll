"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import {
  ArrowRight,
  Bus,
  RefreshCw,
  Route as RouteIcon,
  Users,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  SchoolEmpty,
  SchoolLoading,
  SchoolPage,
  SchoolStat,
  outlineButtonClass,
} from "@/components/school/SchoolContentPage";
import {
  fetchMyDriverTrips,
  todayIso,
  type DriverTrip,
  type DriverTripStop,
  type TripStatus,
} from "@/lib/school/driver";

const STATUS_CLASS: Record<TripStatus, string> = {
  SCHEDULED:
    "border-slate-200 bg-slate-50 text-slate-600 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200",
  IN_PROGRESS:
    "border-sky-200 bg-sky-50 text-sky-700 dark:border-sky-900 dark:bg-sky-950/40 dark:text-sky-300",
  COMPLETED:
    "border-[#246a59]/30 bg-[#246a59]/10 text-[#246a59] dark:border-[#246a59]/40 dark:text-emerald-300",
  CANCELLED:
    "border-slate-300 bg-slate-100 text-slate-600 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300",
  EMERGENCY:
    "border-red-300 bg-red-50 text-red-700 dark:border-red-900 dark:bg-red-950/40 dark:text-red-300",
};

function humanize(value: string): string {
  return value
    .replace(/_/g, " ")
    .toLowerCase()
    .replace(/^\w/, (c) => c.toUpperCase());
}

function clock(iso?: string | null): string {
  if (!iso) return "—";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "—";
  return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

function totalStops(
  trip: DriverTrip,
  pick: (stop: DriverTripStop) => number,
): number {
  return (trip.stops ?? []).reduce((n, stop) => n + pick(stop), 0);
}

function TripCard({ trip }: { trip: DriverTrip }) {
  const boarded = totalStops(trip, (s) => s.studentsBoarded);
  const expected = totalStops(trip, (s) => s.studentsExpected);
  const stops = trip.stops?.length ?? 0;

  return (
    <Link
      href={`/driver/trip/${trip.id}`}
      className="group flex flex-col gap-3 border border-[#1a4d42]/12 bg-white p-4 transition-colors hover:border-[#246a59]/40 hover:bg-[#f8fbfa] dark:border-white/10 dark:bg-[#0c1a17] dark:hover:bg-white/5 sm:flex-row sm:items-center sm:justify-between"
    >
      <div className="min-w-0 space-y-2">
        <div className="flex flex-wrap items-center gap-2">
          <span className="inline-flex items-center gap-1.5 text-sm font-semibold text-[#0a1f1a] dark:text-white">
            <RouteIcon className="h-4 w-4 text-[#246a59]" />
            {trip.route?.name ?? "Unassigned route"}
          </span>
          <Badge
            variant="outline"
            className={cn("rounded-none", STATUS_CLASS[trip.status])}
          >
            {humanize(trip.status)}
          </Badge>
          <Badge
            variant="outline"
            className="rounded-none border-[#1a4d42]/15 text-[#0a1f1a] dark:border-white/15 dark:text-white/80"
          >
            {trip.direction}
          </Badge>
        </div>
        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-[#1a4d42]/60 dark:text-white/50">
          <span>{clock(trip.scheduledStartAt)} start</span>
          <span className="inline-flex items-center gap-1">
            <Bus className="h-3.5 w-3.5" />
            {trip.vehicle?.label ?? "No vehicle"}
          </span>
          <span className="inline-flex items-center gap-1">
            <Users className="h-3.5 w-3.5" />
            {boarded}/{expected} boarded · {stops} stop{stops === 1 ? "" : "s"}
          </span>
        </div>
      </div>
      <span className="inline-flex items-center gap-1 text-xs font-medium text-[#246a59]">
        Open run sheet
        <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
      </span>
    </Link>
  );
}

export function DriverHome() {
  const params = useParams();
  const subdomain = params.subdomain as string;
  const date = todayIso();

  const { data, isLoading, isError, error, isFetching, refetch } = useQuery({
    queryKey: ["driverTrips", subdomain, date],
    queryFn: () => fetchMyDriverTrips(subdomain, date),
    enabled: Boolean(subdomain),
    refetchOnWindowFocus: true,
  });

  const trips = data ?? [];
  const active = trips.filter(
    (t) => t.status === "IN_PROGRESS" || t.status === "SCHEDULED",
  ).length;
  const boarded = trips.reduce(
    (n, t) => n + totalStops(t, (s) => s.studentsBoarded),
    0,
  );
  const expected = trips.reduce(
    (n, t) => n + totalStops(t, (s) => s.studentsExpected),
    0,
  );

  return (
    <SchoolPage
      eyebrow="Transport"
      title="My trips"
      subtitle={`Trips assigned to you on ${date}.`}
      actions={
        <Button
          type="button"
          variant="outline"
          className={outlineButtonClass}
          disabled={isFetching}
          onClick={() => void refetch()}
        >
          <RefreshCw
            className={cn("h-3.5 w-3.5", isFetching && "animate-spin")}
          />
          Refresh
        </Button>
      }
    >
      <div className="grid gap-3 sm:grid-cols-3">
        <SchoolStat label="Trips today" value={trips.length} icon={RouteIcon} />
        <SchoolStat label="Active / upcoming" value={active} icon={Bus} />
        <SchoolStat
          label="Boarded"
          value={`${boarded}/${expected}`}
          icon={Users}
        />
      </div>

      {isLoading ? (
        <SchoolLoading label="Loading your trips…" />
      ) : isError ? (
        <SchoolEmpty
          icon={Bus}
          title="Could not load your trips"
          description={
            error instanceof Error ? error.message : "Please try again."
          }
        />
      ) : trips.length === 0 ? (
        <SchoolEmpty
          icon={Bus}
          title="No trips assigned today"
          description="When the school assigns you to a route, your trips for the day will appear here."
        />
      ) : (
        <div className="space-y-3">
          {trips.map((trip) => (
            <TripCard key={trip.id} trip={trip} />
          ))}
        </div>
      )}
    </SchoolPage>
  );
}
