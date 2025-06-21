export type Student = {
    id: string;
    name: string;
    admissionNumber: string; // Kenya-specific
    photo?: string;
    gender: "male" | "female";
    class: string;
    stream?: string;
    grade: string;
    age: number;
    admissionDate: string;
    status: "active" | "inactive" | "transferred" | "graduated" | "suspended";
    contacts: {
      primaryGuardian: string;
      guardianPhone: string;
      guardianEmail?: string;
      homeAddress?: string;
    };
    academicDetails?: {
      averageGrade?: string; // Kenya uses letter grades like A, B+, etc.
      classRank?: number;
      streamRank?: number;
      yearRank?: number;
      kcpeScore?: number; // Kenya Certificate of Primary Education score
      kcsePrediction?: string; // Kenya Certificate of Secondary Education prediction
    };
    feeStatus?: {
      currentBalance: number;
      lastPaymentDate: string;
      lastPaymentAmount: number;
      scholarshipPercentage?: number;
      paymentHistory?: Array<{
        date: string;
        amount: number;
        receiptNumber: string;
        paymentMethod: string;
      }>;
    };
    attendance?: {
      rate: string;
      absentDays: number;
      lateDays: number;
      trend: "improving" | "declining" | "stable";
    };
    healthInfo?: {
      bloodGroup?: string;
      knownConditions?: string[];
      emergencyContact?: string;
      nhifNumber?: string; // Kenya's National Hospital Insurance Fund
    };
    extraCurricular?: {
      clubs?: string[];
      sports?: string[];
      achievements?: string[];
      leadership?: string[];
    };
  };
  export type EducationLevel = 'preschool' | 'primary' | 'junior-secondary' | 'senior-secondary' | 'all'

  export interface Grade {
    id: string
    name: string
    displayName: string
    level: EducationLevel
    ageGroup: string
    students: number
    classes: number
  }
  
