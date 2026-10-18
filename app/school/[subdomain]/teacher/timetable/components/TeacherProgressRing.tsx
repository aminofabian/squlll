"use client";

const RING_SIZE = 84;
const STROKE_WIDTH = 6;
const RADIUS = (RING_SIZE - STROKE_WIDTH) / 2;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;
const MAX_PERCENT = 100;
const CENTER = RING_SIZE / 2;
const GRADIENT_ID = "teacher-progress-ring-gold";

export function TeacherProgressRing({ percent }: { percent: number }) {
  const clamped = Math.min(Math.max(percent, 0), MAX_PERCENT);
  const dashOffset = CIRCUMFERENCE * (1 - clamped / MAX_PERCENT);

  return (
    <div
      className="relative flex shrink-0 items-center justify-center"
      style={{ width: RING_SIZE, height: RING_SIZE }}
      role="img"
      aria-label={`${clamped}% of this week's lessons taught`}
    >
      <svg width={RING_SIZE} height={RING_SIZE} className="-rotate-90">
        <defs>
          <linearGradient id={GRADIENT_ID} x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#f0dfb8" />
            <stop offset="100%" stopColor="#c49a52" />
          </linearGradient>
        </defs>
        <circle cx={CENTER} cy={CENTER} r={RADIUS} fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth={STROKE_WIDTH} />
        <circle
          cx={CENTER}
          cy={CENTER}
          r={RADIUS}
          fill="none"
          stroke={`url(#${GRADIENT_ID})`}
          strokeWidth={STROKE_WIDTH}
          strokeLinecap="round"
          strokeDasharray={CIRCUMFERENCE}
          strokeDashoffset={dashOffset}
          className="transition-[stroke-dashoffset] duration-700 ease-out"
        />
      </svg>
      <span className="absolute font-display text-[22px] leading-none tracking-[-0.03em] text-[#fbf8ef]">
        {clamped}
        <span className="text-[12px] text-white/50">%</span>
      </span>
    </div>
  );
}
