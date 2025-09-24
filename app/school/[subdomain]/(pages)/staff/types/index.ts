// Staff Member type from GraphQL response
export interface StaffMember {
  id: string;
  fullName: string;
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
  gender: string;
  role: string;
  status: string;
  employeeId: string;
  nationalId: string;
  dateOfBirth: string;
  dateOfJoining: string;
  address: string;
  emergencyContact: string;
  emergencyContactPhone: string;
  salary: number;
  bankAccount: string;
  bankName: string;
  department: string;
  supervisor: string;
  jobDescription: string;
  qualifications: string;
  workExperience: string;
  isActive: boolean;
  hasCompletedProfile: boolean;
  userId: string | null;
  createdAt: string;
  updatedAt: string;
}

// GraphQL Response type
export interface StaffResponse {
  getAllStaff: StaffMember[];
}

// Staff Role type for UI display
export type StaffRole = 
  | "TEACHER" 
  | "PRINCIPAL" 
  | "VICE_PRINCIPAL" 
  | "ACCOUNTANT" 
  | "SECRETARY" 
  | "LIBRARIAN" 
  | "COUNSELOR"
  | "SECURITY"
  | "JANITOR"
  | "DRIVER"
  | "NURSE"
  | "IT_SUPPORT"
  | "ADMIN";

// Staff Status type for UI display
export type StaffStatus = 
  | "ACTIVE" 
  | "INACTIVE" 
  | "ON_LEAVE" 
  | "SUSPENDED" 
  | "TERMINATED";

// Helper functions for displaying staff data
export const getRoleDisplayName = (role: string): string => {
  return role
    .replace(/_/g, ' ')
    .toLowerCase()
    .replace(/\b\w/g, (char) => char.toUpperCase());
};

export const getStatusDisplayName = (status: string): string => {
  return status
    .replace(/_/g, ' ')
    .toLowerCase()
    .replace(/\b\w/g, (char) => char.toUpperCase());
};

export const getStatusColor = (status: string): string => {
  switch (status) {
    case 'ACTIVE':
      return 'bg-green-100 text-green-800 border-green-200 dark:bg-green-900/20 dark:text-green-300 dark:border-green-800';
    case 'INACTIVE':
      return 'bg-gray-100 text-gray-800 border-gray-200 dark:bg-gray-900/20 dark:text-gray-300 dark:border-gray-800';
    case 'ON_LEAVE':
      return 'bg-yellow-100 text-yellow-800 border-yellow-200 dark:bg-yellow-900/20 dark:text-yellow-300 dark:border-yellow-800';
    case 'SUSPENDED':
      return 'bg-orange-100 text-orange-800 border-orange-200 dark:bg-orange-900/20 dark:text-orange-300 dark:border-orange-800';
    case 'TERMINATED':
      return 'bg-red-100 text-red-800 border-red-200 dark:bg-red-900/20 dark:text-red-300 dark:border-red-800';
    default:
      return 'bg-gray-100 text-gray-800 border-gray-200 dark:bg-gray-900/20 dark:text-gray-300 dark:border-gray-800';
  }
};

export const getRoleColor = (role: string): string => {
  switch (role) {
    case 'TEACHER':
      return 'bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-900/20 dark:text-blue-300 dark:border-blue-800';
    case 'PRINCIPAL':
    case 'VICE_PRINCIPAL':
      return 'bg-purple-100 text-purple-800 border-purple-200 dark:bg-purple-900/20 dark:text-purple-300 dark:border-purple-800';
    case 'ACCOUNTANT':
      return 'bg-green-100 text-green-800 border-green-200 dark:bg-green-900/20 dark:text-green-300 dark:border-green-800';
    case 'SECRETARY':
      return 'bg-pink-100 text-pink-800 border-pink-200 dark:bg-pink-900/20 dark:text-pink-300 dark:border-pink-800';
    case 'LIBRARIAN':
      return 'bg-amber-100 text-amber-800 border-amber-200 dark:bg-amber-900/20 dark:text-amber-300 dark:border-amber-800';
    case 'ADMIN':
      return 'bg-red-100 text-red-800 border-red-200 dark:bg-red-900/20 dark:text-red-300 dark:border-red-800';
    default:
      return 'bg-slate-100 text-slate-800 border-slate-200 dark:bg-slate-900/20 dark:text-slate-300 dark:border-slate-800';
  }
};
