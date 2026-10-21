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

export async function sendParentLoginDetails(
  parentId: string,
  channel: CredentialChannel,
): Promise<boolean> {
  const data = await gqlRequest<{ sendParentLoginDetails: boolean }>({
    query: `mutation ($parentId: String!, $channel: CommunicationChannel!) {
      sendParentLoginDetails(parentId: $parentId, channel: $channel)
    }`,
    variables: { parentId, channel },
  });
  return data.sendParentLoginDetails;
}

export async function sendStaffLoginDetails(
  staffId: string,
  channel: CredentialChannel,
): Promise<boolean> {
  const data = await gqlRequest<{ sendStaffLoginDetails: boolean }>({
    query: `mutation ($staffId: ID!, $channel: CommunicationChannel!) {
      sendStaffLoginDetails(staffId: $staffId, channel: $channel)
    }`,
    variables: { staffId, channel },
  });
  return data.sendStaffLoginDetails;
}

export type ContactKind = "teacher" | "student" | "parent" | "staff";

/** Sends a person's login details on the chosen channel. */
export async function sendLoginDetails(
  kind: ContactKind,
  id: string,
  channel: CredentialChannel,
): Promise<boolean> {
  switch (kind) {
    case "teacher":
      return sendTeacherLoginDetails(id, channel);
    case "student":
      return sendStudentLoginDetails(id, channel);
    case "parent":
      return sendParentLoginDetails(id, channel);
    case "staff":
      return sendStaffLoginDetails(id, channel);
  }
}

