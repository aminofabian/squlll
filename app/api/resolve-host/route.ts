import { NextResponse } from 'next/server';
import { resolveHostViaBackend } from '@/lib/host-resolution';
import { normalizeHostname } from '@/lib/hostname';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/**
 * Host → tenant resolution endpoint. Accepts `?host=` (preferred) or infers
 * from the request headers. Useful for diagnostics and for server components
 * that need the tenant for a custom domain.
 */
export async function GET(request: Request) {
  const url = new URL(request.url);
  const queryHost = url.searchParams.get('host');
  const headerHost =
    request.headers.get('x-forwarded-host') ?? request.headers.get('host');
  const host = normalizeHostname(queryHost || headerHost);

  if (!host) {
    return NextResponse.json(
      { resolution: null, error: 'A host is required' },
      { status: 400, headers: { 'Cache-Control': 'no-store' } },
    );
  }

  const resolution = await resolveHostViaBackend(host);
  return NextResponse.json(
    { host, resolution },
    { headers: { 'Cache-Control': 'no-store' } },
  );
}
