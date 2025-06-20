export type EducationLevel = 'preschool' | 'primary' | 'junior-secondary' | 'senior-secondary' | 'all'

export interface Grade {
    id: string
    name: string      // Abbreviated name (G1, F1, etc)
    displayName: string  // Full name (Grade 1, Form 1, etc)
    level: EducationLevel
    ageGroup: string
    students: number
    classes: number
    schedule: {
      days: string[]
      time: string
      venue?: string
    }
  }
  
  export interface Class {
    id: string
    name: string
    description: string
    instructor: string
    schedule: {
      days: string[]
      time: string
      venue?: string
    }
    students: number
    status: 'active' | 'inactive' | 'scheduled'
    level: EducationLevel
    grade: string
    stream: string  // Added stream information (A, B, C, etc)
    gradeType: string
    ageGroup: string
    imageSrc?: string
    genderBreakdown?: {
      male: number
      female: number
    }
    currentLesson?: {
      subject: string
      teacher: string
      startTime: string
      endTime: string
      topic: string
      room: string
    }
    // Additional fields for Kenya specific info
    classTeacher?: string
    classLeadership?: {
      prefect?: string
      assistantPrefect?: string
      timekeeper?: string
      classMonitors?: string[]
      subjectMonitors?: Record<string, string>
    }
    academicPerformance?: {
      averageGrade: string
      overallPerformance: string
      improvement: number
      ranking: number
      totalClasses: number
      previousTerm: {
        averageGrade: string
        ranking: number
      }
      topStudents?: string[]
    }
    attendance?: {
      rate: string
      present: number
      absent: number
      onLeave: number
      total: number
      absentToday?: number
      absentThisWeek?: number
      trend?: 'improving' | 'stable' | 'declining'
    }
    fees?: {
      billed: number
      paid: number
      pending: number
      unpaidCount: number
      clearedCount?: number
      studentsPendingFees?: string[]
    }
    meetings?: {
      upcoming: {
        title: string
        date: string
        time: string
      }[]
      past: number
    }
    clubs?: string[]
    assignments?: {
      total: number
      submitted: number
      pending: number
      graded: number
      issued: number
      upcoming: string[]
    }
    discipline?: {
      warningReports: number
      suspensions: number
      severity: 'High' | 'Medium' | 'None'
    }
    coCurrenticular?: {
      activities: {
        name: string
        role: string
        achievements?: string[]
      }[]
      competitions?: {
        name: string
        level: string
        date: string
        status: 'upcoming' | 'completed'
        result?: string
      }[]
    }
    kcpePerformanceMean?: string
    kcseMean?: string
    streamName?: string
    examRanking?: {
      internalRank: number
      zonalPosition?: number
      countyPosition?: number
    }
    clubsRepresentation?: string[]
    parentsMeeting?: {
      nextDate: string
      agenda: string
      venue: string
    }
    classTeacherRemarks?: string
    examPreparation?: {
      mockExams: number
      nextMockDate: string
      revisionSessions: number
      performanceTrend: string
      targetAreas: string[]
    }
  }
  
