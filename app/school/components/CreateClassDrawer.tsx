"use client";

import React, { useState, useEffect, useMemo } from "react";
import { useForm, SubmitHandler } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";
import {
  Plus,
  X,
  ChevronRight,
  School,
  Book,
  Users,
  GraduationCap,
  ClipboardList,
} from "lucide-react";
import { toast } from "sonner";

type EducationLevel =
  | "preschool"
  | "primary"
  | "junior-secondary"
  | "senior-secondary"
  | "tertiary"
  | "other";

type SubjectGroup = {
  label: string;
  subjects: string[];
  optional?: boolean;
};

type SubjectLevelConfig = {
  label: string;
  grades: string[];
  informal?: boolean;
  groups: SubjectGroup[];
  pathways?: Record<string, string[]>;
};

function subjectsFromLevelConfig(config: SubjectLevelConfig): string[] {
  const fromGroups = config.groups.flatMap((group) => group.subjects);
  const fromPathways = config.pathways
    ? Object.values(config.pathways).flat()
    : [];
  return Array.from(new Set([...fromGroups, ...fromPathways])).sort();
}

type SubjectPickerGroup = {
  label: string;
  subjects: string[];
  kind: "core" | "elective" | "pathway";
};

function getSubjectPickerGroups(level: EducationLevel): SubjectPickerGroup[] {
  const toPickerGroup = (
    group: SubjectGroup,
    prefix?: string,
  ): SubjectPickerGroup => ({
    label: prefix ? `${prefix} — ${group.label}` : group.label,
    subjects: group.subjects,
    kind: group.optional ? "elective" : "core",
  });

  if (level === "preschool") {
    return SUBJECT_DATA.PrePrimary.groups.map((g) => toPickerGroup(g));
  }

  if (level === "primary") {
    return [
      ...SUBJECT_DATA.LowerPrimary.groups.map((g) =>
        toPickerGroup(g, "Lower primary"),
      ),
      ...SUBJECT_DATA.UpperPrimary.groups.map((g) =>
        toPickerGroup(g, "Upper primary"),
      ),
    ];
  }

  const dataKey = mapEducationLevelToSubjectDataKey(level);
  if (!dataKey || !SUBJECT_DATA[dataKey]) return [];

  const config = SUBJECT_DATA[dataKey];
  const groups: SubjectPickerGroup[] = config.groups.map((g) => toPickerGroup(g));

  if (config.pathways) {
    for (const [pathwayName, subjects] of Object.entries(config.pathways)) {
      groups.push({
        label: `${pathwayName} pathway`,
        subjects,
        kind: "pathway",
      });
    }
  }

  return groups;
}

const SUBJECT_GROUP_STYLES: Record<
  SubjectPickerGroup["kind"],
  { section: string; chip: string; badge: string }
> = {
  core: {
    section: "border-emerald-200/80 bg-emerald-50/50",
    chip: "border-emerald-200/70 bg-white hover:bg-emerald-50/80",
    badge: "bg-emerald-100 text-emerald-800 border-emerald-200",
  },
  elective: {
    section: "border-amber-200/80 bg-amber-50/40",
    chip: "border-amber-200/70 bg-white hover:bg-amber-50/60",
    badge: "bg-amber-100 text-amber-800 border-amber-200",
  },
  pathway: {
    section: "border-violet-200/80 bg-violet-50/40",
    chip: "border-violet-200/70 bg-white hover:bg-violet-50/60",
    badge: "bg-violet-100 text-violet-800 border-violet-200",
  },
};

