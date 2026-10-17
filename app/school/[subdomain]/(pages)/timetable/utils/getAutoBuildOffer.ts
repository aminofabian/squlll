const MOSTLY_EMPTY_FILL_RATIO = 0.25;

export type AutoBuildOffer = "start" | "finish" | null;

/**
 * "start" while the week has no lessons, "finish" while it is still mostly
 * empty, otherwise nothing to offer.
 */
export function getAutoBuildOffer({
  totalSlots,
  filledSlots,
}: {
  totalSlots: number;
  filledSlots: number;
}): AutoBuildOffer {
  if (totalSlots <= 0) return null;
  if (filledSlots <= 0) return "start";
  if (filledSlots / totalSlots < MOSTLY_EMPTY_FILL_RATIO) return "finish";
  return null;
}
