// --- New: Mock Student Data (Simplified for linking purposes) ---
export const mockStudents = [
    // For Baby Class A
    { id: 's-bc-a-001', firstName: 'Mwangi', lastName: 'Njeri', currentClassId: 'bc-english' },
    { id: 's-bc-a-002', firstName: 'Fatuma', lastName: 'Ali', currentClassId: 'bc-english' },
    { id: 's-bc-a-003', firstName: 'Kimani', lastName: 'Ochieng', currentClassId: 'bc-english' },
  
    // For Grade 3 Beta
    { id: 's-g3-b-001', firstName: 'Jane', lastName: 'Mwangi', currentClassId: 'g3-2' }, // Prefect
    { id: 's-g3-b-002', firstName: 'Robert', lastName: 'Kiprop', currentClassId: 'g3-2' }, // Asst Prefect
    { id: 's-g3-b-003', firstName: 'Michael', lastName: 'Omondi', currentClassId: 'g3-2' }, // Timekeeper
    { id: 's-g3-b-004', firstName: 'Lucy', lastName: 'Achieng', currentClassId: 'g3-2' }, // Class Monitor (English)
    { id: 's-g3-b-005', firstName: 'Daniel', lastName: 'Wekesa', currentClassId: 'g3-2' }, // Class Monitor (Math)
    { id: 's-g3-b-006', firstName: 'Grace', lastName: 'Muthoni', currentClassId: 'g3-2' }, // Top Student
    { id: 's-g3-b-007', firstName: 'Peter', lastName: 'Kariuki', currentClassId: 'g3-2' },
    { id: 's-g3-b-008', firstName: 'Naomi', lastName: 'Wanjiku', currentClassId: 'g3-2' },
  
    // For Grade 1 Alpha (fees pending example)
    { id: 's-g1-a-001', firstName: 'John', lastName: 'Doe', currentClassId: 'g1-1' },
    { id: 's-g1-a-002', firstName: 'Mary', lastName: 'Smith', currentClassId: 'g1-1' },
    { id: 's-g1-a-003', firstName: 'James', lastName: 'Brown', currentClassId: 'g1-1' },
    { id: 's-g1-a-004', firstName: 'Patricia', lastName: 'Davis', currentClassId: 'g1-1' },
    { id: 's-g1-a-005', firstName: 'Charles', lastName: 'Miller', currentClassId: 'g1-1' },
    // Students with pending fees for G1 Alpha
    { id: 's-g1-a-fee-01', firstName: 'David', lastName: 'Garcia', currentClassId: 'g1-1' },
    { id: 's-g1-a-fee-02', firstName: 'Linda', lastName: 'Rodriguez', currentClassId: 'g1-1' },
    { id: 's-g1-a-fee-03', firstName: 'Richard', lastName: 'Martinez', currentClassId: 'g1-1' },
    { id: 's-g1-a-fee-04', firstName: 'Susan', lastName: 'Hernandez', currentClassId: 'g1-1' },
  
    // For Form 1 East
    { id: 's-f1-e-001', firstName: 'Mercy', lastName: 'Wambui', currentClassId: 'f1-1' }, // Top Student
    { id: 's-f1-e-002', firstName: 'Collins', lastName: 'Muriuki', currentClassId: 'f1-1' },
    { id: 's-f1-e-003', firstName: 'Brenda', lastName: 'Cherono', currentClassId: 'f1-1' },
    { id: 's-f1-e-004', firstName: 'Kevin', lastName: 'Owino', currentClassId: 'f1-1' },
    { id: 's-f1-e-005', firstName: 'Sharon', lastName: 'Akinyi', currentClassId: 'f1-1' },
    { id: 's-f1-e-disc-01', firstName: 'Student', lastName: 'X', currentClassId: 'f1-1' }, // For discipline incident
  
    // For Form 4 Science
    { id: 's-f4-s-001', firstName: 'Emmanuel', lastName: 'Njuguna', currentClassId: 'f4-2' }, // Top Student
    { id: 's-f4-s-002', firstName: 'Esther', lastName: 'Kilonzo', currentClassId: 'f4-2' }, // Top Student
    { id: 's-f4-s-003', firstName: 'Gladys', lastName: 'Mumo', currentClassId: 'f4-2' },
    { id: 's-f4-s-004', firstName: 'Victor', lastName: 'Onyango', currentClassId: 'f4-2' },
  ];
  
  // Re-export the existing types and utilities (from previous response)
  export enum EducationLevelEnum {
    Preschool = 'preschool',
    Primary = 'primary',
    JuniorSecondary = 'junior-secondary',
    SeniorSecondary = 'senior-secondary',
    All = 'all',
  }
  
  export type EducationLevel =
    | 'preschool'
    | 'primary'
    | 'lower-primary'
    | 'upper-primary'
    | 'junior-secondary'
    | 'senior-secondary'
    | 'all';
  
  export type CBCStage =
    | 'early-years-education'
    | 'middle-school'
    | 'junior-secondary-school'
    | 'senior-secondary-school';
  
  export type AcademicTerm = 'Term 1' | 'Term 2' | 'Term 3';
  export type AcademicYear = string;
  
  export interface Schedule {
    days: ('Monday' | 'Tuesday' | 'Wednesday' | 'Thursday' | 'Friday' | 'Saturday' | 'Sunday')[];
    startTime: string;
    endTime: string;
    venue?: string;
    frequency?: 'daily' | 'weekly' | 'bi-weekly' | 'one-time';
    date?: string;
  }
  
  export interface Subject {
    id: string;
    name: string;
    code: string;
    description?: string;
    level: EducationLevel | EducationLevel[];
    core: boolean;
    curriculumOutline?: string[];
    assessmentMethods?: string[];
  }
  
  export interface Teacher {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    phone?: string;
    employeeId: string;
    qualifications: string[];
    subjectsTaught: string[];
    classesAssigned: string[];
    educationLevelTaught: EducationLevel[];
    profileImageSrc?: string;
    bio?: string;
    department?: string;
    hireDate?: string;
    studentFeedbackRating?: number;
    attendanceRecord?: {
      totalTeachingHours: number;
      hoursAbsent: number;
    };
  }
  
  export interface Student {
    id: string;
    firstName: string;
    lastName: string;
    dateOfBirth?: string;
    gender?: 'Male' | 'Female' | 'Other';
    admissionNumber?: string;
    currentGradeId?: string;
    currentClassId?: string;
    parentContact?: {
      name: string;
      phone: string;
      email?: string;
    };
    medicalConditions?: string[];
    allergies?: string[];
    photoUrl?: string;
  }
  
  export interface Campus {
    id: string;
    name: string;
    location: string;
    address: string;
    contactEmail: string;
    contactPhone: string;
    principal?: string;
    gradesOffered: EducationLevel[];
    facilities?: string[];
  }
  
  export interface Grade {
    id: string;
    name: string;
    displayName: string;
    level: EducationLevel;
    ageGroup: string;
    students: number;
    classes: number;
    schedule: Schedule;
    curriculumAdopted?: string;
    gradeCoordinatorId?: string;
    associatedSubjects?: string[];
    averagePerformanceHistory?: { year: string, averageGrade: string }[];
  }
  
  export interface Class {
    id: string;
    name: string;
    description: string;
    instructorId: string;
    schedule: Schedule;
    students: number;
    status: 'active' | 'inactive' | 'scheduled' | 'cancelled';
    level: EducationLevel;
    grade: string;
    stream: string;
    gradeType: string;
    ageGroup: string;
    imageSrc?: string;
    genderBreakdown?: {
      male: number;
      female: number;
      other?: number;
    };
    currentLesson?: {
      subjectId: string;
      teacherId: string;
      startTime: string;
      endTime: string;
      topic: string;
      room: string;
    };
    classTeacherId?: string;
    classLeadership?: {
      prefectId?: string;
      assistantPrefectId?: string;
      timekeeperId?: string;
      classMonitors?: string[]; // Array of Student IDs
      subjectMonitors?: Record<string, string>; // Subject ID -> Student ID
    };
    academicPerformance?: {
      averageGrade: string;
      overallPerformance: 'Outstanding' | 'Above Average' | 'Average' | 'Below Average' | 'Needs Improvement';
      improvement: number;
      ranking: number;
      totalStudentsInRankedGroup?: number;
      totalClasses: number;
      previousTerm?: {
        averageGrade: string;
        ranking: number;
        academicTerm: AcademicTerm;
        academicYear: AcademicYear;
      };
      topStudents?: string[]; // Array of Student IDs
      subjectPerformance?: Record<string, {
        averageScore: number;
        highestScore: number;
        lowestScore: number;
        gradeDistribution?: { [grade: string]: number }; // e.g., { 'A': 5, 'B': 10 }
      }>;
      targetMeanScore?: number; // e.g., for KCPE/KCSE
    };
    attendance?: {
      rate: string;
      present: number;
      absent: number;
      onLeave: number;
      total: number;
      absentToday?: number;
      absentThisWeek?: number;
      presentToday?: number; // Students present today
      lateToday?: number; // Students who arrived late today
      absences?: { // Breakdown of absence types
        excused: number;
        unexcused: number;
        medical: number;
        total: number;
      };
      trend?: 'improving' | 'stable' | 'declining';
      lastUpdated?: string;
      dailyAttendance?: { date: string, present: number, absent: number }[]; // Added daily breakdown
      frequentAbsentees?: { student: string; days: number }[]; // Students with frequent absences
      absentStudents?: { student: string; reason?: string }[]; // Students absent today
    };
    fees?: {
      billed: number; // Total amount billed for the term/year
      paid: number; // Total amount paid by all students in the class
      pending: number; // Total amount outstanding
      currency: string; // Currency code e.g., KES, USD, etc.
      unpaidCount: number; // Number of students with ANY pending fees
      clearedCount?: number; // Number of students who have cleared fees for the current billing period
      studentsPendingFees?: string[]; // Array of Student IDs with pending fees
      lastPaymentDate?: string; // Latest payment date recorded for any student in the class
      nextPaymentDeadline?: string; // YYYY-MM-DD
      paymentBreakdown?: {
        studentId: string;
        billedAmount: number;
        paidAmount: number;
        pendingAmount: number;
        status: 'Cleared' | 'Partial' | 'Pending';
        lastPaymentDate?: string;
      }[]; // Comprehensive breakdown per student
      paymentRemindersSentCount?: number;
      averageDaysOverdue?: number;
    };
    meetings?: {
      upcoming: {
        title: string;
        date: string;
        time: string;
        venue?: string;
        attendees?: string[];
      }[];
      pastCount: number;
    };
    clubs?: string[];
    assignments?: {
      total: number;
      submitted: number;
      pending: number;
      graded: number;
      issued: number;
      upcoming: {
        id: string;
        title: string;
        dueDate: string;
        subjectId: string;
      }[];
      overdueCount?: number;
      averageSubmissionRate?: string; // e.g., "85%"
    };
    discipline?: {
      warningReports: number;
      suspensions: number;
      severity: 'High' | 'Medium' | 'Low' | 'None';
      incidentsLog?: {
        date: string;
        type: string;
        description: string;
        actionTaken: string;
        studentId: string;
        reportedBy?: string; // Teacher ID
      }[];
      commonIssues?: string[]; // e.g., ['Lateness', 'Noise in class']
    };
    coCurricular?: {
      activities: {
        name: string;
        role: string;
        achievements?: string[];
      }[];
      competitions?: {
        name: string;
        level: 'school' | 'zonal' | 'county' | 'regional' | 'national' | 'international';
        date: string;
        status: 'upcoming' | 'completed' | 'cancelled';
        result?: string;
      }[];
      participationRate?: string; // e.g., "75%"
    };
    kcpePerformanceMean?: string;
    kcseMean?: string;
    streamName?: string;
    examRanking?: {
      internalRank: number;
      zonalPosition?: number;
      countyPosition?: number;
      nationalPosition?: number;
      examType?: 'KCPE' | 'KCSE' | 'Internal Mock';
      year?: AcademicYear;
    };
    clubsRepresentation?: string[];
    parentsMeeting?: {
      nextDate: string;
      agenda: string;
      venue: string;
      time: string;
    };
    classTeacherRemarks?: string;
    examPreparation?: {
      mockExams: number;
      nextMockDate: string;
      revisionSessions: number;
      performanceTrend: 'improving' | 'stable' | 'declining';
      targetAreas: string[];
      preparationSchedule?: {
        title: string;
        date: string;
        time: string;
        description?: string;
      }[];
      resourcesSharedCount?: number;
    };
    classResources?: {
      textbooks: { title: string, author: string, isbn?: string }[];
      digitalResources?: { name: string, url: string, type: 'video' | 'document' | 'website' }[];
      materialsRequired?: string[];
    };
    announcements?: {
      id: string;
      title: string;
      message: string;
      date: string;
      authorId: string;
      importance?: 'High' | 'Medium' | 'Low';
    }[];
    communicationChannels?: {
      platform: 'WhatsApp' | 'Telegram' | 'Email Group' | 'School Portal' | 'SMS';
      link: string;
      isActive: boolean;
    }[];
    classGoals?: string[];
    feedbackForms?: {
      title: string;
      link: string;
      dueDate?: string;
      status: 'Open' | 'Closed';
      responsesCount?: number;
    }[];
  }
  
  export const mockTeachers: Teacher[] = [
    {
      id: 't-alice-mwangi',
      firstName: 'Alice',
      lastName: 'Mwangi',
      email: 'alice.mwangi@school.com',
      employeeId: 'EMP001',
      qualifications: ['B.Ed Early Childhood Education'],
      subjectsTaught: ['sub-eng-preschool', 'sub-cre-arts'],
      classesAssigned: ['bc-english', 'pp1-1'],
      educationLevelTaught: ['preschool'],
      department: 'Early Years',
    },
    {
      id: 't-david-wilson',
      firstName: 'David',
      lastName: 'Wilson',
      email: 'david.wilson@school.com',
      employeeId: 'EMP002',
      qualifications: ['B.Ed Early Childhood Education'],
      subjectsTaught: [],
      classesAssigned: ['bc-2'],
      educationLevelTaught: ['preschool'],
      department: 'Early Years',
    },
    {
      id: 't-sarah-johnson',
      firstName: 'Sarah',
      lastName: 'Johnson',
      email: 'sarah.johnson@school.com',
      employeeId: 'EMP003',
      qualifications: ['B.Ed Primary Education'],
      subjectsTaught: ['sub-math-preschool', 'sub-sci-primary'],
      classesAssigned: ['pp1-1'],
      educationLevelTaught: ['preschool', 'primary'],
      department: 'Early Years',
    },
    {
      id: 't-rebecca-smith',
      firstName: 'Rebecca',
      lastName: 'Smith',
      email: 'rebecca.smith@school.com',
      employeeId: 'EMP004',
      qualifications: ['B.Ed Primary Education'],
      subjectsTaught: ['sub-eng-primary', 'sub-math-primary', 'sub-kisw-primary'],
      classesAssigned: ['g1-1'],
      educationLevelTaught: ['primary'],
      department: 'Primary',
    },
    {
      id: 't-james-ochieng',
      firstName: 'James',
      lastName: 'Ochieng',
      email: 'james.ochieng@school.com',
      employeeId: 'EMP005',
      qualifications: ['B.Sc Environmental Science', 'PGDE'],
      subjectsTaught: ['sub-env-studies', 'sub-social-studies'],
      classesAssigned: ['g3-2'],
      educationLevelTaught: ['primary'],
      department: 'Primary',
    },
    {
      id: 't-samuel-njoroge',
      firstName: 'Samuel',
      lastName: 'Njoroge',
      email: 'samuel.njoroge@school.com',
      employeeId: 'EMP006',
      qualifications: ['B.Ed Mathematics & Physics'],
      subjectsTaught: ['sub-math-js', 'sub-physics-js'],
      classesAssigned: ['f1-1'],
      educationLevelTaught: ['junior-secondary'],
      department: 'Junior Secondary',
    },
    {
      id: 't-elizabeth-wangari',
      firstName: 'Elizabeth',
      lastName: 'Wangari',
      email: 'elizabeth.wangari@school.com',
      employeeId: 'EMP007',
      qualifications: ['Ph.D. Chemistry', 'B.Sc. Biology'],
      subjectsTaught: ['sub-chemistry-ss', 'sub-biology-ss', 'sub-physics-ss'],
      classesAssigned: ['f4-2'],
      educationLevelTaught: ['senior-secondary'],
      department: 'Senior Secondary',
    },
    {
      id: 't-john-mwaura',
      firstName: 'John',
      lastName: 'Mwaura',
      email: 'john.mwaura@school.com',
      employeeId: 'EMP008',
      qualifications: ['M.A. Literature', 'B.A. History'],
      subjectsTaught: ['sub-literature-ss', 'sub-history-ss', 'sub-geography-ss'],
      classesAssigned: ['f5-1'],
      educationLevelTaught: ['senior-secondary'],
      department: 'Senior Secondary',
    },
    {
      id: 't-mary-otieno',
      firstName: 'Mary',
      lastName: 'Otieno',
      email: 'mary.otieno@school.com',
      employeeId: 'EMP009',
      qualifications: ['M.Ed. Curriculum Development'],
      subjectsTaught: [],
      classesAssigned: ['f6-s'],
      educationLevelTaught: ['senior-secondary'],
      department: 'Senior Secondary',
    },
    {
      id: 't-claire-omondi',
      firstName: 'Claire',
      lastName: 'Omondi',
      email: 'claire.omondi@school.com',
      employeeId: 'EMP010',
      qualifications: ['B.A. French'],
      subjectsTaught: ['sub-french-ss'],
      classesAssigned: ['cls-inactive'],
      educationLevelTaught: ['senior-secondary'],
      department: 'Languages',
    },
  ];
  
  export const mockSubjects: Subject[] = [
    { id: 'sub-eng-preschool', name: 'English', code: 'ENG-PS', level: 'preschool', core: true },
    { id: 'sub-math-preschool', name: 'Mathematics', code: 'MATH-PS', level: 'preschool', core: true },
    { id: 'sub-cre-arts', name: 'Creative Arts', code: 'CRE-ARTS', level: 'preschool', core: true },
    { id: 'sub-env-activities', name: 'Environmental Activities', code: 'ENV-ACT', level: 'preschool', core: true },
  
    { id: 'sub-eng-primary', name: 'English', code: 'ENG-P', level: 'primary', core: true },
    { id: 'sub-kisw-primary', name: 'Kiswahili', code: 'KISW-P', level: 'primary', core: true },
    { id: 'sub-math-primary', name: 'Mathematics', code: 'MATH-P', level: 'primary', core: true },
    { id: 'sub-sci-primary', name: 'Integrated Science', code: 'SCI-P', level: 'primary', core: true },
    { id: 'sub-social-studies', name: 'Social Studies', code: 'SOS-P', level: 'primary', core: true },
    { id: 'sub-hpe-primary', name: 'Health & Physical Education', code: 'HPE-P', level: 'primary', core: true },
    { id: 'sub-cre-primary', name: 'Christian Religious Education', code: 'CRE-P', level: 'primary', core: false },
    { id: 'sub-ire-primary', name: 'Islamic Religious Education', code: 'IRE-P', level: 'primary', core: false },
    { id: 'sub-h-e-primary', name: 'Home Science & Agriculture', code: 'HSA-P', level: 'primary', core: false },
  
    { id: 'sub-math-js', name: 'Mathematics', code: 'MATH-JS', level: 'junior-secondary', core: true },
    { id: 'sub-eng-js', name: 'English', code: 'ENG-JS', level: 'junior-secondary', core: true },
    { id: 'sub-kisw-js', name: 'Kiswahili', code: 'KISW-JS', level: 'junior-secondary', core: true },
    { id: 'sub-ira-js', name: 'Integrated Science', code: 'IRA-JS', level: 'junior-secondary', core: true },
    { id: 'sub-social-js', name: 'Social Studies', code: 'SOC-JS', level: 'junior-secondary', core: true },
    { id: 'sub-pre-arts', name: 'Pre-Technical Studies', code: 'PRE-TEC', level: 'junior-secondary', core: false },
    { id: 'sub-cre-js', name: 'CRE', code: 'CRE-JS', level: 'junior-secondary', core: false },
  
    { id: 'sub-physics-ss', name: 'Physics', code: 'PHY-SS', level: 'senior-secondary', core: false },
    { id: 'sub-chemistry-ss', name: 'Chemistry', code: 'CHEM-SS', level: 'senior-secondary', core: false },
    { id: 'sub-biology-ss', name: 'Biology', code: 'BIO-SS', level: 'senior-secondary', core: false },
    { id: 'sub-math-ss', name: 'Mathematics', code: 'MATH-SS', level: 'senior-secondary', core: true },
    { id: 'sub-eng-ss', name: 'English', code: 'ENG-SS', level: 'senior-secondary', core: true },
    { id: 'sub-kisw-ss', name: 'Kiswahili', code: 'KISW-SS', level: 'senior-secondary', core: true },
    { id: 'sub-literature-ss', name: 'Literature in English', code: 'LIT-ENG-SS', level: 'senior-secondary', core: false },
    { id: 'sub-history-ss', name: 'History', code: 'HIST-SS', level: 'senior-secondary', core: false },
    { id: 'sub-geography-ss', name: 'Geography', code: 'GEO-SS', level: 'senior-secondary', core: false },
    { id: 'sub-cre-ss', name: 'CRE', code: 'CRE-SS', level: 'senior-secondary', core: false },
    { id: 'sub-business-ss', name: 'Business Studies', code: 'BUS-SS', level: 'senior-secondary', core: false },
    { id: 'sub-computer-ss', name: 'Computer Studies', code: 'COMP-SS', level: 'senior-secondary', core: false },
    { id: 'sub-french-ss', name: 'French', code: 'FRE-SS', level: 'senior-secondary', core: false },
  ];
  
  export const mockGrades: Grade[] = [
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
        startTime: '8:00 AM',
        endTime: '12:00 PM',
        venue: 'Preschool Block'
      },
      curriculumAdopted: 'CBC Early Years Education'
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
        startTime: '8:00 AM',
        endTime: '12:00 PM',
        venue: 'Preschool Block'
      },
      curriculumAdopted: 'CBC Early Years Education'
    },
    {
      id: '',
      name: 'PP2',
      displayName: 'PP2',
      level: 'preschool',
      ageGroup: '5 years',
      students: 48,
      classes: 2,
      schedule: {
        days: ['Monday', 'Wednesday', 'Friday'],
        startTime: '8:00 AM',
        endTime: '12:00 PM',
        venue: 'Preschool Block'
      },
      curriculumAdopted: 'CBC Early Years Education'
    },
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
        startTime: '8:00 AM',
        endTime: '3:00 PM',
        venue: 'Primary Block'
      },
      curriculumAdopted: 'CBC Lower Primary'
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
        startTime: '8:00 AM',
        endTime: '3:00 PM',
        venue: 'Primary Block'
      },
      curriculumAdopted: 'CBC Lower Primary'
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
        startTime: '8:00 AM',
        endTime: '3:00 PM',
        venue: 'Primary Block'
      },
      curriculumAdopted: 'CBC Lower Primary'
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
        startTime: '8:00 AM',
        endTime: '3:00 PM',
        venue: 'Primary Block'
      },
      curriculumAdopted: 'CBC Upper Primary'
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
        startTime: '8:00 AM',
        endTime: '3:00 PM',
        venue: 'Primary Block'
      },
      curriculumAdopted: 'CBC Upper Primary'
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
        startTime: '8:00 AM',
        endTime: '3:00 PM',
        venue: 'Primary Block'
      },
      curriculumAdopted: 'CBC Upper Primary'
    },
    {
      id: 'grade7',
      name: 'JSS1',
      displayName: 'Junior Secondary 1',
      level: 'junior-secondary',
      ageGroup: '12 years',
      students: 86,
      classes: 3,
      schedule: {
        days: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
        startTime: '8:00 AM',
        endTime: '3:00 PM',
        venue: 'Junior Secondary Block'
      },
      curriculumAdopted: 'CBC Junior Secondary'
    },
    {
      id: 'grade8',
      name: 'JSS2',
      displayName: 'Junior Secondary 2',
      level: 'junior-secondary',
      ageGroup: '13 years',
      students: 78,
      classes: 3,
      schedule: {
        days: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
        startTime: '8:00 AM',
        endTime: '3:00 PM',
        venue: 'Junior Secondary Block'
      },
      curriculumAdopted: 'CBC Junior Secondary'
    },
    {
      id: 'grade9',
      name: 'JSS3',
      displayName: 'Junior Secondary 3',
      level: 'junior-secondary',
      ageGroup: '14 years',
      students: 72,
      classes: 2,
      schedule: {
        days: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
        startTime: '8:00 AM',
        endTime: '3:00 PM',
        venue: 'Junior Secondary Block'
      },
      curriculumAdopted: 'CBC Junior Secondary'
    },
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
        startTime: '8:00 AM',
        endTime: '3:00 PM',
        venue: 'Senior Secondary Block'
      },
      curriculumAdopted: '8-4-4'
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
        startTime: '8:00 AM',
        endTime: '3:00 PM',
        venue: 'Senior Secondary Block'
      },
      curriculumAdopted: '8-4-4'
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
        startTime: '8:00 AM',
        endTime: '3:00 PM',
        venue: 'Senior Secondary Block'
      },
      curriculumAdopted: '8-4-4'
    }
  ];
  
  export const mockClasses: Class[] = [
    // Preschool classes
    {
      id: 'bc-english',
      name: 'Baby Class English',
      description: 'Fundamental language skills for the youngest learners',
      instructorId: 't-alice-mwangi',
      schedule: {
        days: ['Monday', 'Wednesday', 'Friday'],
        startTime: '8:00 AM',
        endTime: '9:30 AM',
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
        subjectId: 'sub-cre-arts',
        teacherId: 't-alice-mwangi',
        startTime: '9:30 AM',
        endTime: '10:15 AM',
        topic: 'Colors and Shapes',
        room: 'Room 1'
      },
      classTeacherId: 't-alice-mwangi',
      // Comprehensive Attendance Data
      attendance: {
        rate: '92%',
        present: 20,
        absent: 2,
        onLeave: 0,
        total: 22,
        trend: 'stable',
        lastUpdated: '2025-06-20 12:00:00',
        absentToday: 2,
        absentThisWeek: 3,
        dailyAttendance: [
          { date: '2025-06-16', present: 21, absent: 1 },
          { date: '2025-06-17', present: 20, absent: 2 },
          { date: '2025-06-18', present: 21, absent: 1 },
          { date: '2025-06-19', present: 20, absent: 2 },
          { date: '2025-06-20', present: 20, absent: 2 },
        ]
      },
      // Comprehensive Fees Section
      fees: {
        billed: 25000,
        paid: 23000,
        pending: 2000,
        currency: "KES",
        unpaidCount: 2,
        clearedCount: 20,
        studentsPendingFees: ['s-bc-a-001', 's-bc-a-002'],
        lastPaymentDate: '2025-06-15',
        nextPaymentDeadline: '2025-07-01',
        paymentBreakdown: [
          { studentId: 's-bc-a-001', billedAmount: 1250, paidAmount: 1000, pendingAmount: 250, status: 'Partial', lastPaymentDate: '2025-06-10' },
          { studentId: 's-bc-a-002', billedAmount: 1250, paidAmount: 800, pendingAmount: 450, status: 'Partial', lastPaymentDate: '2025-06-05' },
          { studentId: 's-bc-a-003', billedAmount: 1250, paidAmount: 1250, pendingAmount: 0, status: 'Cleared', lastPaymentDate: '2025-06-01' },
          // ... (add for all 22 students, simplified here)
        ],
        paymentRemindersSentCount: 5,
        averageDaysOverdue: 10,
      },
      // Academic Performance (basic for preschool)
      academicPerformance: {
        averageGrade: 'Excellent',
        overallPerformance: 'Outstanding',
        improvement: 10, // Not applicable for preschool usually, but showing structure
        ranking: 1, // Not strictly ranked
        totalStudentsInRankedGroup: 22,
        totalClasses: 1,
        previousTerm: {
          averageGrade: 'Very Good',
          ranking: 1,
          academicTerm: 'Term 1',
          academicYear: '2024/2025'
        },
        subjectPerformance: {
          'sub-eng-preschool': { averageScore: 90, highestScore: 98, lowestScore: 80 },
          'sub-cre-arts': { averageScore: 95, highestScore: 100, lowestScore: 85 }
        }
      },
      announcements: [
        {
          id: 'ann-bc-001',
          title: 'Teddy Bear Picnic',
          message: 'Remember to bring your favorite teddy bear for our picnic on Friday!',
          date: '2025-06-18',
          authorId: 't-alice-mwangi',
          importance: 'High'
        }
      ]
    },
    {
      id: 'bc-2',
      name: 'Baby Class B',
      description: 'Early development with focus on social skills',
      instructorId: 't-david-wilson',
      schedule: {
        days: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
        startTime: '8:00 AM',
        endTime: '12:00 PM',
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
      },
      attendance: {
        rate: '90%',
        present: 18,
        absent: 2,
        onLeave: 0,
        total: 20,
        trend: 'declining',
        lastUpdated: '2025-06-20 12:00:00',
        absentToday: 2,
        absentThisWeek: 4,
      },
      fees: {
        billed: 25000,
        paid: 24000,
        pending: 1000,
        currency: "KES",
        unpaidCount: 1,
        clearedCount: 19,
        studentsPendingFees: ['s-bc-a-001'], // Placeholder, would be specific to this class
        lastPaymentDate: '2025-06-18',
        nextPaymentDeadline: '2025-07-01',
        paymentBreakdown: [], // Simplified
      },
      academicPerformance: {
        averageGrade: 'Good',
        overallPerformance: 'Above Average',
        improvement: 5,
        ranking: 1,
        totalStudentsInRankedGroup: 20,
        totalClasses: 1,
      }
    },
  
    // PP1 classes
    {
      id: 'pp1-1',
      name: 'PP1 Morning',
      description: 'Pre-primary 1 with focus on early literacy',
      instructorId: 't-sarah-johnson',
      schedule: {
        days: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
        startTime: '8:00 AM',
        endTime: '12:30 PM',
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
        totalStudentsInRankedGroup: 24,
        totalClasses: 4,
        previousTerm: {
          averageGrade: 'B',
          ranking: 3,
          academicTerm: 'Term 1',
          academicYear: '2024/2025'
        },
        subjectPerformance: {
          'sub-eng-preschool': { averageScore: 85, highestScore: 95, lowestScore: 70, gradeDistribution: { 'A': 10, 'B': 8, 'C': 6 } },
          'sub-math-preschool': { averageScore: 78, highestScore: 90, lowestScore: 65, gradeDistribution: { 'A': 5, 'B': 12, 'C': 7 } }
        }
      },
      attendance: {
        rate: '95%',
        present: 22,
        absent: 1,
        onLeave: 1,
        total: 24,
        trend: 'improving',
        lastUpdated: '2025-06-20 12:00:00',
        absentToday: 1,
        absentThisWeek: 2,
      },
      fees: {
        billed: 30000,
        paid: 29000,
        pending: 1000,
        currency: "KES",
        unpaidCount: 1,
        clearedCount: 23,
        studentsPendingFees: ['s-bc-a-001'], // Placeholder
        lastPaymentDate: '2025-06-19',
        nextPaymentDeadline: '2025-07-05',
        paymentBreakdown: [], // Simplified
      },
    },
  
    // Primary classes
    {
      id: 'g1-1',
      name: 'Grade 1 Alpha',
      description: 'Foundation class focusing on core literacy and numeracy',
      instructorId: 't-rebecca-smith',
      schedule: {
        days: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
        startTime: '8:00 AM',
        endTime: '3:00 PM',
        venue: 'Room 4'
      },
      students: 32,
      status: 'active',
      level: 'primary',
      grade: 'grade1',
      stream: 'A',
      gradeType: 'G1',
      ageGroup: '6 years',
      classTeacherId: 't-rebecca-smith',
      // Comprehensive Fees Section
      fees: {
        billed: 45000 * 32, // Total for all students
        paid: (45000 * 28) + (38000 % 45000), // Assuming 28 cleared, 4 partially paid
        pending: 45000 * 4 - (38000 % 45000), // Sum of pending for 4 students
        currency: "KES",
        unpaidCount: 4,
        clearedCount: 28,
        studentsPendingFees: ['s-g1-a-fee-01', 's-g1-a-fee-02', 's-g1-a-fee-03', 's-g1-a-fee-04'],
        lastPaymentDate: '2025-06-17',
        nextPaymentDeadline: '2025-06-30',
        paymentBreakdown: [
          { studentId: 's-g1-a-fee-01', billedAmount: 45000, paidAmount: 30000, pendingAmount: 15000, status: 'Partial', lastPaymentDate: '2025-06-10' },
          { studentId: 's-g1-a-fee-02', billedAmount: 45000, paidAmount: 25000, pendingAmount: 20000, status: 'Partial', lastPaymentDate: '2025-06-05' },
          { studentId: 's-g1-a-fee-03', billedAmount: 45000, paidAmount: 40000, pendingAmount: 5000, status: 'Partial', lastPaymentDate: '2025-06-17' },
          { studentId: 's-g1-a-fee-04', billedAmount: 45000, paidAmount: 15000, pendingAmount: 30000, status: 'Partial', lastPaymentDate: '2025-05-20' },
          // ... (add for all other 28 cleared students)
        ],
        paymentRemindersSentCount: 8,
        averageDaysOverdue: 25,
      },
      // Academic Performance
      academicPerformance: {
        averageGrade: 'C+',
        overallPerformance: 'Average',
        improvement: 2,
        ranking: 15,
        totalStudentsInRankedGroup: 32,
        totalClasses: 5,
        previousTerm: {
          averageGrade: 'C',
          ranking: 18,
          academicTerm: 'Term 2',
          academicYear: '2023/2024'
        },
        topStudents: ['s-g1-a-001', 's-g1-a-002'],
        subjectPerformance: {
          'sub-eng-primary': { averageScore: 68, highestScore: 85, lowestScore: 40, gradeDistribution: { 'A': 2, 'B': 8, 'C': 15, 'D': 7 } },
          'sub-math-primary': { averageScore: 72, highestScore: 90, lowestScore: 50, gradeDistribution: { 'A': 4, 'B': 10, 'C': 12, 'D': 6 } }
        }
      },
      // Attendance
      attendance: {
        rate: '88%',
        present: 28,
        absent: 4,
        onLeave: 0,
        total: 32,
        trend: 'stable',
        lastUpdated: '2025-06-20 16:00:00',
        absentToday: 4,
        absentThisWeek: 8,
        dailyAttendance: [
          { date: '2025-06-16', present: 30, absent: 2 },
          { date: '2025-06-17', present: 29, absent: 3 },
          { date: '2025-06-18', present: 28, absent: 4 },
          { date: '2025-06-19', present: 30, absent: 2 },
          { date: '2025-06-20', present: 28, absent: 4 },
        ]
      },
      classResources: {
        textbooks: [{ title: 'Nelson English Grade 1', author: 'Longhorn Publishers' }],
        digitalResources: [{ name: 'Grade 1 Math Games', url: 'https://example.com/math-games', type: 'website' }]
      }
    },
    {
      id: 'g3-2',
      name: 'Grade 3 Beta',
      description: 'Intermediate primary with environmental studies focus',
      instructorId: 't-james-ochieng',
      schedule: {
        days: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
        startTime: '8:00 AM',
        endTime: '3:30 PM',
        venue: 'Room 7'
      },
      students: 28,
      status: 'active',
      level: 'primary',
      grade: 'grade3',
      stream: 'B',
      gradeType: 'G3',
      ageGroup: '8 years',
      classTeacherId: 't-james-ochieng',
      // Class Leadership
      classLeadership: {
        prefectId: 's-g3-b-001',
        assistantPrefectId: 's-g3-b-002',
        timekeeperId: 's-g3-b-003',
        classMonitors: ['s-g3-b-004', 's-g3-b-005'],
        subjectMonitors: {
          'sub-eng-primary': 's-g3-b-004',
          'sub-math-primary': 's-g3-b-005'
        }
      },
      // Academic Performance
      academicPerformance: {
        averageGrade: 'B',
        overallPerformance: 'Above Average',
        improvement: 3,
        ranking: 8,
        totalStudentsInRankedGroup: 28,
        totalClasses: 4,
        previousTerm: {
          averageGrade: 'B-',
          ranking: 10,
          academicTerm: 'Term 2',
          academicYear: '2023/2024'
        },
        topStudents: ['s-g3-b-006', 's-g3-b-001'],
        subjectPerformance: {
          'sub-env-studies': { averageScore: 88, highestScore: 97, lowestScore: 75, gradeDistribution: { 'A': 15, 'B': 10, 'C': 3 } },
          'sub-social-studies': { averageScore: 82, highestScore: 92, lowestScore: 68, gradeDistribution: { 'A': 10, 'B': 12, 'C': 6 } }
        }
      },
      // Attendance
      attendance: {
        rate: '94%',
        present: 26,
        absent: 2,
        onLeave: 0,
        total: 28,
        trend: 'stable',
        lastUpdated: '2025-06-20 16:30:00',
        absentToday: 1,
        absentThisWeek: 3,
        dailyAttendance: [
          { date: '2025-06-16', present: 27, absent: 1 },
          { date: '2025-06-17', present: 26, absent: 2 },
          { date: '2025-06-18', present: 27, absent: 1 },
          { date: '2025-06-19', present: 26, absent: 2 },
          { date: '2025-06-20', present: 27, absent: 1 },
        ]
      },
      // Fees
      fees: {
        billed: 45000 * 28,
        paid: 45000 * 27, // 1 student pending
        pending: 45000,
        currency: "KES",
        unpaidCount: 1,
        clearedCount: 27,
        studentsPendingFees: ['s-g3-b-007'],
        lastPaymentDate: '2025-06-19',
        nextPaymentDeadline: '2025-06-30',
        paymentBreakdown: [
          { studentId: 's-g3-b-007', billedAmount: 45000, paidAmount: 0, pendingAmount: 45000, status: 'Pending', lastPaymentDate: 'N/A' },
          { studentId: 's-g3-b-008', billedAmount: 45000, paidAmount: 45000, pendingAmount: 0, status: 'Cleared', lastPaymentDate: '2025-06-15' },
          // ... (add for all other 26 cleared students)
        ],
        paymentRemindersSentCount: 2,
        averageDaysOverdue: 0, // Since only one student is newly overdue
      },
      parentsMeeting: {
        nextDate: '2025-07-20',
        agenda: 'Academic Progress and Upcoming Projects',
        venue: 'School Hall',
        time: '10:00 AM'
      },
      classTeacherRemarks: 'The class is generally well-behaved and showing good progress in environmental studies.'
    },
  
    // Junior Secondary classes
    {
      id: 'f1-1',
      name: 'Junior Secondary 1 East',
      description: 'First year of junior secondary education',
      instructorId: 't-samuel-njoroge',
      schedule: {
        days: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
        startTime: '7:45 AM',
        endTime: '4:00 PM',
        venue: 'Block B, Room 1'
      },
      students: 38,
      status: 'active',
      level: 'junior-secondary',
      grade: 'grade7',
      stream: 'A',
      gradeType: 'F1',
      ageGroup: '12-13 years',
      classTeacherId: 't-samuel-njoroge',
      academicPerformance: {
        averageGrade: 'B-',
        overallPerformance: 'Average',
        improvement: 0,
        ranking: 20,
        totalStudentsInRankedGroup: 38,
        totalClasses: 6,
        previousTerm: {
          averageGrade: 'C+',
          ranking: 22,
          academicTerm: 'Term 2',
          academicYear: '2023/2024'
        },
        topStudents: ['s-f1-e-001', 's-f1-e-002'],
        subjectPerformance: {
          'sub-math-js': { averageScore: 70, highestScore: 90, lowestScore: 45, gradeDistribution: { 'A': 5, 'B': 10, 'C': 15, 'D': 8 } },
          'sub-eng-js': { averageScore: 75, highestScore: 92, lowestScore: 50, gradeDistribution: { 'A': 8, 'B': 12, 'C': 13, 'D': 5 } },
          'sub-kisw-js': { averageScore: 68, highestScore: 88, lowestScore: 48, gradeDistribution: { 'A': 4, 'B': 10, 'C': 16, 'D': 8 } },
        },
        targetMeanScore: 300,
      },
      attendance: {
        rate: '91%',
        present: 34,
        absent: 4,
        onLeave: 0,
        total: 38,
        trend: 'stable',
        lastUpdated: '2025-06-20 17:00:00',
        absentToday: 3,
        absentThisWeek: 6,
        dailyAttendance: [
          { date: '2025-06-16', present: 36, absent: 2 },
          { date: '2025-06-17', present: 35, absent: 3 },
          { date: '2025-06-18', present: 34, absent: 4 },
          { date: '2025-06-19', present: 35, absent: 3 },
          { date: '2025-06-20', present: 34, absent: 4 },
        ]
      },
      fees: {
        billed: 60000 * 38,
        paid: 60000 * 35,
        pending: 60000 * 3,
        currency: "KES",
        unpaidCount: 3,
        clearedCount: 35,
        studentsPendingFees: ['s-f1-e-003', 's-f1-e-004', 's-f1-e-005'],
        lastPaymentDate: '2025-06-16',
        nextPaymentDeadline: '2025-07-10',
        paymentBreakdown: [
          { studentId: 's-f1-e-003', billedAmount: 60000, paidAmount: 30000, pendingAmount: 30000, status: 'Partial', lastPaymentDate: '2025-06-01' },
          { studentId: 's-f1-e-004', billedAmount: 60000, paidAmount: 0, pendingAmount: 60000, status: 'Pending', lastPaymentDate: 'N/A' },
          { studentId: 's-f1-e-005', billedAmount: 60000, paidAmount: 45000, pendingAmount: 15000, status: 'Partial', lastPaymentDate: '2025-06-10' },
        ],
        paymentRemindersSentCount: 10,
        averageDaysOverdue: 15,
      },
      assignments: {
        total: 12,
        submitted: 10,
        pending: 2,
        graded: 8,
        issued: 12,
        upcoming: [
          { id: 'assign-math-001', title: 'Algebra Worksheet', dueDate: '2025-06-21', subjectId: 'sub-math-js' },
          { id: 'assign-sci-002', title: 'Lab Report: Photosynthesis', dueDate: '2025-06-24', subjectId: 'sub-ira-js' }
        ],
        overdueCount: 0,
        averageSubmissionRate: '83%'
      },
      discipline: {
        warningReports: 1,
        suspensions: 0,
        severity: 'Low',
        incidentsLog: [
          {
            date: '2025-05-10',
            type: 'Late Submission',
            description: 'Student X submitted English assignment 2 days late without valid reason.',
            actionTaken: 'Verbal warning, extension denied.',
            studentId: 's-f1-e-disc-01',
            reportedBy: 't-samuel-njoroge'
          }
        ],
        commonIssues: ['Lateness', 'Incomplete homework']
      }
    },
  
    // Senior Secondary classes
    {
      id: 'f4-2',
      name: 'Form 4 Science',
      description: 'Final year science stream preparing for KCSE',
      instructorId: 't-elizabeth-wangari',
      schedule: {
        days: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
        startTime: '7:30 AM',
        endTime: '4:30 PM',
        venue: 'Science Block, Room 3'
      },
      students: 24,
      status: 'active',
      level: 'senior-secondary',
      grade: 'grade10',
      stream: 'A',
      gradeType: 'F4',
      ageGroup: '17-18 years',
      classTeacherId: 't-elizabeth-wangari',
      academicPerformance: {
        averageGrade: 'B+',
        overallPerformance: 'Above Average',
        improvement: 7,
        ranking: 5,
        totalStudentsInRankedGroup: 24,
        totalClasses: 3,
        previousTerm: {
          averageGrade: 'B',
          ranking: 8,
          academicTerm: 'Term 2',
          academicYear: '2024/2025'
        },
        topStudents: ['s-f4-s-001', 's-f4-s-002'],
        subjectPerformance: {
          'sub-physics-ss': { averageScore: 85, highestScore: 98, lowestScore: 60, gradeDistribution: { 'A': 10, 'B': 8, 'C': 6 } },
          'sub-chemistry-ss': { averageScore: 80, highestScore: 95, lowestScore: 55, gradeDistribution: { 'A': 8, 'B': 10, 'C': 6 } },
          'sub-biology-ss': { averageScore: 78, highestScore: 90, lowestScore: 50, gradeDistribution: { 'A': 7, 'B': 9, 'C': 8 } },
          'sub-math-ss': { averageScore: 82, highestScore: 96, lowestScore: 65, gradeDistribution: { 'A': 12, 'B': 7, 'C': 5 } },
        },
        targetMeanScore: 380, // Out of 500 for KCSE
      },
      attendance: {
        rate: '96%',
        present: 23,
        absent: 1,
        onLeave: 0,
        total: 24,
        trend: 'improving',
        lastUpdated: '2025-06-20 17:30:00',
        absentToday: 0,
        absentThisWeek: 1,
        dailyAttendance: [
          { date: '2025-06-16', present: 23, absent: 1 },
          { date: '2025-06-17', present: 24, absent: 0 },
          { date: '2025-06-18', present: 23, absent: 1 },
          { date: '2025-06-19', present: 24, absent: 0 },
          { date: '2025-06-20', present: 24, absent: 0 },
        ]
      },
      fees: {
        billed: 75000 * 24,
        paid: 75000 * 22,
        pending: 75000 * 2,
        currency: "KES",
        unpaidCount: 2,
        clearedCount: 22,
        studentsPendingFees: ['s-f4-s-003', 's-f4-s-004'],
        lastPaymentDate: '2025-06-19',
        nextPaymentDeadline: '2025-07-01',
        paymentBreakdown: [
          { studentId: 's-f4-s-003', billedAmount: 75000, paidAmount: 50000, pendingAmount: 25000, status: 'Partial', lastPaymentDate: '2025-06-10' },
          { studentId: 's-f4-s-004', billedAmount: 75000, paidAmount: 0, pendingAmount: 75000, status: 'Pending', lastPaymentDate: 'N/A' },
        ],
        paymentRemindersSentCount: 6,
        averageDaysOverdue: 8,
      },
      examPreparation: {
        mockExams: 3,
        nextMockDate: '2025-07-15',
        revisionSessions: 12,
        performanceTrend: 'improving',
        targetAreas: ['Calculus', 'Organic Chemistry', 'Physics Practicals'],
        preparationSchedule: [
          { title: 'Math Revision Session', date: '2025-07-01', time: '4:30 PM', description: 'Focus on Calculus' },
          { title: 'Chemistry Lab Practical', date: '2025-07-05', time: '2:00 PM' }
        ],
        resourcesSharedCount: 35
      },
      coCurricular: {
        activities: [
          { name: 'Science Club', role: 'Member', achievements: ['Participated in Science Fair'] },
          { name: 'Debate Club', role: 'Team Captain' }
        ],
        competitions: [
          { name: 'National Science Congress', level: 'national', date: '2025-08-20', status: 'upcoming' }
        ],
        participationRate: '80%'
      },
      kcseMean: 'B+',
      examRanking: {
        internalRank: 5,
        zonalPosition: 2,
        countyPosition: 10,
        examType: 'Internal Mock',
        year: '2024/2025'
      }
    },
    {
      id: 'f5-1',
      name: 'Form 5 Humanities',
      description: 'Advanced level humanities focused on arts and literature',
      instructorId: 't-john-mwaura',
      schedule: {
        days: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
        startTime: '8:00 AM',
        endTime: '4:00 PM',
        venue: 'Humanities Block, Room 2'
      },
      students: 18,
      status: 'scheduled',
      level: 'senior-secondary',
      grade: 'grade11',
      stream: 'B',
      gradeType: 'F5',
      ageGroup: '18-19 years',
      classTeacherId: 't-john-mwaura',
      academicPerformance: {
        averageGrade: 'B',
        overallPerformance: 'Above Average',
        improvement: 4,
        ranking: 10,
        totalStudentsInRankedGroup: 18,
        totalClasses: 2,
        previousTerm: {
          averageGrade: 'C+',
          ranking: 12,
          academicTerm: 'Term 2',
          academicYear: '2023/2024'
        },
        topStudents: ['s-f4-s-001'], // Placeholder for Form 5
        subjectPerformance: {
          'sub-literature-ss': { averageScore: 80, highestScore: 92, lowestScore: 65 },
          'sub-history-ss': { averageScore: 75, highestScore: 88, lowestScore: 60 }
        }
      },
      attendance: {
        rate: '93%',
        present: 17,
        absent: 1,
        onLeave: 0,
        total: 18,
        trend: 'stable',
        lastUpdated: '2025-06-20 17:00:00',
        absentToday: 1,
        absentThisWeek: 2,
      },
      fees: {
        billed: 70000 * 18,
        paid: 70000 * 16,
        pending: 70000 * 2,
        currency: "KES",
        unpaidCount: 2,
        clearedCount: 16,
        studentsPendingFees: ['s-f4-s-002', 's-f4-s-003'], // Placeholder
        lastPaymentDate: '2025-06-15',
        nextPaymentDeadline: '2025-07-07',
        paymentBreakdown: [], // Simplified
      },
      communicationChannels: [
        { platform: 'School Portal', link: 'https://portal.school.com/f5humanities', isActive: true }
      ]
    },
    {
      id: 'f6-s',
      name: 'Form 6 Special',
      description: 'Final year advanced level studies for university preparation',
      instructorId: 't-mary-otieno',
      schedule: {
        days: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
        startTime: '7:30 AM',
        endTime: '5:00 PM',
        venue: 'Advanced Studies Center'
      },
      students: 15,
      status: 'inactive', // Example of an inactive class
      level: 'senior-secondary',
      grade: 'grade12',
      stream: 'D',
      gradeType: 'F6',
      ageGroup: '19-20 years',
      classTeacherId: 't-mary-otieno',
      academicPerformance: {
        averageGrade: 'N/A', // Inactive class
        overallPerformance: 'Needs Improvement',
        improvement: 0,
        ranking: 0,
        totalStudentsInRankedGroup: 15,
        totalClasses: 0, // No current classes
      },
      attendance: {
        rate: 'N/A',
        present: 0,
        absent: 0,
        onLeave: 0,
        total: 15,
        trend: 'declining', // Due to inactivity
        lastUpdated: '2025-06-01 00:00:00',
      },
      fees: {
        billed: 0,
        paid: 0,
        pending: 0,
        currency: "KES",
        unpaidCount: 0,
        clearedCount: 0,
        studentsPendingFees: [],
        lastPaymentDate: 'N/A',
        nextPaymentDeadline: 'N/A',
        paymentBreakdown: [],
      },
    },
    {
      id: 'cls-inactive',
      name: 'French (Inactive)',
      description: 'This class is currently not in session',
      instructorId: 't-claire-omondi',
      schedule: {
        days: ['Tuesday', 'Thursday'],
        startTime: '2:00 PM',
        endTime: '3:30 PM',
        venue: 'Room 18'
      },
      students: 0,
      status: 'inactive',
      level: 'senior-secondary',
      grade: 'grade12',
      stream: 'C',
      gradeType: 'F6',
      ageGroup: '19-20 years',
      academicPerformance: {
        averageGrade: 'N/A',
        overallPerformance: 'Needs Improvement',
        improvement: 0,
        ranking: 0,
        totalStudentsInRankedGroup: 0,
        totalClasses: 0,
      },
      attendance: {
        rate: 'N/A',
        present: 0,
        absent: 0,
        onLeave: 0,
        total: 0,
        trend: 'stable',
        lastUpdated: '2025-01-01 00:00:00',
      },
      fees: {
        billed: 0,
        paid: 0,
        pending: 0,
        currency: "KES",
        unpaidCount: 0,
        clearedCount: 0,
        studentsPendingFees: [],
        lastPaymentDate: 'N/A',
        nextPaymentDeadline: 'N/A',
        paymentBreakdown: [],
      },
    }
  ];
  
  // --- Utility Functions (from previous response, re-exported) ---
  
  export function getComponentLevelColor(level: EducationLevel) {
    switch (level) {
      case 'preschool':
        return 'bg-purple-600 hover:bg-purple-700';
      case 'lower-primary':
      case 'upper-primary':
        return 'bg-blue-600 hover:bg-blue-700';
      case 'junior-secondary':
        return 'bg-yellow-600 hover:bg-yellow-700';
      case 'senior-secondary':
        return 'bg-red-600 hover:bg-red-700';
      case 'all':
        return 'bg-gray-600 hover:bg-gray-700';
      default:
        return 'bg-gray-600 hover:bg-gray-700';
    }
  }
  
  export function getStreamsForGrade(gradeId: string): string[] {
    if (gradeId === EducationLevelEnum.All) {
      return [];
    }
  
    const streamsSet = new Set<string>();
    mockClasses.forEach(cls => {
      if (cls.grade === gradeId) {
        streamsSet.add(cls.stream);
      }
    });
  
    return Array.from(streamsSet).sort();
  }
  
  export function getGradeStreamAbbr(grade: Grade, stream: string): string {
    return `${grade.name}-${stream}`;
  }
  
  export function getClassById(classId: string): Class | undefined {
    return mockClasses.find(cls => cls.id === classId);
  }
  
  export function getGradeById(gradeId: string): Grade | undefined {
    return mockGrades.find(grade => grade.id === gradeId);
  }
  
  export function getClassesByGradeId(gradeId: string): Class[] {
    return mockClasses.filter(cls => cls.grade === gradeId);
  }
  
  export function getTeacherById(teacherId: string): Teacher | undefined {
    return mockTeachers.find(teacher => teacher.id === teacherId);
  }
  
  export function getSubjectById(subjectId: string): Subject | undefined {
    return mockSubjects.find(subject => subject.id === subjectId);
  }
  
  export function getTotalStudentsByEducationLevel(level: EducationLevel): number {
    if (level === EducationLevelEnum.All) {
      return mockGrades.reduce((sum, grade) => sum + grade.students, 0);
    }
    return mockGrades
      .filter(grade => grade.level === level)
      .reduce((sum, grade) => sum + grade.students, 0);
  }
  
  export function getAllUniqueVenues(): string[] {
    const venues = new Set<string>();
    mockClasses.forEach(cls => {
      if (cls.schedule.venue) {
        venues.add(cls.schedule.venue);
      }
    });
    mockGrades.forEach(grade => {
      if (grade.schedule.venue) {
        venues.add(grade.schedule.venue);
      }
    });
    return Array.from(venues).sort();
  }
  
  export function getClassesByStatus(status: Class['status']): Class[] {
    return mockClasses.filter(cls => cls.status === status);
  }
  
  export function getTeachersForClass(classId: string): Teacher[] {
    const classObj = getClassById(classId);
    if (!classObj) return [];
  
    const teacherIds = new Set<string>();
    if (classObj.instructorId) teacherIds.add(classObj.instructorId);
    if (classObj.classTeacherId) teacherIds.add(classObj.classTeacherId);
    if (classObj.currentLesson && classObj.currentLesson.teacherId) {
      teacherIds.add(classObj.currentLesson.teacherId);
    }
  
    const teachers: Teacher[] = [];
    teacherIds.forEach(id => {
      const teacher = getTeacherById(id);
      if (teacher) {
        teachers.push(teacher);
      }
    });
    return teachers;
  }