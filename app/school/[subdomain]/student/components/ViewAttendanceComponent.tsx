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
  CalendarX,
  Filter,
  Search,
  Download,
  Eye
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

// Enhanced attendance history data
const attendanceHistory = [
  { id: "1", date: "2024-01-08", week: 1, day: "Monday", status: "present", time: "08:30 AM", subject: "Mathematics", teacher: "Mr. Johnson", notes: "Perfect attendance" },
  { id: "2", date: "2024-01-09", week: 1, day: "Tuesday", status: "present", time: "08:25 AM", subject: "English Literature", teacher: "Ms. Smith", notes: "Early arrival" },
  { id: "3", date: "2024-01-10", week: 1, day: "Wednesday", status: "late", time: "08:45 AM", subject: "Chemistry", teacher: "Dr. Brown", notes: "Traffic delay" },
  { id: "4", date: "2024-01-11", week: 1, day: "Thursday", status: "present", time: "08:30 AM", subject: "History", teacher: "Mrs. Davis", notes: "On time" },
  { id: "5", date: "2024-01-12", week: 1, day: "Friday", status: "present", time: "08:20 AM", subject: "Physics", teacher: "Mr. Wilson", notes: "Early arrival" },
  { id: "6", date: "2024-01-15", week: 2, day: "Monday", status: "present", time: "08:30 AM", subject: "Mathematics", teacher: "Mr. Johnson", notes: "Perfect attendance" },
  { id: "7", date: "2024-01-16", week: 2, day: "Tuesday", status: "absent", time: "10:15 AM", subject: "English Literature", teacher: "Ms. Smith", notes: "Sick leave" },
  { id: "8", date: "2024-01-17", week: 2, day: "Wednesday", status: "excused", time: "02:00 PM", subject: "Chemistry", teacher: "Dr. Brown", notes: "Medical appointment" },
  { id: "9", date: "2024-01-18", week: 2, day: "Thursday", status: "present", time: "08:30 AM", subject: "History", teacher: "Mrs. Davis", notes: "On time" },
  { id: "10", date: "2024-01-19", week: 2, day: "Friday", status: "present", time: "08:25 AM", subject: "Physics", teacher: "Mr. Wilson", notes: "Early arrival" },
  { id: "11", date: "2024-01-22", week: 3, day: "Monday", status: "present", time: "08:30 AM", subject: "Mathematics", teacher: "Mr. Johnson", notes: "Perfect attendance" },
  { id: "12", date: "2024-01-23", week: 3, day: "Tuesday", status: "late", time: "08:50 AM", subject: "English Literature", teacher: "Ms. Smith", notes: "Bus delay" },
  { id: "13", date: "2024-01-24", week: 3, day: "Wednesday", status: "present", time: "08:30 AM", subject: "Chemistry", teacher: "Dr. Brown", notes: "On time" },
  { id: "14", date: "2024-01-25", week: 3, day: "Thursday", status: "present", time: "08:20 AM", subject: "History", teacher: "Mrs. Davis", notes: "Early arrival" },
  { id: "15", date: "2024-01-26", week: 3, day: "Friday", status: "present", time: "08:30 AM", subject: "Physics", teacher: "Mr. Wilson", notes: "Perfect attendance" },
  { id: "16", date: "2024-01-29", week: 4, day: "Monday", status: "present", time: "08:30 AM", subject: "Mathematics", teacher: "Mr. Johnson", notes: "Perfect attendance" },
  { id: "17", date: "2024-01-30", week: 4, day: "Tuesday", status: "present", time: "08:25 AM", subject: "English Literature", teacher: "Ms. Smith", notes: "Early arrival" },
  { id: "18", date: "2024-01-31", week: 4, day: "Wednesday", status: "present", time: "08:30 AM", subject: "Chemistry", teacher: "Dr. Brown", notes: "On time" },
  { id: "19", date: "2024-02-01", week: 4, day: "Thursday", status: "absent", time: "10:15 AM", subject: "History", teacher: "Mrs. Davis", notes: "Family emergency" },
  { id: "20", date: "2024-02-02", week: 4, day: "Friday", status: "present", time: "08:30 AM", subject: "Physics", teacher: "Mr. Wilson", notes: "Perfect attendance" },
  { id: "21", date: "2024-02-05", week: 5, day: "Monday", status: "present", time: "08:30 AM", subject: "Mathematics", teacher: "Mr. Johnson", notes: "Perfect attendance" },
  { id: "22", date: "2024-02-06", week: 5, day: "Tuesday", status: "present", time: "08:20 AM", subject: "English Literature", teacher: "Ms. Smith", notes: "Early arrival" },
  { id: "23", date: "2024-02-07", week: 5, day: "Wednesday", status: "late", time: "08:55 AM", subject: "Chemistry", teacher: "Dr. Brown", notes: "Weather delay" },
  { id: "24", date: "2024-02-08", week: 5, day: "Thursday", status: "present", time: "08:30 AM", subject: "History", teacher: "Mrs. Davis", notes: "On time" },
  { id: "25", date: "2024-02-09", week: 5, day: "Friday", status: "present", time: "08:25 AM", subject: "Physics", teacher: "Mr. Wilson", notes: "Early arrival" },
];

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
  const [selectedWeek, setSelectedWeek] = useState("All Weeks");

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'present':
        return <CheckCircle className="w-4 h-4 text-emerald-600" />;
      case 'absent':
        return <XCircle className="w-4 h-4 text-rose-600" />;
      case 'late':
        return <Clock className="w-4 h-4 text-amber-600" />;
      case 'excused':
        return <AlertCircle className="w-4 h-4 text-indigo-600" />;
      default:
        return <Info className="w-4 h-4 text-slate-500" />;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'present':
        return <Badge className="bg-emerald-50 text-emerald-800 border border-emerald-200">Present</Badge>;
      case 'absent':
        return <Badge className="bg-rose-50 text-rose-800 border border-rose-200">Absent</Badge>;
      case 'late':
        return <Badge className="bg-amber-50 text-amber-800 border border-amber-200">Late</Badge>;
      case 'excused':
        return <Badge className="bg-indigo-50 text-indigo-800 border border-indigo-200">Excused</Badge>;
      default:
        return <Badge variant="secondary">Unknown</Badge>;
    }
  };

  const getWeekColor = (week: number) => {
    const colors = [
      "from-blue-500 to-blue-600",
      "from-emerald-500 to-emerald-600", 
      "from-amber-500 to-amber-600",
      "from-rose-500 to-rose-600",
      "from-indigo-500 to-indigo-600",
      "from-purple-500 to-purple-600",
      "from-cyan-500 to-cyan-600",
      "from-orange-500 to-orange-600",
      "from-pink-500 to-pink-600",
      "from-teal-500 to-teal-600",
      "from-lime-500 to-lime-600",
      "from-violet-500 to-violet-600",
      "from-fuchsia-500 to-fuchsia-600",
      "from-sky-500 to-sky-600"
    ];
    return colors[(week - 1) % colors.length];
  };

  const filteredRecords = mockAttendanceRecords.filter(record => {
    const recordMonth = new Date(record.date).toLocaleString('default', { month: 'long' });
    const monthMatch = selectedMonth === "All Months" || recordMonth === selectedMonth;
    const subjectMatch = selectedSubject === "All Subjects" || record.subject === selectedSubject;
    return monthMatch && subjectMatch;
  });

  const filteredHistory = attendanceHistory.filter(record => {
    const recordMonth = new Date(record.date).toLocaleString('default', { month: 'long' });
    const monthMatch = selectedMonth === "All Months" || recordMonth === selectedMonth;
    const weekMatch = selectedWeek === "All Weeks" || record.week.toString() === selectedWeek;
    return monthMatch && weekMatch;
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
        <Card className="border border-emerald-200 shadow-lg bg-gradient-to-br from-emerald-50 to-emerald-100">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-emerald-200 flex items-center justify-center">
                <CheckCircle className="w-5 h-5 text-emerald-700" />
              </div>
              <div>
                <p className="text-sm text-emerald-700 font-medium">Present</p>
                <p className="text-2xl font-bold text-emerald-800">{overallStats.present}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border border-rose-200 shadow-lg bg-gradient-to-br from-rose-50 to-rose-100">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-rose-200 flex items-center justify-center">
                <XCircle className="w-5 h-5 text-rose-700" />
              </div>
              <div>
                <p className="text-sm text-rose-700 font-medium">Absent</p>
                <p className="text-2xl font-bold text-rose-800">{overallStats.absent}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border border-amber-200 shadow-lg bg-gradient-to-br from-amber-50 to-amber-100">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-amber-200 flex items-center justify-center">
                <Clock className="w-5 h-5 text-amber-700" />
              </div>
              <div>
                <p className="text-sm text-amber-700 font-medium">Late</p>
                <p className="text-2xl font-bold text-amber-800">{overallStats.late}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border border-indigo-200 shadow-lg bg-gradient-to-br from-indigo-50 to-indigo-100">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-indigo-200 flex items-center justify-center">
                <AlertCircle className="w-5 h-5 text-indigo-700" />
              </div>
              <div>
                <p className="text-sm text-indigo-700 font-medium">Excused</p>
                <p className="text-2xl font-bold text-indigo-800">{overallStats.excused}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Attendance Rate */}
      <Card className="border border-slate-300 shadow-lg bg-gradient-to-br from-slate-50 to-slate-100">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-slate-800">
            <BarChart3 className="w-5 h-5 text-slate-600" />
            Overall Attendance Rate
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4">
            <div className="text-4xl font-bold text-slate-800">{overallStats.attendanceRate}%</div>
            <div className="flex-1">
              <div className="w-full bg-slate-200 h-3">
                <div 
                  className="bg-slate-600 h-3 transition-all duration-300"
                  style={{ width: `${overallStats.attendanceRate}%` }}
                ></div>
              </div>
              <p className="text-sm text-slate-600 mt-2">
                {overallStats.present} out of {overallStats.totalDays} days attended
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Subject-wise Attendance */}
      <Card className="border border-slate-300 shadow-lg bg-gradient-to-br from-slate-50 to-slate-100">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-slate-800">
            <BookOpen className="w-5 h-5 text-slate-600" />
            Subject-wise Attendance
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {mockSubjectAttendance.map((subject) => (
              <div key={subject.subject} className="flex items-center justify-between p-3 border border-slate-200 bg-white shadow-sm">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-slate-100 flex items-center justify-center">
                    <BookOpen className="w-4 h-4 text-slate-600" />
                  </div>
                  <div>
                    <p className="font-semibold text-slate-800">{subject.subject}</p>
                    <p className="text-sm text-slate-600">
                      {subject.present} present, {subject.absent} absent
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-lg font-bold text-slate-800">{subject.percentage}%</p>
                  <div className="w-24 bg-slate-200 h-2 mt-1">
                    <div 
                      className="bg-slate-600 h-2"
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
        <h3 className="text-lg font-semibold text-slate-800">Detailed Attendance Records</h3>
        <div className="flex items-center gap-2">
          <Select value={selectedMonth} onValueChange={setSelectedMonth}>
            <SelectTrigger className="w-40 border border-slate-300 bg-white">
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
            <SelectTrigger className="w-40 border border-slate-300 bg-white">
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
          <Card className="p-8 text-center border border-slate-300 shadow-lg bg-gradient-to-br from-slate-50 to-slate-100">
            <div className="flex flex-col items-center gap-4">
              <Calendar className="w-12 h-12 text-slate-400" />
              <div>
                <h3 className="text-lg font-semibold text-slate-800">No attendance records found</h3>
                <p className="text-slate-600">Try adjusting your filters</p>
              </div>
            </div>
          </Card>
        ) : (
          filteredRecords.map((record) => (
            <Card key={record.id} className="border border-slate-300 shadow-lg hover:border-slate-400 transition-all bg-white">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    {getStatusIcon(record.status)}
                    <div>
                      <p className="font-semibold text-slate-800">{record.subject}</p>
                      <p className="text-sm text-slate-600">
                        {new Date(record.date).toLocaleDateString()} • {record.time} • {record.teacher}
                      </p>
                      {record.notes && (
                        <p className="text-xs text-slate-500 mt-1">{record.notes}</p>
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
      <Card className="border border-slate-300 shadow-lg bg-gradient-to-br from-slate-50 to-slate-100">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-slate-800">
            <Target className="w-5 h-5 text-slate-600" />
            Subject-wise Performance
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {mockSubjectAttendance.map((subject) => (
              <Card key={subject.subject} className="border border-slate-300 shadow-lg bg-white">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-8 h-8 bg-slate-100 flex items-center justify-center">
                      <BookOpen className="w-4 h-4 text-slate-600" />
                    </div>
                    <div>
                      <p className="font-semibold text-slate-800">{subject.subject}</p>
                      <p className="text-xs text-slate-600">{subject.total} total classes</p>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-emerald-600">Present</span>
                      <span className="font-semibold text-slate-800">{subject.present}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-rose-600">Absent</span>
                      <span className="font-semibold text-slate-800">{subject.absent}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-amber-600">Late</span>
                      <span className="font-semibold text-slate-800">{subject.late}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-indigo-600">Excused</span>
                      <span className="font-semibold text-slate-800">{subject.excused}</span>
                    </div>
                  </div>

                  <div className="mt-4">
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-sm font-semibold text-slate-700">Attendance Rate</span>
                      <span className="text-lg font-bold text-slate-800">{subject.percentage}%</span>
                    </div>
                    <div className="w-full bg-slate-200 h-2">
                      <div 
                        className="bg-slate-600 h-2 transition-all duration-300"
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

  return (
    <div className="w-full bg-gradient-to-br from-slate-50 to-slate-100 min-h-screen p-6">
      {/* Back to Dashboard Icon Button at the Top */}
      <div className="flex items-center mb-8">
        <Button
          className="bg-slate-800 text-white px-4 py-3 mr-4 shadow-lg hover:bg-slate-700 transition border border-slate-700"
          onClick={onBack}
          variant="ghost"
          size="icon"
        >
          <ArrowLeft className="w-6 h-6" />
        </Button>
        <div className="flex items-center gap-3">
          <div className="w-1 h-8 bg-gradient-to-b from-indigo-600 to-purple-600"></div>
          <h2 className="text-3xl font-bold text-slate-800">Attendance Overview</h2>
        </div>
      </div>

      {/* Profile & Stats */}
      <div className="bg-gradient-to-br from-white to-slate-50 border-2 border-slate-300 p-8 mb-8 flex flex-col md:flex-row md:items-center gap-8 shadow-xl">
        <div className="flex items-center gap-6 flex-1 min-w-0">
          <div className="relative">
            <img src={studentProfile.photo} alt={studentProfile.name} className="w-24 h-24 object-cover border-4 border-slate-300 shadow-lg" />
            <div className="absolute -bottom-2 -right-2 w-8 h-8 bg-emerald-500 border-2 border-white flex items-center justify-center">
              <CheckCircle className="w-4 h-4 text-white" />
            </div>
          </div>
          <div className="space-y-2 min-w-0">
            <h2 className="text-3xl font-bold text-slate-800 truncate flex items-center gap-3">
              {studentProfile.name}
              <span className="inline-flex items-center bg-gradient-to-r from-indigo-100 to-purple-100 text-indigo-700 px-3 py-1 text-sm font-semibold border border-indigo-200">
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M3 21v-2a4 4 0 014-4h10a4 4 0 014 4v2" /><circle cx="12" cy="7" r="4" /></svg>
                Kenya School
              </span>
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm text-slate-600">
              <span><span className="font-semibold text-slate-700">ID:</span> {studentProfile.id}</span>
              <span><span className="font-semibold text-slate-700">Number:</span> {studentProfile.number}</span>
              <span><span className="font-semibold text-slate-700">Email:</span> {studentProfile.email}</span>
              <span><span className="font-semibold text-slate-700">Address:</span> {studentProfile.address}</span>
            </div>
          </div>
        </div>
        <Button className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-8 py-3 mt-4 border border-indigo-700 hover:from-indigo-700 hover:to-purple-700 shadow-lg font-semibold">
          Download Report
        </Button>
      </div>

      {/* Best Streak & Fun Fact */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
        <Card className="border-2 border-amber-300 shadow-xl bg-gradient-to-br from-amber-50 to-amber-100">
          <CardContent className="p-8 flex flex-col gap-4 items-center">
            <div className="w-16 h-16 bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center shadow-lg">
              <svg width="32" height="32" viewBox="0 0 40 40"><circle cx="20" cy="20" r="18" fill="#fbbf24" /><path d="M20 10l3 6 6 .5-4.5 4 1.5 6-5-3.5-5 3.5 1.5-6-4.5-4 6-.5z" fill="#fff" /></svg>
            </div>
            <div className="text-center">
              <span className="text-amber-700 text-sm font-medium mb-2 block">Best Streak</span>
              <span className="text-4xl font-bold text-amber-800 mb-1">8 Days</span>
              <span className="text-sm text-amber-700">Longest Attendance Streak</span>
            </div>
          </CardContent>
        </Card>
        <Card className="border-2 border-emerald-300 shadow-xl bg-gradient-to-br from-emerald-50 to-emerald-100">
          <CardContent className="p-8 flex flex-col gap-4 items-center">
            <div className="w-16 h-16 bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center shadow-lg">
              <svg width="32" height="32" viewBox="0 0 40 40"><circle cx="20" cy="20" r="18" fill="#10b981" /><text x="20" y="25" textAnchor="middle" fontSize="18" fill="#fff">🎉</text></svg>
            </div>
            <div className="text-center">
              <span className="text-emerald-700 text-sm font-medium mb-2 block">Fun Fact</span>
              <span className="text-xl font-bold text-emerald-800 mb-1">All Mondays Attended!</span>
              <span className="text-sm text-emerald-700">You never missed a Monday this term.</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Attendance History Table */}
      <Card className="border-2 border-slate-300 shadow-xl bg-gradient-to-br from-white to-slate-50 mb-8">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-3 text-slate-800">
              <CalendarDays className="w-6 h-6 text-slate-600" />
              Attendance History
            </CardTitle>
            <div className="flex items-center gap-3">
              <Select value={selectedMonth} onValueChange={setSelectedMonth}>
                <SelectTrigger className="w-32 border border-slate-300 bg-white">
                  <SelectValue placeholder="Month" />
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
              <Select value={selectedWeek} onValueChange={setSelectedWeek}>
                <SelectTrigger className="w-32 border border-slate-300 bg-white">
                  <SelectValue placeholder="Week" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="All Weeks">All Weeks</SelectItem>
                  {Array.from({ length: 14 }, (_, i) => i + 1).map((week) => (
                    <SelectItem key={week} value={week.toString()}>
                      Week {week}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-4 py-2 border border-indigo-700 hover:from-indigo-700 hover:to-purple-700 shadow-lg">
                <Download className="w-4 h-4 mr-2" />
                Export
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b-2 border-slate-300">
                  <th className="text-left py-4 px-4 font-semibold text-slate-800">Week</th>
                  <th className="text-left py-4 px-4 font-semibold text-slate-800">Date</th>
                  <th className="text-left py-4 px-4 font-semibold text-slate-800">Day</th>
                  <th className="text-left py-4 px-4 font-semibold text-slate-800">Time</th>
                  <th className="text-left py-4 px-4 font-semibold text-slate-800">Subject</th>
                  <th className="text-left py-4 px-4 font-semibold text-slate-800">Teacher</th>
                  <th className="text-left py-4 px-4 font-semibold text-slate-800">Status</th>
                  <th className="text-left py-4 px-4 font-semibold text-slate-800">Notes</th>
                </tr>
              </thead>
              <tbody>
                {filteredHistory.map((record, index) => (
                  <tr key={record.id} className={`border-b border-slate-200 hover:bg-slate-50 transition-colors ${index % 2 === 0 ? 'bg-white' : 'bg-slate-50'}`}>
                    <td className="py-4 px-4">
                      <div className={`inline-flex items-center px-3 py-1 text-xs font-semibold text-white bg-gradient-to-r ${getWeekColor(record.week)} shadow-sm`}>
                        Week {record.week}
                      </div>
                    </td>
                    <td className="py-4 px-4 text-slate-800 font-medium">
                      {new Date(record.date).toLocaleDateString('en-US', { 
                        month: 'short', 
                        day: 'numeric',
                        year: 'numeric'
                      })}
                    </td>
                    <td className="py-4 px-4">
                      <span className="text-slate-600 font-medium">{record.day}</span>
                    </td>
                    <td className="py-4 px-4 text-slate-600">{record.time}</td>
                    <td className="py-4 px-4">
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 bg-slate-100 flex items-center justify-center">
                          <BookOpen className="w-3 h-3 text-slate-600" />
                        </div>
                        <span className="text-slate-800 font-medium">{record.subject}</span>
                      </div>
                    </td>
                    <td className="py-4 px-4 text-slate-600">{record.teacher}</td>
                    <td className="py-4 px-4">
                      {getStatusBadge(record.status)}
                    </td>
                    <td className="py-4 px-4">
                      {record.notes ? (
                        <div className="flex items-center gap-2">
                          <Eye className="w-4 h-4 text-slate-400" />
                          <span className="text-sm text-slate-600">{record.notes}</span>
                        </div>
                      ) : (
                        <span className="text-slate-400 text-sm">-</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          
          {filteredHistory.length === 0 && (
            <div className="text-center py-12">
              <Calendar className="w-12 h-12 text-slate-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-slate-800 mb-2">No attendance records found</h3>
              <p className="text-slate-600">Try adjusting your filters</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Attendance Heatmap Section */}
      <div className="mb-8">
        <AttendanceHeatmap />
      </div>
    </div>
  );
} 