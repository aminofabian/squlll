import React, { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Edit, Trash2, Eye, ChevronLeft, ChevronRight } from "lucide-react";

interface Student {
  id: string;
  name: string;
  session?: string;
  gender: string;
  dob: string;
  class: string;
  section?: string;
  guardianName: string;
  guardianEmail: string;
  guardianMobile: string;
  status: string;
}

interface AllGradesStudentsTableProps {
  students: Student[];
  onStudentClick?: (studentId: string) => void;
}

const PAGE_SIZE = 10;

export default function AllGradesStudentsTable({ students, onStudentClick }: AllGradesStudentsTableProps) {
  const [page, setPage] = useState(1);
  const totalPages = Math.ceil(students.length / PAGE_SIZE);

  const paginated = students.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  return (
    <div className="space-y-6">
      {/* Table Header */}
      <div className="border-2 border-primary/20 bg-primary/5 rounded-xl p-6">
        <div className="inline-block w-fit px-3 py-1 bg-primary/10 border border-primary/20 rounded-md mb-4">
          <span className="text-xs font-mono uppercase tracking-wide text-primary">
            Students Table
          </span>
        </div>
        <h2 className="text-xl font-mono font-bold tracking-wide text-slate-900 dark:text-slate-100 mb-2">
          All Students
        </h2>
        <p className="text-sm text-slate-600 dark:text-slate-400 font-medium">
          Showing {paginated.length} of {students.length} students
        </p>
      </div>

      {/* Table Container - Desktop */}
      <div className="hidden min-[1600px]:block border-2 border-primary/20 bg-white dark:bg-slate-800 rounded-xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="bg-primary/5 border-b-2 border-primary/20 hover:bg-primary/5">
                <TableHead className="font-mono text-xs uppercase tracking-wide text-primary font-bold px-4 py-3">
                  S/N
                </TableHead>
                <TableHead className="font-mono text-xs uppercase tracking-wide text-primary font-bold px-4 py-3">
                  Student Name
                </TableHead>
                <TableHead className="font-mono text-xs uppercase tracking-wide text-primary font-bold px-4 py-3">
                  Session
                </TableHead>
                <TableHead className="font-mono text-xs uppercase tracking-wide text-primary font-bold px-4 py-3">
                  Gender
                </TableHead>
                <TableHead className="font-mono text-xs uppercase tracking-wide text-primary font-bold px-4 py-3">
                  DOB
                </TableHead>
                <TableHead className="font-mono text-xs uppercase tracking-wide text-primary font-bold px-4 py-3">
                  Class
                </TableHead>
                <TableHead className="font-mono text-xs uppercase tracking-wide text-primary font-bold px-4 py-3">
                  Section
                </TableHead>
                <TableHead className="font-mono text-xs uppercase tracking-wide text-primary font-bold px-4 py-3">
                  Guardian Name
                </TableHead>
                <TableHead className="font-mono text-xs uppercase tracking-wide text-primary font-bold px-4 py-3">
                  Guardian Email
                </TableHead>
                <TableHead className="font-mono text-xs uppercase tracking-wide text-primary font-bold px-4 py-3">
                  Guardian Mobile
                </TableHead>
                <TableHead className="font-mono text-xs uppercase tracking-wide text-primary font-bold px-4 py-3">
                  Status
                </TableHead>
                <TableHead className="font-mono text-xs uppercase tracking-wide text-primary font-bold px-4 py-3">
                  Action
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginated.map((student, idx) => (
                <TableRow 
                  key={student.id}
                  className={`border-b border-primary/10 transition-all duration-200 ${
                    onStudentClick 
                      ? "cursor-pointer hover:bg-primary/5 hover:border-primary/20" 
                      : "hover:bg-slate-50 dark:hover:bg-slate-700"
                  }`}
                  onClick={() => onStudentClick?.(student.id)}
                >
                  <TableCell className="font-mono text-sm text-slate-700 dark:text-slate-300 px-4 py-3">
                    {(page - 1) * PAGE_SIZE + idx + 1}
                  </TableCell>
                  <TableCell className="font-mono font-medium text-slate-900 dark:text-slate-100 px-4 py-3">
                    {student.name}
                  </TableCell>
                  <TableCell className="font-mono text-sm text-slate-600 dark:text-slate-400 px-4 py-3">
                    {student.session || "2023-2024"}
                  </TableCell>
                  <TableCell className="font-mono text-sm text-slate-700 dark:text-slate-300 px-4 py-3">
                    <span className="capitalize">{student.gender}</span>
                  </TableCell>
                  <TableCell className="font-mono text-sm text-slate-600 dark:text-slate-400 px-4 py-3">
                    {student.dob}
                  </TableCell>
                  <TableCell className="font-mono font-medium text-primary px-4 py-3">
                    {student.class}
                  </TableCell>
                  <TableCell className="font-mono text-sm text-slate-600 dark:text-slate-400 px-4 py-3">
                    {student.section || "-"}
                  </TableCell>
                  <TableCell className="font-mono text-sm text-slate-700 dark:text-slate-300 px-4 py-3">
                    {student.guardianName}
                  </TableCell>
                  <TableCell className="font-mono text-sm text-slate-600 dark:text-slate-400 px-4 py-3">
                    {student.guardianEmail}
                  </TableCell>
                  <TableCell className="font-mono text-sm text-slate-700 dark:text-slate-300 px-4 py-3">
                    {student.guardianMobile}
                  </TableCell>
                  <TableCell className="px-4 py-3">
                    <Badge
                      variant="outline"
                      className={`font-mono text-xs capitalize border-2 ${
                        student.status === "active" 
                          ? "bg-green-50 text-green-700 border-green-200 dark:bg-green-900/20 dark:text-green-400 dark:border-green-800" 
                          : "bg-red-50 text-red-700 border-red-200 dark:bg-red-900/20 dark:text-red-400 dark:border-red-800"
                      }`}
                    >
                      {student.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="px-4 py-3">
                    <div className="flex gap-1">
                      <Button 
                        size="icon" 
                        variant="ghost"
                        className="h-8 w-8 text-primary hover:bg-primary/10 hover:text-primary border border-primary/20"
                        onClick={(e) => {
                          e.stopPropagation();
                          onStudentClick?.(student.id);
                        }}
                      >
                        <Eye className="w-3.5 h-3.5" />
                      </Button>
                      <Button 
                        size="icon" 
                        variant="ghost"
                        className="h-8 w-8 text-slate-600 hover:bg-slate-100 hover:text-slate-800 border border-slate-200"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <Edit className="w-3.5 h-3.5" />
                      </Button>
                      <Button 
                        size="icon" 
                        variant="ghost"
                        className="h-8 w-8 text-red-600 hover:bg-red-50 hover:text-red-700 border border-red-200"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>

      {/* Responsive Cards - Mobile/Tablet */}
      <div className="min-[1600px]:hidden space-y-4">
        {paginated.map((student, idx) => (
          <div 
            key={student.id}
            className={`border-2 border-primary/20 bg-white dark:bg-slate-800 rounded-xl p-6 transition-all duration-200 ${
              onStudentClick 
                ? "cursor-pointer hover:bg-primary/5 hover:border-primary/40" 
                : "hover:bg-slate-50 dark:hover:bg-slate-700"
            }`}
            onClick={() => onStudentClick?.(student.id)}
          >
            {/* Header Section - Student Identity */}
            <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between mb-8 pb-5 border-b-2 border-primary/10">
              <div className="flex items-start gap-5 mb-4 sm:mb-0">
                <div className="flex items-center justify-center w-12 h-12 bg-primary/10 rounded-full border-2 border-primary/20 flex-shrink-0">
                  <span className="font-mono text-sm font-bold text-primary">
                    {(page - 1) * PAGE_SIZE + idx + 1}
                  </span>
                </div>
                <div className="min-w-0 flex-1">
                  <h3 className="font-mono font-bold text-xl text-slate-900 dark:text-slate-100 mb-2">
                    {student.name}
                  </h3>
                  <p className="font-mono text-sm text-primary font-medium">
                    Class {student.class} {student.section && `• Section ${student.section}`}
                  </p>
                </div>
              </div>
              <div className="flex-shrink-0">
                <Badge
                  variant="outline"
                  className={`font-mono text-xs capitalize border-2 px-3 py-1 ${
                    student.status === "active" 
                      ? "bg-green-50 text-green-700 border-green-200 dark:bg-green-900/20 dark:text-green-400 dark:border-green-800" 
                      : "bg-red-50 text-red-700 border-red-200 dark:bg-red-900/20 dark:text-red-400 dark:border-red-800"
                  }`}
                >
                  {student.status}
                </Badge>
              </div>
            </div>

            {/* Student Details Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
              {/* Two-column layout with row alignment */}
              <div className="grid-rows-auto">
                <h4 className="font-mono text-sm uppercase tracking-wide text-primary font-bold border-b-2 border-primary/20 pb-3 mb-6">
                  Personal Information
                </h4>
                <div className="space-y-4">
                  {/* Row 1 */}
                  <div className="flex justify-between items-center py-2 h-[42px]">
                    <span className="font-mono text-xs text-slate-500 dark:text-slate-400 uppercase tracking-wide font-medium">
                      Gender
                    </span>
                    <span className="font-mono text-sm text-slate-700 dark:text-slate-300 capitalize font-semibold">
                      {student.gender}
                    </span>
                  </div>
                  {/* Row 2 */}
                  <div className="flex justify-between items-center py-2 h-[42px]">
                    <span className="font-mono text-xs text-slate-500 dark:text-slate-400 uppercase tracking-wide font-medium">
                      Date of Birth
                    </span>
                    <span className="font-mono text-sm text-slate-700 dark:text-slate-300 font-semibold">
                      {student.dob}
                    </span>
                  </div>
                  {/* Row 3 */}
                  <div className="flex justify-between items-center py-2 h-[42px]">
                    <span className="font-mono text-xs text-slate-500 dark:text-slate-400 uppercase tracking-wide font-medium">
                      Session
                    </span>
                    <span className="font-mono text-sm text-slate-700 dark:text-slate-300 font-semibold">
                      {student.session || "2023-2024"}
                    </span>
                  </div>
                </div>
              </div>

              {/* Guardian Information */}
              <div className="grid-rows-auto">
                <h4 className="font-mono text-sm uppercase tracking-wide text-primary font-bold border-b-2 border-primary/20 pb-3 mb-6">
                  Guardian Information
                </h4>
                <div className="space-y-4">
                  {/* Row 1 */}
                  <div className="flex justify-between items-center py-2 h-[42px]">
                    <span className="font-mono text-xs text-slate-500 dark:text-slate-400 uppercase tracking-wide font-medium">
                      Name
                    </span>
                    <span className="font-mono text-sm text-slate-700 dark:text-slate-300 font-semibold">
                      {student.guardianName}
                    </span>
                  </div>
                  {/* Row 2 */}
                  <div className="flex justify-between items-center py-2 h-[42px]">
                    <span className="font-mono text-xs text-slate-500 dark:text-slate-400 uppercase tracking-wide font-medium">
                      Email
                    </span>
                    <span className="font-mono text-sm text-slate-600 dark:text-slate-400 text-right break-all max-w-[60%]">
                      {student.guardianEmail}
                    </span>
                  </div>
                  {/* Row 3 */}
                  <div className="flex justify-between items-center py-2 h-[42px]">
                    <span className="font-mono text-xs text-slate-500 dark:text-slate-400 uppercase tracking-wide font-medium">
                      Mobile
                    </span>
                    <span className="font-mono text-sm text-slate-700 dark:text-slate-300 font-semibold">
                      {student.guardianMobile}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Actions Row */}
            <div className="flex justify-end gap-2 pt-2 border-t border-primary/10">
              <Button 
                size="sm" 
                variant="ghost"
                className="h-8 px-3 text-primary hover:bg-primary/10 hover:text-primary border border-primary/20"
                onClick={(e) => {
                  e.stopPropagation();
                  onStudentClick?.(student.id);
                }}
              >
                <Eye className="w-3.5 h-3.5 mr-1" />
                View
              </Button>
              <Button 
                size="sm" 
                variant="ghost"
                className="h-8 px-3 text-slate-600 hover:bg-slate-100 hover:text-slate-800 border border-slate-200"
                onClick={(e) => e.stopPropagation()}
              >
                <Edit className="w-3.5 h-3.5 mr-1" />
                Edit
              </Button>
              <Button 
                size="sm" 
                variant="ghost"
                className="h-8 px-3 text-red-600 hover:bg-red-50 hover:text-red-700 border border-red-200"
                onClick={(e) => e.stopPropagation()}
              >
                <Trash2 className="w-3.5 h-3.5 mr-1" />
                Delete
              </Button>
            </div>
          </div>
        ))}
      </div>

      {/* Pagination Controls */}
      {totalPages > 1 && (
        <div className="border-2 border-primary/20 bg-primary/5 rounded-xl p-6">
          <div className="flex items-center justify-between">
            <Button
              variant="outline"
              size="sm"
              disabled={page === 1}
              onClick={() => setPage(page - 1)}
              className="border-primary/20 text-primary hover:bg-primary/5 hover:border-primary/40 font-mono disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ChevronLeft className="w-4 h-4 mr-2" />
              Previous
            </Button>
            
            <div className="flex items-center gap-2">
              <span className="text-sm font-mono text-slate-600 dark:text-slate-400">
                Page {page} of {totalPages}
              </span>
              <div className="flex gap-1">
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  const pageNumber = i + 1;
                  const isActive = page === pageNumber;
                  
                  return (
                    <Button
                      key={i}
                      size="sm"
                      variant={isActive ? "default" : "outline"}
                      onClick={() => setPage(pageNumber)}
                      className={`w-8 h-8 font-mono text-xs ${
                        isActive 
                          ? "bg-primary hover:bg-primary/90 text-white" 
                          : "border-primary/20 text-primary hover:bg-primary/5 hover:border-primary/40"
                      }`}
                    >
                      {pageNumber}
                    </Button>
                  );
                })}
              </div>
            </div>
            
            <Button
              variant="outline"
              size="sm"
              disabled={page === totalPages}
              onClick={() => setPage(page + 1)}
              className="border-primary/20 text-primary hover:bg-primary/5 hover:border-primary/40 font-mono disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Next
              <ChevronRight className="w-4 h-4 ml-2" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
} 