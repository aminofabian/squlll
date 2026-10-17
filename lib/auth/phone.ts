/**
 * Kenya-first phone helpers for the public onboarding form.
 *
 * The form shows a fixed `+254` prefix, so people can type the number the way
 * they are used to (`0712 345 678`, `712345678`, `+254 712 345 678`). We store
 * and send one canonical E.164 value.
 */
const KENYAN_MOBILE = /^[17]\d{8}$/;

export function normalizeKenyanPhone(input: string): string | null {
  let digits = input.replace(/\D/g, '');

  if (digits.startsWith('254')) digits = digits.slice(3);
  if (digits.startsWith('0')) digits = digits.slice(1);

  return KENYAN_MOBILE.test(digits) ? `+254${digits}` : null;
}

export function formatKenyanPhone(input: string): string {
  const normalized = normalizeKenyanPhone(input);
  if (!normalized) return input;

  const local = normalized.slice(4);
  return `+254 ${local.slice(0, 3)} ${local.slice(3, 6)} ${local.slice(6)}`;
}
