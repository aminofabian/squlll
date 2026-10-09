"use client";

import { useEffect, useMemo } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { io, type Socket } from "socket.io-client";
import { fetchAccessToken } from "@/lib/realtime/getAccessToken";
import {
  fetchLiveTripPosition,
  type DriverLivePosition,
} from "@/lib/school/driver";

/**
 * Live position + progress for the driver's own trip, while it runs. Mirrors the
 * mobile `useLiveTrip`: a cold `liveTripPosition` snapshot (polled as a safety net
 * if the socket can't connect) is kept fresh by the `/transport` socket — the crew
 * auto-authorises via `join_trip` and receives its own `trip:position` echo, which
 * carries the server-computed next stop, distance and ETA. `trip:status` events
 * refresh the run sheet so a status change made elsewhere (an admin ending or
 * cancelling the trip) lands without a manual refresh.
 */
export function useDriverLiveTrip(
  subdomain: string,
  tripId: string | null,
  enabled: boolean,
): { live: DriverLivePosition | null } {
  const queryClient = useQueryClient();
  const active = enabled && Boolean(tripId);
  const queryKey = useMemo(
    () => ["driverLiveTrip", subdomain, tripId ?? ""] as const,
    [subdomain, tripId],
  );

  const query = useQuery({
    queryKey,
    enabled: active,
    refetchInterval: active ? 15000 : false,
    queryFn: () => fetchLiveTripPosition(subdomain, tripId as string),
  });

  useEffect(() => {
    if (!active || !tripId) return;

    let socket: Socket | null = null;
    let cancelled = false;

    void (async () => {
      const token = await fetchAccessToken();
      if (cancelled || !token) return;

      const wsUrl = process.env.NEXT_PUBLIC_WS_URL || "http://localhost:3001";
      socket = io(`${wsUrl}/transport`, {
        auth: { token },
        transports: ["websocket", "polling"],
        reconnection: true,
        reconnectionAttempts: 5,
        reconnectionDelay: 2000,
      });

      socket.on("connect", () => socket?.emit("join_trip", { tripId }));
      socket.on("trip:position", (payload: DriverLivePosition) => {
        if (payload?.tripId !== tripId) return;
        queryClient.setQueryData(["driverLiveTrip", subdomain, tripId], payload);
      });
      socket.on("trip:status", (payload: { tripId?: string } | null) => {
        if (payload?.tripId && payload.tripId !== tripId) return;
        void queryClient.invalidateQueries({ queryKey: ["driverTrip"] });
        void queryClient.invalidateQueries({ queryKey: ["driverTrips"] });
      });
    })();

    return () => {
      cancelled = true;
      if (socket) {
        socket.emit("leave_trip", { tripId });
        socket.disconnect();
      }
      socket = null;
    };
  }, [active, tripId, subdomain, queryClient]);

  return { live: query.data ?? null };
}
