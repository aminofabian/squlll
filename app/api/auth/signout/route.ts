import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import {
  clearSessionCookies,
  getSessionCookieOptions,
} from "@/lib/auth/session-cookies";

export async function POST(request: Request) {
  try {
    const cookieStore = await cookies();
    const cookieOptions = getSessionCookieOptions(new URL(request.url));
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
