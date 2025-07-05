import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import mockData from '../data/mock-timetable-data.json';

// Types
export interface Teacher {
  id: number;
  subjects: string[];
  color: string;
}

export interface CellData {
  subject: string;
  teacher: string;
  isBreak?: boolean;
  breakType?: string;
}

export interface TimeSlot {
  id: number;
  time: string;
  color: string;
}

export interface Break {
  id: string;
  name: string;
  type: 'lunch' | 'recess' | 'break' | 'assembly' | 'custom';
  color: string;
  icon: string;
}

export interface TeacherLesson {
  id: string;
  subject: string;
  room: string;
  class: string;
  grade?: string;
  stream?: string;
  day: string;
  period: number;
  totalStudents?: number;
  completed?: boolean;
}

export interface TimetableData {
  subjects: Record<string, CellData>;
  teachers: Record<string, Teacher>;
  timeSlots: TimeSlot[];
  breaks: Break[];
  selectedGrade: string;
  lastUpdated: string;
}

export interface TeacherTimetableData {
  schedule: Record<string, (TeacherLesson | null)[]>;
  periods: string[];
  stats: {
    totalClasses: number;
    gradeDistribution: Record<string, number>;
    totalStudents: number;
    classesPerDay: Record<string, number>;
  };
  lastUpdated: string;
}

interface TimetableStore {
  // Main timetable data
  mainTimetable: TimetableData;
  
  // Teacher timetable data (derived from main)
  teacherTimetable: TeacherTimetableData;
  
  // Actions
  updateMainTimetable: (data: Partial<TimetableData>) => void;
  updateTeacherTimetable: (data: Partial<TeacherTimetableData>) => void;
  syncTeacherTimetable: () => void; // Sync teacher data from main timetable
  resetTimetable: () => void;
  loadMockData: () => void; // Load mock data from JSON file
  forceReloadMockData: () => void; // Force reload mock data (clears cache)
}

// Helper function to convert main timetable data to teacher format
const convertMainToTeacherTimetable = (mainData: TimetableData): TeacherTimetableData => {
  const weekDays = ["MONDAY", "TUESDAY", "WEDNESDAY", "THURSDAY", "FRIDAY"];
  const schedule: Record<string, (TeacherLesson | null)[]> = {
    "MONDAY": Array(11).fill(null),
    "TUESDAY": Array(11).fill(null),
    "WEDNESDAY": Array(11).fill(null),
    "THURSDAY": Array(11).fill(null),
    "FRIDAY": Array(11).fill(null)
  };

  const teacherWorkload: Record<string, number> = {};
  const gradeDistribution: Record<string, number> = {};
  const classesPerDay: Record<string, number> = {
    "MONDAY": 0,
    "TUESDAY": 0,
    "WEDNESDAY": 0,
    "THURSDAY": 0,
    "FRIDAY": 0
  };

  let totalStudents = 0;
  let totalClasses = 0;

  // Convert main timetable data to teacher schedule
  Object.entries(mainData.subjects).forEach(([cellKey, cellData]) => {
    if (cellData && cellData.subject) {
      const [grade, dayIndex, timeId] = cellKey.split('-');
      const dayName = weekDays[parseInt(dayIndex) - 1]; // Convert 1-based day to 0-based index
      const periodIndex = parseInt(timeId); // Keep 0-based time slot
      
      if (dayName && periodIndex >= 0 && periodIndex < 11) {
        if (cellData.isBreak) {
          // Handle breaks - they should appear in teacher timetable too
          const breakLesson: TeacherLesson = {
            id: `${dayName.toLowerCase()}-${periodIndex + 1}`,
            subject: cellData.subject,
            room: 'Break Area',
            class: 'Break',
            grade: grade,
            stream: '',
            day: dayName,
            period: periodIndex + 1,
            totalStudents: 0,
            completed: false
          };

          schedule[dayName][periodIndex] = breakLesson;
          classesPerDay[dayName]++;
          totalClasses++;
          gradeDistribution[grade] = (gradeDistribution[grade] || 0) + 1;
        } else if (cellData.teacher) {
          // Handle regular lessons with teachers
          const lesson: TeacherLesson = {
            id: `${dayName.toLowerCase()}-${periodIndex + 1}`,
            subject: cellData.subject,
            room: `Room ${Math.floor(Math.random() * 20) + 1}`, // Generate room number
            class: `${grade.split(' ')[1]}${String.fromCharCode(65 + Math.floor(Math.random() * 3))}`, // Generate class like "7A"
            grade: grade,
            stream: String.fromCharCode(65 + Math.floor(Math.random() * 3)), // Generate stream like "A"
            day: dayName,
            period: periodIndex + 1,
            totalStudents: Math.floor(Math.random() * 10) + 35, // Random student count 35-45
            completed: false
          };

          schedule[dayName][periodIndex] = lesson;
          classesPerDay[dayName]++;
          totalClasses++;

          // Update statistics
          teacherWorkload[cellData.teacher] = (teacherWorkload[cellData.teacher] || 0) + 1;
          gradeDistribution[grade] = (gradeDistribution[grade] || 0) + 1;
          totalStudents += lesson.totalStudents || 0;
        }
      }
    }
  });

  return {
    schedule,
    periods: mainData.timeSlots.map(slot => slot.time),
    stats: {
      totalClasses,
      gradeDistribution,
      totalStudents,
      classesPerDay
    },
    lastUpdated: new Date().toISOString()
  };
};