export const mockGrades: Grade[] = [
    // Preschool grades
    {
      id: 'babyclass',
      name: 'BC',
      displayName: 'Baby Class',
      level: 'preschool',
      ageGroup: '3 years',
      students: 42,
      classes: 2,
      schedule: {
        days: ['Monday', 'Wednesday', 'Friday'],
        time: '8:00 AM - 12:00 PM',
        venue: 'Room 1'
      }
    },
    {
      id: 'pp1',
      name: 'PP1',
      displayName: 'PP1',
      level: 'preschool',
      ageGroup: '4 years',
      students: 56,
      classes: 3,
      schedule: {
        days: ['Monday', 'Tuesday', 'Thursday'],
        time: '8:00 AM - 12:00 PM',
        venue: 'Room 2'
      }
    },
    {
      id: 'pp2',
      name: 'PP2',
      displayName: 'PP2',
      level: 'preschool',
      ageGroup: '5 years',
      students: 48,
      classes: 2,
      schedule: {
        days: ['Monday', 'Wednesday', 'Friday'],
        time: '8:00 AM - 12:00 PM',
        venue: 'Room 3'
      }
    },
    
    // Primary grades
    {
      id: 'grade1',
      name: 'G1',
      displayName: 'Grade 1',
      level: 'primary',
      ageGroup: '6 years',
      students: 65,
      classes: 3,
      schedule: {
        days: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
        time: '8:00 AM - 3:00 PM',
        venue: 'Room 4'
      }
    },
    {
      id: 'grade2',
      name: 'G2',
      displayName: 'Grade 2',
      level: 'primary',
      ageGroup: '7 years',
      students: 62,
      classes: 3,
      schedule: {
        days: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
        time: '8:00 AM - 3:00 PM',
        venue: 'Room 5'
      }
    },
    {
      id: 'grade3',
      name: 'G3',
      displayName: 'Grade 3',
      level: 'primary',
      ageGroup: '8 years',
      students: 58,
      classes: 2,
      schedule: {
        days: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
        time: '8:00 AM - 3:00 PM',
        venue: 'Room 6'
      }
    },
    {
      id: 'grade4',
      name: 'G4',
      displayName: 'Grade 4',
      level: 'primary',
      ageGroup: '9 years',
      students: 60,
      classes: 2,
      schedule: {
        days: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
        time: '8:00 AM - 3:00 PM',
        venue: 'Room 7'
      }
    },
    {
      id: 'grade5',
      name: 'G5',
      displayName: 'Grade 5',
      level: 'primary',
      ageGroup: '10 years',
      students: 54,
      classes: 2,
      schedule: {
        days: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
        time: '8:00 AM - 3:00 PM',
        venue: 'Room 8'
      }
    },
    {
      id: 'grade6',
      name: 'G6',
      displayName: 'Grade 6',
      level: 'primary',
      ageGroup: '11 years',
      students: 52,
      classes: 2,
      schedule: {
        days: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
        time: '8:00 AM - 3:00 PM',
        venue: 'Room 9'
      }
    },
    
    // Junior Secondary grades
    {
      id: 'grade7',
      name: 'F1',
      displayName: 'Form 1',
      level: 'junior-secondary',
      ageGroup: '12 years',
      students: 86,
      classes: 3,
      schedule: {
        days: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
        time: '8:00 AM - 3:00 PM',
        venue: 'Room 10'
      }
    },
    {
      id: 'grade8',
      name: 'F2',
      displayName: 'Form 2',
      level: 'junior-secondary',
      ageGroup: '13 years',
      students: 78,
      classes: 3,
      schedule: {
        days: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
        time: '8:00 AM - 3:00 PM',
        venue: 'Room 11'
      }
    },
    {
      id: 'grade9',
      name: 'F3',
      displayName: 'Form 3',
      level: 'junior-secondary',
      ageGroup: '14 years',
      students: 72,
      classes: 2,
      schedule: {
        days: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
        time: '8:00 AM - 3:00 PM',
        venue: 'Room 12'
      }
    },
    
    // Senior Secondary grades
    {
      id: 'grade10',
      name: 'F4',
      displayName: 'Form 4',
      level: 'senior-secondary',
      ageGroup: '15 years',
      students: 68,
      classes: 3,
      schedule: {
        days: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
        time: '8:00 AM - 3:00 PM',
        venue: 'Room 13'
      }
    },
    {
      id: 'grade11',
      name: 'F5',
      displayName: 'Form 5',
      level: 'senior-secondary',
      ageGroup: '16 years',
      students: 54,
      classes: 2,
      schedule: {
        days: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
        time: '8:00 AM - 3:00 PM',
        venue: 'Room 14'
      }
    },
    {
      id: 'grade12',
      name: 'F6',
      displayName: 'Form 6',
      level: 'senior-secondary',
      ageGroup: '17 years',
      students: 48,
      classes: 2,
      schedule: {
        days: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
        time: '8:00 AM - 3:00 PM',
        venue: 'Room 15'
      }
    }
  ];

