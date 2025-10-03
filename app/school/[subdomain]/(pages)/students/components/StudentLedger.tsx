"use client";

import React from "react";
import { Badge } from "@/components/ui/badge";
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { 
  Receipt, 
  Calendar, 
  DollarSign, 
  FileText, 
  TrendingUp,
  TrendingDown,
  Clock,
  User,
  GraduationCap
} from "lucide-react";

// Types based on your GraphQL response
interface StudentLedgerEntry {
  date: string;
  description: string;
  reference: string;
  debit: number;
  credit: number;
  balance: number;
  invoiceNumber: string | null;
  receiptNumber: string | null;
}

interface StudentLedgerSummary {
  totalInvoiced: number;
  totalPaid: number;
  totalBalance: number;
  invoiceCount: number;
  paymentCount: number;
  lastPaymentDate: string | null;
  averagePaymentAmount: number;
}

interface StudentLedgerData {
  studentId: string;
  student: {
    admission_number: string;
    user: {
      name: string;
      email: string;
    };
    grade: {
      shortName: string | null;
    };
  };
  entries: StudentLedgerEntry[];
  summary: StudentLedgerSummary;
  generatedAt: string;
  dateRangeStart: string;
  dateRangeEnd: string;
  isFallbackData?: boolean;
}

interface StudentLedgerProps {
  ledgerData: StudentLedgerData | null;
  loading?: boolean;
  error?: string | null;
}

