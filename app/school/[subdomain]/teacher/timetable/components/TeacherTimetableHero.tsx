"use client";

import { Printer } from "lucide-react";
import { Button } from "@/components/ui/button";
import { RealtimeLiveIndicator } from "@/lib/realtime/RealtimeLiveIndicator";
import { TeacherProgressRing } from "./TeacherProgressRing";

const PERCENT = 100;

type TeacherTimetableHeroProps = {
  greeting: string;
  formattedDate: string;
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

export function TeacherTimetableHero(props: TeacherTimetableHeroProps) {
  const { totalLessons, completedLessons } = props;
  const taughtPercent = totalLessons > 0 ? Math.round((completedLessons / totalLessons) * PERCENT) : 0;

  return (
    <header className="relative isolate flex items-center gap-6 overflow-hidden rounded-xl bg-[#0a2620] px-5 py-3 text-white">
      <HeroBackdrop />
      <div className="relative min-w-0 flex-1">
        <p className="flex items-center gap-2 text-[9px] font-semibold uppercase tracking-[0.26em] text-[#d9c49a]">
          <span className="h-1 w-1 rotate-45 bg-[#d9c49a]" aria-hidden />
          Teaching timetable
          {props.termName ? <span className="font-medium normal-case tracking-normal text-white/50">· {props.termName}</span> : null}
        </p>
        <h1 className="mt-0.5 truncate font-display text-[24px] leading-tight tracking-[-0.03em] text-[#fbf8ef]">
          {props.greeting}
          <span className="text-[#d9c49a]">.</span>
          <span className="ml-3 align-middle font-sans text-[11.5px] tracking-normal text-white/45">
            {props.formattedDate} · Week of {props.weekRangeLabel}
          </span>
        </h1>
      </div>
      <HeroMetrics {...props} />
      <div className="relative flex items-center gap-2.5 border-l border-white/10 pl-5">
        <TeacherProgressRing percent={taughtPercent} />
        <div className="leading-tight">
          <p className="font-display text-[17px] text-[#fbf8ef]">
            {completedLessons}
            <span className="text-white/35">/{totalLessons}</span>
          </p>
          <p className="text-[9px] font-semibold uppercase tracking-[0.16em] text-white/40">Taught</p>
        </div>
      </div>
      <HeroActions showPrint={props.showPrint} onPrint={props.onPrint} />
    </header>
  );
}

function HeroBackdrop() {
  return (
    <div aria-hidden className="pointer-events-none absolute -right-20 -top-28 h-64 w-64 rounded-full bg-[radial-gradient(circle_at_center,rgba(196,154,82,0.25),transparent_62%)]" />
  );
}

function HeroMetrics(props: TeacherTimetableHeroProps) {
  const metrics = [
    { label: "Today", value: props.classesToday == null ? "—" : String(props.classesToday) },
    { label: "This week", value: String(props.totalLessons) },
    { label: "Contact", value: props.teachingTimeLabel },
    { label: "Classes", value: String(props.distinctClasses) },
  ];

  return (
    <dl className="relative hidden items-center divide-x divide-white/10 xl:flex">
      {metrics.map((metric) => (
        <div key={metric.label} className="px-4 leading-tight">
          <dt className="text-[9px] font-semibold uppercase tracking-[0.18em] text-white/40">{metric.label}</dt>
          <dd className="mt-0.5 font-display text-[20px] tracking-[-0.02em] text-[#fbf8ef]">{metric.value}</dd>
        </div>
      ))}
    </dl>
  );
}

function HeroActions({ showPrint, onPrint }: { showPrint: boolean; onPrint: () => void }) {
  return (
    <div className="relative flex items-center gap-2">
      <RealtimeLiveIndicator showLabel={false} />
      {showPrint ? (
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="h-8 gap-1.5 rounded-md border border-white/15 bg-white/[0.06] px-3 text-[11px] font-medium text-white/80 hover:bg-white/12 hover:text-white"
          onClick={onPrint}
        >
          <Printer className="h-3.5 w-3.5" aria-hidden />
          Print
        </Button>
      ) : null}
    </div>
  );
}
