'use client'

import { useEffect, useMemo, useState } from 'react'

export function useTestTimer(
  durationMinutes: number,
  startedAt?: string | null,
) {
  const [now, setNow] = useState(() => Date.now())

  useEffect(() => {
    if (!startedAt || durationMinutes <= 0) return
    const id = window.setInterval(() => setNow(Date.now()), 1000)
    return () => window.clearInterval(id)
  }, [startedAt, durationMinutes])

  return useMemo(() => {
    if (!startedAt || durationMinutes <= 0) {
      return {
        remainingMs: null as number | null,
        remainingLabel: null as string | null,
        isExpired: false,
        hasTimer: false,
      }
    }

    const endMs =
      new Date(startedAt).getTime() + durationMinutes * 60 * 1000
    const remainingMs = Math.max(0, endMs - now)
    const totalSeconds = Math.ceil(remainingMs / 1000)
    const minutes = Math.floor(totalSeconds / 60)
    const seconds = totalSeconds % 60
    const remainingLabel = `${minutes}:${seconds.toString().padStart(2, '0')}`

    return {
      remainingMs,
      remainingLabel,
      isExpired: remainingMs <= 0,
      hasTimer: true,
    }
  }, [durationMinutes, startedAt, now])
}
