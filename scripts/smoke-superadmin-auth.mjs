#!/usr/bin/env node
/**
 * Smoke test: super-admin authentication round trip.
 *
 * Verifies, against a running frontend (and its GraphQL backend), that:
 *   1. login/signup sets a SUPER_ADMIN `userRole` cookie and an `accessToken`;
 *   2. a request to `/dashboard` carrying those cookies is allowed (no bounce
 *      back to the login page);
 *   3. `/dashboard` without a session redirects to `/superadmin/login`;
 *   4. behind a proxy (`x-forwarded-host`), the session cookie is scoped to the
 *      shared platform domain rather than host-only.
 *
 * Usage:
 *   node scripts/smoke-superadmin-auth.mjs [baseUrl] [email] [password]
 *
 * Auth:
 *   - pass [email] [password] (or SMOKE_EMAIL / SMOKE_PASSWORD) to sign in;
 *   - with no credentials, set SMOKE_ALLOW_SIGNUP=1 to create a throwaway
 *     super-admin via the signup route. Otherwise the test skips (exit 0),
 *     which is what CI does unless a target + credentials are configured.
 *
 * Env:
 *   SMOKE_BASE_URL   default http://localhost:3002
 *   SMOKE_EMAIL      super-admin email (enables login mode)
 *   SMOKE_PASSWORD   super-admin password
 *   SMOKE_ALLOW_SIGNUP  "1" to permit creating a throwaway account
 */

const baseUrl = (
  process.argv[2] ??
  process.env.SMOKE_BASE_URL ??
  "http://localhost:3002"
).replace(/\/+$/, "");

const email = process.argv[3] ?? process.env.SMOKE_EMAIL;
const password = process.argv[4] ?? process.env.SMOKE_PASSWORD;
const allowSignup = process.env.SMOKE_ALLOW_SIGNUP === "1";

const SUPER_ADMIN_ROLE = "SUPER_ADMIN";
const PLATFORM_HOST = "squl.co.ke";

let failures = 0;

function check(label, condition, detail = "") {
  const status = condition ? "PASS" : "FAIL";
  console.log(`${status}  ${label}${detail ? ` — ${detail}` : ""}`);
  if (!condition) failures += 1;
}

function setCookies(response) {
  if (typeof response.headers.getSetCookie === "function") {
    return response.headers.getSetCookie();
  }
  const header = response.headers.get("set-cookie");
  return header ? [header] : [];
}

/** name → value, using the last occurrence of each name. */
function cookieMap(rawSetCookies) {
  const map = new Map();
  for (const raw of rawSetCookies) {
    const [pair] = raw.split(";");
    const eq = pair.indexOf("=");
    if (eq === -1) continue;
    map.set(pair.slice(0, eq).trim(), pair.slice(eq + 1).trim());
  }
  return map;
}

function cookieHeader(map) {
  return [...map.entries()].map(([name, value]) => `${name}=${value}`).join("; ");
}

/**
 * Authenticate and return the raw Set-Cookie headers. Creates the account when
 * in signup mode; otherwise signs in with the provided credentials.
 */
async function authenticate({ forwardedHost, mode, credentials } = {}) {
  const isSignup = mode === "signup";
  const path = isSignup
    ? "/api/auth/superadmin-signup"
    : "/api/auth/superadmin-login";

  const body = isSignup
    ? { ...credentials, name: "Smoke Super Admin" }
    : credentials;

  const response = await fetch(`${baseUrl}${path}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(forwardedHost ? { "x-forwarded-host": forwardedHost } : {}),
    },
    body: JSON.stringify(body),
  });

  const payload = await response.json().catch(() => ({}));
  return { response, payload, raw: setCookies(response) };
}

async function run() {
  const hasCredentials = Boolean(email && password);
  const mode = hasCredentials ? "login" : "signup";

  if (!hasCredentials && !allowSignup) {
    console.log(
      "SKIP: no SMOKE_EMAIL/SMOKE_PASSWORD provided and SMOKE_ALLOW_SIGNUP!=1.",
    );
    console.log(
      "      Provide credentials, or set SMOKE_ALLOW_SIGNUP=1 to create a throwaway account.",
    );
    return;
  }

  // In signup mode build a single throwaway identity and reuse it for both calls.
  const credentials = hasCredentials
    ? { email, password }
    : (() => {
        const stamp = Date.now();
        return {
          email: `smoke_super_${stamp}@example.com`,
          password: `Smoke-${stamp}-Aa1`,
        };
      })();

  console.log(`Super-admin auth smoke test against ${baseUrl}`);
  console.log(`Mode: ${mode}${mode === "signup" ? ` (${credentials.email})` : ""}\n`);

  // ── Authorized round trip ────────────────────────────────────────────────
  const auth = await authenticate({ mode, credentials });
  check(
    "login/signup returns 200",
    auth.response.status === 200,
    `status ${auth.response.status} ${JSON.stringify(auth.payload).slice(0, 120)}`,
  );

  const cookies = cookieMap(auth.raw);
  const role = cookies.get("userRole");
  const token = cookies.get("accessToken");

  check("sets userRole cookie", role !== undefined, `userRole=${role ?? "<none>"}`);
  check(
    "userRole cookie is SUPER_ADMIN",
    role?.split(",").some((r) => r.trim() === SUPER_ADMIN_ROLE) === true,
    `userRole=${role ?? "<none>"}`,
  );
  check("sets accessToken cookie", Boolean(token));

  const withSession = await fetch(`${baseUrl}/dashboard`, {
    headers: { cookie: cookieHeader(cookies) },
    redirect: "manual",
  });
  const allowedLocation = withSession.headers.get("location");
  check(
    "carrying the session reaches /dashboard",
    withSession.status === 200,
    `status ${withSession.status}${
      allowedLocation?.includes("/superadmin/login")
        ? ` (bounced to ${allowedLocation})`
        : ""
    }`,
  );

  // ── Unauthenticated request is protected ─────────────────────────────────
  const withoutSession = await fetch(`${baseUrl}/dashboard`, {
    redirect: "manual",
  });
  const loginLocation = withoutSession.headers.get("location");
  check(
    "without a session /dashboard redirects to login",
    withoutSession.status === 307 || withoutSession.status === 308,
    `status ${withoutSession.status}`,
  );
  check(
    "redirect targets /superadmin/login",
    (loginLocation ?? "").includes("/superadmin/login"),
    `location ${loginLocation ?? "<none>"}`,
  );

  // ── Proxy-scoped cookie (regression guard) ───────────────────────────────
  // The account exists by now, so this is always a login.
  const forwarded = await authenticate({
    forwardedHost: PLATFORM_HOST,
    mode: "login",
    credentials,
  });
  const forwardedRole = forwarded.raw.find((raw) =>
    raw.toLowerCase().startsWith("userrole="),
  );
  check(
    "behind a proxy, userRole is scoped to the platform domain",
    Boolean(forwardedRole) &&
      /domain=\.squl\.co\.ke/i.test(forwardedRole) &&
      /samesite=none/i.test(forwardedRole),
    forwardedRole ? forwardedRole.split(";").slice(1).join(";").trim() : "<none>",
  );

  console.log(
    failures === 0 ? "\nAll checks passed." : `\n${failures} check(s) failed.`,
  );
  process.exit(failures === 0 ? 0 : 1);
}

run().catch((error) => {
  console.error("\nSmoke test crashed:", error);
  process.exit(1);
});
