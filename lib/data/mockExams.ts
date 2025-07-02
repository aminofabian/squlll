import { Exam, Subject, GradingScale, StudentExamResult, KenyanGrade } from "@/types/exam";

export const kenyanGradingScale: GradingScale = {
  id: "kenyan-standard",
  name: "Kenyan Standard Grading",
  levels: [
    { grade: "A" as KenyanGrade, minMarks: 80, maxMarks: 100, points: 12, description: "Excellent" },
    { grade: "A-" as KenyanGrade, minMarks: 75, maxMarks: 79, points: 11, description: "Very Good" },
    { grade: "B+" as KenyanGrade, minMarks: 70, maxMarks: 74, points: 10, description: "Good" },
    { grade: "B" as KenyanGrade, minMarks: 65, maxMarks: 69, points: 9, description: "Good" },
    { grade: "B-" as KenyanGrade, minMarks: 60, maxMarks: 64, points: 8, description: "Satisfactory" },
    { grade: "C+" as KenyanGrade, minMarks: 55, maxMarks: 59, points: 7, description: "Satisfactory" },
    { grade: "C" as KenyanGrade, minMarks: 50, maxMarks: 54, points: 6, description: "Average" },
    { grade: "C-" as KenyanGrade, minMarks: 45, maxMarks: 49, points: 5, description: "Average" },
    { grade: "D+" as KenyanGrade, minMarks: 40, maxMarks: 44, points: 4, description: "Below Average" },
    { grade: "D" as KenyanGrade, minMarks: 35, maxMarks: 39, points: 3, description: "Below Average" },
    { grade: "D-" as KenyanGrade, minMarks: 30, maxMarks: 34, points: 2, description: "Poor" },
    { grade: "E" as KenyanGrade, minMarks: 0, maxMarks: 29, points: 1, description: "Very Poor" },
  ]
};

export const subjects: Subject[] = [
  { id: "math", name: "Mathematics", code: "121", category: "core", maxMarks: 100 },
  { id: "english", name: "English", code: "101", category: "core", maxMarks: 100 },
  { id: "kiswahili", name: "Kiswahili", code: "102", category: "core", maxMarks: 100 },
  { id: "biology", name: "Biology", code: "231", category: "core", maxMarks: 100 },
  { id: "chemistry", name: "Chemistry", code: "233", category: "core", maxMarks: 100 },
];

