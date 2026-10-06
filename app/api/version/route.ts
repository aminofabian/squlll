import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

/**
 * Build identifier for deploy verification.
 *
 * The Docker image is built with `SOURCE_COMMIT` set to the triggering commit
 * and exposes it as the `GITHUB_SHA` env var, so the Coolify image workflow can
 * poll this endpoint until the new build is actually serving traffic.
 */
export function GET() {
  return NextResponse.json(
    { sha: process.env.GITHUB_SHA ?? process.env.SOURCE_COMMIT ?? null },
    { headers: { "Cache-Control": "no-store" } },
  );
}
