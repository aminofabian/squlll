"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  ArrowLeft,
  Bus,
  Clock,
  Loader2,
  MapPin,
  RefreshCw,
  UserCheck,
  UserX,
} from "lucide-react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  SchoolEmpty,
  SchoolLoading,
  SchoolPage,
  SchoolPanel,
  outlineButtonClass,
  primaryButtonClass,
} from "@/components/school/SchoolContentPage";
import {
  fetchMyDriverTrip,
  fetchMyDriverTripStudents,
  markMyJourneyEvent,
  markMyStopArrived,
  markMyStopDeparted,
  type DriverTripStop,
  type DriverTripStudent,
  type TripStatus,
  type TripStopStatus,
} from "@/lib/school/driver";

const TRIP_STATUS_CLASS: Record<TripStatus, string> = {
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

const STOP_STATUS_CLASS: Record<TripStopStatus, string> = {
  PENDING:
    "border-[#1a4d42]/15 bg-white text-[#1a4d42]/70 dark:border-white/15 dark:bg-[#0c1a17] dark:text-white/60",
  ARRIVED:
    "border-sky-200 bg-sky-50 text-sky-700 dark:border-sky-900 dark:bg-sky-950/40 dark:text-sky-300",
  DEPARTED:
    "border-[#246a59]/30 bg-[#246a59]/10 text-[#246a59] dark:border-[#246a59]/40 dark:text-emerald-300",
  SKIPPED:
    "border-slate-300 bg-slate-100 text-slate-600 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300",
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

export function DriverTripRun() {
  const params = useParams();
  const subdomain = params.subdomain as string;
  const tripId = params.id as string;
  const queryClient = useQueryClient();

  const tripQuery = useQuery({
    queryKey: ["driverTrip", subdomain, tripId],
    queryFn: () => fetchMyDriverTrip(subdomain, tripId),
    enabled: Boolean(subdomain && tripId),
    refetchOnWindowFocus: true,
  });

  const rosterQuery = useQuery({
    queryKey: ["driverRoster", subdomain, tripId],
    queryFn: () => fetchMyDriverTripStudents(subdomain, tripId),
    enabled: Boolean(subdomain && tripId),
  });

  const invalidate = () => {
    void queryClient.invalidateQueries({
      queryKey: ["driverTrip", subdomain, tripId],
    });
    void queryClient.invalidateQueries({
      queryKey: ["driverRoster", subdomain, tripId],
    });
    void queryClient.invalidateQueries({ queryKey: ["driverTrips"] });
  };

  const onError = (error: unknown) =>
    toast.error(error instanceof Error ? error.message : "Something went wrong");

  const arrived = useMutation({
    mutationFn: (tripStopId: string) => markMyStopArrived(subdomain, tripStopId),
    onSuccess: () => {
      toast.success("Stop marked arrived");
      invalidate();
    },
    onError,
  });

  const departed = useMutation({
    mutationFn: (tripStopId: string) =>
      markMyStopDeparted(subdomain, tripStopId),
    onSuccess: () => {
      toast.success("Stop marked departed");
      invalidate();
    },
    onError,
  });

  const journey = useMutation({
    mutationFn: (input: {
      studentId: string;
      type: "BOARDED" | "NO_SHOW";
      routeStopId?: string | null;
    }) =>
      markMyJourneyEvent(subdomain, {
        tripId,
        studentId: input.studentId,
        type: input.type,
        routeStopId: input.routeStopId ?? undefined,
      }),
    onSuccess: (_data, variables) => {
      toast.success(
        variables.type === "BOARDED" ? "Student boarded" : "Marked no-show",
      );
      invalidate();
    },
    onError,
  });

  const trip = tripQuery.data ?? null;
  const roster = rosterQuery.data ?? [];

  const stops: DriverTripStop[] = [...(trip?.stops ?? [])].sort(
    (a, b) =>
      new Date(a.scheduledAt).getTime() - new Date(b.scheduledAt).getTime(),
  );

  const studentsByStop = new Map<string, DriverTripStudent[]>();
  for (const student of roster) {
    const key = student.routeStopId ?? "__unassigned__";
    const list = studentsByStop.get(key) ?? [];
    list.push(student);
    studentsByStop.set(key, list);
  }

  const busy =
    arrived.isPending || departed.isPending || journey.isPending;

  return (
    <SchoolPage
      eyebrow="Transport"
      title={trip?.route?.name ?? "Trip"}
      subtitle={
        trip
          ? `${trip.direction} · ${trip.tripDate} · ${
              trip.vehicle?.label ?? "no vehicle"
            }`
          : undefined
      }
      actions={
        <div className="flex gap-2">
          <Button
            asChild
            variant="outline"
            className={outlineButtonClass}
          >
            <Link href="/driver">
              <ArrowLeft className="h-3.5 w-3.5" />
              My trips
            </Link>
          </Button>
          <Button
            type="button"
            variant="outline"
            className={outlineButtonClass}
            disabled={tripQuery.isFetching || rosterQuery.isFetching}
            onClick={() => {
              void tripQuery.refetch();
              void rosterQuery.refetch();
            }}
          >
            <RefreshCw
              className={cn(
                "h-3.5 w-3.5",
                (tripQuery.isFetching || rosterQuery.isFetching) &&
                  "animate-spin",
              )}
            />
            Refresh
          </Button>
        </div>
      }
    >
      {tripQuery.isLoading ? (
        <SchoolPanel>
          <SchoolLoading label="Loading trip…" />
        </SchoolPanel>
      ) : tripQuery.isError ? (
        <SchoolPanel>
          <SchoolEmpty
            icon={Bus}
            title="Could not load this trip"
            description={
              tripQuery.error instanceof Error
                ? tripQuery.error.message
                : "Please try again."
            }
          />
        </SchoolPanel>
      ) : !trip ? (
        <SchoolPanel>
          <SchoolEmpty
            icon={Bus}
            title="Trip not available"
            description="This trip is not assigned to you, or it has been removed."
          />
        </SchoolPanel>
      ) : (
        <>
          <div className="flex flex-wrap items-center gap-2">
            <Badge
              variant="outline"
              className={cn("rounded-none", TRIP_STATUS_CLASS[trip.status])}
            >
              {humanize(trip.status)}
            </Badge>
            <span className="inline-flex items-center gap-1 text-xs text-[#1a4d42]/60 dark:text-white/50">
              <Clock className="h-3.5 w-3.5" />
              {clock(trip.scheduledStartAt)} start
              {trip.delayMinutes > 0 ? ` · ${trip.delayMinutes}m late` : ""}
            </span>
          </div>

          <SchoolPanel icon={MapPin} title="Stops">
            {stops.length === 0 ? (
              <SchoolEmpty
                icon={MapPin}
                title="No stops yet"
                description="This trip has no scheduled stops."
              />
            ) : (
              <ol className="space-y-3">
                {stops.map((stop, index) => {
                  const stopStudents =
                    studentsByStop.get(stop.id) ??
                    studentsByStop.get(stop.routeStop?.id ?? "") ??
                    [];
                  return (
                    <li
                      key={stop.id}
                      className="border border-[#1a4d42]/12 bg-white dark:border-white/10 dark:bg-[#0c1a17]"
                    >
                      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#1a4d42]/10 px-4 py-3 dark:border-white/10">
                        <div className="flex items-center gap-3">
                          <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[#246a59]/10 text-xs font-semibold text-[#246a59]">
                            {index + 1}
                          </span>
                          <div>
                            <p className="text-sm font-semibold text-[#0a1f1a] dark:text-white">
                              {stop.routeStop?.name ?? "Stop"}
                            </p>
                            <p className="text-xs text-[#1a4d42]/60 dark:text-white/50">
                              {clock(stop.scheduledAt)} · {stop.studentsBoarded}/
                              {stop.studentsExpected} boarded
                              {stop.studentsAbsent > 0
                                ? ` · ${stop.studentsAbsent} absent`
                                : ""}
                            </p>
                          </div>
                        </div>
                        <div className="flex flex-wrap items-center gap-2">
                          <Badge
                            variant="outline"
                            className={cn(
                              "rounded-none",
                              STOP_STATUS_CLASS[stop.status],
                            )}
                          >
                            {humanize(stop.status)}
                          </Badge>
                          {stop.status === "PENDING" ? (
                            <Button
                              type="button"
                              size="sm"
                              className={primaryButtonClass}
                              disabled={busy}
                              onClick={() => arrived.mutate(stop.id)}
                            >
                              Mark arrived
                            </Button>
                          ) : null}
                          {stop.status === "ARRIVED" ? (
                            <Button
                              type="button"
                              size="sm"
                              className={primaryButtonClass}
                              disabled={busy}
                              onClick={() => departed.mutate(stop.id)}
                            >
                              Mark departed
                            </Button>
                          ) : null}
                        </div>
                      </div>

                      {stopStudents.length === 0 ? (
                        <p className="px-4 py-3 text-xs text-[#1a4d42]/50 dark:text-white/40">
                          No students at this stop.
                        </p>
                      ) : (
                        <ul className="divide-y divide-[#1a4d42]/8 dark:divide-white/5">
                          {stopStudents.map((student) => {
                            const boarded = student.eventType === "BOARDED";
                            const noShow = student.eventType === "NO_SHOW";
                            return (
                              <li
                                key={student.studentId}
                                className="flex flex-wrap items-center justify-between gap-3 px-4 py-2.5"
                              >
                                <div className="min-w-0">
                                  <p className="truncate text-sm text-[#0a1f1a] dark:text-white">
                                    {student.name}
                                  </p>
                                  {student.admissionNumber ? (
                                    <p className="text-xs text-[#1a4d42]/50 dark:text-white/40">
                                      {student.admissionNumber}
                                    </p>
                                  ) : null}
                                </div>
                                {boarded || noShow ? (
                                  <Badge
                                    variant="outline"
                                    className={cn(
                                      "rounded-none",
                                      boarded
                                        ? "border-[#246a59]/30 bg-[#246a59]/10 text-[#246a59] dark:border-[#246a59]/40 dark:text-emerald-300"
                                        : "border-red-200 bg-red-50 text-red-700 dark:border-red-900 dark:bg-red-950/40 dark:text-red-300",
                                    )}
                                  >
                                    {humanize(student.eventType as string)}
                                  </Badge>
                                ) : (
                                  <div className="flex gap-2">
                                    <Button
                                      type="button"
                                      size="sm"
                                      variant="outline"
                                      className={outlineButtonClass}
                                      disabled={busy}
                                      onClick={() =>
                                        journey.mutate({
                                          studentId: student.studentId,
                                          type: "BOARDED",
                                          routeStopId:
                                            student.routeStopId ?? stop.routeStop?.id,
                                        })
                                      }
                                    >
                                      {journey.isPending ? (
                                        <Loader2 className="h-3.5 w-3.5 animate-spin" />
                                      ) : (
                                        <UserCheck className="h-3.5 w-3.5" />
                                      )}
                                      Board
                                    </Button>
                                    <Button
                                      type="button"
                                      size="sm"
                                      variant="outline"
                                      className={outlineButtonClass}
                                      disabled={busy}
                                      onClick={() =>
                                        journey.mutate({
                                          studentId: student.studentId,
                                          type: "NO_SHOW",
                                          routeStopId:
                                            student.routeStopId ?? stop.routeStop?.id,
                                        })
                                      }
                                    >
                                      <UserX className="h-3.5 w-3.5" />
                                      No-show
                                    </Button>
                                  </div>
                                )}
                              </li>
                            );
                          })}
                        </ul>
                      )}
                    </li>
                  );
                })}
              </ol>
            )}
          </SchoolPanel>

          <p className="text-xs text-[#1a4d42]/50 dark:text-white/40">
            Board students as you go — each action saves immediately. Use Refresh
            to see the latest.
          </p>
        </>
      )}
    </SchoolPage>
  );
}
