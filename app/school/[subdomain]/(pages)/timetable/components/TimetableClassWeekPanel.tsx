"use client";

import { CheckCircle2, Sparkles, X } from "lucide-react";
import { cn } from "@/lib/utils";
import type { ClassSubjectProgress, ClassWeekPlan } from "../utils/classWeekPlan";
import type { ClassHeadsUp } from "../utils/getClassHeadsUps";
import type { NextLessonSuggestion } from "../utils/suggestNextLesson";
import type { SubjectAccentStyle } from "../utils/timetableSubjectColors";
import { tt } from "../utils/timetableTheme";

type TimetableClassWeekPanelProps = {
  plan: ClassWeekPlan;
  suggestion: NextLessonSuggestion | null;
  headsUps: ClassHeadsUp[];
  dayLabels: string[];
  accentFor: (subjectId: string, subjectName: string) => SubjectAccentStyle;
  highlightSubjectId: string | null;
  onHighlightSubject: (subjectId: string | null) => void;
  onPlaceSuggestion: () => void;
  onBuild: () => void;
  onShare: () => void;
  onClose: () => void;
};

const CARD = "rounded-xl border border-[#1a4d42]/10 bg-white p-4 shadow-[0_1px_3px_rgba(15,23,42,0.05)] dark:border-white/10 dark:bg-[#0c1a17]";
const EYEBROW = "text-[11px] font-semibold uppercase tracking-[0.12em]";
const FULL_PERCENT = 100;

export function TimetableClassWeekPanel(props: TimetableClassWeekPanelProps) {
  return (
    <aside
      data-timetable-no-print
      aria-label="This week at a glance"
      className="hidden w-[20rem] shrink-0 flex-col gap-3 overflow-y-auto border-l border-[#1a4d42]/10 bg-[#f3f7f5] p-3 lg:flex dark:border-white/10 dark:bg-[#071411]"
    >
      <div className="flex justify-end">
        <button
          type="button"
          onClick={props.onClose}
          className={cn(tt.focus, tt.text.caption, "inline-flex items-center gap-1 text-slate-600 hover:text-slate-900 dark:text-slate-300")}
        >
          <X className="h-3.5 w-3.5" />
          Hide summary
        </button>
      </div>
      <NextStepCard {...props} />
      <LessonsThisWeekCard {...props} />
      {props.headsUps.length > 0 ? <HeadsUpCard headsUps={props.headsUps} /> : null}
    </aside>
  );
}

function shortTime(time: string) {
  return time.replace(/^0(\d)/, "$1");
}

function lessonsWord(count: number) {
  return count === 1 ? "one more lesson" : `${count} more lessons`;
}

function NextStepCard({ plan, suggestion, dayLabels, onPlaceSuggestion, onBuild, onShare }: TimetableClassWeekPanelProps) {
  if (suggestion?.slot) {
    const when = `${dayLabels[suggestion.slot.dayOfWeek - 1] ?? ""} ${shortTime(suggestion.slot.startTime)}`;
    const slotPhrase = plan.slotsFree === 1 ? "is the last open slot" : "is free";
    return (
      <section id="timetable-next-step" className={cn(CARD, "border-amber-200 bg-amber-50 dark:border-amber-900/50 dark:bg-amber-950/30")}>
        <p className={cn(EYEBROW, "text-amber-800 dark:text-amber-300")}>Next step</p>
        <p className="mt-1.5 text-[15px] font-semibold leading-snug text-slate-900 dark:text-white">
          {when} {slotPhrase}, and {suggestion.subject.subjectName} needs {lessonsWord(suggestion.remaining)}.
        </p>
        {suggestion.subject.teacherName ? (
          <p className={cn(tt.text.caption, "mt-1.5 text-slate-700 dark:text-slate-300")}>
            {suggestion.subject.teacherName} has no other class at that time, so nothing clashes.
          </p>
        ) : null}
        <PrimaryButton onClick={onPlaceSuggestion}>Place {suggestion.subject.subjectName} on {when}</PrimaryButton>
      </section>
    );
  }
  if (suggestion) {
    return (
      <section id="timetable-next-step" className={CARD}>
        <p className={cn(EYEBROW, "text-amber-800 dark:text-amber-300")}>Next step</p>
        <p className="mt-1.5 text-[15px] font-semibold leading-snug text-slate-900 dark:text-white">
          {suggestion.subject.subjectName} needs {lessonsWord(suggestion.remaining)}, but {suggestion.subject.teacherName || "its teacher"} is busy in every free slot.
        </p>
        <PrimaryButton onClick={onBuild}>Let SQUL rearrange the week</PrimaryButton>
      </section>
    );
  }
  return <WeekDoneCard plan={plan} onBuild={onBuild} onShare={onShare} />;
}

