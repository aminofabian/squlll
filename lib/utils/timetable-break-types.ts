import type { Break } from "@/lib/types/timetable";

/** GraphQL `BreakType` enum values. */
export type GraphQLBreakType =
  | "ASSEMBLY"
  | "GAMES_BREAK"
  | "LONG_BREAK"
  | "LUNCH"
  | "RECESS"
  | "SHORT_BREAK"
  | "SNACK_BREAK"
  | "TEA_BREAK";

export type BreakStoreType = Break["type"];

export interface TimetableBreakTypeOption {
  gql: GraphQLBreakType;
  store: BreakStoreType;
  label: string;
  icon: string;
  color: string;
}

/** Primary options shown in break editors (matches setup wizard). */
export const PRIMARY_BREAK_TYPE_OPTIONS: TimetableBreakTypeOption[] = [
  {
    gql: "LUNCH",
    store: "lunch",
    label: "Lunch",
    icon: "🍽️",
    color: "#F59E0B",
  },
  {
    gql: "SHORT_BREAK",
    store: "short_break",
    label: "Short break",
    icon: "☕",
    color: "#3B82F6",
  },
  {
    gql: "ASSEMBLY",
    store: "assembly",
    label: "Assembly",
    icon: "🏫",
    color: "#8B5CF6",
  },
  {
    gql: "LONG_BREAK",
    store: "long_break",
    label: "Custom / long break",
    icon: "⏰",
    color: "#06B6D4",
  },
];

/** Full list aligned with GraphQL enum (advanced / bulk). */
export const ALL_BREAK_TYPE_OPTIONS: TimetableBreakTypeOption[] = [
  ...PRIMARY_BREAK_TYPE_OPTIONS,
  {
    gql: "TEA_BREAK",
    store: "afternoon_break",
    label: "Tea break",
    icon: "🫖",
    color: "#10B981",
  },
  {
    gql: "RECESS",
    store: "recess",
    label: "Recess",
    icon: "🏃",
    color: "#EC4899",
  },
  {
    gql: "SNACK_BREAK",
    store: "snack",
    label: "Snack break",
    icon: "🍎",
    color: "#EF4444",
  },
  {
    gql: "GAMES_BREAK",
    store: "games",
    label: "Games break",
    icon: "⚽",
    color: "#22C55E",
  },
];

const GQL_TO_STORE: Record<string, BreakStoreType> = Object.fromEntries(
  ALL_BREAK_TYPE_OPTIONS.map((o) => [o.gql, o.store]),
) as Record<string, BreakStoreType>;

const STORE_TO_GQL: Record<string, GraphQLBreakType> = Object.fromEntries(
  ALL_BREAK_TYPE_OPTIONS.map((o) => [o.store, o.gql]),
) as Record<string, GraphQLBreakType>;

/** API → store (lowercase) type used in `useTimetableStoreNew`. */
export function breakGraphQLToStoreType(gqlType: string): BreakStoreType {
  const key = gqlType.toUpperCase();
  return GQL_TO_STORE[key] ?? "short_break";
}

/** Store → API enum for mutations. */
export function breakStoreTypeToGraphQL(
  storeType: string,
): GraphQLBreakType {
  const normalized = storeType.toLowerCase();
  if (STORE_TO_GQL[normalized]) return STORE_TO_GQL[normalized];
  const upper = storeType.toUpperCase();
  if (GQL_TO_STORE[upper]) return upper as GraphQLBreakType;
  return "SHORT_BREAK";
}

/** Form select value from a break loaded in the store. */
export function breakTypeToFormValue(storeType: string): GraphQLBreakType {
  return breakStoreTypeToGraphQL(storeType);
}

export function getBreakTypeOption(
  gqlOrStore: string,
): TimetableBreakTypeOption | undefined {
  const gql = breakStoreTypeToGraphQL(gqlOrStore);
  return ALL_BREAK_TYPE_OPTIONS.find((o) => o.gql === gql);
}
