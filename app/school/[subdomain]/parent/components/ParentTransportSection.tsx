'use client'

import { useCallback, useEffect, useState } from 'react'
import { cn } from '@/lib/utils'
import { PortalTransportJourney } from '@/components/transport/PortalTransportJourney'
import { StopRequestsCard } from '@/components/transport/StopRequestsCard'
import {
  fetchChildTransportStopRequests,
  fetchChildTransportToday,
  requestChildTransportStop,
  type RequestMyTransportStopInput,
} from '@/lib/school/transportApi'
import type { ParentPortalChild } from '@/lib/parent/types'
import { portalChildPill, portalEmptyState, portalSectionLabel } from './parent-portal-ui'

interface ParentTransportSectionProps {
  linkedChildren?: ParentPortalChild[]
  selectedChild?: number
  onSelectChild?: (index: number) => void
}

/**
 * Parent view of a child's school transport: the same "Safe Journey" journey the
 * student sees, scoped to one linked child (`childTransportToday`). A pill row lets
 * a parent switch between children without going back to the dashboard, and a
 * pickup-point panel lets them propose a new stop (which the student portal also
 * sees).
 */
export function ParentTransportSection({
  linkedChildren = [],
  selectedChild = 0,
  onSelectChild,
}: ParentTransportSectionProps) {
  const child = linkedChildren[selectedChild]
  const studentId = child?.studentId ?? null

  const [currentStop, setCurrentStop] = useState<{
    lat: number
    lng: number
    name: string
  } | null>(null)

  const loadToday = useCallback(() => {
    if (!studentId) {
      return Promise.reject(new Error('No child selected'))
    }
    return fetchChildTransportToday(studentId)
  }, [studentId])

  const loadRequests = useCallback(() => {
    if (!studentId) return Promise.resolve([])
    return fetchChildTransportStopRequests(studentId)
  }, [studentId])

  const submitRequest = useCallback(
    (input: RequestMyTransportStopInput) => {
      if (!studentId) {
        return Promise.reject(new Error('No child selected'))
      }
      return requestChildTransportStop({ ...input, studentId })
    },
    [studentId],
  )

  // Context for the picker: the child's current stop (best-effort).
  useEffect(() => {
    if (!studentId) return
    let active = true
    void (async () => {
      try {
        const today = await fetchChildTransportToday(studentId)
        if (active && today.routeStop) {
          setCurrentStop({
            lat: today.routeStop.lat,
            lng: today.routeStop.lng,
            name: today.routeStop.name,
          })
        }
      } catch {
        /* context only */
      }
    })()
    return () => {
      active = false
    }
  }, [studentId])

  if (!child) {
    return <p className={portalEmptyState}>Link a child to view their transport.</p>
  }

  return (
    <div className="space-y-4">
      {linkedChildren.length > 1 ? (
        <div>
          <p className={cn(portalSectionLabel, 'mb-2')}>Child</p>
          <div className="flex flex-wrap gap-2">
            {linkedChildren.map((item, index) => (
              <button
                key={item.studentId}
                type="button"
                onClick={() => onSelectChild?.(index)}
                className={portalChildPill(index === selectedChild)}
                aria-current={index === selectedChild ? 'true' : undefined}
              >
                <span className="truncate">{item.name}</span>
              </button>
            ))}
          </div>
        </div>
      ) : null}

      {/* Remount per child so no stale journey lingers while the next one loads. */}
      <PortalTransportJourney
        key={child.studentId}
        loadToday={loadToday}
        title={child.name}
      />

      <StopRequestsCard
        key={`requests-${child.studentId}`}
        studentName={child.name}
        currentStop={currentStop}
        loadRequests={loadRequests}
        submitRequest={submitRequest}
      />
    </div>
  )
}
