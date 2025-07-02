"use client"

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { GraduationCap, Calendar, Book } from "lucide-react"

interface ExamsSidebarProps {
  selectedClass: string
  selectedTerm: string
  selectedYear: string
  onClassChange: (value: string) => void
  onTermChange: (value: string) => void
  onYearChange: (value: string) => void
}

const classes = [
  "Form 1A", "Form 1B", "Form 1C",
  "Form 2A", "Form 2B", "Form 2C",
  "Form 3A", "Form 3B", "Form 3C",
  "Form 4A", "Form 4B", "Form 4C"
]

const terms = ["Term 1", "Term 2", "Term 3"]
const years = ["2023", "2024", "2025"]

export function ExamsSidebar({
  selectedClass,
  selectedTerm,
  selectedYear,
  onClassChange,
  onTermChange,
  onYearChange
}: ExamsSidebarProps) {
  return (
    <div className="p-4 space-y-4">
      <div>
        <h2 className="text-lg font-semibold mb-4">Exams Management</h2>
      </div>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm flex items-center gap-2">
            <GraduationCap className="h-4 w-4" />
            Class Selection
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Select value={selectedClass} onValueChange={onClassChange}>
            <SelectTrigger>
              <SelectValue placeholder="Select class" />
            </SelectTrigger>
            <SelectContent>
              {classes.map((cls) => (
                <SelectItem key={cls} value={cls}>
                  {cls}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm flex items-center gap-2">
            <Calendar className="h-4 w-4" />
            Academic Period
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div>
            <label className="text-xs text-muted-foreground mb-1 block">Term</label>
            <Select value={selectedTerm} onValueChange={onTermChange}>
              <SelectTrigger>
                <SelectValue placeholder="Select term" />
              </SelectTrigger>
              <SelectContent>
                {terms.map((term) => (
                  <SelectItem key={term} value={term}>
                    {term}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div>
            <label className="text-xs text-muted-foreground mb-1 block">Academic Year</label>
            <Select value={selectedYear} onValueChange={onYearChange}>
              <SelectTrigger>
                <SelectValue placeholder="Select year" />
              </SelectTrigger>
              <SelectContent>
                {years.map((year) => (
                  <SelectItem key={year} value={year}>
                    {year}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm flex items-center gap-2">
            <Book className="h-4 w-4" />
            Quick Stats
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center">
            <div className="text-xs text-muted-foreground">Current Selection</div>
            <div className="font-medium">{selectedClass}</div>
            <div className="text-xs">{selectedTerm} {selectedYear}</div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
} 