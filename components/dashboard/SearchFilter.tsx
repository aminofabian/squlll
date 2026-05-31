"use client";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Search,
  Filter,
  Circle,
  GraduationCap,
  Users,
  Building2,
  Activity,
  CheckCircle,
  XCircle,
} from "lucide-react";
import { useEffect, useState, useMemo } from "react";
import { useSchoolConfigStore } from "@/lib/stores/useSchoolConfigStore";
import { useStudentsStore } from "@/lib/stores/useStudentsStore";
import { mockClasses } from "@/lib/data/mockclasses";

// ─── Helpers ───────────────────────────────────────────────────

function getGradeNumber(gradeName: string): number {
  const match = gradeName.match(/\d+/);
  return match ? parseInt(match[0], 10) : 999;
}

function getGradeDisplayName(gradeName: string): string {
  const lowerName = gradeName.toLowerCase();
  if (lowerName.includes("pp1") || lowerName.includes("baby")) return "PP1";
  if (lowerName.includes("pp2") || lowerName.includes("nursery")) return "PP2";
  if (lowerName.includes("pp3") || lowerName.includes("reception"))
    return "PP3";
  if (lowerName.includes("grade 7") || lowerName.includes("g7"))
    return "Form 1";
  if (lowerName.includes("grade 8") || lowerName.includes("g8"))
    return "Form 2";
  if (lowerName.includes("grade 9") || lowerName.includes("g9"))
    return "Form 3";
  if (lowerName.includes("grade 10") || lowerName.includes("g10"))
    return "Form 4";
  if (lowerName.includes("grade 11") || lowerName.includes("g11"))
    return "Form 5";
  if (lowerName.includes("grade 12") || lowerName.includes("g12"))
    return "Form 6";
  const match = gradeName.match(/\d+/);
  if (match) {
    const num = parseInt(match[0], 10);
    if (num >= 1 && num <= 6) return `Grade ${num}`;
  }
  return gradeName;
}

function sortGrades(
  grades: Array<Omit<Grade, "displayName">>,
): Array<Omit<Grade, "displayName">> {
  return [...grades].sort((a, b) => {
    const aNum = getGradeNumber(a.name);
    const bNum = getGradeNumber(b.name);
    const aIsPP =
      a.name.toLowerCase().includes("pp") ||
      a.name.toLowerCase().includes("baby") ||
      a.name.toLowerCase().includes("nursery") ||
      a.name.toLowerCase().includes("reception");
    const bIsPP =
      b.name.toLowerCase().includes("pp") ||
      b.name.toLowerCase().includes("baby") ||
      b.name.toLowerCase().includes("nursery") ||
      b.name.toLowerCase().includes("reception");
    if (aIsPP && !bIsPP) return -1;
    if (!aIsPP && bIsPP) return 1;
    return aNum - bNum;
  });
}

// ─── School-Relevant Types ────────────────────────────────────

interface Tenant {
  id: number;
  name: string;
  plan: string;
  status: "active" | "trial" | "suspended";
  created_at: string;
}

interface AuditLog {
  id: number;
  school_name: string;
  action: string;
  status: "success" | "failed";
  timestamp: string;
  request_id: string;
}

interface Grade {
  id: string;
  name: string;
  studentCount: number;
  subjectCount: number;
  classCount: number;
  streams: Array<{ id: string; name: string }>;
  displayName?: string;
}

interface FilterOption {
  value: string;
  label: string;
}

interface Filter {
  type: "select" | "date";
  label: string;
  options?: FilterOption[];
}

interface FilterConfig {
  title: string;
  filters: Filter[];
}

interface FilterConfigs {
  [key: string]: FilterConfig;
}

interface SearchFilterProps {
  className?: string;
  type?: string;
  onStoreSelect?: (id: string) => void;
  onSearch?: (term: string) => void;
}

// ─── Mock Data (School Context) ────────────────────────────────

