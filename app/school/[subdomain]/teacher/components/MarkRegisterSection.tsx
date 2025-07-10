import React, { useState } from "react";
import { CheckCircle2, XCircle, ChevronLeft, Loader2, CalendarDays, BookOpen, Users, ClipboardList } from "lucide-react";

// Mock students data
const mockStudents = [
  { id: 1, name: "Achieng Mary", adm: "ADM001" },
  { id: 2, name: "Kamau John", adm: "ADM002" },
  { id: 3, name: "Otieno Brian", adm: "ADM003" },
  { id: 4, name: "Wanjiku Faith", adm: "ADM004" },
  { id: 5, name: "Mutiso Peter", adm: "ADM005" },
  { id: 6, name: "Njeri Grace", adm: "ADM006" },
  { id: 7, name: "Mwangi Samuel", adm: "ADM007" },
  { id: 8, name: "Chebet Sharon", adm: "ADM008" },
  { id: 9, name: "Kiptoo Kevin", adm: "ADM009" },
  { id: 10, name: "Muthoni Esther", adm: "ADM010" },
  { id: 11, name: "Omondi Felix", adm: "ADM011" },
  { id: 12, name: "Karanja Dennis", adm: "ADM012" },
  { id: 13, name: "Amina Halima", adm: "ADM013" },
  { id: 14, name: "Koech Mercy", adm: "ADM014" },
  { id: 15, name: "Wekesa Collins", adm: "ADM015" },
  { id: 16, name: "Mbugua Alice", adm: "ADM016" },
  { id: 17, name: "Mutua Victor", adm: "ADM017" },
  { id: 18, name: "Cheruiyot Janet", adm: "ADM018" },
  { id: 19, name: "Kilonzo Brian", adm: "ADM019" },
  { id: 20, name: "Wambui Carol", adm: "ADM020" },
  { id: 21, name: "Ochieng George", adm: "ADM021" },
  { id: 22, name: "Nduta Rose", adm: "ADM022" },
  { id: 23, name: "Barasa Paul", adm: "ADM023" },
  { id: 24, name: "Kiplangat Edwin", adm: "ADM024" },
  { id: 25, name: "Moraa Cynthia", adm: "ADM025" },
  { id: 26, name: "Kariuki James", adm: "ADM026" },
  { id: 27, name: "Wanjala Lillian", adm: "ADM027" },
  { id: 28, name: "Kibet Brian", adm: "ADM028" },
  { id: 29, name: "Muli Agnes", adm: "ADM029" },
  { id: 30, name: "Omondi Sharon", adm: "ADM030" },
  { id: 31, name: "Kiprono Dennis", adm: "ADM031" },
  { id: 32, name: "Wairimu Ruth", adm: "ADM032" },
  { id: 33, name: "Mutuku John", adm: "ADM033" },
  { id: 34, name: "Cherop Daisy", adm: "ADM034" },
  { id: 35, name: "Karanja Peter", adm: "ADM035" },
  { id: 36, name: "Akinyi Beatrice", adm: "ADM036" },
  { id: 37, name: "Koech Edwin", adm: "ADM037" },
  { id: 38, name: "Wambua Faith", adm: "ADM038" },
  { id: 39, name: "Omondi Victor", adm: "ADM039" },
  { id: 40, name: "Kiprotich Kelvin", adm: "ADM040" },
  { id: 41, name: "Muthoni Carol", adm: "ADM041" },
  { id: 42, name: "Barasa Brian", adm: "ADM042" },
  { id: 43, name: "Kipchumba Sharon", adm: "ADM043" },
  { id: 44, name: "Ndungu Alice", adm: "ADM044" },
  { id: 45, name: "Ochieng Dennis", adm: "ADM045" },
  { id: 46, name: "Kiptoo Janet", adm: "ADM046" },
  { id: 47, name: "Wekesa Peter", adm: "ADM047" },
  { id: 48, name: "Muthama Rose", adm: "ADM048" },
  { id: 49, name: "Kipkemboi Samuel", adm: "ADM049" },
  { id: 50, name: "Auma Grace", adm: "ADM050" },
];

// Mock class/grade and subject
const mockClass = "Grade 7";
const mockSubject = "Mathematics";

function formatDate(date: Date) {
  return date.toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
}

export default function MarkRegisterSection({ subdomain, onBack }: { subdomain?: string; onBack?: () => void }) {
  // Attendance state: { [studentId]: true (present) | false (absent) }
  const [attendance, setAttendance] = useState(() => Object.fromEntries(mockStudents.map(s => [s.id, true])));
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);
  // Add state for expand/collapse
  const [showAll, setShowAll] = useState(false);
  const studentsToShow = showAll ? mockStudents : mockStudents.slice(0, 25);

  const presentCount = Object.values(attendance).filter(Boolean).length;
  const absentCount = mockStudents.length - presentCount;

  const handleToggle = (id: number) => {
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
                <th className="px-2 sm:px-4 py-2 sm:py-3 font-semibold">Name</th>
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
                  <td className="px-2 sm:px-4 py-2 sm:py-3 font-medium text-foreground">{student.name}</td>
                  <td className="px-2 sm:px-4 py-2 sm:py-3 text-muted-foreground">{student.adm}</td>
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
        {/* Save Button */}
        <div className="flex justify-center mt-2">
          <button
            type="button"
            className="px-4 py-1 bg-primary text-white font-semibold shadow hover:bg-primary/90 transition text-sm"
            onClick={() => setShowAll(v => !v)}
          >
            {showAll ? 'Show Less' : 'Show More'}
          </button>
        </div>
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