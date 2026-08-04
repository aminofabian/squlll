"use client";

import { useEffect } from "react";

/**
 * Sharp architecture for the timetable: zero border-radius on the page
 * surface and on portals while this page is mounted (sheets, menus,
 * dialogs, selects, toasts from this flow).
 */
export function TimetableSurfaceStyles() {
  useEffect(() => {
    const id = "timetable-surface-styles";
    if (document.getElementById(id)) return;

    const style = document.createElement("style");
    style.id = id;
    style.textContent = `
      [data-timetable-root],
      [data-timetable-root] *:not(svg):not(path):not(circle):not(line):not(polyline):not(polygon):not(rect):not(ellipse),
      [data-timetable-portal],
      [data-timetable-portal] *:not(svg):not(path):not(circle):not(line):not(polyline):not(polygon):not(rect):not(ellipse),
      [data-slot="sheet-content"],
      [data-slot="sheet-content"] *:not(svg):not(path):not(circle):not(line):not(polyline):not(polygon):not(rect):not(ellipse),
      [data-slot="dialog-content"],
      [data-slot="dialog-content"] *:not(svg):not(path):not(circle):not(line):not(polyline):not(polygon):not(rect):not(ellipse),
      [data-slot="popover-content"],
      [data-slot="popover-content"] *:not(svg):not(path):not(circle):not(line):not(polyline):not(polygon):not(rect):not(ellipse),
      [data-slot="select-content"],
      [data-slot="select-content"] *:not(svg):not(path):not(circle):not(line):not(polyline):not(polygon):not(rect):not(ellipse),
      [data-slot="dropdown-menu-content"],
      [data-slot="dropdown-menu-content"] *:not(svg):not(path):not(circle):not(line):not(polyline):not(polygon):not(rect):not(ellipse),
      [data-radix-popper-content-wrapper],
      [data-radix-popper-content-wrapper] *:not(svg):not(path):not(circle):not(line):not(polyline):not(polygon):not(rect):not(ellipse) {
        border-radius: 0 !important;
      }
    `;
    document.head.appendChild(style);
    return () => {
      style.remove();
    };
  }, []);

  return null;
}
