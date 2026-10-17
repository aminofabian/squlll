import { describe, expect, it } from 'vitest';
import { formatKenyanPhone, normalizeKenyanPhone } from './phone';

describe('normalizeKenyanPhone', () => {
  it.each([
    ['0712 345 678', '+254712345678'],
    ['0712345678', '+254712345678'],
    ['712345678', '+254712345678'],
    ['254712345678', '+254712345678'],
    ['+254 712 345 678', '+254712345678'],
    ['0110 000 111', '+254110000111'],
  ])('normalizes %s to %s', (input, expected) => {
    expect(normalizeKenyanPhone(input)).toBe(expected);
  });

  it('rejects non-Kenyan or incomplete numbers', () => {
    expect(normalizeKenyanPhone('')).toBeNull();
    expect(normalizeKenyanPhone('0812 345 678')).toBeNull();
    expect(normalizeKenyanPhone('0712 345')).toBeNull();
    expect(normalizeKenyanPhone('+256 712 345 678')).toBeNull();
  });
});

describe('formatKenyanPhone', () => {
  it('groups the local number for review/display', () => {
    expect(formatKenyanPhone('0712345678')).toBe('+254 712 345 678');
  });

  it('returns the raw input when it cannot be normalized', () => {
    expect(formatKenyanPhone('n/a')).toBe('n/a');
  });
});