const isSelectFilter = (
  filter: Filter,
): filter is Filter & { options: FilterOption[] } => {
  return filter.type === "select" && !!filter.options;
};

const mockTenants: Tenant[] = [
  {
    id: 1,
    name: "Springfield Elementary",
    plan: "Premium",
    status: "active",
    created_at: "2024-01-15T10:30:00Z",
  },
  {
    id: 2,
    name: "Riverside Academy",
    plan: "Standard",
    status: "active",
    created_at: "2024-03-01T14:20:00Z",
  },
  {
    id: 3,
    name: "Oakwood High School",
    plan: "Starter",
    status: "trial",
    created_at: "2025-05-01T09:15:00Z",
  },
  {
    id: 4,
    name: "Sunrise International",
    plan: "Premium",
    status: "active",
    created_at: "2023-08-15T11:45:00Z",
  },
  {
    id: 5,
    name: "Greenfield Montessori",
    plan: "Standard",
    status: "suspended",
    created_at: "2024-06-01T16:30:00Z",
  },
];

const mockAuditLogs: AuditLog[] = [
  {
    id: 1,
    school_name: "Springfield Elementary",
    action: "User Created",
    status: "success",
    timestamp: "2025-05-30T14:32:00Z",
    request_id: "aud_abc123",
  },
  {
    id: 2,
    school_name: "Oakwood High School",
    action: "User Suspended",
    status: "success",
    timestamp: "2025-05-29T10:15:00Z",
    request_id: "aud_def456",
  },
  {
    id: 3,
    school_name: "Riverside Academy",
    action: "Subscription Changed",
    status: "success",
    timestamp: "2025-05-28T09:45:00Z",
    request_id: "aud_ghi789",
  },
  {
    id: 4,
    school_name: "Greenfield Montessori",
    action: "User Reactivated",
    status: "success",
    timestamp: "2025-05-27T16:20:00Z",
    request_id: "aud_jkl012",
  },
  {
    id: 5,
    school_name: "Sunrise International",
    action: "Payment Failed",
    status: "failed",
    timestamp: "2025-05-26T11:00:00Z",
    request_id: "aud_mno345",
  },
];

const useGradesFromStore = () => {
  const { getAllGradeLevels, config } = useSchoolConfigStore();
  const { students } = useStudentsStore();
  const allGradeLevels = getAllGradeLevels();

  const grades = allGradeLevels.flatMap((level) =>
    level.grades.map((grade) => {
      const studentCount = students.filter((student) => {
        if (typeof student.grade === "string") return false;
        return (
          student.grade.gradeLevel.name.toLowerCase() ===
          grade.name.toLowerCase()
        );
      }).length;
      const levelSubjects =
        config?.selectedLevels.find((l) => l.id === level.levelId)?.subjects ||
        [];
      const subjectCount = levelSubjects.length;
      const classCount = mockClasses.filter(
        (cls) =>
          cls.grade.toLowerCase() === grade.name.toLowerCase() &&
          cls.status === "active",
      ).length;
      return {
        id: grade.id,
        name: grade.name,
        studentCount,
        subjectCount,
        classCount,
        streams: grade.streams || [],
      };
    }),
  );

  return sortGrades(grades).map((grade) => ({
    ...grade,
    displayName: getGradeDisplayName(grade.name),
  }));
};

