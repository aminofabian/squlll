export function getPerformanceGrade(percentage: number) {
  if (percentage >= 80)
    return {
      grade: "Excellent",
      color: "text-green-600",
      bg: "bg-green-50",
    };
  if (percentage >= 70)
    return {
      grade: "Very Good",
      color: "text-blue-600",
      bg: "bg-blue-50",
    };
  if (percentage >= 60)
    return {
      grade: "Good",
      color: "text-yellow-600",
      bg: "bg-yellow-50",
    };
  if (percentage >= 50)
    return {
      grade: "Average",
      color: "text-orange-600",
      bg: "bg-orange-50",
    };
  return {
    grade: "Below Average",
    color: "text-red-600",
    bg: "bg-red-50",
  };
}
