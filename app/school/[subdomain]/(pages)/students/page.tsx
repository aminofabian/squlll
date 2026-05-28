"use client";

import React, { useState, useMemo, useCallback, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { CreateStudentDrawer } from "./components/CreateStudentDrawer";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Filter,
  User,
  Info,
  CalendarDays,
  School,
  Search,
  ArrowUp,
  ArrowDown,
  Check,
  SortAsc,
  SortDesc,
  ListFilter,
  Clock,
  Calendar,
  Heart,
  Home,
  Mail,
  MapPin,
  Phone,
  X,
  BookText,
  Layers,
  GraduationCap,
  Receipt,
  Crown,
  GraduationCap as Gradebook,
  Grid2x2PlusIcon,
  BookKeyIcon,
  BookOpen,
  Loader2,
  Download,
  Printer,
  ChevronDown,
  ChevronRight,
  FileText,
  BarChart3,
  PanelLeftClose,
  PanelLeftOpen,
} from "lucide-react";

// Import hooks and types for real data
import { useStudents, useStudentsFromStore } from "@/lib/hooks/useStudents";
import { GraphQLStudent } from "@/types/student";
import SchoolReportCard from "./components/ReportCard";
import { useSchoolConfig } from "@/lib/hooks/useSchoolConfig";
import { useSchoolConfigStore } from "@/lib/stores/useSchoolConfigStore";
import AllGradesStudentsTable from "./components/AllGradesStudentsTable";
import { StudentsStats } from "./components/StudentsStats";
import { StudentDetailsView } from "./components/StudentDetailsView";
import { GradeFilter } from "./components/GradeFilter";
import { StudentSearchSidebar } from "./components/StudentSearchSidebar";
import { StudentCard } from "./components/StudentCard";

// Import types and utilities
import { Student, EducationLevel, Grade } from "./types/studentTypes";
import {
  getLevelIcon,
  getLevelColor,
  formatCurrency,
  getStatusColor,
  getTrendIcon,
  getEducationLevel,
  getLevelCategory,
  convertGradeToForm,
  getGradeNumber,
} from "./utils/studentUtils";