export const mockClasses: Class[] = [
    // Preschool classes
    {
      id: 'bc-english',
      name: 'Baby Class English',
      description: 'Fundamental language skills for the youngest learners',
      instructor: 'Ms. Alice Mwangi',
      schedule: {
        days: ['Monday', 'Wednesday', 'Friday'],
        time: '8:00 AM - 9:30 AM',
        venue: 'Room 1'
      },
      students: 22,
      status: 'active',
      level: 'preschool',
      grade: 'babyclass',
      stream: 'A',
      gradeType: 'Early Childhood',
      ageGroup: '3-4 years',
      genderBreakdown: {
        male: 12,
        female: 10
      },
      currentLesson: {
        subject: 'Creative Arts',
        teacher: 'Mrs. Emily Parker',
        startTime: '9:30 AM',
        endTime: '10:15 AM',
        topic: 'Colors and Shapes',
        room: 'Room 1'
      },
      classTeacher: 'Mrs. Emily Parker',
      attendance: {
        rate: '92%',
        present: 20,
        absent: 2,
        onLeave: 0,
        total: 22,
        trend: 'stable'
      }
    },
    {
      id: 'bc-2',
      name: 'Baby Class B',
      description: 'Early development with focus on social skills',
      instructor: 'Mr. David Wilson',
      schedule: {
        days: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
        time: '8:00 AM - 12:00 PM',
        venue: 'Room 2'
      },
      students: 20,
      status: 'active',
      level: 'preschool',
      grade: 'babyclass',
      stream: 'B',
      gradeType: 'BC',
      ageGroup: '3 years',
      genderBreakdown: {
        male: 11,
        female: 9
      }
    },
    
    // PP1 classes
    {
      id: 'pp1-1',
      name: 'PP1 Morning',
      description: 'Pre-primary 1 with focus on early literacy',
      instructor: 'Ms. Sarah Johnson',
      schedule: {
        days: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
        time: '8:00 AM - 12:30 PM',
        venue: 'Room 3'
      },
      students: 24,
      status: 'active',
      level: 'preschool',
      grade: 'pp1',
      stream: 'A',
      gradeType: 'PP1',
      ageGroup: '4 years',
      academicPerformance: {
        averageGrade: 'B+',
        overallPerformance: 'Above Average',
        improvement: 5,
        ranking: 2,
        totalClasses: 4,
        previousTerm: {
          averageGrade: 'B',
          ranking: 3
        }
      }
    },
    
    // Primary classes
    {
      id: 'g1-1',
      name: 'Grade 1 Alpha',
      description: 'Foundation class focusing on core literacy and numeracy',
      instructor: 'Ms. Rebecca Smith',
      schedule: {
        days: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
        time: '8:00 AM - 3:00 PM',
        venue: 'Room 4'
      },
      students: 32,
      status: 'active',
      level: 'primary',
      grade: 'grade1',
      stream: 'A',
      gradeType: 'G1',
      ageGroup: '6 years',
      fees: {
        billed: 45000,
        paid: 38000,
        pending: 7000,
        unpaidCount: 4,
        clearedCount: 28
      }
    },
    {
      id: 'g3-2',
      name: 'Grade 3 Beta',
      description: 'Intermediate primary with environmental studies focus',
      instructor: 'Mr. James Ochieng',
      schedule: {
        days: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
        time: '8:00 AM - 3:30 PM',
        venue: 'Room 7'
      },
      students: 28,
      status: 'active',
      level: 'primary',
      grade: 'grade3',
      stream: 'B',
      gradeType: 'G3',
      ageGroup: '8 years',
      classLeadership: {
        prefect: 'Jane Mwangi',
        assistantPrefect: 'Robert Kiprop',
        timekeeper: 'Michael Omondi',
        classMonitors: ['Lucy Achieng', 'Daniel Wekesa']
      }
    },
    
    // Junior Secondary classes
    {
      id: 'f1-1',
      name: 'Form 1 East',
      description: 'First year of junior secondary education',
      instructor: 'Mr. Samuel Njoroge',
      schedule: {
        days: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
        time: '7:45 AM - 4:00 PM',
        venue: 'Block B, Room 1'
      },
      students: 38,
      status: 'active',
      level: 'junior-secondary',
      grade: 'grade7',
      stream: 'A',
      gradeType: 'F1',
      ageGroup: '12-13 years',
      assignments: {
        total: 12,
        submitted: 10,
        pending: 2,
        graded: 8,
        issued: 12,
        upcoming: ['Mathematics Assignment due Friday', 'Science Lab Report due Monday']
      }
    },
    
    // Senior Secondary classes
    {
      id: 'f4-2',
      name: 'Form 4 Science',
      description: 'Final year science stream preparing for KCSE',
      instructor: 'Dr. Elizabeth Wangari',
      schedule: {
        days: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
        time: '7:30 AM - 4:30 PM',
        venue: 'Science Block, Room 3'
      },
      students: 24,
      status: 'active',
      level: 'senior-secondary',
      grade: 'grade10',
      stream: 'A',
      gradeType: 'F4',
      ageGroup: '17-18 years',
      examPreparation: {
        mockExams: 3,
        nextMockDate: '2023-07-15',
        revisionSessions: 12,
        performanceTrend: 'improving',
        targetAreas: ['Calculus', 'Organic Chemistry', 'Physics Practicals']
      }
    },
    {
      id: 'f5-1',
      name: 'Form 5 Humanities',
      description: 'Advanced level humanities focused on arts and literature',
      instructor: 'Prof. John Mwaura',
      schedule: {
        days: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
        time: '8:00 AM - 4:00 PM',
        venue: 'Humanities Block, Room 2'
      },
      students: 18,
      status: 'scheduled',
      level: 'senior-secondary',
      grade: 'grade11',
      stream: 'B',
      gradeType: 'F5',
      ageGroup: '18-19 years'
    },
    {
      id: 'f6-s',
      name: 'Form 6 Special',
      description: 'Final year advanced level studies for university preparation',
      instructor: 'Dr. Mary Otieno',
      schedule: {
        days: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
        time: '7:30 AM - 5:00 PM',
        venue: 'Advanced Studies Center'
      },
      students: 15,
      status: 'inactive',
      level: 'senior-secondary',
      grade: 'grade12',
      stream: 'D',
      gradeType: 'F6',
      ageGroup: '19-20 years'
    },
    {
      id: 'cls-inactive',
      name: 'French (Inactive)',
      description: 'This class is currently not in session',
      instructor: 'Mrs. Claire Omondi',
      schedule: {
        days: ['Tuesday', 'Thursday'],
        time: '2:00 PM - 3:30 PM',
        venue: 'Room 18'
      },
      students: 0,
      status: 'inactive',
      level: 'senior-secondary',
      grade: 'grade12',
      stream: 'C',
      gradeType: 'F6',
      ageGroup: '19-20 years'
    }
  ];

export function getComponentLevelColor(level: EducationLevel) {
  switch(level) {
    case 'preschool':
      return 'bg-purple-600 hover:bg-purple-700'
    case 'primary':
      return 'bg-blue-600 hover:bg-blue-700'
    case 'junior-secondary':
      return 'bg-yellow-600 hover:bg-yellow-700'
    case 'senior-secondary':
      return 'bg-red-600 hover:bg-red-700'
    default:
      return 'bg-gray-600 hover:bg-gray-700'
  }
}

export function getStreamsForGrade(gradeId: string): string[] {
  if (gradeId === 'all') {
    return []
  }
  
  const streamsSet = new Set<string>()
  mockClasses.forEach(cls => {
    if (cls.grade === gradeId) {
      streamsSet.add(cls.stream)
    }
  })
  
  return Array.from(streamsSet).sort()
}

export function getGradeStreamAbbr(grade: Grade, stream: string): string {
  return `${grade.name}-${stream}`
}