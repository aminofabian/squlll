"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { toast } from "sonner";
import { Loader2, LocateFixed } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
  fetchTransportMapConfig,
  reverseGeocode,
  type RequestMyTransportStopInput,
  type RouteStopDirection,
  type TransportMapConfig,
  type TransportStopRequest,
} from "@/lib/school/transportApi";
import { LiveBusesMap } from "@/components/transport/LiveBusesMap";

/** "HH:MM" (24h), so a bad time is simply not sent rather than rejected server-side. */
const TIME_RE = /^([01]\d|2[0-3]):[0-5]\d$/;

function parseCoord(value: string, min: number, max: number): number | null {
  const n = Number(value);
  if (!Number.isFinite(n) || n < min || n > max) return null;
  return n;
}

export interface RequestStopDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  studentName?: string | null;
  /** The child's current stop, shown for context on the picker. */
  currentStop?: { lat: number; lng: number; name: string } | null;
  /** Creates the request for whichever student this dialog is bound to. */
  submitRequest: (
    input: RequestMyTransportStopInput,
  ) => Promise<TransportStopRequest>;
  onSubmitted: (request: TransportStopRequest) => void;
}

/**
 * Form to propose a pickup/home point: a pinned location (map click, "use my
 * location", or typed coordinates), a label, and notes. Shared by the parent and
 * student portals; the caller supplies the student-scoped submit action.
 *
 * The inner form is mounted only while open, so it always starts clean without a
 * reset effect.
 */
export function RequestStopDialog({ open, onOpenChange, ...form }: RequestStopDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-2xl">
        {open ? (
          <StopRequestForm {...form} onClose={() => onOpenChange(false)} />
        ) : null}
      </DialogContent>
    </Dialog>
  );
}

