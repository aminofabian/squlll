import React from 'react';
import { User, MapPin, Phone, Mail, Globe, Calendar, Award, TrendingUp, Star, Target, BookOpen, GraduationCap } from 'lucide-react';

interface Subject {
  id: string;
  name: string;
  code: string;
  subjectType: string;
  category: string | null;
  department: string | null;
  shortName: string | null;
  isCompulsory: boolean | null;
  totalMarks: number | null;
  passingMarks: number | null;
  creditHours: number | null;
  curriculum: string | null;
}

interface Student {
  id: string;
  name: string;
  admissionNumber: string;
  gender: string;
  grade: string;
  stream?: string;
  user: {
    email: string;
  };
}

interface School {
  id: string;
  schoolName: string;
  subdomain: string;
}

interface ReportCardProps {
  student: Student;
  school: School;
  subjects: Subject[];
  term?: string;
  year?: string;
  template?: 'modern' | 'classic' | 'compact' | 'uganda-classic';
  // Mock data for demonstration - in real app this would come from API
  mockSubjectGrades?: Array<{
    name: string;
    cat: string;
    exam: string;
    total: string;
    grd: string;
    pts: string;
    form: string;
    remarks: string;
    initials: string;
  }>;
  performanceData?: Array<{ term: number; score: number }>;
}

