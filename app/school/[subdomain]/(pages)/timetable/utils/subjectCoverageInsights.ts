export type SubjectCoverageInsight = {
  subject: string;
  kind: "missing" | "low" | "heavy";
  message: string;
};

export function buildSubjectCoverageInsights(params: {
  subjectDistribution: Record<string, number>;
  expectedSubjectNames?: string[];
  daysPerWeek: number;
  periodCount: number;
  filledSlots: number;
  totalSlots: number;
}): SubjectCoverageInsight[] {
  const {
    subjectDistribution,
    expectedSubjectNames = [],
    daysPerWeek,
    periodCount,
    filledSlots,
    totalSlots,
  } = params;

  if (totalSlots <= 0 || filledSlots === 0) return [];

  const insights: SubjectCoverageInsight[] = [];
  const scheduledNames = new Set(
    Object.keys(subjectDistribution).map((n) => n.toLowerCase().trim()),
  );

  const minWeekly = Math.max(2, Math.min(daysPerWeek, 4));

  for (const [subject, count] of Object.entries(subjectDistribution)) {
    if (count === 1 && daysPerWeek >= 3) {
      insights.push({
        subject,
        kind: "low",
        message: `Only once this week — core subjects often appear at least ${minWeekly} times.`,
      });
    } else if (count === 2 && daysPerWeek >= 5 && periodCount >= 6) {
      insights.push({
        subject,
        kind: "low",
        message: `Twice this week — check if ${subject} should have more periods.`,
      });
    }

    if (periodCount > 0 && count >= daysPerWeek * Math.max(1, periodCount - 1)) {
      insights.push({
        subject,
        kind: "heavy",
        message: `Very frequent (${count} lessons) — confirm this is intentional.`,
      });
    }
  }

  for (const name of expectedSubjectNames) {
    const key = name.toLowerCase().trim();
    if (!key || scheduledNames.has(key)) continue;
    insights.push({
      subject: name,
      kind: "missing",
      message: "On the class list but not on the timetable yet.",
    });
  }

  return insights.slice(0, 8);
}
