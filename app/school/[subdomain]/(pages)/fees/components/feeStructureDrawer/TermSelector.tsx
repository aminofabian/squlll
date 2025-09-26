'use client'

import React from 'react'
import { Calendar } from "lucide-react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

interface TermSelectorProps { 
  selectedTerm: string
  selectedAcademicYear: string
  onTermChange: (term: string) => void
  variant?: "default" | "pill" | "compact"
  academicYears: Array<{
    id: string
    name: string
    terms?: Array<{
      id: string
      name: string
    }>
  }>
}

export const TermSelector: React.FC<TermSelectorProps> = ({ 
  selectedTerm, 
  selectedAcademicYear, 
  onTermChange,
  variant = "default",
  academicYears
}) => {
  // Get all terms for the selected academic year
  const academicYearObj = academicYears.find(year => year.name === selectedAcademicYear)
  const availableTerms = academicYearObj?.terms || []
  
  // Styling classes based on variant
  const getClasses = () => {
    switch(variant) {
      case "pill":
        return "flex items-center gap-1 text-sm py-1 px-2 rounded-full bg-primary/10 hover:bg-primary/20 transition-colors"
      case "compact":
        return "flex items-center gap-1 text-xs p-1 rounded bg-slate-100"
      default:
        return "flex items-center gap-2 text-sm"
    }
  }

  return (
    <Select
      value={selectedTerm}
      onValueChange={onTermChange}
    >
      <SelectTrigger className={getClasses()}>
        <Calendar className="h-3.5 w-3.5 text-primary/80" />
        <span className={variant === "compact" ? "text-xs" : ""}>
          {selectedTerm || "Select Term..."}
        </span>
      </SelectTrigger>
      <SelectContent>
        {availableTerms.length > 0 ? (
          availableTerms.map(term => (
            <SelectItem key={term.id} value={term.name}>
              {term.name}
            </SelectItem>
          ))
        ) : (
          <SelectItem value="" disabled>
            No terms available
          </SelectItem>
        )}
      </SelectContent>
    </Select>
  )
}
