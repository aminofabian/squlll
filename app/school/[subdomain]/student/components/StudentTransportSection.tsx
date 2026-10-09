'use client'

import { useEffect, useState } from 'react'
import { PortalTransportJourney } from '@/components/transport/PortalTransportJourney'
import { StopRequestsCard } from '@/components/transport/StopRequestsCard'
import {
  fetchMyTransportStopRequests,
  fetchMyTransportToday,
  requestMyTransportStop,
} from '@/lib/school/transportApi'

/**
 * A student's transport for today: the live journey (bus on the map, ETA, timeline)
 * plus a pickup-point panel. Anything a parent proposes for the student appears here
 * automatically, and vice versa.
 */
export function StudentTransportSection() {
  const [currentStop, setCurrentStop] = useState<{
    lat: number
    lng: number
    name: string
  } | null>(null)

  useEffect(() => {
    let active = true
    void (async () => {
      try {
        const today = await fetchMyTransportToday()
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
  }, [])

  return (
    <div className="space-y-6">
      <PortalTransportJourney loadToday={fetchMyTransportToday} />
      <StopRequestsCard
        currentStop={currentStop}
        loadRequests={fetchMyTransportStopRequests}
        submitRequest={requestMyTransportStop}
      />
    </div>
  )
}
