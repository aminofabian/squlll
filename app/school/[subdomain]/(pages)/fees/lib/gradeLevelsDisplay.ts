import type { Grade } from "../types";

type TenantGradeLevelInput = {
  id: string;
  isActive?: boolean;
  shortName?: string | null;
  sortOrder?: number;
  gradeLevel: { id: string; name: string };
  tenantStreams?: Array<{
    id: string;
    stream?: { id: string; name: string };
  }>;
};

/** Build assignable grade cards with correct tenantGradeLevelId for the API */
export function tenantGradeLevelsToGrades(
  levels: TenantGradeLevelInput[],
): Grade[] {
  const grades: Grade[] = [];

  for (const tgl of levels) {
    if (tgl.isActive === false) continue;

    const gradeName = tgl.gradeLevel?.name || "Unknown";
    const streams = tgl.tenantStreams?.filter((ts) => ts?.id);

    if (streams && streams.length > 0) {
      for (const ts of streams) {
        const streamName = ts.stream?.name || "";
        grades.push({
          id: `${tgl.id}::${ts.id}`,
          tenantGradeLevelId: tgl.id,
          name: streamName ? `${gradeName}-${streamName}` : gradeName,
          level: tgl.sortOrder ?? 0,
          section: streamName || tgl.shortName || "",
          boardingType: "day",
          feeStructureId: "",
          studentCount: 0,
          isActive: true,
        });
      }
    } else {
      grades.push({
        id: tgl.id,
        tenantGradeLevelId: tgl.id,
        name: gradeName,
        level: tgl.sortOrder ?? 0,
        section: tgl.shortName || "",
        boardingType: "day",
        feeStructureId: "",
        studentCount: 0,
        isActive: true,
      });
    }
  }

  return grades;
}

export function resolveTenantGradeLevelIds(
  selectedUiIds: string[],
  grades: Grade[],
): string[] {
  const resolved = selectedUiIds.map((selId) => {
    const match = grades.find((g) => g.id === selId);
    if (match?.tenantGradeLevelId) return match.tenantGradeLevelId;
    if (selId.includes("::")) return selId.split("::")[0];
    return selId;
  });
  return [...new Set(resolved)];
}
