'use client'

import { useSelectedTerm } from '@/lib/hooks/useSelectedTerm'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Calendar } from 'lucide-react'

/**
 * Example component showing how to use the selected term in other parts of the application
 */
export function ExampleTermUsage() {
  const { selectedTerm } = useSelectedTerm()

  if (!selectedTerm) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Current Term
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">No term selected</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Calendar className="h-5 w-5" />
          Current Term
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          <div>
            <span className="font-medium">Term:</span> {selectedTerm.name}
          </div>
          <div>
            <span className="font-medium">Academic Year:</span> {selectedTerm.academicYear.name}
          </div>
          <div>
            <span className="font-medium">Period:</span>{' '}
            {new Date(selectedTerm.startDate).toLocaleDateString()} -{' '}
            {new Date(selectedTerm.endDate).toLocaleDateString()}
          </div>
          {selectedTerm.isActive && (
            <div className="text-green-600 font-medium">✓ Active Term</div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}

/**
 * Usage in other components:
 * 
 * import { useSelectedTerm } from '@/lib/hooks/useSelectedTerm'
 * 
 * function MyComponent() {
 *   const { selectedTerm, setSelectedTerm } = useSelectedTerm()
 *   
 *   // Use selectedTerm in your component logic
 *   if (selectedTerm) {
 *     // Filter data by term, show term-specific content, etc.
 *     console.log('Current term:', selectedTerm.name)
 *   }
 *   
 *   return (
 *     <div>
 *       {selectedTerm && (
 *         <p>Showing data for {selectedTerm.name}</p>
 *       )}
 *     </div>
 *   )
 * }
 */
