'use client'

import { useState } from 'react'

export interface CreateInvoiceInput {
  studentId: string
  termId: string
  issueDate: string
  dueDate: string
  notes?: string
}

export interface InvoiceItem {
  id: string
  feeBucket: {
    name: string
  }
  amount: number
}

export interface GeneratedInvoice {
  id: string
  invoiceNumber: string
  student: {
    user: {
      id: string
      name: string
    }
  }
  term: {
    id: string
    name: string
  }
  totalAmount: number
  balanceAmount: number
  status: string
  items: InvoiceItem[]
}

export interface GenerateInvoicesResponse {
  generateInvoices: GeneratedInvoice[]
}

export const useGraphQLInvoices = () => {
  const [isGenerating, setIsGenerating] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const generateInvoices = async (input: CreateInvoiceInput): Promise<GeneratedInvoice[] | null> => {
    setIsGenerating(true)
    setError(null)

    try {
      const mutation = `
        mutation GenerateInvoices($input: CreateInvoiceInput!) {
          generateInvoices(input: $input) {
            id
            invoiceNumber
            student { 
              user { 
                id 
                name 
              } 
            }
            term { 
              id 
              name 
            }
            totalAmount
            balanceAmount
            status
            items {
              id
              feeBucket { 
                name 
              }
              amount
            }
          }
        }
      `

      const response = await fetch('/api/graphql', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          query: mutation, 
          variables: { input } 
        }),
      })

      if (!response.ok) {
        throw new Error(`GraphQL request failed with status ${response.status}`)
      }

      const result = await response.json()

      if (result.errors) {
        const message = result.errors.map((e: any) => e.message).join(', ')
        throw new Error(message)
      }

      if (!result.data?.generateInvoices) {
        throw new Error('GraphQL response missing generateInvoices field')
      }

      return result.data.generateInvoices as GeneratedInvoice[]
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unknown error generating invoices'
      setError(message)
      console.error('generateInvoices error:', err)
      return null
    } finally {
      setIsGenerating(false)
    }
  }

  return { 
    generateInvoices, 
    isGenerating, 
    error 
  }
}
