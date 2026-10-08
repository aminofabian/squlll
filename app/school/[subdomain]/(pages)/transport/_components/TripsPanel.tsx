"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { getDisplayErrorMessage } from "@/lib/utils/graphql-errors";
import {
  assignTripCrew,
  fetchDrivers,
  fetchTrips,
  fetchVehicles,
  materialiseTrips,
  setTripAction,
  type TransportDriver,
  type TransportTrip,
  type TransportVehicle,
} from "@/lib/school/transportApi";

function todayIso() {
  return new Date().toISOString().slice(0, 10);
}

function clock(iso?: string | null) {
  if (!iso) return "—";
  return new Date(iso).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

const STATUS_VARIANT: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
  SCHEDULED: "secondary",
  IN_PROGRESS: "default",
  COMPLETED: "outline",
  CANCELLED: "destructive",
  EMERGENCY: "destructive",
};

export function TripsPanel() {
  const [date, setDate] = useState(todayIso());
  const [trips, setTrips] = useState<TransportTrip[]>([]);
  const [vehicles, setVehicles] = useState<TransportVehicle[]>([]);
  const [drivers, setDrivers] = useState<TransportDriver[]>([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [expanded, setExpanded] = useState<string | null>(null);

  const [crewTrip, setCrewTrip] = useState<TransportTrip | null>(null);
  const [crew, setCrew] = useState<{ vehicleId: string; driverId: string; conductorId: string }>({
    vehicleId: "",
    driverId: "",
    conductorId: "",
  });

  const load = useCallback(async (forDate: string) => {
    setLoading(true);
    try {
      const [t, v, d] = await Promise.all([
        fetchTrips({ date: forDate }),
        fetchVehicles(),
        fetchDrivers(),
      ]);
      setTrips(t);
      setVehicles(v);
      setDrivers(d);
    } catch (err) {
      toast.error(getDisplayErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const [t, v, d] = await Promise.all([
          fetchTrips({ date }),
          fetchVehicles(),
          fetchDrivers(),
        ]);
        if (!active) return;
        setTrips(t);
        setVehicles(v);
        setDrivers(d);
      } catch (err) {
        toast.error(getDisplayErrorMessage(err));
      } finally {
        if (active) setLoading(false);
      }
    })();
    return () => {
      active = false;
    };
  }, [date]);

  const materialise = async () => {
    setBusy(true);
    try {
      const created = await materialiseTrips({ date });
      toast.success(created.length ? `Created ${created.length} trip(s)` : "No new trips for this date");
      await load(date);
    } catch (err) {
      toast.error(getDisplayErrorMessage(err));
    } finally {
      setBusy(false);
    }
  };

  const act = async (trip: TransportTrip, action: "startTrip" | "endTrip" | "cancelTrip") => {
    try {
      await setTripAction(action, trip.id);
      toast.success("Trip updated");
      await load(date);
    } catch (err) {
      toast.error(getDisplayErrorMessage(err));
    }
  };

  const openCrew = (trip: TransportTrip) => {
    setCrewTrip(trip);
    setCrew({
      vehicleId: trip.vehicle?.id ?? "",
      driverId: trip.driver?.id ?? "",
      conductorId: "",
    });
  };

  const submitCrew = async () => {
    if (!crewTrip) return;
    setBusy(true);
    try {
      await assignTripCrew({
        tripId: crewTrip.id,
        vehicleId: crew.vehicleId || undefined,
        driverId: crew.driverId || undefined,
        conductorId: crew.conductorId || undefined,
      });
      toast.success("Crew assigned");
      setCrewTrip(null);
      await load(date);
    } catch (err) {
      toast.error(getDisplayErrorMessage(err));
    } finally {
      setBusy(false);
    }
  };

  const totals = useMemo(() => {
    return trips.map((t) => {
      const stops = t.stops ?? [];
      return {
        id: t.id,
        expected: stops.reduce((n, s) => n + s.studentsExpected, 0),
        boarded: stops.reduce((n, s) => n + s.studentsBoarded, 0),
        absent: stops.reduce((n, s) => n + s.studentsAbsent, 0),
      };
    });
  }, [trips]);

  const totalsFor = (id: string) => totals.find((t) => t.id === id);

  return (
    <section className="space-y-4">
      <div className="flex flex-wrap items-end gap-3">
        <div className="space-y-1">
          <label className="text-xs font-medium text-muted-foreground" htmlFor="trip-date">
            Date
          </label>
          <Input
            id="trip-date"
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="w-44"
          />
        </div>
        <Button onClick={materialise} disabled={busy}>
          {busy ? "Working…" : "Materialise trips"}
        </Button>
      </div>

      {loading ? (
        <Skeleton className="h-48 w-full" />
      ) : trips.length === 0 ? (
        <p className="rounded-md border border-dashed border-border p-8 text-center text-sm text-muted-foreground">
          No trips for {date}. Click “Materialise trips” to generate them from active routes.
        </p>
      ) : (
        <div className="space-y-3">
          {trips.map((t) => {
            const stats = totalsFor(t.id);
            return (
              <div key={t.id} className="rounded-md border border-border">
                <div className="flex flex-wrap items-center gap-x-4 gap-y-2 px-4 py-3">
                  <div className="min-w-[180px]">
                    <p className="font-medium">{t.route?.name ?? "Route"}</p>
                    <p className="text-xs text-muted-foreground">
                      {t.direction} · {clock(t.scheduledStartAt)}
                    </p>
                  </div>
                  <Badge variant={STATUS_VARIANT[t.status] ?? "secondary"}>{t.status}</Badge>
                  <span className="text-sm text-muted-foreground">
                    {t.vehicle?.label ?? "No vehicle"}
                  </span>
                  <span className="text-sm text-muted-foreground">
                    {stats ? `${stats.boarded}/${stats.expected} boarded` : ""}
                  </span>
                  <div className="ml-auto flex gap-1">
                    <Button variant="ghost" size="sm" onClick={() => openCrew(t)}>
                      Crew
                    </Button>
                    {t.status === "SCHEDULED" && (
                      <Button variant="ghost" size="sm" onClick={() => act(t, "startTrip")}>
                        Start
                      </Button>
                    )}
                    {t.status === "IN_PROGRESS" && (
                      <Button variant="ghost" size="sm" onClick={() => act(t, "endTrip")}>
                        End
                      </Button>
                    )}
                    {t.status !== "CANCELLED" && t.status !== "COMPLETED" && (
                      <Button variant="ghost" size="sm" onClick={() => act(t, "cancelTrip")}>
                        Cancel
                      </Button>
                    )}
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setExpanded(expanded === t.id ? null : t.id)}
                    >
                      {expanded === t.id ? "Hide stops" : "Stops"}
                    </Button>
                  </div>
                </div>

                {expanded === t.id && (
                  <div className="border-t border-border">
                    {(t.stops ?? []).length === 0 ? (
                      <p className="p-4 text-sm text-muted-foreground">No stops on this trip.</p>
                    ) : (
                      <table className="w-full text-sm">
                        <thead>
                          <tr className="text-left text-xs text-muted-foreground">
                            <th className="px-4 py-2 font-medium">Stop</th>
                            <th className="px-4 py-2 font-medium">Scheduled</th>
                            <th className="px-4 py-2 font-medium">Arrived</th>
                            <th className="px-4 py-2 font-medium">Status</th>
                            <th className="px-4 py-2 font-medium">Expected / Boarded / Absent</th>
                          </tr>
                        </thead>
                        <tbody>
                          {[...(t.stops ?? [])]
                            .sort(
                              (a, b) =>
                                new Date(a.scheduledAt).getTime() -
                                new Date(b.scheduledAt).getTime(),
                            )
                            .map((s) => (
                              <tr key={s.id} className="border-t border-border">
                                <td className="px-4 py-2">{s.routeStop?.name ?? "—"}</td>
                                <td className="px-4 py-2">{clock(s.scheduledAt)}</td>
                                <td className="px-4 py-2">{clock(s.arrivedAt)}</td>
                                <td className="px-4 py-2">{s.status}</td>
                                <td className="px-4 py-2">
                                  {s.studentsExpected} / {s.studentsBoarded} / {s.studentsAbsent}
                                </td>
                              </tr>
                            ))}
                        </tbody>
                      </table>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      <Dialog open={!!crewTrip} onOpenChange={(o) => !o && setCrewTrip(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Assign crew</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <div className="space-y-1">
              <label className="text-sm font-medium">Vehicle</label>
              <Select
                value={crew.vehicleId || "none"}
                onValueChange={(v) => setCrew({ ...crew, vehicleId: v === "none" ? "" : v })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a vehicle" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">None</SelectItem>
                  {vehicles.map((v) => (
                    <SelectItem key={v.id} value={v.id}>
                      {v.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1">
              <label className="text-sm font-medium">Driver</label>
              <Select
                value={crew.driverId || "none"}
                onValueChange={(v) => setCrew({ ...crew, driverId: v === "none" ? "" : v })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a driver" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">None</SelectItem>
                  {drivers.map((d) => (
                    <SelectItem key={d.id} value={d.id}>
                      {d.user?.name ?? d.user?.email ?? d.id}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1">
              <label className="text-sm font-medium">Conductor (optional)</label>
              <Select
                value={crew.conductorId || "none"}
                onValueChange={(v) => setCrew({ ...crew, conductorId: v === "none" ? "" : v })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a conductor" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">None</SelectItem>
                  {drivers.map((d) => (
                    <SelectItem key={d.id} value={d.id}>
                      {d.user?.name ?? d.user?.email ?? d.id}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCrewTrip(null)}>
              Cancel
            </Button>
            <Button onClick={submitCrew} disabled={busy}>
              {busy ? "Saving…" : "Save"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </section>
  );
}