// Load mock data
const loadMockData = (): TimetableData => {
  return {
    subjects: mockData.timetable,
    teachers: mockData.metadata.teachers,
    timeSlots: mockData.metadata.timeSlots,
    breaks: mockData.metadata.breaks as Break[],
    selectedGrade: mockData.metadata.grade,
    lastUpdated: mockData.metadata.lastSaved || new Date().toISOString()
  };
};

// Initial data
const initialMainTimetable: TimetableData = loadMockData();

export const useTimetableStore = create<TimetableStore>()(
  persist(
    (set, get) => ({
      mainTimetable: initialMainTimetable,
      teacherTimetable: convertMainToTeacherTimetable(initialMainTimetable),

      updateMainTimetable: (data) => {
        console.log('Updating main timetable with:', data);
        set((state) => {
          const updatedMain = {
            ...state.mainTimetable,
            ...data,
            lastUpdated: new Date().toISOString()
          };
          
          console.log('Updated main timetable:', updatedMain);
          const convertedTeacher = convertMainToTeacherTimetable(updatedMain);
          console.log('Converted teacher timetable:', convertedTeacher);
          
          return {
            mainTimetable: updatedMain,
            teacherTimetable: convertedTeacher
          };
        });
      },

      updateTeacherTimetable: (data) => {
        set((state) => ({
          teacherTimetable: {
            ...state.teacherTimetable,
            ...data,
            lastUpdated: new Date().toISOString()
          }
        }));
      },

      syncTeacherTimetable: () => {
        set((state) => ({
          teacherTimetable: convertMainToTeacherTimetable(state.mainTimetable)
        }));
      },

      resetTimetable: () => {
        set({
          mainTimetable: initialMainTimetable,
          teacherTimetable: convertMainToTeacherTimetable(initialMainTimetable)
        });
      },

      loadMockData: () => {
        console.log('Loading mock data...');
        const freshMockData = {
          subjects: mockData.timetable,
          teachers: mockData.metadata.teachers,
          timeSlots: mockData.metadata.timeSlots,
          breaks: mockData.metadata.breaks as Break[],
          selectedGrade: mockData.metadata.grade,
          lastUpdated: new Date().toISOString()
        };
        
        // Debug: Log the data being loaded
        console.log('Total subjects loaded:', Object.keys(freshMockData.subjects).length);
        console.log('Breaks in data:', Object.entries(freshMockData.subjects).filter(([key, data]) => data?.isBreak).length);
        
        // Clear any cached data and force reload
        set({
          mainTimetable: freshMockData,
          teacherTimetable: convertMainToTeacherTimetable(freshMockData)
        });
        console.log('Mock data loaded successfully');
      },

      // Force reload mock data (clears cache)
      forceReloadMockData: () => {
        console.log('Force reloading mock data...');
        // Clear localStorage cache
        if (typeof window !== 'undefined') {
          localStorage.removeItem('timetable-store');
        }
        
        const freshMockData = {
          subjects: mockData.timetable,
          teachers: mockData.metadata.teachers,
          timeSlots: mockData.metadata.timeSlots,
          breaks: mockData.metadata.breaks as Break[],
          selectedGrade: mockData.metadata.grade,
          lastUpdated: new Date().toISOString()
        };
        
        console.log('Force reload - Total subjects loaded:', Object.keys(freshMockData.subjects).length);
        console.log('Force reload - Breaks in data:', Object.entries(freshMockData.subjects).filter(([key, data]) => data?.isBreak).length);
        
        set({
          mainTimetable: freshMockData,
          teacherTimetable: convertMainToTeacherTimetable(freshMockData)
        });
        console.log('Mock data force reloaded successfully');
      }
    }),
    {
      name: 'timetable-store',
      partialize: (state) => ({
        mainTimetable: state.mainTimetable,
        teacherTimetable: state.teacherTimetable
      })
    }
  )
); 