import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { resolveGraphqlEndpoint } from "@/lib/graphql-endpoint";
import {
  getSessionCookieOptions,
  setSuperAdminSessionCookies,
} from "@/lib/auth/session-cookies";

const GRAPHQL_ENDPOINT = resolveGraphqlEndpoint();

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email, password, name } = body;

    if (!email || !password || !name) {
      return NextResponse.json(
        { error: "Email, password, and name are required" },
        { status: 400 },
      );
    }

    const mutation = `
      mutation SuperAdminSignup($input: SuperAdminSignupInput!) {
        superAdminSignup(input: $input) {
          user {
            id
            email
            name
          }
          accessToken
          refreshToken
          role
        }
      }
    `;

    const response = await fetch(GRAPHQL_ENDPOINT, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        query: mutation,
        variables: { input: { email, password, name } },
      }),
    });

    const data = await response.json();

    if (data.errors) {
      const message = data.errors[0]?.message || "Signup failed";
      return NextResponse.json({ error: message }, { status: 400 });
    }

    const userData = data.data.superAdminSignup;

    if (!userData?.user?.id) {
      return NextResponse.json({ error: "Signup failed" }, { status: 500 });
    }

    const cookieStore = await cookies();
    const cookieOptions = getSessionCookieOptions(new URL(request.url));

    setSuperAdminSessionCookies(cookieStore, cookieOptions, {
      accessToken: userData.accessToken,
      refreshToken: userData.refreshToken,
      user: userData.user,
    });

    return NextResponse.json({
      user: userData.user,
      role: "SUPER_ADMIN",
      message: "SuperAdmin account created successfully",
    });
  } catch (error) {
    console.error("SuperAdmin signup error:", error);
    return NextResponse.json(
      { error: "An error occurred during signup" },
      { status: 500 },
    );
  }
}
