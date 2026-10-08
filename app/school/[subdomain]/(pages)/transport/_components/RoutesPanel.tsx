"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
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
  addRouteStop,
  assignStudentsToRoute,
  createTransportRoute,
  fetchRouteAssignments,
  fetchStudentsForTenant,
  fetchTransportRoutes,
  removeRouteStop,
  removeStudentFromRoute,
  removeTransportRoute,
  updateTransportRoute,
  type RouteStopDirection,
  type StudentOption,
  type TransportAssignmentRow,
  type TransportRoute,
} from "@/lib/school/transportApi";

const EMPTY_ROUTE = { name: "", fee: "", billingCycleLabel: "" };
const EMPTY_STOP = {
  name: "",
  sequence: "",
  direction: "AM_PICKUP" as RouteStopDirection,
  scheduledPickupTime: "",
  lat: "",
  lng: "",
  geofenceRadiusM: "200",
};

export function RoutesPanel() {
  const [routes, setRoutes] = useState<TransportRoute[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedId, setSelectedId] = useState<string>("");

  const [routeOpen, setRouteOpen] = useState(false);
  const [routeForm, setRouteForm] = useState(EMPTY_ROUTE);
  const [editRoute, setEditRoute] = useState<TransportRoute | null>(null);

  const [stopForm, setStopForm] = useState(EMPTY_STOP);
  const [busy, setBusy] = useState(false);

  const [assignments, setAssignments] = useState<TransportAssignmentRow[]>([]);
  const [students, setStudents] = useState<StudentOption[]>([]);
  const [assignOpen, setAssignOpen] = useState(false);
  const [assignStopId, setAssignStopId] = useState("");
  const [studentSearch, setStudentSearch] = useState("");
  const [selectedStudentIds, setSelectedStudentIds] = useState<Set<string>>(new Set());

  const load = useCallback(async () => {
    try {
      const rows = await fetchTransportRoutes();
      setRoutes(rows);
      setSelectedId((current) =>
        current && rows.some((r) => r.id === current) ? current : (rows[0]?.id ?? ""),
      );
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
        const rows = await fetchTransportRoutes();
        if (!active) return;
        setRoutes(rows);
        setSelectedId((current) =>
          current && rows.some((r) => r.id === current) ? current : (rows[0]?.id ?? ""),
        );
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

  // Students for the assignment picker (loaded once).
  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const rows = await fetchStudentsForTenant();
        if (active) setStudents(rows);
      } catch {
        /* picker simply stays empty */
      }
    })();
    return () => {
      active = false;
    };
  }, []);

  // Assignments for the selected route.
  useEffect(() => {
    if (!selectedId) return;
    let active = true;
    (async () => {
      try {
        const rows = await fetchRouteAssignments(selectedId);
        if (active) setAssignments(rows);
      } catch (err) {
        toast.error(getDisplayErrorMessage(err));
      }
    })();
    return () => {
      active = false;
    };
  }, [selectedId]);

  const selected = useMemo(
    () => routes.find((r) => r.id === selectedId) ?? null,
    [routes, selectedId],
  );

  const sortedStops = useMemo(() => {
    const stops = selected?.stops ?? [];
    return [...stops].sort(
      (a, b) => a.direction.localeCompare(b.direction) || a.sequence - b.sequence,
    );
  }, [selected]);

  const activeAssignments = useMemo(
    () => assignments.filter((a) => a.status === "ACTIVE"),
    [assignments],
  );

  const assignedIds = useMemo(
    () => new Set(activeAssignments.map((a) => a.studentId)),
    [activeAssignments],
  );

  const filteredStudents = useMemo(() => {
    const term = studentSearch.trim().toLowerCase();
    return students
      .filter((s) => !assignedIds.has(s.id))
      .filter((s) =>
        !term
          ? true
          : `${s.name ?? ""} ${s.admission_number ?? ""}`.toLowerCase().includes(term),
      )
      .slice(0, 200);
  }, [students, studentSearch, assignedIds]);

  const loadAssignments = useCallback(async (routeId: string) => {
    setAssignments(await fetchRouteAssignments(routeId));
  }, []);

  const submitRoute = async () => {
    if (!routeForm.name.trim() || !routeForm.fee) {
      toast.error("Name and fee are required");
      return;
    }
    setBusy(true);
    try {
      if (editRoute) {
        await updateTransportRoute({
          id: editRoute.id,
          name: routeForm.name.trim(),
          fee: Number(routeForm.fee),
          billingCycleLabel: routeForm.billingCycleLabel.trim() || undefined,
        });
        toast.success("Route updated");
      } else {
        await createTransportRoute({
          name: routeForm.name.trim(),
          fee: Number(routeForm.fee),
          billingCycleLabel: routeForm.billingCycleLabel.trim() || undefined,
        });
        toast.success("Route added");
      }
      setRouteOpen(false);
      setEditRoute(null);
      setRouteForm(EMPTY_ROUTE);
      await load();
    } catch (err) {
      toast.error(getDisplayErrorMessage(err));
    } finally {
      setBusy(false);
    }
  };

  const deleteRoute = async (route: TransportRoute) => {
    if (!window.confirm(`Delete route ${route.name} and its stops?`)) return;
    try {
      await removeTransportRoute(route.id);
      toast.success("Route deleted");
      await load();
    } catch (err) {
      toast.error(getDisplayErrorMessage(err));
    }
  };

  const submitStop = async () => {
    if (!selected) return;
    if (!stopForm.name.trim() || !stopForm.sequence || !stopForm.lat || !stopForm.lng) {
      toast.error("Name, sequence, latitude and longitude are required");
      return;
    }
    setBusy(true);
    try {
      await addRouteStop({
        routeId: selected.id,
        name: stopForm.name.trim(),
        sequence: Number(stopForm.sequence),
        lat: Number(stopForm.lat),
        lng: Number(stopForm.lng),
        geofenceRadiusM: Number(stopForm.geofenceRadiusM) || 200,
        direction: stopForm.direction,
        scheduledPickupTime: stopForm.scheduledPickupTime.trim() || undefined,
      });
      toast.success("Stop added");
      setStopForm(EMPTY_STOP);
      await load();
    } catch (err) {
      toast.error(getDisplayErrorMessage(err));
    } finally {
      setBusy(false);
    }
  };

  const deleteStop = async (stopId: string) => {
    try {
      await removeRouteStop(stopId);
      await load();
    } catch (err) {
      toast.error(getDisplayErrorMessage(err));
    }
  };

  const openAssign = () => {
    setAssignStopId("");
    setStudentSearch("");
    setSelectedStudentIds(new Set());
    setAssignOpen(true);
  };

  const toggleStudent = (id: string) => {
    setSelectedStudentIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const submitAssign = async () => {
    if (!selected) return;
    if (selectedStudentIds.size === 0) {
      toast.error("Select at least one student");
      return;
    }
    setBusy(true);
    try {
      const count = await assignStudentsToRoute({
        routeId: selected.id,
        studentIds: [...selectedStudentIds],
        routeStopId: assignStopId || undefined,
      });
      toast.success(`Assigned ${count} student(s)`);
      setAssignOpen(false);
      await loadAssignments(selected.id);
    } catch (err) {
      toast.error(getDisplayErrorMessage(err));
    } finally {
      setBusy(false);
    }
  };

  const removeAssignment = async (assignment: TransportAssignmentRow) => {
    if (!selected) return;
    const name =
      assignment.student?.user?.name ??
      assignment.student?.admission_number ??
      "student";
    if (!window.confirm(`Remove ${name} from this route?`)) return;
    try {
      await removeStudentFromRoute({ studentId: assignment.studentId, routeId: selected.id });
      toast.success("Student removed");
      await loadAssignments(selected.id);
    } catch (err) {
      toast.error(getDisplayErrorMessage(err));
    }
  };

  return (
    <section className="grid gap-6 md:grid-cols-[280px_1fr]">
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-medium text-muted-foreground">Routes</h2>
          <Button
            size="sm"
            onClick={() => {
              setEditRoute(null);
              setRouteForm(EMPTY_ROUTE);
              setRouteOpen(true);
            }}
          >
            Add route
          </Button>
        </div>
        {loading ? (
          <Skeleton className="h-32 w-full" />
        ) : routes.length === 0 ? (
          <p className="rounded-md border border-dashed border-border p-6 text-center text-sm text-muted-foreground">
            No routes yet.
          </p>
        ) : (
          <ul className="space-y-1">
            {routes.map((r) => (
              <li key={r.id}>
                <button
                  type="button"
                  onClick={() => setSelectedId(r.id)}
                  className={`w-full rounded-md border px-3 py-2 text-left text-sm transition-colors ${
                    r.id === selectedId
                      ? "border-primary bg-primary/5"
                      : "border-border hover:bg-muted"
                  }`}
                >
                  <span className="font-medium">{r.name}</span>
                  <span className="ml-2 text-xs text-muted-foreground">
                    {(r.stops?.length ?? 0)} stops
                  </span>
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="space-y-4">
        {!selected ? (
          <p className="rounded-md border border-dashed border-border p-8 text-center text-sm text-muted-foreground">
            Select or add a route to manage its stops and students.
          </p>
        ) : (
          <>
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold">{selected.name}</h3>
                <p className="text-sm text-muted-foreground">
                  Fee {selected.fee}
                  {selected.billingCycleLabel ? ` · ${selected.billingCycleLabel}` : ""}
                </p>
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setEditRoute(selected);
                    setRouteForm({
                      name: selected.name,
                      fee: String(selected.fee),
                      billingCycleLabel: selected.billingCycleLabel ?? "",
                    });
                    setRouteOpen(true);
                  }}
                >
                  Edit
                </Button>
                <Button variant="ghost" size="sm" onClick={() => deleteRoute(selected)}>
                  Delete
                </Button>
              </div>
            </div>

            <div className="rounded-md border border-border">
              <div className="grid grid-cols-[1fr_auto_auto] gap-x-3 border-b border-border px-3 py-2 text-xs font-medium text-muted-foreground">
                <span>Stop</span>
                <span>Direction</span>
                <span />
              </div>
              {sortedStops.length === 0 ? (
                <p className="p-6 text-center text-sm text-muted-foreground">No stops yet.</p>
              ) : (
                sortedStops.map((s) => (
                  <div
                    key={s.id}
                    className="grid grid-cols-[1fr_auto_auto] items-center gap-x-3 border-b border-border px-3 py-2 text-sm last:border-b-0"
                  >
                    <span>
                      <span className="font-medium">
                        {s.sequence}. {s.name}
                      </span>
                      {s.scheduledPickupTime ? (
                        <span className="ml-2 text-xs text-muted-foreground">
                          {s.scheduledPickupTime}
                        </span>
                      ) : null}
                    </span>
                    <Badge variant="secondary">{s.direction}</Badge>
                    <Button variant="ghost" size="sm" onClick={() => deleteStop(s.id)}>
                      Remove
                    </Button>
                  </div>
                ))
              )}
            </div>

            <div className="rounded-md border border-border p-4">
              <h4 className="mb-3 text-sm font-medium">Add stop</h4>
              <div className="grid gap-3 sm:grid-cols-2">
                <div className="space-y-1">
                  <Label htmlFor="s-name">Name</Label>
                  <Input
                    id="s-name"
                    value={stopForm.name}
                    placeholder="Lavington"
                    onChange={(e) => setStopForm({ ...stopForm, name: e.target.value })}
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <Label htmlFor="s-seq">Sequence</Label>
                    <Input
                      id="s-seq"
                      type="number"
                      value={stopForm.sequence}
                      onChange={(e) => setStopForm({ ...stopForm, sequence: e.target.value })}
                    />
                  </div>
                  <div className="space-y-1">
                    <Label>Direction</Label>
                    <Select
                      value={stopForm.direction}
                      onValueChange={(v) =>
                        setStopForm({ ...stopForm, direction: v as RouteStopDirection })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="AM_PICKUP">AM pickup</SelectItem>
                        <SelectItem value="PM_DROP">PM drop</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="space-y-1">
                  <Label htmlFor="s-time">Scheduled time (HH:MM)</Label>
                  <Input
                    id="s-time"
                    value={stopForm.scheduledPickupTime}
                    placeholder="06:35"
                    onChange={(e) =>
                      setStopForm({ ...stopForm, scheduledPickupTime: e.target.value })
                    }
                  />
                </div>
                <div className="grid grid-cols-3 gap-3">
                  <div className="space-y-1">
                    <Label htmlFor="s-lat">Latitude</Label>
                    <Input
                      id="s-lat"
                      value={stopForm.lat}
                      onChange={(e) => setStopForm({ ...stopForm, lat: e.target.value })}
                    />
                  </div>
                  <div className="space-y-1">
                    <Label htmlFor="s-lng">Longitude</Label>
                    <Input
                      id="s-lng"
                      value={stopForm.lng}
                      onChange={(e) => setStopForm({ ...stopForm, lng: e.target.value })}
                    />
                  </div>
                  <div className="space-y-1">
                    <Label htmlFor="s-geo">Geofence (m)</Label>
                    <Input
                      id="s-geo"
                      type="number"
                      value={stopForm.geofenceRadiusM}
                      onChange={(e) =>
                        setStopForm({ ...stopForm, geofenceRadiusM: e.target.value })
                      }
                    />
                  </div>
                </div>
              </div>
              <div className="mt-3">
                <Button onClick={submitStop} disabled={busy}>
                  {busy ? "Adding…" : "Add stop"}
                </Button>
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="text-sm font-medium">
                  Students on this route ({activeAssignments.length})
                </h4>
                <Button size="sm" onClick={openAssign}>
                  Assign students
                </Button>
              </div>
              {activeAssignments.length === 0 ? (
                <p className="rounded-md border border-dashed border-border p-6 text-center text-sm text-muted-foreground">
                  No students assigned yet.
                </p>
              ) : (
                <div className="rounded-md border border-border">
                  {activeAssignments.map((a) => (
                    <div
                      key={a.id}
                      className="flex items-center justify-between border-b border-border px-3 py-2 text-sm last:border-b-0"
                    >
                      <span>
                        <span className="font-medium">
                          {a.student?.user?.name ??
                            a.student?.admission_number ??
                            a.studentId}
                        </span>
                        <span className="ml-2 text-xs text-muted-foreground">
                          {a.routeStop?.name ?? a.pickupPoint ?? "No stop"}
                        </span>
                      </span>
                      <Button variant="ghost" size="sm" onClick={() => removeAssignment(a)}>
                        Remove
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </>
        )}
      </div>

      <Dialog open={routeOpen} onOpenChange={setRouteOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editRoute ? "Edit route" : "Add route"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <div className="space-y-1">
              <Label htmlFor="r-name">Name</Label>
              <Input
                id="r-name"
                value={routeForm.name}
                placeholder="Kilimani → School"
                onChange={(e) => setRouteForm({ ...routeForm, name: e.target.value })}
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label htmlFor="r-fee">Fee</Label>
                <Input
                  id="r-fee"
                  type="number"
                  value={routeForm.fee}
                  onChange={(e) => setRouteForm({ ...routeForm, fee: e.target.value })}
                />
              </div>
              <div className="space-y-1">
                <Label htmlFor="r-cycle">Billing cycle</Label>
                <Input
                  id="r-cycle"
                  value={routeForm.billingCycleLabel}
                  placeholder="Per Term"
                  onChange={(e) =>
                    setRouteForm({ ...routeForm, billingCycleLabel: e.target.value })
                  }
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setRouteOpen(false)}>
              Cancel
            </Button>
            <Button onClick={submitRoute} disabled={busy}>
              {busy ? "Saving…" : "Save"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={assignOpen} onOpenChange={setAssignOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Assign students</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <div className="space-y-1">
              <Label>Pickup stop (optional)</Label>
              <Select
                value={assignStopId || "none"}
                onValueChange={(v) => setAssignStopId(v === "none" ? "" : v)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="No stop" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">No stop</SelectItem>
                  {sortedStops.map((s) => (
                    <SelectItem key={s.id} value={s.id}>
                      {s.sequence}. {s.name} ({s.direction})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1">
              <Label htmlFor="a-search">Students</Label>
              <Input
                id="a-search"
                value={studentSearch}
                placeholder="Search by name or admission number"
                onChange={(e) => setStudentSearch(e.target.value)}
              />
            </div>
            <div className="max-h-64 overflow-y-auto rounded-md border border-border">
              {filteredStudents.length === 0 ? (
                <p className="p-4 text-center text-sm text-muted-foreground">
                  No students to add.
                </p>
              ) : (
                filteredStudents.map((s) => (
                  <label
                    key={s.id}
                    className="flex cursor-pointer items-center gap-3 border-b border-border px-3 py-2 text-sm last:border-b-0"
                  >
                    <Checkbox
                      checked={selectedStudentIds.has(s.id)}
                      onCheckedChange={() => toggleStudent(s.id)}
                    />
                    <span className="font-medium">
                      {s.name ?? s.admission_number ?? s.id}
                    </span>
                    {s.admission_number ? (
                      <span className="text-xs text-muted-foreground">{s.admission_number}</span>
                    ) : null}
                  </label>
                ))
              )}
            </div>
            <p className="text-xs text-muted-foreground">
              {selectedStudentIds.size} selected
            </p>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setAssignOpen(false)}>
              Cancel
            </Button>
            <Button onClick={submitAssign} disabled={busy}>
              {busy ? "Assigning…" : "Assign"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </section>
  );
}