export function StudentLedger({ ledgerData, loading, error }: StudentLedgerProps) {
  // Format currency - Kenya uses KES (Kenyan Shilling)
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-KE', {
      style: 'currency',
      currency: 'KES',
      minimumFractionDigits: 0
    }).format(amount);
  };

  // Format date
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-KE', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  // Format date with time
  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleString('en-KE', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Get entry type and styling
  const getEntryType = (entry: StudentLedgerEntry) => {
    if (entry.debit > 0) {
      return {
        type: "Invoice",
        icon: <FileText className="h-4 w-4" />,
        className: "bg-red-50 text-red-700 border-red-200",
        amountClass: "text-red-600 font-semibold"
      };
    } else if (entry.credit > 0) {
      return {
        type: "Payment",
        icon: <Receipt className="h-4 w-4" />,
        className: "bg-green-50 text-green-700 border-green-200",
        amountClass: "text-green-600 font-semibold"
      };
    }
    return {
      type: "Adjustment",
      icon: <DollarSign className="h-4 w-4" />,
      className: "bg-blue-50 text-blue-700 border-blue-200",
      amountClass: "text-blue-600 font-semibold"
    };
  };

  if (loading) {
    return (
      <Card className="border-2 border-primary/20">
        <CardContent className="p-12 text-center">
          <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-sm font-mono text-slate-600">Loading student ledger...</p>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="border-2 border-red-200 bg-red-50">
        <CardContent className="p-12 text-center">
          <Receipt className="h-12 w-12 text-red-400 mx-auto mb-4" />
          <h3 className="text-lg font-mono font-medium text-red-600 mb-2">
            Error Loading Ledger
          </h3>
          <p className="text-sm text-red-500 font-mono">{error}</p>
        </CardContent>
      </Card>
    );
  }

  if (!ledgerData) {
    return (
      <Card className="border-2 border-yellow-200 bg-yellow-50">
        <CardContent className="p-12 text-center">
          <Receipt className="h-12 w-12 text-yellow-400 mx-auto mb-4" />
          <h3 className="text-lg font-mono font-medium text-yellow-600 mb-2">
            No Ledger Data Available
          </h3>
          <p className="text-sm text-yellow-500 font-mono">
            Ledger data is not available for this student
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Fallback Data Notice */}
      {ledgerData?.isFallbackData && (
        <Card className="border-2 border-yellow-200 bg-yellow-50">
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
              <span className="text-sm font-mono text-yellow-700">
                Showing basic financial summary. Detailed transaction history will be available when the ledger query is implemented.
              </span>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Student Info Header */}
      <Card className="border-2 border-primary/20">
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                <User className="h-6 w-6 text-primary" />
              </div>
              <div>
                <CardTitle className="text-xl font-bold">{ledgerData.student.user.name}</CardTitle>
                <div className="flex items-center gap-2 mt-1">
                  <Badge variant="outline" className="font-mono text-xs">
                    {ledgerData.student.admission_number}
                  </Badge>
                  {ledgerData.student.grade.shortName && (
                    <Badge variant="outline" className="font-mono text-xs bg-blue-50 text-blue-700 border-blue-200">
                      <GraduationCap className="h-3 w-3 mr-1" />
                      {ledgerData.student.grade.shortName}
                    </Badge>
                  )}
                </div>
              </div>
            </div>
            <div className="text-right">
              <div className="text-xs text-muted-foreground font-mono">Ledger Generated</div>
              <div className="text-sm font-mono">{formatDateTime(ledgerData.generatedAt)}</div>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="border-2 border-red-200 bg-red-50/50">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp className="h-4 w-4 text-red-600" />
              <span className="text-xs font-mono uppercase text-red-700">Total Invoiced</span>
            </div>
            <div className="text-lg font-bold text-red-800">
              {formatCurrency(ledgerData.summary.totalInvoiced)}
            </div>
            <div className="text-xs text-red-600 font-mono">
              {ledgerData.summary.invoiceCount} invoices
            </div>
          </CardContent>
        </Card>

        <Card className="border-2 border-green-200 bg-green-50/50">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <TrendingDown className="h-4 w-4 text-green-600" />
              <span className="text-xs font-mono uppercase text-green-700">Total Paid</span>
            </div>
            <div className="text-lg font-bold text-green-800">
              {formatCurrency(ledgerData.summary.totalPaid)}
            </div>
            <div className="text-xs text-green-600 font-mono">
              {ledgerData.summary.paymentCount} payments
            </div>
          </CardContent>
        </Card>

        <Card className={`border-2 ${ledgerData.summary.totalBalance > 0 ? 'border-red-200 bg-red-50/50' : 'border-green-200 bg-green-50/50'}`}>
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <DollarSign className={`h-4 w-4 ${ledgerData.summary.totalBalance > 0 ? 'text-red-600' : 'text-green-600'}`} />
              <span className={`text-xs font-mono uppercase ${ledgerData.summary.totalBalance > 0 ? 'text-red-700' : 'text-green-700'}`}>
                Current Balance
              </span>
            </div>
            <div className={`text-lg font-bold ${ledgerData.summary.totalBalance > 0 ? 'text-red-800' : 'text-green-800'}`}>
              {formatCurrency(ledgerData.summary.totalBalance)}
            </div>
            <div className={`text-xs font-mono ${ledgerData.summary.totalBalance > 0 ? 'text-red-600' : 'text-green-600'}`}>
              {ledgerData.summary.totalBalance > 0 ? 'Amount Due' : 'Fully Paid'}
            </div>
          </CardContent>
        </Card>

        <Card className="border-2 border-blue-200 bg-blue-50/50">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <Clock className="h-4 w-4 text-blue-600" />
              <span className="text-xs font-mono uppercase text-blue-700">Avg Payment</span>
            </div>
            <div className="text-lg font-bold text-blue-800">
              {formatCurrency(ledgerData.summary.averagePaymentAmount)}
            </div>
            {ledgerData.summary.lastPaymentDate && (
              <div className="text-xs text-blue-600 font-mono">
                Last: {formatDate(ledgerData.summary.lastPaymentDate)}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Ledger Entries Table */}
      <Card className="border-2 border-primary/20">
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg font-bold flex items-center gap-2">
              <Receipt className="h-5 w-5 text-primary" />
              Transaction History
            </CardTitle>
            <div className="text-xs text-muted-foreground font-mono">
              {formatDate(ledgerData.dateRangeStart)} - {formatDate(ledgerData.dateRangeEnd)}
            </div>
          </div>
        </CardHeader>
        
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="border-primary/20">
                  <TableHead className="font-mono">Date</TableHead>
                  <TableHead className="font-mono">Type</TableHead>
                  <TableHead className="font-mono">Description</TableHead>
                  <TableHead className="font-mono">Reference</TableHead>
                  <TableHead className="font-mono text-right">Debit</TableHead>
                  <TableHead className="font-mono text-right">Credit</TableHead>
                  <TableHead className="font-mono text-right">Balance</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {ledgerData.entries.map((entry, index) => {
                  const entryType = getEntryType(entry);
                  return (
                    <TableRow key={index} className="border-primary/20">
                      <TableCell className="font-mono text-sm">
                        {formatDate(entry.date)}
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className={`text-xs ${entryType.className}`}>
                          {entryType.icon}
                          <span className="ml-1">{entryType.type}</span>
                        </Badge>
                      </TableCell>
                      <TableCell className="font-mono text-sm">
                        {entry.description}
                      </TableCell>
                      <TableCell className="font-mono text-sm">
                        {entry.reference}
                      </TableCell>
                      <TableCell className={`font-mono text-sm text-right ${entry.debit > 0 ? 'text-red-600 font-semibold' : 'text-muted-foreground'}`}>
                        {entry.debit > 0 ? formatCurrency(entry.debit) : '-'}
                      </TableCell>
                      <TableCell className={`font-mono text-sm text-right ${entry.credit > 0 ? 'text-green-600 font-semibold' : 'text-muted-foreground'}`}>
                        {entry.credit > 0 ? formatCurrency(entry.credit) : '-'}
                      </TableCell>
                      <TableCell className={`font-mono text-sm text-right font-bold ${entry.balance > 0 ? 'text-red-600' : entry.balance < 0 ? 'text-green-600' : 'text-muted-foreground'}`}>
                        {formatCurrency(entry.balance)}
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Empty State */}
      {ledgerData.entries.length === 0 && (
        <Card className="border-2 border-dashed border-primary/20">
          <CardContent className="p-12 text-center">
            <Receipt className="h-12 w-12 text-slate-400 mx-auto mb-4" />
            <h3 className="text-lg font-mono font-medium text-slate-600 dark:text-slate-400 mb-2">
              {ledgerData.isFallbackData ? 'Transaction History Not Available' : 'No Transactions Found'}
            </h3>
            <p className="text-sm text-slate-500 dark:text-slate-500 font-mono">
              {ledgerData.isFallbackData 
                ? 'Detailed transaction history requires the studentLedger query to be implemented'
                : 'No ledger entries found for the selected date range'
              }
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
