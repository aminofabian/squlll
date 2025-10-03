# Fee Assignments Data Table - Integration Guide

## Overview

The `FeeAssignmentsDataTable` component displays fee structure assignments to students. It's designed to work with the `getAllTenantFeeAssignments` GraphQL query and is **semantically different** from the invoices table.

## What It Shows

- **Fee Structure Assignments**: Which fee structures are assigned to students
- **Student Details**: Students assigned to each fee structure
- **Fee Items**: Individual fee items (mandatory/optional) for each student
- **Assignment Metadata**: Who assigned, when, and status

## Files Created

1. **`FeeAssignmentsDataTable.tsx`** - Main table component with expandable rows
2. **`useFeeAssignments.ts`** - Custom hook for fetching data from GraphQL
3. **`FeeAssignmentsView.tsx`** - Complete view with header, actions, and summary

## Quick Start

### Option 1: Use the Complete View Component

```tsx
import { FeeAssignmentsView } from './components/FeeAssignmentsView'

export default function FeeAssignmentsPage() {
  return (
    <div className="container mx-auto py-8">
      <FeeAssignmentsView />
    </div>
  )
}
```

### Option 2: Use the Table Component Directly

```tsx
import { FeeAssignmentsDataTable } from './components/FeeAssignmentsDataTable'
import { useFeeAssignments } from './hooks/useFeeAssignments'

export default function CustomPage() {
  const { data, loading } = useFeeAssignments()

  return (
    <div>
      <h1>My Custom Header</h1>
      <FeeAssignmentsDataTable data={data} isLoading={loading} />
    </div>
  )
}
```

## Integration with Existing Fees Page

### Add a Tab to the Fees Page

```tsx
// In your fees/page.tsx
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { FeeAssignmentsView } from './components/FeeAssignmentsView'

export default function FeesPage() {
  return (
    <Tabs defaultValue="invoices">
      <TabsList>
        <TabsTrigger value="invoices">Fee Invoices</TabsTrigger>
        <TabsTrigger value="assignments">Fee Assignments</TabsTrigger>
        <TabsTrigger value="structures">Fee Structures</TabsTrigger>
      </TabsList>
      
      <TabsContent value="invoices">
        {/* Your existing FeesDataTable */}
      </TabsContent>
      
      <TabsContent value="assignments">
        <FeeAssignmentsView />
      </TabsContent>
      
      <TabsContent value="structures">
        {/* Your Fee Structure Manager */}
      </TabsContent>
    </Tabs>
  )
}
```

## Features

### ✅ Expandable Rows
- Click the chevron to expand and see all students assigned to a fee structure
- Automatically disabled for assignments with 0 students

### ✅ Status Indicators
- **Active/Inactive** badges for both assignments and student assignments
- **Mandatory/Optional** badges for fee items

### ✅ Detailed Student Information
- Student name, grade level
- Individual fee items with amounts
- Total amount per student
- Assignment date

### ✅ Summary Statistics
- Total assignments count
- Active assignments count
- Total students with fees
- Total fee items

### ✅ Empty & Loading States
- Graceful loading state with skeleton
- Clear empty state with helpful message

## Data Structure

The component expects data in this format:

```typescript
{
  tenantId: string
  totalFeeAssignments: number
  totalStudentsWithFees: number
  feeAssignments: [
    {
      feeAssignment: {
        id: string
        feeStructureId: string
        description: string
        studentsAssignedCount: number
        isActive: boolean
        feeStructure: { id, name }
        assignedByUser: { id, name }
        createdAt: string
      }
      studentAssignments: [
        {
          id: string
          student: { user: { name }, grade: { gradeLevel: { name } } }
          feeItems: [
            { id, amount, isMandatory, isActive }
          ]
        }
      ]
      totalStudents: number
    }
  ]
}
```

## Styling

Follows your project's design system:
- ✅ No rounded corners (as per your preferences)
- ✅ Uses etheme color palette
- ✅ Table-like appearance with borders
- ✅ Proper spacing and layout
- ✅ Font-mono for consistency
- ✅ Status colors: green (active), red (inactive), blue (mandatory)

## Customization

### Modify Colors

```tsx
// In StatusBadge component
const StatusBadge = ({ isActive }: { isActive: boolean }) => (
  <Badge 
    className={isActive 
      ? 'bg-green-50 text-green-700 border-green-200'  // Change these
      : 'bg-red-50 text-red-700 border-red-200'        // Change these
    }
  >
    {/* ... */}
  </Badge>
)
```

### Add Filters

The `FeeAssignmentsView` component has a "Filter" button ready for implementation:

```tsx
const [filters, setFilters] = useState({
  status: 'all',
  feeStructure: 'all',
  dateRange: null
})

// Filter data before passing to table
const filteredData = useMemo(() => {
  if (!data) return null
  
  return {
    ...data,
    feeAssignments: data.feeAssignments.filter(group => {
      if (filters.status !== 'all' && group.feeAssignment.isActive !== (filters.status === 'active')) {
        return false
      }
      // Add more filters
      return true
    })
  }
}, [data, filters])
```

### Add Export Functionality

The `handleExport` function in `FeeAssignmentsView` is ready to be implemented:

```tsx
const handleExport = () => {
  if (!data) return
  
  // Convert to CSV
  const rows = data.feeAssignments.flatMap(group => 
    group.studentAssignments.map(assignment => ({
      'Fee Structure': group.feeAssignment.feeStructure.name,
      'Student': assignment.student.user.name,
      'Grade': assignment.student.grade.gradeLevel.name,
      'Total Amount': calculateTotalAmount(assignment.feeItems),
      'Status': assignment.isActive ? 'Active' : 'Inactive',
      'Date': assignment.createdAt
    }))
  )
  
  // Use a CSV library or create CSV string
  downloadCSV(rows, 'fee-assignments.csv')
}
```

## Differences from FeesDataTable

| Feature | FeeAssignmentsDataTable | FeesDataTable |
|---------|------------------------|---------------|
| Purpose | Show fee structure assignments | Show invoices |
| Data Source | `getAllTenantFeeAssignments` | Invoice queries |
| Payment Status | ❌ No | ✅ Yes |
| Due Dates | ❌ No | ✅ Yes |
| Payment History | ❌ No | ✅ Yes |
| Fee Items | ✅ Shows items assigned | ❌ No |
| Expandable | ✅ Shows students | ❌ No |

## Testing

Test the component with:

```bash
# Run the GraphQL query directly
bun run test-generate-invoices.js

# Or use the GraphQL playground
# Query: getAllTenantFeeAssignments
```

## Next Steps

1. ✅ Component created and working
2. ⏳ Add to your fees page as a tab
3. ⏳ Implement filtering functionality
4. ⏳ Implement export to CSV/Excel
5. ⏳ Add ability to edit/delete assignments from the table
6. ⏳ Add pagination for large datasets

## Support

If you need to modify the component or add features:
- All functions are under 40 lines
- No nesting deeper than 3 levels
- Clear, semantic naming
- Properly typed with TypeScript
- Follows all project code standards

