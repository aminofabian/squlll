import type { ClassHealth } from "../utils/classPulse";

export const classHealthMeta: Record<
  ClassHealth,
  { label: string; dot: string; tone: string; description: string }
> = {
  ready: {
    label: "Ready",
    dot: "bg-emerald-500",
    tone: "border-emerald-500/30 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300",
    description: "Teacher and every subject are staffed",
  },
  partial: {
    label: "Staffing gaps",
    dot: "bg-amber-500",
    tone: "border-amber-500/30 bg-amber-500/10 text-amber-700 dark:text-amber-300",
    description: "Some subjects still need a teacher",
  },
  "no-subjects": {
    label: "No curriculum",
    dot: "bg-violet-500",
    tone: "border-violet-500/30 bg-violet-500/10 text-violet-700 dark:text-violet-300",
    description: "This level has no subjects yet",
  },
  "no-teacher": {
    label: "No class teacher",
    dot: "bg-orange-500",
    tone: "border-orange-500/30 bg-orange-500/10 text-orange-700 dark:text-orange-300",
    description: "Assign a class teacher to finish setup",
  },
  empty: {
    label: "No students",
    dot: "bg-slate-400",
    tone: "border-slate-400/30 bg-slate-400/10 text-slate-600 dark:text-slate-300",
    description: "Enrol learners to activate the class",
  },
};
