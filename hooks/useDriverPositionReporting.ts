"use client";

import { useEffect, useRef, useState } from "react";
import { reportPosition } from "@/lib/school/driver";
import { shouldReport, type LatLng } from "@/lib/school/driverLive";

export type SharingState =
  | "idle"
  | "starting"
  | "sharing"
  | "denied"
  | "unavailable";

/**
 * Foreground position publishing from the browser for an in-progress trip.
 * Mirrors the mobile hook (`driver/usePositionReporting`): throttled by
 * `shouldReport` (heartbeat or meaningful movement) while the trip runs, so the
 * school and guardians can follow the bus on the web portal too.
 */
export function useDriverPositionReporting(
  subdomain: string,
  tripId: string | null,
  enabled: boolean,
): { state: SharingState } {
  // Only ever set from the geo callbacks (an external subscription), never
  // synchronously in the effect body — see the react-hooks guidance.
  const [state, setState] = useState<SharingState>("starting");
  const lastRef = useRef<{ point: LatLng; atMs: number } | null>(null);

  const available =
    typeof navigator !== "undefined" && Boolean(navigator.geolocation);

  useEffect(() => {
    if (!tripId || !enabled || !available) return;

    lastRef.current = null;
    const watchId = navigator.geolocation.watchPosition(
      (position) => {
        const point: LatLng = {
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        };
        const now = Date.now();
        if (
          !shouldReport(
            lastRef.current?.point ?? null,
            point,
            lastRef.current?.atMs ?? 0,
            now,
          )
        ) {
          return;
        }
        lastRef.current = { point, atMs: now };
        setState("sharing");
        void reportPosition(subdomain, {
          tripId,
          lat: point.lat,
          lng: point.lng,
          speed: position.coords.speed ?? undefined,
          heading: position.coords.heading ?? undefined,
          accuracy: position.coords.accuracy ?? undefined,
          recordedAt: new Date(position.timestamp).toISOString(),
        }).catch(() => {
          // A dropped ping isn't worth surfacing — the next fix retries.
        });
      },
      () => setState("denied"),
      { enableHighAccuracy: true, maximumAge: 5000, timeout: 20000 },
    );

    return () => {
      navigator.geolocation.clearWatch(watchId);
    };
  }, [subdomain, tripId, enabled, available]);

  const effective: SharingState = !enabled || !tripId
    ? "idle"
    : !available
      ? "unavailable"
      : state;

  return { state: effective };
}
