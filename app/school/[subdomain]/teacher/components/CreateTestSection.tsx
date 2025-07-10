import React, { useState } from "react";
import { Sparkles, PlusCircle, Loader2, Trash2, ChevronRight, ChevronLeft, CheckCircle2 } from "lucide-react";
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

export default function CreateTestSection({ subdomain, onBack }: { subdomain?: string; onBack?: () => void }) {
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
    <div className="min-h-[70vh] flex flex-col items-center justify-center px-4 py-8 bg-background animate-fadeIn">
      <div className="w-full max-w-2xl bg-card border border-primary/10 shadow-lg p-0 flex flex-col rounded-xl relative overflow-hidden">
        {/* Progress Bar */}
        <div className="flex items-center justify-between px-8 py-6 bg-primary/5 border-b border-primary/10">
          {steps.map((label, idx) => (
            <div key={label} className="flex-1 flex flex-col items-center">
              <div className={`w-8 h-8 flex items-center justify-center rounded-full font-bold text-lg transition-all duration-300
                ${step === idx + 1 ? 'bg-primary text-white shadow-lg scale-110' : 'bg-muted text-primary/60 border border-primary/20'}`}>{idx + 1}</div>
              <span className={`text-xs mt-1 font-medium ${step === idx + 1 ? 'text-primary' : 'text-muted-foreground'}`}>{label}</span>
            </div>
          ))}
        </div>
        {/* Step Content */}
        <div className="p-8">
          {success ? (
            <div className="flex flex-col items-center justify-center py-12">
              <div className="w-16 h-16 flex items-center justify-center bg-primary text-white rounded-full mb-4">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <div className="text-lg font-semibold text-primary mb-2">Test Created!</div>
              <div className="text-muted-foreground text-sm">Your test has been saved successfully.</div>
              <button
                className="mt-6 px-4 py-2 bg-primary text-white rounded font-semibold hover:bg-primary/90 transition"
                onClick={onBack}
              >Back to Dashboard</button>
            </div>
          ) : (
            <form onSubmit={handleSave}>
              {/* Step 1: Test Details */}
              {step === 1 && (
                <div className="flex flex-col gap-6 animate-fadeIn">
                  <div className="flex flex-col gap-5 bg-muted/30 rounded-lg p-6 border border-muted">
                    <div>
                      <label className="block text-sm font-medium text-foreground mb-1">Test Title</label>
                      <input
                        type="text"
                        className="w-full px-3 py-2 border border-primary/20 rounded bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                        placeholder="e.g. End of Term 1 Mathematics"
                        value={title}
                        onChange={e => setTitle(e.target.value)}
                        required
                      />
                      <div className="text-xs text-muted-foreground mt-1">This is the title students will see.</div>
                    </div>
                    <div className="flex gap-4">
                      <div className="flex-1">
                        <label className="block text-sm font-medium text-foreground mb-1">Subject</label>
                        <select
                          className="w-full px-3 py-2 border border-primary/20 rounded bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                          value={subject}
                          onChange={e => setSubject(e.target.value)}
                        >
                          {mockSubjects.map(subj => (
                            <option key={subj} value={subj}>{subj}</option>
                          ))}
                        </select>
                      </div>
                      <div className="flex-1">
                        <label className="block text-sm font-medium text-foreground mb-1">Class/Grade</label>
                        <select
                          className="w-full px-3 py-2 border border-primary/20 rounded bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                          value={grade}
                          onChange={e => setGrade(e.target.value)}
                        >
                          {mockGrades.map(gr => (
                            <option key={gr} value={gr}>{gr}</option>
                          ))}
                        </select>
                      </div>
                    </div>
                    <div className="flex gap-4">
                      <div className="flex-1">
                        <label className="block text-sm font-medium text-foreground mb-1">Date</label>
                        <input
                          type="date"
                          className="w-full px-3 py-2 border border-primary/20 rounded bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                          value={date}
                          onChange={e => setDate(e.target.value)}
                          required
                        />
                      </div>
                      <div className="flex-1">
                        <label className="block text-sm font-medium text-foreground mb-1">Start Time</label>
                        <input
                          type="time"
                          className="w-full px-3 py-2 border border-primary/20 rounded bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                          value={startTime}
                          onChange={e => setStartTime(e.target.value)}
                          required
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-foreground mb-1">Duration (minutes)</label>
                      <input
                        type="number"
                        min="10"
                        max="300"
                        className="w-full px-3 py-2 border border-primary/20 rounded bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                        placeholder="e.g. 90"
                        value={duration}
                        onChange={e => setDuration(e.target.value)}
                        required
                      />
                    </div>
                  </div>
                  <div className="flex justify-end gap-2 mt-4">
                    <button
                      type="button"
                      className="flex items-center gap-1 px-4 py-2 bg-muted text-foreground rounded font-semibold hover:bg-muted/70 transition"
                      onClick={onBack}
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      className="flex items-center gap-1 px-4 py-2 bg-primary text-white rounded font-semibold hover:bg-primary/90 transition disabled:opacity-60 disabled:cursor-not-allowed"
                      onClick={() => setStep(2)}
                      disabled={!detailsValid}
                    >
                      Next <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )}
              {/* Step 2: Questions */}
              {step === 2 && (
                <div className="flex flex-col gap-6 animate-fadeIn">
                  {/* AI Section - always visible at the top */}
                  <div className="bg-primary/5 border border-primary/30 rounded-lg p-4 flex flex-col gap-3 mb-2 shadow-sm">
                    <div className="flex items-center gap-2 mb-1">
                      <Sparkles className="w-4 h-4 text-primary" />
                      <span className="font-semibold text-primary">Generate Questions with AI</span>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                      <div>
                        <label className="block text-xs font-medium text-primary mb-1">Number of Questions</label>
                        <input
                          type="number"
                          min={1}
                          max={20}
                          className="w-full px-2 py-1 border border-primary/20 rounded bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary text-sm"
                          value={aiNumQuestions}
                          onChange={e => setAiNumQuestions(Number(e.target.value))}
                        />
                        <div className="text-xs text-muted-foreground mt-1">How many questions to generate?</div>
                      </div>
                      <div className="md:col-span-2">
                        <label className="block text-xs font-medium text-primary mb-1">Sample Question <span className="text-muted-foreground">(optional)</span></label>
                        <textarea
                          className="w-full px-2 py-1 border border-primary/20 rounded bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary text-xs"
                          placeholder="e.g. What is 2/3 + 1/6?"
                          value={aiSample}
                          onChange={e => setAiSample(e.target.value)}
                          rows={1}
                        />
                        <div className="text-xs text-muted-foreground mt-1">Give an example to guide the AI's style.</div>
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-primary mb-1">Prompt/Description</label>
                      <textarea
                        className="w-full px-3 py-2 border border-primary/20 rounded bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary text-sm"
                        placeholder="e.g. Create 5 math questions on fractions for Grade 6"
                        value={aiPrompt}
                        onChange={e => setAiPrompt(e.target.value)}
                        rows={2}
                      />
                      <div className="text-xs text-muted-foreground mt-1">Describe the topic, difficulty, or any special instructions.</div>
                    </div>
                    {/* AI Request Summary */}
                    {(aiPrompt.trim() || aiSample.trim()) && (
                      <div className="bg-muted/40 border border-muted/30 rounded p-2 text-xs text-muted-foreground mt-2">
                        <span className="font-semibold text-primary">AI will generate {aiNumQuestions} question(s)</span>
                        {aiPrompt && <span> about <span className="italic">{aiPrompt}</span></span>}
                        {aiSample && <span> (sample: <span className="italic">{aiSample}</span>)</span>}
                      </div>
                    )}
                    <button
                      type="button"
                      className="flex items-center gap-2 text-xs font-semibold text-white bg-primary px-3 py-2 rounded shadow hover:bg-primary/90 transition-colors w-fit mt-1 disabled:opacity-60 disabled:cursor-not-allowed"
                      onClick={handleGenerateAI}
                      disabled={aiLoading || !aiPrompt.trim() || aiNumQuestions < 1}
                    >
                      {aiLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
                      {aiLoading ? "Generating..." : "Generate with AI"}
                    </button>
                  </div>
                  <button
                    type="button"
                    className="flex items-center gap-2 text-sm text-primary border border-primary/30 px-3 py-2 rounded shadow hover:bg-primary/10 transition-colors w-fit"
                    onClick={handleAddQuestion}
                  >
                    <PlusCircle className="w-4 h-4" /> Add Question
                  </button>
                  {/* Questions List */}
                  {questions.map((q, idx) => (
                    <div key={idx} className="border border-primary/10 bg-muted/30 rounded-lg p-4 flex flex-col gap-2 relative shadow-sm">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-sm font-semibold text-foreground">Q{idx + 1}</span>
                        <select
                          className="text-xs px-2 py-1 border border-primary/20 rounded bg-background text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                          value={q.type}
                          onChange={e => handleQuestionChange(idx, "type", e.target.value)}
                        >
                          {QUESTION_TYPES.map(t => (
                            <option key={t.value} value={t.value}>{t.label}</option>
                          ))}
                        </select>
                        <button
                          type="button"
                          className="ml-auto text-xs text-destructive hover:underline px-2 py-1 flex items-center gap-1"
                          onClick={() => handleRemoveQuestion(idx)}
                          disabled={questions.length === 1}
                          title="Remove question"
                        >
                          <Trash2 className="w-4 h-4" /> Remove
                        </button>
                      </div>
                      <input
                        type="text"
                        className="w-full px-3 py-2 border border-primary/20 rounded bg-background text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                        placeholder="Enter question text..."
                        value={q.text}
                        onChange={e => handleQuestionChange(idx, "text", e.target.value)}
                        required
                      />
                      {q.type === "mcq" && (
                        <div className="flex flex-col gap-2 mt-1">
                          {q.options.map((opt, oIdx) => (
                            <div key={oIdx} className="flex items-center gap-2">
                              <input
                                type="radio"
                                name={`correct-${idx}`}
                                checked={q.correct === oIdx}
                                onChange={() => handleCorrectChange(idx, oIdx)}
                                className="accent-primary"
                              />
                              <input
                                type="text"
                                className="flex-1 px-2 py-1 border border-primary/20 rounded bg-background text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                                placeholder={`Option ${oIdx + 1}`}
                                value={opt}
                                onChange={e => handleOptionChange(idx, oIdx, e.target.value)}
                                required
                              />
                              {q.options.length > 2 && (
                                <button
                                  type="button"
                                  className="text-xs text-destructive px-2 py-1 hover:underline flex items-center gap-1"
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
                            className="flex items-center gap-1 text-xs text-primary border border-primary/20 px-2 py-1 rounded hover:bg-primary/10 transition-colors w-fit"
                            onClick={() => handleAddOption(idx)}
                          >
                            <PlusCircle className="w-4 h-4" /> Add Option
                          </button>
                        </div>
                      )}
                    </div>
                  ))}
                  <div className="flex justify-between gap-2 mt-6">
                    <button
                      type="button"
                      className="flex items-center gap-1 px-4 py-2 bg-muted text-foreground rounded font-semibold hover:bg-muted/70 transition"
                      onClick={() => setStep(1)}
                    >
                      <ChevronLeft className="w-4 h-4" /> Back
                    </button>
                    <button
                      type="button"
                      className="flex items-center gap-1 px-4 py-2 bg-primary text-white rounded font-semibold hover:bg-primary/90 transition disabled:opacity-60 disabled:cursor-not-allowed"
                      onClick={() => setStep(3)}
                      disabled={!questionsValid}
                    >
                      Next <ChevronRight className="w-4 h-4" />
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
                  // A4 Preview content (reuse the review card)
                  const A4Preview = (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 print:bg-transparent">
                      <div className="relative bg-white font-serif shadow-xl border border-gray-300 rounded-none w-[210mm] h-[297mm] max-w-full max-h-full overflow-auto p-12 print:w-full print:h-full print:shadow-none print:border-none">
                        <button
                          className="absolute top-4 right-4 bg-primary text-white rounded px-3 py-1 font-bold shadow hover:bg-primary/80 print:hidden"
                          onClick={() => setShowA4Preview(false)}
                        >
                          Close
                        </button>
                        <div className="flex flex-col items-center mb-6">
                          <DynamicLogo subdomain={subdomain || ''} size="lg" showText={true} />
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
                      <div className="flex flex-col gap-6 animate-fadeIn">
                        <h3 className="text-lg font-bold text-foreground mb-2">Review & Save</h3>
                        {/* Exam Paper Style */}
                        <div className="bg-white font-serif rounded-lg p-10 border border-primary/10 shadow-md flex flex-col items-center mb-6 max-w-2xl mx-auto">
                          <div className="flex flex-col items-center mb-6"><DynamicLogo subdomain={subdomain || ''} size="lg" showText={true} /></div>
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
                        <div className="flex justify-between gap-2 mt-6">
                          <button
                            type="button"
                            className="flex items-center gap-1 px-4 py-2 bg-muted text-foreground rounded font-semibold hover:bg-muted/70 transition"
                            onClick={() => setStep(2)}
                          >
                            <ChevronLeft className="w-4 h-4" /> Back
                          </button>
                          <div className="flex gap-2">
                            <button
                              type="button"
                              className="flex items-center gap-1 px-4 py-2 bg-secondary text-foreground rounded font-semibold hover:bg-secondary/80 transition border border-primary/30"
                              onClick={() => setShowA4Preview(true)}
                            >
                              Preview as A4
                            </button>
                            <button
                              type="submit"
                              className="flex items-center gap-1 px-4 py-2 bg-primary text-white rounded font-semibold hover:bg-primary/90 transition disabled:opacity-60 disabled:cursor-not-allowed"
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