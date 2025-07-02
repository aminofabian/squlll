export type ExamType = 'CAT' | 'Midterm' | 'End Term' | 'Mock' | 'KCSE Trial' | 'KCPE Trial' | 'Assessment' | 'Quiz';
export type Term = 'Term 1' | 'Term 2' | 'Term 3';
export type KenyanGrade = 'A' | 'A-' | 'B+' | 'B' | 'B-' | 'C+' | 'C' | 'C-' | 'D+' | 'D' | 'D-' | 'E';
export type ExamStatus = 'draft' | 'published' | 'completed' | 'archived';
export type StudentExamStatus = 'present' | 'absent' | 'exempted';

export interface Subject {
  id: string;
  name: string;
  code: string; // KCSE subject codes like 101, 102, etc.
  category: 'core' | 'elective';
  maxMarks: number;
}

export interface GradingScale {
  id: string;
  name: string;
  levels: {
    grade: KenyanGrade;
    minMarks: number;
    maxMarks: number;
    points: number;
    description: string;
  }[];
}

export interface Exam {
  id: string;
  title: string;
  description?: string;
  subject: Subject;
  examType: ExamType;
  class: string; // e.g., "Form 1A", "Form 2B"
  stream?: string;
  term: Term;
  academicYear: string;
  dateAdministered: string;
  totalMarks: number;
  duration: number; // in minutes
  status: ExamStatus;
  createdBy: {
    id: string;
    name: string;
    role: 'teacher' | 'admin' | 'hod';
  };
  subjectTeacher?: {
    id: string;
    name: string;
  };
  gradingScale: GradingScale;
  instructions?: string;
  createdAt: string;
  updatedAt: string;
}

export interface StudentExamResult {
  id: string;
  examId: string;
  studentId: string;
  student: {
    id: string;
    firstName: string;
    lastName: string;
    admissionNumber: string;
    gender: 'male' | 'female';
    class: string;
    stream?: string;
  };
  marksScored: number;
  totalMarks: number;
  percentage: number;
  grade: KenyanGrade;
  points: number;
  positionInClass: number;
  positionInStream?: number;
  status: StudentExamStatus;
  remarks?: string;
  teacherComment?: string;
  hodComment?: string;
  submittedAt?: string;
  gradedAt?: string;
  gradedBy?: {
    id: string;
    name: string;
  };
}

export interface ExamStatistics {
  examId: string;
  totalStudents: number;
  studentsPresent: number;
  studentsAbsent: number;
  studentsExempted: number;
  averageScore: number;
  highestScore: number;
  lowestScore: number;
  medianScore: number;
  passRate: number; // percentage of students who passed
  gradeDistribution: {
    grade: KenyanGrade;
    count: number;
    percentage: number;
  }[];
  subjectPerformance: {
    strongAreas: string[];
    weakAreas: string[];
  };
}

export interface ClassPerformanceOverview {
  classId: string;
  className: string;
  term: Term;
  academicYear: string;
  totalExams: number;
  averageClassScore: number;
  topPerformers: {
    studentId: string;
    studentName: string;
    averageScore: number;
  }[];
  strugglingStudents: {
    studentId: string;
    studentName: string;
    averageScore: number;
  }[];
  subjectPerformance: {
    subjectId: string;
    subjectName: string;
    averageScore: number;
    passRate: number;
  }[];
}

export interface ExamFilter {
  classId?: string;
  term?: Term;
  academicYear?: string;
  subject?: string;
  examType?: ExamType;
  status?: ExamStatus;
  dateRange?: {
    from: string;
    to: string;
  };
  performanceRange?: {
    min: number;
    max: number;
  };
  searchTerm?: string;
}

export interface BulkExamUpload {
  examId: string;
  results: {
    admissionNumber: string;
    marksScored: number;
    status: StudentExamStatus;
    remarks?: string;
  }[];
} 