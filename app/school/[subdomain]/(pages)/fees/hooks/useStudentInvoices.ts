'use client'

import { useState, useEffect } from 'react'
import { FeeInvoice } from '../types'

interface StudentInvoice {
  id: string
  invoiceNumber: string
  term: {
    id?: string
    name: string
  }
  totalAmount: number
  paidAmount: number
  balanceAmount: number
  status: 'PAID' | 'PENDING' | 'OVERDUE' | 'PARTIAL'
  items: {
    id?: string
    feeBucket: {
      name: string
    }
    amount: number
  }[]
  payments: {
    id?: string
    receiptNumber?: string
    amount: number
    paymentDate: string
    paymentMethod?: string
    notes?: string
  }[]
}

interface UseStudentInvoicesResult {
  invoices: FeeInvoice[]
  loading: boolean
  error: string | null
  refetch: () => void
}

interface StudentInfo {
  name: string
  admissionNumber: string
  className: string
}

export function useStudentInvoices(
  studentId: string | null, 
  studentInfo?: StudentInfo
): UseStudentInvoicesResult {
  const [invoices, setInvoices] = useState<FeeInvoice[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchStudentInvoices = async () => {
    if (!studentId) {
      setInvoices([])
      return
    }

    setLoading(true)
    setError(null)

    try {
      console.log('=== useStudentInvoices Debug ===')
      console.log('Student ID:', studentId)
      console.log('Making GraphQL request to /api/graphql')

      const response = await fetch('/api/graphql', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          query: `
            query GetStudentInvoices($studentId: ID!) {
              invoicesByStudent(studentId: $studentId) {
                id
                invoiceNumber
                term {
                  id
                  name
                }
                totalAmount
                paidAmount
                balanceAmount
                status
                items {
                  id
                  feeBucket {
                    name
                  }
                  amount
                }
                payments {
                  id
                  receiptNumber
                  amount
                  paymentDate
                  paymentMethod
                  notes
                }
              }
            }
          `,
          variables: {
            studentId,
          },
        }),
      })

      console.log('Response status:', response.status)
      console.log('Response ok:', response.ok)

      if (!response.ok) {
        const errorText = await response.text()
        console.error('Response error:', errorText)
        
        // If the invoicesByStudent query doesn't exist yet, fall back to empty array
        if (response.status === 500) {
          console.log('invoicesByStudent query not available, returning empty array')
          setInvoices([])
          return
        }
        
        throw new Error(`HTTP error! status: ${response.status} - ${errorText}`)
      }

      const data = await response.json()
      console.log('Raw GraphQL response:', data)

      if (data.errors) {
        console.error('GraphQL errors:', data.errors)
        const errorMessage = data.errors[0]?.message || 'GraphQL error occurred'
        throw new Error(errorMessage)
      }

      const studentInvoices: StudentInvoice[] = data.data?.invoicesByStudent || []
      console.log('Student invoices received:', studentInvoices)

      // We need to get student info separately since it's not in the invoice response
      // For now, we'll use placeholder data and let the parent component provide student info
      const transformedInvoices: FeeInvoice[] = studentInvoices.map((invoice) => {
        // Use paidAmount directly from the response
        const amountPaid = invoice.paidAmount || 0
        
        // Determine payment status based on the status field and amounts
        let paymentStatus: 'paid' | 'pending' | 'overdue' | 'partial' = 'pending'
        if (invoice.status === 'PAID' || invoice.balanceAmount === 0) {
          paymentStatus = 'paid'
        } else if (invoice.status === 'OVERDUE') {
          paymentStatus = 'overdue'
        } else if (invoice.status === 'PARTIAL' || (amountPaid > 0 && invoice.balanceAmount > 0)) {
          paymentStatus = 'partial'
        }

        // Get primary fee type from the first item (or default to 'tuition')
        const primaryFeeType = invoice.items[0]?.feeBucket?.name?.toLowerCase() || 'tuition'

        // Transform payment history
        const paymentHistory = invoice.payments?.map((payment) => ({
          id: payment.id || `pay-${Math.random()}`,
          date: payment.paymentDate,
          amount: payment.amount,
          method: (payment.paymentMethod as 'cash' | 'bank' | 'online' | 'cheque') || 'cash',
          reference: payment.receiptNumber,
          notes: payment.notes,
        })) || []

        return {
          id: invoice.id,
          studentId: studentId, // Use the studentId passed to the hook
          studentName: studentInfo?.name || 'Loading...',
          admissionNumber: studentInfo?.admissionNumber || 'Loading...',
          class: studentInfo?.className || 'Loading...',
          section: '', // Not available in current schema
          feeType: primaryFeeType as any,
          totalAmount: invoice.totalAmount,
          amountPaid: amountPaid,
          amountDue: invoice.balanceAmount,
          dueDate: new Date().toISOString().split('T')[0], // Default to today, should be provided by API
          paymentStatus,
          invoiceDate: new Date().toISOString().split('T')[0], // Default to today, should be provided by API
          term: invoice.term.name,
          academicYear: new Date().getFullYear().toString(), // Default to current year
          paymentHistory,
          discounts: [], // Not available in current schema
          remindersSent: 0, // Not available in current schema
          lastReminderDate: undefined, // Not available in current schema
        }
      })

      setInvoices(transformedInvoices)
      console.log('Transformed invoices:', transformedInvoices)
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error fetching student invoices'
      console.error('useStudentInvoices error:', err)
      setError(errorMessage)
      setInvoices([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchStudentInvoices()
  }, [studentId, studentInfo])

  return {
    invoices,
    loading,
    error,
    refetch: fetchStudentInvoices,
  }
}
