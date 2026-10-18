import { cn } from '@/lib/utils'

const RING_SIZE = 72
const RING_STROKE = 6
const RING_RADIUS = (RING_SIZE - RING_STROKE) / 2
const RING_CIRCUMFERENCE = 2 * Math.PI * RING_RADIUS
const FULL_PERCENT = 100

export function ProgressRing({
  percent,
  caption,
  className,
}: {
  percent: number
  caption: string
  className?: string
}) {
  const offset = RING_CIRCUMFERENCE * (1 - percent / FULL_PERCENT)

  return (
    <div className={cn('relative shrink-0', className)} style={{ width: RING_SIZE, height: RING_SIZE }}>
      <svg width={RING_SIZE} height={RING_SIZE} className="-rotate-90">
        <circle
          cx={RING_SIZE / 2}
          cy={RING_SIZE / 2}
          r={RING_RADIUS}
          strokeWidth={RING_STROKE}
          className="fill-none stroke-current opacity-20"
        />
        <circle
          cx={RING_SIZE / 2}
          cy={RING_SIZE / 2}
          r={RING_RADIUS}
          strokeWidth={RING_STROKE}
          strokeLinecap="round"
          strokeDasharray={RING_CIRCUMFERENCE}
          strokeDashoffset={offset}
          className="fill-none stroke-current transition-[stroke-dashoffset] duration-700 ease-out"
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center leading-none">
        <span className="text-base font-bold tabular-nums">{percent}%</span>
        <span className="mt-0.5 text-[9px] font-medium uppercase tracking-wider opacity-80">
          {caption}
        </span>
      </div>
    </div>
  )
}
