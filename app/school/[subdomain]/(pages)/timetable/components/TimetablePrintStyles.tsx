"use client";

import { useEffect } from "react";

/** Hides chrome when printing the timetable page from the browser. */
export function TimetablePrintStyles() {
  useEffect(() => {
    const id = "timetable-print-styles";
    if (document.getElementById(id)) return;

    const style = document.createElement("style");
    style.id = id;
    style.textContent = `
      @media print {
        body * { visibility: hidden; }
        [data-timetable-print-root],
        [data-timetable-print-root] * { visibility: visible; }
        [data-timetable-print-root] {
          position: absolute;
          left: 0;
          top: 0;
          width: 100%;
        }
        [data-timetable-no-print] { display: none !important; }
      }
    `;
    document.head.appendChild(style);
    return () => {
      style.remove();
    };
  }, []);

  return null;
}
