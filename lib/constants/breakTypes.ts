// lib/constants/breakTypes.ts
// Shared break type mappings used across the timetable flow.
// Single source of truth — update here and all consumers stay in sync.

/** Standard school week days */
export const SCHOOL_DAYS = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
] as const;

/** Frontend break type → GraphQL enum (used in delete mutations) */
export const BREAK_TYPE_TO_GRAPHQL_ENUM: Record<string, string> = {
  short_break: "SHORT_BREAK",
  long_break: "LONG_BREAK",
  lunch: "LUNCH",
  afternoon_break: "TEA_BREAK",
  games: "GAMES_BREAK",
  assembly: "ASSEMBLY",
  recess: "RECESS",
  snack: "SNACK_BREAK",
};

/** GraphQL enum → frontend break type (used when parsing API responses) */
export const GRAPHQL_ENUM_TO_BREAK_TYPE: Record<string, string> = {
  SHORT_BREAK: "short_break",
  LONG_BREAK: "long_break",
  LUNCH: "lunch",
  TEA_BREAK: "afternoon_break",
  GAMES_BREAK: "games",
  ASSEMBLY: "assembly",
  RECESS: "recess",
  SNACK_BREAK: "snack",
};

/** Convert a frontend break type to its GraphQL enum value. Falls back to uppercasing. */
export function breakTypeToGraphQL(type: string): string {
  return BREAK_TYPE_TO_GRAPHQL_ENUM[type] || type.toUpperCase();
}

/** Convert a GraphQL enum value to a frontend break type. Falls back to lowercasing. */
export function graphQLToBreakType(enumValue: string): string {
  return GRAPHQL_ENUM_TO_BREAK_TYPE[enumValue] || enumValue.toLowerCase();
}
