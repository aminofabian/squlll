const LESSONS_IN_A_TIRING_RUN = 3;

export type RunLesson = {
  id: string;
  subjectId: string;
  dayOfWeek: number;
  /** Periods the lesson occupies, e.g. [3, 4] for a double. */
  periods: number[];
};

export type SubjectRun = {
  subjectId: string;
  dayOfWeek: number;
  lessonIds: string[];
};

function byDayThenPeriod(a: RunLesson, b: RunLesson) {
  return a.dayOfWeek - b.dayOfWeek || Math.min(...a.periods) - Math.min(...b.periods);
}

function followsOn(previous: RunLesson, next: RunLesson) {
  return (
    previous.dayOfWeek === next.dayOfWeek &&
    previous.subjectId === next.subjectId &&
    Math.min(...next.periods) === Math.max(...previous.periods) + 1
  );
}

/** Stretches of the same subject taught lesson after lesson on one day. */
export function findSubjectRuns(lessons: RunLesson[]): SubjectRun[] {
  const ordered = lessons.filter((l) => l.periods.length > 0).sort(byDayThenPeriod);
  const runs: SubjectRun[] = [];
  let current: RunLesson[] = [];

  const closeRun = () => {
    if (current.length >= LESSONS_IN_A_TIRING_RUN) {
      runs.push({
        subjectId: current[0].subjectId,
        dayOfWeek: current[0].dayOfWeek,
        lessonIds: current.map((l) => l.id),
      });
    }
  };

  for (const lesson of ordered) {
    const previous = current[current.length - 1];
    if (previous && followsOn(previous, lesson)) {
      current.push(lesson);
      continue;
    }
    closeRun();
    current = [lesson];
  }
  closeRun();
  return runs;
}