export const mockExams: Exam[] = [
  {
    id: "exam-1",
    title: "Term 1 Mid-Term Mathematics",
    description: "Mid-term assessment covering Algebra and Geometry",
    subject: subjects[0],
    examType: "Midterm",
    class: "Form 2A",
    stream: "A",
    term: "Term 1",
    academicYear: "2025",
    dateAdministered: "2025-02-15",
    totalMarks: 100,
    duration: 150,
    status: "completed",
    createdBy: {
      id: "teacher-1",
      name: "Mr. John Kibe",
      role: "teacher"
    },
    subjectTeacher: {
      id: "teacher-1",
      name: "Mr. John Kibe"
    },
    gradingScale: kenyanGradingScale,
    instructions: "Answer all questions. Show all working clearly.",
    createdAt: "2025-01-15T08:00:00Z",
    updatedAt: "2025-02-16T10:30:00Z"
  },
  {
    id: "exam-2",
    title: "Term 1 Mid-Term English",
    description: "Mid-term assessment covering Literature and Grammar",
    subject: subjects[1],
    examType: "Midterm",
    class: "Form 2A",
    stream: "A",
    term: "Term 1",
    academicYear: "2025",
    dateAdministered: "2025-02-16",
    totalMarks: 100,
    duration: 120,
    status: "completed",
    createdBy: {
      id: "teacher-2",
      name: "Ms. Jane Wanjiku",
      role: "teacher"
    },
    subjectTeacher: {
      id: "teacher-2",
      name: "Ms. Jane Wanjiku"
    },
    gradingScale: kenyanGradingScale,
    instructions: "Answer all questions in section A and any 3 in section B.",
    createdAt: "2025-01-16T08:00:00Z",
    updatedAt: "2025-02-17T10:30:00Z"
  },
  {
    id: "exam-3",
    title: "Term 1 Mid-Term Kiswahili",
    description: "Mid-term assessment covering Utungaji and Fasihi",
    subject: subjects[2],
    examType: "Midterm",
    class: "Form 2A",
    stream: "A",
    term: "Term 1",
    academicYear: "2025",
    dateAdministered: "2025-02-17",
    totalMarks: 100,
    duration: 120,
    status: "completed",
    createdBy: {
      id: "teacher-3",
      name: "Mr. David Mwangi",
      role: "teacher"
    },
    subjectTeacher: {
      id: "teacher-3",
      name: "Mr. David Mwangi"
    },
    gradingScale: kenyanGradingScale,
    instructions: "Jibu maswali yote katika sehemu A na mawili katika sehemu B.",
    createdAt: "2025-01-17T08:00:00Z",
    updatedAt: "2025-02-18T10:30:00Z"
  },
  {
    id: "exam-4",
    title: "Term 1 Mid-Term Biology",
    description: "Mid-term assessment covering Cell Biology and Ecology",
    subject: subjects[3],
    examType: "Midterm",
    class: "Form 2A",
    stream: "A",
    term: "Term 1",
    academicYear: "2025",
    dateAdministered: "2025-02-18",
    totalMarks: 100,
    duration: 150,
    status: "completed",
    createdBy: {
      id: "teacher-4",
      name: "Dr. Sarah Kamau",
      role: "teacher"
    },
    subjectTeacher: {
      id: "teacher-4",
      name: "Dr. Sarah Kamau"
    },
    gradingScale: kenyanGradingScale,
    instructions: "Answer all questions. Draw clear diagrams where necessary.",
    createdAt: "2025-01-18T08:00:00Z",
    updatedAt: "2025-02-19T10:30:00Z"
  },
  {
    id: "exam-5",
    title: "Term 1 Mid-Term Chemistry",
    description: "Mid-term assessment covering Atomic Structure and Bonding",
    subject: subjects[4],
    examType: "Midterm",
    class: "Form 2A",
    stream: "A",
    term: "Term 1",
    academicYear: "2025",
    dateAdministered: "2025-02-19",
    totalMarks: 100,
    duration: 150,
    status: "completed",
    createdBy: {
      id: "teacher-5",
      name: "Mr. Peter Njoroge",
      role: "teacher"
    },
    subjectTeacher: {
      id: "teacher-5",
      name: "Mr. Peter Njoroge"
    },
    gradingScale: kenyanGradingScale,
    instructions: "Show all working. Use standard notation.",
    createdAt: "2025-01-19T08:00:00Z",
    updatedAt: "2025-02-20T10:30:00Z"
  },
  // End Term Exams
  {
    id: "exam-6",
    title: "Term 1 End Term Mathematics",
    description: "End term assessment covering all topics from Term 1",
    subject: subjects[0],
    examType: "End Term",
    class: "Form 2A",
    stream: "A",
    term: "Term 1",
    academicYear: "2025",
    dateAdministered: "2025-03-20",
    totalMarks: 100,
    duration: 180,
    status: "completed",
    createdBy: {
      id: "teacher-1",
      name: "Mr. John Kibe",
      role: "teacher"
    },
    subjectTeacher: {
      id: "teacher-1",
      name: "Mr. John Kibe"
    },
    gradingScale: kenyanGradingScale,
    instructions: "Answer all questions. Show all working clearly.",
    createdAt: "2025-02-20T08:00:00Z",
    updatedAt: "2025-03-21T10:30:00Z"
  },
  {
    id: "exam-7",
    title: "Term 1 End Term English",
    description: "End term assessment covering all topics from Term 1",
    subject: subjects[1],
    examType: "End Term",
    class: "Form 2A",
    stream: "A",
    term: "Term 1",
    academicYear: "2025",
    dateAdministered: "2025-03-21",
    totalMarks: 100,
    duration: 150,
    status: "completed",
    createdBy: {
      id: "teacher-2",
      name: "Ms. Jane Wanjiku",
      role: "teacher"
    },
    subjectTeacher: {
      id: "teacher-2",
      name: "Ms. Jane Wanjiku"
    },
    gradingScale: kenyanGradingScale,
    instructions: "Answer all questions in section A and any 3 in section B.",
    createdAt: "2025-02-21T08:00:00Z",
    updatedAt: "2025-03-22T10:30:00Z"
  }
];

