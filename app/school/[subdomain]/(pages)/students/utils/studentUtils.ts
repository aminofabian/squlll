// Helper function to get level icon
export const getLevelIcon = (level: string) => {
  switch (level) {
    case 'preschool':
      return 'BookText';
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
export const getLevelColor = (level: string): string => {
  switch (level) {
    case 'preschool':
      return 'bg-purple-100 text-purple-800';
    case 'primary':
      return 'bg-blue-100 text-blue-800';
    case 'junior-secondary':
      return 'bg-yellow-100 text-yellow-800';
    case 'senior-secondary':
      return 'bg-red-100 text-red-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
};

// Helper function to format currency (Kenya Shillings)
export const formatCurrency = (amount: number) => {
  return `KES ${amount.toLocaleString()}`;
};

// Helper function to get status color
export const getStatusColor = (status: string) => {
  switch (status) {
    case 'active':
      return 'bg-green-100 text-green-800 hover:bg-green-100';
    case 'inactive':
      return 'bg-gray-100 text-gray-800 hover:bg-gray-100';
    case 'transferred':
      return 'bg-blue-100 text-blue-800 hover:bg-blue-100';
    case 'graduated':
      return 'bg-purple-100 text-purple-800 hover:bg-purple-100';
    case 'suspended':
      return 'bg-red-100 text-red-800 hover:bg-red-100';
    default:
      return 'bg-gray-100 text-gray-800 hover:bg-gray-100';
  }
};

// Helper function to get trend icon
export const getTrendIcon = (trend: string) => {
  switch (trend) {
    case 'improving':
      return 'ArrowUp';
    case 'declining':
      return 'ArrowDown';
    case 'stable':
      return 'Check';
    default:
      return 'Check';
  }
};

// Helper function to get education level
export const getEducationLevel = (grade: string) => {
  const gradeLower = grade.toLowerCase();
  if (gradeLower.includes('preschool') || gradeLower.includes('baby') || gradeLower.includes('nursery')) {
    return 'preschool';
  }
  if (gradeLower.includes('primary') || gradeLower.includes('grade 1') || gradeLower.includes('grade 2') || 
      gradeLower.includes('grade 3') || gradeLower.includes('grade 4') || gradeLower.includes('grade 5') || 
      gradeLower.includes('grade 6')) {
    return 'primary';
  }
  if (gradeLower.includes('junior') || gradeLower.includes('form 1') || gradeLower.includes('form 2') ||
      gradeLower.includes('grade 7') || gradeLower.includes('grade 8')) {
    return 'junior-secondary';
  }
  if (gradeLower.includes('senior') || gradeLower.includes('form 3') || gradeLower.includes('form 4') ||
      gradeLower.includes('grade 9') || gradeLower.includes('grade 10') || gradeLower.includes('grade 11') || 
      gradeLower.includes('grade 12')) {
    return 'senior-secondary';
  }
  return 'primary'; // Default fallback
};

// Helper function to categorize levels for filtering
export const getLevelCategory = (levelName: string): string => {
  const lowerLevelName = levelName.toLowerCase();
  if (lowerLevelName.includes('preschool') || lowerLevelName.includes('baby') || lowerLevelName.includes('nursery')) {
    return 'preschool';
  }
  if (lowerLevelName.includes('primary') || lowerLevelName.includes('grade 1') || lowerLevelName.includes('grade 2') || 
      lowerLevelName.includes('grade 3') || lowerLevelName.includes('grade 4') || lowerLevelName.includes('grade 5') || 
      lowerLevelName.includes('grade 6')) {
    return 'primary';
  }
  if (lowerLevelName.includes('junior') || lowerLevelName.includes('form 1') || lowerLevelName.includes('form 2') ||
      lowerLevelName.includes('grade 7') || lowerLevelName.includes('grade 8')) {
    return 'junior-secondary';
  }
  if (lowerLevelName.includes('senior') || lowerLevelName.includes('form 3') || lowerLevelName.includes('form 4') ||
      lowerLevelName.includes('grade 9') || lowerLevelName.includes('grade 10') || lowerLevelName.includes('grade 11') || 
      lowerLevelName.includes('grade 12')) {
    return 'senior-secondary';
  }
  return 'primary'; // Default fallback
};

// Helper function to convert grade to form
export const convertGradeToForm = (gradeName: string): string => {
  // Check if it's a numeric grade (Grade 7, Grade 8, etc.)
  const gradeMatch = gradeName.match(/Grade\s+(\d+)/i);
  if (gradeMatch) {
    const gradeNumber = parseInt(gradeMatch[1]);
    // Convert Grade 7+ to Form 1+ (up to Grade 12 = Form 6)
    if (gradeNumber >= 7 && gradeNumber <= 12) {
      const formNumber = gradeNumber - 6; // Grade 7 = Form 1, Grade 8 = Form 2, etc.
      return `Form ${formNumber}`;
    }
  }
  return gradeName; // Return original if not a Grade 7+ or doesn't match pattern
};

// Helper function to generate stable mock data based on student ID
export const generateStableMockData = (studentId: string) => {
  // Use a simple hash function to generate consistent values based on student ID
  const hash = studentId.split('').reduce((a, b) => {
    a = ((a << 5) - a) + b.charCodeAt(0);
    return a & a;
  }, 0);
  
  const streams = ['A', 'B', 'C', 'D'];
  const clubs = ['Science Club', 'Debate Club', 'Sports Club', 'Music Club', 'Art Club'];
  const sports = ['Football', 'Basketball', 'Swimming', 'Athletics', 'Volleyball'];
  const leadership = ['Class Prefect', 'School Captain', 'House Captain', 'Club President'];
  
  return {
    stream: streams[Math.abs(hash) % streams.length],
    academicDetails: {
      averageGrade: ['A', 'A-', 'B+', 'B', 'B-', 'C+', 'C'][Math.abs(hash) % 7],
      classRank: (Math.abs(hash) % 40) + 1,
      streamRank: (Math.abs(hash) % 120) + 1,
      yearRank: (Math.abs(hash) % 400) + 1,
      kcpeScore: 300 + (Math.abs(hash) % 200),
      kcsePrediction: ['A', 'A-', 'B+', 'B', 'B-', 'C+', 'C'][Math.abs(hash) % 7]
    },
    feeStatus: {
      currentBalance: (Math.abs(hash) % 50000) + 1000,
      lastPaymentDate: '2024-01-15',
      lastPaymentAmount: (Math.abs(hash) % 20000) + 5000,
      scholarshipPercentage: Math.abs(hash) % 100 === 0 ? 25 : 0
    },
    attendance: {
      rate: `${85 + (Math.abs(hash) % 15)}%`,
      absentDays: Math.abs(hash) % 10,
      lateDays: Math.abs(hash) % 5,
      trend: ['improving', 'declining', 'stable'][Math.abs(hash) % 3] as 'improving' | 'declining' | 'stable'
    },
    healthInfo: {
      bloodGroup: ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'][Math.abs(hash) % 8],
      knownConditions: Math.abs(hash) % 10 === 0 ? ['Asthma'] : [],
      emergencyContact: '+254700000000',
      nhifNumber: `NHIF${Math.abs(hash).toString().padStart(8, '0')}`
    },
    extraCurricular: {
      clubs: [clubs[Math.abs(hash) % clubs.length]],
      sports: [sports[Math.abs(hash) % sports.length]],
      achievements: Math.abs(hash) % 5 === 0 ? ['Best Student Award'] : [],
      leadership: Math.abs(hash) % 10 === 0 ? [leadership[Math.abs(hash) % leadership.length]] : []
    }
  };
};

// Helper function to get grade number for sorting
export const getGradeNumber = (grade: string): number => {
  const formMatch = grade.match(/Form\s*(\d+)/i);
  if (formMatch) {
    const formNumber = parseInt(formMatch[1]);
    // Form 1 = 7, Form 2 = 8, Form 3 = 9, Form 4 = 10, Form 5 = 11, Form 6 = 12
    return formNumber + 6;
  }
  const gradeMatch = grade.match(/Grade\s*(\d+)/i);
  if (gradeMatch) {
    return parseInt(gradeMatch[1]);
  }
  return parseInt(grade) || 0;
}; 