export default function StudentsPage() {
  // State for mobile sidebar visibility and student selection
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [selectedStudentId, setSelectedStudentId] = useState<string | null>(
    null,
  );
  const [sortField, setSortField] = useState("name");
  const [sortDirection, setSortDirection] = useState("asc");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedClass, setSelectedClass] = useState("");
  const [selectedGrade, setSelectedGrade] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("");
  const [selectedGradeId, setSelectedGradeId] = useState<string>("all");
  const [expandedDocuments, setExpandedDocuments] = useState<Set<string>>(
    new Set(),
  );
  const [selectedTemplate, setSelectedTemplate] = useState<
    "modern" | "classic" | "compact" | "uganda-classic"
  >("modern");
  const [displayedStudentsCount, setDisplayedStudentsCount] = useState(10);
  const [showStats, setShowStats] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  // Fetch real data from the store
  const {
    students: graphqlStudents,
    isLoading,
    error,
  } = useStudentsFromStore();
  const { refetch } = useStudents();

  // Fetch school configuration
  const { data: schoolConfig } = useSchoolConfig();
  const { config, getGradeById, getAllGradeLevels } = useSchoolConfigStore();

  // Get all available grades from school config
  const allGradeLevels = getAllGradeLevels();

  // Add fallback grades if they're missing from the configuration
  const enhancedGradeLevels = useMemo(() => {
    const levels = [...allGradeLevels];

    // Check if we have Senior Secondary level but missing F4, F5, F6
    let seniorSecondaryLevel = levels.find((level) =>
      level.levelName.toLowerCase().includes("senior secondary"),
    );

    // If no Senior Secondary level exists, skip fallback creation
    if (!seniorSecondaryLevel) {
      return levels;
    }

    if (seniorSecondaryLevel) {
      const existingGradeNames = seniorSecondaryLevel.grades.map((g) =>
        g.name.toLowerCase(),
      );
      const missingGrades = [];

      // Check for missing Form 4, 5, 6 (or Grade 10, 11, 12)
      const hasGrade10 = existingGradeNames.some(
        (name) =>
          name.includes("grade 10") ||
          name.includes("form 4") ||
          name.includes("f4"),
      );
      const hasGrade11 = existingGradeNames.some(
        (name) =>
          name.includes("grade 11") ||
          name.includes("form 5") ||
          name.includes("f5"),
      );
      const hasGrade12 = existingGradeNames.some(
        (name) =>
          name.includes("grade 12") ||
          name.includes("form 6") ||
          name.includes("f6"),
      );

      if (!hasGrade10) {
        missingGrades.push({
          id: "fallback-f4",
          name: "Grade 10",
          age: 17,
          streams: [],
        });
      }

      if (!hasGrade11) {
        missingGrades.push({
          id: "fallback-f5",
          name: "Grade 11",
          age: 18,
          streams: [],
        });
      }

      if (!hasGrade12) {
        missingGrades.push({
          id: "fallback-f6",
          name: "Grade 12",
          age: 19,
          streams: [],
        });
      }

      if (missingGrades.length > 0) {
        seniorSecondaryLevel.grades = [
          ...seniorSecondaryLevel.grades,
          ...missingGrades,
        ];
      }
    }

    return levels;
  }, [allGradeLevels]);

  // Transform GraphQL data to match our Student type
  const students: Student[] = useMemo(() => {
    // Filter out any invalid student data
    const validStudents = graphqlStudents.filter(
      (student) => student && student.id && student.admission_number,
    );

    return validStudents.map((graphqlStudent: GraphQLStudent) => {
      const generateNameFromEmail = (email: string) => {
        const username = email.split("@")[0];
        return username
          .replace(/[0-9]/g, "") // Remove numbers
          .replace(/([A-Z])/g, " $1") // Add spaces before capitals
          .replace(/^./, (str) => str.toUpperCase()) // Capitalize first letter
          .trim();
      };

      const studentName = graphqlStudent.user?.name
        ? graphqlStudent.user.name
        : graphqlStudent.user?.email
          ? generateNameFromEmail(graphqlStudent.user.email)
          : `Student ${graphqlStudent.admission_number}`;

      const guardianName = studentName.split(" ")[0] || "Guardian";

      // Get grade name from nested gradeLevel object
      const gradeName =
        typeof graphqlStudent.grade === "object"
          ? graphqlStudent.grade?.gradeLevel?.name || "Unknown Grade"
          : graphqlStudent.grade || "Unknown Grade";

      const convertedGradeName = convertGradeToForm(gradeName);

      return {
        id: graphqlStudent.id,
        name: studentName,
        admissionNumber: graphqlStudent.admission_number,
        photo: undefined,
        gender: (graphqlStudent.gender as "male" | "female") || "male",
        class: convertedGradeName,
        stream: graphqlStudent.streamId || "-",
        grade: convertedGradeName,
        age: null as any,
        admissionDate: graphqlStudent.createdAt || "",
        status: graphqlStudent.isActive ? "active" : ("inactive" as const),
        contacts: {
          primaryGuardian: `Guardian of ${guardianName}`,
          guardianPhone: graphqlStudent.phone || "N/A",
          guardianEmail: graphqlStudent.user?.email || "",
          homeAddress: "",
        },
        academicDetails: {
          averageGrade: "N/A",
          classRank: 0,
          streamRank: 0,
          yearRank: 0,
          kcpeScore: 0,
          kcsePrediction: "N/A",
        },
        feeStatus: {
          currentBalance: graphqlStudent.feesOwed || 0,
          lastPaymentDate: "",
          lastPaymentAmount: graphqlStudent.totalFeesPaid || 0,
          scholarshipPercentage: 0,
        },
        attendance: {
          rate: "N/A",
          absentDays: 0,
          lateDays: 0,
          trend: "stable" as const,
        },
        healthInfo: {
          bloodGroup: "",
          knownConditions: [],
          emergencyContact: "",
          nhifNumber: "",
        },
        extraCurricular: {
          clubs: [],
          sports: [],
          achievements: [],
          leadership: [],
        },
      };
    });
  }, [graphqlStudents, getGradeById]);

  // Filter and sort students based on selected criteria
  const filteredAndSortedStudents = useMemo(() => {
    let result = [...students];

    // Apply search filter
    if (searchTerm) {
      const lowercasedSearch = searchTerm.toLowerCase();
      result = result.filter(
        (student) =>
          student.name.toLowerCase().includes(lowercasedSearch) ||
          student.admissionNumber.toLowerCase().includes(lowercasedSearch),
      );
    }

    // Apply class filter
    if (selectedClass) {
      result = result.filter((student) => student.class === selectedClass);
    }

    // Apply grade filter
    if (selectedGradeId && selectedGradeId !== "all") {
      // Find the grade name from the selected grade id using school config
      const selectedGradeInfo = getGradeById(selectedGradeId);
      if (selectedGradeInfo) {
        const selectedGradeName = selectedGradeInfo.grade.name;

        const convertedSelectedGrade = convertGradeToForm(selectedGradeName);

        // Filter students based on converted grade names
        result = result.filter((student) => {
          const studentGrade = student.grade?.toLowerCase();
          const studentClass = student.class?.toLowerCase();
          const selectedGrade = convertedSelectedGrade.toLowerCase();

          // Check for exact match with converted grade name
          if (
            studentGrade === selectedGrade ||
            studentClass === selectedGrade
          ) {
            return true;
          }

          // Check if student grade/class contains the selected grade
          if (
            studentGrade?.includes(selectedGrade) ||
            studentClass?.includes(selectedGrade)
          ) {
            return true;
          }

          // Handle Form matching (e.g., "Form 1" matches "form 1", "form1")
          const formMatch = selectedGrade.match(/form\s*(\d+)/i);
          if (formMatch) {
            const formNumber = formMatch[1];
            if (
              studentGrade?.includes(`form ${formNumber}`) ||
              studentGrade?.includes(`form${formNumber}`) ||
              studentClass?.includes(`form ${formNumber}`) ||
              studentClass?.includes(`form${formNumber}`)
            ) {
              return true;
            }
          }

          return false;
        });
      }
    }

    // Apply status filter
    if (selectedStatus) {
      result = result.filter((student) => student.status === selectedStatus);
    }

    // Apply sorting
    result.sort((a, b) => {
      let valA: any;
      let valB: any;

      // Determine which field to sort by
      switch (sortField) {
        case "name":
          valA = a.name;
          valB = b.name;
          break;
        case "admissionNumber":
          valA = a.admissionNumber;
          valB = b.admissionNumber;
          break;
        case "class":
          valA = a.class;
          valB = b.class;
          break;
        case "grade":
          valA = getGradeNumber(a.grade);
          valB = getGradeNumber(b.grade);
          break;
        case "age":
          valA = a.age;
          valB = b.age;
          break;
        case "academicRank":
          valA = a.academicDetails?.classRank || 999;
          valB = b.academicDetails?.classRank || 999;
          break;
        case "feeBalance":
          valA = a.feeStatus?.currentBalance || 0;
          valB = b.feeStatus?.currentBalance || 0;
          break;
        default:
          valA = a.name;
          valB = b.name;
      }

      // Determine sort direction
      return sortDirection === "asc"
        ? valA > valB
          ? 1
          : valA < valB
            ? -1
            : 0
        : valA < valB
          ? 1
          : valA > valB
            ? -1
            : 0;
    });

    return result;
  }, [
    students,
    searchTerm,
    selectedClass,
    selectedGradeId,
    selectedStatus,
    sortField,
    sortDirection,
  ]);

  // Get all available classes and grades for filters
  const availableClasses = [
    ...new Set(students.map((student) => student.class)),
  ];
  const availableGrades = [
    ...new Set(students.map((student) => student.grade)),
  ].sort((a, b) => parseInt(a) - parseInt(b));

  // Add a mounted state to prevent hydration issues
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Don't render until mounted to prevent hydration issues
  if (!isMounted) {
    return (
      <div className="flex h-full">
        <div className="hidden md:flex flex-col w-96 border-r overflow-y-auto p-6 shrink-0 bg-white">
          <div className="mb-6">
            <h2 className="text-2xl font-bold mb-1">Search Students</h2>
            <p className="text-sm text-muted-foreground">
              Find students by name
            </p>
          </div>
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium mb-2">
                Student Name
              </label>
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  type="text"
                  placeholder="Search by name..."
                  className="pl-9 h-12 text-base"
                  disabled
                />
              </div>
            </div>
          </div>
          <div className="mt-8">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-medium">
                Students <span className="text-muted-foreground">(0)</span>
              </h3>
            </div>
            <div className="space-y-2">
              <div className="text-center py-8 text-muted-foreground">
                Loading students...
              </div>
            </div>
          </div>
        </div>
        <div className="flex-1 overflow-auto p-8">
          <div className="flex justify-between items-center mb-6">
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-bold">Loading...</h1>
            </div>
          </div>
          <div className="bg-muted/30 rounded-lg p-8 text-center">
            <div className="flex justify-center mb-4">
              <Loader2 className="h-12 w-12 text-muted-foreground animate-spin" />
            </div>
            <h2 className="text-2xl font-medium mb-2">
              Loading student information
            </h2>
            <p className="text-muted-foreground max-w-md mx-auto">
              Please wait while we load the student data...
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-full">
      {/* Mobile sidebar overlay */}
      {isMobileSidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-30 md:hidden"
          onClick={() => setIsMobileSidebarOpen(false)}
        />
      )}

      {/* Search filter column - styled to match theme */}
      {!isSidebarCollapsed && (
        <StudentSearchSidebar
          searchTerm={searchTerm}
          onSearchChange={(value) => {
            setSearchTerm(value);
            setDisplayedStudentsCount(10);
          }}
          filteredStudents={filteredAndSortedStudents}
          selectedStudentId={selectedStudentId}
          onStudentSelect={setSelectedStudentId}
          displayedStudentsCount={displayedStudentsCount}
          onLoadMore={() =>
            setDisplayedStudentsCount((prev) =>
              Math.min(prev + 10, filteredAndSortedStudents.length),
            )
          }
          onClearFilters={() => {
            setSearchTerm("");
            setSelectedGradeId("all");
            setDisplayedStudentsCount(10);
          }}
          selectedGradeId={selectedGradeId}
          onCollapse={() => setIsSidebarCollapsed(true)}
        />
      )}

      {/* Main content column - Grade Filter and Student Details */}
      <div className="flex-1 overflow-auto p-8 transition-all duration-300 ease-in-out relative">
        {/* Floating toggle button when sidebar is collapsed */}
        {isSidebarCollapsed && (
          <div className="absolute top-6 left-6 z-10">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsSidebarCollapsed(false)}
              className="border-slate-200 bg-white/80 backdrop-blur-sm text-slate-600 hover:bg-white hover:text-slate-900 hover:border-slate-300 shadow-sm transition-all duration-200"
              title="Show search sidebar"
            >
              <PanelLeftOpen className="h-4 w-4" />
            </Button>
          </div>
        )}

        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold">Students</h1>
          </div>
          <div className="flex items-center gap-2">
            {/* Sidebar toggle button */}
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
              className="border-slate-200 bg-white text-slate-600 hover:bg-slate-50 hover:text-slate-900 hover:border-slate-300 transition-all duration-200"
              title={
                isSidebarCollapsed
                  ? "Show search sidebar"
                  : "Hide search sidebar"
              }
            >
              {isSidebarCollapsed ? (
                <PanelLeftOpen className="h-4 w-4" />
              ) : (
                <PanelLeftClose className="h-4 w-4" />
              )}
            </Button>
            <CreateStudentDrawer
              onStudentCreated={(studentName) => {
                // Refetch students data to ensure search filter updates
                refetch();
                // Clear grade and status filters to show the new student
                setSelectedGradeId("all");
                setSelectedStatus("");
                setSelectedClass("");
                // If student name is provided, search for the new student
                if (studentName) {
                  setSearchTerm(studentName);
                } else {
                  setSearchTerm("");
                }
              }}
            />
          </div>
        </div>

        {selectedStudentId ? (
          <StudentDetailsView
            studentId={selectedStudentId}
            onClose={() => setSelectedStudentId(null)}
            schoolConfig={config}
          />
        ) : (
          // Show grade filter and table
          <>
            {/* Expandable Stats Section - Only show when viewing all grades */}
            {selectedGradeId === "all" && (
              <div className="mb-8">
                <div className="border-2 border-primary/20 bg-primary/5 rounded-xl overflow-hidden">
                  <button
                    onClick={() => setShowStats(!showStats)}
                    className="w-full p-4 flex items-center justify-between hover:bg-primary/10 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center">
                        <BarChart3 className="h-4 w-4 text-primary" />
                      </div>
                      <div className="text-left">
                        <h3 className="font-mono font-semibold text-slate-900 dark:text-slate-100">
                          School Statistics
                        </h3>
                        <p className="text-sm text-slate-600 dark:text-slate-400">
                          View comprehensive school statistics and metrics
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge className="bg-primary/20 text-primary border border-primary/30 font-mono text-xs">
                        {students.length} Students
                      </Badge>
                      {showStats ? (
                        <ChevronDown className="w-5 h-5 text-primary" />
                      ) : (
                        <ChevronRight className="w-5 h-5 text-primary" />
                      )}
                    </div>
                  </button>

                  {showStats && (
                    <div className="border-t-2 border-primary/20 bg-white dark:bg-slate-800 p-6">
                      <StudentsStats
                        totalStudents={students.length}
                        studentsAddedToday={0}
                        absentToday={0}
                        presentToday={students.length}
                        classesWithMarkedRegisters={0}
                        totalClasses={0}
                        topPerformingGrade="N/A"
                        studentsWithScholarships={0}
                        newAdmissionsThisMonth={0}
                        feeDefaulters={0}
                        averageGrade="N/A"
                      />
                    </div>
                  )}
                </div>
              </div>
            )}

            <GradeFilter
              selectedGradeId={selectedGradeId}
              onGradeSelect={setSelectedGradeId}
            />

            {/* Students Table */}
            <AllGradesStudentsTable
              students={filteredAndSortedStudents.map((s) => ({
                id: s.id,
                name: s.name,
                session: s.admissionDate, // or use a real session field if available
                gender: s.gender,
                dob: s.admissionDate, // or s.dob if available
                class: s.class,
                section: s.stream || "-",
                guardianName: s.contacts?.primaryGuardian || "-",
                guardianEmail: s.contacts?.guardianEmail || "-",
                guardianMobile: s.contacts?.guardianPhone || "-",
                status: s.status,
              }))}
              onStudentClick={setSelectedStudentId}
            />
          </>
        )}
      </div>
    </div>
  );
}
