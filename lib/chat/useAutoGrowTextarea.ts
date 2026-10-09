import { useEffect, useRef } from 'react'
import { CHAT_LIMITS } from './constants'

export function useAutoGrowTextarea(value: string) {
  const ref = useRef<HTMLTextAreaElement>(null)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    el.style.height = 'auto'
    el.style.height = `${Math.min(el.scrollHeight, CHAT_LIMITS.maxComposerHeightPx)}px`
  }, [value])

  return ref
}
