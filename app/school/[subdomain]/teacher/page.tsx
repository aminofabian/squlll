"use client"

import React from "react";
import { CheckCircle2, User, BookOpen, FileText, PlusCircle } from "lucide-react";

// Mock Data
const tests = [
  { subject: "Social Studies", progress: 20, total: 20, deadline: "16/08/2022" },
  { subject: "Computer Science", progress: 18, total: 20, deadline: "16/08/2022" },
  { subject: "Mathematics", progress: 18, total: 20, deadline: "16/08/2022" },
  { subject: "Environmental Science", progress: 18, total: 20, deadline: "16/08/2022" },
  { subject: "Statistics & Accounts", progress: 18, total: 20, deadline: "16/08/2022" },
];
const students = [
  { name: "Peter smith", grade: "Grade 2", color: "bg-primary/20" },
  { name: "Elisa grandbell", grade: "Grade 2", color: "bg-primary-light/20" },
  { name: "Mary Jane", grade: "Grade 2", color: "bg-primary-dark/20" },
  { name: "Eddy Brock", grade: "Grade 2", color: "bg-green-200" },
];
const activityFeed = [
  { name: "Dawn hiraki", action: "completed a test", time: "15:00", color: "bg-primary/20" },
  { name: "Ranjan maari", action: "completed a test", time: "13:45", color: "bg-primary-light/20" },
  { name: "Eddy Brock", action: "completed a test", time: "13:40", color: "bg-primary-dark/20" },
  { name: "May Flannery", action: "started a test", time: "14:00", color: "bg-primary/20" },
];
const activeTests = [
  { subject: "Computer Science", img: "/public/globe.svg", progress: 18, total: 20 },
  { subject: "Mathematics", img: "/public/file.svg", progress: 18, total: 20 },
  { subject: "Environmental Science", img: "/public/window.svg", progress: 18, total: 20 },
];
const reports = [
  { subject: "Mathematics", grade: "Grade 2", students: 20, isNew: true },
  { subject: "Social Studies", grade: "Grade 2", students: 20 },
  { subject: "Environmental Science", grade: "Grade 2", students: 20 },
  { subject: "Computer Science", grade: "Grade 2", students: 20 },
];

