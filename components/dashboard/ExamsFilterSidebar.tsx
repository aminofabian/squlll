"use client"

import { GraduationCap } from "lucide-react"
import { SchoolSearchFilter } from "@/components/dashboard/SchoolSearchFilter"
import { ScrollArea } from "@/components/ui/scroll-area"

interface ExamsFilterSidebarProps {
  selectedGradeId?: string
  onGradeSelect?: (gradeId: string, levelId: string) => void
}

export function ExamsFilterSidebar({ 
  selectedGradeId,
  onGradeSelect
}: ExamsFilterSidebarProps) {
  return (
    <div className="flex flex-col h-full">
      <ScrollArea className="flex-1">
        <div className="p-4 space-y-4">
          {/* Grade Filter Section */}
          <div className="space-y-2">
            <div className="flex items-center gap-2 px-2">
              <GraduationCap className="h-4 w-4" />
              <h3 className="text-sm font-semibold">Grade Levels</h3>
            </div>
            <div className="border rounded-lg">
              <SchoolSearchFilter
                type="grades"
                onGradeSelect={onGradeSelect}
                selectedGradeId={selectedGradeId}
                className="border-0"
              />
            </div>
          </div>
        </div>
      </ScrollArea>
    </div>
  )
} 