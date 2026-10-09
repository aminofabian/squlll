/** Build the absolute URL for a school's portal (school subdomain host). */
export function schoolPortalUrl(subdomain: string, path = "/"): string {
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;

  // In the browser, derive the host + port from the current location so local
  // dev stays on the local host (e.g. http://school.localhost:3002) instead of
  // redirecting to the production domain.
  if (typeof window !== "undefined") {
    const { hostname, port } = window.location;
    const isLocal =
      hostname === "localhost" ||
      hostname === "127.0.0.1" ||
      hostname.endsWith(".localhost");

    if (isLocal) {
      const portSuffix = port ? `:${port}` : "";
      return `http://${subdomain}.localhost${portSuffix}${normalizedPath}`;
    }

    return `https://${subdomain}.squl.co.ke${normalizedPath}`;
  }

  // SSR fallback (no window available).
  const isProd = process.env.NODE_ENV === "production";
  const base = isProd ? "squl.co.ke" : "localhost:3002";
  return `${isProd ? "https://" : "http://"}${subdomain}.${base}${normalizedPath}`;
}

/** Relative path after sign-in (subdomain middleware rewrites to /school/[subdomain]/…). */
export function getPostLoginPath(
  role: string | undefined,
  schoolConfigured: boolean,
): string {
  if (role === 'SCHOOL_ADMIN' && !schoolConfigured) {
    return '/setup';
  }

  switch (role) {
    case 'SCHOOL_ADMIN':
      return '/dashboard';
    case 'TEACHER':
      return '/teacher';
    case 'STUDENT':
      return '/student';
    case 'PARENT':
      return '/parent';
    case 'STAFF':
      return '/staff-portal';
    case 'DRIVER':
    case 'CONDUCTOR':
      // Drivers work from the SQUL mobile app; the web has a landing page only.
      return '/driver';
    default:
      return '/dashboard';
  }
}
