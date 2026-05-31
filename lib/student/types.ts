export interface StudentMarkDetail {
  id: string
  score: number
  maxScore: number
  percentage: number
  title: string
  type: string
  subject: string
  gradeLevel: string
  status: string
  term: number
  academicYear?: string | null
  date?: string | null
  isPassed: boolean
  createdAt: string
}

export interface StudentExamSession {
  sessionKey: string
  sessionName: string
  examType: string
  term: number
  academicYear: string
  dateRange: { start: Date; end: Date }
  results: StudentExamResultRow[]
}

export interface StudentExamResultRow {
  id: string
  subject: string
  title: string
  marksScored: number
  totalMarks: number
  percentage: number
  grade: string
  status: string
  gradedAt?: string
  type: string
}

export interface StudentTestApi {
  id: string
  title: string
  date: string
  startTime: string
  endTime?: string | null
  duration: number
  totalMarks: number
  status: string
  instructions?: string | null
  resourceUrl?: string | null
  subject: { id: string; name: string }
  teacher: { id: string; name: string }
  mySubmission?: StudentTestSubmissionApi | null
}

export interface StudentTestSubmissionApi {
  id: string
  submitted_at: string
  file_url?: string | null
  comments?: string | null
  submission_text?: string | null
  grade?: number | null
  feedback?: string | null
  graded_at?: string | null
}

export interface StudentTestReferenceMaterial {
  id: string
  fileUrl: string
  fileType: string
  fileSize?: number | null
}

export interface StudentTestQuestion {
  id: string
  text: string
  type: string
  marks: number
  order: number
}

export interface StudentTestDetail extends StudentTestApi {
  referenceMaterials: StudentTestReferenceMaterial[]
  questions: StudentTestQuestion[]
}

export interface StudentTestCounts {
  total: number
  pending: number
  active: number
  completed: number
}

export interface StudentAssignmentItem {
  id: string
  subject: string
  title: string
  description: string
  dueDate: string
  status: 'pending' | 'overdue' | 'submitted' | 'graded'
  teacher: string
  maxScore: number
  grade?: number
  feedback?: string
  gradedAt?: string
  attachments?: string[]
}

export interface StudentNoteApi {
  id: string
  title: string
  content: string
  links?: string[] | null
  visibility: string
  is_ai_generated: boolean
  created_at: string
  updated_at: string
  subject?: { id: string; name: string } | null
  gradeLevel?: { id: string; name: string } | null
  teacher: { id: string; name: string }
}

export type StudentNoteFileType =
  | 'pdf'
  | 'docx'
  | 'pptx'
  | 'xlsx'
  | 'jpg'
  | 'png'
  | 'mp4'
  | 'mp3'
  | 'zip'
  | 'link'

export interface StudentNoteItem {
  id: string
  title: string
  subject: string
  teacher: string
  description: string
  fileType: StudentNoteFileType
  fileSize: string
  uploadDate: string
  downloadCount: number
  isFavorite: boolean
  tags: string[]
  grade: string
  links: string[]
  lastUpdated: string
}

export interface StudentReportCardData {
  studentId: string
  studentName: string
  admissionNumber: string
  gradeLevel: string
  overallAverage: number
  overallGrade: string
  totalAssessments: number
  termPerformances: StudentTermPerformance[]
  allSubjects: StudentSubjectPerformance[]
}

export interface StudentTermPerformance {
  term: number
  academicYear: string
  totalScore: number
  maxPossibleScore: number
  percentage: number
  average: number
  grade: string
  totalAssessments: number
  passedAssessments: number
  failedAssessments: number
}

export interface StudentSubjectPerformance {
  subjectId: string
  subjectName: string
  totalScore: number
  maxPossibleScore: number
  percentage: number
  average: number
  assessmentsCount: number
  grade: string
}

export interface StudentRankingData {
  rank: number
  totalStudents: number
  studentAverage: number
  classAverage: number
  topScore: number
  percentile: string
}

export interface ClassTeacherInfo {
  teacherId: string
  teacherUserId: string
  fullName: string
  email: string
  gradeName: string
}