const SchoolReportCard: React.FC<ReportCardProps> = ({
  student,
  school,
  subjects,
  term = "1",
  year = "2024",
  template = "modern",
  mockSubjectGrades = [],
  performanceData = []
}) => {
  // Generate mock grades if not provided
  const defaultMockGrades = [
    { name: "ENGLISH", cat: "X", exam: "65", total: "65.0", grd: "B", pts: "9", form: "5/20", remarks: "GOOD", initials: "LO" },
    { name: "KISWAHILI", cat: "75", exam: "2", total: "75.0", grd: "A-", pts: "11", form: "6/20", remarks: "EXCELLENT", initials: "LO" },
    { name: "MATHEMATICS", cat: "75", exam: "2", total: "75.0", grd: "A-", pts: "11", form: "7/20", remarks: "EXCELLENT", initials: "MT" },
    { name: "BIOLOGY", cat: "54", exam: "4", total: "54.0", grd: "C", pts: "6", form: "5/20", remarks: "AVERAGE", initials: "BO" },
    { name: "CHEMISTRY", cat: "78", exam: "2", total: "78.0", grd: "A-", pts: "11", form: "7/20", remarks: "EXCELLENT", initials: "BO" },
    { name: "PHYSICS", cat: "90", exam: "1", total: "90.0", grd: "A", pts: "12", form: "11/20", remarks: "EXCELLENT", initials: "MT" },
    { name: "HISTORY", cat: "70", exam: "2", total: "70.0", grd: "B+", pts: "10", form: "7/20", remarks: "BETTER. KEEP IT UP!", initials: "DT" },
    { name: "GERMAN", cat: "82", exam: "2", total: "82.0", grd: "A-", pts: "12", form: "4/20", remarks: "EXCELLENT", initials: "DT" }
  ];

  const defaultPerformanceData = [
    { term: 1, score: 50 },
    { term: 2, score: 60 },
    { term: 3, score: 65 },
    { term: 4, score: 70 },
    { term: 5, score: 73 }
  ];

  const subjectsToDisplay = mockSubjectGrades.length > 0 ? mockSubjectGrades : defaultMockGrades;
  const performanceToDisplay = performanceData.length > 0 ? performanceData : defaultPerformanceData;

  const getGradeColor = (grade: string) => {
    if (grade === 'A' || grade === 'A-') return 'text-green-700 bg-green-100 border-green-300';
    if (grade === 'B+' || grade === 'B') return 'text-[#246a59] bg-[#246a59]/10 border-[#246a59]/30';
    if (grade === 'C') return 'text-yellow-700 bg-yellow-100 border-yellow-300';
    return 'text-gray-700 bg-gray-100 border-gray-300';
  };

  // Modern Template
  const ModernTemplate = () => (
    <div className="max-w-5xl mx-auto bg-white shadow-lg border border-gray-200">
      {/* Header with School Information */}
      <div className="bg-gradient-to-r from-[#246a59] to-[#1a4c40] text-white p-6">
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-4 mb-2">
              <div className="w-16 h-16 bg-white/20 rounded-lg flex items-center justify-center">
                <span className="text-2xl font-bold text-white">{school.schoolName.charAt(0)}</span>
              </div>
              <div>
                <h1 className="text-2xl font-bold tracking-wide">{school.schoolName.toUpperCase()}</h1>
                <p className="text-white/90 text-sm">Academic Excellence • Character Development</p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4 text-sm text-white/90">
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4" />
                <span>Flowery Road 14, 01001 Nairobi, Kenya</span>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="w-4 h-4" />
                <span>+254 707 664 123</span>
              </div>
              <div className="flex items-center gap-2">
                <Mail className="w-4 h-4" />
                <span>admin@{school.subdomain}.org</span>
              </div>
              <div className="flex items-center gap-2">
                <Globe className="w-4 h-4" />
                <span>www.{school.subdomain}.org</span>
              </div>
            </div>
          </div>
          
          <div className="text-center">
            <div className="w-24 h-32 bg-white/10 rounded-lg border-2 border-white/30 flex items-center justify-center mb-2">
              <User className="w-12 h-12 text-white/70" />
            </div>
            <p className="text-xs text-white/90">Student Photo</p>
          </div>
        </div>
      </div>

      {/* Report Title */}
      <div className="bg-gray-50 border-b border-gray-200 p-4">
        <div className="text-center">
          <h2 className="text-xl font-bold text-gray-800 mb-1">ACADEMIC REPORT CARD</h2>
          <p className="text-gray-600 font-medium">Term {term} • Academic Year {year}</p>
        </div>
      </div>

      {/* Student Information */}
      <div className="p-6">
        <div className="bg-[#246a59]/5 border border-[#246a59]/20 rounded-lg p-4 mb-6">
          <h3 className="text-lg font-semibold text-[#246a59] mb-4 flex items-center gap-2">
            <User className="w-5 h-5" />
            Student Information
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <label className="text-sm font-medium text-[#246a59]">Full Name</label>
              <div className="mt-1 p-2 bg-white border border-[#246a59]/30 rounded text-sm font-medium">
                {student.name.toUpperCase()}
              </div>
            </div>
            <div>
              <label className="text-sm font-medium text-[#246a59]">Admission No.</label>
              <div className="mt-1 p-2 bg-white border border-[#246a59]/30 rounded text-sm font-medium">
                {student.admissionNumber}
              </div>
            </div>
            <div>
              <label className="text-sm font-medium text-[#246a59]">Class/Form</label>
              <div className="mt-1 p-2 bg-white border border-[#246a59]/30 rounded text-sm font-medium">
                {student.grade}
              </div>
            </div>
            <div>
              <label className="text-sm font-medium text-[#246a59]">Stream</label>
              <div className="mt-1 p-2 bg-white border border-[#246a59]/30 rounded text-sm font-medium">
                {student.stream || "Not Assigned"}
              </div>
            </div>
          </div>
        </div>

        {/* Academic Performance Table */}
        <div className="mb-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
            <Award className="w-5 h-5" />
            Academic Performance
          </h3>
          <div className="overflow-x-auto border border-gray-300 rounded-lg">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-100 border-b border-gray-300">
                  <th className="text-left p-3 font-semibold text-gray-700">Subject</th>
                  <th className="text-center p-3 font-semibold text-gray-700">CAT</th>
                  <th className="text-center p-3 font-semibold text-gray-700">Exam</th>
                  <th className="text-center p-3 font-semibold text-gray-700">Total</th>
                  <th className="text-center p-3 font-semibold text-gray-700">Grade</th>
                  <th className="text-center p-3 font-semibold text-gray-700">Points</th>
                  <th className="text-center p-3 font-semibold text-gray-700">Position</th>
                  <th className="text-center p-3 font-semibold text-gray-700">Remarks</th>
                  <th className="text-center p-3 font-semibold text-gray-700">Teacher</th>
                </tr>
              </thead>
              <tbody>
                {subjectsToDisplay.map((subject, index) => (
                  <tr key={index} className={`border-b border-gray-200 ${index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}`}>
                    <td className="p-3 font-medium text-gray-800">{subject.name}</td>
                    <td className="p-3 text-center text-gray-700">{subject.cat}</td>
                    <td className="p-3 text-center text-gray-700">{subject.exam}</td>
                    <td className="p-3 text-center font-medium text-gray-800">{subject.total}</td>
                    <td className="p-3 text-center">
                      <span className={`px-3 py-1 rounded-full text-xs font-bold border ${getGradeColor(subject.grd)}`}>
                        {subject.grd}
                      </span>
                    </td>
                    <td className="p-3 text-center font-medium text-gray-800">{subject.pts}</td>
                    <td className="p-3 text-center text-gray-700">{subject.form}</td>
                    <td className="p-3 text-center text-xs text-gray-600 max-w-32">{subject.remarks}</td>
                    <td className="p-3 text-center font-medium text-gray-700">{subject.initials}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Performance Summary and Statistics */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          {/* Performance Summary */}
          <div className="bg-gradient-to-br from-green-50 to-green-100 border border-green-200 rounded-lg p-4">
            <h3 className="text-lg font-semibold text-green-800 mb-4 flex items-center gap-2">
              <Award className="w-5 h-5" />
              Performance Summary
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-white rounded-lg p-3 border border-green-200">
                <div className="text-sm text-green-600 font-medium">Total Score</div>
                <div className="text-2xl font-bold text-green-800">589</div>
              </div>
              <div className="bg-white rounded-lg p-3 border border-green-200">
                <div className="text-sm text-green-600 font-medium">Mean Grade</div>
                <div className="text-2xl font-bold text-green-800">B+</div>
              </div>
              <div className="bg-white rounded-lg p-3 border border-green-200">
                <div className="text-sm text-green-600 font-medium">Class Position</div>
                <div className="text-2xl font-bold text-green-800">2/5</div>
              </div>
              <div className="bg-white rounded-lg p-3 border border-green-200">
                <div className="text-sm text-green-600 font-medium">Stream Position</div>
                <div className="text-2xl font-bold text-green-800">7/20</div>
              </div>
            </div>
          </div>
          
          {/* Performance Trend Chart */}
          <div className="bg-gradient-to-br from-[#246a59]/5 to-[#246a59]/10 border border-[#246a59]/20 rounded-lg p-4">
            <h3 className="text-lg font-semibold text-[#246a59] mb-4 flex items-center gap-2">
              <TrendingUp className="w-5 h-5" />
              Performance Trend
            </h3>
            <div className="h-40 flex items-end justify-between gap-2">
              {performanceToDisplay.map((point, index) => (
                <div key={index} className="flex flex-col items-center flex-1">
                  <div className="text-xs text-[#246a59] mb-1">{point.score}%</div>
                  <div 
                    className="w-full bg-[#246a59] rounded-t min-h-[20px]"
                    style={{ height: `${point.score}%` }}
                  ></div>
                  <span className="text-xs text-[#246a59] mt-1 font-medium">T{point.term}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Comments Section */}
        <div className="space-y-4 mb-6">
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <h3 className="font-semibold text-yellow-800 mb-3 flex items-center gap-2">
              <User className="w-4 h-4" />
              Class Teacher's Remarks
            </h3>
            <p className="text-sm text-gray-700 mb-4 italic">"{student.name} is an excellent student who demonstrates consistent academic performance and positive attitude towards learning."</p>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <span className="text-sm font-medium text-yellow-700">Signature:</span>
                <div className="border-b-2 border-yellow-300 h-8 mt-1"></div>
              </div>
              <div>
                <span className="text-sm font-medium text-yellow-700">Date:</span>
                <div className="border-b-2 border-yellow-300 h-8 mt-1"></div>
              </div>
            </div>
          </div>

          <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
            <h3 className="font-semibold text-orange-800 mb-3">Senior Master's Comments</h3>
            <p className="text-sm text-gray-700 mb-4 italic">"{student.name} shows great potential and maintains good discipline. Keep up the excellent work."</p>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <span className="text-sm font-medium text-orange-700">Signature:</span>
                <div className="border-b-2 border-orange-300 h-8 mt-1"></div>
              </div>
              <div>
                <span className="text-sm font-medium text-orange-700">Date:</span>
                <div className="border-b-2 border-orange-300 h-8 mt-1"></div>
              </div>
            </div>
          </div>

          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <h3 className="font-semibold text-red-800 mb-3">Principal's Remarks</h3>
            <p className="text-sm text-gray-700 mb-4 italic">"{student.name} is an outstanding student with excellent academic achievements. Congratulations on your performance."</p>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <span className="text-sm font-medium text-red-700">Signature:</span>
                <div className="border-b-2 border-red-300 h-8 mt-1"></div>
              </div>
              <div>
                <span className="text-sm font-medium text-red-700">Date:</span>
                <div className="border-b-2 border-red-300 h-8 mt-1"></div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="bg-gray-50 border-t border-gray-200 p-4 rounded-b-lg">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <span className="font-medium text-gray-700">Report Acknowledged by Parent/Guardian:</span>
              <div className="grid grid-cols-2 gap-4 mt-2">
                <div>
                  <span className="text-gray-600">Signature:</span>
                  <div className="border-b border-gray-300 h-6 mt-1"></div>
                </div>
                <div>
                  <span className="text-gray-600">Date:</span>
                  <div className="border-b border-gray-300 h-6 mt-1"></div>
                </div>
              </div>
            </div>
            <div className="text-right">
              <div className="flex items-center justify-end gap-2 text-gray-600">
                <Calendar className="w-4 h-4" />
                <span>Next Term: 01-Dec-{year} to 28-Feb-{parseInt(year) + 1}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  // Classic Template
  const ClassicTemplate = () => (
    <div className="max-w-4xl mx-auto bg-white border-2 border-gray-800">
      {/* Header */}
      <div className="bg-gray-800 text-white p-6 text-center">
        <div className="flex items-center justify-center gap-4 mb-4">
          <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center">
            <span className="text-3xl font-bold text-gray-800">{school.schoolName.charAt(0)}</span>
          </div>
          <div>
            <h1 className="text-3xl font-bold">{school.schoolName.toUpperCase()}</h1>
            <p className="text-lg">Academic Report Card</p>
          </div>
        </div>
        <div className="text-sm space-y-1">
          <p>Flowery Road 14, 01001 Nairobi, Kenya • Tel: +254 707 664 123</p>
          <p>Email: admin@{school.subdomain}.org • Website: www.{school.subdomain}.org</p>
        </div>
      </div>

      {/* Student Info */}
      <div className="p-6 border-b-2 border-gray-800">
        <div className="grid grid-cols-2 gap-8">
          <div>
            <h2 className="text-xl font-bold mb-4 border-b-2 border-gray-800 pb-2">STUDENT INFORMATION</h2>
            <div className="space-y-3">
              <div className="flex">
                <span className="font-bold w-32">Name:</span>
                <span className="border-b border-gray-400 flex-1 px-2">{student.name.toUpperCase()}</span>
              </div>
              <div className="flex">
                <span className="font-bold w-32">Admission No:</span>
                <span className="border-b border-gray-400 flex-1 px-2">{student.admissionNumber}</span>
              </div>
              <div className="flex">
                <span className="font-bold w-32">Class:</span>
                <span className="border-b border-gray-400 flex-1 px-2">{student.grade}</span>
              </div>
              <div className="flex">
                <span className="font-bold w-32">Stream:</span>
                <span className="border-b border-gray-400 flex-1 px-2">{student.stream || "Not Assigned"}</span>
              </div>
            </div>
          </div>
          <div>
            <h2 className="text-xl font-bold mb-4 border-b-2 border-gray-800 pb-2">ACADEMIC PERIOD</h2>
            <div className="space-y-3">
              <div className="flex">
                <span className="font-bold w-32">Term:</span>
                <span className="border-b border-gray-400 flex-1 px-2">{term}</span>
              </div>
              <div className="flex">
                <span className="font-bold w-32">Year:</span>
                <span className="border-b border-gray-400 flex-1 px-2">{year}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Grades Table */}
      <div className="p-6">
        <h2 className="text-xl font-bold mb-4 border-b-2 border-gray-800 pb-2">ACADEMIC PERFORMANCE</h2>
        <div className="overflow-x-auto">
          <table className="w-full border-collapse border-2 border-gray-800">
            <thead>
              <tr className="bg-gray-100">
                <th className="border-2 border-gray-800 p-2 text-left">SUBJECT</th>
                <th className="border-2 border-gray-800 p-2">CAT</th>
                <th className="border-2 border-gray-800 p-2">EXAM</th>
                <th className="border-2 border-gray-800 p-2">TOTAL</th>
                <th className="border-2 border-gray-800 p-2">GRADE</th>
                <th className="border-2 border-gray-800 p-2">POINTS</th>
                <th className="border-2 border-gray-800 p-2">POSITION</th>
                <th className="border-2 border-gray-800 p-2">REMARKS</th>
              </tr>
            </thead>
            <tbody>
              {subjectsToDisplay.map((subject, index) => (
                <tr key={index}>
                  <td className="border-2 border-gray-800 p-2 font-bold">{subject.name}</td>
                  <td className="border-2 border-gray-800 p-2 text-center">{subject.cat}</td>
                  <td className="border-2 border-gray-800 p-2 text-center">{subject.exam}</td>
                  <td className="border-2 border-gray-800 p-2 text-center font-bold">{subject.total}</td>
                  <td className="border-2 border-gray-800 p-2 text-center">
                    <span className={`px-2 py-1 font-bold ${getGradeColor(subject.grd)}`}>
                      {subject.grd}
                    </span>
                  </td>
                  <td className="border-2 border-gray-800 p-2 text-center">{subject.pts}</td>
                  <td className="border-2 border-gray-800 p-2 text-center">{subject.form}</td>
                  <td className="border-2 border-gray-800 p-2 text-xs">{subject.remarks}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Summary */}
      <div className="p-6 border-t-2 border-gray-800">
        <div className="grid grid-cols-2 gap-8">
          <div>
            <h3 className="text-lg font-bold mb-3 border-b border-gray-800 pb-1">PERFORMANCE SUMMARY</h3>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span>Total Score:</span>
                <span className="font-bold">589</span>
              </div>
              <div className="flex justify-between">
                <span>Mean Grade:</span>
                <span className="font-bold">B+</span>
              </div>
              <div className="flex justify-between">
                <span>Class Position:</span>
                <span className="font-bold">2/5</span>
              </div>
              <div className="flex justify-between">
                <span>Stream Position:</span>
                <span className="font-bold">7/20</span>
              </div>
            </div>
          </div>
          <div>
            <h3 className="text-lg font-bold mb-3 border-b border-gray-800 pb-1">COMMENTS</h3>
            <div className="space-y-4">
              <div>
                <p className="text-sm font-bold">Class Teacher:</p>
                <p className="text-sm italic">"{student.name} is an excellent student."</p>
              </div>
              <div>
                <p className="text-sm font-bold">Principal:</p>
                <p className="text-sm italic">"Outstanding performance. Keep it up!"</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="bg-gray-100 p-4 border-t-2 border-gray-800">
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <p className="font-bold">Parent/Guardian Signature:</p>
            <div className="border-b-2 border-gray-800 h-8 mt-1"></div>
          </div>
          <div>
            <p className="font-bold">Date:</p>
            <div className="border-b-2 border-gray-800 h-8 mt-1"></div>
          </div>
        </div>
      </div>
    </div>
  );

  // Compact Template
  const CompactTemplate = () => (
    <div className="max-w-3xl mx-auto bg-white shadow-md border border-gray-300">
      {/* Header */}
      <div className="bg-[#246a59] text-white p-4">
        <div className="text-center">
          <h1 className="text-xl font-bold">{school.schoolName.toUpperCase()}</h1>
          <p className="text-sm opacity-90">Academic Report Card - Term {term}, {year}</p>
        </div>
      </div>

      {/* Student Info */}
      <div className="p-4 bg-gray-50 border-b border-gray-200">
        <div className="grid grid-cols-3 gap-4 text-sm">
          <div>
            <span className="font-semibold text-[#246a59]">Name:</span>
            <p className="font-medium">{student.name}</p>
          </div>
          <div>
            <span className="font-semibold text-[#246a59]">Admission No:</span>
            <p className="font-medium">{student.admissionNumber}</p>
          </div>
          <div>
            <span className="font-semibold text-[#246a59]">Class:</span>
            <p className="font-medium">{student.grade}</p>
          </div>
        </div>
      </div>

      {/* Grades */}
      <div className="p-4">
        <h3 className="font-bold text-[#246a59] mb-3 flex items-center gap-2">
          <BookOpen className="w-4 h-4" />
          Subject Grades
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {subjectsToDisplay.map((subject, index) => (
            <div key={index} className="border border-gray-200 rounded p-3">
              <div className="font-semibold text-sm text-gray-800">{subject.name}</div>
              <div className="flex items-center justify-between mt-2">
                <span className="text-lg font-bold">{subject.total}</span>
                <span className={`px-2 py-1 rounded text-xs font-bold ${getGradeColor(subject.grd)}`}>
                  {subject.grd}
                </span>
              </div>
              <div className="text-xs text-gray-600 mt-1">{subject.remarks}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Summary */}
      <div className="p-4 bg-gray-50 border-t border-gray-200">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
          <div>
            <div className="text-2xl font-bold text-[#246a59]">589</div>
            <div className="text-xs text-gray-600">Total Score</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-[#246a59]">B+</div>
            <div className="text-xs text-gray-600">Mean Grade</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-[#246a59]">2/5</div>
            <div className="text-xs text-gray-600">Class Position</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-[#246a59]">7/20</div>
            <div className="text-xs text-gray-600">Stream Position</div>
          </div>
        </div>
      </div>

      {/* Comments */}
      <div className="p-4">
        <h3 className="font-bold text-[#246a59] mb-3 flex items-center gap-2">
          <Star className="w-4 h-4" />
          Comments
        </h3>
        <div className="space-y-2 text-sm">
          <div className="bg-yellow-50 p-3 rounded border-l-4 border-yellow-400">
            <p className="font-semibold text-yellow-800">Class Teacher:</p>
            <p className="text-gray-700 italic">"{student.name} shows excellent academic performance."</p>
          </div>
          <div className="bg-green-50 p-3 rounded border-l-4 border-green-400">
            <p className="font-semibold text-green-800">Principal:</p>
            <p className="text-gray-700 italic">"Outstanding achievement. Congratulations!"</p>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="p-4 bg-gray-50 border-t border-gray-200 text-center text-sm text-gray-600">
        <p>Parent/Guardian Signature: _________________ Date: _________________</p>
        <p className="mt-2">Next Term: 01-Dec-{year} to 28-Feb-{parseInt(year) + 1}</p>
      </div>
    </div>
  );

  // Uganda Classic Template (adapted from user code, dynamic)
  const UgandaClassicTemplate = () => {
    // Compose student info
    const studentData = {
      name: student.name,
      classStream: student.grade + (student.stream ? ` ${student.stream}` : ''),
      term,
      year,
      rollNumber: student.admissionNumber,
      age: typeof (student as any).age === 'number' ? `${(student as any).age} YEARS` : ((student as any).age || '')
    };

    // Compose subject rows (try to map to user format, fallback to mock if needed)
    // We'll use mockSubjectGrades if present, else subjectsToDisplay
    const subjectRows = (mockSubjectGrades.length > 0 ? mockSubjectGrades : subjectsToDisplay).map(subj => ({
      name: subj.name,
      bot: (subj as any).bot || subj.cat || '-',
      mt: (subj as any).mt || '-',
      eot: (subj as any).eot || subj.exam || '-',
      total: subj.total || '-',
      average: (subj as any).average || subj.total || '-',
      grade: (subj as any).grade || subj.grd || '-',
      remarks: subj.remarks || '-',
    }));

    const getGradeColor = (grade: string) => {
      if (grade === 'D1') return 'bg-green-100 text-green-800';
      if (grade === 'D2') return 'bg-green-50 text-green-700';
      if (grade === 'C1') return 'bg-blue-100 text-blue-800';
      if (grade === 'C2') return 'bg-blue-50 text-blue-700';
      if (grade === 'P1') return 'bg-yellow-100 text-yellow-800';
      if (grade === 'P2') return 'bg-yellow-50 text-yellow-700';
      return 'bg-gray-100 text-gray-800';
    };

    const totalMarks = subjectRows.reduce((sum, subject) => sum + (parseInt(subject.total) || 0), 0);
    const averageMarks = subjectRows.length ? (totalMarks / subjectRows.length).toFixed(1) : '0.0';
    const classPosition = '5'; // Placeholder, adapt as needed
    const totalStudents = '45'; // Placeholder, adapt as needed

    return (
      <div className="max-w-4xl mx-auto p-6 bg-white">
        {/* Header */}
        <div className="border-2 border-black p-4 mb-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center border-2 border-blue-500">
                <BookOpen className="w-8 h-8 text-blue-600" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-center">{school.schoolName.toUpperCase()}</h1>
                <p className="text-sm text-center text-gray-600">STUDENT PROGRESS REPORT</p>
              </div>
            </div>
            <div className="w-24 h-28 bg-gray-100 border-2 border-gray-400 rounded flex items-center justify-center">
              <User className="w-12 h-12 text-gray-400" />
            </div>
          </div>
        </div>

        {/* Student Information Section */}
        <div className="border border-gray-400 mb-4">
          <div className="bg-gray-200 p-2">
            <h2 className="font-bold text-center">STUDENT DETAILS</h2>
          </div>
          <div className="p-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <div className="flex">
                  <span className="font-semibold w-32">NAME:</span>
                  <span className="border-b border-gray-400 flex-1 pb-1">{studentData.name}</span>
                </div>
                <div className="flex">
                  <span className="font-semibold w-32">CLASS/STREAM:</span>
                  <span className="border-b border-gray-400 flex-1 pb-1">{studentData.classStream}</span>
                </div>
                <div className="flex">
                  <span className="font-semibold w-32">TERM:</span>
                  <span className="border-b border-gray-400 flex-1 pb-1">{studentData.term}</span>
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex">
                  <span className="font-semibold w-32">YEAR:</span>
                  <span className="border-b border-gray-400 flex-1 pb-1">{studentData.year}</span>
                </div>
                <div className="flex">
                  <span className="font-semibold w-32">ROLL NUMBER:</span>
                  <span className="border-b border-gray-400 flex-1 pb-1">{studentData.rollNumber}</span>
                </div>
                <div className="flex">
                  <span className="font-semibold w-32">AGE:</span>
                  <span className="border-b border-gray-400 flex-1 pb-1">{studentData.age}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Academic Performance Section */}
        <div className="border border-gray-400 mb-4">
          <div className="bg-gray-200 p-2">
            <h2 className="font-bold text-center">ACADEMIC PERFORMANCE</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-gray-100">
                  <th className="border border-gray-400 p-2 text-left">SUBJECT</th>
                  <th className="border border-gray-400 p-2">B.O.T<br/><span className="text-xs">(100)</span></th>
                  <th className="border border-gray-400 p-2">M.T<br/><span className="text-xs">(100)</span></th>
                  <th className="border border-gray-400 p-2">E.O.T<br/><span className="text-xs">(100)</span></th>
                  <th className="border border-gray-400 p-2">TOTAL<br/><span className="text-xs">(300)</span></th>
                  <th className="border border-gray-400 p-2">AVERAGE</th>
                  <th className="border border-gray-400 p-2">GRADE</th>
                  <th className="border border-gray-400 p-2">REMARKS</th>
                </tr>
              </thead>
              <tbody>
                {subjectRows.map((subject, index) => (
                  <tr key={index} className="hover:bg-gray-50">
                    <td className="border border-gray-400 p-2 font-medium">{subject.name}</td>
                    <td className="border border-gray-400 p-2 text-center">{subject.bot}</td>
                    <td className="border border-gray-400 p-2 text-center">{subject.mt}</td>
                    <td className="border border-gray-400 p-2 text-center">{subject.eot}</td>
                    <td className="border border-gray-400 p-2 text-center font-semibold">{subject.total}</td>
                    <td className="border border-gray-400 p-2 text-center">{subject.average}</td>
                    <td className="border border-gray-400 p-2 text-center">
                      <span className={`px-2 py-1 rounded text-xs font-semibold ${getGradeColor(subject.grade)}`}>
                        {subject.grade}
                      </span>
                    </td>
                    <td className="border border-gray-400 p-2 text-xs">{subject.remarks}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Summary Statistics */}
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div className="border border-gray-400">
            <div className="bg-gray-200 p-2">
              <h3 className="font-bold text-center">ACADEMIC SUMMARY</h3>
            </div>
            <div className="p-4 space-y-2">
              <div className="flex justify-between">
                <span className="font-semibold">Total Marks:</span>
                <span className="font-bold">{totalMarks}/2400</span>
              </div>
              <div className="flex justify-between">
                <span className="font-semibold">Average:</span>
                <span className="font-bold">{averageMarks}%</span>
              </div>
              <div className="flex justify-between">
                <span className="font-semibold">Class Position:</span>
                <span className="font-bold">{classPosition} out of {totalStudents}</span>
              </div>
              <div className="flex justify-between">
                <span className="font-semibold">Overall Grade:</span>
                <span className={`px-2 py-1 rounded text-xs font-semibold ${getGradeColor('C1')}`}>C1</span>
              </div>
            </div>
          </div>

          <div className="border border-gray-400">
            <div className="bg-gray-200 p-2">
              <h3 className="font-bold text-center">GRADING SCALE</h3>
            </div>
            <div className="p-4 space-y-1 text-xs">
              <div className="flex justify-between">
                <span>90-100:</span>
                <span className={`px-2 py-1 rounded ${getGradeColor('D1')}`}>D1 (Excellent)</span>
              </div>
              <div className="flex justify-between">
                <span>80-89:</span>
                <span className={`px-2 py-1 rounded ${getGradeColor('D2')}`}>D2 (Very Good)</span>
              </div>
              <div className="flex justify-between">
                <span>70-79:</span>
                <span className={`px-2 py-1 rounded ${getGradeColor('C1')}`}>C1 (Good)</span>
              </div>
              <div className="flex justify-between">
                <span>60-69:</span>
                <span className={`px-2 py-1 rounded ${getGradeColor('C2')}`}>C2 (Fair)</span>
              </div>
              <div className="flex justify-between">
                <span>50-59:</span>
                <span className={`px-2 py-1 rounded ${getGradeColor('P1')}`}>P1 (Pass)</span>
              </div>
              <div className="flex justify-between">
                <span>40-49:</span>
                <span className={`px-2 py-1 rounded ${getGradeColor('P2')}`}>P2 (Weak Pass)</span>
              </div>
            </div>
          </div>
        </div>

        {/* Teacher Comments */}
        <div className="border border-gray-400 mb-4">
          <div className="bg-gray-200 p-2">
            <h3 className="font-bold text-center">TEACHER'S COMMENTS</h3>
          </div>
          <div className="p-4">
            <div className="space-y-4">
              <div>
                <h4 className="font-semibold mb-2">Class Teacher's Comment:</h4>
                <div className="border border-gray-300 p-3 bg-gray-50 rounded">
                  <p className="text-sm">{student.name} has shown consistent improvement throughout the term. Performance in Science and Physical Education is particularly commendable. However, more focus is needed on Mathematics to achieve better results.</p>
                </div>
                <div className="grid grid-cols-2 gap-4 mt-4">
                  <div>
                    <span className="font-medium">Signature:</span>
                    <div className="border-b border-gray-400 mt-1 h-8"></div>
                  </div>
                  <div>
                    <span className="font-medium">Date:</span>
                    <div className="border-b border-gray-400 mt-1 h-8"></div>
                  </div>
                </div>
              </div>

              <div>
                <h4 className="font-semibold mb-2">Head Teacher's Comment:</h4>
                <div className="border border-gray-300 p-3 bg-gray-50 rounded">
                  <p className="text-sm">{student.name} is a well-behaved student who participates actively in school activities. Keep up the good work and continue to strive for excellence in all subjects.</p>
                </div>
                <div className="grid grid-cols-2 gap-4 mt-4">
                  <div>
                    <span className="font-medium">Signature:</span>
                    <div className="border-b border-gray-400 mt-1 h-8"></div>
                  </div>
                  <div>
                    <span className="font-medium">Date:</span>
                    <div className="border-b border-gray-400 mt-1 h-8"></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Attendance and Conduct */}
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div className="border border-gray-400">
            <div className="bg-gray-200 p-2">
              <h3 className="font-bold text-center">ATTENDANCE</h3>
            </div>
            <div className="p-4 space-y-2">
              <div className="flex justify-between">
                <span>Days Present:</span>
                <span className="font-bold">92</span>
              </div>
              <div className="flex justify-between">
                <span>Days Absent:</span>
                <span className="font-bold">3</span>
              </div>
              <div className="flex justify-between">
                <span>Times Late:</span>
                <span className="font-bold">2</span>
              </div>
              <div className="flex justify-between">
                <span>Attendance %:</span>
                <span className="font-bold">96.8%</span>
              </div>
            </div>
          </div>

          <div className="border border-gray-400">
            <div className="bg-gray-200 p-2">
              <h3 className="font-bold text-center">CONDUCT</h3>
            </div>
            <div className="p-4 space-y-2">
              <div className="flex justify-between">
                <span>Discipline:</span>
                <span className="font-bold text-green-600">Good</span>
              </div>
              <div className="flex justify-between">
                <span>Participation:</span>
                <span className="font-bold text-green-600">Very Good</span>
              </div>
              <div className="flex justify-between">
                <span>Leadership:</span>
                <span className="font-bold text-blue-600">Fair</span>
              </div>
              <div className="flex justify-between">
                <span>Cooperation:</span>
                <span className="font-bold text-green-600">Good</span>
              </div>
            </div>
          </div>
        </div>

        {/* Parent Section */}
        <div className="border border-gray-400 mb-4">
          <div className="bg-gray-200 p-2">
            <h3 className="font-bold text-center">PARENT/GUARDIAN SECTION</h3>
          </div>
          <div className="p-4">
            <div className="space-y-4">
              <div>
                <h4 className="font-semibold mb-2">Parent/Guardian Comment:</h4>
                <div className="border border-gray-300 p-3 bg-gray-50 rounded h-20">
                  <p className="text-sm text-gray-500">Please write your comments here...</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <span className="font-medium">Parent/Guardian Name:</span>
                  <div className="border-b border-gray-400 mt-1 h-8"></div>
                </div>
                <div>
                  <span className="font-medium">Signature & Date:</span>
                  <div className="border-b border-gray-400 mt-1 h-8"></div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="border border-gray-400 p-4 bg-gray-50">
          <div className="text-center text-sm">
            <p className="mb-2">
              <span className="font-semibold">Next Term Begins:</span> Monday, 6th May {year}
            </p>
            <p className="mb-2">
              <span className="font-semibold">School Fees Due:</span> Before the start of next term
            </p>
            <p className="text-xs text-gray-600">
              This report is issued by {school.schoolName} and contains confidential information about the student.
            </p>
          </div>
        </div>
      </div>
    );
  };

  // Return template based on prop
  switch (template) {
    case 'uganda-classic':
      return <UgandaClassicTemplate />;
    case 'classic':
      return <ClassicTemplate />;
    case 'compact':
      return <CompactTemplate />;
    default:
      return <ModernTemplate />;
  }
};

export default SchoolReportCard;