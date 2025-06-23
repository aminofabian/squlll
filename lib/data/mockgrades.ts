import { Grade } from '@/types/grade';
import { Student } from '@/types/student';

// Create empty student arrays for each grade since we don't have the actual student data
const createEmptyStudents = (count: number): Student[] => {
  return Array(count).fill(null).map((_, i) => ({
    id: `mock-${i}`,
    first_name: `Student ${i}`,
    last_name: `Last ${i}`,
    date_of_birth: '2000-01-01',
    gender: i % 2 === 0 ? 'male' : 'female',
    phone: '+1234567890',
    status: 'active',
    grade: {} as Grade, // This will be set properly when the grade is created
    admission_date: '2023-01-01',
    attendance: {
      trend: 'stable'
    },
    fees: {
      amount: 1000
    }
  }));
};

export const grades: Grade[] = [
  {
    id: "1",
    name: "Nursery",
    displayName: "Nursery",
    level: "preschool",
    ageGroup: "3-5 years",
    students: createEmptyStudents(45),
    classes: 3
  },
  {
    id: "2",
    name: "Kindergarten",
    displayName: "Kindergarten",
    level: "preschool",
    ageGroup: "5-6 years",
    students: createEmptyStudents(50),
    classes: 3
  },
  {
    id: "3",
    name: "Class 1",
    displayName: "Class 1",
    level: "primary",
    ageGroup: "6-7 years",
    students: createEmptyStudents(60),
    classes: 4
  },
  {
    id: "4",
    name: "Class 2",
    displayName: "Class 2",
    level: "primary",
    ageGroup: "7-8 years",
    students: createEmptyStudents(55),
    classes: 4
  },
  {
    id: "5",
    name: "Class 3",
    displayName: "Class 3",
    level: "primary",
    ageGroup: "8-9 years",
    students: createEmptyStudents(58),
    classes: 4
  },
  {
    id: "6",
    name: "Class 4",
    displayName: "Class 4",
    level: "primary",
    ageGroup: "9-10 years",
    students: createEmptyStudents(52),
    classes: 4
  },
  {
    id: "7",
    name: "Class 5",
    displayName: "Class 5",
    level: "primary",
    ageGroup: "10-11 years",
    students: createEmptyStudents(48),
    classes: 4
  },
  {
    id: "8",
    name: "Class 6",
    displayName: "Class 6",
    level: "primary",
    ageGroup: "11-12 years",
    students: createEmptyStudents(45),
    classes: 4
  },
  {
    id: "9",
    name: "Class 7",
    displayName: "Class 7",
    level: "primary",
    ageGroup: "12-13 years",
    students: createEmptyStudents(42),
    classes: 4
  },
  {
    id: "10",
    name: "Class 8",
    displayName: "Class 8",
    level: "primary",
    ageGroup: "13-14 years",
    students: createEmptyStudents(38),
    classes: 4
  },
  {
    id: "11",
    name: "Form 1",
    displayName: "Form 1",
    level: "junior-secondary",
    ageGroup: "14-15 years",
    students: createEmptyStudents(35),
    classes: 4
  },
  {
    id: "12",
    name: "Form 2",
    displayName: "Form 2",
    level: "junior-secondary",
    ageGroup: "15-16 years",
    students: createEmptyStudents(33),
    classes: 4
  },
  {
    id: "13",
    name: "Form 3",
    displayName: "Form 3",
    level: "junior-secondary",
    ageGroup: "16-17 years",
    students: createEmptyStudents(30),
    classes: 4
  },
  {
    id: "14",
    name: "Form 4",
    displayName: "Form 4",
    level: "senior-secondary",
    ageGroup: "17-18 years",
    students: createEmptyStudents(28),
    classes: 4
  }
];

// Set the grade reference for each student
grades.forEach(grade => {
  grade.students.forEach(student => {
    student.grade = grade;
  });
});
