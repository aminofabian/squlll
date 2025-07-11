import React, { useState } from "react";
import { Sparkles, PlusCircle, Loader2, Trash2, ChevronRight, ChevronLeft, CheckCircle2, FileText, Clock, Users, Calendar, Home } from "lucide-react";
import { DynamicLogo } from '../../parent/components/DynamicLogo';

const mockSubjects = ["Mathematics", "English", "Science", "Social Studies", "Kiswahili"];
const mockGrades = ["Grade 4", "Grade 5", "Grade 6", "Grade 7", "Grade 8"];

const QUESTION_TYPES = [
  { value: "mcq", label: "Multiple Choice" },
  { value: "short", label: "Short Answer" },
];

function emptyQuestion() {
  return {
    text: "",
    type: "mcq",
    options: ["", "", "", ""],
    correct: 0,
  };
}

export default function CreateTestSection({ subdomain, onBack, onAssignHomework }: { 
  subdomain?: string; 
  onBack?: () => void; 
  onAssignHomework?: (testData: {
    title: string;
    subject: string;
    grade: string;
    date: string;
    startTime: string;
    duration: string;
  }) => void;
}) {
  // Step state
  const [step, setStep] = useState(1);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);
  const [showA4Preview, setShowA4Preview] = useState(false);

  // Test details
  const [title, setTitle] = useState("");
  const [subject, setSubject] = useState(mockSubjects[0]);
  const [grade, setGrade] = useState(mockGrades[0]);
  const [date, setDate] = useState("");
  const [startTime, setStartTime] = useState("");
  const [duration, setDuration] = useState("");

  // Questions state
  const [questions, setQuestions] = useState([emptyQuestion()]);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiPrompt, setAiPrompt] = useState("");
  const [aiNumQuestions, setAiNumQuestions] = useState(5);
  const [aiSample, setAiSample] = useState("");

  // Step 1 validation
  const detailsValid = title && subject && grade && date && startTime && duration;
  // Step 2 validation
  const questionsValid = questions.every(q => q.text && (q.type !== "mcq" || q.options.every(opt => opt))) && questions.length > 0;

  // Handlers (same as before)
  const handleAddQuestion = () => setQuestions(qs => [...qs, emptyQuestion()]);
  const handleRemoveQuestion = (idx: number) => setQuestions(qs => qs.length === 1 ? qs : qs.filter((_, i) => i !== idx));
  const handleQuestionChange = (idx: number, field: string, value: any) => setQuestions(qs => qs.map((q, i) => i === idx ? { ...q, [field]: value } : q));
  const handleOptionChange = (qIdx: number, optIdx: number, value: string) => setQuestions(qs => qs.map((q, i) => i === qIdx ? { ...q, options: q.options.map((opt, j) => (j === optIdx ? value : opt)) } : q));
  const handleAddOption = (qIdx: number) => setQuestions(qs => qs.map((q, i) => i === qIdx ? { ...q, options: [...q.options, ""] } : q));
  const handleRemoveOption = (qIdx: number, optIdx: number) => setQuestions(qs => qs.map((q, i) => i === qIdx && q.options.length > 2 ? { ...q, options: q.options.filter((_, j) => j !== optIdx) } : q));
  const handleCorrectChange = (qIdx: number, optIdx: number) => setQuestions(qs => qs.map((q, i) => i === qIdx ? { ...q, correct: optIdx } : q));

  const handleGenerateAI = () => {
    if (!aiPrompt.trim() || aiNumQuestions < 1) return;
    setAiLoading(true);
    setTimeout(() => {
      // Example: Add generated questions based on prompt, number, and sample
      setQuestions(qs => [
        ...qs,
        ...Array.from({ length: aiNumQuestions }).map((_, i) => ({
          text: `AI: ${aiPrompt} (Q${i + 1})${aiSample ? `\nSample: ${aiSample}` : ""}`,
          type: "mcq",
          options: ["Option 1", "Option 2", "Option 3", "Option 4"],
          correct: 0,
        })),
      ]);
      setAiLoading(false);
      setAiPrompt("");
      setAiSample("");
      setAiNumQuestions(5);
    }, 1800);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setTimeout(() => {
      setSaving(false);
      setSuccess(true);
    }, 1200);
  };

  // Progress indicator
  const steps = ["Test Details", "Questions", "Review & Save"];

  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center px-6 py-5 bg-gradient-to-br from-slate-50 via-green-50 to-emerald-50">
      <div className="w-full max-w-4xl bg-white shadow-2xl border-0 p-0 flex flex-col relative overflow-hidden">
        {/* Header with gradient and Return to Main Menu button */}
        <div className="bg-gradient-to-r from-[#246a59] via-[#2d8570] to-[#1a4c40] text-white p-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-white/20 flex items-center justify-center">
                <FileText className="w-6 h-6" />
              </div>
              <div>
                <h1 className="text-2xl font-bold">Create New Test</h1>
                <p className="text-green-100 text-sm">Design comprehensive assessments for your students</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <button
                onClick={onBack}
                className="flex items-center gap-2 px-4 py-2 bg-white/20 hover:bg-white/30 text-white font-semibold transition-all duration-300 rounded-lg border border-white/30 hover:border-white/50"
              >
                <Home className="w-4 h-4" />
                Return to Main Menu
              </button>
              <DynamicLogo subdomain={subdomain || ''} size="md" showText={false} />
            </div>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="bg-gray-50 border-b border-gray-200 px-8 py-3">
          <div className="flex items-center justify-between">
            {steps.map((label, idx) => (
              <div key={label} className="flex-1 flex flex-col items-center relative">
                <div className={`w-10 h-10 flex items-center justify-center font-bold text-lg transition-all duration-300 border-2
                  ${step === idx + 1 
                    ? 'bg-[#246a59] text-white border-[#246a59] shadow-lg' 
                    : step > idx + 1 
                      ? 'bg-[#059669] text-white border-[#059669]' 
                      : 'bg-white text-gray-400 border-gray-300'}`}>
                  {step > idx + 1 ? <CheckCircle2 className="w-5 h-5" /> : idx + 1}
                </div>
                <span className={`text-xs mt-2 font-medium ${step === idx + 1 ? 'text-[#246a59]' : step > idx + 1 ? 'text-[#059669]' : 'text-gray-500'}`}>
                  {label}
                </span>
                {idx < steps.length - 1 && (
                  <div className={`absolute top-5 left-full w-full h-0.5 transform -translate-y-1/2 ${step > idx + 1 ? 'bg-[#059669]' : 'bg-gray-300'}`}></div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Step Content */}
        <div className="p-8 bg-white">
          {success ? (
            <div className="flex flex-col items-center justify-center py-16">
              <div className="w-20 h-20 bg-gradient-to-r from-[#059669] to-[#10b981] text-white flex items-center justify-center mb-6 shadow-lg">
                <CheckCircle2 className="w-10 h-10" />
              </div>
              <div className="text-2xl font-bold text-gray-800 mb-3">Test Created Successfully!</div>
              <div className="text-gray-600 text-center mb-8 max-w-md">Your test has been saved and is ready to be assigned to students.</div>
              
              <div className="flex flex-col sm:flex-row gap-4 w-full max-w-lg">
                <button
                  className="flex-1 px-8 py-4 bg-gradient-to-r from-[#246a59] to-[#2d8570] text-white font-semibold hover:from-[#1a4c40] hover:to-[#246a59] transition-all duration-300 shadow-lg transform hover:scale-105"
                  onClick={() => onAssignHomework?.({
                    title,
                    subject,
                    grade,
                    date,
                    startTime,
                    duration
                  })}
                >
                  <Users className="w-4 h-4 mr-2 inline" />
                  Assign to Students
                </button>
                <button
                  className="flex-1 px-8 py-4 border-2 border-gray-300 text-gray-700 font-semibold hover:bg-gray-50 transition-colors"
                  onClick={onBack}
                >
                  Back to Dashboard
                </button>
              </div>
              
              <div className="text-xs text-gray-500 mt-6 text-center max-w-md">
                Choose "Assign to Students" to immediately share this test with classes, individuals, or parents
              </div>
            </div>
          ) : (
            <form onSubmit={handleSave}>
              {/* Step 1: Test Details */}
              {step === 1 && (
                <div className="flex flex-col gap-8">
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* Left Column - Basic Info */}
                    <div className="space-y-6">
                      <div className="bg-gradient-to-r from-green-50 to-emerald-50 p-6 border-l-4 border-[#246a59]">
                        <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                          <FileText className="w-5 h-5 text-[#246a59]" />
                          Test Information
                        </h3>
                        
                        <div className="space-y-4">
                          <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">Test Title</label>
                            <input
                              type="text"
                              className="w-full px-4 py-3 border-2 border-gray-200 bg-white text-gray-800 focus:outline-none focus:border-[#246a59] focus:ring-0 transition-colors"
                              placeholder="e.g. End of Term 1 Mathematics"
                              value={title}
                              onChange={e => setTitle(e.target.value)}
                              required
                            />
                            <div className="text-xs text-gray-500 mt-1">This is the title students will see</div>
                          </div>
                          
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <label className="block text-sm font-semibold text-gray-700 mb-2">Subject</label>
                              <select
                                className="w-full px-4 py-3 border-2 border-gray-200 bg-white text-gray-800 focus:outline-none focus:border-[#246a59] focus:ring-0 transition-colors"
                                value={subject}
                                onChange={e => setSubject(e.target.value)}
                              >
                                {mockSubjects.map(subj => (
                                  <option key={subj} value={subj}>{subj}</option>
                                ))}
                              </select>
                            </div>
                            <div>
                              <label className="block text-sm font-semibold text-gray-700 mb-2">Class/Grade</label>
                              <select
                                className="w-full px-4 py-3 border-2 border-gray-200 bg-white text-gray-800 focus:outline-none focus:border-[#246a59] focus:ring-0 transition-colors"
                                value={grade}
                                onChange={e => setGrade(e.target.value)}
                              >
                                {mockGrades.map(gr => (
                                  <option key={gr} value={gr}>{gr}</option>
                                ))}
                              </select>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Right Column - Schedule */}
                    <div className="space-y-6">
                      <div className="bg-gradient-to-r from-emerald-50 to-teal-50 p-6 border-l-4 border-[#059669]">
                        <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                          <Calendar className="w-5 h-5 text-[#059669]" />
                          Schedule & Timing
                        </h3>
                        
                        <div className="space-y-4">
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <label className="block text-sm font-semibold text-gray-700 mb-2">Date</label>
                              <input
                                type="date"
                                className="w-full px-4 py-3 border-2 border-gray-200 bg-white text-gray-800 focus:outline-none focus:border-[#059669] focus:ring-0 transition-colors"
                                value={date}
                                onChange={e => setDate(e.target.value)}
                                required
                              />
                            </div>
                            <div>
                              <label className="block text-sm font-semibold text-gray-700 mb-2">Start Time</label>
                              <input
                                type="time"
                                className="w-full px-4 py-3 border-2 border-gray-200 bg-white text-gray-800 focus:outline-none focus:border-[#059669] focus:ring-0 transition-colors"
                                value={startTime}
                                onChange={e => setStartTime(e.target.value)}
                                required
                              />
                            </div>
                          </div>
                          
                          <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                              <Clock className="w-4 h-4" />
                              Duration (minutes)
                            </label>
                            <input
                              type="number"
                              min="10"
                              max="300"
                              className="w-full px-4 py-3 border-2 border-gray-200 bg-white text-gray-800 focus:outline-none focus:border-[#059669] focus:ring-0 transition-colors"
                              placeholder="e.g. 90"
                              value={duration}
                              onChange={e => setDuration(e.target.value)}
                              required
                            />
                            <div className="text-xs text-gray-500 mt-1">Recommended: 60-120 minutes</div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-between gap-4 pt-6 border-t border-gray-200">
                    <button
                      type="button"
                      className="flex items-center gap-2 px-6 py-3 bg-gray-100 text-gray-700 font-semibold hover:bg-gray-200 transition-colors"
                      onClick={onBack}
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      className="flex items-center gap-2 px-8 py-3 bg-gradient-to-r from-[#246a59] to-[#2d8570] text-white font-semibold hover:from-[#1a4c40] hover:to-[#246a59] transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
                      onClick={() => setStep(2)}
                      disabled={!detailsValid}
                    >
                      Next Step <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )}

              {/* Step 2: Questions */}
              {step === 2 && (
                <div className="flex flex-col gap-8">
                  {/* AI Section */}
                  <div className="bg-gradient-to-r from-amber-50 to-orange-50 border-l-4 border-[#f59e0b] p-6">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-8 h-8 bg-gradient-to-r from-[#f59e0b] to-[#d97706] text-white flex items-center justify-center">
                        <Sparkles className="w-4 h-4" />
                      </div>
                      <h3 className="text-lg font-bold text-gray-800">Generate Questions with AI</h3>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">Number of Questions</label>
                        <input
                          type="number"
                          min={1}
                          max={20}
                          className="w-full px-4 py-3 border-2 border-gray-200 bg-white text-gray-800 focus:outline-none focus:border-[#f59e0b] focus:ring-0 transition-colors"
                          value={aiNumQuestions}
                          onChange={e => setAiNumQuestions(Number(e.target.value))}
                        />
                      </div>
                      <div className="md:col-span-2">
                        <label className="block text-sm font-semibold text-gray-700 mb-2">Sample Question <span className="text-gray-500">(optional)</span></label>
                        <textarea
                          className="w-full px-4 py-3 border-2 border-gray-200 bg-white text-gray-800 focus:outline-none focus:border-[#f59e0b] focus:ring-0 transition-colors"
                          placeholder="e.g. What is 2/3 + 1/6?"
                          value={aiSample}
                          onChange={e => setAiSample(e.target.value)}
                          rows={1}
                        />
                      </div>
                    </div>
                    
                    <div className="mb-4">
                      <label className="block text-sm font-semibold text-gray-700 mb-2">Prompt/Description</label>
                      <textarea
                        className="w-full px-4 py-3 border-2 border-gray-200 bg-white text-gray-800 focus:outline-none focus:border-[#f59e0b] focus:ring-0 transition-colors"
                        placeholder="e.g. Create 5 math questions on fractions for Grade 6"
                        value={aiPrompt}
                        onChange={e => setAiPrompt(e.target.value)}
                        rows={2}
                      />
                    </div>
                    
                    {(aiPrompt.trim() || aiSample.trim()) && (
                      <div className="bg-white border-2 border-amber-200 p-3 mb-4">
                        <span className="font-semibold text-amber-700">AI will generate {aiNumQuestions} question(s)</span>
                        {aiPrompt && <span className="text-gray-600"> about <span className="italic">{aiPrompt}</span></span>}
                        {aiSample && <span className="text-gray-600"> (sample: <span className="italic">{aiSample}</span>)</span>}
                      </div>
                    )}
                    
                    <button
                      type="button"
                      className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-[#f59e0b] to-[#d97706] text-white font-semibold hover:from-[#d97706] hover:to-[#b45309] transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
                      onClick={handleGenerateAI}
                      disabled={aiLoading || !aiPrompt.trim() || aiNumQuestions < 1}
                    >
                      {aiLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
                      {aiLoading ? "Generating..." : "Generate with AI"}
                    </button>
                  </div>

                  {/* Manual Questions */}
                  <div className="space-y-6">
                    <div className="flex items-center justify-between">
                      <h3 className="text-lg font-bold text-gray-800">Manual Questions</h3>
                      <button
                        type="button"
                        className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-[#059669] to-[#10b981] text-white font-semibold hover:from-[#047857] hover:to-[#059669] transition-all duration-300 shadow-lg"
                        onClick={handleAddQuestion}
                      >
                        <PlusCircle className="w-4 h-4" /> Add Question
                      </button>
                    </div>
                    
                    {questions.map((q, idx) => (
                      <div key={idx} className="border-2 border-gray-200 bg-gray-50 p-6 relative">
                        <div className="flex items-center gap-4 mb-4">
                          <span className="text-lg font-bold text-gray-700 bg-white px-3 py-1 border-2 border-gray-300">Q{idx + 1}</span>
                          <select
                            className="px-4 py-2 border-2 border-gray-200 bg-white text-gray-800 focus:outline-none focus:border-[#246a59] focus:ring-0 transition-colors"
                            value={q.type}
                            onChange={e => handleQuestionChange(idx, "type", e.target.value)}
                          >
                            {QUESTION_TYPES.map(t => (
                              <option key={t.value} value={t.value}>{t.label}</option>
                            ))}
                          </select>
                          <button
                            type="button"
                            className="ml-auto text-red-600 hover:text-red-700 px-3 py-1 flex items-center gap-1 font-semibold transition-colors"
                            onClick={() => handleRemoveQuestion(idx)}
                            disabled={questions.length === 1}
                            title="Remove question"
                          >
                            <Trash2 className="w-4 h-4" /> Remove
                          </button>
                        </div>
                        
                        <input
                          type="text"
                          className="w-full px-4 py-3 border-2 border-gray-200 bg-white text-gray-800 focus:outline-none focus:border-[#246a59] focus:ring-0 transition-colors mb-4"
                          placeholder="Enter question text..."
                          value={q.text}
                          onChange={e => handleQuestionChange(idx, "text", e.target.value)}
                          required
                        />
                        
                        {q.type === "mcq" && (
                          <div className="space-y-3">
                            <div className="text-sm font-semibold text-gray-700 mb-2">Options:</div>
                            {q.options.map((opt, oIdx) => (
                              <div key={oIdx} className="flex items-center gap-3">
                                <input
                                  type="radio"
                                  name={`correct-${idx}`}
                                  checked={q.correct === oIdx}
                                  onChange={() => handleCorrectChange(idx, oIdx)}
                                  className="w-4 h-4 text-[#246a59] border-2 border-gray-300 focus:ring-[#246a59]"
                                />
                                <input
                                  type="text"
                                  className="flex-1 px-4 py-3 border-2 border-gray-200 bg-white text-gray-800 focus:outline-none focus:border-[#246a59] focus:ring-0 transition-colors"
                                  placeholder={`Option ${oIdx + 1}`}
                                  value={opt}
                                  onChange={e => handleOptionChange(idx, oIdx, e.target.value)}
                                  required
                                />
                                {q.options.length > 2 && (
                                  <button
                                    type="button"
                                    className="text-red-600 hover:text-red-700 px-2 py-1 font-semibold transition-colors"
                                    onClick={() => handleRemoveOption(idx, oIdx)}
                                    title="Remove option"
                                  >
                                    <Trash2 className="w-4 h-4" />
                                  </button>
                                )}
                              </div>
                            ))}
                            <button
                              type="button"
                              className="flex items-center gap-1 text-[#246a59] border-2 border-[#246a59]/20 px-4 py-2 hover:bg-[#246a59]/5 transition-colors font-semibold"
                              onClick={() => handleAddOption(idx)}
                            >
                              <PlusCircle className="w-4 h-4" /> Add Option
                            </button>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>

                  <div className="flex justify-between gap-4 pt-6 border-t border-gray-200">
                    <button
                      type="button"
                      className="flex items-center gap-2 px-6 py-3 bg-gray-100 text-gray-700 font-semibold hover:bg-gray-200 transition-colors"
                      onClick={() => setStep(1)}
                    >
                      <ChevronLeft className="w-4 h-4" /> Back
                    </button>
                    <button
                      type="button"
                      className="flex items-center gap-2 px-8 py-3 bg-gradient-to-r from-[#246a59] to-[#2d8570] text-white font-semibold hover:from-[#1a4c40] hover:to-[#246a59] transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
                      onClick={() => setStep(3)}
                      disabled={!questionsValid}
                    >
                      Next Step <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )}

              {/* Step 3: Review & Save */}
              {step === 3 && (
                (() => {
                  const allMCQ = questions.every(q => q.type === "mcq");
                  const allShort = questions.every(q => q.type === "short");
                  let rightHeading = "Test Questions";
                  let instructions = "Answer all questions as instructed.";
                  if (allMCQ) {
                    rightHeading = "Multiple Choice Questions";
                    instructions = "For each of these questions, choose the option (A, B, C or D) that is TRUE.";
                  } else if (allShort) {
                    rightHeading = "Short Answer Questions";
                    instructions = "Answer all questions in the space provided.";
                  }
                  
                  // A4 Preview content
                  const A4Preview = (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 print:bg-transparent">
                      <div className="relative bg-white font-serif shadow-2xl border-0 w-[210mm] h-[297mm] max-w-full max-h-full overflow-auto p-12 print:w-full print:h-full print:shadow-none print:border-none">
                        <button
                          className="absolute top-4 right-4 bg-[#246a59] text-white px-4 py-2 font-bold shadow-lg hover:bg-[#1a4c40] print:hidden"
                          onClick={() => setShowA4Preview(false)}
                        >
                          Close
                        </button>
                        <div className="flex flex-col items-center mb-6">
                          {/* <DynamicLogo subdomain={subdomain || ''} size="lg" showText={true} /> */}
                        </div>
                        {/* Header */}
                        <div className="w-full flex flex-row items-start justify-between mb-2">
                          <div>
                            <div className="text-2xl font-extrabold text-black mb-1">{title || <span className="italic text-gray-400">Test Title</span>}</div>
                            <div className="text-lg italic text-gray-700">{subject} {grade && `– ${grade}`}</div>
                          </div>
                          <div className="text-right">
                            <div className="text-base font-semibold text-black">{rightHeading}</div>
                            <div className="text-sm text-gray-700">Date: {date}</div>
                            <div className="text-sm text-gray-700">Start: {startTime}</div>
                            <div className="text-sm text-gray-700">Duration: {duration} min</div>
                          </div>
                        </div>
                        <hr className="w-full border-t border-gray-300 my-4" />
                        {/* Instructions */}
                        <div className="w-full text-center text-sm italic text-gray-600 mb-6">
                          {instructions}
                        </div>
                        {/* Questions */}
                        <ol className="list-decimal pl-6 w-full space-y-6">
                          {questions.map((q, idx) => (
                            <li key={idx} className="text-black text-base mb-2">
                              <div className="mb-2 font-medium">{q.text}</div>
                              {q.type === "mcq" && (
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pl-4">
                                  {q.options.map((opt, oIdx) => (
                                    <div key={oIdx} className="flex items-start gap-2">
                                      <span className="font-bold text-black w-6">{String.fromCharCode(65 + oIdx)})</span>
                                      <span className="text-black">{opt}</span>
                                    </div>
                                  ))}
                                </div>
                              )}
                            </li>
                          ))}
                        </ol>
                      </div>
                      <style>{`
                        @media print {
                          body * { visibility: hidden !important; }
                          .print\:bg-transparent { background: transparent !important; }
                          .print\:w-full { width: 100% !important; }
                          .print\:h-full { height: 100% !important; }
                          .print\:shadow-none { box-shadow: none !important; }
                          .print\:border-none { border: none !important; }
                          .print\:hidden { display: none !important; }
                          .print\:block { display: block !important; }
                          .print-area, .print-area * { visibility: visible !important; }
                          .print-area { position: absolute !important; left: 0; top: 0; width: 100vw !important; height: 100vh !important; background: white !important; }
                        }
                      `}</style>
                    </div>
                  );
                  
                  return (
                    <>
                      <div className="flex flex-col gap-8">
                        <div className="text-center mb-6">
                          <h3 className="text-2xl font-bold text-gray-800 mb-2">Review & Save</h3>
                          <p className="text-gray-600">Preview your test before creating it</p>
                        </div>
                        
                        {/* Exam Paper Style */}
                        <div className="bg-white border-2 border-gray-300 p-12 shadow-lg max-w-4xl mx-auto">
                          <div className="flex flex-col items-center mb-8">
                            <DynamicLogo subdomain={subdomain || ''} size="lg" showText={true} />
                          </div>
                          
                          {/* Header */}
                          <div className="w-full flex flex-row items-start justify-between mb-4">
                            <div>
                              <div className="text-3xl font-extrabold text-black mb-2">{title || <span className="italic text-gray-400">Test Title</span>}</div>
                              <div className="text-xl italic text-gray-700">{subject} {grade && `– ${grade}`}</div>
                            </div>
                            <div className="text-right">
                              <div className="text-lg font-semibold text-black">{rightHeading}</div>
                              <div className="text-sm text-gray-700">Date: {date}</div>
                              <div className="text-sm text-gray-700">Start: {startTime}</div>
                              <div className="text-sm text-gray-700">Duration: {duration} min</div>
                            </div>
                          </div>
                          
                          <hr className="w-full border-t-2 border-gray-400 my-6" />
                          
                          {/* Instructions */}
                          <div className="w-full text-center text-base italic text-gray-600 mb-8">
                            {instructions}
                          </div>
                          
                          {/* Questions */}
                          <ol className="list-decimal pl-8 w-full space-y-8">
                            {questions.map((q, idx) => (
                              <li key={idx} className="text-black text-lg mb-4">
                                <div className="mb-3 font-semibold">{q.text}</div>
                                {q.type === "mcq" && (
                                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pl-6">
                                    {q.options.map((opt, oIdx) => (
                                      <div key={oIdx} className="flex items-start gap-3">
                                        <span className="font-bold text-black w-8">{String.fromCharCode(65 + oIdx)})</span>
                                        <span className="text-black">{opt}</span>
                                      </div>
                                    ))}
                                  </div>
                                )}
                              </li>
                            ))}
                          </ol>
                        </div>
                        
                        <div className="flex justify-between gap-4 pt-6 border-t border-gray-200">
                          <button
                            type="button"
                            className="flex items-center gap-2 px-6 py-3 bg-gray-100 text-gray-700 font-semibold hover:bg-gray-200 transition-colors"
                            onClick={() => setStep(2)}
                          >
                            <ChevronLeft className="w-4 h-4" /> Back
                          </button>
                          <div className="flex gap-4">
                            <button
                              type="button"
                              className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-gray-600 to-gray-700 text-white font-semibold hover:from-gray-700 hover:to-gray-800 transition-all duration-300 shadow-lg"
                              onClick={() => setShowA4Preview(true)}
                            >
                              Preview as A4
                            </button>
                            <button
                              type="submit"
                              className="flex items-center gap-2 px-8 py-3 bg-gradient-to-r from-[#059669] to-[#10b981] text-white font-semibold hover:from-[#047857] hover:to-[#059669] transition-all duration-300 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                              disabled={saving}
                            >
                              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />} Create Test
                            </button>
                          </div>
                        </div>
                      </div>
                      {showA4Preview && A4Preview}
                    </>
                  );
                })()
              )}
            </form>
          )}
        </div>
      </div>
    </div>
  );
} 