# Student Search Update - Using `allStudentsSummary` Query

## Overview
Updated the student search functionality to use the new GraphQL `allStudentsSummary` query which provides better performance and includes fee summary information directly.

## Changes Made

### 1. Updated `lib/hooks/useStudents.ts`
- **Changed Query**: Replaced `allStudents` with `allStudentsSummary`
- **New Fields**: 
  - `admissionNumber` (replaces `admission_number`)
  - `studentName` (direct field)
  - `gradeLevelName` (direct field)
  - `feeSummary` (includes `totalOwed`, `totalPaid`, `balance`, `numberOfFeeItems`)
- **Transformation**: Added mapping logic to transform the new API response to match existing `GraphQLStudent` interface for backward compatibility

### 2. Created `lib/hooks/useStudentsSummary.ts` (New)
- **Purpose**: Dedicated hook for the new `allStudentsSummary` query
- **Benefits**:
  - Better type safety
  - No unnecessary transformations
  - Cleaner API for components that need student summary data
  - Includes fee information out of the box
- **Usage**: 
  ```typescript
  const { students, isLoading, isError, error, refetch } = useStudentsSummary();
  ```

### 3. Updated `types/student.ts`
- **Added Types**:
  - `FeeSummary`: Interface for fee summary data
  - `StudentSummaryData`: Interface for student summary from the new API
- **Purpose**: Centralized type definitions for use across the application

### 4. Updated `app/school/[subdomain]/(pages)/fees/types/index.ts`
- **Added Types**:
  - `FeeSummary`: Fee summary structure
  - `StudentSummaryFromAPI`: Type for the new API response
- **Purpose**: Type definitions specific to the fees module

### 5. Updated `app/school/[subdomain]/(pages)/fees/hooks/useFeesData.ts`
- **Changed Hook**: Now uses `useStudentsSummary()` instead of `useStudentsStore()`
- **Simpler Mapping**: Direct mapping from API response without complex transformations
- **Better Performance**: 
  - No need to fetch all student details when only summary is needed
  - Reduced data transfer
  - Fee information included in a single query
- **Updated Fields**:
  - `invoiceCount` now populated from `numberOfFeeItems`
  - `totalOutstanding` now uses `balance` from fee summary

## API Response Structure

### Query
```graphql
query GetAllStudentsSummary {
  allStudentsSummary {
    id
    admissionNumber
    studentName
    gradeLevelName
    feeSummary {
      totalOwed
      totalPaid
      balance
      numberOfFeeItems
    }
  }
}
```

### Example Response
```json
{
  "data": {
    "allStudentsSummary": [
      {
        "id": "02d25893-e184-43f3-baf9-5b07ca3caa41",
        "admissionNumber": "ADM98f744664",
        "studentName": "Johnd Doe1",
        "gradeLevelName": "Grade 2",
        "feeSummary": {
          "totalOwed": 4000,
          "totalPaid": 0,
          "balance": 4000,
          "numberOfFeeItems": 2
        }
      }
    ]
  }
}
```

## Benefits

1. **Performance**: Lighter query that returns only necessary data
2. **Fee Integration**: Fee summary included in student data by default
3. **Type Safety**: Proper TypeScript types for the new structure
4. **Backward Compatibility**: Old components continue to work through transformation layer
5. **Future Ready**: New components can use `useStudentsSummary()` directly without transformations

## Migration Guide

### For New Components
Use the new `useStudentsSummary()` hook:

```typescript
import { useStudentsSummary } from '@/lib/hooks/useStudentsSummary';

function MyComponent() {
  const { students, isLoading, isError } = useStudentsSummary();
  
  return (
    <div>
      {students.map(student => (
        <div key={student.id}>
          <h3>{student.studentName}</h3>
          <p>Grade: {student.gradeLevelName}</p>
          <p>Balance: {student.feeSummary.balance}</p>
          <p>Fee Items: {student.feeSummary.numberOfFeeItems}</p>
        </div>
      ))}
    </div>
  );
}
```

### For Existing Components
No changes needed! The `useStudents()` hook now internally uses the new query but maintains the same interface.

## Testing Checklist

- [ ] Student search in fees module displays correctly
- [ ] Student names show properly
- [ ] Admission numbers display correctly
- [ ] Grade levels show correctly
- [ ] Fee balances are accurate
- [ ] Fee items count is correct
- [ ] Search functionality works (by name and admission number)
- [ ] Student selection works
- [ ] No console errors
- [ ] No TypeScript errors

## Files Modified

1. `lib/hooks/useStudents.ts` - Updated to use new query
2. `lib/hooks/useStudentsSummary.ts` - **NEW** - Dedicated hook for summary query
3. `types/student.ts` - Added new types
4. `app/school/[subdomain]/(pages)/fees/types/index.ts` - Added fee-specific types
5. `app/school/[subdomain]/(pages)/fees/hooks/useFeesData.ts` - Updated to use new hook

## Notes

- The old `useStudents()` hook still works but now uses the new query internally
- Some fields (like `user_id`, `phone`, `gender`) are not available in the summary query and are populated with empty strings
- For components that need full student details, consider keeping the old query or creating a separate detailed query
- The `overdueCount` field in `StudentSummary` is currently set to 0 as it's not provided by the API yet

## Future Improvements

1. Add `overdueCount` to the API response
2. Consider adding filters (by grade, by status) to the query
3. Add pagination support for large student lists
4. Cache student summary data more aggressively
5. Add real-time updates when student data changes

