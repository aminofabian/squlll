import { EducationLevel } from "../types";

// Helper function to get level icon
export const getLevelIcon = (level: EducationLevel) => {
  switch (level) {
    case 'preschool':
      return 'Baby';
    case 'primary':
      return 'BookOpen';
    case 'junior-secondary':
      return 'Layers';
    case 'senior-secondary':
      return 'GraduationCap';
    default:
      return 'BookOpen';
  }
};

// Helper function to get level color
export const getLevelColor = (level: EducationLevel): string => {
  switch (level) {
    case 'preschool':
      return 'bg-purple-100 text-purple-800 border-purple-200';
    case 'primary':
      return 'bg-blue-100 text-blue-800 border-blue-200';
    case 'junior-secondary':
      return 'bg-yellow-100 text-yellow-800 border-yellow-200';
    case 'senior-secondary':
      return 'bg-red-100 text-red-800 border-red-200';
    default:
      return 'bg-gray-100 text-gray-800 border-gray-200';
  }
};

// Helper function to format currency (Kenya Shillings)
export const formatCurrency = (amount: number) => {
  return `KES ${amount.toLocaleString()}`;
};

// Helper function to get relationship color
export const getRelationshipColor = (relationship: string) => {
  switch (relationship) {
    case 'father':
      return 'bg-blue-100 text-blue-800 border-blue-200';
    case 'mother':
      return 'bg-pink-100 text-pink-800 border-pink-200';
    case 'guardian':
      return 'bg-purple-100 text-purple-800 border-purple-200';
    case 'other':
      return 'bg-gray-100 text-gray-800 border-gray-200';
    default:
      return 'bg-gray-100 text-gray-800 border-gray-200';
  }
};

// Helper function to get status color
export const getStatusColor = (status: string) => {
  switch (status) {
    case 'active':
      return 'bg-green-100 text-green-800 border-green-200';
    case 'inactive':
      return 'bg-gray-100 text-gray-800 border-gray-200';
    default:
      return 'bg-gray-100 text-gray-800 border-gray-200';
  }
};
