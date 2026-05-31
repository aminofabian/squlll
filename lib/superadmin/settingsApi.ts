import { superAdminGraphqlRequest } from "./graphql";

export interface PlatformHealth {
  graphql: {
    status: "healthy" | "error";
    detail: string;
  };
  authentication: {
    status: "healthy" | "warning" | "error";
    detail: string;
  };
}

export interface SuperAdminAccount {
  name: string;
  email: string;
  role: string;
}

export async function fetchPlatformHealth(): Promise<PlatformHealth> {
  try {
    await superAdminGraphqlRequest<{ __typename: string }>("{ __typename }");
    return {
      graphql: { status: "healthy", detail: "API is responding" },
      authentication: {
        status: "healthy",
        detail: "Session is active",
      },
    };
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Could not reach the API";

    const isAuthError =
      message.toLowerCase().includes("unauthorized") ||
      message.toLowerCase().includes("authentication") ||
      message.toLowerCase().includes("forbidden");

    return {
      graphql: { status: "error", detail: message },
      authentication: {
        status: isAuthError ? "error" : "warning",
        detail: isAuthError ? "Session expired or invalid" : "Could not verify session",
      },
    };
  }
}

export async function changeSuperAdminPassword(input: {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}): Promise<string> {
  const response = await fetch("/api/auth/change-password", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify(input),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error || "Failed to change password");
  }

  return data.message || "Password changed successfully";
}
