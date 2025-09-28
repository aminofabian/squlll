'use client'

import { Button } from "@/components/ui/button"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Send } from 'lucide-react'
import { FeeStructure, TermFeeStructure } from '../../types'

interface InvoiceGenerationTabProps {
  fallbackFeeStructures: FeeStructure[]
  getTotalStudents: (feeStructureId: string) => number
  getAssignedGrades: (feeStructureId: string) => any[]
  onGenerateInvoices: (feeStructureId: string, term: string) => void
}

export const InvoiceGenerationTab = ({
  fallbackFeeStructures,
  getTotalStudents,
  getAssignedGrades,
  onGenerateInvoices
}: InvoiceGenerationTabProps) => {
  return (
    <div className="grid gap-4">
      {fallbackFeeStructures.map((structure) => (
        <Card key={structure.id}>
          <CardHeader>
            <CardTitle className="text-lg">{structure.name}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {structure.termStructures.map((term: TermFeeStructure) => (
                <div key={term.id} className="border  p-4">
                  <h4 className="font-medium mb-2">{term.term}</h4>
                  <p className="text-sm text-gray-600 mb-2">
                    Due: {new Date(term.dueDate).toLocaleDateString()}
                  </p>
                  <p className="text-sm font-medium mb-3">
                    KES {term.totalAmount.toLocaleString()}
                  </p>
                  <Button 
                    size="sm" 
                    className="w-full"
                    onClick={() => onGenerateInvoices(structure.id, term.term)}
                  >
                    <Send className="h-4 w-4 mr-1" />
                    Generate {term.term} Invoices
                  </Button>
                </div>
              ))}
            </div>
            <div className="mt-4 p-3 bg-gray-50 ">
              <p className="text-sm text-gray-600">
                <strong>{getTotalStudents(structure.id)}</strong> students across{' '}
                <strong>{getAssignedGrades(structure.id).length}</strong> classes will receive invoices
              </p>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
