import React, { useState, useEffect } from "react";
import { CheckCircle2, XCircle, ChevronLeft, Loader2, CalendarDays, BookOpen, Users, ClipboardList, Home } from "lucide-react";
import { graphqlClient } from "@/lib/graphql-client";

// TypeScript interfaces for student data
interface Student {
  id: string;
  admission_number: string;
  phone: string;
  gender: string;
}

interface StudentsResponse {
  teacherGetStudentsByGradeLevel: Student[];
}

// GraphQL query to get students by grade level
const GET_STUDENTS_BY_GRADE_QUERY = `
  query GetStudentsByGradeLevel($gradeLevelId: String!) {
    teacherGetStudentsByGradeLevel(gradeLevelId: $gradeLevelId) {
      id
      admission_number
      phone
      gender
    }
  }
`;

// Mock class/grade and subject
const mockClass = "Grade 7";
const mockSubject = "Mathematics";

function formatDate(date: Date) {
  return date.toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
}

export default function MarkRegisterSection({ 
  subdomain, 
  onBack, 
  gradeLevelId = "85fa5c32-57dd-4d72-be99-abaa9fa5a7c8" 
}: { 
  subdomain?: string; 
  onBack?: () => void;
  gradeLevelId?: string;
}) {
  // State management
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [attendance, setAttendance] = useState<{[key: string]: boolean}>({});
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);
  const [showAll, setShowAll] = useState(false);
  
  const studentsToShow = showAll ? students : students.slice(0, 25);
  const presentCount = Object.values(attendance).filter(Boolean).length;
  const absentCount = students.length - presentCount;

  // Fetch students data on component mount
  useEffect(() => {
    const fetchStudents = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await graphqlClient.request<StudentsResponse>(
          GET_STUDENTS_BY_GRADE_QUERY,
          { gradeLevelId }
        );
        const fetchedStudents = response.teacherGetStudentsByGradeLevel || [];
        setStudents(fetchedStudents);
        
        // Initialize attendance state - all students present by default
        const initialAttendance = Object.fromEntries(
          fetchedStudents.map(student => [student.id, true])
        );
        setAttendance(initialAttendance);
      } catch (err) {
        console.error('Error fetching students:', err);
        setError('Failed to load students. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    if (gradeLevelId) {
      fetchStudents();
    }
  }, [gradeLevelId]);

  const handleToggle = (id: string) => {
    setAttendance(a => ({ ...a, [id]: !a[id] }));
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setTimeout(() => {
      setSaving(false);
      setSuccess(true);
    }, 1200);
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-16 animate-fadeIn min-h-screen">
        <div className="w-16 h-16 flex items-center justify-center bg-primary text-white mb-4 shadow-lg">
          <Loader2 className="w-8 h-8 animate-spin" />
        </div>
        <div className="text-lg font-semibold text-primary mb-2">Loading Students...</div>
        <div className="text-muted-foreground text-sm">Please wait while we fetch the student list.</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-16 animate-fadeIn min-h-screen">
        <div className="w-16 h-16 flex items-center justify-center bg-destructive text-white mb-4 shadow-lg">
          <XCircle className="w-8 h-8" />
        </div>
        <div className="text-lg font-semibold text-destructive mb-2">Error Loading Students</div>
        <div className="text-muted-foreground text-sm mb-6">{error}</div>
        <div className="flex gap-4">
          <button
            className="px-4 py-2 bg-primary text-white font-semibold hover:bg-primary/90 transition shadow"
            onClick={() => window.location.reload()}
          >Try Again</button>
          <button
            className="px-4 py-2 bg-muted text-foreground font-semibold hover:bg-muted/90 transition shadow"
            onClick={onBack}
          >Back to Dashboard</button>
        </div>
      </div>
    );
  }

  if (success) {
    return (
      <div className="flex flex-col items-center justify-center py-16 animate-fadeIn min-h-screen">
        <div className="w-16 h-16 flex items-center justify-center bg-primary text-white mb-4 shadow-lg">
          <CheckCircle2 className="w-8 h-8" />
        </div>
        <div className="text-lg font-semibold text-primary mb-2">Register Marked!</div>
        <div className="text-muted-foreground text-sm mb-6">Attendance has been saved successfully.</div>
        <button
          className="px-4 py-2 bg-primary text-white font-semibold hover:bg-primary/90 transition shadow"
          onClick={onBack}
        >Back to Dashboard</button>
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-gradient-to-br from-primary/5 to-white py-4 px-1 animate-fadeIn overflow-x-hidden">
      <form onSubmit={handleSave} className="w-full max-w-2xl mx-auto bg-white shadow-2xl border border-primary/10 p-0 flex flex-col gap-6 sm:gap-10 overflow-hidden min-h-[80vh]">
        {/* Creative Header Section */}
        <div className="relative bg-gradient-to-br from-primary/10 via-primary/5 to-white shadow-sm px-2 sm:px-8 pt-8 pb-6 flex flex-col items-center gap-4 border-b border-primary/10">
          {/* Floating Back Button */}
          <button
            type="button"
            className="absolute top-3 left-3 sm:top-6 sm:left-6 z-10 flex items-center gap-1 px-3 py-1.5 bg-white/80 text-primary border border-primary/20 font-semibold shadow hover:bg-primary/10 transition text-sm backdrop-blur"
            onClick={onBack}
          >
            <ChevronLeft className="w-4 h-4" /> Back
          </button>
          
          {/* Return to Main Menu Button */}
          <button
            type="button"
            className="absolute top-3 right-3 sm:top-6 sm:right-6 z-10 flex items-center gap-2 px-3 py-1.5 bg-primary/90 text-white border border-primary/20 font-semibold shadow hover:bg-primary transition text-sm backdrop-blur"
            onClick={onBack}
          >
            <Home className="w-4 h-4" />
            Main Menu
          </button>
          
          {/* Date with Icon */}
          <div className="flex flex-col items-center gap-2">
            <span className="flex items-center justify-center w-14 h-14 bg-primary shadow-lg mb-1">
              <CalendarDays className="w-8 h-8 text-white" />
            </span>
            <span className="text-xl sm:text-2xl font-extrabold text-primary tracking-wide font-serif drop-shadow-sm text-center">
              {formatDate(new Date())}
            </span>
          </div>
          {/* Subject & Class Badges */}
          <div className="flex flex-wrap justify-center gap-3 mt-2">
            <span className="inline-flex items-center gap-2 px-4 py-1.5 bg-primary/90 text-white font-semibold shadow">
              <BookOpen className="w-5 h-5" /> {mockSubject}
            </span>
            <span className="inline-flex items-center gap-2 px-4 py-1.5 bg-primary/70 text-white font-semibold shadow">
              <Users className="w-5 h-5" /> {mockClass}
            </span>
          </div>
          {/* Section Title */}
          <div className="flex flex-col items-center mt-4">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-primary flex items-center gap-2 tracking-tight underline underline-offset-8 decoration-primary/40 mb-1">
              <ClipboardList className="w-7 h-7 text-primary/80" />
              Mark Register
            </h2>
            {/* Summary Bar */}
            <div className="flex flex-wrap justify-center gap-3 mt-2">
              <span className="inline-flex items-center gap-2 px-4 py-1.5 bg-primary/10 text-primary font-semibold text-sm shadow-sm">
                <CheckCircle2 className="w-4 h-4 text-primary" /> Present: {presentCount}
              </span>
              <span className="inline-flex items-center gap-2 px-4 py-1.5 bg-destructive/10 text-destructive font-semibold text-sm shadow-sm">
                <XCircle className="w-4 h-4 text-destructive" /> Absent: {absentCount}
              </span>
            </div>
          </div>
        </div>
        {/* Table */}
        <div className="overflow-x-auto px-1 sm:px-4 pb-2 sm:pb-4 w-full">
          <table className="min-w-full border overflow-hidden shadow-sm text-xs sm:text-sm">
            <thead>
              <tr className="bg-primary/10 text-primary text-left">
                <th className="px-2 sm:px-4 py-2 sm:py-3 font-semibold">#</th>
                <th className="px-2 sm:px-4 py-2 sm:py-3 font-semibold">Student Info</th>
                <th className="px-2 sm:px-4 py-2 sm:py-3 font-semibold">Adm No.</th>
                <th className="px-2 sm:px-4 py-2 sm:py-3 font-semibold text-center">Status</th>
              </tr>
            </thead>
            <tbody>
              {studentsToShow.map((student, idx) => (
                <tr key={student.id} className={
                  `transition-all ${idx % 2 === 0 ? 'bg-primary/5' : 'bg-white'} hover:bg-primary/10` +
                  ' border-b last:border-b-0'
                }>
                  <td className="px-2 sm:px-4 py-2 sm:py-3 text-muted-foreground font-mono">{idx + 1}</td>
                  <td className="px-2 sm:px-4 py-2 sm:py-3 font-medium text-foreground">{student.gender}</td>
                  <td className="px-2 sm:px-4 py-2 sm:py-3 text-muted-foreground">{student.admission_number}</td>
                  <td className="px-2 sm:px-4 py-2 sm:py-3 text-center">
                    <button
                      type="button"
                      className={`inline-flex items-center gap-2 px-3 sm:px-4 py-1.5 sm:py-2 font-semibold transition-all shadow-md focus:ring-2 focus:ring-primary/30 text-xs sm:text-base
                        ${attendance[student.id] ? 'bg-primary text-white hover:bg-primary/90 scale-105' : 'bg-destructive/90 text-white hover:bg-destructive scale-105'}`}
                      onClick={() => handleToggle(student.id)}
                    >
                      {attendance[student.id] ? <CheckCircle2 className="w-4 h-4 sm:w-5 sm:h-5" /> : <XCircle className="w-4 h-4 sm:w-5 sm:h-5" />}
                      {attendance[student.id] ? 'Present' : 'Absent'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {/* Show More/Less Button - only show if there are more than 25 students */}
        {students.length > 25 && (
          <div className="flex justify-center mt-2">
            <button
              type="button"
              className="px-4 py-1 bg-primary text-white font-semibold shadow hover:bg-primary/90 transition text-sm"
              onClick={() => setShowAll(v => !v)}
            >
              {showAll ? 'Show Less' : `Show All (${students.length} students)`}
            </button>
          </div>
        )}
        <div className="flex justify-end px-3 sm:px-8 pb-4 sm:pb-8 mt-2">
          <button
            type="submit"
            className="flex items-center gap-2 px-6 sm:px-8 py-2.5 sm:py-3 bg-gradient-to-r from-primary to-primary/80 text-white font-bold text-base sm:text-lg shadow-lg hover:scale-105 hover:from-primary/90 hover:to-primary/70 transition disabled:opacity-60 disabled:cursor-not-allowed"
            disabled={saving}
          >
            {saving ? <Loader2 className="w-5 h-5 sm:w-6 sm:h-6 animate-spin" /> : <CheckCircle2 className="w-5 h-5 sm:w-6 sm:h-6" />} Save Register
          </button>
        </div>
      </form>
    </div>
  );
} 