// Data for subjects based on Kenyan CBC structure.
// School setup uses backend/src/admin/school-type/config/cbc-curriculum.config.ts — keep both in sync.
const SUBJECT_DATA: Record<string, SubjectLevelConfig> = {
  BabyClass: {
    label: "Baby Class",
    grades: ["Baby Class"],
    informal: true,
    groups: [
      {
        label: "Learning areas",
        subjects: [
          "Language Activities",
          "Mathematical Activities",
          "Environmental Activities",
          "Psychomotor & Creative Activities",
          "Religious Education Activities",
        ],
      },
    ],
  },
  PrePrimary: {
    label: "Pre-primary",
    grades: ["PP1", "PP2"],
    groups: [
      {
        label: "Learning areas",
        subjects: [
          "Language Activities",
          "Mathematical Activities",
          "Environmental Activities",
          "Psychomotor & Creative Activities",
          "Religious Education Activities",
        ],
      },
    ],
  },
  LowerPrimary: {
    label: "Lower primary",
    grades: ["Grade 1", "Grade 2", "Grade 3"],
    groups: [
      {
        label: "Core",
        subjects: [
          "English Language Activities",
          "Kiswahili Language Activities",
          "Mathematical Activities",
          "Environmental Activities",
          "Hygiene & Nutrition Activities",
          "Religious Education Activities",
          "Movement & Creative Activities",
        ],
      },
      {
        label: "Non-formal",
        optional: true,
        subjects: ["Indigenous Language Activities"],
      },
    ],
  },
  UpperPrimary: {
    label: "Upper primary",
    grades: ["Grade 4", "Grade 5", "Grade 6"],
    groups: [
      {
        label: "Core",
        subjects: [
          "English",
          "Kiswahili",
          "Mathematics",
          "Science & Technology",
          "Agriculture & Nutrition",
          "Social Studies",
          "Religious Education",
          "Creative Arts",
          "Physical & Health Education",
        ],
      },
      {
        label: "Optional foreign languages",
        optional: true,
        subjects: ["French", "Arabic", "Mandarin", "German"],
      },
    ],
  },
  JuniorSecondary: {
    label: "Junior secondary",
    grades: ["Grade 7", "Grade 8", "Grade 9"],
    groups: [
      {
        label: "Core (all mandatory)",
        subjects: [
          "English",
          "Kiswahili / Kenya Sign Language",
          "Mathematics",
          "Integrated Science",
          "Social Studies",
          "Pre-Technical & Pre-Career Education",
          "Agriculture",
          "Religious Education",
          "Creative Arts & Sports",
        ],
      },
      {
        label: "Non-formal (not examined)",
        optional: true,
        subjects: ["Foreign Languages", "Indigenous Languages"],
      },
    ],
  },
  SeniorSecondary: {
    label: "Senior secondary",
    grades: ["Grade 10", "Grade 11", "Grade 12"],
    groups: [
      {
        label: "Core (all learners)",
        subjects: [
          "English",
          "Kiswahili / Kenya Sign Language",
          "Community Service Learning",
          "Physical Education",
        ],
      },
    ],
    pathways: {
      STEM: [
        "Mathematics / Advanced Math",
        "Biology",
        "Chemistry",
        "Physics",
        "Computer Studies",
        "Agriculture",
        "Drawing & Design",
        "Building & Construction",
        "Electrical Technology",
        "Home Science",
      ],
      "Social Sciences": [
        "Literature in English",
        "History & Citizenship",
        "Geography",
        "Business Studies",
        "Religious Studies",
        "Foreign Languages",
        "Kiswahili Kipevu",
      ],
      "Arts & Sports": [
        "Music & Dance",
        "Fine Art",
        "Theatre & Film",
        "Sports & Recreation",
        "Creative Writing",
      ],
    },
  },
  Tertiary: {
    label: "Tertiary",
    grades: ["University", "TVET"],
    groups: [
      {
        label: "Varies by institution",
        subjects: [
          "Core Courses",
          "Major Courses",
          "Elective Courses",
          "Research Methods",
        ],
      },
    ],
  },
  Other: {
    label: "Other / not specified",
    grades: [],
    groups: [
      {
        label: "",
        subjects: ["Not specified"],
      },
    ],
  },
};

type EducationLevelKey = keyof typeof SUBJECT_DATA; // "PrePrimary" | "LowerPrimary" | ...

