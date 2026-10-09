import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

/**
 * iOS Universal Links verification file, served at
 * `https://squl.co.ke/.well-known/apple-app-site-association`.
 *
 * Apple requires `Content-Type: application/json` and a team-scoped `appID`
 * (`<AppleTeamID>.<bundleId>`). The team ID is deployment-specific, so it is
 * injected via `APPLE_TEAM_ID`; until it is set we return 404 rather than
 * publish a value that would silently fail verification.
 */
const BUNDLE_ID = process.env.APPLE_BUNDLE_ID ?? "ke.co.squl.app";

export function GET() {
  const teamId = process.env.APPLE_TEAM_ID?.trim();
  if (!teamId) {
    return new NextResponse(null, { status: 404 });
  }

  return NextResponse.json(
    {
      applinks: {
        details: [
          {
            appID: `${teamId}.${BUNDLE_ID}`,
            components: [{ "/": "*" }],
          },
        ],
      },
    },
    { headers: { "Cache-Control": "no-store" } },
  );
}
