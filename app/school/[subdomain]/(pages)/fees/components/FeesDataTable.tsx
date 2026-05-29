import { Eye, Coins } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { cn } from "@/lib/utils";
import { StudentSummaryFromAPI } from "../types";
import { formatCurrency } from "../utils";

interface FeesDataTableProps {
  students: StudentSummaryFromAPI[];
  loading: boolean;
  error: string | null;
  selectedStudents: string[];
  onSelectStudent: (studentId: string) => void;
  onSelectAll: () => void;
  onViewStudent: (student: StudentSummaryFromAPI) => void;
}

export const FeesDataTable = ({
  students,
  loading,
  error,
  selectedStudents,
  onSelectStudent,
  onSelectAll,
  onViewStudent,
}: FeesDataTableProps) => {
  const getStudentStatus = (student: StudentSummaryFromAPI) => {
    const { totalOwed, totalPaid, balance, numberOfFeeItems } =
      student.feeSummary;

    if (balance === 0 && totalPaid === 0 && numberOfFeeItems === 0) {
      return {
        label: "Pending",
        className: "bg-amber-50 text-amber-700 border-amber-200",
      };
    }

    if (balance === 0 && totalPaid > 0) {
      return {
        label: "Paid up",
        className: "bg-emerald-50 text-emerald-700 border-emerald-200",
      };
    }

    if (balance > 0) {
      return {
        label: `${formatCurrency(balance)} due`,
        className: "bg-rose-50 text-rose-700 border-rose-200",
      };
    }

    if (balance < 0) {
      return {
        label: `Credit ${formatCurrency(Math.abs(balance))}`,
        className: "bg-blue-50 text-blue-700 border-blue-200",
      };
    }

    return {
      label: "—",
      className: "bg-slate-50 text-slate-500 border-slate-200",
    };
  };

  if (loading) {
    return (
      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">
        <div className="flex flex-col items-center justify-center py-16">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-slate-300 border-t-slate-600" />
          <p className="mt-4 text-sm text-slate-500">
            Loading student balances…
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="overflow-hidden rounded-xl border border-rose-200 bg-rose-50/50">
        <div className="flex flex-col items-center justify-center py-16">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-rose-100">
            <Coins className="h-5 w-5 text-rose-500" />
          </div>
          <p className="mt-3 text-sm font-medium text-rose-700">
            Could not load data
          </p>
          <p className="mt-1 text-xs text-rose-500">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-200 bg-slate-50/50 px-5 py-3">
        <h3 className="text-sm font-semibold tracking-tight text-slate-900">
          Student balances
        </h3>
        <p className="text-xs tabular-nums text-slate-500">
          {students.length} student{students.length !== 1 ? "s" : ""}
        </p>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow className="border-slate-200 hover:bg-transparent">
              <TableHead className="w-12">
                <Checkbox
                  checked={
                    selectedStudents.length === students.length &&
                    students.length > 0
                  }
                  onCheckedChange={onSelectAll}
                />
              </TableHead>
              <TableHead className="text-xs font-medium text-slate-500">
                Student
              </TableHead>
              <TableHead className="text-xs font-medium text-slate-500">
                Class
              </TableHead>
              <TableHead className="text-xs font-medium text-slate-500">
                Owed
              </TableHead>
              <TableHead className="text-xs font-medium text-slate-500">
                Paid
              </TableHead>
              <TableHead className="text-xs font-medium text-slate-500">
                Balance
              </TableHead>
              <TableHead className="text-xs font-medium text-slate-500">
                Status
              </TableHead>
              <TableHead className="w-16" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {students.map((student) => {
              const status = getStudentStatus(student);
              return (
                <TableRow
                  key={student.id}
                  className="border-slate-100 transition-colors hover:bg-slate-50"
                >
                  <TableCell>
                    <Checkbox
                      checked={selectedStudents.includes(student.id)}
                      onCheckedChange={() => onSelectStudent(student.id)}
                    />
                  </TableCell>
                  <TableCell>
                    <div>
                      <p className="text-sm font-medium text-slate-900">
                        {student.studentName}
                      </p>
                      <p className="text-xs text-slate-400">
                        {student.admissionNumber}
                      </p>
                    </div>
                  </TableCell>
                  <TableCell className="text-sm text-slate-600">
                    {student.gradeLevelName}
                  </TableCell>
                  <TableCell className="text-sm tabular-nums text-slate-600">
                    {formatCurrency(student.feeSummary.totalOwed)}
                  </TableCell>
                  <TableCell className="text-sm tabular-nums text-emerald-600">
                    {formatCurrency(student.feeSummary.totalPaid)}
                  </TableCell>
                  <TableCell
                    className={cn(
                      "text-sm font-semibold tabular-nums",
                      student.feeSummary.balance > 0
                        ? "text-rose-600"
                        : student.feeSummary.balance < 0
                          ? "text-blue-600"
                          : "text-slate-400",
                    )}
                  >
                    {formatCurrency(student.feeSummary.balance)}
                  </TableCell>
                  <TableCell>
                    <span
                      className={cn(
                        "inline-flex items-center rounded-md border px-2 py-0.5 text-xs font-medium",
                        status.className,
                      )}
                    >
                      {status.label}
                    </span>
                  </TableCell>
                  <TableCell>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onViewStudent(student)}
                      className="h-8 text-xs font-medium text-slate-500 hover:text-slate-700"
                    >
                      <Eye className="mr-1 h-3 w-3" />
                      View
                    </Button>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>

      {/* Empty state */}
      {students.length === 0 && (
        <div className="flex flex-col items-center justify-center border-t border-dashed border-slate-200 py-16">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-slate-100">
            <Coins className="h-5 w-5 text-slate-400" />
          </div>
          <p className="mt-3 text-sm font-medium text-slate-500">
            No students with fee records
          </p>
          <p className="mt-1 text-xs text-slate-400">
            Generate invoices to see student balances here
          </p>
        </div>
      )}
    </div>
  );
};
