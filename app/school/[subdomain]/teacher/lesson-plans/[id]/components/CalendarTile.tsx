import { getCalendarParts } from '../utils/getCalendarParts'

export function CalendarTile({ lessonDate }: { lessonDate: string }) {
  const { day, month, weekday } = getCalendarParts(lessonDate)

  return (
    <div className="relative w-[4.5rem] shrink-0 rotate-[-3deg] overflow-hidden rounded-2xl bg-white text-center text-slate-900 shadow-xl shadow-black/20 ring-1 ring-black/5 transition-transform hover:rotate-0 print:rotate-0 print:shadow-none">
      <div className="bg-amber-400 py-1 text-[10px] font-bold uppercase tracking-[0.2em] text-amber-950">
        {month}
      </div>
      <div className="absolute inset-x-0 top-[1.4rem] flex justify-around px-3">
        <span className="size-1.5 rounded-full bg-slate-300" />
        <span className="size-1.5 rounded-full bg-slate-300" />
      </div>
      <div className="pb-1 pt-1.5 text-3xl font-black leading-none tabular-nums">{day}</div>
      <div className="pb-2 text-[10px] font-semibold text-slate-500">{weekday.slice(0, 3)}</div>
    </div>
  )
}
