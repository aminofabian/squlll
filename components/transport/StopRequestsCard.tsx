"use client";

import { useCallback, useEffect, useState } from "react";
import { MapPin, Plus } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { RequestStopDialog } from "@/components/transport/RequestStopDialog";
import { useStopRequestLiveUpdates } from "@/lib/realtime/useStopRequestLiveUpdates";
import type {
  RequestMyTransportStopInput,
  TransportStopRequest,
  TransportStopRequestStatus,
} from "@/lib/school/transportApi";

const STATUS_BADGE: Record<TransportStopRequestStatus, string> = {
  PENDING: "border-amber-200 bg-amber-50 text-amber-700",
  APPROVED: "border-emerald-200 bg-emerald-50 text-emerald-700",
  REJECTED: "border-red-200 bg-red-50 text-red-700",
};

const STATUS_LABEL: Record<TransportStopRequestStatus, string> = {
  PENDING: "Pending review",
  APPROVED: "Approved",
  REJECTED: "Not approved",
};

export interface StopRequestsCardProps {
  studentName?: string | null;
  /** The student's current stop, shown for context on the picker. */
  currentStop?: { lat: number; lng: number; name: string } | null;
  /** Loads this student's requests. Must be stable (useCallback / module fn). */
  loadRequests: () => Promise<TransportStopRequest[]>;
  /** Creates a request for this student. Must be stable. */
  submitRequest: (
    input: RequestMyTransportStopInput,
  ) => Promise<TransportStopRequest>;
}

/**
 * The "Pickup point" panel shared by the parent and student transports: the list of
 * requests (both parties see the same list) plus the propose-a-stop flow. It
 * refetches live when the counterpart party acts.
 */
export function StopRequestsCard({
  studentName,
  currentStop,
  loadRequests,
  submitRequest,
}: StopRequestsCardProps) {
  const [requests, setRequests] = useState<TransportStopRequest[]>([]);
  const [dialogOpen, setDialogOpen] = useState(false);

  const reload = useCallback(async () => {
    try {
      setRequests(await loadRequests());
    } catch {
      setRequests([]);
    }
  }, [loadRequests]);

  useEffect(() => {
    let active = true;
    void (async () => {
      try {
        const list = await loadRequests();
        if (active) setRequests(list);
      } catch {
        if (active) setRequests([]);
      }
    })();
    return () => {
      active = false;
    };
  }, [loadRequests]);

  useStopRequestLiveUpdates(reload);

  return (
    <section className="rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900">
      <div className="flex items-center justify-between gap-3">
        <h3 className="flex items-center gap-2 font-semibold text-slate-900 dark:text-slate-100">
          <MapPin className="h-4 w-4 text-primary" />
          Pickup point
        </h3>
        <Button
          type="button"
          size="sm"
          variant="outline"
          onClick={() => setDialogOpen(true)}
        >
          <Plus className="mr-1.5 h-4 w-4" />
          Request a pickup point
        </Button>
      </div>

      {requests.length === 0 ? (
        <p className="mt-2 text-sm text-slate-500">
          No requests yet. If the bus stop is inconvenient, propose a new one for
          the school to review.
        </p>
      ) : (
        <ul className="mt-3">
          {requests.map((request) => (
            <li
              key={request.id}
              className="flex flex-wrap items-center justify-between gap-2 border-t border-slate-100 py-2.5 text-sm first:border-t-0 dark:border-slate-800"
            >
              <div className="min-w-0">
                <p className="truncate font-medium text-slate-900 dark:text-slate-100">
                  {request.name}
                </p>
                <p className="truncate text-xs text-slate-500">
                  {request.address ? `${request.address} · ` : ""}
                  {request.lat.toFixed(4)}, {request.lng.toFixed(4)}
                  {request.decisionNote ? ` · ${request.decisionNote}` : ""}
                </p>
              </div>
              <Badge variant="outline" className={STATUS_BADGE[request.status]}>
                {STATUS_LABEL[request.status]}
              </Badge>
            </li>
          ))}
        </ul>
      )}

      <RequestStopDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        studentName={studentName}
        currentStop={currentStop}
        submitRequest={submitRequest}
        onSubmitted={(request) => setRequests((prev) => [request, ...prev])}
      />
    </section>
  );
}
