'use client'

import { useCallback, useEffect, useState } from 'react'
import { useDomainRealtime } from './useDomainRealtime'
import type {
  PresenceUpdatedPayload,
  TenantLiveStatsSnapshot,
} from './liveStatsTypes'

const TENANT_LIVE_STATS_QUERY = `
  query TenantLiveStats {
    tenantLiveStats {
      onlineTeachers
      onlineStudents
      onlineAdmins
      onlineParents
      onlineStaff
      onlineTotal
      lessonsCompletedToday
    }
  }
`

const EMPTY_STATS: TenantLiveStatsSnapshot = {
  onlineTeachers: 0,
  onlineStudents: 0,
  onlineAdmins: 0,
  onlineParents: 0,
  onlineStaff: 0,
  onlineTotal: 0,
  lessonsCompletedToday: 0,
}

function fromPresence(payload: PresenceUpdatedPayload): TenantLiveStatsSnapshot {
  return {
    onlineTeachers: payload.onlineByRole?.teacher ?? 0,
    onlineStudents: payload.onlineByRole?.student ?? 0,
    onlineAdmins: payload.onlineByRole?.admin ?? 0,
    onlineParents: payload.onlineByRole?.parent ?? 0,
    onlineStaff: payload.onlineByRole?.staff ?? 0,
    onlineTotal: payload.onlineTotal ?? 0,
    lessonsCompletedToday: 0,
  }
}

export function useTenantLiveStats() {
  const [stats, setStats] = useState<TenantLiveStatsSnapshot>(EMPTY_STATS)
  const [loading, setLoading] = useState(true)

  const refetch = useCallback(async () => {
    try {
      const response = await fetch('/api/graphql', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: TENANT_LIVE_STATS_QUERY }),
      })

      if (!response.ok) return

      const json = await response.json()
      const data = json.data?.tenantLiveStats as TenantLiveStatsSnapshot | undefined
      if (data) {
        setStats(data)
      }
    } catch {
      // Non-fatal — WS updates will still apply
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    void refetch()
  }, [refetch])

  useDomainRealtime({
    onPresenceUpdated: (payload) => {
      setStats((prev) => ({
        ...fromPresence(payload),
        lessonsCompletedToday: prev.lessonsCompletedToday,
      }))
    },
    onStatsTenantUpdated: (payload) => {
      setStats({
        onlineTeachers: payload.onlineTeachers ?? 0,
        onlineStudents: payload.onlineStudents ?? 0,
        onlineAdmins: payload.onlineAdmins ?? 0,
        onlineParents: payload.onlineParents ?? 0,
        onlineStaff: payload.onlineStaff ?? 0,
        onlineTotal: payload.onlineTotal ?? 0,
        lessonsCompletedToday: payload.lessonsCompletedToday ?? 0,
      })
    },
  })

  return { stats, loading, refetch }
}
