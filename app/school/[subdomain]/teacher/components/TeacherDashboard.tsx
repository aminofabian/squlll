"use client"

import React, { useState } from "react";
import { CheckCircle2, User, BookOpen, FileText, PlusCircle, TrendingUp, Users, Activity, Calendar, Clock, Target, Award, Home, BarChart3, Settings } from "lucide-react";

// Mock Data
const tests = [
  { subject: "Social Studies", progress: 20, total: 20, deadline: "16/08/2022", status: "completed" },
  { subject: "Computer Science", progress: 18, total: 20, deadline: "16/08/2022", status: "in-progress" },
  { subject: "Mathematics", progress: 18, total: 20, deadline: "16/08/2022", status: "in-progress" },
];
const students = [
  { name: "Peter smith", grade: "Grade 2", color: "bg-primary/20", performance: "Excellent" },
  { name: "Elisa grandbell", grade: "Grade 2", color: "bg-primary/30", performance: "Good" },
  { name: "Mary Jane", grade: "Grade 2", color: "bg-primary/40", performance: "Excellent" },
];
const activityFeed = [
  { name: "Dawn hiraki", action: "completed a test", time: "15:00", color: "bg-primary/20", subject: "Mathematics" },
  { name: "Ranjan maari", action: "completed a test", time: "13:45", color: "bg-primary/30", subject: "Science" },
];
const activeTests = [
  { subject: "Computer Science", img: "/public/globe.svg", progress: 18, total: 20, participants: 24 },
  { subject: "Mathematics", img: "/public/file.svg", progress: 18, total: 20, participants: 28 },
];
const reports = [
  { subject: "Mathematics", grade: "Grade 2", students: 20, isNew: true, avgScore: 85 },
  { subject: "Social Studies", grade: "Grade 2", students: 20, isNew: false, avgScore: 78 },
];

function DonutChart({ value, total }: { value: number; total: number }) {
  // SVG donut chart with theme color
  const radius = 24;
  const stroke = 6;
  const normalizedRadius = radius - stroke / 2;
  const circumference = normalizedRadius * 2 * Math.PI;
  const percent = value / total;
  const strokeDashoffset = circumference * (1 - percent);
  return (
    <svg height={radius * 2} width={radius * 2} className="rotate-90">
      <circle
        stroke="var(--color-border)"
        fill="transparent"
        strokeWidth={stroke}
        r={normalizedRadius}
        cx={radius}
        cy={radius}
      />
      <circle
        stroke="var(--color-primary)"
        fill="transparent"
        strokeWidth={stroke}
        strokeDasharray={circumference + " " + circumference}
        style={{ strokeDashoffset, transition: 'stroke-dashoffset 0.5s' }}
        r={normalizedRadius}
        cx={radius}
        cy={radius}
      />
    </svg>
  );
}