export function SearchFilter({
  className,
  type = "dashboard",
  onStoreSelect,
  onSearch,
}: SearchFilterProps) {
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [selectedItem, setSelectedItem] = useState<string>("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [visibleGrades, setVisibleGrades] = useState(5);
  const grades = useGradesFromStore();

  useEffect(() => {
    if (type === "tenants") {
      setTimeout(() => setTenants(mockTenants), 500);
    } else if (type === "logs") {
      setTimeout(() => setAuditLogs(mockAuditLogs), 500);
    }
  }, [type]);

  const filteredTenants = useMemo(() => {
    if (!searchTerm) return tenants;
    const term = searchTerm.toLowerCase();
    return tenants.filter((t) => t.name.toLowerCase().includes(term));
  }, [tenants, searchTerm]);

  const filteredLogs = useMemo(() => {
    if (!searchTerm) return auditLogs;
    const term = searchTerm.toLowerCase();
    return auditLogs.filter(
      (log) =>
        log.school_name.toLowerCase().includes(term) ||
        log.action.toLowerCase().includes(term) ||
        log.request_id.toLowerCase().includes(term),
    );
  }, [auditLogs, searchTerm]);

  const filteredGrades = useMemo(() => {
    if (!searchTerm) return grades;
    const term = searchTerm.toLowerCase();
    return grades.filter(
      (grade) =>
        grade.name.toLowerCase().includes(term) ||
        grade.displayName.toLowerCase().includes(term) ||
        grade.id.toLowerCase().includes(term),
    );
  }, [grades, searchTerm]);

  const visibleGradesList = useMemo(
    () => filteredGrades.slice(0, visibleGrades),
    [filteredGrades, visibleGrades],
  );
  const hasMoreGrades = visibleGrades < filteredGrades.length;

  const handleExpandGrades = () => setVisibleGrades((prev) => prev + 5);
  const handleCollapseGrades = () => setVisibleGrades(5);

  const filterConfigs: FilterConfigs = {
    tenants: { title: "Tenant List", filters: [] },
    logs: {
      title: "Audit Logs",
      filters: [
        {
          type: "select",
          label: "School",
          options: [
            { value: "all", label: "All Schools" },
            ...mockTenants.map((t) => ({
              value: t.id.toString(),
              label: t.name,
            })),
          ],
        },
        {
          type: "select",
          label: "Action",
          options: [
            { value: "all", label: "All Actions" },
            { value: "user_created", label: "User Created" },
            { value: "user_suspended", label: "User Suspended" },
            { value: "subscription_changed", label: "Subscription Changed" },
            { value: "payment_failed", label: "Payment Failed" },
          ],
        },
        {
          type: "select",
          label: "Status",
          options: [
            { value: "all", label: "All" },
            { value: "success", label: "Success" },
            { value: "failed", label: "Failed" },
          ],
        },
        { type: "date", label: "From" },
        { type: "date", label: "To" },
      ],
    },
    dashboard: {
      title: "Dashboard Filters",
      filters: [
        {
          type: "select",
          label: "Grade Filter",
          options: [
            { value: "all", label: "All Grades" },
            ...grades.map((g) => ({ value: g.id, label: g.name })),
          ],
        },
      ],
    },
  };

  const currentConfig = filterConfigs[type] || filterConfigs["dashboard"];

  const handleItemClick = (id: string) => {
    setSelectedItem(id);
    onStoreSelect?.(id);
  };

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const term = e.target.value;
    setSearchTerm(term);
    setVisibleGrades(5);
    onSearch?.(term);
    setSelectedItem("all");
  };

  return (
    <div className={`bg-white dark:bg-slate-900 shadow-lg ${className}`}>
      {/* Search */}
      <div className="p-6 border-b dark:border-slate-700">
        <Label
          htmlFor="search"
          className="text-xs font-mono uppercase tracking-wide text-slate-600 dark:text-slate-400"
        >
          Search {currentConfig.title}
        </Label>
        <div className="relative mt-2">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
          <Input
            id="search"
            value={searchTerm}
            onChange={handleSearch}
            placeholder={`Search ${type}...`}
            className="h-11 pl-10 bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700 focus-visible:ring-primary/50 font-mono text-sm"
          />
        </div>
      </div>

      {/* Lists Container */}
      <div className="p-6 space-y-6">
        {/* Tenants List */}
        {type === "tenants" && (
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-xs font-mono uppercase tracking-wide text-slate-600 dark:text-slate-400">
              <Building2 className="h-3.5 w-3.5" />
              Schools
            </div>
            <div className="space-y-2">
              {filteredTenants.length === 0 ? (
                <div className="text-center py-8 bg-slate-50 dark:bg-slate-800/50 rounded-lg border border-dashed border-slate-200 dark:border-slate-700">
                  <p className="font-mono text-sm text-slate-500 dark:text-slate-400">
                    No tenants found
                  </p>
                </div>
              ) : (
                filteredTenants.map((tenant) => (
                  <button
                    key={tenant.id}
                    onClick={() => handleItemClick(tenant.id.toString())}
                    className={`w-full p-4 text-left rounded-lg transition-all duration-200 group cursor-pointer
                      ${
                        selectedItem === tenant.id.toString()
                          ? "bg-primary/5 dark:bg-primary/10 shadow-sm border border-primary/20"
                          : "bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 hover:border-primary/30 hover:shadow-md"
                      }`}
                  >
                    <div className="font-mono font-medium group-hover:text-primary transition-colors">
                      {tenant.name}
                    </div>
                    <div className="flex items-center gap-2 mt-2">
                      <Circle
                        className={`w-2 h-2 ${
                          tenant.status === "active"
                            ? "fill-green-500 text-green-500"
                            : tenant.status === "trial"
                              ? "fill-amber-500 text-amber-500"
                              : "fill-red-500 text-red-500"
                        }`}
                      />
                      <span className="text-xs text-slate-500">
                        {tenant.plan} plan
                      </span>
                    </div>
                    <div className="text-xs text-slate-400 mt-1">
                      Created:{" "}
                      {new Date(tenant.created_at).toLocaleDateString()}
                    </div>
                  </button>
                ))
              )}
            </div>
          </div>
        )}

        {/* Audit Logs List */}
        {type === "logs" && (
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-xs font-mono uppercase tracking-wide text-slate-600 dark:text-slate-400">
              <Activity className="h-3.5 w-3.5" />
              Recent Activity
            </div>
            <div className="space-y-2">
              {filteredLogs.length === 0 ? (
                <div className="text-center py-8 bg-slate-50 dark:bg-slate-800/50 rounded-lg border border-dashed border-slate-200 dark:border-slate-700">
                  <p className="font-mono text-sm text-slate-500 dark:text-slate-400">
                    No logs found
                  </p>
                </div>
              ) : (
                filteredLogs.map((log) => (
                  <button
                    key={log.id}
                    onClick={() => handleItemClick(log.id.toString())}
                    className={`w-full p-4 text-left rounded-lg transition-all duration-200 group cursor-pointer
                      ${
                        selectedItem === log.id.toString()
                          ? "bg-primary/5 dark:bg-primary/10 shadow-sm border border-primary/20"
                          : "bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 hover:border-primary/30 hover:shadow-md"
                      }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="font-mono font-medium group-hover:text-primary transition-colors">
                        {log.school_name}
                      </div>
                      {log.status === "success" ? (
                        <CheckCircle className="h-4 w-4 text-green-500" />
                      ) : (
                        <XCircle className="h-4 w-4 text-red-500" />
                      )}
                    </div>
                    <div className="flex items-center justify-between mt-2">
                      <span className="text-xs font-mono px-2.5 py-1 bg-slate-100 dark:bg-slate-800 rounded-md border border-slate-200 dark:border-slate-700">
                        {log.action}
                      </span>
                      <span className="text-xs text-slate-500">
                        {new Date(log.timestamp).toLocaleTimeString()}
                      </span>
                    </div>
                    <div className="text-xs text-slate-400 mt-2">
                      ID: <span className="font-medium">{log.request_id}</span>
                    </div>
                  </button>
                ))
              )}
            </div>
          </div>
        )}

        {/* Dashboard Grade Filters */}
        {type === "dashboard" && (
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-xs font-mono uppercase tracking-wide text-slate-600 dark:text-slate-400">
              <GraduationCap className="h-3.5 w-3.5" />
              Grade Filters
            </div>
            <div className="space-y-2">
              {filteredGrades.length === 0 ? (
                <div className="text-center py-8 bg-slate-50 dark:bg-slate-800/50 rounded-lg border border-dashed border-slate-200 dark:border-slate-700">
                  <p className="font-mono text-sm text-slate-500 dark:text-slate-400">
                    No grades found
                  </p>
                </div>
              ) : (
                <>
                  {visibleGradesList.map((grade) => (
                    <button
                      key={grade.id}
                      onClick={() => handleItemClick(grade.id)}
                      className={`w-full p-4 text-left rounded-lg transition-all duration-200 group cursor-pointer
                        ${
                          selectedItem === grade.id
                            ? "bg-primary/5 dark:bg-primary/10 shadow-sm border border-primary/20"
                            : "bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 hover:border-primary/30 hover:shadow-md"
                        }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                            <Users className="h-4 w-4 text-primary" />
                          </div>
                          <div className="text-left">
                            <div className="font-mono font-medium group-hover:text-primary transition-colors">
                              {grade.displayName}
                            </div>
                            <div className="text-xs text-slate-500">
                              {grade.studentCount} students ·{" "}
                              {grade.subjectCount} subjects
                              {grade.streams.length > 0 &&
                                ` · ${grade.streams.length} streams`}
                            </div>
                          </div>
                        </div>
                        {grade.streams.length > 0 && (
                          <div className="px-2.5 py-1 bg-primary/5 dark:bg-primary/10 text-primary text-xs font-mono rounded-md border border-primary/20">
                            {grade.streams.length} streams
                          </div>
                        )}
                      </div>
                      <div className="text-xs text-slate-400 mt-2">
                        <span>{grade.classCount} classes</span>
                      </div>
                    </button>
                  ))}
                  {hasMoreGrades && (
                    <button
                      onClick={handleExpandGrades}
                      className="w-full p-3 text-center rounded-lg bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 hover:border-primary/30 cursor-pointer"
                    >
                      <span className="text-sm font-mono text-primary">
                        Show{" "}
                        {Math.min(5, filteredGrades.length - visibleGrades)}{" "}
                        more
                      </span>
                    </button>
                  )}
                  {visibleGrades > 5 && (
                    <button
                      onClick={handleCollapseGrades}
                      className="w-full p-3 text-center rounded-lg bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 hover:border-primary/30 cursor-pointer"
                    >
                      <span className="text-sm font-mono text-primary">
                        Show less
                      </span>
                    </button>
                  )}
                </>
              )}
            </div>
          </div>
        )}

        {/* Generic fallback for other filter types */}
        {type !== "tenants" && type !== "logs" && type !== "dashboard" && (
          <div className="space-y-6">
            <div className="flex items-center gap-2 text-xs font-mono uppercase tracking-wide text-slate-600 dark:text-slate-400">
              <Filter className="h-3.5 w-3.5" />
              {currentConfig.title}
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {currentConfig.filters.map((filter, index) => (
                <div key={index} className="space-y-2">
                  <Label className="text-xs font-mono uppercase tracking-wide text-slate-600 dark:text-slate-400">
                    {filter.label}
                  </Label>
                  {filter.type === "select" && isSelectFilter(filter) ? (
                    <Select defaultValue="all" onValueChange={handleItemClick}>
                      <SelectTrigger className="h-10 font-mono text-sm bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {filter.options.map((option) => (
                          <SelectItem key={option.value} value={option.value}>
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  ) : filter.type === "date" ? (
                    <Input
                      type="date"
                      className="h-10 font-mono text-sm bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700"
                    />
                  ) : null}
                </div>
              ))}
            </div>
            <Button className="w-full h-10 bg-primary hover:bg-primary/90 font-mono text-xs tracking-wide uppercase">
              Apply Filters
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
