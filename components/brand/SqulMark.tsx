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

/**
 * Wordmark lockup: serif SQUL closed with a brass full stop,
 * set over a hairline and the category line.
 */
export function SqulWordmark({
  className,
  tone = "dark",
  showMark = false,
  markSize = 30,
}: SqulWordmarkProps) {
  const light = tone === "light"
  return (
    <span className={cn("inline-flex flex-col items-start", className)}>
      <span className="flex items-baseline gap-3">
        {showMark ? <SqulMark tone={tone} size={markSize} /> : null}
        <span
          className={cn(
            "font-display uppercase leading-[0.78] tracking-[0.1em]",
            light ? "text-[#f7f4ec]" : "text-[#14201b]",
          )}
          style={{
            fontFamily: "var(--font-instrument-serif), Georgia, serif",
            fontSize: "1.5rem",
          }}
        >
          SQUL
          <span className={light ? "text-[#d8c9ab]" : "text-[#a98a55]"}>.</span>
        </span>
      </span>
      <span className="mt-2 flex items-center gap-2">
        <span
          className={cn("h-px w-3", light ? "bg-[#d8c9ab]/70" : "bg-[#a98a55]/70")}
          aria-hidden
        />
        <span
          className={cn(
            "font-mono text-[0.45rem] uppercase tracking-[0.24em]",
            light ? "text-white/40" : "text-[#4d574f]/70",
          )}
        >
          School systems
        </span>
      </span>
    </span>
  )
}
