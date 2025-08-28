"use client";

import React from "react";
import { Badge } from "@/components/ui/badge";
import { 
  Card, 
  CardContent, 
  CardHeader
} from "@/components/ui/card";
import { User } from "lucide-react";

// Teacher type definition (simplified for card use)
type Teacher = {
  id: string;
  name: string;
  designation: string;
  department: string;
  subjects: string[];
  classesAssigned: string[];
  photo?: string;
  status: "active" | "on leave" | "former" | "substitute" | "retired";
};

interface TeacherCardProps {
  teacher: Teacher;
  isSelected?: boolean;
}

export function TeacherCard({ teacher, isSelected }: TeacherCardProps) {
  // Special handling for Dr. Alice Johnson
  const isAliceJohnson = teacher.name === "Dr. Alice Johnson";

  return (
    <Card className={`h-full hover:shadow-md transition-all ${isSelected ? 'ring-2 ring-primary shadow-md' : ''}`}>
      <CardHeader>
        <div>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full overflow-hidden bg-gray-100">
              {teacher.photo ? (
                <img src={teacher.photo} alt={teacher.name} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-gray-200">
                  <User className="w-4 h-4 text-gray-400" />
                </div>
              )}
            </div>
            <div>
              <h4 className="font-medium">{teacher.name}</h4>
              <p className="text-sm text-muted-foreground capitalize">
                {teacher.designation.replace('_', ' ')}
              </p>
            </div>
          </div>
          {isAliceJohnson && (
            <Badge variant="outline" className="mt-2 bg-green-50 text-green-700 border-green-200">
              Active
            </Badge>
          )}
        </div>
      </CardHeader>
      <CardContent className="pt-0 space-y-4">
        <div>
          <p className="text-sm text-muted-foreground mb-1">Department</p>
          <p className="font-medium capitalize">{teacher.department}</p>
        </div>
        <div>
          <p className="text-sm text-muted-foreground mb-1">Classes & Grades</p>
          <div className="flex flex-wrap gap-1">
            {teacher.classesAssigned.map((className: string, index: number) => (
              <Badge key={`class-${index}`} variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                {className}
              </Badge>
            ))}
            {teacher.subjects.map((subject: string, index: number) => (
              <Badge key={`subject-${index}`} variant="outline" className="bg-green-50 text-green-700 border-green-200">
                {subject}
              </Badge>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
