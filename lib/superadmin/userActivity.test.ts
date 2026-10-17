import { describe, expect, it } from 'vitest';
import type { AdminUserListItem } from './types';
import {
  accountAgeLabel,
  countLoginActivity,
  formatPhoneDisplay,
  formatRelativeLogin,
  loginCountLabel,
  loginFreshness,
  phoneToTelHref,
  phoneToWhatsAppHref,
} from './userActivity';

const now = new Date(2026, 2, 15, 12, 0, 0);

function user(overrides: Partial<AdminUserListItem>): AdminUserListItem {
  return {
    id: 'u1',
    email: 'admin@school.test',
    name: 'Admin',
    isGlobalAdmin: false,
    globalRole: 'NONE',
    createdAt: '2026-01-01T00:00:00.000Z',
    memberships: [],
    ...overrides,
  };
}

describe('phone display helpers', () => {
  it('groups E.164 Kenyan numbers', () => {
    expect(formatPhoneDisplay('+254712345678')).toBe('+254 712 345 678');
  });

  it('builds tel and WhatsApp links without punctuation', () => {
    expect(phoneToTelHref('+254 712 345 678')).toBe('tel:+254712345678');
    expect(phoneToWhatsAppHref('+254 712 345 678')).toBe(
      'https://wa.me/254712345678',
    );
  });

  it('falls back for missing numbers', () => {
    expect(formatPhoneDisplay(null)).toBe('—');
    expect(phoneToTelHref(null)).toBeNull();
  });
});

describe('login freshness', () => {
  it('detects live, today, week, stale, and never states', () => {
    expect(loginFreshness(new Date(2026, 2, 15, 11, 50).toISOString(), now)).toBe(
      'live',
    );
    expect(loginFreshness(new Date(2026, 2, 15, 8, 0).toISOString(), now)).toBe(
      'today',
    );
    expect(loginFreshness(new Date(2026, 2, 12, 8, 0).toISOString(), now)).toBe(
      'week',
    );
    expect(loginFreshness(new Date(2026, 1, 1, 8, 0).toISOString(), now)).toBe(
      'stale',
    );
    expect(loginFreshness(null, now)).toBe('never');
  });

  it('formats relative times and never-signed-in copy', () => {
    expect(formatRelativeLogin(new Date(2026, 2, 15, 11, 59).toISOString(), now)).toBe(
      '1m ago',
    );
    expect(formatRelativeLogin(new Date(2026, 2, 15, 9, 0).toISOString(), now)).toBe(
      '3h ago',
    );
    expect(formatRelativeLogin(new Date(2026, 2, 13, 12, 0).toISOString(), now)).toBe(
      '2d ago',
    );
    expect(formatRelativeLogin(null, now)).toBe('Never signed in');
  });

  it('counts the login pulse without double-counting never-signed-in users', () => {
    const counts = countLoginActivity(
      [
        user({ id: 'live', lastLoginAt: new Date(2026, 2, 15, 11, 55).toISOString() }),
        user({ id: 'today', lastLoginAt: new Date(2026, 2, 15, 7, 0).toISOString() }),
        user({ id: 'week', lastLoginAt: new Date(2026, 2, 11, 7, 0).toISOString() }),
        user({ id: 'stale', lastLoginAt: new Date(2026, 1, 1, 7, 0).toISOString() }),
        user({ id: 'never', lastLoginAt: null }),
      ],
      now,
    );

    expect(counts).toEqual({
      live: 1,
      today: 2,
      thisWeek: 3,
      never: 1,
      signedIn: 4,
    });
  });

  it('describes sign-in counts and account age', () => {
    expect(loginCountLabel(0)).toBe("No sign-ins yet");
    expect(loginCountLabel(1)).toBe('1 sign-in');
    expect(loginCountLabel(7)).toBe('7 sign-ins');
    expect(accountAgeLabel(new Date(2026, 2, 14, 12).toISOString(), now)).toBe(
      'Joined yesterday',
    );
  });
});
