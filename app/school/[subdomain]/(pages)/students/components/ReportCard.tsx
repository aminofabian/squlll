import React from 'react';
import { User, MapPin, Phone, Mail, Globe, Calendar, Award, TrendingUp, Star, BookOpen } from 'lucide-react';

interface SubjectGrade {
  name: string;
  cat?: number | string;
  exam?: number | string;
  total?: number | string;
  grade?: string;
  points?: number | string;
  position?: number | string;
  remarks?: string;
  initials?: string;
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

interface ReportCardSummary {
  totalScore?: number | string;
  meanGrade?: string;
  classPosition?: string;
  streamPosition?: string;
  meanPoints?: number | string;
}

interface ReportCardComments {
  teacher?: string;
  seniorMaster?: string;
  principal?: string;
}

interface ReportCardProps {
  student: Student;
  school: School;
  subjectGrades?: SubjectGrade[];
  term?: string;
  year?: string;
  template?: 'modern' | 'classic' | 'compact' | 'uganda-classic';
  performanceData?: Array<{ term: number; score: number }>;
  summary?: ReportCardSummary;
  comments?: ReportCardComments;
  attendance?: {
    daysPresent?: number;
    daysAbsent?: number;
    timesLate?: number;
    attendancePct?: number | string;
  };
}

const getGradeColor = (grade?: string) => {
  if (!grade) return 'text-gray-700 bg-gray-100 border-gray-300';
  const g = grade.toUpperCase();
  if (g.startsWith('A')) return 'text-green-700 bg-green-100 border-green-300';
  if (g.startsWith('B')) return 'text-[#246a59] bg-[#246a59]/10 border-[#246a59]/30';
  if (g.startsWith('C')) return 'text-yellow-700 bg-yellow-100 border-yellow-300';
  return 'text-gray-700 bg-gray-100 border-gray-300';
};

const EmptyGradesRow = ({ cols = 9 }: { cols?: number }) => (
  <tr className="border-b border-gray-200">
    <td colSpan={cols} className="p-6 text-center text-sm text-gray-500 italic">
      No subject grades available for this report card.
    </td>
  </tr>
);

const SchoolReportCard: React.FC<ReportCardProps> = ({
  student,
  school,
  subjectGrades = [],
  term = '1',
  year = new Date().getFullYear().toString(),
  template = 'modern',
  performanceData = [],
  summary,
  comments = {},
  attendance,
}) => {
  const hasGrades = subjectGrades.length > 0;

  // Computed summary from subjectGrades if not provided explicitly
  const computedTotalScore = hasGrades
    ? subjectGrades.reduce((sum, s) => sum + (typeof s.total === 'number' ? s.total : parseFloat(s.total as string) || 0), 0)
    : undefined;

  const computedMeanGrade = summary?.meanGrade;
  const totalScore = summary?.totalScore ?? computedTotalScore ?? '—';
  const meanGrade = computedMeanGrade ?? '—';
  const classPosition = summary?.classPosition ?? '—';
  const streamPosition = summary?.streamPosition ?? '—';
  const meanPoints = summary?.meanPoints ?? '—';

  const renderGradeTableHeader = (templateStyle: 'modern' | 'classic' | 'compact' | 'uganda-classic') => {
    if (templateStyle === 'uganda-classic') {
      return (
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
      );
    }
    if (templateStyle === 'classic') {
      return (
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
      );
    }
    // modern
    return (
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
    );
  };

  const renderGradeRow = (subject: SubjectGrade, index: number, style: 'modern' | 'classic' | 'compact' | 'uganda-classic') => {
    if (style === 'uganda-classic') {
      return (
        <tr key={index} className="hover:bg-gray-50">
          <td className="border border-gray-400 p-2 font-medium">{subject.name}</td>
          <td className="border border-gray-400 p-2 text-center">{subject.cat ?? '—'}</td>
          <td className="border border-gray-400 p-2 text-center">{subject.exam ?? '—'}</td>
          <td className="border border-gray-400 p-2 text-center">{subject.total ?? '—'}</td>
          <td className="border border-gray-400 p-2 text-center font-semibold">{subject.total ?? '—'}</td>
          <td className="border border-gray-400 p-2 text-center">{subject.total ?? '—'}</td>
          <td className="border border-gray-400 p-2 text-center">
            <span className={`px-2 py-1 rounded text-xs font-semibold ${getGradeColor(subject.grade)}`}>
              {subject.grade ?? '—'}
            </span>
          </td>
          <td className="border border-gray-400 p-2 text-xs">{subject.remarks ?? '—'}</td>
        </tr>
      );
    }
    if (style === 'classic') {
      return (
        <tr key={index}>
          <td className="border-2 border-gray-800 p-2 font-bold">{subject.name}</td>
          <td className="border-2 border-gray-800 p-2 text-center">{subject.cat ?? '—'}</td>
          <td className="border-2 border-gray-800 p-2 text-center">{subject.exam ?? '—'}</td>
          <td className="border-2 border-gray-800 p-2 text-center font-bold">{subject.total ?? '—'}</td>
          <td className="border-2 border-gray-800 p-2 text-center">
            <span className={`px-2 py-1 font-bold ${getGradeColor(subject.grade)}`}>
              {subject.grade ?? '—'}
            </span>
          </td>
          <td className="border-2 border-gray-800 p-2 text-center">{subject.points ?? '—'}</td>
          <td className="border-2 border-gray-800 p-2 text-center">{subject.position ?? '—'}</td>
          <td className="border-2 border-gray-800 p-2 text-xs">{subject.remarks ?? '—'}</td>
        </tr>
      );
    }
    // modern
    return (
      <tr key={index} className={`border-b border-gray-200 ${index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}`}>
        <td className="p-3 font-medium text-gray-800">{subject.name}</td>
        <td className="p-3 text-center text-gray-700">{subject.cat ?? '—'}</td>
        <td className="p-3 text-center text-gray-700">{subject.exam ?? '—'}</td>
        <td className="p-3 text-center font-medium text-gray-800">{subject.total ?? '—'}</td>
        <td className="p-3 text-center">
          <span className={`px-3 py-1 rounded-full text-xs font-bold border ${getGradeColor(subject.grade)}`}>
            {subject.grade ?? '—'}
          </span>
        </td>
        <td className="p-3 text-center font-medium text-gray-800">{subject.points ?? '—'}</td>
        <td className="p-3 text-center text-gray-700">{subject.position ?? '—'}</td>
        <td className="p-3 text-center text-xs text-gray-600 max-w-32">{subject.remarks ?? '—'}</td>
        <td className="p-3 text-center font-medium text-gray-700">{subject.initials ?? '—'}</td>
      </tr>
    );
  };

  // Modern Template
  const ModernTemplate = () => (
    <div className="max-w-5xl mx-auto bg-white shadow-lg border border-gray-200">
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
                <span>{school.subdomain ? `${school.subdomain}.org` : 'School Address'}</span>
              </div>
              <div className="flex items-center gap-2">
                <Mail className="w-4 h-4" />
                <span>admin@{school.subdomain || 'school'}.org</span>
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

      <div className="bg-gray-50 border-b border-gray-200 p-4">
        <div className="text-center">
          <h2 className="text-xl font-bold text-gray-800 mb-1">ACADEMIC REPORT CARD</h2>
          <p className="text-gray-600 font-medium">Term {term} • Academic Year {year}</p>
        </div>
      </div>

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
                {student.stream || 'Not Assigned'}
              </div>
            </div>
          </div>
        </div>

        <div className="mb-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
            <Award className="w-5 h-5" />
            Academic Performance
          </h3>
          <div className="overflow-x-auto border border-gray-300 rounded-lg">
            <table className="w-full">
              <thead>{renderGradeTableHeader('modern')}</thead>
              <tbody>
                {hasGrades ? (
                  subjectGrades.map((s, i) => renderGradeRow(s, i, 'modern'))
                ) : (
                  <EmptyGradesRow cols={9} />
                )}
              </tbody>
            </table>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          <div className="bg-gradient-to-br from-green-50 to-green-100 border border-green-200 rounded-lg p-4">
            <h3 className="text-lg font-semibold text-green-800 mb-4 flex items-center gap-2">
              <Award className="w-5 h-5" />
              Performance Summary
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-white rounded-lg p-3 border border-green-200">
                <div className="text-sm text-green-600 font-medium">Total Score</div>
                <div className="text-2xl font-bold text-green-800">{totalScore}</div>
              </div>
              <div className="bg-white rounded-lg p-3 border border-green-200">
                <div className="text-sm text-green-600 font-medium">Mean Grade</div>
                <div className="text-2xl font-bold text-green-800">{meanGrade}</div>
              </div>
              <div className="bg-white rounded-lg p-3 border border-green-200">
                <div className="text-sm text-green-600 font-medium">Class Position</div>
                <div className="text-2xl font-bold text-green-800">{classPosition}</div>
              </div>
              <div className="bg-white rounded-lg p-3 border border-green-200">
                <div className="text-sm text-green-600 font-medium">Stream Position</div>
                <div className="text-2xl font-bold text-green-800">{streamPosition}</div>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-[#246a59]/5 to-[#246a59]/10 border border-[#246a59]/20 rounded-lg p-4">
            <h3 className="text-lg font-semibold text-[#246a59] mb-4 flex items-center gap-2">
              <TrendingUp className="w-5 h-5" />
              Performance Trend
            </h3>
            {performanceData.length > 0 ? (
              <div className="h-40 flex items-end justify-between gap-2">
                {performanceData.map((point, index) => (
                  <div key={index} className="flex flex-col items-center flex-1">
                    <div className="text-xs text-[#246a59] mb-1">{point.score}%</div>
                    <div className="w-full bg-[#246a59] rounded-t min-h-[20px]" style={{ height: `${Math.min(point.score, 100)}%` }}></div>
                    <span className="text-xs text-[#246a59] mt-1 font-medium">T{point.term}</span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="h-40 flex items-center justify-center text-sm text-gray-500 italic">
                No performance trend data available.
              </div>
            )}
          </div>
        </div>

        <div className="space-y-4 mb-6">
          {comments.teacher && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <h3 className="font-semibold text-yellow-800 mb-3 flex items-center gap-2">
                <User className="w-4 h-4" />
                Class Teacher&apos;s Remarks
              </h3>
              <p className="text-sm text-gray-700 mb-4 italic">&ldquo;{comments.teacher}&rdquo;</p>
              <div className="grid grid-cols-2 gap-4">
                <div><span className="text-sm font-medium text-yellow-700">Signature:</span><div className="border-b-2 border-yellow-300 h-8 mt-1"></div></div>
                <div><span className="text-sm font-medium text-yellow-700">Date:</span><div className="border-b-2 border-yellow-300 h-8 mt-1"></div></div>
              </div>
            </div>
          )}
          {comments.seniorMaster && (
            <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
              <h3 className="font-semibold text-orange-800 mb-3">Senior Master&apos;s Comments</h3>
              <p className="text-sm text-gray-700 mb-4 italic">&ldquo;{comments.seniorMaster}&rdquo;</p>
              <div className="grid grid-cols-2 gap-4">
                <div><span className="text-sm font-medium text-orange-700">Signature:</span><div className="border-b-2 border-orange-300 h-8 mt-1"></div></div>
                <div><span className="text-sm font-medium text-orange-700">Date:</span><div className="border-b-2 border-orange-300 h-8 mt-1"></div></div>
              </div>
            </div>
          )}
          {comments.principal && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <h3 className="font-semibold text-red-800 mb-3">Principal&apos;s Remarks</h3>
              <p className="text-sm text-gray-700 mb-4 italic">&ldquo;{comments.principal}&rdquo;</p>
              <div className="grid grid-cols-2 gap-4">
                <div><span className="text-sm font-medium text-red-700">Signature:</span><div className="border-b-2 border-red-300 h-8 mt-1"></div></div>
                <div><span className="text-sm font-medium text-red-700">Date:</span><div className="border-b-2 border-red-300 h-8 mt-1"></div></div>
              </div>
            </div>
          )}
          {!comments.teacher && !comments.seniorMaster && !comments.principal && (
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 text-sm text-gray-500 italic text-center">
              No comments available.
            </div>
          )}
        </div>

        <div className="bg-gray-50 border-t border-gray-200 p-4 rounded-b-lg">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <span className="font-medium text-gray-700">Report Acknowledged by Parent/Guardian:</span>
              <div className="grid grid-cols-2 gap-4 mt-2">
                <div><span className="text-gray-600">Signature:</span><div className="border-b border-gray-300 h-6 mt-1"></div></div>
                <div><span className="text-gray-600">Date:</span><div className="border-b border-gray-300 h-6 mt-1"></div></div>
              </div>
            </div>
            <div className="text-right">
              <div className="flex items-center justify-end gap-2 text-gray-600">
                <Calendar className="w-4 h-4" />
                <span>Next Term: To be announced</span>
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
          <p>{school.subdomain ? `${school.subdomain}.org` : 'School Address'}</p>
        </div>
      </div>

      <div className="p-6 border-b-2 border-gray-800">
        <div className="grid grid-cols-2 gap-8">
          <div>
            <h2 className="text-xl font-bold mb-4 border-b-2 border-gray-800 pb-2">STUDENT INFORMATION</h2>
            <div className="space-y-3">
              <div className="flex"><span className="font-bold w-32">Name:</span><span className="border-b border-gray-400 flex-1 px-2">{student.name.toUpperCase()}</span></div>
              <div className="flex"><span className="font-bold w-32">Admission No:</span><span className="border-b border-gray-400 flex-1 px-2">{student.admissionNumber}</span></div>
              <div className="flex"><span className="font-bold w-32">Class:</span><span className="border-b border-gray-400 flex-1 px-2">{student.grade}</span></div>
              <div className="flex"><span className="font-bold w-32">Stream:</span><span className="border-b border-gray-400 flex-1 px-2">{student.stream || 'Not Assigned'}</span></div>
            </div>
          </div>
          <div>
            <h2 className="text-xl font-bold mb-4 border-b-2 border-gray-800 pb-2">ACADEMIC PERIOD</h2>
            <div className="space-y-3">
              <div className="flex"><span className="font-bold w-32">Term:</span><span className="border-b border-gray-400 flex-1 px-2">{term}</span></div>
              <div className="flex"><span className="font-bold w-32">Year:</span><span className="border-b border-gray-400 flex-1 px-2">{year}</span></div>
            </div>
          </div>
        </div>
      </div>

      <div className="p-6">
        <h2 className="text-xl font-bold mb-4 border-b-2 border-gray-800 pb-2">ACADEMIC PERFORMANCE</h2>
        <div className="overflow-x-auto">
          <table className="w-full border-collapse border-2 border-gray-800">
            <thead>{renderGradeTableHeader('classic')}</thead>
            <tbody>
              {hasGrades ? (
                subjectGrades.map((s, i) => renderGradeRow(s, i, 'classic'))
              ) : (
                <EmptyGradesRow cols={8} />
              )}
            </tbody>
          </table>
        </div>
      </div>

      <div className="p-6 border-t-2 border-gray-800">
        <div className="grid grid-cols-2 gap-8">
          <div>
            <h3 className="text-lg font-bold mb-3 border-b border-gray-800 pb-1">PERFORMANCE SUMMARY</h3>
            <div className="space-y-2">
              <div className="flex justify-between"><span>Total Score:</span><span className="font-bold">{totalScore}</span></div>
              <div className="flex justify-between"><span>Mean Grade:</span><span className="font-bold">{meanGrade}</span></div>
              <div className="flex justify-between"><span>Class Position:</span><span className="font-bold">{classPosition}</span></div>
              <div className="flex justify-between"><span>Stream Position:</span><span className="font-bold">{streamPosition}</span></div>
            </div>
          </div>
          <div>
            <h3 className="text-lg font-bold mb-3 border-b border-gray-800 pb-1">COMMENTS</h3>
            <div className="space-y-4">
              {comments.teacher && (
                <div><p className="text-sm font-bold">Class Teacher:</p><p className="text-sm italic">&ldquo;{comments.teacher}&rdquo;</p></div>
              )}
              {comments.principal && (
                <div><p className="text-sm font-bold">Principal:</p><p className="text-sm italic">&ldquo;{comments.principal}&rdquo;</p></div>
              )}
              {!comments.teacher && !comments.principal && (
                <p className="text-sm text-gray-500 italic">No comments available.</p>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="bg-gray-100 p-4 border-t-2 border-gray-800">
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div><p className="font-bold">Parent/Guardian Signature:</p><div className="border-b-2 border-gray-800 h-8 mt-1"></div></div>
          <div><p className="font-bold">Date:</p><div className="border-b-2 border-gray-800 h-8 mt-1"></div></div>
        </div>
      </div>
    </div>
  );

  // Compact Template
  const CompactTemplate = () => (
    <div className="max-w-3xl mx-auto bg-white shadow-md border border-gray-300">
      <div className="bg-[#246a59] text-white p-4">
        <div className="text-center">
          <h1 className="text-xl font-bold">{school.schoolName.toUpperCase()}</h1>
          <p className="text-sm opacity-90">Academic Report Card - Term {term}, {year}</p>
        </div>
      </div>

      <div className="p-4 bg-gray-50 border-b border-gray-200">
        <div className="grid grid-cols-3 gap-4 text-sm">
          <div><span className="font-semibold text-[#246a59]">Name:</span><p className="font-medium">{student.name}</p></div>
          <div><span className="font-semibold text-[#246a59]">Admission No:</span><p className="font-medium">{student.admissionNumber}</p></div>
          <div><span className="font-semibold text-[#246a59]">Class:</span><p className="font-medium">{student.grade}</p></div>
        </div>
      </div>

      <div className="p-4">
        <h3 className="font-bold text-[#246a59] mb-3 flex items-center gap-2">
          <BookOpen className="w-4 h-4" />
          Subject Grades
        </h3>
        {hasGrades ? (
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {subjectGrades.map((subject, index) => (
              <div key={index} className="border border-gray-200 rounded p-3">
                <div className="font-semibold text-sm text-gray-800">{subject.name}</div>
                <div className="flex items-center justify-between mt-2">
                  <span className="text-lg font-bold">{subject.total ?? '—'}</span>
                  <span className={`px-2 py-1 rounded text-xs font-bold ${getGradeColor(subject.grade)}`}>
                    {subject.grade ?? '—'}
                  </span>
                </div>
                <div className="text-xs text-gray-600 mt-1">{subject.remarks ?? '—'}</div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-sm text-gray-500 italic text-center py-8">No subject grades available.</div>
        )}
      </div>

      <div className="p-4 bg-gray-50 border-t border-gray-200">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
          <div><div className="text-2xl font-bold text-[#246a59]">{totalScore}</div><div className="text-xs text-gray-600">Total Score</div></div>
          <div><div className="text-2xl font-bold text-[#246a59]">{meanGrade}</div><div className="text-xs text-gray-600">Mean Grade</div></div>
          <div><div className="text-2xl font-bold text-[#246a59]">{classPosition}</div><div className="text-xs text-gray-600">Class Position</div></div>
          <div><div className="text-2xl font-bold text-[#246a59]">{streamPosition}</div><div className="text-xs text-gray-600">Stream Position</div></div>
        </div>
      </div>

      <div className="p-4">
        <h3 className="font-bold text-[#246a59] mb-3 flex items-center gap-2">
          <Star className="w-4 h-4" />
          Comments
        </h3>
        <div className="space-y-2 text-sm">
          {comments.teacher && (
            <div className="bg-yellow-50 p-3 rounded border-l-4 border-yellow-400">
              <p className="font-semibold text-yellow-800">Class Teacher:</p>
              <p className="text-gray-700 italic">&ldquo;{comments.teacher}&rdquo;</p>
            </div>
          )}
          {comments.principal && (
            <div className="bg-green-50 p-3 rounded border-l-4 border-green-400">
              <p className="font-semibold text-green-800">Principal:</p>
              <p className="text-gray-700 italic">&ldquo;{comments.principal}&rdquo;</p>
            </div>
          )}
          {!comments.teacher && !comments.principal && (
            <p className="text-gray-500 italic">No comments available.</p>
          )}
        </div>
      </div>

      <div className="p-4 bg-gray-50 border-t border-gray-200 text-center text-sm text-gray-600">
        <p>Parent/Guardian Signature: _________________ Date: _________________</p>
        <p className="mt-2">Next Term: To be announced</p>
      </div>
    </div>
  );

  // Uganda Classic Template
  const UgandaClassicTemplate = () => {
    const studentData = {
      name: student.name,
      classStream: student.grade + (student.stream ? ` ${student.stream}` : ''),
      term,
      year,
      rollNumber: student.admissionNumber,
    };

    const totalMarks = hasGrades
      ? subjectGrades.reduce((sum, s) => sum + (parseFloat(s.total as string) || 0), 0)
      : 0;
    const averageMarks = hasGrades ? (totalMarks / subjectGrades.length).toFixed(1) : '0.0';

    return (
      <div className="max-w-4xl mx-auto p-6 bg-white">
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

        <div className="border border-gray-400 mb-4">
          <div className="bg-gray-200 p-2"><h2 className="font-bold text-center">STUDENT DETAILS</h2></div>
          <div className="p-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <div className="flex"><span className="font-semibold w-32">NAME:</span><span className="border-b border-gray-400 flex-1 pb-1">{studentData.name}</span></div>
                <div className="flex"><span className="font-semibold w-32">CLASS/STREAM:</span><span className="border-b border-gray-400 flex-1 pb-1">{studentData.classStream}</span></div>
                <div className="flex"><span className="font-semibold w-32">TERM:</span><span className="border-b border-gray-400 flex-1 pb-1">{studentData.term}</span></div>
              </div>
              <div className="space-y-2">
                <div className="flex"><span className="font-semibold w-32">YEAR:</span><span className="border-b border-gray-400 flex-1 pb-1">{studentData.year}</span></div>
                <div className="flex"><span className="font-semibold w-32">ROLL NUMBER:</span><span className="border-b border-gray-400 flex-1 pb-1">{studentData.rollNumber}</span></div>
              </div>
            </div>
          </div>
        </div>

        <div className="border border-gray-400 mb-4">
          <div className="bg-gray-200 p-2"><h2 className="font-bold text-center">ACADEMIC PERFORMANCE</h2></div>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>{renderGradeTableHeader('uganda-classic')}</thead>
              <tbody>
                {hasGrades ? (
                  subjectGrades.map((s, i) => renderGradeRow(s, i, 'uganda-classic'))
                ) : (
                  <EmptyGradesRow cols={8} />
                )}
              </tbody>
            </table>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 mb-4">
          <div className="border border-gray-400">
            <div className="bg-gray-200 p-2"><h3 className="font-bold text-center">ACADEMIC SUMMARY</h3></div>
            <div className="p-4 space-y-2">
              <div className="flex justify-between"><span className="font-semibold">Total Marks:</span><span className="font-bold">{totalMarks}</span></div>
              <div className="flex justify-between"><span className="font-semibold">Average:</span><span className="font-bold">{averageMarks}%</span></div>
              <div className="flex justify-between"><span className="font-semibold">Class Position:</span><span className="font-bold">{classPosition}</span></div>
              <div className="flex justify-between"><span className="font-semibold">Overall Grade:</span><span className={`px-2 py-1 rounded text-xs font-semibold ${getGradeColor(meanGrade as string)}`}>{meanGrade}</span></div>
            </div>
          </div>
          <div className="border border-gray-400">
            <div className="bg-gray-200 p-2"><h3 className="font-bold text-center">GRADING SCALE</h3></div>
            <div className="p-4 space-y-1 text-xs">
              <div className="flex justify-between"><span>90-100:</span><span className="px-2 py-1 rounded bg-green-100 text-green-800">D1 (Excellent)</span></div>
              <div className="flex justify-between"><span>80-89:</span><span className="px-2 py-1 rounded bg-green-50 text-green-700">D2 (Very Good)</span></div>
              <div className="flex justify-between"><span>70-79:</span><span className="px-2 py-1 rounded bg-blue-100 text-blue-800">C1 (Good)</span></div>
              <div className="flex justify-between"><span>60-69:</span><span className="px-2 py-1 rounded bg-blue-50 text-blue-700">C2 (Fair)</span></div>
              <div className="flex justify-between"><span>50-59:</span><span className="px-2 py-1 rounded bg-yellow-100 text-yellow-800">P1 (Pass)</span></div>
              <div className="flex justify-between"><span>40-49:</span><span className="px-2 py-1 rounded bg-yellow-50 text-yellow-700">P2 (Weak Pass)</span></div>
            </div>
          </div>
        </div>

        <div className="border border-gray-400 mb-4">
          <div className="bg-gray-200 p-2"><h3 className="font-bold text-center">TEACHER&apos;S COMMENTS</h3></div>
          <div className="p-4">
            <div className="space-y-4">
              {comments.teacher ? (
                <div>
                  <h4 className="font-semibold mb-2">Class Teacher&apos;s Comment:</h4>
                  <div className="border border-gray-300 p-3 bg-gray-50 rounded"><p className="text-sm">{comments.teacher}</p></div>
                  <div className="grid grid-cols-2 gap-4 mt-4">
                    <div><span className="font-medium">Signature:</span><div className="border-b border-gray-400 mt-1 h-8"></div></div>
                    <div><span className="font-medium">Date:</span><div className="border-b border-gray-400 mt-1 h-8"></div></div>
                  </div>
                </div>
              ) : (
                <p className="text-sm text-gray-500 italic">No teacher comment available.</p>
              )}
              {comments.principal ? (
                <div>
                  <h4 className="font-semibold mb-2">Head Teacher&apos;s Comment:</h4>
                  <div className="border border-gray-300 p-3 bg-gray-50 rounded"><p className="text-sm">{comments.principal}</p></div>
                  <div className="grid grid-cols-2 gap-4 mt-4">
                    <div><span className="font-medium">Signature:</span><div className="border-b border-gray-400 mt-1 h-8"></div></div>
                    <div><span className="font-medium">Date:</span><div className="border-b border-gray-400 mt-1 h-8"></div></div>
                  </div>
                </div>
              ) : null}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 mb-4">
          <div className="border border-gray-400">
            <div className="bg-gray-200 p-2"><h3 className="font-bold text-center">ATTENDANCE</h3></div>
            <div className="p-4 space-y-2">
              <div className="flex justify-between"><span>Days Present:</span><span className="font-bold">{attendance?.daysPresent ?? '—'}</span></div>
              <div className="flex justify-between"><span>Days Absent:</span><span className="font-bold">{attendance?.daysAbsent ?? '—'}</span></div>
              <div className="flex justify-between"><span>Times Late:</span><span className="font-bold">{attendance?.timesLate ?? '—'}</span></div>
              <div className="flex justify-between"><span>Attendance %:</span><span className="font-bold">{attendance?.attendancePct ?? '—'}</span></div>
            </div>
          </div>
          <div className="border border-gray-400">
            <div className="bg-gray-200 p-2"><h3 className="font-bold text-center">CONDUCT</h3></div>
            <div className="p-4 space-y-2">
              <div className="flex justify-between"><span>Discipline:</span><span className="font-bold text-green-600">Good</span></div>
              <div className="flex justify-between"><span>Participation:</span><span className="font-bold text-green-600">Very Good</span></div>
              <div className="flex justify-between"><span>Leadership:</span><span className="font-bold text-blue-600">Fair</span></div>
              <div className="flex justify-between"><span>Cooperation:</span><span className="font-bold text-green-600">Good</span></div>
            </div>
          </div>
        </div>

        <div className="border border-gray-400 mb-4">
          <div className="bg-gray-200 p-2"><h3 className="font-bold text-center">PARENT/GUARDIAN SECTION</h3></div>
          <div className="p-4">
            <div className="space-y-4">
              <div>
                <h4 className="font-semibold mb-2">Parent/Guardian Comment:</h4>
                <div className="border border-gray-300 p-3 bg-gray-50 rounded h-20">
                  <p className="text-sm text-gray-500">Please write your comments here...</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div><span className="font-medium">Parent/Guardian Name:</span><div className="border-b border-gray-400 mt-1 h-8"></div></div>
                <div><span className="font-medium">Signature & Date:</span><div className="border-b border-gray-400 mt-1 h-8"></div></div>
              </div>
            </div>
          </div>
        </div>

        <div className="border border-gray-400 p-4 bg-gray-50">
          <div className="text-center text-sm">
            <p className="mb-2"><span className="font-semibold">Next Term Begins:</span> To be announced</p>
            <p className="text-xs text-gray-600">This report is issued by {school.schoolName} and contains confidential information about the student.</p>
          </div>
        </div>
      </div>
    );
  };

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
