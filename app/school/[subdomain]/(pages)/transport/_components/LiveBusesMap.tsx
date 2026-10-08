"use client";

import { useEffect, useRef } from "react";
import type { Map as MapLibreMap, Marker as MapLibreMarker } from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";
import type { LiveBus } from "@/lib/school/transportApi";

/**
 * OSM/MapLibre command map. The module is imported dynamically so it never runs
 * during SSR (it touches `window` on import), and the style URL comes from the
 * super-admin platform settings rather than the bundle.
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
  selectedTripId,
  onSelect,
}: {
  styleUrl: string;
  buses: LiveBus[];
  selectedTripId: string | null;
  onSelect: (tripId: string) => void;
}) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<MapLibreMap | null>(null);
  const markersRef = useRef<Map<string, MapLibreMarker>>(new Map());
  const onSelectRef = useRef(onSelect);

  useEffect(() => {
    onSelectRef.current = onSelect;
  }, [onSelect]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    const markers = markersRef.current;
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
      mapRef.current = map;
    })();

    return () => {
      active = false;
      map?.remove();
      mapRef.current = null;
      markers.forEach((marker) => marker.remove());
      markers.clear();
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
    const marker = selectedTripId ? markersRef.current.get(selectedTripId) : null;
    if (!marker) return;
    const bus = buses.find((item) => item.tripId === selectedTripId);
    if (bus) mapRef.current?.easeTo({ center: [bus.lng, bus.lat], zoom: 14 });
  }, [selectedTripId, buses]);

  return <div ref={containerRef} className="h-[420px] w-full overflow-hidden rounded-2xl" />;
}
