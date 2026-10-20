import { cn } from "@/lib/utils"

type SqulMarkProps = {
  className?: string
  /** Switch the hairline + letterform for dark backgrounds. */
  tone?: "dark" | "light"
  size?: number
}

/**
 * SQUL monogram — a hairline stamp with a serif "S" and a single brass pin.
 * Deliberately typographic: no clip-art graduation caps, no gradients.
 */
export function SqulMark({ className, tone = "dark", size = 32 }: SqulMarkProps) {
  const isLight = tone === "light"
  return (
    <span
      className={cn(
        "relative inline-flex shrink-0 items-center justify-center",
        isLight ? "border-white/25" : "border-[#14201b]/25",
        className,
      )}
      style={{ width: size, height: size, borderWidth: 1 }}
      aria-hidden
    >
      <span
        className={cn(
          "font-display leading-none",
          isLight ? "text-[#f7f4ec]" : "text-[#14201b]",
        )}
        style={{
          fontFamily: "var(--font-instrument-serif), Georgia, serif",
          fontSize: size * 0.66,
          marginTop: -size * 0.04,
        }}
      >
        S
      </span>
      <span
        className="absolute h-[3px] w-[3px] translate-x-[45%] translate-y-[45%] rounded-full bg-[#a98a55]"
        style={{ right: 0, bottom: 0 }}
      />
    </span>
  )
}

type SqulWordmarkProps = {
  className?: string
  tone?: "dark" | "light"
  showMark?: boolean
  markSize?: number
}

/** Lockup: hairline monogram + tracked wordmark. */
export function SqulWordmark({
  className,
  tone = "dark",
  showMark = true,
  markSize = 30,
}: SqulWordmarkProps) {
  return (
    <span className={cn("inline-flex items-center gap-3", className)}>
      {showMark ? <SqulMark tone={tone} size={markSize} /> : null}
      <span
        className={cn(
          "text-[0.8125rem] font-medium uppercase leading-none tracking-[0.34em]",
          tone === "light" ? "text-[#f7f4ec]" : "text-[#14201b]",
        )}
      >
        Squl
      </span>
    </span>
  )
}
