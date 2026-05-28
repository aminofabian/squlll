/** Build absolute URL for a school subdomain (dev + prod). */
export function schoolPortalUrl(subdomain: string, path: string): string {
  const isProd = process.env.NODE_ENV === 'production';
  const protocol = isProd ? 'https://' : 'http://';
  const domain = isProd ? 'squl.co.ke' : 'localhost:3000';
  const normalizedPath = path.startsWith('/') ? path : `/${path}`;
  return `${protocol}${subdomain}.${domain}${normalizedPath}`;
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
    default:
      return '/dashboard';
  }
}
