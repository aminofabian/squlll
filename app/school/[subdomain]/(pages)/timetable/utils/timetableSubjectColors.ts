/**
 * Muted accent palette for timetable lesson cells.
 * Colors are stable per subject id/name (hash) with optional department bias.
 */

export interface SubjectAccentStyle {
  accent: string;
  background: string;
  border: string;
  text: string;
}

const PALETTE: SubjectAccentStyle[] = [
  {
    accent: "#5b6eae",
    background: "rgba(91, 110, 174, 0.1)",
    border: "rgba(91, 110, 174, 0.22)",
    text: "#3d4f7a",
  },
  {
    accent: "#4a8f7a",
    background: "rgba(74, 143, 122, 0.1)",
    border: "rgba(74, 143, 122, 0.22)",
    text: "#2f6b58",
  },
  {
    accent: "#9a6b4a",
    background: "rgba(154, 107, 74, 0.1)",
    border: "rgba(154, 107, 74, 0.22)",
    text: "#7a5238",
  },
  {
    accent: "#7a5b9a",
    background: "rgba(122, 91, 154, 0.1)",
    border: "rgba(122, 91, 154, 0.22)",
    text: "#5c4378",
  },
  {
    accent: "#4a7a9a",
    background: "rgba(74, 122, 154, 0.1)",
    border: "rgba(74, 122, 154, 0.22)",
    text: "#355f78",
  },
  {
    accent: "#8a6b5a",
    background: "rgba(138, 107, 90, 0.1)",
    border: "rgba(138, 107, 90, 0.22)",
    text: "#6b5244",
  },
  {
    accent: "#6a8a4a",
    background: "rgba(106, 138, 74, 0.1)",
    border: "rgba(106, 138, 74, 0.22)",
    text: "#4f6a38",
  },
  {
    accent: "#9a5a6a",
    background: "rgba(154, 90, 106, 0.1)",
    border: "rgba(154, 90, 106, 0.22)",
    text: "#784552",
  },
];

const DEPARTMENT_HINTS: Record<string, number> = {
  science: 4,
  sciences: 4,
  math: 4,
  mathematics: 4,
  english: 0,
  language: 0,
  languages: 0,
  humanities: 2,
  arts: 3,
  art: 3,
  pe: 6,
  sports: 6,
  physical: 6,
  ict: 4,
  computer: 4,
  social: 2,
};

function hashString(value: string): number {
  let h = 0;
  for (let i = 0; i < value.length; i++) {
    h = (h << 5) - h + value.charCodeAt(i);
    h |= 0;
  }
  return Math.abs(h);
}

function hexToRgba(hex: string, alpha: number): string {
  const clean = hex.replace("#", "");
  if (clean.length !== 6) return `rgba(100, 116, 139, ${alpha})`;
  const r = parseInt(clean.slice(0, 2), 16);
  const g = parseInt(clean.slice(2, 4), 16);
  const b = parseInt(clean.slice(4, 6), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

function fromCustomHex(hex: string): SubjectAccentStyle {
  return {
    accent: hex,
    background: hexToRgba(hex, 0.1),
    border: hexToRgba(hex, 0.24),
    text: hex,
  };
}

export function getSubjectAccent(
  subjectId: string,
  subjectName: string,
  options?: { department?: string; color?: string },
): SubjectAccentStyle {
  if (options?.color && /^#[0-9A-Fa-f]{6}$/.test(options.color)) {
    return fromCustomHex(options.color);
  }

  const deptKey = (options?.department || "")
    .toLowerCase()
    .replace(/[^a-z]/g, "");
  for (const [hint, index] of Object.entries(DEPARTMENT_HINTS)) {
    if (deptKey.includes(hint)) {
      return PALETTE[index % PALETTE.length];
    }
  }

  const key = subjectId || subjectName;
  const idx = hashString(key) % PALETTE.length;
  return PALETTE[idx];
}
