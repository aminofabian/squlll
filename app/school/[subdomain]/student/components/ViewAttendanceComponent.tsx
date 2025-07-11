"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  ArrowLeft, 
  Calendar, 
  CheckCircle, 
  XCircle, 
  Clock, 
  TrendingUp, 
  TrendingDown,
  BarChart3,
  CalendarDays,
  UserCheck,
  AlertCircle,
  Info,
  Award,
  Target,
  Activity,
  BookOpen,
  GraduationCap,
  Clock3,
  CalendarCheck,
  CalendarX
} from "lucide-react";
import AttendanceHeatmap from './AttendanceHeatmap';

interface AttendanceRecord {
  id: string;
  date: string;
  subject: string;
  teacher: string;
  status: 'present' | 'absent' | 'late' | 'excused';
  time: string;
  notes?: string;
}

interface SubjectAttendance {
  subject: string;
  present: number;
  absent: number;
  late: number;
  excused: number;
  total: number;
  percentage: number;
}

const mockAttendanceRecords: AttendanceRecord[] = [
  { id: "1", date: "2024-01-15", subject: "Mathematics", teacher: "Mr. Johnson", status: "present", time: "08:30 AM" },
  { id: "2", date: "2024-01-15", subject: "English Literature", teacher: "Ms. Smith", status: "present", time: "10:15 AM" },
  { id: "3", date: "2024-01-15", subject: "Chemistry", teacher: "Dr. Brown", status: "late", time: "02:00 PM", notes: "Traffic delay" },
  { id: "4", date: "2024-01-16", subject: "Mathematics", teacher: "Mr. Johnson", status: "present", time: "08:30 AM" },
  { id: "5", date: "2024-01-16", subject: "English Literature", teacher: "Ms. Smith", status: "absent", time: "10:15 AM", notes: "Sick leave" },
  { id: "6", date: "2024-01-16", subject: "Chemistry", teacher: "Dr. Brown", status: "present", time: "02:00 PM" },
  { id: "7", date: "2024-01-17", subject: "Mathematics", teacher: "Mr. Johnson", status: "present", time: "08:30 AM" },
  { id: "8", date: "2024-01-17", subject: "English Literature", teacher: "Ms. Smith", status: "present", time: "10:15 AM" },
  { id: "9", date: "2024-01-17", subject: "Chemistry", teacher: "Dr. Brown", status: "excused", time: "02:00 PM", notes: "Medical appointment" },
  { id: "10", date: "2024-01-18", subject: "Mathematics", teacher: "Mr. Johnson", status: "present", time: "08:30 AM" },
  { id: "11", date: "2024-01-18", subject: "English Literature", teacher: "Ms. Smith", status: "present", time: "10:15 AM" },
  { id: "12", date: "2024-01-18", subject: "Chemistry", teacher: "Dr. Brown", status: "present", time: "02:00 PM" },
  { id: "13", date: "2024-01-19", subject: "Mathematics", teacher: "Mr. Johnson", status: "present", time: "08:30 AM" },
  { id: "14", date: "2024-01-19", subject: "English Literature", teacher: "Ms. Smith", status: "present", time: "10:15 AM" },
  { id: "15", date: "2024-01-19", subject: "Chemistry", teacher: "Dr. Brown", status: "present", time: "02:00 PM" },
];

const mockSubjectAttendance: SubjectAttendance[] = [
  { subject: "Mathematics", present: 45, absent: 2, late: 1, excused: 1, total: 49, percentage: 91.8 },
  { subject: "English Literature", present: 47, absent: 1, late: 0, excused: 1, total: 49, percentage: 95.9 },
  { subject: "Chemistry", present: 44, absent: 3, late: 1, excused: 1, total: 49, percentage: 89.8 },
  { subject: "History", present: 46, absent: 2, late: 0, excused: 1, total: 49, percentage: 93.9 },
  { subject: "Physics", present: 43, absent: 4, late: 1, excused: 1, total: 49, percentage: 87.8 },
];

const months = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December"
];

const subjects = ["All Subjects", "Mathematics", "English Literature", "Chemistry", "History", "Physics"];

// Student profile mock data
const studentProfile = {
  name: "Brian Otieno",
  id: "KEN-2024-0012",
  number: "+254 712 345678",
  email: "brian.otieno@student.kenyaschool.ac.ke",
  address: "123 Moi Avenue, Nairobi",
  photo: "https://randomuser.me/api/portraits/men/75.jpg"
};

