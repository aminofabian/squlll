"use client"

import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Progress } from "@/components/ui/progress"
import { Search, Users, User, TrendingUp, TrendingDown } from "lucide-react"
import { mockStudentResults } from "@/lib/data/mockExams"

interface StudentResult {
  id: string
  name: string
  admissionNumber: string
  averageScore: number
  totalExams: number
  rank: number
  trend: 'up' | 'down' | 'stable'
}

interface StudentsFilterSidebarProps {
  searchTerm: string
  onSearchChange: (value: string) => void
  onStudentSelect: (studentId: string) => void
  selectedStudentId?: string
}

// Mock student data - in real app this would come from props or API
const mockStudents: StudentResult[] = [
  {
    id: "student-1",
    name: "Kevin Ochieng",
    admissionNumber: "F2A001",
    averageScore: 87,
    totalExams: 5,
    rank: 1,
    trend: 'up'
  },
  {
    id: "student-2", 
    name: "Mercy Wanjiru",
    admissionNumber: "F2A002",
    averageScore: 73,
    totalExams: 5,
    rank: 8,
    trend: 'stable'
  },
  {
    id: "student-3",
    name: "Brian Kiprop", 
    admissionNumber: "F2A003",
    averageScore: 45,
    totalExams: 4,
    rank: 25,
    trend: 'down'
  },
  {
    id: "student-4",
    name: "Faith Muthoni",
    admissionNumber: "F2A004", 
    averageScore: 62,
    totalExams: 5,
    rank: 15,
    trend: 'up'
  },
  {
    id: "student-5",
    name: "Daniel Kiprotich",
    admissionNumber: "F2A005",
    averageScore: 78,
    totalExams: 5, 
    rank: 4,
    trend: 'stable'
  }
]

export function ExamsFilterSidebar({ searchTerm, onSearchChange, onStudentSelect, selectedStudentId }: StudentsFilterSidebarProps) {
  const filteredStudents = mockStudents.filter(student =>
    student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    student.admissionNumber.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const getPerformanceColor = (score: number) => {
    if (score >= 80) return 'text-green-600'
    if (score >= 65) return 'text-blue-600'
    if (score >= 50) return 'text-orange-600'
    return 'text-red-600'
  }

  const getProgressColor = (score: number) => {
    if (score >= 80) return 'bg-green-500'
    if (score >= 65) return 'bg-blue-500'
    if (score >= 50) return 'bg-orange-500'
    return 'bg-red-500'
  }

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'up':
        return <TrendingUp className="h-3 w-3 text-green-500" />
      case 'down':
        return <TrendingDown className="h-3 w-3 text-red-500" />
      default:
        return <div className="h-3 w-3 bg-gray-400 rounded-full" />
    }
  }

  return (
    <div className="p-4 space-y-4">
      <div className="flex items-center gap-2">
        <Users className="h-5 w-5" />
        <h3 className="font-medium">Students</h3>
        <Badge variant="outline" className="ml-auto">
          {filteredStudents.length}
        </Badge>
      </div>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm flex items-center gap-2">
            <Search className="h-4 w-4" />
            Search Students
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Input
            placeholder="Search by name or admission number..."
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm">Class Performance</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {filteredStudents.map((student) => (
            <div
              key={student.id}
              className={`p-3 rounded-lg border cursor-pointer transition-colors hover:bg-muted/50 ${
                selectedStudentId === student.id ? 'bg-muted border-primary' : 'bg-background'
              }`}
              onClick={() => onStudentSelect(student.id)}
            >
              <div className="flex items-start gap-3">
                <Avatar className="h-8 w-8">
                  <AvatarFallback className="text-xs">
                    {student.name.split(' ').map(n => n[0]).join('')}
                  </AvatarFallback>
                </Avatar>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-sm truncate">{student.name}</p>
                      <p className="text-xs text-muted-foreground">{student.admissionNumber}</p>
                    </div>
                    <div className="flex items-center gap-1">
                      {getTrendIcon(student.trend)}
                      <span className={`text-xs font-medium ${getPerformanceColor(student.averageScore)}`}>
                        {student.averageScore}%
                      </span>
                    </div>
                  </div>
                  
                  <div className="mt-2">
                    <div className="flex items-center justify-between text-xs mb-1">
                      <span>Rank #{student.rank}</span>
                      <span>{student.totalExams} exams</span>
                    </div>
                    <Progress 
                      value={student.averageScore} 
                      className="h-1.5"
                      style={{
                        background: getProgressColor(student.averageScore)
                      }}
                    />
                  </div>
                </div>
              </div>
            </div>
          ))}
          
          {filteredStudents.length === 0 && (
            <div className="text-center py-6">
              <User className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
              <p className="text-sm text-muted-foreground">No students found</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
} 