export interface ClassRosterStudent {
  id: string;
  name: string;
  admissionNumber: string;
  streamId?: string | null;
  streamName?: string | null;
  feeBalance?: number;
}

type StudentLike = {
  id?: string;
  admission_number?: string;
  streamId?: string | null;
  streamName?: string | null;
  feesOwed?: number;
  grade?: {
    id?: string;
    gradeLevel?: { id?: string; name?: string };
  } | string;
  user?: { name?: string; email?: string };
};

export function filterStudentsForClass(
  students: StudentLike[],
  gradeId: string,
  streamId?: string | null,
): ClassRosterStudent[] {
  const rows: ClassRosterStudent[] = [];

  for (const s of students) {
    if (!s?.id || !s.admission_number) continue;

    const gId =
      typeof s.grade === "object"
        ? s.grade?.gradeLevel?.id ?? s.grade?.id
        : undefined;
    if (gId !== gradeId) continue;
    if (streamId && s.streamId !== streamId) continue;

    const name =
      s.user?.name ||
      (s.user?.email
        ? s.user.email.split("@")[0].replace(/[0-9]/g, " ").trim()
        : `Student ${s.admission_number}`);

    rows.push({
      id: s.id,
      name,
      admissionNumber: s.admission_number,
      streamId: s.streamId,
      streamName: s.streamName,
      feeBalance: s.feesOwed,
    });
  }

  return rows.sort((a, b) => a.name.localeCompare(b.name));
}