function DonutChart({ value, total }: { value: number; total: number }) {
  // SVG donut chart with theme color
  const radius = 32;
  const stroke = 8;
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
  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-white to-primary/5 py-8 px-2 md:px-8 transition-colors">
      <div className="max-w-7xl mx-auto flex flex-col gap-8">
        {/* Top Row: My Tests & Activity Feed */}
        <div className="flex flex-col md:flex-row gap-6 w-full">
          {/* My Tests */}
          <div className="flex-1 bg-card rounded-2xl shadow-lg p-8 flex flex-col relative overflow-hidden border border-border">
            <div className="absolute -top-8 -right-8 w-40 h-40 bg-primary/10 rounded-full blur-2xl z-0" />
            <div className="flex items-center justify-between mb-6 z-10 relative">
              <h2 className="text-xl font-bold tracking-tight text-primary">MY TESTS</h2>
              <button className="flex items-center gap-1 bg-primary text-primary-foreground px-4 py-1.5 rounded-lg hover:bg-primary-dark transition text-sm font-medium shadow">
                <PlusCircle className="w-4 h-4" /> New Test
              </button>
            </div>
            <div className="flex flex-col md:flex-row items-center gap-8 z-10 relative">
              <div className="relative flex flex-col items-center justify-center min-w-[120px]">
                <DonutChart value={7} total={7} />
                <span className="absolute text-2xl font-extrabold text-primary">7</span>
                <span className="absolute top-16 text-xs text-muted-foreground">Tests</span>
                <span className="absolute left-20 top-8 bg-primary text-primary-foreground text-xs px-2 py-0.5 rounded-full shadow">Completed</span>
              </div>
              <div className="flex-1 overflow-x-auto w-full">
                <table className="min-w-full text-sm">
                  <thead>
                    <tr className="text-muted-foreground">
                      <th className="text-left font-semibold">Subject Name</th>
                      <th className="text-left font-semibold">Progress</th>
                      <th className="text-left font-semibold">Deadline</th>
                    </tr>
                  </thead>
                  <tbody>
                    {tests.map((test, i) => (
                      <tr key={i} className="border-b last:border-b-0 border-border hover:bg-primary/5 transition">
                        <td className="py-2 pr-2 font-medium text-foreground">{test.subject}</td>
                        <td className="py-2 pr-2">
                          <div className="w-32 bg-muted rounded-full h-2">
                            <div
                              className="bg-primary h-2 rounded-full transition-all"
                              style={{ width: `${(test.progress / test.total) * 100}%` }}
                            ></div>
                          </div>
                          <span className="text-xs ml-2 text-muted-foreground">{test.progress}/{test.total}</span>
                        </td>
                        <td className="py-2 pr-2 text-muted-foreground">{test.deadline}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
          {/* Activity Feed */}
          <div className="w-full md:w-80 bg-card rounded-2xl shadow-lg p-8 flex flex-col border border-border">
            <h2 className="text-xl font-bold mb-6 text-primary">ACTIVITY FEED</h2>
            <div className="flex-1 overflow-y-auto">
              {activityFeed.map((item, i) => (
                <div key={i} className="flex items-center gap-3 mb-4 hover:bg-primary/10 rounded-lg p-2 transition">
                  <span className={`w-10 h-10 rounded-full flex items-center justify-center ${item.color} border-2 border-primary/20`}>
                    <User className="w-6 h-6 text-primary" />
                  </span>
                  <div>
                    <span className="font-semibold text-foreground">{item.name}</span> <span className="text-muted-foreground">{item.action}</span>
                    <div className="text-xs text-muted-foreground">at {item.time}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
        {/* Second Row: My Students & Active Tests */}
        <div className="flex flex-col md:flex-row gap-6 w-full">
          {/* My Students */}
          <div className="flex-1 bg-card rounded-2xl shadow-lg p-8 flex flex-col border border-border">
            <h2 className="text-xl font-bold mb-6 text-primary">MY STUDENTS</h2>
            <div className="flex flex-col gap-4 overflow-y-auto">
              {students.map((student, i) => (
                <div key={i} className="flex items-center gap-3 hover:bg-primary/10 rounded-lg p-2 transition">
                  <span className={`w-10 h-10 rounded-full flex items-center justify-center ${student.color} border-2 border-primary/20`}>
                    <User className="w-6 h-6 text-primary" />
                  </span>
                  <div>
                    <span className="font-semibold text-foreground">{student.name}</span>
                    <div className="text-xs text-muted-foreground">{student.grade}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
          {/* Active Tests */}
          <div className="flex-1 bg-card rounded-2xl shadow-lg p-8 flex flex-col border border-border">
            <h2 className="text-xl font-bold mb-6 text-primary">ACTIVE TESTS</h2>
            <div className="flex gap-4 overflow-x-auto">
              {activeTests.map((test, i) => (
                <div key={i} className="w-44 min-w-[11rem] bg-primary/5 rounded-xl p-4 flex flex-col items-center shadow hover:scale-105 hover:shadow-lg transition">
                  <div className="w-24 h-16 bg-primary/10 rounded mb-2 flex items-center justify-center">
                    <BookOpen className="w-8 h-8 text-primary" />
                  </div>
                  <div className="font-semibold mb-1 text-foreground">{test.subject}</div>
                  <div className="w-full bg-muted rounded-full h-2 mb-1">
                    <div
                      className="bg-primary h-2 rounded-full transition-all"
                      style={{ width: `${(test.progress / test.total) * 100}%` }}
                    ></div>
                  </div>
                  <span className="text-xs text-muted-foreground">{test.progress}/{test.total}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
        {/* My Reports */}
        <div className="w-full bg-card rounded-2xl shadow-lg p-8 flex flex-col border border-border">
          <h2 className="text-xl font-bold mb-6 text-primary">MY REPORTS</h2>
          <div className="flex flex-col gap-4">
            {reports.map((report, i) => (
              <div
                key={i}
                className={`flex items-center justify-between border rounded-lg px-4 py-3 ${i === 0 ? "border-primary" : "border-border"} bg-primary/5 hover:bg-primary/10 transition`}
              >
                <div className="flex items-center gap-3">
                  <FileText className="w-6 h-6 text-primary" />
                  <div>
                    <div className="font-semibold text-foreground">{report.subject} – {report.grade}</div>
                    <div className="text-xs text-muted-foreground">{report.students} Students</div>
                  </div>
                </div>
                {report.isNew && (
                  <span className="bg-primary text-primary-foreground text-xs px-3 py-1 rounded-full ml-2 shadow">NEW</span>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
} 