/** Term I → Term II → Term III (numeric or roman in name). */
export function termOrderKey(name: string): number {
  const romanValue: Record<string, number> = {
    i: 1,
    ii: 2,
    iii: 3,
    iv: 4,
  }

  const lower = name.trim().toLowerCase()
  const digit = lower.match(/\d+/)
  if (digit) return parseInt(digit[0], 10)
  const roman = lower.match(/\b(i{1,3}|iv)\b/)
  if (roman) return romanValue[roman[0]] ?? 999
  return 999
}

export function sortTermsForLetter<T extends { name: string }>(
  terms: T[],
): T[] {
  return [...terms].sort((a, b) => termOrderKey(a.name) - termOrderKey(b.name))
}

export function sortTermNamesForLetter(names: string[]): string[] {
  return [...names].sort((a, b) => termOrderKey(a) - termOrderKey(b))
}
