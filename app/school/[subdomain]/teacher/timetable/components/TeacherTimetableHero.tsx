"use client";

import { CalendarDays, Printer } from "lucide-react";
import { Button } from "@/components/ui/button";
import { RealtimeLiveIndicator } from "@/lib/realtime/RealtimeLiveIndicator";
import { TeacherProgressRing } from "./TeacherProgressRing";

const PERCENT = 100;

type TeacherTimetableHeroProps = {
  greeting: string;
  formattedDate: string;
  todayName: string;
  weekRangeLabel: string;
  termName?: string;
  classesToday: number | null;
  totalLessons: number;
  completedLessons: number;
  teachingTimeLabel: string;
  distinctClasses: number;
  showPrint: boolean;
  onPrint: () => void;
};

function plural(count: number, singular: string, pluralForm = `${singular}s`) {
  return count === 1 ? singular : pluralForm;
}

export function TeacherTimetableHero(props: TeacherTimetableHeroProps) {
  const { totalLessons, completedLessons } = props;
  const taughtPercent = totalLessons > 0 ? Math.round((completedLessons / totalLessons) * PERCENT) : 0;

  return (
    <header className="relative isolate overflow-hidden rounded-[30px] bg-[#0a2620] text-white shadow-[0_30px_70px_-45px_rgba(6,38,31,0.9)]">
      <HeroBackdrop todayName={props.todayName} />
      <div className="relative px-8 pb-0 pt-7">
        <HeroTopBar termName={props.termName} showPrint={props.showPrint} onPrint={props.onPrint} />
        <div className="mt-6 flex flex-wrap items-end justify-between gap-6">
          <div className="min-w-0">
            <h1 className="font-display text-[46px] leading-[0.98] tracking-[-0.035em] text-[#fbf8ef]">
              {props.greeting}
              <span className="text-[#d9c49a]">.</span>
            </h1>
            <p className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-1 text-[12.5px] text-white/55">
              <span className="inline-flex items-center gap-1.5">
                <CalendarDays className="h-3.5 w-3.5 text-[#d9c49a]" aria-hidden />
                {props.formattedDate}
              </span>
              <span className="h-3 w-px bg-white/15" aria-hidden />
              <span>Week of {props.weekRangeLabel}</span>
            </p>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-right">
              <p className="font-display text-[22px] leading-none text-[#fbf8ef]">
                {completedLessons}
                <span className="text-white/35"> / {totalLessons}</span>
              </p>
              <p className="mt-1.5 text-[10px] font-semibold uppercase tracking-[0.2em] text-white/40">
                Lessons taught
              </p>
            </div>
            <TeacherProgressRing percent={taughtPercent} />
          </div>
        </div>
        <HeroMetrics {...props} />
      </div>
    </header>
  );
}

function HeroBackdrop({ todayName }: { todayName: string }) {
  return (
    <>
      <div aria-hidden className="pointer-events-none absolute inset-x-10 top-0 h-px bg-gradient-to-r from-transparent via-[#d9c49a]/70 to-transparent" />
      <div aria-hidden className="pointer-events-none absolute -right-28 -top-40 h-[420px] w-[420px] rounded-full bg-[radial-gradient(circle_at_center,rgba(196,154,82,0.32),transparent_62%)]" />
      <div aria-hidden className="pointer-events-none absolute -bottom-36 left-[18%] h-72 w-72 rounded-full bg-[#246a59]/45 blur-3xl" />
      <div aria-hidden className="pointer-events-none absolute inset-y-0 right-0 w-[55%] opacity-[0.14] [background-image:linear-gradient(to_right,rgba(255,255,255,.2)_1px,transparent_1px)] [background-size:44px_100%] [mask-image:linear-gradient(to_left,black,transparent)]" />
      <span aria-hidden className="pointer-events-none absolute -bottom-10 right-6 select-none font-display text-[170px] leading-none tracking-[-0.05em] text-white/[0.03]">
        {todayName}
      </span>
    </>
  );
}

function HeroTopBar({ termName, showPrint, onPrint }: { termName?: string; showPrint: boolean; onPrint: () => void }) {
  return (
    <div className="flex items-center justify-between gap-4">
      <div className="flex items-center gap-3">
        <p className="flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.3em] text-[#d9c49a]">
          <span className="h-1.5 w-1.5 rotate-45 bg-[#d9c49a]" aria-hidden />
          Teaching timetable
        </p>
        {termName ? (
          <span className="rounded-full border border-white/15 bg-white/[0.06] px-2.5 py-1 text-[10.5px] font-semibold tracking-wide text-white/80">
            {termName}
          </span>
        ) : null}
      </div>
      <div className="flex items-center gap-2">
        <RealtimeLiveIndicator showLabel={false} />
        {showPrint ? (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="h-9 gap-1.5 rounded-full border border-white/15 bg-white/[0.06] px-4 text-[11px] font-medium text-white/80 hover:bg-white/12 hover:text-white"
            onClick={onPrint}
          >
            <Printer className="h-3.5 w-3.5" aria-hidden />
            Print week
          </Button>
        ) : null}
      </div>
    </div>
  );
}

function HeroMetrics(props: TeacherTimetableHeroProps) {
  const { classesToday, totalLessons, teachingTimeLabel, distinctClasses } = props;
  const metrics = [
    {
      label: "Today",
      value: classesToday == null ? "—" : String(classesToday),
      caption: classesToday == null ? "It's the weekend" : `${plural(classesToday, "class", "classes")} on your plate`,
    },
    { label: "This week", value: String(totalLessons), caption: `${plural(totalLessons, "lesson")} scheduled` },
    { label: "Contact time", value: teachingTimeLabel, caption: "in front of learners" },
    { label: "Classes", value: String(distinctClasses), caption: `${plural(distinctClasses, "group")} you teach` },
  ];

  return (
    <dl className="mt-7 grid grid-cols-4 divide-x divide-white/10 border-t border-white/10">
      {metrics.map((metric) => (
        <div key={metric.label} className="px-5 py-5 first:pl-0">
          <dt className="text-[9.5px] font-semibold uppercase tracking-[0.22em] text-white/40">{metric.label}</dt>
          <dd className="mt-2 font-display text-[32px] leading-none tracking-[-0.03em] text-[#fbf8ef]">{metric.value}</dd>
          <dd className="mt-1.5 text-[11px] text-white/45">{metric.caption}</dd>
        </div>
      ))}
    </dl>
  );
}
