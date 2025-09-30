import React from 'react'
import { Clock, GraduationCap } from "lucide-react"
import { Badge } from "@/components/ui/badge"

interface TermBadgesProps {
  term: string
  academicYear: string
  isFirstComponent: boolean
}

export const TermBadges: React.FC<TermBadgesProps> = ({ term, academicYear, isFirstComponent }) => {
  if (!isFirstComponent) {
    return (
      <div className="h-8 flex items-center justify-center">
        <div className="w-px h-4 bg-primary/30"></div>
      </div>
    )
  }
  
  const getTermBadgeStyle = (termName: string) => {
    switch(termName) {
      case 'Term 1': return 'bg-primary/10 text-primary border-primary/30'
      case 'Term 2': return 'bg-primary/15 text-primary border-primary/30'
      case 'Term 3': return 'bg-primary/20 text-primary border-primary/30'
      default: return 'bg-primary/25 text-primary border-primary/30'
    }
  }
  
  return (
    <div className="flex flex-col items-center justify-center gap-1">
      <Badge 
        variant="outline" 
        className={`text-xs font-bold shadow-sm ${getTermBadgeStyle(term)}`}
      >
        <Clock className="h-3 w-3 mr-1" />
        {term.toUpperCase()}
      </Badge>
      <Badge 
        variant="outline" 
        className="text-xs bg-blue-50 text-blue-700 border-blue-200 shadow-sm flex items-center"
      >
        <GraduationCap className="h-3 w-3 mr-1" />
        {academicYear}
      </Badge>
    </div>
  )
}
