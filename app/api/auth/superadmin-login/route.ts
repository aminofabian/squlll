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
    const { email, password } = body;

    const mutation = `
      mutation SuperAdminSignIn($input: SignInInput!) {
        superAdminSignIn(input: $input) {
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
        variables: { input: { email, password } },
      }),
    });

    const data = await response.json();

    if (data.errors) {
      console.error("SuperAdmin login GraphQL errors:", data.errors);
      return NextResponse.json(
        { error: data.errors[0].message },
        { status: 401 },
      );
    }

    const userData = data.data.superAdminSignIn;

    if (!userData?.user?.id) {
      return NextResponse.json(
        { error: "Invalid credentials" },
        { status: 401 },
      );
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
      message: "SuperAdmin sign in successful",
    });
  } catch (error) {
    console.error("SuperAdmin login error:", error);
    return NextResponse.json(
      { error: "An error occurred during sign in" },
      { status: 500 },
    );
  }
}