function WeekDoneCard({ plan, onBuild, onShare }: Pick<TimetableClassWeekPanelProps, "plan" | "onBuild" | "onShare">) {
  const complete = plan.lessonsPlaced > 0 && plan.lessonsRemaining === 0;
  return (
    <section id="timetable-next-step" className={CARD}>
      <p className={cn(EYEBROW, complete ? "text-emerald-700 dark:text-emerald-400" : "text-[#246a59]")}>
        {complete ? "Week complete" : "Next step"}
      </p>
      <p className="mt-1.5 flex items-start gap-2 text-[15px] font-semibold leading-snug text-slate-900 dark:text-white">
        {complete ? <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" /> : null}
        {complete
          ? "Every lesson has a slot. Share it so teachers can see their week."
          : "Tell SQUL what this class learns and it builds the week for you."}
      </p>
      <PrimaryButton onClick={complete ? onShare : onBuild}>
        {complete ? "Share with teachers" : "Let SQUL build it"}
      </PrimaryButton>
    </section>
  );
}

function PrimaryButton({ onClick, children }: { onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(tt.focus, "mt-3 inline-flex w-full items-center justify-center gap-1.5 rounded-lg bg-[#0a1f1a] px-3 py-2.5 text-[13px] font-semibold text-white transition-colors hover:bg-[#246a59]")}
    >
      <Sparkles className="h-3.5 w-3.5" />
      {children}
    </button>
  );
}

function LessonsThisWeekCard({ plan, accentFor, highlightSubjectId, onHighlightSubject }: TimetableClassWeekPanelProps) {
  if (plan.subjects.length === 0) return null;
  return (
    <section className={CARD}>
      <div className="flex items-baseline justify-between gap-2">
        <h2 className="text-[14px] font-semibold text-slate-900 dark:text-white">Lessons this week</h2>
        <p className={cn(tt.text.caption, tt.numeral, "text-slate-600 dark:text-slate-300")}>
          {plan.lessonsPlaced} of {plan.lessonsTarget} placed
        </p>
      </div>
      <ul className="mt-3 space-y-1">
        {plan.subjects.map((row) => (
          <SubjectProgressRow
            key={row.subjectId}
            row={row}
            accent={accentFor(row.subjectId, row.subjectName)}
            highlighted={highlightSubjectId === row.subjectId}
            onToggle={() => onHighlightSubject(highlightSubjectId === row.subjectId ? null : row.subjectId)}
          />
        ))}
      </ul>
    </section>
  );
}

function SubjectProgressRow({ row, accent, highlighted, onToggle }: {
  row: ClassSubjectProgress;
  accent: SubjectAccentStyle;
  highlighted: boolean;
  onToggle: () => void;
}) {
  const target = row.target ?? row.placed;
  const behind = row.target != null && row.placed < row.target;
  const percent = target > 0 ? Math.min(FULL_PERCENT, (row.placed / target) * FULL_PERCENT) : 0;
  return (
    <li>
      <button
        type="button"
        onClick={onToggle}
        aria-pressed={highlighted}
        className={cn(tt.focus, "w-full rounded-lg px-2 py-2 text-left transition-colors hover:bg-[#f3f7f5] dark:hover:bg-white/5", highlighted && "bg-[#e8f2ef] ring-1 ring-[#246a59]/30 dark:bg-white/10")}
      >
        <div className="flex items-start gap-2">
          <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full" style={{ backgroundColor: accent.accent }} aria-hidden />
          <div className="min-w-0 flex-1">
            <p className="text-[13px] font-semibold leading-tight text-slate-900 dark:text-white">{row.subjectName}</p>
            {row.teacherName ? <p className="mt-0.5 text-[11.5px] text-slate-600 dark:text-slate-400">{row.teacherName}</p> : null}
          </div>
          <span className={cn(tt.numeral, "text-[12.5px] font-semibold", behind ? "text-amber-700 dark:text-amber-400" : "text-slate-900 dark:text-white")}>
            {row.placed} / {row.target ?? "–"}
          </span>
        </div>
        <div className="ml-4 mt-1.5 h-1 overflow-hidden rounded-full bg-[#1a4d42]/10 dark:bg-white/10">
          <div className="h-full rounded-full" style={{ width: `${percent}%`, backgroundColor: accent.accent }} />
        </div>
      </button>
    </li>
  );
}

function HeadsUpCard({ headsUps }: { headsUps: ClassHeadsUp[] }) {
  return (
    <section id="timetable-heads-ups" className={CARD}>
      <h2 className="text-[14px] font-semibold text-slate-900 dark:text-white">Heads-up</h2>
      <ul className="mt-2 space-y-3">
        {headsUps.map((item) => (
          <li key={item.id}>
            <p className="text-[13px] font-semibold leading-snug text-slate-900 dark:text-white">{item.title}</p>
            <p className="mt-0.5 text-[12px] leading-relaxed text-slate-600 dark:text-slate-400">{item.body}</p>
          </li>
        ))}
      </ul>
    </section>
  );
}
