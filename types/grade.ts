import { EducationLevel } from './education';
import { Student } from './student';

export interface Grade {
  id: string;
  name: string;
  displayName: string;
  level: EducationLevel;
  ageGroup: string;
  students: Student[];
  classes: number;
}
