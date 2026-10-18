import { useEffect, useState } from 'react'

const VIEWPORT_FOCUS_BAND = '-30% 0px -60% 0px'

export function useActiveSection(sectionIds: readonly string[]) {
  const [activeId, setActiveId] = useState(sectionIds[0] ?? '')
  const idsKey = sectionIds.join('|')

  useEffect(() => {
    const elements = idsKey
      .split('|')
      .map((id) => document.getElementById(id))
      .filter((element): element is HTMLElement => element !== null)
    if (elements.length === 0) return

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries.find((entry) => entry.isIntersecting)
        if (visible) setActiveId(visible.target.id)
      },
      { rootMargin: VIEWPORT_FOCUS_BAND },
    )
    elements.forEach((element) => observer.observe(element))
    return () => observer.disconnect()
  }, [idsKey])

  const scrollToSection = (id: string) => {
    setActiveId(id)
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  return { activeId, scrollToSection }
}