export default function ViewAttendanceComponent({ onBack }: { onBack: () => void }) {
  const [selectedMonth, setSelectedMonth] = useState("January");
  const [selectedSubject, setSelectedSubject] = useState("All Subjects");
  const [viewMode, setViewMode] = useState<"overview" | "detailed" | "subject">("overview");

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'present':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'absent':
        return <XCircle className="w-4 h-4 text-red-500" />;
      case 'late':
        return <Clock className="w-4 h-4 text-yellow-500" />;
      case 'excused':
        return <AlertCircle className="w-4 h-4 text-blue-500" />;
      default:
        return <Info className="w-4 h-4 text-gray-500" />;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'present':
        return <Badge className="bg-green-100 text-green-800">Present</Badge>;
      case 'absent':
        return <Badge className="bg-red-100 text-red-800">Absent</Badge>;
      case 'late':
        return <Badge className="bg-yellow-100 text-yellow-800">Late</Badge>;
      case 'excused':
        return <Badge className="bg-blue-100 text-blue-800">Excused</Badge>;
      default:
        return <Badge variant="secondary">Unknown</Badge>;
    }
  };

  const filteredRecords = mockAttendanceRecords.filter(record => {
    const recordMonth = new Date(record.date).toLocaleString('default', { month: 'long' });
    const monthMatch = selectedMonth === "All Months" || recordMonth === selectedMonth;
    const subjectMatch = selectedSubject === "All Subjects" || record.subject === selectedSubject;
    return monthMatch && subjectMatch;
  });

  const overallStats = {
    totalDays: mockAttendanceRecords.length,
    present: mockAttendanceRecords.filter(r => r.status === 'present').length,
    absent: mockAttendanceRecords.filter(r => r.status === 'absent').length,
    late: mockAttendanceRecords.filter(r => r.status === 'late').length,
    excused: mockAttendanceRecords.filter(r => r.status === 'excused').length,
    attendanceRate: Math.round((mockAttendanceRecords.filter(r => r.status === 'present').length / mockAttendanceRecords.length) * 100)
  };

  const renderOverview = () => (
    <div className="space-y-6">
      {/* Overall Statistics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="border-primary/20">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                <CheckCircle className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Present</p>
                <p className="text-2xl font-bold text-foreground">{overallStats.present}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-primary/20">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
                <XCircle className="w-5 h-5 text-red-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Absent</p>
                <p className="text-2xl font-bold text-foreground">{overallStats.absent}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-primary/20">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-yellow-100 rounded-full flex items-center justify-center">
                <Clock className="w-5 h-5 text-yellow-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Late</p>
                <p className="text-2xl font-bold text-foreground">{overallStats.late}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-primary/20">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                <AlertCircle className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Excused</p>
                <p className="text-2xl font-bold text-foreground">{overallStats.excused}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Attendance Rate */}
      <Card className="border-primary/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-primary" />
            Overall Attendance Rate
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4">
            <div className="text-4xl font-bold text-primary">{overallStats.attendanceRate}%</div>
            <div className="flex-1">
              <div className="w-full bg-gray-200 rounded-full h-3">
                <div 
                  className="bg-primary h-3 rounded-full transition-all duration-300"
                  style={{ width: `${overallStats.attendanceRate}%` }}
                ></div>
              </div>
              <p className="text-sm text-muted-foreground mt-2">
                {overallStats.present} out of {overallStats.totalDays} days attended
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Subject-wise Attendance */}
      <Card className="border-primary/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-primary" />
            Subject-wise Attendance
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {mockSubjectAttendance.map((subject) => (
              <div key={subject.subject} className="flex items-center justify-between p-3 border border-primary/10 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                    <BookOpen className="w-4 h-4 text-primary" />
                  </div>
                  <div>
                    <p className="font-semibold text-foreground">{subject.subject}</p>
                    <p className="text-sm text-muted-foreground">
                      {subject.present} present, {subject.absent} absent
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-lg font-bold text-primary">{subject.percentage}%</p>
                  <div className="w-24 bg-gray-200 rounded-full h-2 mt-1">
                    <div 
                      className="bg-primary h-2 rounded-full"
                      style={{ width: `${subject.percentage}%` }}
                    ></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const renderDetailed = () => (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-foreground">Detailed Attendance Records</h3>
        <div className="flex items-center gap-2">
          <Select value={selectedMonth} onValueChange={setSelectedMonth}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Select Month" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="All Months">All Months</SelectItem>
              {months.map((month) => (
                <SelectItem key={month} value={month}>
                  {month}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={selectedSubject} onValueChange={setSelectedSubject}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Select Subject" />
            </SelectTrigger>
            <SelectContent>
              {subjects.map((subject) => (
                <SelectItem key={subject} value={subject}>
                  {subject}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="space-y-2">
        {filteredRecords.length === 0 ? (
          <Card className="p-8 text-center border-primary/20">
            <div className="flex flex-col items-center gap-4">
              <Calendar className="w-12 h-12 text-muted-foreground" />
              <div>
                <h3 className="text-lg font-semibold text-foreground">No attendance records found</h3>
                <p className="text-muted-foreground">Try adjusting your filters</p>
              </div>
            </div>
          </Card>
        ) : (
          filteredRecords.map((record) => (
            <Card key={record.id} className="border-primary/20 hover:border-primary/40 transition-all">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    {getStatusIcon(record.status)}
                    <div>
                      <p className="font-semibold text-foreground">{record.subject}</p>
                      <p className="text-sm text-muted-foreground">
                        {new Date(record.date).toLocaleDateString()} • {record.time} • {record.teacher}
                      </p>
                      {record.notes && (
                        <p className="text-xs text-muted-foreground mt-1">{record.notes}</p>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {getStatusBadge(record.status)}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );

  const renderSubject = () => (
    <div className="space-y-6">
      <Card className="border-primary/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="w-5 h-5 text-primary" />
            Subject-wise Performance
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {mockSubjectAttendance.map((subject) => (
              <Card key={subject.subject} className="border-primary/10">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                      <BookOpen className="w-4 h-4 text-primary" />
                    </div>
                    <div>
                      <p className="font-semibold text-foreground">{subject.subject}</p>
                      <p className="text-xs text-muted-foreground">{subject.total} total classes</p>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-green-600">Present</span>
                      <span className="font-semibold">{subject.present}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-red-600">Absent</span>
                      <span className="font-semibold">{subject.absent}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-yellow-600">Late</span>
                      <span className="font-semibold">{subject.late}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-blue-600">Excused</span>
                      <span className="font-semibold">{subject.excused}</span>
                    </div>
                  </div>

                  <div className="mt-4">
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-sm font-semibold">Attendance Rate</span>
                      <span className="text-lg font-bold text-primary">{subject.percentage}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-primary h-2 rounded-full transition-all duration-300"
                        style={{ width: `${subject.percentage}%` }}
                      ></div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );

  // Remove subjectwise attendance and tabs, add creative cards and a mini chart
  return (
    <div className="w-full">
      {/* Back to Dashboard Icon Button at the Top */}
      <div className="flex items-center mb-6">
        <Button
          className="bg-primary text-white px-3 py-2 mr-4 shadow-md hover:bg-primary/90 transition"
          onClick={onBack}
          variant="ghost"
          size="icon"
        >
          <ArrowLeft className="w-6 h-6" />
        </Button>
        <h2 className="text-2xl font-bold text-primary">Attendance Overview</h2>
      </div>

      {/* Profile & Stats */}
      <div className="bg-white shadow p-6 mb-8 flex flex-col md:flex-row md:items-center gap-8">
        <div className="flex items-center gap-6 flex-1 min-w-0">
          <img src={studentProfile.photo} alt={studentProfile.name} className="w-20 h-20 object-cover border-4 border-primary/30" />
          <div className="space-y-1 min-w-0">
            <h2 className="text-2xl font-bold text-primary truncate flex items-center gap-2">
              {studentProfile.name}
              <span className="inline-flex items-center bg-primary/10 text-primary px-2 py-0.5 text-xs font-semibold ml-2">
                <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M3 21v-2a4 4 0 014-4h10a4 4 0 014 4v2" /><circle cx="12" cy="7" r="4" /></svg>
                Kenya School
              </span>
            </h2>
            <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
              <span><span className="font-semibold">ID:</span> {studentProfile.id}</span>
              <span><span className="font-semibold">Number:</span> {studentProfile.number}</span>
              <span><span className="font-semibold">Email:</span> {studentProfile.email}</span>
              <span><span className="font-semibold">Address:</span> {studentProfile.address}</span>
            </div>
          </div>
        </div>
        <Button className="bg-primary text-white px-6 mt-2">Download Report</Button>
      </div>

      {/* Stat Cards Row */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
        <Card className="bg-blue-50 border-0 shadow-sm">
          <CardContent className="p-4 flex flex-col items-center">
            <span className="text-blue-500 text-2xl font-bold">13</span>
            <span className="text-xs text-blue-700 mt-1">Days Attended</span>
          </CardContent>
        </Card>
        <Card className="bg-green-50 border-0 shadow-sm">
          <CardContent className="p-4 flex flex-col items-center">
            <span className="text-green-500 text-2xl font-bold">7</span>
            <span className="text-xs text-green-700 mt-1">Late Arrivals</span>
          </CardContent>
        </Card>
        <Card className="bg-yellow-50 border-0 shadow-sm">
          <CardContent className="p-4 flex flex-col items-center">
            <span className="text-yellow-500 text-2xl font-bold">1</span>
            <span className="text-xs text-yellow-700 mt-1">Undertime</span>
          </CardContent>
        </Card>
        <Card className="bg-red-50 border-0 shadow-sm">
          <CardContent className="p-4 flex flex-col items-center">
            <span className="text-red-500 text-2xl font-bold">2</span>
            <span className="text-xs text-red-700 mt-1">Days Absent</span>
          </CardContent>
        </Card>
        <Card className="bg-primary/10 border-0 shadow-sm">
          <CardContent className="p-4 flex flex-col items-center">
            <span className="text-primary text-2xl font-bold">23</span>
            <span className="text-xs text-primary mt-1">Total Class Days</span>
          </CardContent>
        </Card>
      </div>

      {/* Attendance Rate & Best Streak */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card className="border-0 shadow-sm col-span-1 flex flex-col justify-between">
          <CardContent className="p-6 flex flex-col gap-2 items-center">
            <span className="text-muted-foreground text-sm mb-1">Attendance Rate</span>
            <div className="relative flex items-center justify-center mb-2">
              <svg width="80" height="80" viewBox="0 0 80 80">
                <circle cx="40" cy="40" r="36" stroke="#e5e7eb" strokeWidth="8" fill="none" />
                <circle cx="40" cy="40" r="36" stroke="#3b82f6" strokeWidth="8" fill="none" strokeDasharray="226.2" strokeDashoffset="99.5" strokeLinecap="round" />
              </svg>
              <span className="absolute text-3xl font-bold text-primary">56%</span>
            </div>
            <Badge className="bg-blue-100 text-blue-700">This Year</Badge>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-sm col-span-1 flex flex-col justify-between">
          <CardContent className="p-6 flex flex-col gap-2 items-center">
            <span className="text-muted-foreground text-sm mb-1">Best Streak</span>
            <div className="flex flex-col items-center">
              <svg width="40" height="40" viewBox="0 0 40 40"><circle cx="20" cy="20" r="18" fill="#fbbf24" /><path d="M20 10l3 6 6 .5-4.5 4 1.5 6-5-3.5-5 3.5 1.5-6-4.5-4 6-.5z" fill="#fff" /></svg>
              <span className="text-2xl font-bold text-yellow-600 mt-2">8 Days</span>
              <span className="text-xs text-yellow-700">Longest Attendance Streak</span>
            </div>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-sm col-span-1 flex flex-col justify-between">
          <CardContent className="p-6 flex flex-col gap-2 items-center">
            <span className="text-muted-foreground text-sm mb-1">Fun Fact</span>
            <div className="flex flex-col items-center">
              <svg width="40" height="40" viewBox="0 0 40 40"><circle cx="20" cy="20" r="18" fill="#10b981" /><text x="20" y="25" textAnchor="middle" fontSize="18" fill="#fff">🎉</text></svg>
              <span className="text-lg font-bold text-green-600 mt-2">All Mondays Attended!</span>
              <span className="text-xs text-green-700">You never missed a Monday this term.</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Monthly Trend Mini-Chart */}
      <Card className="border-0 shadow-sm mb-8">
        <CardContent className="p-6">
          <span className="text-muted-foreground text-sm mb-2 block">Monthly Attendance Trend</span>
          <div className="flex items-end gap-4 h-24">
            <div className="flex flex-col items-center justify-end h-full">
              <div className="w-6 bg-blue-400" style={{ height: '70%' }}></div>
              <span className="text-xs text-muted-foreground mt-1">Jan</span>
            </div>
            <div className="flex flex-col items-center justify-end h-full">
              <div className="w-6 bg-yellow-400" style={{ height: '55%' }}></div>
              <span className="text-xs text-muted-foreground mt-1">Feb</span>
            </div>
            <div className="flex flex-col items-center justify-end h-full">
              <div className="w-6 bg-green-400" style={{ height: '60%' }}></div>
              <span className="text-xs text-muted-foreground mt-1">Mar</span>
            </div>
            <div className="flex flex-col items-center justify-end h-full">
              <div className="w-6 bg-primary" style={{ height: '80%' }}></div>
              <span className="text-xs text-muted-foreground mt-1">Apr</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Attendance Heatmap Section */}
      <div className="mb-8">
        <AttendanceHeatmap />
      </div>
    </div>
  );
} 