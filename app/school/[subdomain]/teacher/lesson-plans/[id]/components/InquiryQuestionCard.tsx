import { HelpCircle } from 'lucide-react'

export function InquiryQuestionCard({ value, onChange }: { value: string; onChange: (value: string) => void }) {
  return (
    <label className="relative block overflow-hidden rounded-2xl bg-gradient-to-br from-violet-50 to-fuchsia-50 p-4 ring-1 ring-inset ring-violet-200/70 dark:from-violet-500/10 dark:to-fuchsia-500/10 dark:ring-violet-500/20">
      <span aria-hidden className="pointer-events-none absolute -right-1 -top-6 select-none font-serif text-[7rem] leading-none text-violet-200/80 dark:text-violet-500/20">
        ?
      </span>
      <span className="relative flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-[0.14em] text-violet-700 dark:text-violet-300">
        <HelpCircle className="size-3.5" /> Key inquiry question
        <span className="font-normal normal-case tracking-normal opacity-70">· optional</span>
      </span>
      <input
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder="What question will spark curiosity today?"
        className="relative mt-2 w-full bg-transparent font-serif text-lg italic text-violet-950 outline-none placeholder:text-violet-400/80 dark:text-violet-50"
      />
    </label>
  )
}
