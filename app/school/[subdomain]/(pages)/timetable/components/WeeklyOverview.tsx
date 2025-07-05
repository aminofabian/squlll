import React from 'react';
import { BarChart3, BookOpen, Users, Target, Zap, TrendingUp, Coffee } from 'lucide-react';

interface WeeklyOverviewProps {
  stats: {
    totalLessons: number;
    totalTeachers: number;
    totalSubjects: number;
    doubleLessons: number;
    totalBreaks: number;
    averageLessonsPerDay: number;
    completionPercentage: number;
  };
}

export const WeeklyOverview: React.FC<WeeklyOverviewProps> = ({ stats }) => {
  return (
    <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-200">
      <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
        <BarChart3 className="w-5 h-5 text-primary" />
        Weekly Overview
      </h3>
      
      <div className="space-y-4">
        <div className="flex items-center justify-between p-3 bg-gradient-to-r from-primary/10 to-primary/5 rounded-lg">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
              <BookOpen className="w-5 h-5 text-white" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Total Lessons</p>
              <p className="text-2xl font-bold text-primary">{stats.totalLessons}</p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-sm text-gray-500">{stats.completionPercentage}%</p>
            <p className="text-xs text-gray-400">Complete</p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="p-3 bg-emerald-50 rounded-lg border border-emerald-200">
            <div className="flex items-center gap-2 mb-1">
              <Users className="w-4 h-4 text-emerald-600" />
              <span className="text-xs text-emerald-600 font-medium">Teachers</span>
            </div>
            <p className="text-xl font-bold text-emerald-700">{stats.totalTeachers}</p>
          </div>

          <div className="p-3 bg-amber-50 rounded-lg border border-amber-200">
            <div className="flex items-center gap-2 mb-1">
              <Target className="w-4 h-4 text-amber-600" />
              <span className="text-xs text-amber-600 font-medium">Subjects</span>
            </div>
            <p className="text-xl font-bold text-amber-700">{stats.totalSubjects}</p>
          </div>

          <div className="p-3 bg-sky-50 rounded-lg border border-sky-200">
            <div className="flex items-center gap-2 mb-1">
              <Zap className="w-4 h-4 text-sky-600" />
              <span className="text-xs text-sky-600 font-medium">Double Lessons</span>
            </div>
            <p className="text-xl font-bold text-sky-700">{stats.doubleLessons}</p>
          </div>

          <div className="p-3 bg-orange-50 rounded-lg border border-orange-200">
            <div className="flex items-center gap-2 mb-1">
              <Coffee className="w-4 h-4 text-orange-600" />
              <span className="text-xs text-orange-600 font-medium">Break Periods</span>
            </div>
            <p className="text-xl font-bold text-orange-700">{stats.totalBreaks}</p>
          </div>

          <div className="p-3 bg-purple-50 rounded-lg border border-purple-200 col-span-2">
            <div className="flex items-center gap-2 mb-1">
              <TrendingUp className="w-4 h-4 text-purple-600" />
              <span className="text-xs text-purple-600 font-medium">Average Lessons/Day</span>
            </div>
            <p className="text-xl font-bold text-purple-700">{stats.averageLessonsPerDay}</p>
          </div>
        </div>
      </div>
    </div>
  );
}; 