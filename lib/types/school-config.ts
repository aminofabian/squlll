export interface Subject {
  id: string;
  name: string;
  code: string;
  subjectType: string;
  category: string | null;
  department: string | null;
  shortName: string | null;
  isCompulsory: boolean | null;
  totalMarks: number | null;
  passingMarks: number | null;
  creditHours: number | null;
  curriculum: string | null;
}

export interface Stream {
  id: string;
  name: string;
}

export interface GradeLevel {
  id: string;
  name: string;
  age: number | null;
  streams: Stream[];
}

export interface Level {
  id: string;
  name: string;
  description: string;
  subjects: Subject[];
  gradeLevels: GradeLevel[];
}

export interface School {
  schoolId: string;
  schoolName: string;
  subdomain: string;
}

export interface SchoolConfiguration {
  id: string;
  selectedLevels: Level[];
  school: School;
}

export interface LevelClass {
  name: string;
  age: string;
}

export interface LevelInput {
  name: string;
  description: string;
  classes: LevelClass[];
} 