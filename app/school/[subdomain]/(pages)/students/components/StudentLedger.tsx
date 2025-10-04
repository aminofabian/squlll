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
        className: "bg-[var(--color-error)]/10 text-[var(--color-error)] border-[var(--color-error)]/20",
        amountClass: "text-[var(--color-error)] font-semibold"
      };
    } else if (entry.credit > 0) {
      return {
        type: "Payment",
        icon: <Receipt className="h-4 w-4" />,
        className: "bg-[var(--color-success)]/10 text-[var(--color-success)] border-[var(--color-success)]/20",
        amountClass: "text-[var(--color-success)] font-semibold"
      };
    }
    return {
      type: "Adjustment",
      icon: <DollarSign className="h-4 w-4" />,
      className: "bg-[var(--color-info)]/10 text-[var(--color-info)] border-[var(--color-info)]/20",
      amountClass: "text-[var(--color-info)] font-semibold"
    };
  };

  if (loading) {
    return (
      <Card className="border-2 border-[var(--color-border)]">
        <CardContent className="p-12 text-center">
          <div className="animate-spin h-8 w-8 border-4 border-[var(--color-primary)] border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-sm font-mono text-[var(--color-textSecondary)]">Loading student ledger...</p>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="border-2 border-[var(--color-error)]/20 bg-[var(--color-error)]/10">
        <CardContent className="p-12 text-center">
          <Receipt className="h-12 w-12 text-[var(--color-error)] mx-auto mb-4" />
          <h3 className="text-lg font-mono font-medium text-[var(--color-error)] mb-2">
            Error Loading Ledger
          </h3>
          <p className="text-sm text-[var(--color-error)] font-mono">{error}</p>
        </CardContent>
      </Card>
    );
  }

  if (!ledgerData) {
    return (
      <Card className="border-2 border-[var(--color-warning)]/20 bg-[var(--color-warning)]/10">
        <CardContent className="p-12 text-center">
          <Receipt className="h-12 w-12 text-[var(--color-warning)] mx-auto mb-4" />
          <h3 className="text-lg font-mono font-medium text-[var(--color-warning)] mb-2">
            No Ledger Data Available
          </h3>
          <p className="text-sm text-[var(--color-warning)] font-mono">
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
        <Card className="border-2 border-[var(--color-warning)]/20 bg-[var(--color-warning)]/10">
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-[var(--color-warning)] rounded-full"></div>
              <span className="text-sm font-mono text-[var(--color-warning)]">
                Showing basic financial summary. Detailed transaction history will be available when the ledger query is implemented.
              </span>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Student Info Header */}
      <Card className="border-2 border-[var(--color-border)]">
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="h-12 w-12 rounded-full bg-[var(--color-primary)]/10 flex items-center justify-center">
                <User className="h-6 w-6 text-[var(--color-primary)]" />
              </div>
              <div>
                <CardTitle className="text-xl font-bold text-[var(--color-text)]">{ledgerData.student.user.name}</CardTitle>
                <div className="flex items-center gap-2 mt-1">
                  <Badge variant="outline" className="font-mono text-xs border-[var(--color-border)] text-[var(--color-text)]">
                    {ledgerData.student.admission_number}
                  </Badge>
                  {ledgerData.student.grade.shortName && (
                    <Badge variant="outline" className="font-mono text-xs bg-[var(--color-info)]/10 text-[var(--color-info)] border-[var(--color-info)]/20">
                      <GraduationCap className="h-3 w-3 mr-1" />
                      {ledgerData.student.grade.shortName}
                    </Badge>
                  )}
                </div>
              </div>
            </div>
            <div className="text-right">
              <div className="text-xs text-[var(--color-textSecondary)] font-mono">Ledger Generated</div>
              <div className="text-sm font-mono text-[var(--color-text)]">{formatDateTime(ledgerData.generatedAt)}</div>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="border-2 border-[var(--color-error)]/20 bg-[var(--color-error)]/10">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp className="h-4 w-4 text-[var(--color-error)]" />
              <span className="text-xs font-mono uppercase text-[var(--color-error)]">Total Invoiced</span>
            </div>
            <div className="text-lg font-bold text-[var(--color-error)]">
              {formatCurrency(ledgerData.summary.totalInvoiced)}
            </div>
            <div className="text-xs text-[var(--color-error)] font-mono">
              {ledgerData.summary.invoiceCount} invoices
            </div>
          </CardContent>
        </Card>

        <Card className="border-2 border-[var(--color-success)]/20 bg-[var(--color-success)]/10">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <TrendingDown className="h-4 w-4 text-[var(--color-success)]" />
              <span className="text-xs font-mono uppercase text-[var(--color-success)]">Total Paid</span>
            </div>
            <div className="text-lg font-bold text-[var(--color-success)]">
              {formatCurrency(ledgerData.summary.totalPaid)}
            </div>
            <div className="text-xs text-[var(--color-success)] font-mono">
              {ledgerData.summary.paymentCount} payments
            </div>
          </CardContent>
        </Card>

        <Card className={`border-2 ${
          ledgerData.summary.totalPaid === 0 ? 'border-[var(--color-warning)]/20 bg-[var(--color-warning)]/10' :
          ledgerData.summary.totalBalance > 0 ? 'border-[var(--color-error)]/20 bg-[var(--color-error)]/10' : 
          ledgerData.summary.totalBalance < 0 ? 'border-[var(--color-info)]/20 bg-[var(--color-info)]/10' : 
          'border-[var(--color-success)]/20 bg-[var(--color-success)]/10'
        }`}>
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <DollarSign className={`h-4 w-4 ${
                ledgerData.summary.totalPaid === 0 ? 'text-[var(--color-warning)]' :
                ledgerData.summary.totalBalance > 0 ? 'text-[var(--color-error)]' : 
                ledgerData.summary.totalBalance < 0 ? 'text-[var(--color-info)]' : 
                'text-[var(--color-success)]'
              }`} />
              <span className={`text-xs font-mono uppercase ${
                ledgerData.summary.totalPaid === 0 ? 'text-[var(--color-warning)]' :
                ledgerData.summary.totalBalance > 0 ? 'text-[var(--color-error)]' : 
                ledgerData.summary.totalBalance < 0 ? 'text-[var(--color-info)]' : 
                'text-[var(--color-success)]'
              }`}>
                Current Balance
              </span>
            </div>
            <div className={`text-lg font-bold ${
              ledgerData.summary.totalPaid === 0 ? 'text-[var(--color-warning)]' :
              ledgerData.summary.totalBalance > 0 ? 'text-[var(--color-error)]' : 
              ledgerData.summary.totalBalance < 0 ? 'text-[var(--color-info)]' : 
              'text-[var(--color-success)]'
            }`}>
              {formatCurrency(ledgerData.summary.totalBalance)}
            </div>
            <div className={`text-xs font-mono ${
              ledgerData.summary.totalPaid === 0 ? 'text-[var(--color-warning)]' :
              ledgerData.summary.totalBalance > 0 ? 'text-[var(--color-error)]' : 
              ledgerData.summary.totalBalance < 0 ? 'text-[var(--color-info)]' : 
              'text-[var(--color-success)]'
            }`}>
              {ledgerData.summary.totalPaid === 0 ? 'Not Updated' :
               ledgerData.summary.totalBalance > 0 ? 'Amount Due' : 
               ledgerData.summary.totalBalance < 0 ? 'Overpaid' : 
               'Fully Paid'}
            </div>
          </CardContent>
        </Card>

        <Card className="border-2 border-[var(--color-info)]/20 bg-[var(--color-info)]/10">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <Clock className="h-4 w-4 text-[var(--color-info)]" />
              <span className="text-xs font-mono uppercase text-[var(--color-info)]">Avg Payment</span>
            </div>
            <div className="text-lg font-bold text-[var(--color-info)]">
              {formatCurrency(ledgerData.summary.averagePaymentAmount)}
            </div>
            {ledgerData.summary.lastPaymentDate && (
              <div className="text-xs text-[var(--color-info)] font-mono">
                Last: {formatDate(ledgerData.summary.lastPaymentDate)}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Ledger Entries Table */}
      <Card className="border-2 border-[var(--color-border)]">
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg font-bold flex items-center gap-2 text-[var(--color-text)]">
              <Receipt className="h-5 w-5 text-[var(--color-primary)]" />
              Transaction History
            </CardTitle>
            <div className="text-xs text-[var(--color-textSecondary)] font-mono">
              {formatDate(ledgerData.dateRangeStart)} - {formatDate(ledgerData.dateRangeEnd)}
            </div>
          </div>
        </CardHeader>
        
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="border-[var(--color-border)]">
                  <TableHead className="font-mono text-[var(--color-text)]">Date</TableHead>
                  <TableHead className="font-mono text-[var(--color-text)]">Type</TableHead>
                  <TableHead className="font-mono text-[var(--color-text)]">Description</TableHead>
                  <TableHead className="font-mono text-[var(--color-text)]">Reference</TableHead>
                  <TableHead className="font-mono text-right text-[var(--color-text)]">Debit</TableHead>
                  <TableHead className="font-mono text-right text-[var(--color-text)]">Credit</TableHead>
                  <TableHead className="font-mono text-right text-[var(--color-text)]">Balance</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {ledgerData.entries.map((entry, index) => {
                  const entryType = getEntryType(entry);
                  return (
                    <TableRow key={index} className="border-[var(--color-border)]">
                      <TableCell className="font-mono text-sm text-[var(--color-text)]">
                        {formatDate(entry.date)}
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className={`text-xs ${entryType.className}`}>
                          {entryType.icon}
                          <span className="ml-1">{entryType.type}</span>
                        </Badge>
                      </TableCell>
                      <TableCell className="font-mono text-sm text-[var(--color-text)]">
                        {entry.description}
                      </TableCell>
                      <TableCell className="font-mono text-sm text-[var(--color-text)]">
                        {entry.reference}
                      </TableCell>
                      <TableCell className={`font-mono text-sm text-right ${entry.debit > 0 ? 'text-[var(--color-error)] font-semibold' : 'text-[var(--color-textSecondary)]'}`}>
                        {entry.debit > 0 ? formatCurrency(entry.debit) : '-'}
                      </TableCell>
                      <TableCell className={`font-mono text-sm text-right ${entry.credit > 0 ? 'text-[var(--color-success)] font-semibold' : 'text-[var(--color-textSecondary)]'}`}>
                        {entry.credit > 0 ? formatCurrency(entry.credit) : '-'}
                      </TableCell>
                      <TableCell className={`font-mono text-sm text-right font-bold ${entry.balance > 0 ? 'text-[var(--color-error)]' : entry.balance < 0 ? 'text-[var(--color-success)]' : 'text-[var(--color-textSecondary)]'}`}>
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
        <Card className="border-2 border-dashed border-[var(--color-border)]">
          <CardContent className="p-12 text-center">
            <Receipt className="h-12 w-12 text-[var(--color-textSecondary)] mx-auto mb-4" />
            <h3 className="text-lg font-mono font-medium text-[var(--color-text)] mb-2">
              {ledgerData.isFallbackData ? 'Transaction History Not Available' : 'No Transactions Found'}
            </h3>
            <p className="text-sm text-[var(--color-textSecondary)] font-mono">
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