export const students: Student[] = [
    {
      id: "1",
      name: "Wanjiku Kamau",
      admissionNumber: "KPS/2023/001",
      photo: "/students/student-1.jpg",
      gender: "female",
      class: "Form 4",
      stream: "East",
      grade: "F4",
      age: 17,
      admissionDate: "2020-01-15",
      status: "active",
      contacts: {
        primaryGuardian: "James Kamau",
        guardianPhone: "+254722123456",
        guardianEmail: "james.kamau@example.com",
        homeAddress: "456 Moi Avenue, Nairobi"
      },
      academicDetails: {
        averageGrade: "A-",
        classRank: 3,
        streamRank: 1,
        yearRank: 15,
        kcsePrediction: "A"
      },
      feeStatus: {
        currentBalance: 12500,
        lastPaymentDate: "2023-05-10",
        lastPaymentAmount: 15000,
        paymentHistory: [
          { date: "2023-05-10", amount: 15000, receiptNumber: "RCT-2023-1234", paymentMethod: "M-Pesa" },
          { date: "2023-01-15", amount: 25000, receiptNumber: "RCT-2023-0987", paymentMethod: "Bank Transfer" }
        ]
      },
      attendance: {
        rate: "95%",
        absentDays: 3,
        lateDays: 2,
        trend: "stable"
      },
      healthInfo: {
        bloodGroup: "O+",
        knownConditions: ["Asthma"],
        emergencyContact: "+254722987654",
        nhifNumber: "NHIF12345678"
      },
      extraCurricular: {
        clubs: ["Debate Club", "Science Club"],
        sports: ["Volleyball", "Athletics"],
        achievements: ["County Debate Champion 2022"],
        leadership: ["Class Prefect"]
      }
    },
    {
      id: "2",
      name: "Emmanuel Ochieng",
      admissionNumber: "KPS/2022/042",
      photo: "/students/student-2.jpg",
      gender: "male",
      class: "Form 3",
      stream: "West",
      grade: "F3",
      age: 16,
      admissionDate: "2021-01-12",
      status: "active",
      contacts: {
        primaryGuardian: "Sarah Ochieng",
        guardianPhone: "+254733456789",
        homeAddress: "123 Kenyatta Road, Kisumu"
      },
      academicDetails: {
        averageGrade: "B+",
        classRank: 5,
        streamRank: 2,
        kcpeScore: 398
      },
      feeStatus: {
        currentBalance: 0,
        lastPaymentDate: "2023-04-20",
        lastPaymentAmount: 32500,
        scholarshipPercentage: 25
      },
      attendance: {
        rate: "98%",
        absentDays: 1,
        lateDays: 0,
        trend: "improving"
      },
      healthInfo: {
        bloodGroup: "AB-",
        nhifNumber: "NHIF98765432"
      },
      extraCurricular: {
        clubs: ["Chess Club"],
        sports: ["Football", "Rugby"],
        achievements: ["School Football Captain"],
        leadership: ["Sports Captain"]
      }
    },
    {
      id: "3",
      name: "Aisha Mohamed",
      admissionNumber: "KPS/2022/018",
      gender: "female",
      class: "Form 2",
      stream: "North",
      grade: "F2",
      age: 15,
      admissionDate: "2022-01-10",
      status: "active",
      contacts: {
        primaryGuardian: "Hassan Mohamed",
        guardianPhone: "+254711789012",
        guardianEmail: "hassan.mohamed@example.com"
      },
      academicDetails: {
        averageGrade: "A",
        classRank: 1,
        streamRank: 1,
        yearRank: 3,
        kcpeScore: 412
      },
      feeStatus: {
        currentBalance: 5000,
        lastPaymentDate: "2023-05-05",
        lastPaymentAmount: 20000
      },
      attendance: {
        rate: "100%",
        absentDays: 0,
        lateDays: 0,
        trend: "stable"
      },
      extraCurricular: {
        clubs: ["Mathematics Club", "Islamic Students Association"],
        sports: ["Basketball"],
        achievements: ["Mathematics Olympiad Winner"],
        leadership: ["Academic Prefect"]
      }
    },
    {
      id: "4",
      name: "Daniel Mwangi",
      admissionNumber: "KPS/2021/076",
      gender: "male",
      class: "Form 4",
      stream: "East",
      grade: "12",
      age: 18,
      admissionDate: "2020-01-20",
      status: "suspended",
      contacts: {
        primaryGuardian: "Catherine Mwangi",
        guardianPhone: "+254700123456"
      },
      academicDetails: {
        averageGrade: "C+",
        classRank: 24,
        streamRank: 12,
        kcsePrediction: "C+"
      },
      feeStatus: {
        currentBalance: 18700,
        lastPaymentDate: "2023-02-15",
        lastPaymentAmount: 10000
      },
      attendance: {
        rate: "76%",
        absentDays: 12,
        lateDays: 8,
        trend: "declining"
      },
      extraCurricular: {
        clubs: ["Drama Club"],
        sports: ["Football"],
        achievements: [],
        leadership: []
      }
    },
    {
      id: "5",
      name: "Faith Njeri",
      admissionNumber: "KPS/2020/034",
      photo: "/students/student-5.jpg",
      gender: "female",
      class: "Form 4",
      stream: "South",
      grade: "12",
      age: 17,
      admissionDate: "2020-01-15",
      status: "active",
      contacts: {
        primaryGuardian: "Peter Njeri",
        guardianPhone: "+254722987123",
        guardianEmail: "peter.njeri@example.com",
        homeAddress: "789 Tom Mboya Street, Nakuru"
      },
      academicDetails: {
        averageGrade: "B",
        classRank: 8,
        streamRank: 3,
        kcsePrediction: "B+"
      },
      feeStatus: {
        currentBalance: 0,
        lastPaymentDate: "2023-05-20",
        lastPaymentAmount: 35000,
        scholarshipPercentage: 15
      },
      attendance: {
        rate: "94%",
        absentDays: 4,
        lateDays: 1,
        trend: "stable"
      },
      healthInfo: {
        bloodGroup: "A+",
        nhifNumber: "NHIF45678901"
      },
      extraCurricular: {
        clubs: ["Red Cross", "Environmental Club"],
        sports: ["Netball"],
        achievements: ["County Environmental Champion 2022"],
        leadership: ["Environmental Club Chairperson"]
      }
    },
    {
      id: "6",
      name: "John Kipchoge",
      admissionNumber: "KPS/2021/102",
      gender: "male",
      class: "Form 3",
      stream: "North",
      grade: "11",
      age: 16,
      admissionDate: "2021-01-15",
      status: "transferred",
      contacts: {
        primaryGuardian: "Elizabeth Kipchoge",
        guardianPhone: "+254733567890"
      },
      academicDetails: {
        averageGrade: "B-",
        classRank: 12,
        streamRank: 5,
        kcpeScore: 365
      },
      feeStatus: {
        currentBalance: 0,
        lastPaymentDate: "2023-04-10",
        lastPaymentAmount: 15000
      },
      attendance: {
        rate: "92%",
        absentDays: 5,
        lateDays: 3,
        trend: "stable"
      },
      extraCurricular: {
        clubs: [],
        sports: ["Athletics", "Cross Country"],
        achievements: ["County 5000m Champion 2022"],
        leadership: []
      }
    }
  ];

  export const mockGrades: Grade[] = [
    // Preschool grades
    {
      id: 'baby-class',
      name: 'Baby',
      displayName: 'Baby Class',
      level: 'preschool',
      ageGroup: '3 years',
      students: 42,
      classes: 2
    },
    {
      id: 'pp1',
      name: 'PP1',
      displayName: 'PP1',
      level: 'preschool',
      ageGroup: '4 years',
      students: 56,
      classes: 3
    },
    {
      id: 'pp2',
      name: 'PP2',
      displayName: 'PP2',
      level: 'preschool',
      ageGroup: '5 years',
      students: 48,
      classes: 2
    },
    
    // Primary grades
    {
      id: 'grade1',
      name: 'G1',
      displayName: 'Grade 1',
      level: 'primary',
      ageGroup: '6 years',
      students: 65,
      classes: 3
    },
    {
      id: 'grade2',
      name: 'G2',
      displayName: 'Grade 2',
      level: 'primary',
      ageGroup: '7 years',
      students: 62,
      classes: 3
    },
    {
      id: 'grade3',
      name: 'G3',
      displayName: 'Grade 3',
      level: 'primary',
      ageGroup: '8 years',
      students: 58,
      classes: 2
    },
    {
      id: 'grade4',
      name: 'G4',
      displayName: 'Grade 4',
      level: 'primary',
      ageGroup: '9 years',
      students: 60,
      classes: 2
    },
    {
      id: 'grade5',
      name: 'G5',
      displayName: 'Grade 5',
      level: 'primary',
      ageGroup: '10 years',
      students: 54,
      classes: 2
    },
    {
      id: 'grade6',
      name: 'G6',
      displayName: 'Grade 6',
      level: 'primary',
      ageGroup: '11 years',
      students: 52,
      classes: 2
    },
    
    // Junior Secondary grades
    {
      id: 'grade7',
      name: 'F1',
      displayName: 'Form 1',
      level: 'junior-secondary',
      ageGroup: '12 years',
      students: 86,
      classes: 3
    },
    {
      id: 'grade8',
      name: 'F2',
      displayName: 'Form 2',
      level: 'junior-secondary',
      ageGroup: '13 years',
      students: 78,
      classes: 3
    },
    {
      id: 'grade9',
      name: 'F3',
      displayName: 'Form 3',
      level: 'junior-secondary',
      ageGroup: '14 years',
      students: 72,
      classes: 2
    },
    
    // Senior Secondary grades
    {
      id: 'grade10',
      name: 'F4',
      displayName: 'Form 4',
      level: 'senior-secondary',
      ageGroup: '15 years',
      students: 68,
      classes: 3
    },
    {
      id: 'grade11',
      name: 'F5',
      displayName: 'Form 5',
      level: 'senior-secondary',
      ageGroup: '16 years',
      students: 54,
      classes: 2
    },
    {
      id: 'grade12',
      name: 'F6',
      displayName: 'Form 6',
      level: 'senior-secondary',
      ageGroup: '17 years',
      students: 48,
      classes: 2
    }
  ]