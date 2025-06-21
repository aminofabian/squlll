import { EducationLevel } from './education';

export interface Grade {
  id: string;
  name: string;
  level: EducationLevel;
  students: Student[];
}
