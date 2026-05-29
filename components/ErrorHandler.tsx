'use client'

import { useEffect } from 'react'
import { useGraphQLErrorHandler } from '@/lib/hooks/useGraphQLErrorHandler'

const CHUNK_RELOAD_KEY = 'squl_chunk_reload'

function isChunkLoadError(error: unknown): boolean {
  if (!error) return false
  const message =
    error instanceof Error
      ? `${error.name} ${error.message}`
      : String(error)
  return (
    message.includes('ChunkLoadError') ||
    message.includes('Loading chunk') ||
    message.includes('Failed to load chunk') ||
    message.includes('Failed to fetch dynamically imported module')
  )
}

function maybeReloadForChunkError(error: unknown): void {
  if (typeof window === 'undefined' || !isChunkLoadError(error)) return

  const alreadyReloaded = sessionStorage.getItem(CHUNK_RELOAD_KEY)
  if (alreadyReloaded) return

  sessionStorage.setItem(CHUNK_RELOAD_KEY, '1')
  window.location.reload()
}

export function ErrorHandler() {
  useGraphQLErrorHandler()

  useEffect(() => {
    const onError = (event: ErrorEvent) => {
      maybeReloadForChunkError(event.error ?? event.message)
    }
    const onRejection = (event: PromiseRejectionEvent) => {
      maybeReloadForChunkError(event.reason)
    }

    window.addEventListener('error', onError)
    window.addEventListener('unhandledrejection', onRejection)

    const resetTimer = window.setTimeout(() => {
      sessionStorage.removeItem(CHUNK_RELOAD_KEY)
    }, 10_000)

    return () => {
      window.removeEventListener('error', onError)
      window.removeEventListener('unhandledrejection', onRejection)
      window.clearTimeout(resetTimer)
    }
  }, [])

  return null
}
