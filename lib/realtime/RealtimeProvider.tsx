'use client'

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import { io, type Socket } from 'socket.io-client'
import { useParams, usePathname } from 'next/navigation'
import { fetchAccessToken } from './getAccessToken'

interface RealtimeContextValue {
  socket: Socket | null
  connected: boolean
  connectionError: string | null
}

const RealtimeContext = createContext<RealtimeContextValue>({
  socket: null,
  connected: false,
  connectionError: null,
})

export function useRealtime() {
  return useContext(RealtimeContext)
}

function isAuthRoute(pathname: string | null): boolean {
  if (!pathname) return true
  return pathname.includes('/login') || pathname.includes('/signup')
}

export function RealtimeProvider({ children }: { children: ReactNode }) {
  const params = useParams()
  const pathname = usePathname()
  const subdomain = typeof params?.subdomain === 'string' ? params.subdomain : undefined

  const [socket, setSocket] = useState<Socket | null>(null)
  const [connected, setConnected] = useState(false)
  const [connectionError, setConnectionError] = useState<string | null>(null)

  useEffect(() => {
    if (!subdomain || isAuthRoute(pathname)) {
      return
    }

    let active = true
    let client: Socket | null = null

    const setup = async () => {
      const token = await fetchAccessToken()
      if (!active || !token) return

      const wsUrl = process.env.NEXT_PUBLIC_WS_URL || 'http://localhost:3001'
      client = io(`${wsUrl}/chat`, {
        auth: { token },
        transports: ['websocket', 'polling'],
        reconnection: true,
        reconnectionAttempts: 10,
        reconnectionDelay: 2000,
      })

      client.on('connect', () => {
        if (!active) return
        setConnected(true)
        setConnectionError(null)
      })

      client.on('disconnect', () => {
        if (!active) return
        setConnected(false)
      })

      client.on('connect_error', (err) => {
        if (!active) return
        setConnectionError(err.message)
        setConnected(false)
      })

      setSocket(client)
    }

    void setup()

    return () => {
      active = false
      client?.disconnect()
      setSocket(null)
      setConnected(false)
    }
  }, [subdomain, pathname])

  const value = useMemo(
    () => ({ socket, connected, connectionError }),
    [socket, connected, connectionError],
  )

  return (
    <RealtimeContext.Provider value={value}>{children}</RealtimeContext.Provider>
  )
}