export default function TeacherDashboard() {
  const [activeTab, setActiveTab] = useState('dashboard');

  const renderDashboardContent = () => (
    <div className="flex flex-col gap-4 lg:gap-12">
      {/* Enhanced Header Section - Hidden on mobile */}
      <div className="hidden lg:block text-center mb-12">
        <div className="inline-flex items-center gap-3 mb-4">
          <div className="w-12 h-12 bg-primary flex items-center justify-center">
            <BookOpen className="w-6 h-6 text-primary-foreground text-white" />
          </div>
          <h1 className="text-4xl font-bold text-foreground">Teacher Dashboard</h1>
        </div>
        <p className="text-muted-foreground text-lg">Welcome back! Here's your comprehensive teaching overview.</p>
        <div className="flex justify-center gap-6 mt-6">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Calendar className="w-4 h-4" />
            <span>Today: {new Date().toLocaleDateString()}</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Clock className="w-4 h-4" />
            <span>Last updated: 2 minutes ago</span>
          </div>
        </div>
      </div>

      {/* Top Row: My Tests & Activity Feed */}
      <div className="flex flex-col gap-4 lg:gap-10 w-full">
        {/* Enhanced My Tests */}
        <div className="bg-card shadow-lg lg:shadow-2xl p-4 lg:p-10 flex flex-col relative overflow-hidden border border-border">
          <div className="absolute -top-4 -right-4 lg:-top-16 lg:-right-16 w-16 h-16 lg:w-64 lg:h-64 bg-primary/5 blur-3xl z-0" />
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4 lg:mb-10 z-10 relative">
            <div className="flex items-center gap-2 lg:gap-4">
              <div className="w-8 h-8 lg:w-12 lg:h-12 bg-primary flex items-center justify-center shadow-lg">
                <FileText className="w-4 h-4 lg:w-6 lg:h-6 text-primary-foreground text-white" />
              </div>
              <div>
                <h2 className="text-lg lg:text-3xl font-bold tracking-tight text-foreground">MY TESTS</h2>
                <p className="text-muted-foreground text-xs lg:text-sm hidden sm:block">Manage and track your assessments</p>
              </div>
            </div>
            <button className="flex items-center text-white gap-2 lg:gap-3 bg-primary text-primary-foreground px-3 lg:px-8 py-1.5 lg:py-4 hover:bg-primary/90 transition-all duration-300 text-xs lg:text-sm font-semibold shadow-lg hover:shadow-xl transform hover:scale-105">
              <PlusCircle className="w-3 h-3 lg:w-5 lg:h-5 text-white" /> 
              <span className="hidden sm:inline">Create New Test</span>
              <span className="sm:hidden">New Test</span>
            </button>
          </div>
          <div className="flex flex-col lg:flex-row items-center gap-4 lg:gap-12 z-10 relative">
            <div className="relative flex flex-col items-center justify-center min-w-[80px] lg:min-w-[160px]">
              <DonutChart value={7} total={7} />
              <span className="absolute text-lg lg:text-4xl font-extrabold text-foreground">7</span>
              <span className="absolute top-12 lg:top-24 text-xs lg:text-sm text-muted-foreground">Total Tests</span>
              <span className="absolute left-16 lg:left-28 top-6 lg:top-12 bg-primary text-primary-foreground text-xs px-2 lg:px-4 py-1 lg:py-2 shadow-lg text-white font-semibold">Completed</span>
            </div>
            <div className="flex-1 w-full">
              <div className="grid grid-cols-1 gap-3">
                {tests.map((test, i) => (
                  <div key={i} className="p-3 lg:p-4 border border-border hover:bg-primary/5 transition-colors">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-medium text-foreground text-sm">{test.subject}</span>
                      <span className={`inline-flex items-center gap-1 px-2 py-1 text-xs font-medium ${
                        test.status === 'completed' 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-yellow-100 text-yellow-800'
                      }`}>
                        {test.status === 'completed' ? <CheckCircle2 className="w-3 h-3" /> : <Clock className="w-3 h-3" />}
                        <span className="hidden sm:inline">{test.status === 'completed' ? 'Completed' : 'In Progress'}</span>
                      </span>
                    </div>
                    <div className="w-full bg-muted h-2 mb-1">
                      <div
                        className="bg-primary h-2 transition-all duration-500"
                        style={{ width: `${(test.progress / test.total) * 100}%` }}
                      ></div>
                    </div>
                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                      <span>{test.progress}/{test.total} completed</span>
                      <span>{test.deadline}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
        {/* Enhanced Activity Feed */}
        <div className="bg-card shadow-lg lg:shadow-2xl p-4 lg:p-10 flex flex-col border border-border">
          <div className="flex items-center gap-2 lg:gap-4 mb-4 lg:mb-10">
            <div className="w-8 h-8 lg:w-12 lg:h-12 bg-primary flex items-center justify-center shadow-lg">
              <Activity className="w-4 h-4 lg:w-6 lg:h-6 text-primary-foreground text-white" />
            </div>
            <div>
              <h2 className="text-lg lg:text-3xl font-bold text-foreground">ACTIVITY FEED</h2>
              <p className="text-muted-foreground text-xs lg:text-sm hidden sm:block">Real-time student activities</p>
            </div>
          </div>
          <div className="space-y-3 lg:space-y-6">
            {activityFeed.map((item, i) => (
              <div key={i} className="flex items-start gap-3 lg:gap-4 p-3 lg:p-5 hover:bg-primary/10 transition-all duration-300 border-l-4 border-transparent hover:border-primary">
                <span className={`w-8 h-8 lg:w-14 lg:h-14 flex items-center justify-center ${item.color} border-2 border-primary/20 shadow-md`}>
                  <User className="w-4 h-4 lg:w-7 lg:h-7 text-primary" />
                </span>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-semibold text-foreground text-sm">{item.name}</span>
                    <span className="text-muted-foreground text-xs">{item.action}</span>
                  </div>
                  <div className="text-xs text-muted-foreground mb-1">{item.subject}</div>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <Clock className="w-3 h-3" />
                    <span>at {item.time}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Second Row: My Students & Active Tests */}
      <div className="flex flex-col gap-4 lg:gap-10 w-full">
        {/* Enhanced My Students */}
        <div className="bg-card shadow-lg lg:shadow-2xl p-4 lg:p-10 flex flex-col border border-border">
          <div className="flex items-center gap-2 lg:gap-4 mb-4 lg:mb-10">
            <div className="w-8 h-8 lg:w-12 lg:h-12 bg-primary flex items-center justify-center shadow-lg">
              <Users className="w-4 h-4 lg:w-6 lg:h-6 text-primary-foreground text-white" />
            </div>
            <div>
              <h2 className="text-lg lg:text-3xl font-bold text-foreground">MY STUDENTS</h2>
              <p className="text-muted-foreground text-xs lg:text-sm hidden sm:block">Track student performance</p>
            </div>
          </div>
          <div className="flex flex-col gap-3 lg:gap-5">
            {students.map((student, i) => (
              <div key={i} className="flex items-center gap-3 lg:gap-5 p-3 lg:p-5 hover:bg-primary/10 transition-all duration-300 border-l-4 border-transparent hover:border-primary">
                <span className={`w-8 h-8 lg:w-14 lg:h-14 flex items-center justify-center ${student.color} border-2 border-primary/20 shadow-md`}>
                  <User className="w-4 h-4 lg:w-7 lg:h-7 text-primary" />
                </span>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 lg:gap-3 mb-1">
                    <span className="font-semibold text-foreground text-sm">{student.name}</span>
                    <span className={`inline-flex items-center gap-1 px-2 py-1 text-xs font-medium ${
                      student.performance === 'Excellent' 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-blue-100 text-blue-800'
                    }`}>
                      <Award className="w-3 h-3" />
                      <span className="hidden sm:inline">{student.performance}</span>
                    </span>
                  </div>
                  <div className="text-xs lg:text-sm text-muted-foreground">{student.grade}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
        {/* Enhanced Active Tests */}
        <div className="bg-card shadow-lg lg:shadow-2xl p-4 lg:p-10 flex flex-col border border-border">
          <div className="flex items-center gap-2 lg:gap-4 mb-4 lg:mb-10">
            <div className="w-8 h-8 lg:w-12 lg:h-12 bg-primary flex items-center justify-center shadow-lg">
              <TrendingUp className="w-4 h-4 lg:w-6 lg:h-6 text-primary-foreground text-white" />
            </div>
            <div>
              <h2 className="text-lg lg:text-3xl font-bold text-foreground">ACTIVE TESTS</h2>
              <p className="text-muted-foreground text-xs lg:text-sm hidden sm:block">Currently running assessments</p>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3 lg:gap-8">
            {activeTests.map((test, i) => (
              <div key={i} className="bg-primary/5 p-3 lg:p-8 flex flex-col items-center shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-300 border border-primary/20">
                <div className="w-12 h-8 lg:w-24 lg:h-20 bg-primary/10 mb-3 lg:mb-6 flex items-center justify-center shadow-md">
                  <BookOpen className="w-4 h-4 lg:w-10 lg:h-10 text-primary" />
                </div>
                <div className="font-semibold mb-2 lg:mb-4 text-foreground text-center text-xs lg:text-lg">{test.subject}</div>
                <div className="w-full bg-muted h-2 lg:h-3 mb-2 lg:mb-3">
                  <div
                    className="bg-primary h-2 lg:h-3 transition-all duration-500"
                    style={{ width: `${(test.progress / test.total) * 100}%` }}
                  ></div>
                </div>
                <div className="flex items-center justify-between w-full text-xs lg:text-sm">
                  <span className="text-muted-foreground">{test.progress}/{test.total}</span>
                  <span className="text-primary font-medium">{test.participants} students</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Enhanced My Reports */}
      <div className="bg-card shadow-lg lg:shadow-2xl p-4 lg:p-10 flex flex-col border border-border">
        <div className="flex items-center gap-2 lg:gap-4 mb-4 lg:mb-10">
          <div className="w-8 h-8 lg:w-12 lg:h-12 bg-primary flex items-center justify-center shadow-lg">
            <FileText className="w-4 h-4 lg:w-6 lg:h-6 text-primary-foreground text-white" />
          </div>
          <div>
            <h2 className="text-lg lg:text-3xl font-bold text-foreground">MY REPORTS</h2>
            <p className="text-muted-foreground text-xs lg:text-sm hidden sm:block">Comprehensive performance analytics</p>
          </div>
        </div>
        <div className="grid gap-3 lg:gap-6">
          {reports.map((report, i) => (
            <div
              key={i}
              className={`flex items-center justify-between border-2 p-3 lg:px-8 lg:py-6 ${
                i === 0 
                  ? "border-primary bg-primary/10" 
                  : "border-border bg-card/50"
              } hover:bg-primary/10 transition-all duration-300`}
            >
              <div className="flex items-center gap-3 lg:gap-6 min-w-0 flex-1">
                <div className="w-8 h-8 lg:w-12 lg:h-12 bg-primary flex items-center justify-center shadow-md flex-shrink-0">
                  <FileText className="w-4 h-4 lg:w-6 lg:h-6 text-primary-foreground text-white" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="font-semibold text-foreground text-sm lg:text-lg truncate">{report.subject} – {report.grade}</div>
                  <div className="text-xs lg:text-sm text-muted-foreground mb-1 lg:mb-2">{report.students} Students</div>
                  <div className="flex items-center gap-2 lg:gap-4">
                    <div className="flex items-center gap-1 lg:gap-2">
                      <Target className="w-3 h-3 lg:w-4 lg:h-4 text-primary" />
                      <span className="text-xs lg:text-sm font-medium">Avg: {report.avgScore}%</span>
                    </div>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2 lg:gap-4 flex-shrink-0">
                {report.isNew && (
                  <span className="bg-primary text-primary-foreground text-xs px-2 lg:px-4 py-1 lg:py-2 font-semibold shadow-lg text-white">NEW</span>
                )}
                <button className="text-primary hover:text-primary/80 transition-colors">
                  <FileText className="w-4 h-4 lg:w-5 lg:h-5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const renderTestsContent = () => (
    <div className="flex flex-col gap-4">
      <div className="bg-card shadow-lg p-4 flex flex-col border border-border">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-primary flex items-center justify-center">
              <FileText className="w-4 h-4 text-primary-foreground text-white" />
            </div>
            <h2 className="text-lg font-bold text-foreground">ALL TESTS</h2>
          </div>
          <button className="flex items-center text-white gap-2 bg-primary text-primary-foreground px-3 py-1.5 hover:bg-primary/90 transition-all duration-300 text-xs font-semibold shadow-lg">
            <PlusCircle className="w-3 h-3 text-white" /> 
            <span>New Test</span>
          </button>
        </div>
        <div className="space-y-3">
          {tests.map((test, i) => (
            <div key={i} className="p-3 border border-border hover:bg-primary/5 transition-colors">
              <div className="flex items-center justify-between mb-2">
                <span className="font-medium text-foreground text-sm">{test.subject}</span>
                <span className={`inline-flex items-center gap-1 px-2 py-1 text-xs font-medium ${
                  test.status === 'completed' 
                    ? 'bg-green-100 text-green-800' 
                    : 'bg-yellow-100 text-yellow-800'
                }`}>
                  {test.status === 'completed' ? <CheckCircle2 className="w-3 h-3" /> : <Clock className="w-3 h-3" />}
                  <span>{test.status === 'completed' ? 'Completed' : 'In Progress'}</span>
                </span>
              </div>
              <div className="w-full bg-muted h-2 mb-1">
                <div
                  className="bg-primary h-2 transition-all duration-500"
                  style={{ width: `${(test.progress / test.total) * 100}%` }}
                ></div>
              </div>
              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <span>{test.progress}/{test.total} completed</span>
                <span>{test.deadline}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const renderStudentsContent = () => (
    <div className="flex flex-col gap-4">
      <div className="bg-card shadow-lg p-4 flex flex-col border border-border">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-primary flex items-center justify-center">
              <Users className="w-4 h-4 text-primary-foreground text-white" />
            </div>
            <h2 className="text-lg font-bold text-foreground">ALL STUDENTS</h2>
          </div>
          <button className="flex items-center text-white gap-2 bg-primary text-primary-foreground px-3 py-1.5 hover:bg-primary/90 transition-all duration-300 text-xs font-semibold shadow-lg">
            <PlusCircle className="w-3 h-3 text-white" /> 
            <span>Add Student</span>
          </button>
        </div>
        <div className="space-y-3">
          {students.map((student, i) => (
            <div key={i} className="flex items-center gap-3 p-3 hover:bg-primary/10 transition-all duration-300 border-l-4 border-transparent hover:border-primary">
              <span className={`w-8 h-8 flex items-center justify-center ${student.color} border-2 border-primary/20 shadow-md`}>
                <User className="w-4 h-4 text-primary" />
              </span>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-semibold text-foreground text-sm">{student.name}</span>
                  <span className={`inline-flex items-center gap-1 px-2 py-1 text-xs font-medium ${
                    student.performance === 'Excellent' 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-blue-100 text-blue-800'
                  }`}>
                    <Award className="w-3 h-3" />
                    <span>{student.performance}</span>
                  </span>
                </div>
                <div className="text-xs text-muted-foreground">{student.grade}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const renderReportsContent = () => (
    <div className="flex flex-col gap-4">
      <div className="bg-card shadow-lg p-4 flex flex-col border border-border">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-primary flex items-center justify-center">
              <BarChart3 className="w-4 h-4 text-primary-foreground text-white" />
            </div>
            <h2 className="text-lg font-bold text-foreground">ALL REPORTS</h2>
          </div>
          <button className="flex items-center text-white gap-2 bg-primary text-primary-foreground px-3 py-1.5 hover:bg-primary/90 transition-all duration-300 text-xs font-semibold shadow-lg">
            <PlusCircle className="w-3 h-3 text-white" /> 
            <span>Generate Report</span>
          </button>
        </div>
        <div className="space-y-3">
          {reports.map((report, i) => (
            <div
              key={i}
              className={`flex items-center justify-between border-2 p-3 ${
                i === 0 
                  ? "border-primary bg-primary/10" 
                  : "border-border bg-card/50"
              } hover:bg-primary/10 transition-all duration-300`}
            >
              <div className="flex items-center gap-3 min-w-0 flex-1">
                <div className="w-8 h-8 bg-primary flex items-center justify-center shadow-md flex-shrink-0">
                  <FileText className="w-4 h-4 text-primary-foreground text-white" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="font-semibold text-foreground text-sm truncate">{report.subject} – {report.grade}</div>
                  <div className="text-xs text-muted-foreground mb-1">{report.students} Students</div>
                  <div className="flex items-center gap-2">
                    <div className="flex items-center gap-1">
                      <Target className="w-3 h-3 text-primary" />
                      <span className="text-xs font-medium">Avg: {report.avgScore}%</span>
                    </div>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2 flex-shrink-0">
                {report.isNew && (
                  <span className="bg-primary text-primary-foreground text-xs px-2 py-1 font-semibold shadow-lg text-white">NEW</span>
                )}
                <button className="text-primary hover:text-primary/80 transition-colors">
                  <FileText className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const renderSettingsContent = () => (
    <div className="flex flex-col gap-4">
      <div className="bg-card shadow-lg p-4 flex flex-col border border-border">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-8 h-8 bg-primary flex items-center justify-center">
            <Settings className="w-4 h-4 text-primary-foreground text-white" />
          </div>
          <h2 className="text-lg font-bold text-foreground">SETTINGS</h2>
        </div>
        <div className="space-y-3">
          <div className="flex items-center justify-between p-3 hover:bg-primary/10 transition-all duration-300 border-l-4 border-transparent hover:border-primary">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-primary/10 flex items-center justify-center">
                <User className="w-4 h-4 text-primary" />
              </div>
              <div>
                <div className="font-semibold text-foreground text-sm">Profile Settings</div>
                <div className="text-xs text-muted-foreground">Manage your account</div>
              </div>
            </div>
          </div>
          <div className="flex items-center justify-between p-3 hover:bg-primary/10 transition-all duration-300 border-l-4 border-transparent hover:border-primary">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-primary/10 flex items-center justify-center">
                <BookOpen className="w-4 h-4 text-primary" />
              </div>
              <div>
                <div className="font-semibold text-foreground text-sm">Class Settings</div>
                <div className="text-xs text-muted-foreground">Manage your classes</div>
              </div>
            </div>
          </div>
          <div className="flex items-center justify-between p-3 hover:bg-primary/10 transition-all duration-300 border-l-4 border-transparent hover:border-primary">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-primary/10 flex items-center justify-center">
                <BarChart3 className="w-4 h-4 text-primary" />
              </div>
              <div>
                <div className="font-semibold text-foreground text-sm">Notification Settings</div>
                <div className="text-xs text-muted-foreground">Manage notifications</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return renderDashboardContent();
      case 'tests':
        return renderTestsContent();
      case 'students':
        return renderStudentsContent();
      case 'reports':
        return renderReportsContent();
      case 'settings':
        return renderSettingsContent();
      default:
        return renderDashboardContent();
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-white to-primary/5">
      {/* Mobile Header */}
      <div className="lg:hidden sticky top-0 z-50 bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/60 border-b border-border">
        <div className="flex items-center justify-between px-3 py-2">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-primary flex items-center justify-center">
              <BookOpen className="w-3 h-3 text-primary-foreground text-white" />
            </div>
            <h1 className="text-sm font-bold text-foreground">Teacher Dashboard</h1>
          </div>
          <div className="flex items-center gap-1 text-xs text-muted-foreground">
            <Clock className="w-3 h-3" />
            <span>{new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="pb-16 lg:pb-0">
        <div className="px-3 py-3 lg:px-12 lg:py-16">
          <div className="max-w-8xl mx-auto">
            {renderContent()}
          </div>
        </div>
      </div>

      {/* Mobile Bottom Navigation */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 z-50 bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/60 border-t border-border">
        <div className="flex items-center justify-around py-1">
          <button 
            onClick={() => setActiveTab('dashboard')}
            className={`flex flex-col items-center gap-1 p-1 transition-colors ${
              activeTab === 'dashboard' ? 'text-primary' : 'text-muted-foreground'
            }`}
          >
            <Home className="w-4 h-4" />
            <span className="text-xs font-medium">Dashboard</span>
          </button>
          <button 
            onClick={() => setActiveTab('tests')}
            className={`flex flex-col items-center gap-1 p-1 transition-colors ${
              activeTab === 'tests' ? 'text-primary' : 'text-muted-foreground'
            }`}
          >
            <FileText className="w-4 h-4" />
            <span className="text-xs font-medium">Tests</span>
          </button>
          <button 
            onClick={() => setActiveTab('students')}
            className={`flex flex-col items-center gap-1 p-1 transition-colors ${
              activeTab === 'students' ? 'text-primary' : 'text-muted-foreground'
            }`}
          >
            <Users className="w-4 h-4" />
            <span className="text-xs font-medium">Students</span>
          </button>
          <button 
            onClick={() => setActiveTab('reports')}
            className={`flex flex-col items-center gap-1 p-1 transition-colors ${
              activeTab === 'reports' ? 'text-primary' : 'text-muted-foreground'
            }`}
          >
            <BarChart3 className="w-4 h-4" />
            <span className="text-xs font-medium">Reports</span>
          </button>
          <button 
            onClick={() => setActiveTab('settings')}
            className={`flex flex-col items-center gap-1 p-1 transition-colors ${
              activeTab === 'settings' ? 'text-primary' : 'text-muted-foreground'
            }`}
          >
            <Settings className="w-4 h-4" />
            <span className="text-xs font-medium">Settings</span>
          </button>
        </div>
      </div>
    </div>
  );
} 