"use client";

import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { getDisplayErrorMessage } from "@/lib/utils/graphql-errors";
import {
  fetchTransportStopRequests,
  approveTransportStopRequest,
  rejectTransportStopRequest,
  mergeTransportStopRequests,
  fetchTransportStopMergeRequests,
  approveTransportStopMergeRequest,
  rejectTransportStopMergeRequest,
  fetchTransportRoutes,
  fetchTransportMapConfig,
  type MergeTransportStopRequestsInput,
  type TransportStopRequest,
  type TransportStopMergeRequest,
  type TransportRoute,
  type TransportStopRequestStatus,
} from "@/lib/school/transportApi";
import { LiveBusesMap } from "@/components/transport/LiveBusesMap";

type Direction = "AM_PICKUP" | "PM_DROP";
type MapConfig = Awaited<ReturnType<typeof fetchTransportMapConfig>>;
type Filter = TransportStopRequestStatus | "ALL";

const FILTERS: { id: Filter; label: string }[] = [
  { id: "PENDING", label: "Pending" },
  { id: "APPROVED", label: "Approved" },
  { id: "REJECTED", label: "Rejected" },
  { id: "ALL", label: "All" },
];

const TIME_RE = /^([01]\d|2[0-3]):[0-5]\d$/;

interface ApproveForm {
  routeId: string;
  name: string;
  sequence: string;
  direction: Direction;
  scheduledPickupTime: string;
  geofenceRadiusM: string;
  note: string;
}

function statusVariant(
  status: TransportStopRequestStatus,
): "default" | "secondary" | "destructive" {
  if (status === "APPROVED") return "default";
  if (status === "REJECTED") return "destructive";
  return "secondary";
}

function childName(request: TransportStopRequest): string {
  return request.student?.user?.name ?? "Student";
}

/**
 * Parent-submitted pickup/home stop requests. A school admin reviews the queue,
 * previews the proposed pin, then approves (creating the stop and assigning the
 * child) or declines with an optional note.
 */
