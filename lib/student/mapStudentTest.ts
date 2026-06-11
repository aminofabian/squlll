import type { StudentAssignmentItem, StudentTestApi } from './types'

function dueDateFromTest(test: StudentTestApi): string {
  return test.date.slice(0, 10)
}

function isPastDue(test: StudentTestApi): boolean {
  const due = new Date(dueDateFromTest(test))
  due.setHours(23, 59, 59, 999)
  return due < new Date()
}

export function mapStudentTestToAssignment(
  test: StudentTestApi,
): StudentAssignmentItem {
  const dueDate = dueDateFromTest(test)
  const submitted = Boolean(test.mySubmission)
  const graded = test.mySubmission?.grade != null
  const overdue = !submitted && isPastDue(test)

  return {
    id: test.id,
    subject: test.subject.name,
    title: test.title,
    description: test.instructions ?? '',
    dueDate,
    status: graded ? 'graded' : submitted ? 'submitted' : overdue ? 'overdue' : 'pending',
    teacher: test.teacher.name,
    maxScore: test.totalMarks,
    duration: test.effectiveDuration ?? test.duration,
    startedAt: test.mySubmission?.started_at ?? null,
    grade: test.mySubmission?.grade ?? undefined,
    feedback: test.mySubmission?.feedback ?? undefined,
    gradedAt: test.mySubmission?.graded_at ?? undefined,
    attachments: test.resourceUrl ? [test.resourceUrl] : [],
  }
}