const mapEducationLevelToSubjectDataKey = (
  level: EducationLevel,
): EducationLevelKey | null => {
  switch (level) {
    case "preschool":
      return "PrePrimary";
    case "primary":
      // For primary, we might need a more granular check based on grade,
      // but for now, let's map to UpperPrimary as a general primary default.
      // A more robust solution might involve another select for Lower/Upper Primary.
      return "UpperPrimary";
    case "junior-secondary":
      return "JuniorSecondary";
    case "senior-secondary":
      return "SeniorSecondary";
    case "tertiary":
      return "Tertiary";
    case "other":
      return "Other";
    default:
      return null;
  }
};

// Define the form data type for better type safety
type CreateClassFormData = {
  name: string;
  description: string;
  classTeacherId: string;
  level: EducationLevel;
  grade: string;
  stream: string;
  academicYear: string;
  roomNumber: string;
  capacity: number;
  isBoardingClass: boolean;
  departmentId?: string;
  subjectsOffered: string[]; // Changed to string array
  classMonitorId?: string;
};

export function CreateClassDrawer({
  onClassCreated = () => {},
}: {
  onClassCreated: () => void;
}) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [customSubjectInput, setCustomSubjectInput] = useState("");
  const [formProgress, setFormProgress] = useState(25); // Form progress indicator
  const [initialEducationLevel, setInitialEducationLevel] =
    useState<string>("primary");

  const form = useForm<CreateClassFormData>({
    defaultValues: {
      name: "",
      description: "",
      classTeacherId: "",
      level: "primary",
      grade: "",
      stream: "",
      academicYear: new Date().getFullYear().toString(),
      roomNumber: "",
      capacity: 30,
      isBoardingClass: false,
      departmentId: "",
      subjectsOffered: [],
      classMonitorId: "",
    },
  });

  const onSubmit = async (data: CreateClassFormData) => {
    try {
      setIsSubmitting(true);

      // TODO: Replace with real GraphQL mutation when class creation API is available.
      // Currently the backend does not expose a createClass / createGradeLevel mutation.
      // The form data collected: name, level, grade, stream, subjectsOffered, capacity, etc.

      await new Promise((resolve) => setTimeout(resolve, 1500));
      form.reset();
      onClassCreated();
      toast.success("Class form submitted", {
        description:
          "Class creation is coming soon. Your data has been captured for when the API is ready.",
      });
    } catch (error) {
      console.error("Error creating class:", error);
      toast.error("Submission failed", {
        description:
          error instanceof Error
            ? error.message
            : "Failed to submit. Please try again.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Helper arrays for select options
  const academicYears = Array.from({ length: 5 }, (_, i) =>
    (new Date().getFullYear() + i).toString(),
  );
  const kenyanEducationLevels: EducationLevel[] = [
    "preschool",
    "primary",
    "junior-secondary",
    "senior-secondary",
    "tertiary",
    "other",
  ];

  const selectedEducationLevel = form.watch("level");
  const selectedGrade = form.watch("grade"); // Watch the grade as well

  const getGradesForLevel = (level: EducationLevel): string[] => {
    if (level === "preschool") {
      return [
        ...SUBJECT_DATA["BabyClass"].grades,
        ...SUBJECT_DATA["PrePrimary"].grades,
      ];
    }

    if (level === "primary") {
      return [
        ...SUBJECT_DATA["LowerPrimary"].grades,
        ...SUBJECT_DATA["UpperPrimary"].grades,
      ];
    }

    const dataKey = mapEducationLevelToSubjectDataKey(level);
    if (!dataKey) return [];

    return SUBJECT_DATA[dataKey]?.grades ?? [];
  };

  const availableGrades = useMemo(() => {
    return getGradesForLevel(selectedEducationLevel);
  }, [selectedEducationLevel]);

  // Determine subjects based on selected level and possibly grade
  const getDefaultSubjects = (): string[] => {
    if (selectedEducationLevel === "preschool") {
      return subjectsFromLevelConfig(SUBJECT_DATA["PrePrimary"]);
    }

    if (selectedEducationLevel === "primary") {
      return Array.from(
        new Set([
          ...subjectsFromLevelConfig(SUBJECT_DATA["LowerPrimary"]),
          ...subjectsFromLevelConfig(SUBJECT_DATA["UpperPrimary"]),
        ]),
      ).sort();
    }

    const dataKey = mapEducationLevelToSubjectDataKey(selectedEducationLevel);
    if (!dataKey) return [];

    const levelData = SUBJECT_DATA[dataKey];
    return levelData ? subjectsFromLevelConfig(levelData) : [];
  };

  const defaultSubjects = getDefaultSubjects();
  const subjectPickerGroups = useMemo(
    () => getSubjectPickerGroups(selectedEducationLevel),
    [selectedEducationLevel],
  );

  // Reset selected subjects when education level changes
  useEffect(() => {
    form.setValue("subjectsOffered", []);
    setCustomSubjectInput(""); // Clear custom input too
  }, [selectedEducationLevel, form.setValue]);

  const handleAddCustomSubject = (field: any) => {
    if (
      customSubjectInput.trim() &&
      !field.value.includes(customSubjectInput.trim())
    ) {
      field.onChange([...field.value, customSubjectInput.trim()]);
      setCustomSubjectInput("");
    }
  };

  const handleRemoveSubject = (subjectToRemove: string, field: any) => {
    field.onChange(field.value.filter((s: string) => s !== subjectToRemove));
  };

  const handleSelectAllSubjects = (field: any) => {
    // Create a new array with all default subjects to avoid duplicates
    const allSubjects = [...new Set([...defaultSubjects])];
    field.onChange(allSubjects);
  };

  return (
    <Drawer>
      <DrawerTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className="h-7 px-2 border-primary/30 hover:bg-primary/5 hover:text-primary hover:border-primary/30"
        >
          <Plus className="h-3.5 w-3.5 mr-1" />
          <span className="text-xs">Add Class</span>
        </Button>
      </DrawerTrigger>
      <DrawerContent
        className="h-screen w-full md:w-3/5 lg:w-2/5 bg-white shadow-xl rounded-t-lg"
        data-vaul-drawer-direction="right"
      >
        <DrawerHeader className="border-b border-[#246a59]/20 pb-4 bg-[#246a59]/10 rounded-t-lg">
          <div className="flex items-center justify-center">
            <div className="bg-[#246a59] p-3 rounded-full shadow-md">
              <School className="h-6 w-6 text-white" />
            </div>
          </div>
          <DrawerTitle className="text-2xl text-[#246a59] font-semibold text-center mt-3 flex items-center justify-center gap-2">
            Create New Class
          </DrawerTitle>
          <DrawerDescription className="text-center text-sm text-[#246a59] mt-1">
            Complete the form below to create a new class in your school
          </DrawerDescription>
        </DrawerHeader>

        {/* Form progression indicator */}
        <div className="h-2 bg-gray-100">
          <div
            className="h-full bg-[#246a59]"
            style={{ width: `${formProgress}%` }}
          ></div>
        </div>

        <div className="p-6 md:p-8 overflow-y-auto">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
              <div className="w-full bg-gray-100 h-1.5 rounded-full mb-6">
                <div
                  className="bg-custom-blue h-1.5 rounded-full transition-all duration-500"
                  style={{ width: form.formState.isValid ? "100%" : "40%" }}
                ></div>
              </div>

              {/* Form Sections */}
              <div className="flex justify-between items-center text-xs text-[#246a59] font-medium mb-6">
                <div className="flex flex-col items-center gap-1">
                  <div className="w-6 h-6 rounded-full bg-[#246a59] text-white flex items-center justify-center">
                    1
                  </div>
                  <span>Basic Info</span>
                </div>
                <div className="h-0.5 w-1/6 bg-indigo-200"></div>
                <div className="flex flex-col items-center gap-1">
                  <div className="w-6 h-6 rounded-full bg-[#246a59] text-white flex items-center justify-center">
                    2
                  </div>
                  <span>Education</span>
                </div>
                <div className="h-0.5 w-1/6 bg-indigo-200"></div>
                <div className="flex flex-col items-center gap-1">
                  <div className="w-6 h-6 rounded-full bg-[#246a59] text-white flex items-center justify-center">
                    3
                  </div>
                  <span>Subjects</span>
                </div>
                <div className="h-0.5 w-1/6 bg-indigo-200"></div>
                <div className="flex flex-col items-center gap-1">
                  <div className="w-6 h-6 rounded-full bg-indigo-300 text-white flex items-center justify-center">
                    4
                  </div>
                  <span>Details</span>
                </div>
              </div>
              {/* SECTION: Basic Class Information */}
              <div className="mb-8 p-5 bg-white rounded-xl shadow-sm border border-indigo-50 hover:border-indigo-100 transition-all">
                <h3 className="text-lg font-medium text-indigo-800 mb-4 flex items-center gap-2 pb-2 border-b border-indigo-100">
                  <School className="h-5 w-5 text-[#246a59]" />
                  Basic Class Information
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Class Name</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="e.g. Eagles, Junior Primary"
                            {...field}
                          />
                        </FormControl>
                        <FormDescription>
                          A unique name for the class (e.g., "Class 4A").
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="classTeacherId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Class Teacher</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="Enter teacher ID or name"
                            {...field}
                          />
                        </FormControl>
                        <FormDescription>
                          Assign a teacher responsible for this class.
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>

              {/* Education Level and Grade */}
              <div className="mb-8">
                <h3 className="text-lg font-medium text-indigo-800 mb-4 flex items-center gap-2 pb-2 border-b border-indigo-100">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5 text-[#246a59]"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path d="M10.394 2.08a1 1 0 00-.788 0l-7 3a1 1 0 000 1.84L5.25 8.051a.999.999 0 01.356-.257l4-1.714a1 1 0 11.788 1.838L7.667 9.088l1.94.831a1 1 0 00.787 0l7-3a1 1 0 000-1.838l-7-3zM3.31 9.397L5 10.12v4.102a8.969 8.969 0 00-1.05-.174 1 1 0 01-.89-.89 11.115 11.115 0 01.25-3.762zM9.3 16.573A9.026 9.026 0 007 14.935v-3.957l1.818.78a3 3 0 002.364 0l5.508-2.361a11.026 11.026 0 01.25 3.762 1 1 0 01-.89.89 8.968 8.968 0 00-5.35 2.524 1 1 0 01-1.4 0zM6 18a1 1 0 001-1v-2.065a8.935 8.935 0 00-2-.712V17a1 1 0 001 1z" />
                  </svg>
                  Education Level & Grade
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <FormField
                    control={form.control}
                    name="level"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Education Level</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          value={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select education level" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="preschool">
                              Pre-Primary
                            </SelectItem>
                            <SelectItem value="primary">Primary</SelectItem>
                            <SelectItem value="junior-secondary">
                              Junior Secondary
                            </SelectItem>
                            <SelectItem value="senior-secondary">
                              Senior Secondary
                            </SelectItem>
                            <SelectItem value="tertiary">Tertiary</SelectItem>
                            <SelectItem value="other">Other</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormDescription>
                          The overall education stage (e.g., Primary, Junior
                          Secondary).
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="grade"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Grade / Form</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          value={field.value}
                          disabled={availableGrades.length === 0}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select grade" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {availableGrades.length > 0 ? (
                              availableGrades.map((grade) => (
                                <SelectItem key={grade} value={grade}>
                                  {grade}
                                </SelectItem>
                              ))
                            ) : (
                              <SelectItem value="" disabled>
                                No grades available for this level
                              </SelectItem>
                            )}
                          </SelectContent>
                        </Select>
                        <FormDescription>
                          The specific grade or form (e.g., Grade 4, Form 1).
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                {/* Academic Details */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="stream"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Stream (Optional)</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="e.g. A, Green, North"
                            {...field}
                          />
                        </FormControl>
                        <FormDescription>
                          For classes with multiple streams (e.g., 4 'A', 4
                          'B').
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="academicYear"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Academic Year</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select academic year" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {academicYears.map((year) => (
                              <SelectItem key={year} value={year}>
                                {year}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormDescription>
                          The academic year this class is active for.
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                {/* Physical and Capacity Details */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="roomNumber"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Room Number / Location</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="e.g. A101, Main Hall"
                            {...field}
                          />
                        </FormControl>
                        <FormDescription>
                          The physical classroom or location of the class.
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="capacity"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Capacity (Students)</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            placeholder="e.g. 45"
                            {...field}
                            onChange={(e) =>
                              field.onChange(Number(e.target.value))
                            } // Ensure number type
                          />
                        </FormControl>
                        <FormDescription>
                          Maximum number of students this class can accommodate.
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                {/* Additional Options */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="isBoardingClass"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4 shadow">
                        <FormControl>
                          <Checkbox
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                        <div className="space-y-1 leading-none">
                          <FormLabel>Is this a boarding class?</FormLabel>
                          <FormDescription>
                            Check if this class is specifically for boarding
                            students.
                          </FormDescription>
                        </div>
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="departmentId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Department (Optional)</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="e.g. Science Department"
                            {...field}
                          />
                        </FormControl>
                        <FormDescription>
                          Relevant for secondary schools with departments.
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                {/* SECTION: Subjects Offered */}
                <div className="mb-8 p-5 bg-white rounded-xl shadow-sm border border-indigo-50 hover:border-indigo-100 transition-all">
                  <h3 className="text-lg font-medium text-indigo-800 mb-4 flex items-center gap-2 pb-2 border-b border-indigo-100">
                    <Book className="h-5 w-5 text-[#246a59]" />
                    Subjects Offered
                  </h3>

                  <FormField
                    control={form.control}
                    name="subjectsOffered"
                    render={({ field }) => (
                      <FormItem>
                        <FormDescription>
                          Core subjects are required; elective and pathway
                          subjects are optional for this class.
                        </FormDescription>
                        <div className="mb-3 flex flex-wrap items-center gap-2">
                          <Button
                            type="button"
                            onClick={() => handleSelectAllSubjects(field)}
                            variant="outline"
                            size="sm"
                            className="border-indigo-200 hover:bg-indigo-50 text-indigo-700"
                          >
                            <Book className="h-4 w-4 mr-1" />
                            Select all
                          </Button>
                          <span className="inline-flex items-center rounded-full border border-emerald-200 bg-emerald-50 px-2 py-0.5 text-[10px] font-medium text-emerald-800">
                            Core
                          </span>
                          <span className="inline-flex items-center rounded-full border border-amber-200 bg-amber-50 px-2 py-0.5 text-[10px] font-medium text-amber-800">
                            Elective
                          </span>
                          <span className="inline-flex items-center rounded-full border border-violet-200 bg-violet-50 px-2 py-0.5 text-[10px] font-medium text-violet-800">
                            Pathway
                          </span>
                        </div>
                        <div className="space-y-3 py-1">
                          {subjectPickerGroups.map((group) => {
                            const styles = SUBJECT_GROUP_STYLES[group.kind];
                            return (
                              <div
                                key={group.label}
                                className={`rounded-lg border p-3 ${styles.section}`}
                              >
                                <div className="mb-2 flex items-center justify-between gap-2">
                                  <p className="text-xs font-semibold text-slate-700">
                                    {group.label}
                                  </p>
                                  <span
                                    className={`rounded-full border px-2 py-0.5 text-[10px] font-medium capitalize ${styles.badge}`}
                                  >
                                    {group.kind === "elective"
                                      ? "Optional"
                                      : group.kind}
                                  </span>
                                </div>
                                <div className="flex flex-wrap gap-1.5">
                                  {group.subjects.map((subject) => {
                                    const checked = field.value.includes(subject);
                                    return (
                                      <label
                                        key={subject}
                                        htmlFor={`subject-${subject}`}
                                        className={`flex cursor-pointer items-center gap-2 rounded-md border px-2.5 py-1.5 text-sm transition-colors ${styles.chip} ${checked ? "ring-1 ring-[#246a59]/40" : ""}`}
                                      >
                                        <Checkbox
                                          id={`subject-${subject}`}
                                          checked={checked}
                                          onCheckedChange={(isChecked) => {
                                            field.onChange(
                                              isChecked
                                                ? [...field.value, subject]
                                                : field.value.filter(
                                                    (v: string) => v !== subject,
                                                  ),
                                            );
                                          }}
                                        />
                                        <span className="leading-tight">
                                          {subject}
                                        </span>
                                      </label>
                                    );
                                  })}
                                </div>
                              </div>
                            );
                          })}
                        </div>

                        <div className="flex items-center space-x-2 mt-2">
                          <Input
                            placeholder="Add custom subject"
                            value={customSubjectInput}
                            onChange={(e) =>
                              setCustomSubjectInput(e.target.value)
                            }
                            onKeyDown={(e) => {
                              if (e.key === "Enter") {
                                e.preventDefault(); // Prevent form submission
                                handleAddCustomSubject(field);
                              }
                            }}
                          />
                          <Button
                            type="button"
                            onClick={() => handleAddCustomSubject(field)}
                          >
                            Add
                          </Button>
                        </div>

                        <div className="mt-3 flex flex-wrap gap-2">
                          {field.value.map((subject: string) => {
                            const groupKind =
                              subjectPickerGroups.find((g) =>
                                g.subjects.includes(subject),
                              )?.kind ?? "core";
                            const badgeStyle =
                              SUBJECT_GROUP_STYLES[groupKind].badge;
                            return (
                              <Badge
                                key={subject}
                                variant="outline"
                                className={`flex items-center gap-1 ${badgeStyle}`}
                              >
                                {subject}
                                <X
                                  className="h-3 w-3 cursor-pointer"
                                  onClick={() =>
                                    handleRemoveSubject(subject, field)
                                  }
                                />
                              </Badge>
                            );
                          })}
                        </div>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                {/* SECTION: Additional Details */}
                <div className="mb-8 p-5 bg-white rounded-xl shadow-sm border border-indigo-50 hover:border-indigo-100 transition-all">
                  <h3 className="text-lg font-medium text-indigo-800 mb-4 flex items-center gap-2 pb-2 border-b border-indigo-100">
                    <Users className="h-5 w-5 text-[#246a59]" />
                    Additional Details
                  </h3>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-4">
                    <FormField
                      control={form.control}
                      name="classMonitorId"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Class Monitor (Optional)</FormLabel>
                          <FormControl>
                            <Input
                              placeholder="Enter student ID or name"
                              {...field}
                            />
                          </FormControl>
                          <FormDescription>
                            The student assigned as the class monitor.
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={form.control}
                    name="description"
                    render={({ field }) => (
                      <FormItem className="md:col-span-2">
                        <FormLabel>Description</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="Enter class description..."
                            {...field}
                            className="min-h-[120px] resize-none"
                          />
                        </FormControl>
                        <FormDescription>
                          Provide a brief description of the class, its focus,
                          and any special requirements.
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <DrawerFooter className="border-t border-custom-blue/20 pt-6 mt-8 bg-custom-blue/10">
                  <div className="flex justify-between w-full">
                    <DrawerClose asChild>
                      <Button
                        variant="outline"
                        className="border-indigo-200 hover:bg-indigo-50"
                      >
                        <X className="h-4 w-4 mr-2" />
                        Cancel
                      </Button>
                    </DrawerClose>
                    <Button
                      type="submit"
                      className="bg-custom-blue hover:bg-custom-blue/90 text-[#246a59] hover:text-white  hover:bg-[#246a59] font-medium shadow-md hover:shadow-lg transition-all duration-300"
                      disabled={isSubmitting}
                    >
                      {isSubmitting ? (
                        <>
                          Creating Class...
                          <div className="ml-2 h-4 w-4 rounded-full border-2 border-slate-400 border-t-transparent animate-spin"></div>
                        </>
                      ) : (
                        <>
                          Create Class <ChevronRight className="h-4 w-4 ml-1" />
                        </>
                      )}
                    </Button>
                  </div>
                </DrawerFooter>
              </div>
            </form>
          </Form>
        </div>
      </DrawerContent>
    </Drawer>
  );
}

export default CreateClassDrawer;
