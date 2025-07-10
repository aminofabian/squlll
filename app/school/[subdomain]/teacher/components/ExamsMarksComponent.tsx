"use client";

import React, { useState } from "react";
import { Calendar, FileText, PlusCircle, CheckCircle2, Clock, ArrowRight, XCircle, Save } from "lucide-react";

const exams = [
  { id: 1, subject: "Mathematics", class: "Grade 2A", date: "2024-06-10", status: "upcoming", students: 22 },
  { id: 2, subject: "Social Studies", class: "Grade 2B", date: "2024-06-12", status: "completed", students: 20 },
  { id: 3, subject: "Computer Science", class: "Grade 2A", date: "2024-06-15", status: "pending", students: 18 },
  { id: 4, subject: "Environmental Science", class: "Grade 2C", date: "2024-06-18", status: "upcoming", students: 21 },
];

// Mock students for mark entry
const mockStudents = [
  { id: 1, name: "Peter Smith" },
  { id: 2, name: "Elisa Grandbell" },
  { id: 3, name: "Mary Jane" },
  { id: 4, name: "Eddy Brock" },
  { id: 5, name: "John Doe" },
  { id: 6, name: "Jane Roe" },
  { id: 7, name: "Sam Lee" },
  { id: 8, name: "Alex Kim" },
  { id: 9, name: "Chris Paul" },
  { id: 10, name: "Nina Patel" },
  { id: 11, name: "Olivia Brown" },
  { id: 12, name: "Liam Johnson" },
  { id: 13, name: "Emma Wilson" },
  { id: 14, name: "Noah Davis" },
  { id: 15, name: "Ava Martinez" },
  { id: 16, name: "Sophia Garcia" },
  { id: 17, name: "Mason Lee" },
  { id: 18, name: "Isabella Clark" },
  { id: 19, name: "Lucas Lewis" },
  { id: 20, name: "Mia Walker" },
  { id: 21, name: "Benjamin Hall" },
  { id: 22, name: "Charlotte Allen" },
  { id: 23, name: "Henry Young" },
  { id: 24, name: "Amelia King" },
  { id: 25, name: "Jack Wright" },
  { id: 26, name: "Harper Scott" },
  { id: 27, name: "Evelyn Green" },
  { id: 28, name: "Ella Adams" },
  { id: 29, name: "Logan Baker" },
  { id: 30, name: "Grace Nelson" },
];

interface ExamsMarksComponentProps {
  subdomain: string;
}

