"use client";

import { useEffect, useState } from "react";
import { getSecondsUntil } from "@/lib/timetable";

const TICK_INTERVAL_MS = 1000;

/** Live seconds remaining until `startsAt`, ticking every second. */
export function useSecondsUntil(startsAt: string): number {
  const [seconds, setSeconds] = useState(() => getSecondsUntil(startsAt));

  useEffect(() => {
    const tick = () => setSeconds(getSecondsUntil(startsAt));
    tick();
    const id = setInterval(tick, TICK_INTERVAL_MS);
    return () => clearInterval(id);
  }, [startsAt]);

  return seconds;
}
