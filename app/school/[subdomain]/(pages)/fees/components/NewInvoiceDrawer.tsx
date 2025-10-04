'use client'

import React, { useState, useEffect } from 'react'
// Removed drawer imports - using custom right-side drawer
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { Calendar } from '@/components/ui/calendar'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { CalendarIcon, Loader2 } from 'lucide-react'
import { format } from 'date-fns'
import { cn } from '@/lib/utils'
import { useToast } from '@/components/ui/use-toast'
import { useGraphQLInvoices, CreateInvoiceInput } from '../hooks/useGraphQLInvoices'
import { useAcademicYears } from '@/lib/hooks/useAcademicYears'
import { useGradeLevels } from '../hooks/useGradeLevels'
import type { NewInvoiceForm, StudentSummary } from '../types'

interface NewInvoiceDrawerProps {
  isOpen: boolean
  onClose: () => void
  form: NewInvoiceForm
  setForm: (updater: (prev: NewInvoiceForm) => NewInvoiceForm) => void
  onSubmit: () => void
  selectedStudent: string | null
  allStudents: StudentSummary[]
  isGenerating?: boolean
}

export default function NewInvoiceDrawer({
  isOpen,
  onClose,
  form,
  setForm,
  onSubmit,
  selectedStudent,
  allStudents,
  isGenerating = false
}: NewInvoiceDrawerProps) {
  const { toast } = useToast()
  const { generateInvoices } = useGraphQLInvoices()
  const { academicYears, loading: academicYearsLoading } = useAcademicYears()
  
  const [issueDate, setIssueDate] = useState<Date | undefined>(new Date())
  const [dueDate, setDueDate] = useState<Date | undefined>(new Date())
  const [selectedAcademicYear, setSelectedAcademicYear] = useState<string>('')
  const [selectedTerm, setSelectedTerm] = useState<string>('')
  const [selectedStudentId, setSelectedStudentId] = useState<string>(selectedStudent || '')

  // Get current academic year and terms
  const currentAcademicYear = academicYears.find(ay => ay.isActive)
  const availableTerms = currentAcademicYear?.terms || []

  // Initialize form when drawer opens
  useEffect(() => {
    if (isOpen) {
      setSelectedStudentId(selectedStudent || '')
      setSelectedAcademicYear(currentAcademicYear?.id || '')
      if (availableTerms.length > 0) {
        setSelectedTerm(availableTerms[0].id)
      }
    }
  }, [isOpen, selectedStudent, currentAcademicYear, availableTerms])

  // Update form when dates change
  useEffect(() => {
    if (issueDate) {
      setForm(prev => ({
        ...prev,
        issueDate: format(issueDate, 'yyyy-MM-dd')
      }))
    }
  }, [issueDate, setForm])

  useEffect(() => {
    if (dueDate) {
      setForm(prev => ({
        ...prev,
        dueDate: format(dueDate, 'yyyy-MM-dd')
      }))
    }
  }, [dueDate, setForm])

  // Update form when student changes
  useEffect(() => {
    setForm(prev => ({
      ...prev,
      studentId: selectedStudentId
    }))
  }, [selectedStudentId, setForm])

  // Update form when term changes
  useEffect(() => {
    setForm(prev => ({
      ...prev,
      termId: selectedTerm
    }))
  }, [selectedTerm, setForm])

  const handleSubmit = async () => {
    if (!selectedStudentId) {
      toast({
        title: "Student Required",
        description: "Please select a student for the invoice.",
        variant: "destructive",
      })
      return
    }

    if (!selectedTerm) {
      toast({
        title: "Term Required",
        description: "Please select a term for the invoice.",
        variant: "destructive",
      })
      return
    }

    if (!issueDate || !dueDate) {
      toast({
        title: "Dates Required",
        description: "Please select both issue date and due date.",
        variant: "destructive",
      })
      return
    }

    try {
      const input: CreateInvoiceInput = {
        studentId: selectedStudentId,
        termId: selectedTerm,
        issueDate: format(issueDate, 'yyyy-MM-dd'),
        dueDate: format(dueDate, 'yyyy-MM-dd'),
        notes: form.notes || undefined
      }

      const result = await generateInvoices(input)
      
      if (result && result.length > 0) {
        toast({
          title: "Invoice Generated Successfully",
          description: `Generated ${result.length} invoice(s) for the selected student.`,
          variant: "success",
        })
        onSubmit()
        onClose()
      } else {
        toast({
          title: "No Invoice Generated",
          description: "No invoices were generated. The student may not have fee structures assigned. Please assign fee structures to the student first.",
          variant: "destructive",
        })
      }
    } catch (error) {
      toast({
        title: "Error Generating Invoice",
        description: error instanceof Error ? error.message : "An unexpected error occurred.",
        variant: "destructive",
      })
    }
  }

  const selectedStudentData = allStudents.find(s => s.id === selectedStudentId)

  return (
    <>
      {/* Backdrop */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 animate-in fade-in-0"
          onClick={onClose}
        />
      )}
      
      {/* Right Side Drawer */}
      <div className={cn(
        "fixed top-0 right-0 h-full w-full max-w-2xl bg-background border-l shadow-lg z-50 transform transition-transform duration-300 ease-in-out",
        isOpen ? "translate-x-0" : "translate-x-full"
      )}>
        {/* Header */}
        <div className="flex flex-col space-y-1.5 p-6 pb-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold">
              Generate New Invoice
            </h2>
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="h-8 w-8 p-0"
            >
              <span className="sr-only">Close</span>
              ×
            </Button>
          </div>
          <p className="text-sm text-muted-foreground">
            Create a new invoice for the selected student and term
          </p>
        </div>

        <div className="px-4 pb-4 space-y-6">
          {/* Student Selection */}
          <div className="space-y-2">
            <Label htmlFor="student">Student</Label>
            <Select value={selectedStudentId} onValueChange={setSelectedStudentId}>
              <SelectTrigger>
                <SelectValue placeholder="Select a student" />
              </SelectTrigger>
              <SelectContent>
                {allStudents.map((student) => (
                  <SelectItem key={student.id} value={student.id}>
                    <div className="flex flex-col">
                      <span className="font-medium">{student.name}</span>
                      <span className="text-xs text-muted-foreground">
                        {student.admissionNumber} • {student.class} {student.section}
                      </span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {selectedStudentData && (
              <p className="text-xs text-muted-foreground">
                Selected: {selectedStudentData.name} ({selectedStudentData.admissionNumber})
              </p>
            )}
          </div>

          {/* Helpful Information */}
          {selectedStudentData && (
            <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-blue-600 text-xs">ℹ</span>
                </div>
                <div className="space-y-2">
                  <h4 className="text-sm font-medium text-blue-900">Before Generating Invoice</h4>
                  <p className="text-xs text-blue-700">
                    Make sure the student has fee structures assigned. If no invoice is generated, 
                    you may need to assign fee structures to this student first.
                  </p>
                  <p className="text-xs text-blue-600 font-medium">
                    💡 Tip: Go to Fee Assignments to assign fee structures to students.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Academic Year */}
          <div className="space-y-2">
            <Label htmlFor="academicYear">Academic Year</Label>
            <Select value={selectedAcademicYear} onValueChange={setSelectedAcademicYear} disabled>
              <SelectTrigger>
                <SelectValue placeholder="Select academic year" />
              </SelectTrigger>
              <SelectContent>
                {academicYears.map((year) => (
                  <SelectItem key={year.id} value={year.id}>
                    {year.name} {year.isActive && '(Current)'}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Term Selection */}
          <div className="space-y-2">
            <Label htmlFor="term">Term</Label>
            <Select value={selectedTerm} onValueChange={setSelectedTerm}>
              <SelectTrigger>
                <SelectValue placeholder="Select a term" />
              </SelectTrigger>
              <SelectContent>
                {availableTerms.map((term) => (
                  <SelectItem key={term.id} value={term.id}>
                    {term.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Date Fields */}
          <div className="grid grid-cols-2 gap-4">
            {/* Issue Date */}
            <div className="space-y-2">
              <Label>Issue Date</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !issueDate && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {issueDate ? format(issueDate, "PPP") : "Pick a date"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={issueDate}
                    onSelect={setIssueDate}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>

            {/* Due Date */}
            <div className="space-y-2">
              <Label>Due Date</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !dueDate && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {dueDate ? format(dueDate, "PPP") : "Pick a date"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={dueDate}
                    onSelect={setDueDate}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>
          </div>

          {/* Notes */}
          <div className="space-y-2">
            <Label htmlFor="notes">Notes (Optional)</Label>
            <Textarea
              id="notes"
              placeholder="Add any additional notes for this invoice..."
              value={form.notes || ''}
              onChange={(e) => setForm(prev => ({ ...prev, notes: e.target.value }))}
              rows={3}
            />
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 pt-4">
          <div className="flex gap-2">
            <Button 
              variant="outline" 
              className="flex-1"
              onClick={onClose}
            >
              Cancel
            </Button>
            <Button 
              onClick={handleSubmit} 
              disabled={isGenerating}
              className="flex-1"
            >
              {isGenerating ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Generating...
                </>
              ) : (
                'Generate Invoice'
              )}
            </Button>
          </div>
        </div>
      </div>
    </>
  )
}
