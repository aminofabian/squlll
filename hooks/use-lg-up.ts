import * as React from 'react'

const LG_BREAKPOINT = 1024

/** True at lg (1024px) and above. Null until mounted (prefer mobile layout while unknown). */
export function useIsLgUp(): boolean | null {
  const [isLgUp, setIsLgUp] = React.useState<boolean | null>(null)

  React.useEffect(() => {
    const mq = window.matchMedia(`(min-width: ${LG_BREAKPOINT}px)`)
    const update = () => setIsLgUp(mq.matches)
    update()
    mq.addEventListener('change', update)
    return () => mq.removeEventListener('change', update)
  }, [])

  return isLgUp
}
