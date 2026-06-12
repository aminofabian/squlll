'use client'

import { useLayoutEffect, useRef, useState, type ReactNode } from 'react'

/** Desktop: toolbar full width; sidebar height locked to table via ResizeObserver */
export function ExamTimetableDesktopLayout({
  toolbar,
  table,
  sidebar,
}: {
  toolbar?: ReactNode
  table: ReactNode
  sidebar?: ReactNode
}) {
  const tableRef = useRef<HTMLDivElement>(null)
  const [tableHeight, setTableHeight] = useState<number | null>(null)

  useLayoutEffect(() => {
    const el = tableRef.current
    if (!el || !sidebar) {
      setTableHeight(null)
      return
    }

    const sync = () => {
      const h = el.getBoundingClientRect().height
      if (h > 0) setTableHeight(Math.round(h))
    }

    sync()
    const ro = new ResizeObserver(sync)
    ro.observe(el)
    window.addEventListener('resize', sync)
    return () => {
      ro.disconnect()
      window.removeEventListener('resize', sync)
    }
  }, [sidebar])

  if (!sidebar) {
    return (
      <div className="space-y-2">
        {toolbar}
        {table}
      </div>
    )
  }

  return (
    <div className="space-y-2">
      {toolbar ? <div className="min-w-0">{toolbar}</div> : null}
      <div className="flex items-start gap-3 xl:gap-4">
        <div ref={tableRef} className="min-w-0 flex-1 self-start">
          {table}
        </div>
        <div
          className="flex w-[17.5rem] shrink-0 flex-col overflow-hidden xl:w-80"
          style={tableHeight != null ? { height: tableHeight } : undefined}
        >
          {sidebar}
        </div>
      </div>
    </div>
  )
}
