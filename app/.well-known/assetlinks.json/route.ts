import { NextResponse } from "next/server";

/**
 * Android App Links verification file, served at
 * `https://squl.co.ke/.well-known/assetlinks.json`.
 *
 * When Google verifies this file, taps on `https://squl.co.ke/...` links open
 * the SQUL Android app instead of a browser tab.
 */
const ANDROID_PACKAGE = "ke.co.squl.app";

/**
 * Every signing certificate that can produce an install of the app. App Links
 * verify per certificate, so each one must be listed:
 * - the EAS-managed upload keystore (EAS internal/preview builds), and
 * - the Google Play app signing key (installs delivered by Play).
 */
const SHA256_CERT_FINGERPRINTS = [
  // EAS-managed upload keystore — project `squl`, config "Build Credentials 9KYnSlkcyy".
  "A2:BC:01:29:74:A4:7A:C1:DE:55:67:2A:B7:10:57:CD:DA:F2:2D:98:D1:58:71:09:BA:DB:D7:A7:EE:48:52:29",
  // TODO(play): append the Google Play app signing key SHA-256 from
  // Play Console → App integrity → App signing key certificate once the first
  // AAB is uploaded. Play-signed installs won't verify App Links until then.
];

export function GET() {
  return NextResponse.json([
    {
      relation: ["delegate_permission/common.handle_all_messages"],
      target: {
        namespace: "android_app",
        package_name: ANDROID_PACKAGE,
        sha256_cert_fingerprints: SHA256_CERT_FINGERPRINTS,
      },
    },
  ]);
}