export const mockStudentResults: StudentExamResult[] = [
  // Term 1 Mid-Term Results
  {
    id: "result-1",
    examId: "exam-1",
    studentId: "student-1",
    student: {
      id: "student-1",
      firstName: "Kevin",
      lastName: "Ochieng",
      admissionNumber: "F2A001",
      gender: "male",
      class: "Form 2A",
      stream: "A"
    },
    marksScored: 87,
    totalMarks: 100,
    percentage: 87,
    grade: "A",
    points: 12,
    positionInClass: 2,
    positionInStream: 2,
    status: "present",
    remarks: "Excellent performance in algebra",
    teacherComment: "Keep up the good work",
    submittedAt: "2025-02-15T11:30:00Z",
    gradedAt: "2025-02-16T09:15:00Z",
    gradedBy: {
      id: "teacher-1",
      name: "Mr. John Kibe"
    }
  },
  {
    id: "result-2",
    examId: "exam-2",
    studentId: "student-1",
    student: {
      id: "student-1",
      firstName: "Kevin",
      lastName: "Ochieng",
      admissionNumber: "F2A001",
      gender: "male",
      class: "Form 2A",
      stream: "A"
    },
    marksScored: 82,
    totalMarks: 100,
    percentage: 82,
    grade: "A",
    points: 12,
    positionInClass: 1,
    positionInStream: 1,
    status: "present",
    remarks: "Strong grasp of literature concepts",
    teacherComment: "Excellent essay writing skills",
    submittedAt: "2025-02-16T11:30:00Z",
    gradedAt: "2025-02-17T09:15:00Z",
    gradedBy: {
      id: "teacher-2",
      name: "Ms. Jane Wanjiku"
    }
  },
  {
    id: "result-3",
    examId: "exam-3",
    studentId: "student-1",
    student: {
      id: "student-1",
      firstName: "Kevin",
      lastName: "Ochieng",
      admissionNumber: "F2A001",
      gender: "male",
      class: "Form 2A",
      stream: "A"
    },
    marksScored: 78,
    totalMarks: 100,
    percentage: 78,
    grade: "A-",
    points: 11,
    positionInClass: 3,
    positionInStream: 3,
    status: "present",
    remarks: "Good performance in composition",
    teacherComment: "Improve comprehension skills",
    submittedAt: "2025-02-17T11:30:00Z",
    gradedAt: "2025-02-18T09:15:00Z",
    gradedBy: {
      id: "teacher-3",
      name: "Mr. David Mwangi"
    }
  },
  {
    id: "result-4",
    examId: "exam-4",
    studentId: "student-1",
    student: {
      id: "student-1",
      firstName: "Kevin",
      lastName: "Ochieng",
      admissionNumber: "F2A001",
      gender: "male",
      class: "Form 2A",
      stream: "A"
    },
    marksScored: 91,
    totalMarks: 100,
    percentage: 91,
    grade: "A",
    points: 12,
    positionInClass: 1,
    positionInStream: 1,
    status: "present",
    remarks: "Outstanding understanding of biological concepts",
    teacherComment: "Excellent diagrams and explanations",
    submittedAt: "2025-02-18T11:30:00Z",
    gradedAt: "2025-02-19T09:15:00Z",
    gradedBy: {
      id: "teacher-4",
      name: "Dr. Sarah Kamau"
    }
  },
  {
    id: "result-5",
    examId: "exam-5",
    studentId: "student-1",
    student: {
      id: "student-1",
      firstName: "Kevin",
      lastName: "Ochieng",
      admissionNumber: "F2A001",
      gender: "male",
      class: "Form 2A",
      stream: "A"
    },
    marksScored: 85,
    totalMarks: 100,
    percentage: 85,
    grade: "A",
    points: 12,
    positionInClass: 2,
    positionInStream: 2,
    status: "present",
    remarks: "Strong chemical calculations",
    teacherComment: "Well done on the practical section",
    submittedAt: "2025-02-19T11:30:00Z",
    gradedAt: "2025-02-20T09:15:00Z",
    gradedBy: {
      id: "teacher-5",
      name: "Mr. Peter Njoroge"
    }
  },
  // Term 1 End Term Results
  {
    id: "result-6",
    examId: "exam-6",
    studentId: "student-1",
    student: {
      id: "student-1",
      firstName: "Kevin",
      lastName: "Ochieng",
      admissionNumber: "F2A001",
      gender: "male",
      class: "Form 2A",
      stream: "A"
    },
    marksScored: 89,
    totalMarks: 100,
    percentage: 89,
    grade: "A",
    points: 12,
    positionInClass: 1,
    positionInStream: 1,
    status: "present",
    remarks: "Comprehensive understanding shown",
    teacherComment: "Excellent problem-solving approach",
    submittedAt: "2025-03-20T11:30:00Z",
    gradedAt: "2025-03-21T09:15:00Z",
    gradedBy: {
      id: "teacher-1",
      name: "Mr. John Kibe"
    }
  },
  {
    id: "result-7",
    examId: "exam-7",
    studentId: "student-1",
    student: {
      id: "student-1",
      firstName: "Kevin",
      lastName: "Ochieng",
      admissionNumber: "F2A001",
      gender: "male",
      class: "Form 2A",
      stream: "A"
    },
    marksScored: 84,
    totalMarks: 100,
    percentage: 84,
    grade: "A",
    points: 12,
    positionInClass: 1,
    positionInStream: 1,
    status: "present",
    remarks: "Outstanding essay and comprehension",
    teacherComment: "Maintain this excellent standard",
    submittedAt: "2025-03-21T11:30:00Z",
    gradedAt: "2025-03-22T09:15:00Z",
    gradedBy: {
      id: "teacher-2",
      name: "Ms. Jane Wanjiku"
    }
  }
];
