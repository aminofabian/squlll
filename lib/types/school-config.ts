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

export interface Level {
  id: string;
  name: string;
  description: string;
  subjects: Subject[];
  gradeLevels: {
    id: string;
    name: string;
    age: number;
  }[] | null;
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