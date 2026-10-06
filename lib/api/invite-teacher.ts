export type InviteTeacherRequest = {
  email: string
  fullName: string
  firstName: string
  lastName: string
  gender: string
  department: string
  phoneNumber: string
}

export type InvitedTeacher = {
  email: string
  fullName: string
  status: string
  createdAt: string
  emailSent?: boolean
}

/**
 * Sends a teacher invitation through the local proxy route. Throws an Error
 * carrying `code`/`status`; a created-but-unsent invitation is marked with
 * code `EMAIL_SEND_FAILED` so callers can treat it as a soft success.
 */
export async function requestInviteTeacher(
  dto: InviteTeacherRequest,
): Promise<InvitedTeacher> {
  const response = await fetch("/api/school/invite-teacher", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ createTeacherDto: dto }),
  })

  let result: {
    error?: string
    code?: string
    inviteTeacher?: InvitedTeacher
  } = {}
  try {
    result = await response.json()
  } catch {
    result = {}
  }

  if (!response.ok) {
    const message = result.error || "Failed to send invitation"
    const error = new Error(message) as Error & { code?: string; status?: number }
    error.code = result.code
    error.status = response.status
    if (/failed to send email/i.test(message)) {
      error.code = "EMAIL_SEND_FAILED"
    }
    throw error
  }

  return result.inviteTeacher as InvitedTeacher
}
