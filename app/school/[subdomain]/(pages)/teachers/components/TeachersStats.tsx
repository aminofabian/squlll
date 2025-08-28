"use client";

import React, { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { 
  Users,
  CheckCircle,
  BookOpen,
  Award,
  BarChart3,
  ChevronDown,
  ChevronRight
} from "lucide-react";

// Teacher type definition (simplified for stats use)
type Teacher = {
  id: string;
  name: string;
  department: string;
  status: "active" | "on leave" | "former" | "substitute" | "retired";
  performance?: {
    rating: number;
  };
};

interface TeachersStatsProps {
  teachers: Teacher[];
}

export function TeachersStats({ teachers }: TeachersStatsProps) {
  const [showStats, setShowStats] = useState(false);

  // Calculate statistics
  const totalTeachers = teachers.length;
  const activeTeachers = teachers.filter(t => t.status === 'active').length;
  const departments = [...new Set(teachers.map(t => t.department))].length;
  const highPerformers = teachers.filter(t => t.performance?.rating && t.performance.rating >= 4).length;

  return (
    <div className="mb-8">
      <div className="border-2 border-primary/20 bg-primary/5 rounded-xl overflow-hidden">
        <button
          onClick={() => setShowStats(!showStats)}
          className="w-full p-4 flex items-center justify-between hover:bg-primary/10 transition-colors"
        >
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center">
              <BarChart3 className="h-4 w-4 text-primary" />
            </div>
            <div className="text-left">
              <h3 className="font-mono font-semibold text-slate-900 dark:text-slate-100">Teacher Statistics</h3>
              <p className="text-sm text-slate-600 dark:text-slate-400">View comprehensive teacher statistics and metrics</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Badge className="bg-primary/20 text-primary border border-primary/30 font-mono text-xs">
              {totalTeachers} Teachers
            </Badge>
            {showStats ? (
              <ChevronDown className="w-5 h-5 text-primary" />
            ) : (
              <ChevronRight className="w-5 h-5 text-primary" />
            )}
          </div>
        </button>
        
        {showStats && (
          <div className="border-t-2 border-primary/20 bg-white dark:bg-slate-800 p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="p-4 bg-primary/5 rounded-lg border border-primary/20">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                    <Users className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <div className="text-2xl font-mono font-bold text-slate-900 dark:text-slate-100">
                      {totalTeachers}
                    </div>
                    <div className="text-sm text-slate-600 dark:text-slate-400 font-medium">
                      Total Teachers
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="p-4 bg-primary/5 rounded-lg border border-primary/20">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                    <CheckCircle className="h-5 w-5 text-green-600" />
                  </div>
                  <div>
                    <div className="text-2xl font-mono font-bold text-slate-900 dark:text-slate-100">
                      {activeTeachers}
                    </div>
                    <div className="text-sm text-slate-600 dark:text-slate-400 font-medium">
                      Active Teachers
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="p-4 bg-primary/5 rounded-lg border border-primary/20">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                    <BookOpen className="h-5 w-5 text-blue-600" />
                  </div>
                  <div>
                    <div className="text-2xl font-mono font-bold text-slate-900 dark:text-slate-100">
                      {departments}
                    </div>
                    <div className="text-sm text-slate-600 dark:text-slate-400 font-medium">
                      Departments
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="p-4 bg-primary/5 rounded-lg border border-primary/20">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-yellow-100 rounded-lg flex items-center justify-center">
                    <Award className="h-5 w-5 text-yellow-600" />
                  </div>
                  <div>
                    <div className="text-2xl font-mono font-bold text-slate-900 dark:text-slate-100">
                      {highPerformers}
                    </div>
                    <div className="text-sm text-slate-600 dark:text-slate-400 font-medium">
                      High Performers
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
