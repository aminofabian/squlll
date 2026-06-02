"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import {
  ArrowLeft,
  User,
  Mail,
  Phone,
  Calendar,
  School,
  BookOpen,
  ChevronDown,
  ChevronRight,
  Download,
  Printer,
  FileText,
  Copy,
  GraduationCap,
  Loader2,
  AlertCircle,
  RefreshCw,
  AlertTriangle,
  Wallet,
  Receipt,
} from "lucide-react";
import SchoolReportCard from "./ReportCard";
import { useStudentDetailSummary } from "@/lib/hooks/useStudentDetailSummary";
import { StudentLedger } from "./StudentLedger";
import { useStudentLedger } from "@/lib/hooks/use-student-ledger";
import { useStudentCredentials } from "@/lib/hooks/useStudentCredentials";
import { cn } from "@/lib/utils";
import { AssignGradeStreamDialog } from "./AssignGradeStreamDialog";
import { StudentAccountPanel } from "./StudentAccountPanel";
import { StudentCredentialsDialog } from "./StudentCredentialsDialog";
import { studentsPanel } from "./students-ui";
import { toast } from "sonner";

interface StudentDetailsViewProps {
  studentId: string;
  onClose: () => void;
  schoolConfig?: {
    id?: string;
    tenant?: { schoolName?: string; subdomain?: string };
    selectedLevels?: Array<{ subjects?: unknown[] }>;
  };
  embedded?: boolean;
  onEnrollmentUpdated?: () => void;
}

function DetailField({
  label,
  value,
  icon: Icon,
  copyValue,
}: {
  label: string;
  value: React.ReactNode;
  icon?: React.ComponentType<{ className?: string }>;
  copyValue?: string;
}) {
  return (
    <div className="rounded-lg bg-slate-50/80 px-3 py-2.5 dark:bg-slate-800/30">
      <p className="flex items-center gap-1 text-[11px] font-medium uppercase tracking-wide text-slate-400">
        {Icon ? <Icon className="h-3 w-3 shrink-0" /> : null}
        {label}
      </p>
      <div className="mt-1 flex items-start justify-between gap-2">
        <div className="min-w-0 text-sm text-slate-800 dark:text-slate-100">
          {value}
        </div>
        {copyValue ? (
          <button
            type="button"
            onClick={() => {
              void navigator.clipboard.writeText(copyValue);
              toast.success("Copied to clipboard");
            }}
            className="shrink-0 rounded p-1 text-slate-400 hover:text-slate-600"
            aria-label={`Copy ${label}`}
          >
            <Copy className="h-3.5 w-3.5" />
          </button>
        ) : null}
      </div>
    </div>
  );
}

function InfoGroup({
  title,
  icon: Icon,
  children,
}: {
  title: string;
  icon: React.ComponentType<{ className?: string }>;
  children: React.ReactNode;
}) {
  return (
    <section>
      <h3 className="mb-2 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-slate-500">
        <Icon className="h-3.5 w-3.5" />
        {title}
      </h3>
      <div className="space-y-2">{children}</div>
    </section>
  );
}

function EmptyPanel({
  icon: Icon,
  title,
  description,
}: {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  description: string;
}) {
  return (
    <div className="flex flex-col items-center justify-center py-12 text-center">
      <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-slate-100 dark:bg-slate-800">
        <Icon className="h-5 w-5 text-slate-400" />
      </div>
      <p className="text-sm font-medium text-slate-600 dark:text-slate-300">
        {title}
      </p>
      <p className="mt-1 max-w-xs text-xs text-slate-400">{description}</p>
    </div>
  );
}

