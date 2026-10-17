const PERIODS_IN_A_DOUBLE = 2;
const MAX_LESSONS_PER_SUBJECT = 40;

/** A double is two lessons taught back to back, so it moves the lesson count by two. */
export function lessonsAfterDoubleChange(
  lessonsPerWeek: number,
  previousDoubles: number,
  nextDoubles: number,
): { lessonsPerWeek: number; doubleLessons: number } {
  const doubles = Math.max(0, nextDoubles);
  const delta = doubles - previousDoubles;
  const grown = lessonsPerWeek + delta * PERIODS_IN_A_DOUBLE;
  const lessons = Math.max(
    doubles * PERIODS_IN_A_DOUBLE,
    Math.min(MAX_LESSONS_PER_SUBJECT, grown),
  );

  return {
    lessonsPerWeek: lessons,
    doubleLessons: Math.min(doubles, Math.floor(lessons / PERIODS_IN_A_DOUBLE)),
  };
}
