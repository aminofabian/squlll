import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { clearSessionCookies } from "@/lib/auth/session-cookies";
import { getAuthCookieOptions } from "@/lib/auth/cookie-domain";

export async function POST(request: Request) {
  try {
    const cookieStore = await cookies();
    // Clear both the host-only and shared-domain cookies, using the same
    // proxy-aware scope the login routes set them with.
    const cookieOptions = getAuthCookieOptions(request);
    clearSessionCookies(cookieStore, cookieOptions);

    return NextResponse.json({
      message: "Sign out successful",
    });
  } catch (error) {
    console.error("Sign out error:", error);
    return NextResponse.json(
      { error: "An error occurred during sign out" },
      { status: 500 },
    );
  }
}
