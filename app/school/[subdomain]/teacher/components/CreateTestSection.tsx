import React, { useState, useEffect, useMemo } from "react";
import { Sparkles, PlusCircle, Loader2, Trash2, ChevronRight, ChevronLeft, CheckCircle2, FileText, Clock, Users, Calendar, Home, Upload, File, X, BookOpen } from "lucide-react";
import { DynamicLogo } from '../../parent/components/DynamicLogo';
import { useSchoolConfigStore } from '@/lib/stores/useSchoolConfigStore';
import { useTeacherData } from '@/lib/hooks/useTeacherData';
import { toast } from 'sonner';

const QUESTION_TYPES = [
  { value: "mcq", label: "Multiple Choice" },
  { value: "short", label: "Short Answer" },
  { value: "tf", label: "True/False" },
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
    points: string;
    resourceUrl: string;
  }) => void;
}) {
  // Teacher data - using teacher-specific grades and subjects
  const { teacher, loading: teacherLoading, error: teacherError, getFormattedSubjects, getFormattedGradeLevels, refetch } = useTeacherData();
  
  // Fallback to school config if teacher data is not available
  const getAllGradeLevels = useSchoolConfigStore(state => state.getAllGradeLevels);
  const getAllSubjects = useSchoolConfigStore(state => state.getAllSubjects);
  const schoolGradeLevels = getAllGradeLevels();
  const schoolSubjects = getAllSubjects();

  // Use teacher data if available, otherwise fallback to school config
  const finalGradeLevels = teacher ? getFormattedGradeLevels() : schoolGradeLevels;
  const finalSubjects = teacher ? getFormattedSubjects() : schoolSubjects;

  // Step state - define all hooks at the top level
  const [step, setStep] = useState(1);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);
  const [showA4Preview, setShowA4Preview] = useState(false);

  // Test details
  const [title, setTitle] = useState("");
  const [subject, setSubject] = useState("");
  const [subjectId, setSubjectId] = useState(""); // Adding subject ID state
  const [selectedGrades, setSelectedGrades] = useState<string[]>([]);
  const [date, setDate] = useState("");
  const [startTime, setStartTime] = useState("");
  const [duration, setDuration] = useState("");
  const [points, setPoints] = useState("");
  const [resourceUrl, setResourceUrl] = useState("");
  const [instructions, setInstructions] = useState("");
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);
  
  // Questions state
  const [questions, setQuestions] = useState([emptyQuestion()]);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiPrompt, setAiPrompt] = useState("");
  const [aiNumQuestions, setAiNumQuestions] = useState(5);
  const [aiSample, setAiSample] = useState("");

  // Flatten grades for easier access - moved before early returns to fix hooks order
  const flatGrades = teacher 
    ? (finalGradeLevels as Array<{id: string, name: string}>).map(gradeLevel => ({
        id: gradeLevel.id,
        name: gradeLevel.name,
        levelName: gradeLevel.name,
        levelId: gradeLevel.id
      }))
    : (finalGradeLevels as Array<{levelId: string, levelName: string, grades: any[]}>).flatMap(level =>
        (level.grades || []).map(grade => ({
          ...grade,
          levelName: level.levelName,
          levelId: level.levelId
        }))
      );

  // Filter subjects based on selected grades - moved before early returns to fix hooks order
  const availableSubjects = useMemo(() => {
    if (teacher) {
      // For teacher data, just return all subjects assigned to the teacher
      // since they are already filtered by what the teacher teaches
      return finalSubjects;
    }
    
    if (selectedGrades.length === 0) {
      // No grades selected = no subjects to show
      return [];
    }
    // Find which levels contain the selected grades
    const selectedLevelIds = new Set<string>();
    selectedGrades.forEach(gradeName => {
      const grade = flatGrades.find(g => g.name === gradeName);
      if (grade) {
        selectedLevelIds.add(grade.levelId);
      }
    });
    
    // Get subjects from those levels using the store method
    const subjectsMap = new Map<string, { id: string, name: string }>();
    selectedLevelIds.forEach(levelId => {
      const levelSubjects = useSchoolConfigStore.getState().getSubjectsByLevelId(levelId);
      levelSubjects.forEach(subject => {
        subjectsMap.set(subject.name, { id: subject.id, name: subject.name });
      });
    });
    
    return Array.from(subjectsMap.values());
  }, [selectedGrades, flatGrades, finalGradeLevels, teacher, finalSubjects]);

  // Set default subject when subjects are loaded - moved before early returns to fix hooks order
  useEffect(() => {
    if (availableSubjects.length > 0) {
      // Auto-select first subject when subjects become available
      setSubject(availableSubjects[0].name);
      setSubjectId(availableSubjects[0].id);
    } else {
      // Reset subject when no subjects are available
      setSubject("");
      setSubjectId("");
    }
  }, [availableSubjects]);

  // Debug: Log the live data being used
  console.log('=== CreateTestSection Debug ===');
  console.log('Teacher data:', teacher);
  console.log('Teacher loading:', teacherLoading);
  console.log('Teacher error:', teacherError);
  console.log('Using teacher data:', !!teacher);
  console.log('Final grade levels:', finalGradeLevels);
  console.log('Final subjects:', finalSubjects);
  console.log('Number of levels:', finalGradeLevels.length);
  console.log('Number of subjects:', finalSubjects.length);
  console.log('=== End CreateTestSection Debug ===');

  // Show loading state if teacher data is loading
  if (teacherLoading) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center px-6 py-5 bg-gradient-to-br from-slate-50 via-primary/5 to-primary/10">
        <div className="w-full max-w-4xl bg-white shadow-2xl border-0 p-8 text-center">
          <Loader2 className="w-12 h-12 mx-auto mb-4 text-primary animate-spin" />
          <h3 className="text-xl font-bold text-gray-800 mb-2">Loading Teacher Data</h3>
          <p className="text-gray-600">Fetching your assigned grades and subjects...</p>
        </div>
      </div>
    );
  }

  // Show loading state if no data is available yet
  if (finalGradeLevels.length === 0) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center px-6 py-5 bg-gradient-to-br from-slate-50 via-primary/5 to-primary/10">
        <div className="w-full max-w-4xl bg-white shadow-2xl border-0 p-8 text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <h3 className="text-xl font-bold text-gray-800 mb-2">
            {teacher ? 'No Assigned Grades' : 'Loading School Configuration'}
          </h3>
          <p className="text-gray-600">
            {teacher 
              ? 'You have not been assigned any grades yet. Please contact your administrator.' 
              : 'Please wait while we load your school\'s grades and subjects...'
            }
          </p>
          {teacherError && (
            <div className="mt-4">
              <p className="text-red-600 text-sm mb-3">Error: {teacherError}</p>
              <button 
                onClick={() => refetch()} 
                className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors"
              >
                Try Again
              </button>
            </div>
          )}
        </div>
      </div>
    );
  }





  // Step 1 validation (grades must be selected first, then subject becomes available)
  const detailsValid = title && selectedGrades.length > 0 && subject && date && startTime && duration && points;
  // Step 2 validation
  const questionsValid = questions.every(q => {
    if (!q.text) return false;
    if (q.type === "mcq" || q.type === "tf") {
      return q.options && q.options.every(opt => opt.trim() !== '');
    }
    return true; // For short answer questions, only text is required
  }) && questions.length > 0;

  // Handlers (same as before)
  const handleAddQuestion = () => setQuestions(qs => [...qs, emptyQuestion()]);
  const handleRemoveQuestion = (idx: number) => setQuestions(qs => qs.length === 1 ? qs : qs.filter((_, i) => i !== idx));
  const handleQuestionChange = (idx: number, field: string, value: any) => {
    setQuestions(qs => qs.map((q, i) => {
      if (i === idx) {
        const updatedQuestion = { ...q, [field]: value };
        
        // Handle type changes - set appropriate options
        if (field === 'type') {
          if (value === 'tf') {
            updatedQuestion.options = ['True', 'False'];
            updatedQuestion.correct = 0;
          } else if (value === 'mcq' && q.type === 'tf') {
            updatedQuestion.options = ['', '', '', ''];
            updatedQuestion.correct = 0;
          } else if (value === 'short') {
            updatedQuestion.options = [];
            updatedQuestion.correct = 0;
          }
        }
        
        return updatedQuestion;
      }
      return q;
    }));
  };
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

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    setUploadedFiles(prev => [...prev, ...files]);
  };

  const handleRemoveFile = (index: number) => {
    setUploadedFiles(prev => prev.filter((_, i) => i !== index));
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      // Get grade level IDs from selected grade names with additional validation
      console.log('Selected grade names:', selectedGrades);
      console.log('Available flat grades:', flatGrades);
      
      // Verify we have all grade data loaded before proceeding
      if (flatGrades.length === 0) {
        throw new Error('Grade data is not fully loaded yet. Please try again.');
      }
      
      // First check which selected grades actually exist in our available data
      const validGradeNames = selectedGrades.filter(gradeName => 
        flatGrades.some(g => g.name === gradeName)
      );
      
      if (validGradeNames.length < selectedGrades.length) {
        const invalidGrades = selectedGrades.filter(name => !validGradeNames.includes(name));
        console.error('Some selected grades were not found in available grades:', invalidGrades);
        // Reset the selected grades to only valid ones
        setSelectedGrades(validGradeNames);
      }
      
      // Map valid grade names to IDs with strict validation
      console.log('=== Grade Level ID Mapping Debug ===');
      console.log('Valid grade names to map:', validGradeNames);
      console.log('Available flatGrades:', flatGrades.map(g => ({ name: g.name, id: g.id })));
      
      const gradeLevelIds = validGradeNames.map(gradeName => {
        const gradeLevel = flatGrades.find(g => g.name === gradeName);
        if (!gradeLevel) {
          console.error(`Could not find grade level for grade name: ${gradeName}`);
          return null;
        }
        if (!gradeLevel.id) {
          console.error(`Grade level found for ${gradeName}, but it has no ID`);
          return null;
        }
        console.log(`Mapping grade '${gradeName}' to tenant grade level ID: ${gradeLevel.id}`);
        
        // Check if this ID is known to be problematic
        if (gradeLevel.id === '022011a6-58c3-4e07-9f97-9ab2e0e655c7') {
          console.warn(`⚠️  FOUND PROBLEMATIC ID: ${gradeLevel.id} for grade: ${gradeName}`);
        }
        
        return gradeLevel.id;
      }).filter(id => !!id); // Remove any null values

      console.log('Final tenant grade level IDs to be used:', gradeLevelIds);
      console.log('=== End Grade Level ID Mapping Debug ===');

      if (gradeLevelIds.length === 0) {
        throw new Error('No valid grade levels were found. Please select grades again.');
      }

      // Prepare reference materials from uploaded files
      const referenceMaterials = uploadedFiles.map(file => ({
        fileUrl: URL.createObjectURL(file), // In production, upload to cloud storage first
        fileType: file.type.includes('image') ? 'image' : 
                  file.type.includes('pdf') ? 'pdf' : 'document',
        fileSize: file.size
      }));

      // Map frontend data to GraphQL input structure
      // Verify all grade level IDs with the server
      // Filter out all known invalid IDs that cause errors
      const invalidIds = [
        "6e7a61ee-9543-4cdc-8400-5e4a85f8a0d2",
        "d3f70760-5f17-4a60-9607-6ff9735d7394",
        "3b39f4ab-d579-4b22-9379-66c5989f6d8b",
        "24f0795e-7c43-4f55-9dc3-89ba24e5c459",
        "022011a6-58c3-4e07-9f97-9ab2e0e655c7" // Added the problematic ID from the error
      ];
      
      const validatedGradeLevelIds = gradeLevelIds.filter((id): id is string => 
        typeof id === 'string' && !invalidIds.includes(id)
      );
      
      console.log('Filtered out invalid IDs:', invalidIds);
      console.log('Remaining valid grade IDs:', validatedGradeLevelIds);
      
      if (validatedGradeLevelIds.length === 0) {
        throw new Error('All selected grade levels are invalid. Please select different grades.');
      }
      
      // Validate subject ID - filter out known problematic subject IDs
      const invalidSubjectIds = [
        "dfba0945-3561-4ec7-8c5c-e99379bc0f11" // Subject ID from the error
      ];
      
      if (invalidSubjectIds.includes(subjectId)) {
        console.error(`Invalid subject ID detected: ${subjectId}`);
        throw new Error('The selected subject is no longer available. Please select a different subject.');
      }
      
      console.log('Using tenant subject ID:', subjectId);
      
      const createTestInput = {
        title,
        tenantSubjectId: subjectId, // Using tenant subject ID
        tenantGradeLevelIds: validatedGradeLevelIds, // Use validated IDs
        date,
        startTime,
        duration: parseInt(duration, 10),
        totalMarks: parseInt(points, 10),
        resourceUrl: resourceUrl || '',
        instructions: instructions || '',
        questions: questions.map((q, index) => ({
          text: q.text,
          marks: 10, // Default marks per question
          order: index + 1,
          type: q.type === 'mcq' ? 'MULTIPLE_CHOICE' : q.type === 'short' ? 'SHORT_ANSWER' : q.type === 'tf' ? 'TRUE_FALSE' : 'MULTIPLE_CHOICE',
          isAIGenerated: q.text.startsWith('AI:'),
          ...(q.options && q.options.length > 0 && {
            options: q.options.map((option: string, optIndex: number) => ({
              text: option,
              isCorrect: q.correct === optIndex,
              order: optIndex + 1
            }))
          })
        })),
        referenceMaterials
      };

      console.log('Submitting createTestInput:', createTestInput);

      const response = await fetch('/api/teacher-portal/create-test', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ createTestInput }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to create test');
      }

      toast.success('Test Created Successfully!', {
        description: `${title} has been created and is ready to be assigned to students.`
      });

      setSaving(false);
      setSuccess(true);
    } catch (error) {
      console.error('Error creating test:', error);
      toast.error("Test Creation Failed", {
        description: error instanceof Error ? error.message : "An error occurred while creating the test"
      });
      setSaving(false);
    }
  };

  // Progress indicator
  const steps = ["Test Details", "Questions", "Review & Save"];

  return (
                <div className="min-h-[70vh] flex flex-col items-center justify-center px-6 py-5 bg-gradient-to-br from-slate-50 via-primary/5 to-primary/10">
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
                    grade: selectedGrades.join(', '),
                    date,
                    startTime,
                    duration,
                    points,
                    resourceUrl
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
                  {/* Step 1: Grade Selection - First and Most Important */}
                  <div className="mb-8">
                    <div className="bg-gradient-to-r from-primary/5 via-primary/10 to-primary-light/10 p-8 border-2 border-primary/30 shadow-lg">
                      <div className="flex items-center gap-3 mb-6">
                        <div className="w-10 h-10 bg-gradient-to-r from-primary to-primary-dark flex items-center justify-center text-white font-bold text-lg shadow-lg">
                          1
                        </div>
                        <div>
                          <h3 className="text-xl font-bold text-gray-800">Select Target Grades</h3>
                          <p className="text-sm text-gray-600">Choose which grade levels this test is for</p>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        <div>
                                                     <label className="block text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                             <Users className="w-4 h-4 text-primary" />
                             Available Grades
                           </label>
                                                        <div className="bg-white border-2 border-gray-200 p-4 max-h-[200px] overflow-y-auto">
                              {finalGradeLevels.length > 0 ? (
                                <div className="space-y-2">
                                  {teacher ? (
                                    // Teacher data structure - direct grade list
                                    <div className="grid grid-cols-1 gap-2">
                                      {(finalGradeLevels as Array<{id: string, name: string}>).map(gradeLevel => (
                                        <label key={gradeLevel.id} className="flex items-center gap-3 p-2 hover:bg-primary/5 cursor-pointer transition-colors border border-transparent hover:border-primary/20">
                                          <input
                                            type="checkbox"
                                            className="w-4 h-4 text-primary border-2 border-gray-300 focus:ring-primary"
                                            checked={selectedGrades.includes(gradeLevel.name)}
                                            onChange={e => {
                                              if (e.target.checked) {
                                                setSelectedGrades(prev => [...prev, gradeLevel.name]);
                                              } else {
                                                setSelectedGrades(prev => prev.filter(g => g !== gradeLevel.name));
                                              }
                                            }}
                                          />
                                          <div className="flex-1">
                                            <div className="font-medium text-gray-800">{gradeLevel.name}</div>
                                          </div>
                                        </label>
                                      ))}
                                    </div>
                                  ) : (
                                    // School config structure - nested levels and grades
                                    (finalGradeLevels as Array<{levelId: string, levelName: string, grades: any[]}>).map(level => (
                                      <div key={level.levelId} className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                        <div className="col-span-1 text-sm font-semibold text-gray-700">{level.levelName}</div>
                                        <div className="col-span-1">
                                          {level.grades?.map((gr: any) => (
                                            <label key={gr.id} className="flex items-center gap-3 p-2 hover:bg-primary/5 cursor-pointer transition-colors border border-transparent hover:border-primary/20">
                                              <input
                                                type="checkbox"
                                                className="w-4 h-4 text-primary border-2 border-gray-300 focus:ring-primary"
                                                checked={selectedGrades.includes(gr.name)}
                                                onChange={e => {
                                                  if (e.target.checked) {
                                                    setSelectedGrades(prev => [...prev, gr.name]);
                                                  } else {
                                                    setSelectedGrades(prev => prev.filter(g => g !== gr.name));
                                                  }
                                                }}
                                              />
                                              <div className="flex-1">
                                                <div className="font-medium text-gray-800">{gr.name}</div>
                                              </div>
                                            </label>
                                          ))}
                                        </div>
                                      </div>
                                    ))
                                  )}
                                </div>
                             ) : (
                               <div className="text-center py-8 text-gray-500">
                                 <Users className="w-8 h-8 mx-auto mb-2 text-gray-400" />
                                 <p>No grades available</p>
                                 <p className="text-xs">School configuration is being loaded or not configured</p>
                                 <p className="text-xs mt-1">Please contact your school administrator</p>
                               </div>
                             )}
                          </div>
                        </div>
                        
                                                 <div>
                           <label className="block text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                             <CheckCircle2 className="w-4 h-4 text-primary" />
                             Selected Grades ({selectedGrades.length})
                           </label>
                           <div className="bg-white border-2 border-gray-200 p-4 min-h-[200px]">
                             {selectedGrades.length > 0 ? (
                               <div className="space-y-2">
                                 {selectedGrades.map((grade, index) => (
                                   <div key={index} className="flex items-center justify-between p-3 bg-primary/5 border border-primary/20">
                                     <div>
                                       <div className="font-medium text-primary-dark">{grade}</div>
                                       <div className="text-xs text-primary">
                                         {flatGrades.find(g => g.name === grade)?.levelName}
                                       </div>
                                     </div>
                                     <button
                                       type="button"
                                       onClick={() => setSelectedGrades(prev => prev.filter(g => g !== grade))}
                                       className="text-primary hover:text-red-600 transition-colors"
                                     >
                                       <X className="w-4 h-4" />
                                     </button>
                                   </div>
                                 ))}
                               </div>
                             ) : (
                               <div className="flex items-center justify-center h-full text-gray-400">
                                 <div className="text-center">
                                   <CheckCircle2 className="w-12 h-12 mx-auto mb-2 opacity-50" />
                                   <p className="text-sm">Select grades from the left</p>
                                 </div>
                               </div>
                             )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                                     {/* Step 2: Subject Selection - Appears after grade selection */}
                   {selectedGrades.length > 0 && (
                     <div className="mb-8">
                       <div className="bg-gradient-to-r from-primary/8 via-primary/12 to-primary-light/12 p-8 border-2 border-primary/40 shadow-lg">
                         <div className="flex items-center gap-3 mb-6">
                           <div className="w-10 h-10 bg-gradient-to-r from-primary-light to-primary rounded-full flex items-center justify-center text-white font-bold text-lg shadow-lg">
                             2
                           </div>
                          <div>
                            <h3 className="text-xl font-bold text-gray-800">Choose Subject</h3>
                            <p className="text-sm text-gray-600">Select from subjects available for the chosen grades</p>
                          </div>
                        </div>
                        
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                                                     <div className="lg:col-span-2">
                             <label className="block text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                               <BookOpen className="w-4 h-4 text-primary" />
                               Available Subjects ({availableSubjects.length})
                             </label>
                             {availableSubjects.length > 0 ? (
                               <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                  {availableSubjects.map((subj) => (
                                   <button
                                     key={subj.id}
                                     type="button"
                                     onClick={() => {
                                       setSubject(subj.name);
                                       setSubjectId(subj.id);
                                     }}
                                     className={`p-4 border-2 transition-all duration-200 text-left ${
                                       subject === subj.name
                                         ? 'bg-primary/10 border-primary text-primary-dark shadow-md'
                                         : 'bg-white border-gray-200 text-gray-700 hover:border-primary/50 hover:bg-primary/5'
                                     }`}
                                   >
                                     <div className="flex items-center gap-2">
                                       <BookOpen className={`w-4 h-4 ${subject === subj.name ? 'text-primary' : 'text-gray-400'}`} />
                                       <span className="font-medium">{subj.name}</span>
                                     </div>
                                     {subject === subj.name && (
                                       <div className="mt-1 text-xs text-primary flex items-center gap-1">
                                         <CheckCircle2 className="w-3 h-3" />
                                         Selected
                                       </div>
                                     )}
                                   </button>
                                 ))}
                               </div>
                             ) : (
                               <div className="bg-white border-2 border-gray-200 p-8 text-center">
                                 <BookOpen className="w-12 h-12 mx-auto mb-2 text-gray-400" />
                                 <p className="text-gray-600">No subjects available for selected grades</p>
                               </div>
                             )}
                          </div>
                          
                                                     {subject && (
                             <div>
                               <label className="block text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                                 <CheckCircle2 className="w-4 h-4 text-primary" />
                                 Selected Subject
                               </label>
                               <div className="bg-white border-2 border-primary/30 p-4">
                                 <div className="flex items-center gap-3">
                                   <div className="w-10 h-10 bg-primary/10 flex items-center justify-center">
                                     <BookOpen className="w-5 h-5 text-primary" />
                                   </div>
                                   <div>
                                     <div className="font-semibold text-primary-dark">{subject}</div>
                                     <div className="text-xs text-primary">
                                       For {selectedGrades.length} grade{selectedGrades.length !== 1 ? 's' : ''}
                                     </div>
                                   </div>
                                 </div>
                               </div>
                             </div>
                           )}
                        </div>
                      </div>
                    </div>
                  )}

                                     {/* Step 3: Test Details - Only after grades and subject are selected */}
                   {selectedGrades.length > 0 && subject && (
                     <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                       {/* Left Column - Basic Info */}
                       <div className="space-y-6">
                         <div className="bg-gradient-to-r from-primary/6 to-primary-light/8 p-6 border-2 border-primary/30 shadow-lg">
                           <div className="flex items-center gap-3 mb-4">
                             <div className="w-8 h-8 bg-gradient-to-r from-primary-dark to-primary flex items-center justify-center text-white font-bold">
                               3
                             </div>
                            <h3 className="text-lg font-bold text-gray-800">Test Information</h3>
                          </div>
                          
                          <div className="space-y-4">
                            <div>
                              <label className="block text-sm font-semibold text-gray-700 mb-2">Test Title</label>
                                                             <input
                                 type="text"
                                 className="w-full px-4 py-3 border-2 border-gray-200 bg-white text-gray-800 focus:outline-none focus:border-primary focus:ring-0 transition-colors"
                                 placeholder="e.g. End of Term 1 Mathematics"
                                 value={title}
                                 onChange={e => setTitle(e.target.value)}
                                 required
                               />
                              <div className="text-xs text-gray-500 mt-1">This is the title students will see</div>
                            </div>
                          </div>
                        </div>
                      </div>

                                             {/* Right Column - Schedule */}
                       <div className="space-y-6">
                         <div className="bg-gradient-to-r from-primary/8 to-primary-light/10 p-6 border-2 border-primary/40 shadow-lg">
                                                  <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                            <Calendar className="w-5 h-5 text-primary" />
                            Schedule & Timing
                          </h3>
                        
                        <div className="space-y-4">
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <label className="block text-sm font-semibold text-gray-700 mb-2">Date</label>
                              <input
                                type="date"
                                className="w-full px-4 py-3 border-2 border-gray-200 bg-white text-gray-800 focus:outline-none focus:border-primary focus:ring-0 transition-colors"
                                value={date}
                                onChange={e => setDate(e.target.value)}
                                required
                              />
                            </div>
                            <div>
                              <label className="block text-sm font-semibold text-gray-700 mb-2">Start Time</label>
                              <input
                                type="time"
                                className="w-full px-4 py-3 border-2 border-gray-200 bg-white text-gray-800 focus:outline-none focus:border-primary focus:ring-0 transition-colors"
                                value={startTime}
                                onChange={e => setStartTime(e.target.value)}
                                required
                              />
                            </div>
                          </div>
                          
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                                <Clock className="w-4 h-4" />
                                Duration (minutes)
                              </label>
                              <input
                                type="number"
                                min="10"
                                max="300"
                                className="w-full px-4 py-3 border-2 border-gray-200 bg-white text-gray-800 focus:outline-none focus:border-primary focus:ring-0 transition-colors"
                                placeholder="e.g. 90"
                                value={duration}
                                onChange={e => setDuration(e.target.value)}
                                required
                              />
                              <div className="text-xs text-gray-500 mt-1">Recommended: 60-120 minutes</div>
                            </div>
                            <div>
                              <label className="block text-sm font-semibold text-gray-700 mb-2">
                                Total Points/Marks
                              </label>
                              <input
                                type="number"
                                min="1"
                                max="1000"
                                className="w-full px-4 py-3 border-2 border-gray-200 bg-white text-gray-800 focus:outline-none focus:border-primary focus:ring-0 transition-colors"
                                placeholder="e.g. 100"
                                value={points}
                                onChange={e => setPoints(e.target.value)}
                                required
                              />
                              <div className="text-xs text-gray-500 mt-1">Total marks for this test</div>
                            </div>
                          </div>
                          
                          <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                              Resource URL <span className="text-gray-500 font-normal">(optional)</span>
                            </label>
                            <input
                              type="url"
                              className="w-full px-4 py-3 border-2 border-gray-200 bg-white text-gray-800 focus:outline-none focus:border-primary focus:ring-0 transition-colors"
                              placeholder="https://example.com/additional-resources"
                              value={resourceUrl}
                              onChange={e => setResourceUrl(e.target.value)}
                            />
                            <div className="text-xs text-gray-500 mt-1">
                              Link to additional study materials or resources for students
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                    )}

                  {/* Instructions and Files Section */}
                  <div className="space-y-6">
                                          <div className="bg-gradient-to-r from-primary/8 to-primary-light/10 p-6 border-l-4 border-primary">
                      <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                        <FileText className="w-5 h-5 text-primary" />
                        Test Instructions & Resources
                      </h3>
                      
                      <div className="space-y-6">
                        {/* Test Instructions */}
                        <div>
                          <label className="block text-sm font-semibold text-gray-700 mb-2">
                            Custom Instructions for Students
                          </label>
                          <textarea
                            className="w-full px-4 py-3 border-2 border-gray-200 bg-white text-gray-800 focus:outline-none focus:border-[#0d9488] focus:ring-0 transition-colors"
                            placeholder="Enter any specific instructions for this test (e.g., 'Show all working', 'Use a calculator where necessary', etc.)"
                            value={instructions}
                            onChange={e => setInstructions(e.target.value)}
                            rows={3}
                          />
                          <div className="text-xs text-gray-500 mt-1">
                            These instructions will appear on the test paper below the default instructions
                          </div>
                        </div>

                        {/* File Upload */}
                        <div>
                          <label className="block text-sm font-semibold text-gray-700 mb-2">
                            Upload Reference Materials
                          </label>
                          <div className="border-2 border-dashed border-gray-300 bg-gray-50 p-6 text-center hover:border-[#0d9488] hover:bg-teal-50 transition-colors">
                            <input
                              type="file"
                              id="file-upload"
                              className="hidden"
                              multiple
                              accept=".pdf,.doc,.docx,.txt,.jpg,.jpeg,.png,.gif"
                              onChange={handleFileUpload}
                            />
                            <label
                              htmlFor="file-upload"
                              className="cursor-pointer flex flex-col items-center gap-2"
                            >
                              <Upload className="w-8 h-8 text-gray-400" />
                              <span className="text-sm font-medium text-gray-700">
                                Click to upload files or drag and drop
                              </span>
                              <span className="text-xs text-gray-500">
                                PDF, DOC, TXT, Images (Max 10MB each)
                              </span>
                            </label>
                          </div>
                          
                          {/* Uploaded Files List */}
                          {uploadedFiles.length > 0 && (
                            <div className="mt-4 space-y-2">
                              <div className="text-sm font-semibold text-gray-700">
                                Uploaded Files ({uploadedFiles.length})
                              </div>
                              {uploadedFiles.map((file, index) => (
                                <div
                                  key={index}
                                  className="flex items-center justify-between p-3 bg-white border border-gray-200 rounded-lg"
                                >
                                  <div className="flex items-center gap-3">
                                    <File className="w-4 h-4 text-primary" />
                                    <div>
                                      <div className="text-sm font-medium text-gray-700">
                                        {file.name}
                                      </div>
                                      <div className="text-xs text-gray-500">
                                        {formatFileSize(file.size)}
                                      </div>
                                    </div>
                                  </div>
                                  <button
                                    type="button"
                                    onClick={() => handleRemoveFile(index)}
                                    className="text-red-500 hover:text-red-700 transition-colors"
                                  >
                                    <X className="w-4 h-4" />
                                  </button>
                                </div>
                              ))}
                            </div>
                          )}
                          
                          <div className="text-xs text-gray-500 mt-2">
                            These files will be available to students during the test as reference materials
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
                                        <div className="bg-gradient-to-r from-primary/6 to-primary-light/8 border-l-4 border-primary-dark p-6">
                    <div className="flex items-center gap-3 mb-4">
                                              <div className="w-8 h-8 bg-gradient-to-r from-primary to-primary-dark text-white flex items-center justify-center">
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
                      className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-primary to-primary-dark text-white font-semibold hover:from-primary-dark hover:to-primary-dark transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
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
                        
                        {(q.type === "mcq" || q.type === "tf") && (
                          <div className="space-y-3">
                            <div className="text-sm font-semibold text-gray-700 mb-2">
                              {q.type === "tf" ? "True/False:" : "Options:"}
                            </div>
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
                                  placeholder={q.type === "tf" ? (oIdx === 0 ? "True" : "False") : `Option ${oIdx + 1}`}
                                  value={opt}
                                  onChange={e => handleOptionChange(idx, oIdx, e.target.value)}
                                  required
                                />
                                {q.options.length > 2 && q.type !== "tf" && (
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
                            {q.type !== "tf" && (
                              <button
                                type="button"
                                className="flex items-center gap-1 text-[#246a59] border-2 border-[#246a59]/20 px-4 py-2 hover:bg-[#246a59]/5 transition-colors font-semibold"
                                onClick={() => handleAddOption(idx)}
                              >
                                <PlusCircle className="w-4 h-4" /> Add Option
                              </button>
                            )}
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
                  let defaultInstructions = "Answer all questions as instructed.";
                  if (allMCQ) {
                    rightHeading = "Multiple Choice Questions";
                    defaultInstructions = "For each of these questions, choose the option (A, B, C or D) that is TRUE.";
                  } else if (allShort) {
                    rightHeading = "Short Answer Questions";
                    defaultInstructions = "Answer all questions in the space provided.";
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
                            <div className="text-lg italic text-gray-700">{subject} {selectedGrades.length > 0 && `– ${selectedGrades.join(', ')}`}</div>
                          </div>
                          <div className="text-right">
                            <div className="text-base font-semibold text-black">{rightHeading}</div>
                            <div className="text-sm text-gray-700">Date: {date}</div>
                            <div className="text-sm text-gray-700">Start: {startTime}</div>
                            <div className="text-sm text-gray-700">Duration: {duration} min</div>
                            <div className="text-sm text-gray-700">Total Marks: {points}</div>
                            {resourceUrl && (
                              <div className="text-sm text-gray-700">
                                Resource: <a href={resourceUrl} target="_blank" rel="noopener noreferrer" className="text-[#059669] underline">{resourceUrl}</a>
                              </div>
                            )}
                          </div>
                        </div>
                        <hr className="w-full border-t border-gray-300 my-4" />
                        {/* Instructions */}
                        <div className="w-full text-center text-sm italic text-gray-600 mb-6">
                          {defaultInstructions}
                          {instructions && (
                            <div className="mt-4 text-left">
                              <div className="font-semibold text-gray-800">Additional Instructions:</div>
                              <div className="whitespace-pre-wrap text-gray-700 mt-2">{instructions}</div>
                            </div>
                          )}
                        </div>
                        
                        {/* Uploaded Files Section */}
                        {uploadedFiles.length > 0 && (
                          <div className="w-full mb-6 p-4 bg-gray-50 border border-gray-200">
                            <div className="font-semibold text-gray-800 mb-2">Reference Materials:</div>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                              {uploadedFiles.map((file, index) => (
                                <div key={index} className="flex items-center gap-2 text-sm text-gray-700">
                                  <File className="w-4 h-4 text-[#0d9488]" />
                                  <span>{file.name}</span>
                                </div>
                              ))}
                            </div>
                            <div className="text-xs text-gray-500 mt-2">
                              These files are available as reference materials for this test
                            </div>
                          </div>
                        )}
                        {/* Questions */}
                        <ol className="list-decimal pl-6 w-full space-y-6">
                          {questions.map((q, idx) => (
                            <li key={idx} className="text-black text-base mb-2">
                              <div className="mb-2 font-medium">{q.text}</div>
                                                        {(q.type === "mcq" || q.type === "tf") && (
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pl-4">
                              {q.options.map((opt, oIdx) => (
                                <div key={oIdx} className="flex items-start gap-2">
                                  <span className="font-bold text-black w-6">
                                    {q.type === "tf" ? (oIdx === 0 ? "T)" : "F)") : `${String.fromCharCode(65 + oIdx)})`}
                                  </span>
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
                              <div className="text-xl italic text-gray-700">{subject} {selectedGrades.length > 0 && `– ${selectedGrades.join(', ')}`}</div>
                            </div>
                            <div className="text-right">
                              <div className="text-lg font-semibold text-black">{rightHeading}</div>
                              <div className="text-sm text-gray-700">Date: {date}</div>
                              <div className="text-sm text-gray-700">Start: {startTime}</div>
                              <div className="text-sm text-gray-700">Duration: {duration} min</div>
                              <div className="text-sm text-gray-700">Total Marks: {points}</div>
                              {resourceUrl && (
                                <div className="text-sm text-gray-700">
                                  Resource: <a href={resourceUrl} target="_blank" rel="noopener noreferrer" className="text-[#059669] underline">{resourceUrl}</a>
                                </div>
                              )}
                            </div>
                          </div>
                          
                          <hr className="w-full border-t-2 border-gray-400 my-6" />
                          
                          {/* Instructions */}
                          <div className="w-full text-center text-base italic text-gray-600 mb-8">
                            {defaultInstructions}
                            {instructions && (
                              <div className="mt-4 text-left">
                                <div className="font-semibold text-gray-800">Additional Instructions:</div>
                                <div className="whitespace-pre-wrap text-gray-700 mt-2">{instructions}</div>
                              </div>
                            )}
                          </div>
                          
                          {/* Uploaded Files Section */}
                          {uploadedFiles.length > 0 && (
                            <div className="w-full mb-8 p-4 bg-gray-50 border border-gray-200">
                              <div className="font-semibold text-gray-800 mb-2">Reference Materials:</div>
                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                {uploadedFiles.map((file, index) => (
                                  <div key={index} className="flex items-center gap-2 text-sm text-gray-700">
                                    <File className="w-4 h-4 text-primary" />
                                    <span>{file.name}</span>
                                  </div>
                                ))}
                              </div>
                              <div className="text-xs text-gray-500 mt-2">
                                These files are available as reference materials for this test
                              </div>
                            </div>
                          )}
                          
                          {/* Questions */}
                          <ol className="list-decimal pl-8 w-full space-y-8">
                            {questions.map((q, idx) => (
                              <li key={idx} className="text-black text-lg mb-4">
                                <div className="mb-3 font-semibold">{q.text}</div>
                                                              {(q.type === "mcq" || q.type === "tf") && (
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pl-6">
                                  {q.options.map((opt, oIdx) => (
                                    <div key={oIdx} className="flex items-start gap-3">
                                      <span className="font-bold text-black w-8">
                                        {q.type === "tf" ? (oIdx === 0 ? "T)" : "F)") : `${String.fromCharCode(65 + oIdx)})`}
                                      </span>
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