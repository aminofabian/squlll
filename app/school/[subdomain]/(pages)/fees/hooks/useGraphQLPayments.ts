"use client";

import { useState } from 'react';

export interface CreatePaymentInput {
  invoiceId: string;
  amount: number;
  paymentMethod: string; // e.g., MPESA | CASH | BANK | ONLINE | CHEQUE
  transactionReference?: string;
  paymentDate: string; // ISO string
  notes?: string;
}

export interface CreatePaymentResponse {
  id: string;
  receiptNumber: string;
  amount: number;
  paymentMethod: string;
  transactionReference?: string;
  paymentDate: string;
  notes?: string;
}

export const useGraphQLPayments = () => {
  const [isCreating, setIsCreating] = useState(false);
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
            invoice { id invoiceNumber totalAmount paidAmount balanceAmount status }
            student { id admission_number user { name email } }
            receivedByUser { id name }
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

  return { createPayment, isCreating, error };
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


