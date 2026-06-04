"use client";

import { useState } from 'react';

export interface CreatePaymentInput {
  invoiceId: string;
  amount: number;
  paymentMethod: string;
  transactionReference?: string;
  paymentDate: string;
  notes?: string;
  allocations?: Array<{ studentFeeItemId: string; amount: number }>;
  applyCreditBalance?: boolean;
}

export interface CreatePaymentResponse {
  id: string;
  receiptNumber: string;
  amount: number;
  paymentMethod: string;
  transactionReference?: string;
  paymentDate: string;
  notes?: string;
  invoice: {
    id: string;
    invoiceNumber: string;
    totalAmount: number;
    paidAmount: number;
    balanceAmount: number;
    term?: { name: string };
    academicYear?: { name: string };
  };
  student: {
    id: string;
    admission_number: string;
    creditBalance?: number;
    user: { name: string; email?: string };
    grade?: {
      shortName?: string;
      gradeLevel?: { name: string };
    };
    stream?: { name: string };
  };
  receivedByUser?: { name: string };
}

export interface BulkImportPaymentsInput {
  rows: Array<{
    admissionNumber?: string;
    phone?: string;
    studentName?: string;
    amount: number;
    paymentMethod?: string;
    transactionReference?: string;
    paymentDate?: string;
  }>;
  defaultPaymentMethod?: string;
  dryRun?: boolean;
}

export interface BulkPaymentImportResult {
  totalRows: number;
  successCount: number;
  unmatchedCount: number;
  errorCount: number;
  results: Array<{
    rowIndex: number;
    status: string;
    studentId?: string;
    studentName?: string;
    paymentId?: string;
    receiptNumber?: string;
    message?: string;
  }>;
}

export const useGraphQLPayments = () => {
  const [isCreating, setIsCreating] = useState(false);
  const [isBulkImporting, setIsBulkImporting] = useState(false);
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const createPayment = async (input: CreatePaymentInput): Promise<CreatePaymentResponse | null> => {
    setIsCreating(true);
    setError(null);

    try {
      const mutation = `
        mutation CreatePayment($input: CreatePaymentInput!) {
          createPayment(input: $input) {
            id
            receiptNumber
            amount
            paymentMethod
            transactionReference
            paymentDate
            notes
            invoice {
              id
              invoiceNumber
              totalAmount
              paidAmount
              balanceAmount
              term { name }
              academicYear { name }
            }
            student {
              id
              admission_number
              creditBalance
              user { name email }
              grade {
                shortName
                gradeLevel { name }
              }
              stream { name }
            }
            receivedByUser { name }
            createdAt
          }
        }
      `;

      const response = await fetch('/api/graphql', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: mutation, variables: { input } }),
      });

      if (!response.ok) {
        throw new Error(`GraphQL request failed with status ${response.status}`);
      }

      const result = await response.json();

      console.log('💰 PAYMENT CREATION RESPONSE:', result);

      if (result.errors) {
        const message = result.errors.map((e: any) => e.message).join(', ');
        console.error('❌ Payment creation errors:', result.errors);
        throw new Error(message);
      }

      if (!result.data?.createPayment) {
        console.error('❌ No createPayment data in response:', result.data);
        throw new Error('GraphQL response missing createPayment field');
      }

      const payment = result.data.createPayment;
      console.log('✅ Payment created successfully:', {
        id: payment.id,
        receiptNumber: payment.receiptNumber,
        amount: payment.amount,
        paymentMethod: payment.paymentMethod,
        invoiceId: payment.invoice?.id,
        invoiceNumber: payment.invoice?.invoiceNumber,
        updatedInvoiceBalance: payment.invoice?.balanceAmount
      });

      return payment as CreatePaymentResponse;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unknown error creating payment';
      setError(message);
      console.error('createPayment error:', err);
      return null;
    } finally {
      setIsCreating(false);
    }
  };

  const bulkImportPayments = async (
    input: BulkImportPaymentsInput,
  ): Promise<BulkPaymentImportResult | null> => {
    setIsBulkImporting(true);
    setError(null);

    try {
      const mutation = `
        mutation BulkImportPayments($input: BulkImportPaymentsInput!) {
          bulkImportPayments(input: $input) {
            totalRows
            successCount
            unmatchedCount
            errorCount
            results {
              rowIndex
              status
              studentId
              studentName
              paymentId
              receiptNumber
              message
            }
          }
        }
      `;

      const response = await fetch('/api/graphql', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: mutation, variables: { input } }),
      });

      const result = await response.json();
      if (result.errors?.length) {
        throw new Error(result.errors[0]?.message ?? 'Bulk import failed');
      }

      return result.data?.bulkImportPayments ?? null;
    } catch (err) {
      const message =
        err instanceof Error ? err.message : 'Unknown error importing payments';
      setError(message);
      return null;
    } finally {
      setIsBulkImporting(false);
    }
  };

  const generateReceiptPdf = async (
    paymentId: string,
  ): Promise<string | null> => {
    setIsGeneratingPdf(true);
    setError(null);

    try {
      const mutation = `
        mutation GenerateReceiptPDF($paymentId: ID!) {
          generateReceiptPDF(paymentId: $paymentId)
        }
      `;

      const response = await fetch('/api/graphql', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: mutation, variables: { paymentId } }),
      });

      const result = await response.json();
      if (result.errors?.length) {
        throw new Error(result.errors[0]?.message ?? 'PDF generation failed');
      }

      return result.data?.generateReceiptPDF ?? null;
    } catch (err) {
      const message =
        err instanceof Error ? err.message : 'Unknown error generating PDF';
      setError(message);
      return null;
    } finally {
      setIsGeneratingPdf(false);
    }
  };

  return {
    createPayment,
    bulkImportPayments,
    generateReceiptPdf,
    isCreating,
    isBulkImporting,
    isGeneratingPdf,
    error,
  };
};

// Fetch payments with optional filters
export interface PaymentsFilters {
  studentId?: string;
  paymentMethod?: string; // e.g., MPESA
  startDate?: string; // YYYY-MM-DD
  endDate?: string;   // YYYY-MM-DD
}

export interface PaymentListItem {
  id: string;
  receiptNumber: string;
  amount: number;
  paymentMethod: string;
  paymentDate: string;
  notes?: string | null;
  parentProofUrl?: string | null;
  student: {
    admission_number: string;
    user: { name: string };
  };
  invoice: { invoiceNumber: string };
}

export const usePaymentsQuery = () => {
  const [payments, setPayments] = useState<PaymentListItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchPayments = async (filters: PaymentsFilters) => {
    setIsLoading(true);
    setError(null);
    try {
      const query = `
        query GetAllPayments($filters: PaymentFilters) {
          payments(filters: $filters) {
            id
            receiptNumber
            amount
            paymentMethod
            paymentDate
            notes
            parentProofUrl
            student { admission_number user { name } }
            invoice { invoiceNumber }
          }
        }
      `;

      const response = await fetch('/api/graphql', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query, variables: { filters } }),
        cache: 'no-store',
      });

      if (!response.ok) {
        throw new Error(`GraphQL request failed with status ${response.status}`);
      }
      const result = await response.json();
      if (result.errors) {
        throw new Error(result.errors.map((e: any) => e.message).join(', '));
      }
      setPayments(result.data?.payments ?? []);
      return result.data?.payments ?? [];
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unknown error fetching payments';
      setError(message);
      console.error('fetchPayments error:', err);
      return [];
    } finally {
      setIsLoading(false);
    }
  };

  return { payments, isLoading, error, fetchPayments };
};


