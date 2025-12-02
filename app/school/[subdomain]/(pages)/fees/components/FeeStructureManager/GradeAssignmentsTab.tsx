'use client'

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { FeeStructure } from '../../types'
import { Loader2, Info } from 'lucide-react'

interface GradeAssignmentsTabProps {
  isLoadingGrades: boolean
  gradesError: string | null
  grades: Array<any>
  usedGradesFallback: boolean
  structures: Array<any> | null
  fallbackFeeStructures: FeeStructure[]
  onAssignToGrade: (feeStructureId: string, name: string, academicYear?: string, academicYearId?: string, termId?: string) => void
}

export const GradeAssignmentsTab = ({
  isLoadingGrades,
  gradesError,
  grades,
  usedGradesFallback,
  structures,
  fallbackFeeStructures,
  onAssignToGrade
}: GradeAssignmentsTabProps) => {
  if (isLoadingGrades) {
    return (
      <div className="flex justify-center items-center p-8">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-3 text-lg">Loading grades...</span>
      </div>
    )
  }
  
  if (gradesError) {
    return (
      <div className="p-6 border border-red-200  bg-red-50">
        <h3 className="text-red-600 font-medium mb-2">Error loading grades</h3>
        <p className="text-red-500">{gradesError}</p>
        <div className="mt-4">
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => window.location.reload()}
          >
            <Loader2 className="h-4 w-4 mr-1" />
            Reload Page
          </Button>
        </div>
      </div>
    )
  }
  
  return (
    <div className="space-y-4">
      {usedGradesFallback && (
        <div className="bg-amber-50 p-4  border border-amber-200 mb-4">
          <div className="flex items-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-amber-500 mr-2" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
            <span className="font-medium text-amber-800">Using Fallback Grade Data</span>
          </div>
          <p className="text-sm text-amber-700 mt-1">Unable to fetch real grade data from the API. Using sample data instead.</p>
        </div>
      )}
      
      <div className="grid gap-4">
        {grades.length > 0 ? grades.map((grade) => {
          // Find the assigned structure - try from real structures first, then fallback
          const graphQLStructure = structures?.find(s => s.id === grade.feeStructureId);
          const fallbackStructure = fallbackFeeStructures.find((fs: FeeStructure) => fs.id === grade.feeStructureId);
          
          // Use the GraphQL structure if available, otherwise fall back to mock data
          const assignedStructure = fallbackStructure;
            
          return (
            <Card key={grade.id}>
              <CardContent className="pt-6">
                <div className="flex justify-between items-center">
                  <div>
                    <h3 className="font-medium">{grade.name} - Section {grade.section}</h3>
                    <p className="text-sm text-gray-600">
                      {grade.studentCount} students • {grade.boardingType}
                    </p>
                  </div>
                  <div className="text-right">
                    {assignedStructure ? (
                      <div>
                        <Badge variant="default">{assignedStructure.name}</Badge>
                        <p className="text-sm text-gray-600 mt-1">
                          {assignedStructure.termStructures && assignedStructure.termStructures[0] ? 
                            `KES ${assignedStructure.termStructures[0].totalAmount.toLocaleString()} per term` : 
                            'Fee amount not available'}
                        </p>
                      </div>
                    ) : (
                      <div>
                        <Badge variant="secondary">No Structure Assigned</Badge>
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="mt-2"
                          onClick={() => {
                            // Find the first available structure to use for assignment
                            const availableStructure = structures && structures.length > 0 
                              ? structures[0]
                              : fallbackFeeStructures.length > 0 
                                ? fallbackFeeStructures[0]
                                : null;
                            
                            if (availableStructure) {
                              onAssignToGrade(
                                availableStructure.id || availableStructure.structureId || '',
                                availableStructure.name || availableStructure.structureName || '',
                                availableStructure.academicYear,
                                availableStructure.academicYearId,
                                availableStructure.termId
                              );
                            } else {
                              // If no structures available, show a message
                              alert('No fee structures available. Please create a fee structure first.');
                            }
                          }}
                        >
                          Assign Structure
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          )
        }) : (
          <div className="text-center p-8 border border-dashed border-gray-300 ">
            <h3 className="text-gray-500 font-medium mb-2">No Grades Available</h3>
            <p className="text-sm text-gray-400">No grade information is currently available.</p>
          </div>
        )}
      </div>
    </div>
  )
}
