"use client";

import { useEffect, useRef } from "react";
import type {
  Map as MapLibreMap,
  Marker as MapLibreMarker,
  MapMouseEvent,
} from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";
import type { LiveBus } from "@/lib/school/transportApi";

/** An optional non-bus marker (e.g. the viewer's own pickup point). */
export interface MapStop {
  id: string;
  lat: number;
  lng: number;
  name: string;
}

export interface LatLng {
  lat: number;
  lng: number;
}

/**
 * OSM/MapLibre command map. The module is imported dynamically so it never runs
 * during SSR (it touches `window` on import), and the style URL comes from the
 * super-admin platform settings rather than the bundle.
 *
 * Pass `onPick` to turn it into a location picker: clicking the map reports the
 * tapped coordinate, and `pickPoint` renders the current selection.
 */
async function loadMapLibre() {
  const mod = (await import("maplibre-gl")) as unknown as {
    default?: typeof import("maplibre-gl");
  } & typeof import("maplibre-gl");
  return mod.default ?? mod;
}

export function LiveBusesMap({
  styleUrl,
  buses,
  stops,
  selectedTripId,
  onSelect,
  onPick,
  pickPoint,
  pickLabel,
}: {
  styleUrl: string;
  buses: LiveBus[];
  /** Extra points to mark alongside the buses (pickup points, the viewer's stop). */
  stops?: MapStop[];
  selectedTripId: string | null;
  onSelect: (tripId: string) => void;
  /** When set, the map becomes a picker: a tap reports the coordinate. */
  onPick?: (point: LatLng) => void;
  /** The current picked location, rendered as a distinct marker. */
  pickPoint?: LatLng | null;
  /** Label shown above the picked location (e.g. the stop name). */
  pickLabel?: string | null;
}) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<MapLibreMap | null>(null);
  const markersRef = useRef<Map<string, MapLibreMarker>>(new Map());
  const stopMarkersRef = useRef<Map<string, MapLibreMarker>>(new Map());
  const pickMarkerRef = useRef<MapLibreMarker | null>(null);
  const pickLabelMarkerRef = useRef<MapLibreMarker | null>(null);
  const pickLabelElRef = useRef<HTMLDivElement | null>(null);
  const onSelectRef = useRef(onSelect);
  const onPickRef = useRef(onPick);

  // Recenter/zoom only when the coordinate actually changes (not on every render).
  const pickKey = pickPoint ? `${pickPoint.lat},${pickPoint.lng}` : "";

  useEffect(() => {
    onSelectRef.current = onSelect;
  }, [onSelect]);

  useEffect(() => {
    onPickRef.current = onPick;
  }, [onPick]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    const markers = markersRef.current;
    const stopMarkers = stopMarkersRef.current;
    let active = true;
    let map: MapLibreMap | null = null;

    void (async () => {
      const maplibregl = await loadMapLibre();
      if (!active) return;
      map = new maplibregl.Map({
        container,
        style: styleUrl,
        center: [36.8219, -1.2921],
        zoom: 11,
      });
      map.addControl(new maplibregl.NavigationControl(), "top-right");
      map.on("click", (event: MapMouseEvent) => {
        onPickRef.current?.({
          lat: event.lngLat.lat,
          lng: event.lngLat.lng,
        });
      });
      mapRef.current = map;
    })();

    return () => {
      active = false;
      map?.remove();
      mapRef.current = null;
      pickMarkerRef.current = null;
      pickLabelMarkerRef.current = null;
      pickLabelElRef.current = null;
      markers.forEach((marker) => marker.remove());
      markers.clear();
      stopMarkers.forEach((marker) => marker.remove());
      stopMarkers.clear();
    };
  }, [styleUrl]);

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      const maplibregl = await loadMapLibre();
      const map = mapRef.current;
      if (cancelled || !map) return;

      const seen = new Set<string>();
      for (const bus of buses) {
        seen.add(bus.tripId);
        const existing = markersRef.current.get(bus.tripId);
        if (existing) {
          existing.setLngLat([bus.lng, bus.lat]);
          continue;
        }

        const element = document.createElement("button");
        element.type = "button";
        element.title = bus.routeName ?? "Bus";
        element.style.cssText = [
          "width:26px",
          "height:26px",
          "border-radius:9999px",
          "border:2px solid #fff",
          "background:#124E3C",
          "box-shadow:0 1px 6px rgba(0,0,0,.35)",
          "cursor:pointer",
          "font-size:13px",
          "line-height:1",
        ].join(";");
        element.textContent = "🚌";
        element.onclick = () => onSelectRef.current(bus.tripId);

        const marker = new maplibregl.Marker({ element })
          .setLngLat([bus.lng, bus.lat])
          .addTo(map);
        markersRef.current.set(bus.tripId, marker);
      }

      for (const [tripId, marker] of markersRef.current) {
        if (!seen.has(tripId)) {
          marker.remove();
          markersRef.current.delete(tripId);
        }
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [buses]);

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      const maplibregl = await loadMapLibre();
      const map = mapRef.current;
      if (cancelled || !map) return;

      const seen = new Set<string>();
      for (const stop of stops ?? []) {
        seen.add(stop.id);
        const existing = stopMarkersRef.current.get(stop.id);
        if (existing) {
          existing.setLngLat([stop.lng, stop.lat]);
          continue;
        }

        const element = document.createElement("div");
        element.title = stop.name;
        element.style.cssText = [
          "width:18px",
          "height:18px",
          "border-radius:9999px",
          "border:3px solid #fff",
          "background:#0ea5e9",
          "box-shadow:0 1px 6px rgba(0,0,0,.35)",
        ].join(";");

        const marker = new maplibregl.Marker({ element })
          .setLngLat([stop.lng, stop.lat])
          .addTo(map);
        stopMarkersRef.current.set(stop.id, marker);
      }

      for (const [stopId, marker] of stopMarkersRef.current) {
        if (!seen.has(stopId)) {
          marker.remove();
          stopMarkersRef.current.delete(stopId);
        }
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [stops]);

  // The picked location: a dot on the exact point with its name above it.
  useEffect(() => {
    let cancelled = false;
    void (async () => {
      const maplibregl = await loadMapLibre();
      const map = mapRef.current;
      if (cancelled || !map) return;

      if (!pickPoint) {
        pickMarkerRef.current?.remove();
        pickMarkerRef.current = null;
        pickLabelMarkerRef.current?.remove();
        pickLabelMarkerRef.current = null;
        pickLabelElRef.current = null;
        return;
      }

      // Dot exactly on the point.
      if (pickMarkerRef.current) {
        pickMarkerRef.current.setLngLat([pickPoint.lng, pickPoint.lat]);
      } else {
        const dot = document.createElement("div");
        dot.style.cssText = [
          "width:18px",
          "height:18px",
          "border-radius:9999px",
          "border:3px solid #fff",
          "background:#dc2626",
          "box-shadow:0 0 0 4px rgba(220,38,38,.25),0 1px 6px rgba(0,0,0,.35)",
        ].join(";");
        pickMarkerRef.current = new maplibregl.Marker({ element: dot })
          .setLngLat([pickPoint.lng, pickPoint.lat])
          .addTo(map);
      }

      // Name bubble above the dot.
      const labelText = (pickLabel ?? "").trim() || "Selected location";
      if (pickLabelMarkerRef.current) {
        if (pickLabelElRef.current) pickLabelElRef.current.textContent = labelText;
        pickLabelMarkerRef.current.setLngLat([pickPoint.lng, pickPoint.lat]);
      } else {
        const bubble = document.createElement("div");
        bubble.textContent = labelText;
        bubble.style.cssText = [
          "padding:2px 8px",
          "border-radius:9999px",
          "background:#dc2626",
          "color:#fff",
          "font-size:11px",
          "font-weight:600",
          "white-space:nowrap",
          "box-shadow:0 1px 4px rgba(0,0,0,.3)",
        ].join(";");
        pickLabelElRef.current = bubble;
        pickLabelMarkerRef.current = new maplibregl.Marker({
          element: bubble,
          anchor: "bottom",
          offset: [0, -16],
        })
          .setLngLat([pickPoint.lng, pickPoint.lat])
          .addTo(map);
      }
    })();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pickKey, pickLabel]);

  // Zoom in and centre the map on the picked location (e.g. "use my location").
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !pickPoint) return;
    map.easeTo({
      center: [pickPoint.lng, pickPoint.lat],
      zoom: 15,
      duration: 700,
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pickKey]);

  // Crosshair cursor while the map is acting as a picker.
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;
    map.getCanvas().style.cursor = onPick ? "crosshair" : "";
  }, [onPick]);

  useEffect(() => {
    const marker = selectedTripId ? markersRef.current.get(selectedTripId) : null;
    if (!marker) return;
    const bus = buses.find((item) => item.tripId === selectedTripId);
    if (bus) mapRef.current?.easeTo({ center: [bus.lng, bus.lat], zoom: 14 });
  }, [selectedTripId, buses]);

  return <div ref={containerRef} className="h-[420px] w-full overflow-hidden rounded-2xl" />;
}
