import type { ReadonlyRequestCookies } from "next/dist/server/web/spec-extension/adapters/request-cookies";

export interface SessionCookieOptions {
  domain?: string;
  sameSite: "lax" | "none";
  secure: boolean;
}

type CookieSetOptions = {
  httpOnly?: boolean;
  secure?: boolean;
  sameSite?: "lax" | "none" | "strict";
  maxAge?: number;
  path?: string;
  domain?: string;
};

/** Next.js route handler cookie store from `cookies()`. */
export type CookieStore = ReadonlyRequestCookies;

const SESSION_COOKIE_NAMES = [
  "accessToken",
  "refreshToken",
  "userId",
  "email",
  "userName",
  "userRole",
  "membershipId",
  "tenantId",
  "tenantName",
  "subdomainUrl",
  "tenantSubdomain",
  "schoolUrl",
] as const;

export function getSessionCookieOptions(requestUrl: URL): SessionCookieOptions {
  if (process.env.NODE_ENV === "production") {
    return {
      domain: ".squl.co.ke",
      sameSite: "none",
      secure: true,
    };
  }

  if (requestUrl.hostname.endsWith(".localhost")) {
    return {
      domain: ".localhost",
      sameSite: "lax",
      secure: false,
    };
  }

  return {
    domain: undefined,
    sameSite: "lax",
    secure: false,
  };
}

export function clearSessionCookies(
  cookieStore: CookieStore,
  options: SessionCookieOptions,
) {
  for (const name of SESSION_COOKIE_NAMES) {
    cookieStore.delete({ name, path: "/" });
    if (options.domain) {
      cookieStore.delete({ name, path: "/", domain: options.domain });
    }
  }
}

export function applySessionCookieDefaults(
  options: SessionCookieOptions,
  overrides: CookieSetOptions = {},
): CookieSetOptions {
  return {
    path: "/",
    domain: options.domain,
    sameSite: options.sameSite,
    secure: options.secure,
    ...overrides,
  };
}

export interface SuperAdminSessionPayload {
  accessToken: string;
  refreshToken: string;
  user: { id: string; email: string; name: string };
}

export function setSuperAdminSessionCookies(
  cookieStore: CookieStore,
  options: SessionCookieOptions,
  payload: SuperAdminSessionPayload,
) {
  clearSessionCookies(cookieStore, options);

  const week = 60 * 60 * 24 * 7;
  const month = 60 * 60 * 24 * 30;

  cookieStore.set(
    "accessToken",
    payload.accessToken,
    applySessionCookieDefaults(options, {
      httpOnly: true,
      maxAge: week,
    }),
  );
  cookieStore.set(
    "refreshToken",
    payload.refreshToken,
    applySessionCookieDefaults(options, {
      httpOnly: true,
      maxAge: month,
    }),
  );
  cookieStore.set(
    "userId",
    payload.user.id,
    applySessionCookieDefaults(options, {
      httpOnly: false,
      maxAge: week,
    }),
  );
  cookieStore.set(
    "email",
    payload.user.email,
    applySessionCookieDefaults(options, {
      httpOnly: false,
      maxAge: week,
    }),
  );
  cookieStore.set(
    "userName",
    payload.user.name,
    applySessionCookieDefaults(options, {
      httpOnly: false,
      maxAge: week,
    }),
  );
  cookieStore.set(
    "userRole",
    "SUPER_ADMIN",
    applySessionCookieDefaults(options, {
      httpOnly: false,
      maxAge: week,
    }),
  );
}
