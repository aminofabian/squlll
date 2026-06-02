/** Preset fee categories schools can pick in setup (grouped for UI) */
export const PRESET_FEE_CATEGORY_GROUPS: { label: string; items: string[] }[] = [
  {
    label: "Core fees",
    items: ["Tuition", "Lunch", "Transport", "Boarding"],
  },
  {
    label: "Academic & activities",
    items: [
      "Examination Fee",
      "Activity Fee",
      "ICT & Computer",
      "Library",
    ],
  },
  {
    label: "Student life",
    items: [
      "Uniform",
      "Sports",
      "School Trip",
      "Entertainment",
      "Stationery",
    ],
  },
  {
    label: "Other common charges",
    items: [
      "Medical Fee",
      "Insurance",
      "Development Fee",
      "PTA Contribution",
      "Graduation",
    ],
  },
];

export const ALL_PRESET_FEE_CATEGORIES = PRESET_FEE_CATEGORY_GROUPS.flatMap(
  (g) => g.items,
);

export function titleCaseCategory(input: string): string {
  const trimmed = input.trim().replace(/\s+/g, " ");
  if (!trimmed) return "";
  return trimmed
    .split(" ")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
    .join(" ");
}

export function isDuplicateCategory(name: string, existing: string[]): boolean {
  const norm = name.toLowerCase();
  return existing.some((c) => c.toLowerCase() === norm);
}

/** Bar colours for split editor — hash fallback for custom names */
const PRESET_COLORS: Record<string, string> = {
  Tuition: "bg-emerald-500",
  Lunch: "bg-amber-500",
  Transport: "bg-sky-500",
  Boarding: "bg-violet-500",
  "Activity Fee": "bg-rose-400",
  "Examination Fee": "bg-orange-400",
  "Medical Fee": "bg-teal-400",
  "Development Fee": "bg-slate-500",
  Uniform: "bg-indigo-500",
  Sports: "bg-lime-600",
  "School Trip": "bg-cyan-600",
  Entertainment: "bg-fuchsia-500",
  Stationery: "bg-yellow-600",
  "ICT & Computer": "bg-blue-500",
  Library: "bg-stone-500",
  Insurance: "bg-pink-500",
  "PTA Contribution": "bg-emerald-600",
  Graduation: "bg-purple-500",
};

const FALLBACK_COLORS = [
  "bg-slate-500",
  "bg-zinc-500",
  "bg-neutral-500",
  "bg-stone-600",
];

export function getCategoryColor(category: string): string {
  if (PRESET_COLORS[category]) return PRESET_COLORS[category];
  let hash = 0;
  for (let i = 0; i < category.length; i++) {
    hash = category.charCodeAt(i) + ((hash << 5) - hash);
  }
  return FALLBACK_COLORS[Math.abs(hash) % FALLBACK_COLORS.length];
}