function StopRequestForm({
  studentName,
  currentStop,
  submitRequest,
  onSubmitted,
  onClose,
}: Omit<RequestStopDialogProps, "open" | "onOpenChange"> & { onClose: () => void }) {
  const [name, setName] = useState("");
  const [address, setAddress] = useState("");
  const [notes, setNotes] = useState("");
  const [latStr, setLatStr] = useState("");
  const [lngStr, setLngStr] = useState("");
  const [direction, setDirection] = useState<RouteStopDirection | "">("");
  const [time, setTime] = useState("");
  const [config, setConfig] = useState<TransportMapConfig | null>(null);
  const [submitting, setSubmitting] = useState(false);
  // True while the label is ours (auto-filled) rather than typed by the user.
  const autoFilledRef = useRef(true);

  useEffect(() => {
    let active = true;
    void (async () => {
      try {
        const cfg = await fetchTransportMapConfig();
        if (active) setConfig(cfg);
      } catch {
        if (active) setConfig(null);
      }
    })();
    return () => {
      active = false;
    };
  }, []);

  const lat = parseCoord(latStr, -90, 90);
  const lng = parseCoord(lngStr, -180, 180);
  const pickPoint = lat != null && lng != null ? { lat, lng } : null;

  const stops = useMemo(
    () =>
      currentStop
        ? [
            {
              id: "current",
              lat: currentStop.lat,
              lng: currentStop.lng,
              name: currentStop.name,
            },
          ]
        : [],
    [currentStop],
  );

  const canSubmit = name.trim().length > 0 && pickPoint != null && !submitting;

  /** Fill the label from a place name — unless the user typed their own. */
  const autoName = async (point: { lat: number; lng: number }) => {
    if (name.trim() && !autoFilledRef.current) return;
    try {
      const label = await reverseGeocode(point.lat, point.lng);
      if (label) {
        setName(label);
        autoFilledRef.current = true;
      }
    } catch {
      /* best-effort — a geocode failure must not block the picker */
    }
  };

  const pickMyLocation = async () => {
    if (typeof navigator === "undefined" || !navigator.geolocation) {
      toast.error("Location is not available on this device");
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setLatStr(pos.coords.latitude.toFixed(6));
        setLngStr(pos.coords.longitude.toFixed(6));
        void autoName({ lat: pos.coords.latitude, lng: pos.coords.longitude });
      },
      () => toast.error("Could not read your location"),
      { enableHighAccuracy: true, timeout: 10000 },
    );
  };

  const submit = async () => {
    if (!pickPoint) return;
    setSubmitting(true);
    try {
      const request = await submitRequest({
        name: name.trim(),
        address: address.trim() || undefined,
        lat: pickPoint.lat,
        lng: pickPoint.lng,
        direction: direction || undefined,
        scheduledPickupTime: TIME_RE.test(time) ? time : undefined,
        notes: notes.trim() || undefined,
      });
      toast.success("Pickup point sent to the school");
      onClose();
      onSubmitted(request);
    } catch (err) {
      toast.error(getDisplayErrorMessage(err));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      <DialogHeader>
        <DialogTitle>Request a pickup point</DialogTitle>
        <DialogDescription>
          Drop a pin where the bus should collect {studentName ?? "the student"}.
          The school reviews it before it becomes a stop.
        </DialogDescription>
      </DialogHeader>

      <div className="space-y-4">
        <div className="space-y-1.5">
          <Label htmlFor="rs-name">Label</Label>
          <Input
            id="rs-name"
            value={name}
            placeholder="Home — Kilimani"
            onChange={(e) => {
              autoFilledRef.current = false;
              setName(e.target.value);
            }}
          />
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="rs-address">Address (optional)</Label>
          <Input
            id="rs-address"
            value={address}
            placeholder="123 Argwings Kodhek Rd"
            onChange={(e) => setAddress(e.target.value)}
          />
        </div>

        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <Label>Location</Label>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => void pickMyLocation()}
            >
              <LocateFixed className="mr-1.5 h-4 w-4" />
              Use my location
            </Button>
          </div>
          {config?.enabled && config.styleUrl ? (
            <div className="space-y-2">
              <LiveBusesMap
                styleUrl={config.styleUrl}
                buses={[]}
                stops={stops}
                selectedTripId={null}
                onSelect={() => undefined}
                onPick={(point) => {
                  setLatStr(point.lat.toFixed(6));
                  setLngStr(point.lng.toFixed(6));
                  void autoName(point);
                }}
                pickPoint={pickPoint}
                pickLabel={name}
              />
              <p className="text-xs text-muted-foreground">
                Tap the map to place the pin
                {currentStop ? "; the blue dot is the current stop" : ""}.
              </p>
            </div>
          ) : (
            <p className="rounded-lg border border-dashed border-border px-3 py-2 text-xs text-muted-foreground">
              A live map isn&apos;t configured for this school — enter the
              coordinates below.
            </p>
          )}
          <div className="grid grid-cols-2 gap-3">
            <Input
              inputMode="decimal"
              value={latStr}
              placeholder="Latitude"
              onChange={(e) => setLatStr(e.target.value)}
            />
            <Input
              inputMode="decimal"
              value={lngStr}
              placeholder="Longitude"
              onChange={(e) => setLngStr(e.target.value)}
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <Label>When (optional)</Label>
            <Select
              value={direction}
              onValueChange={(v) => setDirection(v as RouteStopDirection | "")}
            >
              <SelectTrigger>
                <SelectValue placeholder="Any" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="AM_PICKUP">Morning pickup</SelectItem>
                <SelectItem value="PM_DROP">Afternoon drop-off</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="rs-time">Preferred time (optional)</Label>
            <Input
              id="rs-time"
              value={time}
              placeholder="06:35"
              onChange={(e) => setTime(e.target.value)}
            />
          </div>
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="rs-notes">Notes (optional)</Label>
          <Textarea
            id="rs-notes"
            value={notes}
            placeholder="Anything the school should know"
            onChange={(e) => setNotes(e.target.value)}
          />
        </div>
      </div>

      <DialogFooter>
        <Button type="button" variant="outline" onClick={onClose} disabled={submitting}>
          Cancel
        </Button>
        <Button type="button" onClick={() => void submit()} disabled={!canSubmit}>
          {submitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
          Send request
        </Button>
      </DialogFooter>
    </>
  );
}
