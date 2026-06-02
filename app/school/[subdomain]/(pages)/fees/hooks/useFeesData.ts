import { useState, useMemo } from "react";
import { FeeInvoice, StudentSummary, SummaryStats } from "../types";
import { useStudentsSummary } from "@/lib/hooks/useStudentsSummary";
import { useStudentInvoices } from "./useStudentInvoices";

/**
 * Derive invoice-like records from real student fee summaries.
 * Each student becomes one "invoice" row with their aggregated fee data.
 */
function studentsToInvoices(students: StudentSummary[]): FeeInvoice[] {
  return students.map((s, i) => ({
    id: s.id,
    studentId: s.id,
    studentName: s.name,
    admissionNumber: s.admissionNumber,
    class: s.class,
    section: s.section || "",
    feeType: "tuition",
    totalAmount: s.totalOutstanding + s.totalPaid,
    amountPaid: s.totalPaid,
    amountDue: s.totalOutstanding,
    dueDate: new Date().toISOString().split("T")[0],
    paymentStatus:
      s.totalOutstanding === 0
        ? "paid"
        : s.invoiceCount === 0
          ? "pending"
          : s.totalPaid > 0
            ? "partial"
            : "pending",
    invoiceDate: new Date().toISOString().split("T")[0],
    term: "",
    academicYear: "",
    paymentHistory: [],
    remindersSent: 0,
    invoiceIndex: i,
  }));
}

export const useFeesData = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedFeeType, setSelectedFeeType] = useState<string>("all");
  const [selectedStatus, setSelectedStatus] = useState<string>("all");
  const [selectedClass, setSelectedClass] = useState<string>("all");
  const [selectedSection, setSelectedSection] = useState<string>("all");
  const [dueDateFilter, setDueDateFilter] = useState<string>("all");
  const [selectedStudent, setSelectedStudent] = useState<string | null>(null);

  // Fetch students using the summary query (real API data with feeSummary)
  const { students } = useStudentsSummary();

  // Map API students to StudentSummary for the sidebar
  const allStudents = useMemo(() => {
    const mapped: StudentSummary[] = students.map((s) => ({
      id: s.id,
      name: s.studentName,
      admissionNumber: s.admissionNumber,
      class: s.gradeLevelName,
      section: "",
      totalOutstanding: s.feeSummary.balance,
      totalPaid: s.feeSummary.totalPaid,
      invoiceCount: s.feeSummary.numberOfFeeItems,
      overdueCount: 0,
    }));
    return mapped.sort((a, b) => a.name.localeCompare(b.name));
  }, [students]);

  // Filter by grade, then search term
  const filteredStudents = useMemo(() => {
    let list = allStudents;
    if (selectedClass && selectedClass !== "all") {
      list = list.filter(
        (student) =>
          student.class === selectedClass ||
          student.class?.includes(selectedClass),
      );
    }
    if (!searchTerm) return list;
    const q = searchTerm.toLowerCase();
    return list.filter(
      (student) =>
        student.name.toLowerCase().includes(q) ||
        student.admissionNumber.toLowerCase().includes(q),
    );
  }, [allStudents, searchTerm, selectedClass]);

  // Get invoices for selected student using GraphQL
  const {
    invoices: selectedStudentInvoices,
    loading: selectedStudentInvoicesLoading,
    error: selectedStudentInvoicesError,
  } = useStudentInvoices(selectedStudent);

  // Derive invoice-like records from real student data for filtering/display
  const derivedInvoices = useMemo(
    () => studentsToInvoices(allStudents),
    [allStudents],
  );

  // Filter derived invoices for the legacy invoice table view
  const filteredInvoices = useMemo(() => {
    let filtered = derivedInvoices.filter((invoice) => {
      const matchesSearch =
        searchTerm === "" ||
        invoice.studentName.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesFeeType =
        selectedFeeType === "all" || invoice.feeType === selectedFeeType;
      const matchesStatus =
        selectedStatus === "all" || invoice.paymentStatus === selectedStatus;
      const matchesClass =
        selectedClass === "all" || invoice.class === selectedClass;
      const matchesSection =
        selectedSection === "all" || invoice.section === selectedSection;

      return (
        matchesSearch &&
        matchesFeeType &&
        matchesStatus &&
        matchesClass &&
        matchesSection
      );
    });

    return filtered.sort(
      (a, b) => (b.invoiceIndex ?? 0) - (a.invoiceIndex ?? 0),
    );
  }, [
    derivedInvoices,
    searchTerm,
    selectedFeeType,
    selectedStatus,
    selectedClass,
    selectedSection,
  ]);

  // Calculate summary statistics from real student data
  const summaryStats = useMemo((): SummaryStats => {
    const totalCollected = allStudents.reduce((sum, s) => sum + s.totalPaid, 0);
    const totalOutstanding = allStudents.reduce(
      (sum, s) => sum + s.totalOutstanding,
      0,
    );
    const studentsWithPendingFees = allStudents.filter(
      (s) => s.totalOutstanding > 0,
    ).length;
    const overdueCount = allStudents.filter((s) => s.overdueCount > 0).length;
    const grossTotal = totalCollected + totalOutstanding;
    const collectionRate =
      grossTotal > 0 ? (totalCollected / grossTotal) * 100 : 0;

    return {
      totalCollected,
      totalOutstanding,
      studentsWithPendingFees,
      upcomingDueCount: 0, // Not available from summary — would need a separate query
      overdueCount,
      collectionRate,
    };
  }, [allStudents]);

  return {
    // State
    searchTerm,
    setSearchTerm,
    selectedFeeType,
    setSelectedFeeType,
    selectedStatus,
    setSelectedStatus,
    selectedClass,
    setSelectedClass,
    selectedSection,
    setSelectedSection,
    dueDateFilter,
    setDueDateFilter,
    selectedStudent,
    setSelectedStudent,

    // Computed data
    allStudents,
    filteredStudents,
    selectedStudentInvoices,
    selectedStudentInvoicesLoading,
    selectedStudentInvoicesError,
    filteredInvoices,
    summaryStats,
  };
};
