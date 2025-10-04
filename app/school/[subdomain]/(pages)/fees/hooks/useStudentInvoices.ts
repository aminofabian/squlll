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
      // Add cache-busting timestamp to force fresh data
      const cacheBuster = Date.now()
      console.log('=== FORCE REFETCH: useStudentInvoices ===')
      console.log('Student ID:', studentId)
      console.log(`🔄 FORCE FETCH: Invoices with cache buster: ${cacheBuster}`)
      
      // Clear any existing data to force UI refresh
      setInvoices([])
      
      // Add extra delay to ensure server-side data is fully committed
      await new Promise(resolve => setTimeout(resolve, 100))
      
      console.log('Making fresh GraphQL request to /api/graphql')

      const response = await fetch('/api/graphql', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Cache-Control': 'no-cache',
          'Pragma': 'no-cache',
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
      console.log('📊 Student invoices received:', studentInvoices)
      
      // Debug: Check if any invoices have payments
      studentInvoices.forEach((invoice, index) => {
        console.log(`📋 Invoice ${index + 1}:`, {
          id: invoice.id,
          invoiceNumber: invoice.invoiceNumber,
          totalAmount: invoice.totalAmount,
          paidAmount: invoice.paidAmount,
          balanceAmount: invoice.balanceAmount,
          status: invoice.status,
          paymentCount: invoice.payments?.length || 0
        })
        
        if (invoice.payments && invoice.payments.length > 0) {
          console.log(`💰 Payments for invoice ${invoice.invoiceNumber}:`, invoice.payments)
        }
      })

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
