import { useCallback, useEffect, useRef, useState } from 'react'
import { CHAT_LIMITS } from './constants'

function distanceFromBottom(el: HTMLElement): number {
  return el.scrollHeight - el.scrollTop - el.clientHeight
}

/**
 * Keeps a scroll container pinned to its newest item while the reader is at
 * the bottom, and surfaces a "jump to latest" affordance otherwise.
 */
export function useStickToBottom(latestKey: string | null, forceFollow: boolean) {
  const scrollRef = useRef<HTMLDivElement>(null)
  const atBottomRef = useRef(true)
  const previousKeyRef = useRef<string | null>(null)
  const [isAtBottom, setIsAtBottom] = useState(true)
  const [hasUnseen, setHasUnseen] = useState(false)

  const jumpToLatest = useCallback((behavior: ScrollBehavior = 'smooth') => {
    const el = scrollRef.current
    if (!el) return
    el.scrollTo({ top: el.scrollHeight, behavior })
    atBottomRef.current = true
    setIsAtBottom(true)
    setHasUnseen(false)
  }, [])

  const handleScroll = useCallback(() => {
    const el = scrollRef.current
    if (!el) return
    const atBottom = distanceFromBottom(el) <= CHAT_LIMITS.stickToBottomThresholdPx
    atBottomRef.current = atBottom
    setIsAtBottom(atBottom)
    if (atBottom) setHasUnseen(false)
  }, [])

  useEffect(() => {
    if (latestKey === null) {
      previousKeyRef.current = null
      return
    }
    if (latestKey === previousKeyRef.current) return
    const isInitial = previousKeyRef.current === null
    previousKeyRef.current = latestKey
    if (isInitial || forceFollow || atBottomRef.current) {
      jumpToLatest(isInitial ? 'auto' : 'smooth')
      return
    }
    setHasUnseen(true)
  }, [latestKey, forceFollow, jumpToLatest])

  return {
    scrollRef,
    handleScroll,
    jumpToLatest,
    showJumpButton: !isAtBottom,
    hasUnseen,
  }
}
