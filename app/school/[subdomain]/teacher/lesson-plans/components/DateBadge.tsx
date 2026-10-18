const WEEKDAY_ABBREVIATION_LENGTH = 3

export function DateBadge({ date }: { date: string }) {
  const value = new Date(`${date}T12:00:00Z`)
  const format = (options: Intl.DateTimeFormatOptions) =>
    value.toLocaleDateString(undefined, { ...options, timeZone: 'UTC' })

  return (
    <div className="flex items-center gap-2 sm:w-16 sm:flex-col sm:items-stretch sm:gap-0">
      <div className="w-12 overflow-hidden rounded-xl bg-card text-center shadow-sm ring-1 ring-border sm:w-full">
        <div className="bg-primary py-0.5 text-[9px] font-bold uppercase tracking-[0.18em] text-primary-foreground">
          {format({ month: 'short' })}
        </div>
        <div className="py-1 text-lg font-bold leading-none tabular-nums">{value.getUTCDate()}</div>
      </div>
      <p className="text-xs font-medium text-muted-foreground sm:mt-1 sm:text-center sm:text-[10px] sm:uppercase sm:tracking-wider">
        {format({ weekday: 'long' }).slice(0, WEEKDAY_ABBREVIATION_LENGTH)}
      </p>
    </div>
  )
}
