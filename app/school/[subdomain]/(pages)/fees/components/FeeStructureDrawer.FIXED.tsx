// This is a fixed version of FeeStructureDrawer.tsx that addresses the infinite render loop
// 1. All instances of getActiveAcademicYear have been replaced with direct array access
// 2. Removed function references from dependency arrays
// 3. Added proper conditionals to prevent useEffect loops
// 
// To use this fix, review the changes and merge them into your FeeStructureDrawer.tsx file
//
// Main fixes:
// 1. Replace useEffect hooks that cause infinite render loops
// 2. Remove unstable function references from dependency arrays
// 3. Use direct academicYears.find() instead of getActiveAcademicYear() function
// 4. Add proper conditionals to prevent updates when formData already has values

// Steps to implement:
// 1. Find useEffect that sets academicYear in formData
// 2. Remove formData.academicYear from its dependencies
// 3. Add a strict condition to only run when formData.academicYear === ''
// 4. Find initialization useEffect and replace getActiveAcademicYear with direct lookup
// 5. Update any other functions that use getActiveAcademicYear

/*
Example fixes:

// Fix 1: Replace getActiveAcademicYear in useEffect
useEffect(() => {
  console.log('Academic years data:', academicYears)
  console.log('Academic years loading:', academicYearsLoading)
  console.log('Academic years error:', academicYearsError)
  console.log('Current form academic year:', formData.academicYear)
  
  // Only run this effect if we have academic years data and no academic year set yet
  if (academicYears.length > 0 && formData.academicYear === '') {
    // Find an active academic year directly from the array instead of using the function
    const activeYear = academicYears.find(year => year.isActive) || academicYears[0]
    console.log('Active academic year:', activeYear)
    if (activeYear) {
      console.log('Setting academic year to:', activeYear.name)
      setFormData(prev => ({
        ...prev,
        academicYear: activeYear.name
      }))
    }
  }
// IMPORTANT: Don't include getActiveAcademicYear in dependencies as it causes infinite rerenders
}, [academicYears, academicYearsLoading, academicYearsError])

// Fix 2: Replace getActiveAcademicYear in initialization
useEffect(() => {
  if (initialData) {
    setFormData(initialData)
    setSelectedGrades([initialData.grade])
  } else {
    const currentYear = new Date().getFullYear().toString();
    // Find active year directly instead of using the function to avoid dependency issues
    const activeYear = academicYears.find(year => year.isActive) || academicYears[0];
    
    // Rest of the initialization...
  }
// Remove getActiveAcademicYear from dependencies to prevent infinite rerenders
}, [initialData, isOpen, schoolConfig, subdomain, academicYears])

// Fix 3: Update addTermStructure to not use getActiveAcademicYear
const addTermStructure = () => {
  // Find selected academic year - directly from the array, not using the function
  const selectedAcademicYear = academicYears.find(year => year.name === formData.academicYear);
  
  // Rest of the function...
}
*/
