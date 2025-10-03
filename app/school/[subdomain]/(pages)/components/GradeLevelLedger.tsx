'use client'

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { 
  DollarSign, 
  Users, 
  TrendingUp, 
  TrendingDown, 
  Eye, 
  EyeOff,
  AlertCircle,
  Loader2
} from 'lucide-react';
import { useGradeLevelLedger, GradeLevelLedgerStudent } from '@/lib/hooks/use-grade-level-ledger';

interface GradeLevelLedgerProps {
  gradeLevelId: string;
  gradeName: string;
  dateRange: {
    startDate: string;
    endDate: string;
  };
}

// Helper function to format currency
const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('en-KE', {
    style: 'currency',
    currency: 'KES',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
};

// Helper function to get student status
const getStudentStatus = (student: GradeLevelLedgerStudent) => {
  const { totalInvoiced, totalPaid, totalBalance } = student.summary;
  
  // If total paid is 0, show not updated
  if (totalPaid === 0) {
    return {
      label: "Not Updated",
      className: "bg-yellow-50 text-yellow-600 border-yellow-200 font-mono"
    };
  }
  
  // If balance is 0 and there are invoices and payments, student is paid up
  if (totalBalance === 0 && totalPaid > 0) {
    return {
      label: "Paid up",
      className: "bg-green-50 text-green-600 border-green-200 font-mono"
    };
  }
  
  // If there's a positive balance, show amount due
  if (totalBalance > 0) {
    return {
      label: `${formatCurrency(totalBalance)} due`,
      className: "bg-red-50 text-red-600 border-red-200 font-mono"
    };
  }
  
  // If balance is negative, student has overpaid
  if (totalBalance < 0) {
    return {
      label: `Overpaid ${formatCurrency(Math.abs(totalBalance))}`,
      className: "bg-blue-50 text-blue-600 border-blue-200 font-mono"
    };
  }
  
  // Fallback for any other scenario
  return {
    label: "Unknown",
    className: "bg-gray-50 text-gray-600 border-gray-200 font-mono"
  };
};

export function GradeLevelLedger({ gradeLevelId, gradeName, dateRange }: GradeLevelLedgerProps) {
  const { ledgerData, loading, error } = useGradeLevelLedger({
    gradeLevelId,
    dateRange,
    skip: !gradeLevelId
  });

  const [showDetails, setShowDetails] = React.useState(false);

  if (loading) {
    return (
      <Card className="shadow-sm border-0 bg-gradient-to-br from-slate-50 to-slate-100/50 dark:from-slate-800 dark:to-slate-900/50">
        <CardHeader className="pb-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 dark:bg-blue-900/20">
              <Loader2 className="h-5 w-5 text-blue-600 dark:text-blue-400 animate-spin" />
            </div>
            <div>
              <CardTitle className="text-lg font-semibold text-slate-800 dark:text-slate-100">
                Student Ledger
              </CardTitle>
              <p className="text-sm text-slate-600 dark:text-slate-400">
                Loading financial data for {gradeName}...
              </p>
            </div>
          </div>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="bg-slate-100 dark:bg-slate-800 p-4 space-y-3 animate-pulse">
                  <div className="h-4 bg-slate-300 dark:bg-slate-600 w-24"></div>
                  <div className="h-8 bg-slate-300 dark:bg-slate-600 w-20"></div>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="shadow-sm border-0 bg-gradient-to-br from-red-50 to-red-100/50 dark:from-red-900/20 dark:to-red-800/20">
        <CardHeader className="pb-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-red-100 dark:bg-red-900/20">
              <AlertCircle className="h-5 w-5 text-red-600 dark:text-red-400" />
            </div>
            <div>
              <CardTitle className="text-lg font-semibold text-red-800 dark:text-red-200">
                Error Loading Ledger
              </CardTitle>
              <p className="text-sm text-red-600 dark:text-red-400">
                {error}
              </p>
            </div>
          </div>
        </CardHeader>
      </Card>
    );
  }

  if (!ledgerData?.ledgersByGradeLevel || ledgerData.ledgersByGradeLevel.length === 0) {
    return (
      <Card className="shadow-sm border-0 bg-gradient-to-br from-slate-50 to-slate-100/50 dark:from-slate-800 dark:to-slate-900/50">
        <CardHeader className="pb-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-slate-100 dark:bg-slate-800">
              <Users className="h-5 w-5 text-slate-600 dark:text-slate-400" />
            </div>
            <div>
              <CardTitle className="text-lg font-semibold text-slate-800 dark:text-slate-100">
                Student Ledger
              </CardTitle>
              <p className="text-sm text-slate-600 dark:text-slate-400">
                No student data available for {gradeName}
              </p>
            </div>
          </div>
        </CardHeader>
      </Card>
    );
  }

  const students = ledgerData.ledgersByGradeLevel;
  
  // Calculate summary statistics
  const totalStudents = students.length;
  const totalInvoiced = students.reduce((sum, student) => sum + student.summary.totalInvoiced, 0);
  const totalPaid = students.reduce((sum, student) => sum + student.summary.totalPaid, 0);
  const totalBalance = students.reduce((sum, student) => sum + student.summary.totalBalance, 0);

  return (
    <Card className="shadow-sm border-0 bg-gradient-to-br from-blue-50 to-blue-100/50 dark:from-blue-900/20 dark:to-blue-800/20">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 dark:bg-blue-900/20">
              <DollarSign className="h-5 w-5 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <CardTitle className="text-lg font-semibold text-slate-800 dark:text-slate-100">
                Student Ledger
              </CardTitle>
              <p className="text-sm text-slate-600 dark:text-slate-400">
                Financial overview for {gradeName} ({dateRange.startDate} to {dateRange.endDate})
              </p>
            </div>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowDetails(!showDetails)}
            className="border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 gap-2"
          >
            {showDetails ? (
              <>
                <EyeOff className="h-4 w-4" />
                Hide Details
              </>
            ) : (
              <>
                <Eye className="h-4 w-4" />
                Show Details
              </>
            )}
          </Button>
        </div>
      </CardHeader>

      <CardContent className="pt-0">
        <div className="space-y-6">
          {/* Summary Cards Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white dark:bg-slate-800 p-4 border border-slate-200 dark:border-slate-700 hover:border-primary/30 hover:shadow-sm transition-all duration-200">
              <div className="flex items-center justify-between mb-3">
                <p className="text-sm font-medium text-slate-600 dark:text-slate-400">
                  Total Students
                </p>
                <div className="p-1.5 bg-primary/10">
                  <Users className="h-4 w-4 text-primary" />
                </div>
              </div>
              <p className="text-2xl font-bold text-slate-800 dark:text-slate-200">
                {totalStudents}
              </p>
            </div>

            <div className="bg-white dark:bg-slate-800 p-4 border border-slate-200 dark:border-slate-700 hover:border-orange-400/50 hover:shadow-sm transition-all duration-200">
              <div className="flex items-center justify-between mb-3">
                <p className="text-sm font-medium text-slate-600 dark:text-slate-400">
                  Total Invoiced
                </p>
                <div className="p-1.5 bg-orange-100 dark:bg-orange-900/20">
                  <TrendingUp className="h-4 w-4 text-orange-600 dark:text-orange-400" />
                </div>
              </div>
              <p className="text-2xl font-bold text-slate-800 dark:text-slate-200">
                {formatCurrency(totalInvoiced)}
              </p>
            </div>

            <div className="bg-white dark:bg-slate-800 p-4 border border-slate-200 dark:border-slate-700 hover:border-green-400/50 hover:shadow-sm transition-all duration-200">
              <div className="flex items-center justify-between mb-3">
                <p className="text-sm font-medium text-slate-600 dark:text-slate-400">
                  Total Paid
                </p>
                <div className="p-1.5 bg-green-100 dark:bg-green-900/20">
                  <TrendingDown className="h-4 w-4 text-green-600 dark:text-green-400" />
                </div>
              </div>
              <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                {formatCurrency(totalPaid)}
              </p>
            </div>

            <div className="bg-white dark:bg-slate-800 p-4 border border-slate-200 dark:border-slate-700 hover:border-red-400/50 hover:shadow-sm transition-all duration-200">
              <div className="flex items-center justify-between mb-3">
                <p className="text-sm font-medium text-slate-600 dark:text-slate-400">
                  Outstanding
                </p>
                <div className="p-1.5 bg-red-100 dark:bg-red-900/20">
                  <DollarSign className="h-4 w-4 text-red-600 dark:text-red-400" />
                </div>
              </div>
              <p className="text-2xl font-bold text-red-600 dark:text-red-400">
                {formatCurrency(totalBalance)}
              </p>
            </div>
          </div>

          {/* Student Details Table */}
          {showDetails && (
            <div className="space-y-4">
              <h4 className="text-base font-semibold text-slate-700 dark:text-slate-300">
                Student Financial Details
              </h4>

              {/* Desktop Table View */}
              <div className="hidden lg:block bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 overflow-hidden">
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-slate-50 dark:bg-slate-700/50">
                        <TableHead className="text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider">
                          Admission
                        </TableHead>
                        <TableHead className="text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider">
                          Student Name
                        </TableHead>
                        <TableHead className="text-right text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider">
                          Invoiced
                        </TableHead>
                        <TableHead className="text-right text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider">
                          Paid
                        </TableHead>
                        <TableHead className="text-right text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider">
                          Balance
                        </TableHead>
                        <TableHead className="text-center text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider">
                          Status
                        </TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {students.map((student) => {
                        const status = getStudentStatus(student);
                        return (
                          <TableRow key={student.studentId} className="hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors">
                            <TableCell className="text-sm font-medium text-slate-700 dark:text-slate-300">
                              {student.student.admission_number}
                            </TableCell>
                            <TableCell className="text-sm font-medium text-slate-800 dark:text-slate-200">
                              {student.student.user.name}
                            </TableCell>
                            <TableCell className="text-sm text-right font-medium text-slate-700 dark:text-slate-300">
                              {formatCurrency(student.summary.totalInvoiced)}
                            </TableCell>
                            <TableCell className="text-sm text-right font-medium text-green-600 dark:text-green-400">
                              {formatCurrency(student.summary.totalPaid)}
                            </TableCell>
                            <TableCell className="text-sm text-right font-semibold text-red-600 dark:text-red-400">
                              {formatCurrency(student.summary.totalBalance)}
                            </TableCell>
                            <TableCell className="text-center">
                              <Badge 
                                variant="outline" 
                                className={`text-xs ${status.className}`}
                              >
                                {status.label}
                              </Badge>
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </div>
              </div>

              {/* Mobile Card View */}
              <div className="lg:hidden space-y-3">
                {students.map((student) => {
                  const status = getStudentStatus(student);
                  return (
                    <div 
                      key={student.studentId} 
                      className="bg-white dark:bg-slate-800 p-4 border border-slate-200 dark:border-slate-700 space-y-4"
                    >
                      <div className="flex items-start justify-between">
                        <div>
                          <p className="font-semibold text-slate-800 dark:text-slate-200">
                            {student.student.user.name}
                          </p>
                          <p className="text-sm font-medium text-slate-600 dark:text-slate-400">
                            {student.student.admission_number}
                          </p>
                        </div>
                        <Badge 
                          variant="outline" 
                          className={`text-xs ${status.className}`}
                        >
                          {status.label}
                        </Badge>
                      </div>

                      <div className="grid grid-cols-3 gap-3">
                        <div className="space-y-1">
                          <p className="text-xs font-medium text-slate-600 dark:text-slate-400">Invoiced</p>
                          <p className="text-lg font-bold text-slate-800 dark:text-slate-200">
                            {formatCurrency(student.summary.totalInvoiced)}
                          </p>
                        </div>
                        <div className="space-y-1">
                          <p className="text-xs font-medium text-slate-600 dark:text-slate-400">Paid</p>
                          <p className="text-lg font-bold text-green-600 dark:text-green-400">
                            {formatCurrency(student.summary.totalPaid)}
                          </p>
                        </div>
                        <div className="space-y-1">
                          <p className="text-xs font-medium text-slate-600 dark:text-slate-400">Balance</p>
                          <p className="text-lg font-bold text-red-600 dark:text-red-400">
                            {formatCurrency(student.summary.totalBalance)}
                          </p>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