function formatCurrency(amount: number) {
  return new Intl.NumberFormat("en-KE", {
    style: "currency",
    currency: "KES",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

function StudentInitials({ name }: { name: string }) {
  const parts = name.trim().split(/\s+/);
  const initials =
    parts.length >= 2
      ? `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase()
      : name.slice(0, 2).toUpperCase();

  return (
    <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-slate-100 text-base font-semibold text-slate-600 dark:bg-slate-800 dark:text-slate-300">
      {initials || "?"}
    </div>
  );
}

export function StudentDetailsView({
  studentId,
  onClose,
  schoolConfig,
  embedded = false,
  onEnrollmentUpdated,
}: StudentDetailsViewProps) {
  const [expandedDocuments, setExpandedDocuments] = useState<
    Record<string, boolean>
  >({});
  const [showCredentialsDialog, setShowCredentialsDialog] = useState(false);
  const [showAssignClassDialog, setShowAssignClassDialog] = useState(false);
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const [selectedTemplate, setSelectedTemplate] = useState<
    "modern" | "classic" | "compact" | "uganda-classic"
  >("modern");

  const { studentDetail, loading, error, refetch } =
    useStudentDetailSummary(studentId);
  const {
    credentials,
    loading: credentialsLoading,
    error: credentialsError,
    fetchCredentials,
  } = useStudentCredentials(studentId);
  const {
    ledgerData,
    loading: ledgerLoading,
    error: ledgerError,
  } = useStudentLedger({
    studentId,
    dateRange: { startDate: "2024-01-01", endDate: "2024-12-31" },
  });

  const handleShowCredentials = async () => {
    setShowCredentialsDialog(true);
    if (!credentials) {
      await fetchCredentials();
    }
  };

  const handleCopy = async (text: string, field: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedField(field);
      toast.success("Copied to clipboard");
      setTimeout(() => setCopiedField(null), 2000);
    } catch {
      toast.error("Failed to copy");
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-[240px] items-center justify-center rounded-xl border border-slate-200/80 bg-white dark:border-slate-800 dark:bg-slate-900/40">
        <div className="flex items-center gap-3">
          <Loader2 className="h-5 w-5 animate-spin text-slate-400" />
          <p className="text-sm text-slate-500">Loading student…</p>
        </div>
      </div>
    );
  }

  if (error || !studentDetail) {
    return (
      <div className="flex min-h-[240px] items-center justify-center rounded-xl border border-slate-200/80 bg-white dark:border-slate-800 dark:bg-slate-900/40">
        <div className="text-center">
          <AlertCircle className="mx-auto h-5 w-5 text-red-500" />
          <p className="mt-2 text-sm text-slate-500">
            {error || "Student not found"}
          </p>
          <Button
            onClick={refetch}
            variant="outline"
            size="sm"
            className="mt-3 h-8 text-xs"
          >
            <RefreshCw className="mr-1.5 h-3.5 w-3.5" />
            Retry
          </Button>
        </div>
      </div>
    );
  }

  const student = studentDetail;
  const missingStream = !student.streamName;

  return (
    <div className="space-y-5">
      {embedded ? (
        <button
          type="button"
          onClick={onClose}
          className="inline-flex items-center gap-1.5 rounded-md px-1 py-0.5 text-xs font-medium text-slate-500 transition-colors hover:text-slate-800 dark:hover:text-slate-200"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Back to list
        </button>
      ) : (
        <Button variant="outline" size="sm" className="h-8 text-xs" onClick={onClose}>
          ← Back
        </Button>
      )}

      {missingStream ? (
        <div className="flex items-start gap-3 rounded-lg border border-amber-200/80 bg-amber-50 px-4 py-3 text-sm text-amber-900 dark:border-amber-900/40 dark:bg-amber-950/30 dark:text-amber-200">
          <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
          <div>
            <p className="font-medium">No class assigned</p>
            <p className="mt-0.5 text-xs text-amber-800 dark:text-amber-300">
              Assign a grade and stream so this student appears in class lists
              and timetables.
            </p>
          </div>
        </div>
      ) : null}

      <div className={`${studentsPanel} overflow-hidden`}>
        <div className="bg-gradient-to-br from-slate-50/80 to-white px-4 py-5 dark:from-slate-900/40 dark:to-slate-900/20 sm:px-5">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start">
            <StudentInitials name={student.studentName} />
            <div className="min-w-0 flex-1">
              <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
                {student.studentName}
              </h2>
              <p className="mt-0.5 text-sm text-slate-500">
                {student.admissionNumber} · {student.gradeLevelName}
                {student.streamName ? ` · ${student.streamName}` : ""}
              </p>
              <div className="mt-2 flex flex-wrap items-center gap-2">
                <Badge
                  variant="outline"
                  className={cn(
                    "text-[10px] font-medium",
                    student.isActive
                      ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                      : "border-amber-200 bg-amber-50 text-amber-700",
                  )}
                >
                  {student.isActive ? "Active" : "Inactive"}
                </Badge>
                <Badge
                  variant="outline"
                  className="text-[10px] font-medium capitalize text-slate-600"
                >
                  {student.gender?.toLowerCase() || "—"}
                </Badge>
                <Badge
                  variant="outline"
                  className="text-[10px] font-medium capitalize text-slate-600"
                >
                  {student.schoolType}
                </Badge>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="h-7 gap-1 text-[10px]"
                  onClick={() => setShowAssignClassDialog(true)}
                >
                  <GraduationCap className="h-3 w-3" />
                  {student.gradeLevelId ? "Change class" : "Assign class"}
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <Tabs defaultValue="details">
        <TabsList className="mb-4 inline-flex h-10 w-full flex-wrap rounded-lg border border-slate-200/80 bg-slate-50/80 p-1 dark:border-slate-800 dark:bg-slate-900/60 sm:w-auto">
          {[
            { value: "details", label: "Details" },
            { value: "enrollment", label: "Enrollment" },
            { value: "fees", label: "Fees" },
            { value: "ledger", label: "Ledger" },
            { value: "account", label: "Account" },
            { value: "documents", label: "Documents" },
          ].map((tab) => (
            <TabsTrigger
              key={tab.value}
              value={tab.value}
              className="flex-1 rounded-md px-3 text-xs font-medium data-[state=active]:bg-white data-[state=active]:text-slate-900 data-[state=active]:shadow-sm sm:flex-none sm:px-4 dark:data-[state=active]:bg-slate-800 dark:data-[state=active]:text-slate-100"
            >
              {tab.label}
            </TabsTrigger>
          ))}
        </TabsList>

        <TabsContent value="details" className="mt-0">
          <div className={`${studentsPanel} overflow-hidden`}>
            <div className="border-b border-slate-100 px-4 py-3 dark:border-slate-800 sm:px-5">
              <h3 className="text-sm font-semibold text-slate-800 dark:text-slate-100">
                Personal &amp; contact
              </h3>
            </div>
            <div className="grid grid-cols-1 gap-5 p-4 sm:grid-cols-2 sm:p-5">
              <InfoGroup title="Personal" icon={User}>
                <DetailField label="Full name" value={student.studentName} />
                <DetailField
                  label="Gender"
                  value={
                    <span className="capitalize">
                      {student.gender?.toLowerCase() || "—"}
                    </span>
                  }
                />
                <DetailField
                  label="Admission number"
                  value={student.admissionNumber}
                  copyValue={student.admissionNumber}
                />
                <DetailField
                  label="Registered"
                  icon={Calendar}
                  value={new Date(student.createdAt).toLocaleDateString()}
                />
                <DetailField
                  label="Status"
                  value={student.isActive ? "Active" : "Inactive"}
                />
              </InfoGroup>

              <InfoGroup title="Contact" icon={Mail}>
                <DetailField
                  label="Email"
                  icon={Mail}
                  copyValue={student.email || undefined}
                  value={
                    student.email ? (
                      <a
                        href={`mailto:${student.email}`}
                        className="break-all text-emerald-700 hover:underline dark:text-emerald-400"
                      >
                        {student.email}
                      </a>
                    ) : (
                      <span className="text-slate-400">Not provided</span>
                    )
                  }
                />
                <DetailField
                  label="Phone"
                  icon={Phone}
                  copyValue={student.phone || undefined}
                  value={
                    student.phone ? (
                      <a href={`tel:${student.phone}`} className="hover:underline">
                        {student.phone}
                      </a>
                    ) : (
                      <span className="text-slate-400">Not provided</span>
                    )
                  }
                />
              </InfoGroup>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="enrollment" className="mt-0">
          <div className={`${studentsPanel} overflow-hidden`}>
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 px-4 py-3 dark:border-slate-800 sm:px-5">
              <div>
                <h3 className="text-sm font-semibold text-slate-800 dark:text-slate-100">
                  Class enrollment
                </h3>
                <p className="mt-0.5 text-xs text-slate-400">
                  Grade, curriculum, and stream assignment
                </p>
              </div>
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="h-8 gap-1.5 text-xs"
                onClick={() => setShowAssignClassDialog(true)}
              >
                <GraduationCap className="h-3.5 w-3.5" />
                {student.gradeLevelId ? "Change class" : "Assign class"}
              </Button>
            </div>
            <div className="grid grid-cols-1 gap-3 p-4 sm:grid-cols-3 sm:p-5">
              <DetailField
                label="Grade"
                icon={School}
                value={student.gradeLevelName}
              />
              <DetailField
                label="Curriculum"
                icon={BookOpen}
                value={student.curriculumName}
              />
              <DetailField
                label="Stream"
                icon={GraduationCap}
                value={
                  student.streamName ? (
                    student.streamName
                  ) : (
                    <span className="text-amber-700 dark:text-amber-400">
                      Not assigned
                    </span>
                  )
                }
              />
            </div>
          </div>
        </TabsContent>

        <TabsContent value="fees" className="mt-0">
          <div className={`${studentsPanel} overflow-hidden`}>
            <div className="border-b border-slate-100 px-4 py-3 dark:border-slate-800 sm:px-5">
              <h3 className="flex items-center gap-2 text-sm font-semibold text-slate-800 dark:text-slate-100">
                <Wallet className="h-4 w-4 text-slate-400" />
                Fee summary
              </h3>
            </div>
            <div className="space-y-4 p-4 sm:p-5">
              <dl className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                <div className="rounded-lg bg-slate-50/80 px-3 py-2.5 dark:bg-slate-800/30">
                  <dt className="text-[11px] font-medium uppercase tracking-wide text-slate-400">
                    Total owed
                  </dt>
                  <dd className="mt-1 text-sm font-semibold tabular-nums text-slate-800 dark:text-slate-100">
                    {formatCurrency(student.feeSummary.totalOwed)}
                  </dd>
                </div>
                <div className="rounded-lg bg-slate-50/80 px-3 py-2.5 dark:bg-slate-800/30">
                  <dt className="text-[11px] font-medium uppercase tracking-wide text-slate-400">
                    Paid
                  </dt>
                  <dd className="mt-1 text-sm font-semibold tabular-nums text-emerald-700">
                    {formatCurrency(student.feeSummary.totalPaid)}
                  </dd>
                </div>
                <div className="rounded-lg bg-slate-50/80 px-3 py-2.5 dark:bg-slate-800/30">
                  <dt className="text-[11px] font-medium uppercase tracking-wide text-slate-400">
                    Balance
                  </dt>
                  <dd
                    className={cn(
                      "mt-1 text-sm font-semibold tabular-nums",
                      student.feeSummary.balance > 0
                        ? "text-amber-700"
                        : "text-emerald-700",
                    )}
                  >
                    {formatCurrency(student.feeSummary.balance)}
                  </dd>
                </div>
                <div className="rounded-lg bg-slate-50/80 px-3 py-2.5 dark:bg-slate-800/30">
                  <dt className="text-[11px] font-medium uppercase tracking-wide text-slate-400">
                    Fee items
                  </dt>
                  <dd className="mt-1 text-sm font-semibold tabular-nums text-slate-800 dark:text-slate-100">
                    {student.feeSummary.numberOfFeeItems}
                  </dd>
                </div>
              </dl>

              {student.feeSummary.feeItems.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full text-xs">
                    <thead>
                      <tr className="border-b border-slate-100 text-left text-slate-400 dark:border-slate-800">
                        <th className="pb-2 pr-3 font-medium">Item</th>
                        <th className="pb-2 pr-3 font-medium">Amount</th>
                        <th className="pb-2 pr-3 font-medium">Type</th>
                        <th className="pb-2 pr-3 font-medium">Structure</th>
                        <th className="pb-2 font-medium">Year</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                      {student.feeSummary.feeItems.map((item) => (
                        <tr key={item.id}>
                          <td className="py-2 pr-3 text-slate-700 dark:text-slate-300">
                            {item.feeBucketName}
                          </td>
                          <td className="py-2 pr-3 tabular-nums">
                            {formatCurrency(item.amount)}
                          </td>
                          <td className="py-2 pr-3">
                            <Badge
                              variant="outline"
                              className={cn(
                                "text-[10px] font-normal",
                                item.isMandatory
                                  ? "border-slate-200 text-slate-600"
                                  : "border-sky-200 text-sky-700",
                              )}
                            >
                              {item.isMandatory ? "Mandatory" : "Optional"}
                            </Badge>
                          </td>
                          <td className="py-2 pr-3 text-slate-500">
                            {item.feeStructureName}
                          </td>
                          <td className="py-2 text-slate-500">
                            {item.academicYearName}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <EmptyPanel
                  icon={Wallet}
                  title="No fee items"
                  description="Fee assignments will appear here once configured for this student's grade."
                />
              )}
            </div>
          </div>
        </TabsContent>

        <TabsContent value="ledger" className="mt-0">
          <div className={`${studentsPanel} overflow-hidden`}>
            <div className="border-b border-slate-100 px-4 py-3 dark:border-slate-800 sm:px-5">
              <h3 className="flex items-center gap-2 text-sm font-semibold text-slate-800 dark:text-slate-100">
                <Receipt className="h-4 w-4 text-slate-400" />
                Fee ledger
              </h3>
            </div>
            <div className="p-4 sm:p-5">
              <StudentLedger
                ledgerData={ledgerData}
                loading={ledgerLoading}
                error={ledgerError}
              />
            </div>
          </div>
        </TabsContent>

        <TabsContent value="account" className="mt-0">
          <StudentAccountPanel
            studentName={student.studentName}
            email={student.email}
            userId={student.userId}
            isActive={student.isActive}
            onViewCredentials={() => void handleShowCredentials()}
          />
        </TabsContent>

        <TabsContent value="documents" className="mt-0">
          <div className={`${studentsPanel} overflow-hidden`}>
            <div className="border-b border-slate-100 px-4 py-3 dark:border-slate-800 sm:px-5">
              <h3 className="text-sm font-semibold text-slate-800 dark:text-slate-100">
                Documents
              </h3>
            </div>
            <div className="space-y-3 p-4 sm:p-5">
              <div className="overflow-hidden rounded-lg border border-slate-200/80 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() =>
                    setExpandedDocuments((prev) => ({
                      ...prev,
                      "report-card": !prev["report-card"],
                    }))
                  }
                  className="flex w-full items-center justify-between gap-3 bg-slate-50/50 px-3 py-3 text-left transition-colors hover:bg-slate-50 dark:bg-slate-800/30 dark:hover:bg-slate-800/50"
                >
                  <div className="flex items-center gap-3">
                    <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-slate-100 dark:bg-slate-800">
                      <BookOpen className="h-4 w-4 text-slate-500" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-slate-800 dark:text-slate-100">
                        Academic report card
                      </p>
                      <p className="text-xs text-slate-400">Term 1, 2024</p>
                    </div>
                  </div>
                  {expandedDocuments["report-card"] ? (
                    <ChevronDown className="h-4 w-4 text-slate-400" />
                  ) : (
                    <ChevronRight className="h-4 w-4 text-slate-400" />
                  )}
                </button>

                {expandedDocuments["report-card"] ? (
                  <div className="border-t border-slate-100 p-4 dark:border-slate-800">
                    <div className="mb-4 flex flex-wrap items-center gap-3">
                      <select
                        value={selectedTemplate}
                        onChange={(e) =>
                          setSelectedTemplate(
                            e.target.value as typeof selectedTemplate,
                          )
                        }
                        className="h-8 rounded-lg border border-slate-200 bg-white px-2 text-xs dark:border-slate-700 dark:bg-slate-900"
                      >
                        <option value="modern">Modern</option>
                        <option value="classic">Classic</option>
                        <option value="compact">Compact</option>
                        <option value="uganda-classic">Uganda classic</option>
                      </select>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        className="h-8 gap-1 text-xs"
                      >
                        <Download className="h-3.5 w-3.5" />
                        Download PDF
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        className="h-8 gap-1 text-xs"
                      >
                        <Printer className="h-3.5 w-3.5" />
                        Print
                      </Button>
                    </div>
                    <div className="overflow-hidden rounded-lg border border-slate-200/80 dark:border-slate-800">
                      <SchoolReportCard
                        student={{
                          id: student.id,
                          name: student.studentName,
                          admissionNumber: student.admissionNumber,
                          gender: student.gender,
                          grade: student.gradeLevelName,
                          stream: student.streamName || undefined,
                          user: { email: student.email },
                        }}
                        school={{
                          id: schoolConfig?.id || "school-id",
                          schoolName:
                            schoolConfig?.tenant?.schoolName || "School",
                          subdomain:
                            schoolConfig?.tenant?.subdomain || "school",
                        }}
                        subjects={
                          schoolConfig?.selectedLevels?.flatMap(
                            (level) => (level as { subjects?: unknown[] }).subjects ?? [],
                          ) || []
                        }
                        term="1"
                        year="2024"
                        template={selectedTemplate}
                      />
                    </div>
                  </div>
                ) : null}
              </div>

              <div className="overflow-hidden rounded-lg border border-slate-200/80 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() =>
                    setExpandedDocuments((prev) => ({
                      ...prev,
                      "other-docs": !prev["other-docs"],
                    }))
                  }
                  className="flex w-full items-center justify-between gap-3 bg-slate-50/50 px-3 py-3 text-left transition-colors hover:bg-slate-50 dark:bg-slate-800/30 dark:hover:bg-slate-800/50"
                >
                  <div className="flex items-center gap-3">
                    <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-slate-100 dark:bg-slate-800">
                      <FileText className="h-4 w-4 text-slate-500" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-slate-800 dark:text-slate-100">
                        Other documents
                      </p>
                      <p className="text-xs text-slate-400">
                        Additional uploads
                      </p>
                    </div>
                  </div>
                  {expandedDocuments["other-docs"] ? (
                    <ChevronDown className="h-4 w-4 text-slate-400" />
                  ) : (
                    <ChevronRight className="h-4 w-4 text-slate-400" />
                  )}
                </button>
                {expandedDocuments["other-docs"] ? (
                  <div className="border-t border-slate-100 p-4 dark:border-slate-800">
                    <EmptyPanel
                      icon={FileText}
                      title="No other documents"
                      description="Uploaded documents will appear here."
                    />
                  </div>
                ) : null}
              </div>
            </div>
          </div>
        </TabsContent>
      </Tabs>

      <StudentCredentialsDialog
        open={showCredentialsDialog}
        onOpenChange={setShowCredentialsDialog}
        studentName={student.studentName}
        credentials={credentials}
        loading={credentialsLoading}
        error={credentialsError}
        onRetry={() => void fetchCredentials()}
        copiedField={copiedField}
        onCopy={handleCopy}
      />

      <AssignGradeStreamDialog
        studentId={studentId}
        studentName={student.studentName}
        currentGradeLevelId={student.gradeLevelId}
        currentStreamId={student.streamId}
        open={showAssignClassDialog}
        onOpenChange={setShowAssignClassDialog}
        onSuccess={() => {
          refetch();
          onEnrollmentUpdated?.();
        }}
      />
    </div>
  );
}
