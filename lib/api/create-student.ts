export type CreateStudentRequest = {
  name: string
  admission_number: string
  gender: string
  /** Tenant grade level id (UUID). */
  grade: string
  /** Tenant stream id (UUID), when the class uses streams. */
  stream?: string
  phone: string
  student_email?: string
}

export type CreatedStudent = {
  user: { id: string; email: string; name: string }
  student: {
    id: string
    admission_number: string
    grade: { id: string }
    gender: string
    phone: string
  }
  generatedPassword: string
}

/**
 * Enrolls a single learner through the local proxy route. Throws an Error that
 * carries the backend `code`/`status` so callers can show a friendly message.
 */
export async function requestCreateStudent(
  input: CreateStudentRequest,
): Promise<CreatedStudent> {
  const response = await fetch('/api/school/create-student', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(input),
  })

  let result: { error?: string; code?: string; createStudent?: CreatedStudent } = {}
  try {
    result = await response.json()
  } catch {
    result = {}
  }

  if (!response.ok) {
    const error = new Error(result.error || 'Failed to create student') as Error & {
      code?: string
      status?: number
    }
    error.code = result.code
    error.status = response.status
    throw error
  }

  return result.createStudent as CreatedStudent
}
