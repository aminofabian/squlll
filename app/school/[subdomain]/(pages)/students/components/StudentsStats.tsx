"use client"

import React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { 
  Users, 
  UserPlus, 
  Calendar, 
  BookOpen, 
  GraduationCap,
  Award,
  Activity,
  Heart,
  Bus,
  Target,
  TrendingUp,
  CheckCircle,
  Clock,
  School,
  Star
} from 'lucide-react'

interface StudentsStatsProps {
  totalStudents: number
  studentsAddedToday?: number
  absentToday?: number
  presentToday?: number
  classesWithMarkedRegisters?: number
  totalClasses?: number
  topPerformingGrade?: string
  studentsWithScholarships?: number
  newAdmissionsThisMonth?: number
  feeDefaulters?: number
  averageGrade?: string
}

export function StudentsStats({
  totalStudents = 0,
  studentsAddedToday = 0,
  absentToday = 0,
  presentToday = 0,
  classesWithMarkedRegisters = 0,
  totalClasses = 0,
  topPerformingGrade = "N/A",
  studentsWithScholarships = 0,
  newAdmissionsThisMonth = 0,
  feeDefaulters = 0,
  averageGrade = "N/A"
}: StudentsStatsProps) {
  
  const attendancePercentage = totalStudents > 0 ? Math.round((presentToday / totalStudents) * 100) : 0
  const registerCompletionPercentage = totalClasses > 0 ? Math.round((classesWithMarkedRegisters / totalClasses) * 100) : 0

  return (
    <div className="space-y-6">
      {/* Header Section */}
      <div className="border-2 border-primary/20 bg-primary/5 rounded-xl p-6">
        <div className="flex items-center justify-between">
          <div>
            <div className="inline-block w-fit px-3 py-1 bg-primary/10 border border-primary/20 rounded-md mb-2">
              <span className="text-xs font-mono uppercase tracking-wide text-primary">
                School Overview
              </span>
            </div>
            <h2 className="text-2xl font-mono font-bold tracking-wide text-slate-900 dark:text-slate-100">
              Real-time Statistics
            </h2>
            <p className="text-sm text-slate-600 dark:text-slate-400 mt-1 font-medium">
              Comprehensive insights about student performance and school activities
            </p>
          </div>
          <div className="bg-primary/10 border-2 border-primary/20 rounded-xl p-3">
            <Activity className="h-6 w-6 text-primary" />
          </div>
        </div>
      </div>

      {/* Main Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Students */}
        <div className="border-2 border-primary/20 bg-primary/5 rounded-xl p-6 hover:bg-primary/10 hover:border-primary/40 transition-all duration-200">
          <div className="flex items-center gap-3 mb-4">
            <div className="bg-primary/10 border-2 border-primary/20 rounded-lg p-2">
              <Users className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h3 className="text-sm font-mono font-medium text-primary uppercase tracking-wide">Total Students</h3>
            </div>
          </div>
          <div className="text-3xl font-mono font-bold text-slate-900 dark:text-slate-100 mb-2">
            {totalStudents.toLocaleString()}
          </div>
          <p className="text-xs text-slate-600 dark:text-slate-400 font-medium">
            Enrolled across all grades
          </p>
        </div>

        {/* Students Added Today */}
        <div className="border-2 border-primary/20 bg-primary/5 rounded-xl p-6 hover:bg-primary/10 hover:border-primary/40 transition-all duration-200">
          <div className="flex items-center gap-3 mb-4">
            <div className="bg-primary/10 border-2 border-primary/20 rounded-lg p-2">
              <UserPlus className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h3 className="text-sm font-mono font-medium text-primary uppercase tracking-wide">New Today</h3>
            </div>
          </div>
          <div className="text-3xl font-mono font-bold text-slate-900 dark:text-slate-100 mb-2">
            {studentsAddedToday}
          </div>
          <p className="text-xs text-slate-600 dark:text-slate-400 font-medium">
            Students registered today
          </p>
        </div>

        {/* Attendance Today */}
        <div className="border-2 border-primary/20 bg-primary/5 rounded-xl p-6 hover:bg-primary/10 hover:border-primary/40 transition-all duration-200">
          <div className="flex items-center gap-3 mb-4">
            <div className="bg-primary/10 border-2 border-primary/20 rounded-lg p-2">
              <Calendar className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h3 className="text-sm font-mono font-medium text-primary uppercase tracking-wide">Attendance Today</h3>
            </div>
          </div>
          <div className="flex items-center gap-2 mb-2">
            <div className="text-3xl font-mono font-bold text-slate-900 dark:text-slate-100">
              {attendancePercentage}%
            </div>
            <TrendingUp className="h-5 w-5 text-primary" />
          </div>
          <p className="text-xs text-slate-600 dark:text-slate-400 font-medium">
            {presentToday} present, {absentToday} absent
          </p>
        </div>

        {/* Registers Marked */}
        <div className="border-2 border-primary/20 bg-primary/5 rounded-xl p-6 hover:bg-primary/10 hover:border-primary/40 transition-all duration-200">
          <div className="flex items-center gap-3 mb-4">
            <div className="bg-primary/10 border-2 border-primary/20 rounded-lg p-2">
              <BookOpen className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h3 className="text-sm font-mono font-medium text-primary uppercase tracking-wide">Registers Marked</h3>
            </div>
          </div>
          <div className="text-3xl font-mono font-bold text-slate-900 dark:text-slate-100 mb-2">
            {registerCompletionPercentage}%
          </div>
          <p className="text-xs text-slate-600 dark:text-slate-400 font-medium">
            {classesWithMarkedRegisters} of {totalClasses} classes
          </p>
        </div>
      </div>

      {/* Secondary Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {/* Academic Excellence */}
        <div className="border-2 border-primary/20 bg-primary/5 rounded-xl p-6">
          <div className="inline-block w-fit px-3 py-1 bg-primary/10 border border-primary/20 rounded-md mb-4">
            <h3 className="text-xs font-mono uppercase tracking-wide text-primary flex items-center">
              <GraduationCap className="h-3 w-3 mr-2" />
              Academic Excellence
            </h3>
          </div>
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 bg-white dark:bg-slate-800 rounded-lg border border-primary/20">
              <span className="text-sm font-mono text-slate-700 dark:text-slate-300">Top Grade:</span>
              <Badge className="bg-primary/10 text-primary border-primary/20 font-mono">
                {topPerformingGrade}
              </Badge>
            </div>
            <div className="flex items-center justify-between p-3 bg-white dark:bg-slate-800 rounded-lg border border-primary/20">
              <span className="text-sm font-mono text-slate-700 dark:text-slate-300">Average Grade:</span>
              <Badge className="bg-primary/10 text-primary border-primary/20 font-mono">
                {averageGrade}
              </Badge>
            </div>
          </div>
        </div>

        {/* Financial Status */}
        <div className="border-2 border-primary/20 bg-primary/5 rounded-xl p-6">
          <div className="inline-block w-fit px-3 py-1 bg-primary/10 border border-primary/20 rounded-md mb-4">
            <h3 className="text-xs font-mono uppercase tracking-wide text-primary flex items-center">
              <Award className="h-3 w-3 mr-2" />
              Financial Status
            </h3>
          </div>
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 bg-white dark:bg-slate-800 rounded-lg border border-primary/20">
              <span className="text-sm font-mono text-slate-700 dark:text-slate-300">Scholarships:</span>
              <Badge className="bg-primary/10 text-primary border-primary/20 font-mono">
                {studentsWithScholarships} students
              </Badge>
            </div>
            <div className="flex items-center justify-between p-3 bg-white dark:bg-slate-800 rounded-lg border border-primary/20">
              <span className="text-sm font-mono text-slate-700 dark:text-slate-300">New Admissions:</span>
              <span className="text-sm font-mono font-medium text-primary">
                {newAdmissionsThisMonth} this month
              </span>
            </div>
            <div className="flex items-center justify-between p-3 bg-white dark:bg-slate-800 rounded-lg border border-primary/20">
              <span className="text-sm font-mono text-slate-700 dark:text-slate-300">Fee Defaulters:</span>
              <Badge variant="outline" className="text-red-600 border-red-300 font-mono">
                {feeDefaulters} students
              </Badge>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="border-2 border-primary/20 bg-primary/5 rounded-xl p-6">
          <div className="inline-block w-fit px-3 py-1 bg-primary/10 border border-primary/20 rounded-md mb-4">
            <h3 className="text-xs font-mono uppercase tracking-wide text-primary flex items-center">
              <Activity className="h-3 w-3 mr-2" />
              Quick Actions
            </h3>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="text-center p-3 bg-white dark:bg-slate-800 rounded-lg border border-primary/20 hover:bg-primary/5 hover:border-primary/40 transition-all duration-200 cursor-pointer">
              <CheckCircle className="h-5 w-5 text-primary mx-auto mb-2" />
              <p className="text-xs font-mono font-medium text-primary">Mark Attendance</p>
            </div>
            <div className="text-center p-3 bg-white dark:bg-slate-800 rounded-lg border border-primary/20 hover:bg-primary/5 hover:border-primary/40 transition-all duration-200 cursor-pointer">
              <BookOpen className="h-5 w-5 text-primary mx-auto mb-2" />
              <p className="text-xs font-mono font-medium text-primary">View Reports</p>
            </div>
          </div>
        </div>
      </div>

      {/* Additional Stats Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Health Status */}
        <div className="border-2 border-primary/20 bg-primary/5 rounded-xl p-4 text-center hover:bg-primary/10 hover:border-primary/40 transition-all duration-200">
          <div className="bg-primary/10 border-2 border-primary/20 rounded-lg p-2 w-fit mx-auto mb-3">
            <Heart className="h-5 w-5 text-primary" />
          </div>
          <div className="text-2xl font-mono font-bold text-slate-900 dark:text-slate-100 mb-1">
            {Math.floor(Math.random() * 50) + 150}
          </div>
          <p className="text-xs font-mono text-primary font-medium">Healthy Students</p>
        </div>

        {/* Transport Service */}
        <div className="border-2 border-primary/20 bg-primary/5 rounded-xl p-4 text-center hover:bg-primary/10 hover:border-primary/40 transition-all duration-200">
          <div className="bg-primary/10 border-2 border-primary/20 rounded-lg p-2 w-fit mx-auto mb-3">
            <Bus className="h-5 w-5 text-primary" />
          </div>
          <div className="text-2xl font-mono font-bold text-slate-900 dark:text-slate-100 mb-1">
            {Math.floor(Math.random() * 30) + 20}
          </div>
          <p className="text-xs font-mono text-primary font-medium">Using Transport</p>
        </div>

        {/* Performance Target */}
        <div className="border-2 border-primary/20 bg-primary/5 rounded-xl p-4 text-center hover:bg-primary/10 hover:border-primary/40 transition-all duration-200">
          <div className="bg-primary/10 border-2 border-primary/20 rounded-lg p-2 w-fit mx-auto mb-3">
            <Target className="h-5 w-5 text-primary" />
          </div>
          <div className="text-2xl font-mono font-bold text-slate-900 dark:text-slate-100 mb-1">
            {averageGrade}
          </div>
          <p className="text-xs font-mono text-primary font-medium">Average Grade</p>
        </div>

        {/* School Activities */}
        <div className="border-2 border-primary/20 bg-primary/5 rounded-xl p-4 text-center hover:bg-primary/10 hover:border-primary/40 transition-all duration-200">
          <div className="bg-primary/10 border-2 border-primary/20 rounded-lg p-2 w-fit mx-auto mb-3">
            <Star className="h-5 w-5 text-primary" />
          </div>
          <div className="text-2xl font-mono font-bold text-slate-900 dark:text-slate-100 mb-1">
            {Math.floor(Math.random() * 10) + 5}
          </div>
          <p className="text-xs font-mono text-primary font-medium">Active Clubs</p>
        </div>
      </div>
    </div>
  )
} 