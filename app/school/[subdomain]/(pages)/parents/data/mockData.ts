import { Parent, Grade } from "../types";

// Mock data for parents
export const mockParents: Parent[] = [
  {
    id: "1",
    name: "James Kamau",
    email: "james.kamau@example.com",
    phone: "+254722123456",
    relationship: "father",
    occupation: "Engineer",
    workAddress: "Nairobi CBD",
    homeAddress: "456 Moi Avenue, Nairobi",
    emergencyContact: "+254733987654",
    idNumber: "12345678",
    students: [
      {
        id: "1",
        name: "Wanjiku Kamau",
        grade: "F4",
        class: "Form 4 East",
        stream: "East",
        admissionNumber: "KPS/2023/001"
      }
    ],
    status: "active",
    registrationDate: "2023-01-15",
    lastContact: "2024-01-20",
    communicationPreferences: {
      sms: true,
      email: true,
      whatsapp: true
    },
    feeStatus: {
      totalOwed: 25000,
      lastPayment: "2024-01-10",
      paymentMethod: "M-Pesa"
    }
  },
  {
    id: "2",
    name: "Grace Wanjiru",
    email: "grace.wanjiru@gmail.com",
    phone: "+254788456789",
    relationship: "mother",
    occupation: "Teacher",
    homeAddress: "123 Kenyatta Avenue, Kiambu",
    emergencyContact: "+254722567890",
    idNumber: "87654321",
    students: [
      {
        id: "2",
        name: "Peter Wanjiru",
        grade: "G3",
        class: "Grade 3 Blue",
        stream: "Blue",
        admissionNumber: "KPS/2024/015"
      },
      {
        id: "3",
        name: "Mary Wanjiru",
        grade: "PP1",
        class: "PP1 Red",
        admissionNumber: "KPS/2024/025"
      }
    ],
    status: "active",
    registrationDate: "2024-01-10",
    lastContact: "2024-01-18",
    communicationPreferences: {
      sms: true,
      email: false,
      whatsapp: true
    },
    feeStatus: {
      totalOwed: 45000,
      lastPayment: "2024-01-05",
      paymentMethod: "Bank Transfer"
    }
  },
  {
    id: "3",
    name: "David Ochieng",
    email: "david.ochieng@example.com",
    phone: "+254712345678",
    relationship: "guardian",
    occupation: "Business Owner",
    homeAddress: "789 Uhuru Highway, Nakuru",
    emergencyContact: "+254723456789",
    students: [
      {
        id: "4",
        name: "Faith Akinyi",
        grade: "F2",
        class: "Form 2 West",
        stream: "West",
        admissionNumber: "KPS/2023/087"
      }
    ],
    status: "active",
    registrationDate: "2023-08-20",
    lastContact: "2024-01-15",
    communicationPreferences: {
      sms: true,
      email: false,
      whatsapp: false
    },
    feeStatus: {
      totalOwed: 0,
      lastPayment: "2024-01-12",
      paymentMethod: "Cash"
    }
  },
  {
    id: "4",
    name: "Sarah Muthoni",
    email: "s.muthoni@yahoo.com",
    phone: "+254700987654",
    relationship: "mother",
    occupation: "Nurse",
    workAddress: "Kenyatta Hospital",
    homeAddress: "234 Tom Mboya Street, Nairobi",
    emergencyContact: "+254711234567",
    idNumber: "34567890",
    students: [
      {
        id: "5",
        name: "John Muthoni",
        grade: "G1",
        class: "Grade 1 Green",
        stream: "Green",
        admissionNumber: "KPS/2024/045"
      }
    ],
    status: "active",
    registrationDate: "2024-01-05",
    communicationPreferences: {
      sms: true,
      email: true,
      whatsapp: true
    },
    feeStatus: {
      totalOwed: 15000,
      lastPayment: "2023-12-28",
      paymentMethod: "M-Pesa"
    }
  }
];

// Mock data for grades
export const mockGrades: Grade[] = [
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
    id: 'grade10',
    name: 'F4',
    displayName: 'Form 4',
    level: 'senior-secondary',
    ageGroup: '15 years',
    students: 68,
    classes: 3
  }
];