export default function ExamsMarksComponent({ subdomain }: ExamsMarksComponentProps) {
  const [selectedExam, setSelectedExam] = useState<number | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [marks, setMarks] = useState<{ [studentId: number]: string | Record<string, string> }>({});
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [visibleCount, setVisibleCount] = useState(10);
  const [marksheetExam, setMarksheetExam] = useState<number | null>(null);
  const [showMarksheet, setShowMarksheet] = useState(false);
  const [enableCA, setEnableCA] = useState(false);
  const [numCAs, setNumCAs] = useState(1);
  const [caCutoffs, setCaCutoffs] = useState([30]);
  const [examCutoff, setExamCutoff] = useState(70);
  const [finalCutoff, setFinalCutoff] = useState(100);
  const [showColumns, setShowColumns] = useState<'all' | 'exam' | 'ca'>('all');
  const [convertTo100, setConvertTo100] = useState(false);

  // Open drawer and reset marks when exam is selected
  const handleEnterMarks = (examId: number) => {
    setSelectedExam(examId);
    setDrawerOpen(true);
    setMarks({});
    setError(null);
  };

  // Handle mark input with validation and auto-save
  const handleMarkChange = (studentId: number, value: string, type: string = 'exam') => {
    if (!/^\d{0,3}$/.test(value)) return;
    const num = Number(value);
    let max = 100;
    if (enableCA) {
      if (type.startsWith('ca')) {
        const caIdx = parseInt(type.replace('ca', '')) - 1;
        max = caCutoffs[caIdx] || 0;
      } else if (type === 'exam') {
        max = examCutoff;
      }
    }
    if (value !== "" && (num < 0 || num > max)) {
      setError(`Marks must be between 0 and ${max}`);
      return;
    }
    setError(null);
    setMarks((prev) => {
      if (enableCA) {
        const prevVal = typeof prev[studentId] === 'object' && prev[studentId] !== null ? prev[studentId] as Record<string, string> : {};
        return {
          ...prev,
          [studentId]: {
            ...prevVal,
            [type]: value,
          },
        };
      } else {
        return { ...prev, [studentId]: value };
      }
    });
    setSaving(true);
    setTimeout(() => setSaving(false), 600); // Simulate auto-save
  };

  // Correct final calculation
  const getFinalMark = (studentId: number) => {
    if (!enableCA) {
      // Only show exam mark, rounded
      const val = typeof marks[studentId] === 'object' ? '' : marks[studentId] ?? '';
      return val !== '' ? Math.round(Number(val)) : '';
    }
    const entry = marks[studentId] as Record<string, string> | undefined;
    if (!entry) return '';
    const caSum = Array.from({length: numCAs}, (_, i) => Number(entry[`ca${i+1}`] || 0)).reduce((a, b) => a + b, 0);
    const caTotal = caCutoffs.slice(0, numCAs).reduce((a, b) => a + b, 0);
    const exam = Number(entry.exam || 0);
    const total = caSum + exam;
    const totalCutoff = caTotal + examCutoff;
    if (convertTo100 && totalCutoff > 0) {
      return Math.round(Math.min(((total / totalCutoff) * 100), 100));
    }
    return Math.round(total);
  };

  // Filtered and paginated students
  const filteredStudents = mockStudents.filter(s =>
    s.name.toLowerCase().includes(search.toLowerCase())
  );
  const visibleStudents = filteredStudents.slice(0, visibleCount);
  const canShowMore = visibleCount < filteredStudents.length;

  // Stats calculation for visible students
  const enteredMarks = visibleStudents
    .map(s => {
      if (!enableCA) return Number(marks[s.id]);
      const entry = marks[s.id] as Record<string, string> | undefined;
      if (!entry) return NaN;
      const caSum = Array.from({length: numCAs}, (_, i) => Number(entry[`ca${i+1}`] || 0)).reduce((a, b) => a + b, 0);
      const caTotal = caCutoffs.slice(0, numCAs).reduce((a, b) => a + b, 0);
      const exam = Number(entry.exam || 0);
      const total = caSum + exam;
      return total;
    })
    .filter(m => !isNaN(m));
  const mean = enteredMarks.length ? (enteredMarks.reduce((a, b) => a + b, 0) / enteredMarks.length).toFixed(2) : "-";
  const max = enteredMarks.length ? Math.max(...enteredMarks) : "-";
  const min = enteredMarks.length ? Math.min(...enteredMarks) : "-";
  const count = enteredMarks.length;

  // Download marksheet as CSV
  const handleDownloadCSV = (examId: number) => {
    const exam = exams.find(e => e.id === examId);
    if (!exam) return;
    const students = mockStudents;
    let csv = `Student Name,Marks\n`;
    students.forEach(s => {
      csv += `${s.name},${marks[s.id] ?? ""}\n`;
    });
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${exam.subject}-${exam.class}-marksheet.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  // Print marksheet
  const handlePrint = () => {
    window.print();
  };

  // Drawer content
  const drawer = (
    <div className="fixed inset-0 z-50 flex">
      {/* Overlay */}
      <div
        className="fixed inset-0 bg-black/30 transition-opacity"
        onClick={() => setDrawerOpen(false)}
        aria-label="Close marksheet drawer"
      />
      {/* Drawer panel */}
      <div className="relative w-full md:w-3/4 max-w-4xl h-full flex flex-col shadow-lg border-r-2 border-primary/20 bg-gradient-to-br from-card via-white to-primary/10 rounded-r-2xl animate-slideInLeft">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-primary/20 bg-primary/5 rounded-tr-2xl">
          <div>
            <div className="text-xl font-extrabold text-primary tracking-tight flex items-center gap-2">
              Marksheet Entry
              <span className="inline-block w-2 h-2 rounded-full bg-primary animate-pulse"></span>
            </div>
            {selectedExam && (
              <div className="text-sm text-muted-foreground mt-1 font-medium">
                {exams.find(e => e.id === selectedExam)?.subject} - {exams.find(e => e.id === selectedExam)?.class}
              </div>
            )}
          </div>
          <button
            className="text-primary hover:text-primary-dark transition"
            onClick={() => setDrawerOpen(false)}
            aria-label="Close"
          >
            <XCircle className="w-7 h-7" />
          </button>
        </div>
        {/* CA/Exam Toggle and Cutoffs */}
        <div className="flex flex-col md:flex-row md:items-center gap-4 p-6 pb-0 bg-white/80 rounded-t-2xl border-b border-primary/10 shadow-sm">
          <div className="flex items-center gap-3">
            <label className="flex items-center gap-2 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={enableCA}
                onChange={e => setEnableCA(e.target.checked)}
                className="accent-primary w-5 h-5"
              />
              <span className="text-sm font-medium text-primary">Enable CA & Exam Entry</span>
            </label>
            <span className="text-xs text-muted-foreground">(If unchecked, only total marks entry is used)</span>
          </div>
          {enableCA && (
            <div className="flex items-center gap-3 flex-wrap">
              {[...Array(numCAs)].map((_, i) => (
                <label key={i} className="text-xs font-medium text-primary">
                  CA{i+1} Cutoff:
                  <input
                    type="number"
                    min={0}
                    max={100}
                    value={caCutoffs[i] || 0}
                    onChange={e => {
                      const newCutoffs = [...caCutoffs];
                      newCutoffs[i] = Number(e.target.value);
                      setCaCutoffs(newCutoffs);
                    }}
                    className="ml-1 w-16 px-2 py-1 rounded border border-primary/30 focus:ring-2 focus:ring-primary outline-none bg-white text-foreground text-xs"
                  />
                </label>
              ))}
              <button
                type="button"
                className="px-2 py-1 rounded bg-primary/10 text-primary border border-primary/20 text-xs"
                onClick={() => {
                  setNumCAs(n => n + 1);
                  setCaCutoffs(cuts => [...cuts, 30]);
                }}
              >+ CA</button>
              {numCAs > 1 && (
                <button
                  type="button"
                  className="px-2 py-1 rounded bg-red-100 text-red-700 border border-red-200 text-xs"
                  onClick={() => {
                    setNumCAs(n => Math.max(1, n - 1));
                    setCaCutoffs(cuts => cuts.slice(0, -1));
                  }}
                >- CA</button>
              )}
              <label className="text-xs font-medium text-primary">Exam Cutoff:
                <input
                  type="number"
                  min={0}
                  max={100}
                  value={examCutoff}
                  onChange={e => setExamCutoff(Number(e.target.value))}
                  className="ml-1 w-16 px-2 py-1 rounded border border-primary/30 focus:ring-2 focus:ring-primary outline-none bg-white text-foreground text-xs"
                />
              </label>
              <label className="text-xs font-medium text-primary">Final Cutoff:
                <input
                  type="number"
                  min={0}
                  max={200}
                  value={finalCutoff}
                  onChange={e => setFinalCutoff(Number(e.target.value))}
                  className="ml-1 w-16 px-2 py-1 rounded border border-primary/30 focus:ring-2 focus:ring-primary outline-none bg-white text-foreground text-xs"
                />
              </label>
              <label className="text-xs font-medium text-primary">Show:
                <select
                  value={showColumns}
                  onChange={e => setShowColumns(e.target.value as any)}
                  className="ml-1 px-2 py-1 rounded border border-primary/30 bg-white text-foreground text-xs"
                >
                  <option value="all">All</option>
                  <option value="exam">Only Exam</option>
                  <option value="ca">Only CA</option>
                </select>
              </label>
              <label className="text-xs font-medium text-primary flex items-center gap-1">
                <input
                  type="checkbox"
                  checked={convertTo100}
                  onChange={e => setConvertTo100(e.target.checked)}
                  className="accent-primary w-4 h-4"
                />
                Convert Final to 100
              </label>
            </div>
          )}
        </div>
        {/* Search and Marksheet Table */}
        <div className="flex-1 overflow-auto p-6 bg-card rounded-br-2xl">
          {/* Stats summary */}
          <div className="mb-6 grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-primary/10 border border-primary/20 rounded-2xl p-4 flex flex-col items-center shadow-lg">
              <div className="text-xs text-muted-foreground font-semibold">Mean Score</div>
              <div className="text-2xl font-bold text-primary mt-1">{mean}</div>
            </div>
            <div className="bg-green-100 border border-green-200 rounded-2xl p-4 flex flex-col items-center shadow-lg">
              <div className="text-xs text-green-700 font-semibold">Highest</div>
              <div className="text-2xl font-bold text-green-700 mt-1">{max}</div>
            </div>
            <div className="bg-red-100 border border-red-200 rounded-2xl p-4 flex flex-col items-center shadow-lg">
              <div className="text-xs text-red-700 font-semibold">Lowest</div>
              <div className="text-2xl font-bold text-red-700 mt-1">{min}</div>
            </div>
            <div className="bg-primary/10 border border-primary/20 rounded-2xl p-4 flex flex-col items-center shadow-lg">
              <div className="text-xs text-muted-foreground font-semibold">Entered</div>
              <div className="text-2xl font-bold text-primary mt-1">{count} / {visibleStudents.length}</div>
            </div>
          </div>
          <div className="mb-4 flex items-center gap-2">
            <input
              type="text"
              className="w-full md:w-1/2 px-3 py-2 rounded-lg border border-primary/30 focus:ring-2 focus:ring-primary outline-none bg-white text-foreground font-medium transition shadow"
              placeholder="Search student by name..."
              value={search}
              onChange={e => {
                setSearch(e.target.value);
                setVisibleCount(10); // Reset pagination on new search
              }}
            />
          </div>
          <table className="min-w-full text-sm border-separate border-spacing-y-2">
            <thead>
              <tr className="text-muted-foreground">
                <th className="text-left font-semibold px-2">#</th>
                <th className="text-left font-semibold px-2">Student Name</th>
                {enableCA && [...Array(numCAs)].map((_, i) => (
                  (showColumns === 'all' || showColumns === 'ca') && <th key={i} className="text-left font-semibold px-2">CA{i+1}</th>
                ))}
                {(enableCA && (showColumns === 'all' || showColumns === 'exam')) || !enableCA ? <th className="text-left font-semibold px-2">Exam</th> : null}
                <th className="text-left font-semibold px-2">{enableCA ? `Final (${caCutoffs.slice(0, numCAs).reduce((a, b) => a + b, 0) + examCutoff}${convertTo100 ? ' → 100' : ''})` : 'Exam'}</th>
              </tr>
            </thead>
            <tbody>
              {visibleStudents.map((student, idx) => {
                const entry = marks[student.id] as Record<string, string> | string | undefined;
                return (
                  <tr key={student.id} className="bg-primary/5 hover:bg-primary/10 rounded-lg transition shadow-sm">
                    <td className="px-2 py-2 font-medium text-muted-foreground w-8">{idx + 1}</td>
                    <td className="px-2 py-2 font-semibold text-foreground">{student.name}</td>
                    {enableCA && [...Array(numCAs)].map((_, i) => (
                      (showColumns === 'all' || showColumns === 'ca') && (
                        <td key={i} className="px-2 py-2">
                          <input
                            type="number"
                            min={0}
                            max={caCutoffs[i] || 0}
                            className="w-16 px-2 py-1 rounded-lg border border-primary/30 focus:ring-2 focus:ring-primary outline-none bg-white text-foreground font-semibold text-center transition shadow"
                            value={typeof entry === 'object' && entry && entry[`ca${i+1}`] !== undefined ? entry[`ca${i+1}`] : ''}
                            onChange={e => handleMarkChange(student.id, e.target.value, `ca${i+1}`)}
                            placeholder={`CA${i+1}`}
                          />
                        </td>
                      )
                    ))}
                    {(enableCA && (showColumns === 'all' || showColumns === 'exam')) || !enableCA ? (
                      <td className="px-2 py-2">
                        <input
                          type="number"
                          min={0}
                          max={examCutoff}
                          className="w-16 px-2 py-1 rounded-lg border border-primary/30 focus:ring-2 focus:ring-primary outline-none bg-white text-foreground font-semibold text-center transition shadow"
                          value={enableCA ? (typeof entry === 'object' && entry ? (entry as Record<string, string>).exam || '' : '') : (typeof marks[student.id] === 'object' ? '' : (marks[student.id] as string) ?? '')}
                          onChange={e => handleMarkChange(student.id, e.target.value, 'exam')}
                          placeholder="Exam"
                        />
                      </td>
                    ) : null}
                    <td className="px-2 py-2">
                      {getFinalMark(student.id)}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          {canShowMore && (
            <div className="flex justify-center mt-4">
              <button
                className="px-6 py-2 rounded-lg bg-primary text-primary-foreground font-semibold shadow hover:bg-primary-dark transition"
                onClick={() => setVisibleCount(c => c + 10)}
              >
                Show More
              </button>
            </div>
          )}
          {error && <div className="text-red-600 mt-2 font-medium">{error}</div>}
        </div>
        {/* Auto-save feedback */}
        <div className="p-4 border-t border-primary/20 bg-primary/5 flex items-center gap-2 text-sm rounded-br-2xl">
          {saving ? (
            <>
              <Save className="w-4 h-4 animate-spin text-primary" />
              <span className="text-primary font-medium">Auto-saving...</span>
            </>
          ) : (
            <span className="text-muted-foreground">All changes saved automatically</span>
          )}
        </div>
      </div>
    </div>
  );

  // Marksheet modal content
  const marksheetModal = marksheetExam !== null && (
    <div className="fixed inset-0 z-60 flex items-center justify-center bg-black/40 print:bg-white print:relative print:inset-auto print:z-auto">
      <div className="bg-card w-full h-full max-w-none rounded-none shadow-lg p-0 relative flex flex-col print:p-0 print:shadow-none print:bg-white print:rounded-none print:max-w-full print:w-full print:h-full border-2 border-primary/20">
        <button
          className="absolute top-6 right-8 text-primary hover:text-primary-dark print:hidden z-10"
          onClick={() => setMarksheetExam(null)}
          aria-label="Close"
        >
          <svg width="32" height="32" fill="none" viewBox="0 0 24 24"><path stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" d="M18 6 6 18M6 6l12 12"/></svg>
        </button>
        {/* Header */}
        <div className="w-full flex flex-col items-center justify-center pt-12 pb-6 bg-gradient-to-b from-primary/10 to-white print:bg-white print:pt-6 print:pb-2">
          <img src="/squl-logo.svg" alt="School Logo" className="w-20 h-20 mb-2 print:w-16 print:h-16" />
          <div className="text-2xl md:text-3xl font-extrabold text-primary print:text-black tracking-wide uppercase text-center">Springfield International School</div>
          <div className="text-lg md:text-xl font-semibold text-foreground print:text-black mt-1 text-center">Official Marksheet</div>
          <div className="flex flex-col md:flex-row md:justify-center gap-2 mt-2 text-base text-muted-foreground print:text-black text-center">
            <span>Exam: <span className="font-semibold text-foreground print:text-black">{exams.find(e => e.id === marksheetExam)?.subject}</span></span>
            <span>|</span>
            <span>Class: <span className="font-semibold text-foreground print:text-black">{exams.find(e => e.id === marksheetExam)?.class}</span></span>
            <span>|</span>
            <span>Date: <span className="font-semibold text-foreground print:text-black">{exams.find(e => e.id === marksheetExam)?.date}</span></span>
          </div>
        </div>
        <div className="flex-1 w-full flex flex-col items-center justify-center px-0 md:px-12 print:px-0">
          <table className="w-full max-w-4xl mx-auto text-base border border-primary/20 rounded-2xl overflow-hidden shadow print:border-black print:max-w-full print:text-base mt-8 print:mt-4 bg-white">
            <thead>
              <tr className="bg-primary/10 print:bg-gray-200 rounded-t-2xl">
                <th className="text-left font-semibold px-4 py-3 border-b border-primary/20 print:border-black">#</th>
                <th className="text-left font-semibold px-4 py-3 border-b border-primary/20 print:border-black">Student Name</th>
                {enableCA && [...Array(numCAs)].map((_, i) => (
                  (showColumns === 'all' || showColumns === 'ca') && <th key={i} className="text-left font-semibold px-4 py-3 border-b border-primary/20 print:border-black">CA{i+1}</th>
                ))}
                {(enableCA && (showColumns === 'all' || showColumns === 'exam')) || !enableCA ? <th className="text-left font-semibold px-4 py-3 border-b border-primary/20 print:border-black">Exam</th> : null}
                <th className="text-left font-semibold px-4 py-3 border-b border-primary/20 print:border-black">{enableCA ? `Final (${caCutoffs.slice(0, numCAs).reduce((a, b) => a + b, 0) + examCutoff}${convertTo100 ? ' → 100' : ''})` : 'Exam'}</th>
              </tr>
            </thead>
            <tbody>
              {mockStudents.map((student, idx) => {
                const entry = marks[student.id] as Record<string, string> | string | undefined;
                return (
                  <tr key={student.id} className={idx % 2 === 0 ? "bg-white print:bg-white" : "bg-primary/5 print:bg-gray-100"} style={{ boxShadow: '0 1px 4px 0 rgba(36,106,89,0.04)' }}>
                    <td className="px-4 py-3 border-b border-primary/10 print:border-black text-muted-foreground print:text-black">{idx + 1}</td>
                    <td className="px-4 py-3 border-b border-primary/10 print:border-black font-medium text-foreground print:text-black">{student.name}</td>
                    {enableCA && [...Array(numCAs)].map((_, i) => (
                      (showColumns === 'all' || showColumns === 'ca') && (
                        <td key={i} className="px-4 py-3 border-b border-primary/10 print:border-black text-foreground print:text-black">{typeof entry === 'object' && entry && entry[`ca${i+1}`] !== undefined ? entry[`ca${i+1}`] : ''}</td>
                      )
                    ))}
                    {(enableCA && (showColumns === 'all' || showColumns === 'exam')) || !enableCA ? <td className="px-4 py-3 border-b border-primary/10 print:border-black text-foreground print:text-black">{enableCA ? (typeof entry === 'object' && entry ? (entry as Record<string, string>).exam || '' : '') : (typeof marks[student.id] === 'object' ? '' : (marks[student.id] as string) ?? '')}</td> : null}
                    <td className="px-4 py-3 border-b border-primary/10 print:border-black text-foreground print:text-black">{getFinalMark(student.id)}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        {/* Footer */}
        <div className="flex flex-col md:flex-row justify-between items-end mt-12 mb-8 px-0 md:px-12 print:mt-8 print:mb-4 print:px-0 gap-6 print:gap-2 w-full max-w-4xl mx-auto print:max-w-full">
          <div className="text-base text-muted-foreground print:text-black">
            Generated on: <span className="font-medium text-foreground print:text-black">{new Date().toLocaleDateString()}</span>
          </div>
          <div className="flex flex-col items-end">
            <div className="text-base text-muted-foreground print:text-black mb-2">Teacher's Signature:</div>
            <div className="w-56 h-8 border-b-2 border-primary/40 print:border-black" />
          </div>
        </div>
        <div className="flex gap-2 mt-6 print:hidden justify-center w-full">
          <button
            className="px-6 py-2 rounded-lg bg-primary text-primary-foreground font-semibold shadow hover:bg-primary-dark transition"
            onClick={() => handleDownloadCSV(marksheetExam)}
          >
            Download CSV
          </button>
          <button
            className="px-6 py-2 rounded-lg bg-primary/10 text-primary font-semibold shadow hover:bg-primary/20 border border-primary/20 transition"
            onClick={handlePrint}
          >
            Print
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-white to-primary/5 py-8 px-2 md:px-8 transition-colors">
      <div className="max-w-5xl mx-auto flex flex-col gap-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-2">
          <h1 className="text-3xl font-extrabold tracking-tight text-primary drop-shadow-sm">Assigned Exams</h1>
          <button className="flex items-center gap-2 bg-primary text-primary-foreground px-5 py-2 rounded-lg hover:bg-primary-dark transition text-green-100 font-semibold shadow">
            <PlusCircle className="w-5 h-5" /> Create New Exam
          </button>
        </div>
        {/* Exams List */}
        <div className="bg-card rounded-2xl shadow-lg p-8 border border-border">
          <h2 className="text-xl font-bold mb-6 text-primary">Current Term Exams</h2>
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead>
                <tr className="text-muted-foreground">
                  <th className="text-left font-semibold">Subject</th>
                  <th className="text-left font-semibold">Class</th>
                  <th className="text-left font-semibold">Date</th>
                  <th className="text-left font-semibold">Status</th>
                  <th className="text-left font-semibold">Students</th>
                  <th></th>
                  <th className="text-left font-semibold uppercase text-xs">Marksheet</th>
                </tr>
              </thead>
              <tbody>
                {exams.map((exam) => (
                  <tr key={exam.id} className={`border-b last:border-b-0 border-border hover:bg-primary/5 transition ${selectedExam === exam.id ? 'ring-2 ring-primary' : ''}`}>
                    <td className="py-2 pr-2 font-medium text-foreground">{exam.subject}</td>
                    <td className="py-2 pr-2 text-foreground">{exam.class}</td>
                    <td className="py-2 pr-2 text-muted-foreground">{exam.date}</td>
                    <td className="py-2 pr-2">
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold shadow-sm
                        ${exam.status === "completed" ? "bg-green-100 text-green-700" : ""}
                        ${exam.status === "pending" ? "bg-yellow-100 text-yellow-700" : ""}
                        ${exam.status === "upcoming" ? "bg-blue-100 text-blue-700" : ""}
                      `}>
                        {exam.status.charAt(0).toUpperCase() + exam.status.slice(1)}
                      </span>
                    </td>
                    <td className="py-2 pr-2 text-muted-foreground">{exam.students}</td>
                    <td className="py-2 pr-2">
                      <button
                        className="flex items-center gap-1 text-primary hover:underline font-semibold"
                        onClick={() => handleEnterMarks(exam.id)}
                      >
                        Enter Marks <ArrowRight className="w-4 h-4" />
                      </button>
                    </td>
                    <td className="py-2 pr-2">
                      {exam.status === "completed" && (
                        <button
                          className="px-4 py-1.5 rounded-lg bg-primary text-green-50 font-semibold shadow hover:bg-primary-dark transition"
                          onClick={() => setMarksheetExam(exam.id)}
                        >
                          Marksheet
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
        {marksheetModal}
      </div>
      {/* Drawer for Marksheet Entry */}
      {drawerOpen && drawer}
      <style jsx global>{`
        @keyframes slideInLeft {
          from { transform: translateX(-100%); }
          to { transform: translateX(0); }
        }
        .animate-slideInLeft {
          animation: slideInLeft 0.3s cubic-bezier(0.4,0,0.2,1);
        }
      `}</style>
    </div>
  );
} 