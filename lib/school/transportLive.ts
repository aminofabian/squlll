import type { LiveBus } from "./transportApi";

/** A `trip:position` socket event (a subset of the live position payload). */
export interface PositionEvent {
  tripId: string;
  lat: number;
  lng: number;
  routeId?: string | null;
  routeName?: string | null;
  vehicleLabel?: string | null;
  updatedAt?: string;
}

/**
 * Fold a realtime position into the bus list: update in place if the trip is
 * already shown, otherwise append it. Missing fields on the event never clobber
 * known route/vehicle labels (the socket payload can be sparser than the query).
 */
export function upsertLiveBus(buses: LiveBus[], event: PositionEvent): LiveBus[] {
  const index = buses.findIndex((bus) => bus.tripId === event.tripId);

  if (index === -1) {
    return [
      ...buses,
      {
        tripId: event.tripId,
        routeId: event.routeId ?? null,
        routeName: event.routeName ?? null,
        vehicleLabel: event.vehicleLabel ?? null,
        lat: event.lat,
        lng: event.lng,
        updatedAt: event.updatedAt ?? new Date().toISOString(),
      },
    ];
  }

  const copy = buses.slice();
  const current = buses[index];
  copy[index] = {
    ...current,
    lat: event.lat,
    lng: event.lng,
    updatedAt: event.updatedAt ?? current.updatedAt,
    routeId: event.routeId ?? current.routeId ?? null,
    routeName: event.routeName ?? current.routeName ?? null,
    vehicleLabel: event.vehicleLabel ?? current.vehicleLabel ?? null,
  };
  return copy;
}
