import type { FeesSection } from "../components/FeesSectionTabs";
import { FEE_PLAN_QUERY, feePlanSlug } from "./feePlanSlug";
import { FEE_TERM_QUERY, termToQueryValue } from "./feePlanDetailUrl";

export { FEE_TERM_QUERY } from "./feePlanDetailUrl";
export const FEE_BALANCE_CLASS_QUERY = "class";

export const FEE_SECTION_QUERY = "section";

export const FEES_SECTIONS: FeesSection[] = [
  "overview",
  "plans",
  "balances",
  "assignments",
  "reports",
];

export function parseFeesSection(
  value: string | null | undefined,
  fallback: FeesSection = "overview",
): FeesSection {
  if (value && FEES_SECTIONS.includes(value as FeesSection)) {
    return value as FeesSection;
  }
  return fallback;
}

export function buildFeesHref(options?: {
  section?: FeesSection;
  plan?: string;
  term?: string;
  balanceClass?: string;
}): string {
  const params = new URLSearchParams();
  const section = options?.plan ? (options.section ?? "plans") : options?.section;

  if (section) {
    params.set(FEE_SECTION_QUERY, section);
  }
  if (options?.plan) {
    params.set(FEE_PLAN_QUERY, options.plan);
  }
  if (options?.plan && options?.term) {
    params.set(FEE_TERM_QUERY, termToQueryValue(options.term));
  }
  if (options?.balanceClass) {
    params.set(FEE_BALANCE_CLASS_QUERY, options.balanceClass);
  }

  const query = params.toString();
  return query ? `/fees?${query}` : "/fees?section=overview";
}

export function feesOverviewHref(): string {
  return buildFeesHref({ section: "overview" });
}

export function feesPlansHref(): string {
  return buildFeesHref({ section: "plans" });
}

export function feesBalancesHref(className?: string): string {
  return buildFeesHref({
    section: "balances",
    balanceClass: className,
  });
}

export function feesAssignmentsHref(): string {
  return buildFeesHref({ section: "assignments" });
}

export function feesReportsHref(): string {
  return buildFeesHref({ section: "reports" });
}

export function feesSectionHref(section: FeesSection): string {
  return buildFeesHref({ section });
}

export function feePlansListHref(): string {
  return feesPlansHref();
}

export function feePlanDetailHref(
  structure: Parameters<typeof feePlanSlug>[0],
  options?: { termId?: string },
): string {
  return buildFeesHref({
    section: "plans",
    plan: feePlanSlug(structure),
    term: options?.termId,
  });
}