export function StopRequestsPanel() {
  const [requests, setRequests] = useState<TransportStopRequest[]>([]);
  const [routes, setRoutes] = useState<TransportRoute[]>([]);
  const [config, setConfig] = useState<MapConfig | null>(null);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [filter, setFilter] = useState<Filter>("PENDING");
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [approveForm, setApproveForm] = useState<ApproveForm>({
    routeId: "",
    name: "",
    sequence: "",
    direction: "AM_PICKUP",
    scheduledPickupTime: "",
    geofenceRadiusM: "200",
    note: "",
  });
  const [rejectNote, setRejectNote] = useState("");
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [showMergeForm, setShowMergeForm] = useState(false);
  const [mergeForm, setMergeForm] = useState<ApproveForm>({
    routeId: "",
    name: "",
    sequence: "",
    direction: "AM_PICKUP",
    scheduledPickupTime: "",
    geofenceRadiusM: "200",
    note: "",
  });
  const [mergeRequests, setMergeRequests] = useState<
    TransportStopMergeRequest[]
  >([]);
  const [mergeNotes, setMergeNotes] = useState<Record<string, string>>({});
  const [mergeBusyId, setMergeBusyId] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      const [list, merges] = await Promise.all([
        fetchTransportStopRequests(),
        fetchTransportStopMergeRequests(),
      ]);
      setRequests(list);
      setMergeRequests(merges);
      setSelectedIds((prev) => {
        if (prev.size === 0) return prev;
        const pending = new Set(
          list.filter((r) => r.status === "PENDING").map((r) => r.id),
        );
        const next = new Set([...prev].filter((id) => pending.has(id)));
        return next.size === prev.size ? prev : next;
      });
    } catch (err) {
      toast.error(getDisplayErrorMessage(err));
    }
  }, []);

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const [cfg, routeList, list, mergeList] = await Promise.all([
          fetchTransportMapConfig(),
          fetchTransportRoutes(),
          fetchTransportStopRequests(),
          fetchTransportStopMergeRequests(),
        ]);
        if (!active) return;
        setConfig(cfg);
        setRoutes(routeList);
        setRequests(list);
        setMergeRequests(mergeList);
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
    const id = window.setInterval(() => {
      if (document.hidden) return;
      void load();
    }, 25000);
    return () => window.clearInterval(id);
  }, [load]);

  const toggleSelected = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const clearSelection = () => {
    setSelectedIds(new Set());
    setShowMergeForm(false);
  };

  const openRequest = (request: TransportStopRequest) => {
    if (expandedId === request.id) {
      setExpandedId(null);
      return;
    }
    setExpandedId(request.id);
    setRejectNote("");
    setApproveForm({
      routeId: request.routeId ?? routes[0]?.id ?? "",
      name: request.name,
      sequence: "",
      direction: request.direction ?? "AM_PICKUP",
      scheduledPickupTime: request.scheduledPickupTime ?? "",
      geofenceRadiusM: "200",
      note: "",
    });
  };

  const submitApprove = async (requestId: string) => {
    if (!approveForm.routeId) {
      toast.error("Select a route before approving.");
      return;
    }
    setBusy(true);
    try {
      const time = approveForm.scheduledPickupTime.trim();
      const sequence = approveForm.sequence.trim();
      const geofence = approveForm.geofenceRadiusM.trim();
      await approveTransportStopRequest({
        requestId,
        routeId: approveForm.routeId,
        name: approveForm.name.trim() || undefined,
        sequence: sequence ? Number(sequence) : undefined,
        direction: approveForm.direction,
        scheduledPickupTime: TIME_RE.test(time) ? time : undefined,
        geofenceRadiusM: geofence ? Number(geofence) : undefined,
        note: approveForm.note.trim() || undefined,
      });
      toast.success("Request approved");
      setExpandedId(null);
      await load();
    } catch (err) {
      toast.error(getDisplayErrorMessage(err));
    } finally {
      setBusy(false);
    }
  };

  const submitReject = async (requestId: string) => {
    setBusy(true);
    try {
      await rejectTransportStopRequest({
        requestId,
        note: rejectNote.trim() || undefined,
      });
      toast.success("Request declined");
      setExpandedId(null);
      setRejectNote("");
      await load();
    } catch (err) {
      toast.error(getDisplayErrorMessage(err));
    } finally {
      setBusy(false);
    }
  };

  const submitMerge = async () => {
    if (!mergeForm.routeId) {
      toast.error("Select a route before merging.");
      return;
    }
    setBusy(true);
    try {
      const time = mergeForm.scheduledPickupTime.trim();
      const sequence = mergeForm.sequence.trim();
      const geofence = mergeForm.geofenceRadiusM.trim();
      const input: MergeTransportStopRequestsInput = {
        requestIds: [...selectedIds],
        routeId: mergeForm.routeId,
        name: mergeForm.name.trim() || undefined,
        sequence: sequence ? Number(sequence) : undefined,
        direction: mergeForm.direction,
        scheduledPickupTime: TIME_RE.test(time) ? time : undefined,
        geofenceRadiusM: geofence ? Number(geofence) : undefined,
        note: mergeForm.note.trim() || undefined,
      };
      await mergeTransportStopRequests(input);
      toast.success("Requests merged into one stop");
      setSelectedIds(new Set());
      setShowMergeForm(false);
      setExpandedId(null);
      await load();
    } catch (err) {
      toast.error(getDisplayErrorMessage(err));
    } finally {
      setBusy(false);
    }
  };

  const decideMerge = async (
    requestId: string,
    action: "approve" | "reject",
  ) => {
    setMergeBusyId(requestId);
    try {
      const note = (mergeNotes[requestId] ?? "").trim();
      if (action === "approve") {
        await approveTransportStopMergeRequest({
          requestId,
          note: note || undefined,
        });
        toast.success("Merge approved");
      } else {
        await rejectTransportStopMergeRequest({
          requestId,
          note: note || undefined,
        });
        toast.success("Merge declined");
      }
      setMergeNotes((prev) => {
        const next = { ...prev };
        delete next[requestId];
        return next;
      });
      await load();
    } catch (err) {
      toast.error(getDisplayErrorMessage(err));
    } finally {
      setMergeBusyId(null);
    }
  };

  const filtered =
    filter === "ALL"
      ? requests
      : requests.filter((request) => request.status === filter);

  return (
    <section className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <h2 className="text-sm font-medium text-muted-foreground">
            Pickup &amp; home stop requests
          </h2>
          <span className="text-xs text-muted-foreground">
            {filtered.length} shown
          </span>
        </div>
        <Button variant="outline" size="sm" onClick={() => void load()}>
          Refresh
        </Button>
      </div>

      <div className="flex flex-wrap gap-1">
        {FILTERS.map((item) => (
          <button
            key={item.id}
            type="button"
            onClick={() => setFilter(item.id)}
            className={`rounded-full border px-3 py-1 text-xs font-medium transition-colors ${
              filter === item.id
                ? "border-primary bg-primary text-white"
                : "border-border text-muted-foreground hover:text-foreground"
            }`}
          >
            {item.label}
          </button>
        ))}
      </div>

      {selectedIds.size >= 2 ? (
        <div className="rounded-2xl border border-border bg-card p-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <span className="text-sm text-muted-foreground">
              {selectedIds.size} pending requests selected
            </span>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={clearSelection}
                disabled={busy}
              >
                Clear
              </Button>
              <Button
                size="sm"
                onClick={() => setShowMergeForm((value) => !value)}
                disabled={busy}
              >
                Merge into one stop
              </Button>
            </div>
          </div>

          {showMergeForm ? (
            <div className="mt-4 space-y-3">
              <div className="grid gap-3 sm:grid-cols-2">
                <div className="space-y-1">
                  <Label>Route</Label>
                  <Select
                    value={mergeForm.routeId}
                    onValueChange={(value) =>
                      setMergeForm({ ...mergeForm, routeId: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select a route" />
                    </SelectTrigger>
                    <SelectContent>
                      {routes.map((route) => (
                        <SelectItem key={route.id} value={route.id}>
                          {route.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1">
                  <Label htmlFor="merge-name">Stop name</Label>
                  <Input
                    id="merge-name"
                    value={mergeForm.name}
                    onChange={(e) =>
                      setMergeForm({ ...mergeForm, name: e.target.value })
                    }
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <Label htmlFor="merge-seq">Sequence</Label>
                    <Input
                      id="merge-seq"
                      type="number"
                      value={mergeForm.sequence}
                      onChange={(e) =>
                        setMergeForm({ ...mergeForm, sequence: e.target.value })
                      }
                    />
                  </div>
                  <div className="space-y-1">
                    <Label>Direction</Label>
                    <Select
                      value={mergeForm.direction}
                      onValueChange={(value) =>
                        setMergeForm({
                          ...mergeForm,
                          direction: value as Direction,
                        })
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
                  <Label htmlFor="merge-time">Scheduled time (HH:MM)</Label>
                  <Input
                    id="merge-time"
                    value={mergeForm.scheduledPickupTime}
                    placeholder="06:35"
                    onChange={(e) =>
                      setMergeForm({
                        ...mergeForm,
                        scheduledPickupTime: e.target.value,
                      })
                    }
                  />
                </div>
                <div className="space-y-1">
                  <Label htmlFor="merge-geo">Geofence (m)</Label>
                  <Input
                    id="merge-geo"
                    type="number"
                    value={mergeForm.geofenceRadiusM}
                    onChange={(e) =>
                      setMergeForm({
                        ...mergeForm,
                        geofenceRadiusM: e.target.value,
                      })
                    }
                  />
                </div>
              </div>
              <div className="space-y-1">
                <Label htmlFor="merge-note">Note (optional)</Label>
                <Textarea
                  id="merge-note"
                  rows={2}
                  value={mergeForm.note}
                  onChange={(e) =>
                    setMergeForm({ ...mergeForm, note: e.target.value })
                  }
                />
              </div>
              <div>
                <Button
                  onClick={() => void submitMerge()}
                  disabled={busy || !mergeForm.routeId}
                >
                  {busy ? "Saving…" : "Merge"}
                </Button>
              </div>
            </div>
          ) : null}
        </div>
      ) : null}

      {loading ? (
        <Skeleton className="h-24 w-full rounded-2xl" />
      ) : filtered.length === 0 ? (
        <p className="rounded-2xl border border-dashed border-border p-6 text-center text-sm text-muted-foreground">
          No stop requests to review.
        </p>
      ) : (
        <ul className="divide-y divide-border rounded-2xl border border-border">
          {filtered.map((request) => {
            const isOpen = expandedId === request.id;
            return (
              <li key={request.id}>
                <div className="flex items-start gap-3 px-4 py-3 text-sm hover:bg-muted/40">
                  {request.status === "PENDING" ? (
                    <Checkbox
                      className="mt-1"
                      checked={selectedIds.has(request.id)}
                      onCheckedChange={() => toggleSelected(request.id)}
                      aria-label="Select request for merging"
                    />
                  ) : null}
                  <button
                    type="button"
                    onClick={() => openRequest(request)}
                    className="flex w-full items-start justify-between gap-3 text-left"
                  >
                    <div className="space-y-0.5">
                      <div className="font-medium text-foreground">
                        {childName(request)}
                      </div>
                      <div className="text-muted-foreground">
                        {request.name}
                      </div>
                      {request.address ? (
                        <div className="text-xs text-muted-foreground">
                          {request.address}
                        </div>
                      ) : null}
                      <div className="text-xs text-muted-foreground">
                        {request.lat.toFixed(4)}, {request.lng.toFixed(4)}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {new Date(request.createdAt).toLocaleString()}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant={statusVariant(request.status)}>
                        {request.status}
                      </Badge>
                      <span className="text-xs text-muted-foreground">
                        {isOpen ? "Collapse" : "Expand"}
                      </span>
                    </div>
                  </button>
                </div>

                {isOpen ? (
                  <div className="space-y-4 border-t border-border p-4">
                    {config?.enabled && config.styleUrl ? (
                      <LiveBusesMap
                        styleUrl={config.styleUrl}
                        buses={[]}
                        stops={[
                          {
                            id: request.id,
                            lat: request.lat,
                            lng: request.lng,
                            name: request.name,
                          },
                        ]}
                        selectedTripId={null}
                        onSelect={() => undefined}
                      />
                    ) : (
                      <div className="rounded-2xl border border-dashed border-border p-6 text-sm text-muted-foreground">
                        Live maps are not configured. A super admin can set a tile
                        provider under{" "}
                        <span className="font-medium text-foreground">
                          Dashboard → Maps
                        </span>
                        . The proposed pin is at {request.lat.toFixed(4)},{" "}
                        {request.lng.toFixed(4)}.
                      </div>
                    )}

                    {request.status === "PENDING" ? (
                      <>
                        <div className="rounded-2xl border border-border bg-card p-4">
                          <h3 className="mb-3 text-sm font-medium text-foreground">
                            Approve request
                          </h3>
                          <div className="grid gap-3 sm:grid-cols-2">
                            <div className="space-y-1">
                              <Label>Route</Label>
                              <Select
                                value={approveForm.routeId}
                                onValueChange={(value) =>
                                  setApproveForm({
                                    ...approveForm,
                                    routeId: value,
                                  })
                                }
                              >
                                <SelectTrigger>
                                  <SelectValue placeholder="Select a route" />
                                </SelectTrigger>
                                <SelectContent>
                                  {routes.map((route) => (
                                    <SelectItem key={route.id} value={route.id}>
                                      {route.name}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </div>
                            <div className="space-y-1">
                              <Label htmlFor={`name-${request.id}`}>Stop name</Label>
                              <Input
                                id={`name-${request.id}`}
                                value={approveForm.name}
                                onChange={(e) =>
                                  setApproveForm({
                                    ...approveForm,
                                    name: e.target.value,
                                  })
                                }
                              />
                            </div>
                            <div className="grid grid-cols-2 gap-3">
                              <div className="space-y-1">
                                <Label htmlFor={`seq-${request.id}`}>Sequence</Label>
                                <Input
                                  id={`seq-${request.id}`}
                                  type="number"
                                  value={approveForm.sequence}
                                  onChange={(e) =>
                                    setApproveForm({
                                      ...approveForm,
                                      sequence: e.target.value,
                                    })
                                  }
                                />
                              </div>
                              <div className="space-y-1">
                                <Label>Direction</Label>
                                <Select
                                  value={approveForm.direction}
                                  onValueChange={(value) =>
                                    setApproveForm({
                                      ...approveForm,
                                      direction: value as Direction,
                                    })
                                  }
                                >
                                  <SelectTrigger>
                                    <SelectValue />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="AM_PICKUP">
                                      AM pickup
                                    </SelectItem>
                                    <SelectItem value="PM_DROP">
                                      PM drop
                                    </SelectItem>
                                  </SelectContent>
                                </Select>
                              </div>
                            </div>
                            <div className="space-y-1">
                              <Label htmlFor={`time-${request.id}`}>
                                Scheduled time (HH:MM)
                              </Label>
                              <Input
                                id={`time-${request.id}`}
                                value={approveForm.scheduledPickupTime}
                                placeholder="06:35"
                                onChange={(e) =>
                                  setApproveForm({
                                    ...approveForm,
                                    scheduledPickupTime: e.target.value,
                                  })
                                }
                              />
                            </div>
                            <div className="space-y-1">
                              <Label htmlFor={`geo-${request.id}`}>
                                Geofence (m)
                              </Label>
                              <Input
                                id={`geo-${request.id}`}
                                type="number"
                                value={approveForm.geofenceRadiusM}
                                onChange={(e) =>
                                  setApproveForm({
                                    ...approveForm,
                                    geofenceRadiusM: e.target.value,
                                  })
                                }
                              />
                            </div>
                          </div>
                          <div className="mt-3 space-y-1">
                            <Label htmlFor={`note-${request.id}`}>
                              Note (optional)
                            </Label>
                            <Textarea
                              id={`note-${request.id}`}
                              rows={2}
                              value={approveForm.note}
                              onChange={(e) =>
                                setApproveForm({
                                  ...approveForm,
                                  note: e.target.value,
                                })
                              }
                            />
                          </div>
                          <div className="mt-3">
                            <Button
                              onClick={() => void submitApprove(request.id)}
                              disabled={busy || !approveForm.routeId}
                            >
                              {busy ? "Saving…" : "Approve"}
                            </Button>
                          </div>
                        </div>

                        <div className="rounded-2xl border border-border bg-card p-4">
                          <h3 className="mb-3 text-sm font-medium text-foreground">
                            Decline request
                          </h3>
                          <Textarea
                            rows={2}
                            value={rejectNote}
                            placeholder="Reason for declining (optional)"
                            onChange={(e) => setRejectNote(e.target.value)}
                          />
                          <div className="mt-3">
                            <Button
                              variant="destructive"
                              onClick={() => void submitReject(request.id)}
                              disabled={busy}
                            >
                              {busy ? "Saving…" : "Decline"}
                            </Button>
                          </div>
                        </div>
                      </>
                    ) : (
                      <div className="rounded-2xl border border-border bg-card p-4 text-sm">
                        <div className="flex items-center justify-between">
                          <span className="font-medium text-foreground">
                            Decision
                          </span>
                          <Badge variant={statusVariant(request.status)}>
                            {request.status}
                          </Badge>
                        </div>
                        <dl className="mt-3 grid grid-cols-2 gap-2">
                          <div>
                            <dt className="text-muted-foreground">Route</dt>
                            <dd>{request.route?.name ?? "—"}</dd>
                          </div>
                          <div>
                            <dt className="text-muted-foreground">Stop</dt>
                            <dd>{request.routeStop?.name ?? "—"}</dd>
                          </div>
                        </dl>
                        {request.decisionNote ? (
                          <p className="mt-3 text-muted-foreground">
                            Note: {request.decisionNote}
                          </p>
                        ) : null}
                      </div>
                    )}
                  </div>
                ) : null}
              </li>
            );
          })}
        </ul>
      )}

      <div className="space-y-3">
        <div className="flex items-center gap-3">
          <h2 className="text-sm font-medium text-muted-foreground">
            Stop merge proposals
          </h2>
          <span className="text-xs text-muted-foreground">
            {mergeRequests.length} shown
          </span>
        </div>

        {loading ? (
          <Skeleton className="h-16 w-full rounded-2xl" />
        ) : mergeRequests.length === 0 ? (
          <p className="rounded-2xl border border-dashed border-border p-6 text-center text-sm text-muted-foreground">
            No stop merge proposals to review.
          </p>
        ) : (
          <ul className="divide-y divide-border rounded-2xl border border-border">
            {mergeRequests.map((merge) => {
              const fromName = merge.fromRouteStop?.name ?? "—";
              const toName = merge.toRouteStop?.name ?? "—";
              const isPending = merge.status === "PENDING";
              const saving = mergeBusyId === merge.id;
              return (
                <li key={merge.id} className="space-y-3 px-4 py-3 text-sm">
                  <div className="flex items-start justify-between gap-3">
                    <div className="space-y-0.5">
                      <div className="font-medium text-foreground">
                        {`Merge ${fromName} into ${toName}`}
                      </div>
                      {merge.note ? (
                        <div className="text-muted-foreground">
                          {merge.note}
                        </div>
                      ) : null}
                      <div className="text-xs text-muted-foreground">
                        {new Date(merge.createdAt).toLocaleString()}
                      </div>
                    </div>
                    <Badge variant={statusVariant(merge.status)}>
                      {merge.status}
                    </Badge>
                  </div>

                  {isPending ? (
                    <div className="space-y-2">
                      <Textarea
                        rows={2}
                        value={mergeNotes[merge.id] ?? ""}
                        placeholder="Note (optional)"
                        onChange={(e) =>
                          setMergeNotes((prev) => ({
                            ...prev,
                            [merge.id]: e.target.value,
                          }))
                        }
                      />
                      <div className="flex items-center gap-2">
                        <Button
                          size="sm"
                          onClick={() => void decideMerge(merge.id, "approve")}
                          disabled={mergeBusyId !== null}
                        >
                          {saving ? "Saving…" : "Approve"}
                        </Button>
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => void decideMerge(merge.id, "reject")}
                          disabled={mergeBusyId !== null}
                        >
                          {saving ? "Saving…" : "Reject"}
                        </Button>
                      </div>
                    </div>
                  ) : merge.decisionNote ? (
                    <p className="text-muted-foreground">
                      Note: {merge.decisionNote}
                    </p>
                  ) : null}
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </section>
  );
}
