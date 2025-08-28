"use client"

import React, { useState, useEffect } from "react"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { Search, BookOpen, Users, Banknote, CalendarClock } from "lucide-react"

interface StudentSummary {
  id: string
  name: string
  photo?: string
  age: number
  grade: {
    gradeLevel: {
      name: string
    }
  }
  class: string
  admissionNumber: string
  feesBalance?: number
  status: string
}

interface StudentSearchFilterProps {
  students: StudentSummary[]
  onStudentSelect: (studentId: string) => void
  selectedStudentId?: string
  className?: string
}

export function StudentSearchFilter({ 
  students,
  onStudentSelect,
  selectedStudentId,
  className = ""
}: StudentSearchFilterProps) {
  const [searchTerm, setSearchTerm] = useState("")
  const [filteredStudents, setFilteredStudents] = useState<StudentSummary[]>(students)
  
  // Filter students when search term changes
  useEffect(() => {
    if (!searchTerm.trim()) {
      setFilteredStudents(students)
      return
    }
    
    const lowercasedSearch = searchTerm.toLowerCase()
    const filtered = students.filter(student => 
      student.name.toLowerCase().includes(lowercasedSearch) ||
      student.admissionNumber.toLowerCase().includes(lowercasedSearch) ||
      student.class.toLowerCase().includes(lowercasedSearch) ||
      student.grade.gradeLevel.name.toLowerCase().includes(lowercasedSearch)
    )
    
    setFilteredStudents(filtered)
  }, [searchTerm, students])
  
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value)
  }

  // Get status color for badge
  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'active':
        return 'bg-green-100 text-green-800 border-green-200'
      case 'inactive':
        return 'bg-gray-100 text-gray-800 border-gray-200'
      case 'transferred':
        return 'bg-blue-100 text-blue-800 border-blue-200'
      case 'graduated':
        return 'bg-purple-100 text-purple-800 border-purple-200'
      case 'suspended':
        return 'bg-red-100 text-red-800 border-red-200'
      default:
        return 'bg-slate-100 text-slate-800 border-slate-200'
    }
  }
  
  return (
    <div className={`w-full ${className}`}>
      <div className="relative mb-4">
        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
        <Input
          type="text"
          placeholder="Search students..."
          className="pl-9"
          value={searchTerm}
          onChange={handleSearchChange}
        />
      </div>
      
      {filteredStudents.length === 0 ? (
        <div className="text-center p-4 border rounded-md bg-slate-50">
          <p className="text-sm text-muted-foreground">No students found</p>
        </div>
      ) : (
        <div className="space-y-1">
          {filteredStudents.map((student) => (
            <Button
              key={student.id}
              variant={selectedStudentId === student.id ? "secondary" : "ghost"}
              className={`w-full justify-start p-3 h-auto ${
                selectedStudentId === student.id ? "bg-slate-100" : ""
              }`}
              onClick={() => onStudentSelect(student.id)}
            >
              <div className="w-full flex flex-col items-start gap-1">
                <div className="w-full flex justify-between items-center">
                  <span className="font-medium text-base">{student.name}</span>
                  <Badge className={`text-xs font-normal ${getStatusColor(student.status)}`}>
                    {student.status}
                  </Badge>
                </div>
                
                <div className="w-full grid grid-cols-2 gap-x-2 gap-y-1 text-xs mt-1">
                  <span className="flex items-center gap-1">
                    <BookOpen className="h-3 w-3 opacity-70" />
                    {student.class}
                  </span>
                  <span className="flex items-center gap-1">
                    <Users className="h-3 w-3 opacity-70" />
                    Age: {student.age}
                  </span>
                  {student.feesBalance !== undefined && (
                    <span className="flex items-center gap-1">
                      <Banknote className="h-3 w-3 opacity-70" />
                      Fees: KSH {student.feesBalance.toLocaleString()}
                    </span>
                  )}
                  <span className="flex items-center gap-1">
                    <CalendarClock className="h-3 w-3 opacity-70" />
                    #{student.admissionNumber}
                  </span>
                </div>
              </div>
            </Button>
          ))}
        </div>
      )}
    </div>
  )
}
