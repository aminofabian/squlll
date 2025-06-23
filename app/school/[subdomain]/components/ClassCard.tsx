'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { BookOpen } from 'lucide-react'
import type { Level } from '@/lib/types/school-config'

// Helper function to get component level color
function getComponentLevelColor(name: string) {
  switch(name.toLowerCase()) {
    case 'madrasa lower': return 'bg-purple-100 text-purple-800 border-purple-400';
    case 'madrasa beginners': return 'bg-custom-blue/10 text-custom-blue border-custom-blue/40';
    default: return 'bg-gray-100 text-gray-800 border-gray-400';
  }
}

export function ClassCard({ level }: { level: Level }) {
  return (
    <Card 
      className="transition-all duration-300 ease-in-out hover:shadow-lg transform hover:-translate-y-1 border-l-4 overflow-hidden" 
      style={{
        borderLeftColor: '#3b82f6'
      }}
    >
      <CardHeader className="pb-0 pt-4">
        <div className="flex justify-between items-start">
          <div>
            <div className="flex items-center gap-2">
              <CardTitle className="text-xl font-bold">{level.name}</CardTitle>
            </div>
            <CardDescription className="mt-1">{level.description}</CardDescription>
            
            <div className="flex flex-wrap gap-2 mt-3">
              <Badge className={getComponentLevelColor(level.name) + " px-2 py-1 font-medium"}>
                {level.name}
              </Badge>
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent className="pt-5">
        {/* Subjects Section */}
        <div className="mb-5 bg-custom-blue/10 p-4 shadow-sm border border-custom-blue/20">
          <h4 className="text-sm font-semibold mb-3 text-custom-blue flex items-center">
            <div className="mr-2 p-1 bg-custom-blue/15 flex items-center justify-center">
              <BookOpen className="h-3.5 w-3.5 text-custom-blue" />
            </div>
            Subjects
          </h4>
          
          <div className="grid gap-3">
            {level.subjects.map((subject) => (
              <div key={subject.id} className="bg-white p-3 shadow-sm border border-custom-blue/10">
                <div className="flex justify-between items-center">
                  <div>
                    <h5 className="font-medium">{subject.name}</h5>
                    <p className="text-sm text-gray-500">{subject.code}</p>
                  </div>
                  <Badge className={`${subject.subjectType === 'core' ? 'bg-custom-blue/10 text-custom-blue' : 'bg-gray-100 text-gray-800'}`}>
                    {subject.subjectType}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  )
} 