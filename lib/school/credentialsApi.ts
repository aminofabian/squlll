export type CredentialChannel = "SMS" | "EMAIL" | "WHATSAPP";

async function gqlRequest<T>(body: {
  query: string;
  variables?: Record<string, unknown>;
}): Promise<T> {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };
  const token =
    typeof window !== "undefined"
      ? window.localStorage.getItem("accessToken")
      : null;
  if (token) headers.Authorization = `Bearer ${token}`;
  const response = await fetch("/api/graphql", {
    method: "POST",
    credentials: "include",
    headers,
    body: JSON.stringify(body),
  });
  const payload = (await response.json()) as {
    data?: T;
    errors?: Array<{ message?: string }>;
  };
  if (payload.errors?.length) {
    throw new Error(payload.errors[0]?.message || "Request failed");
  }
  return payload.data as T;
}

export async function sendTeacherLoginDetails(
  teacherId: string,
  channel: CredentialChannel,
): Promise<boolean> {
  const data = await gqlRequest<{ sendTeacherLoginDetails: boolean }>({
    query: `mutation ($teacherId: ID!, $channel: CommunicationChannel!) {
      sendTeacherLoginDetails(teacherId: $teacherId, channel: $channel)
    }`,
    variables: { teacherId, channel },
  });
  return data.sendTeacherLoginDetails;
}

export async function sendStudentLoginDetails(
  studentId: string,
  channel: CredentialChannel,
): Promise<boolean> {
  const data = await gqlRequest<{ sendStudentLoginDetails: boolean }>({
    query: `mutation ($studentId: String!, $channel: CommunicationChannel!) {
      sendStudentLoginDetails(studentId: $studentId, channel: $channel)
    }`,
    variables: { studentId, channel },
  });
  return data.sendStudentLoginDetails;
}
