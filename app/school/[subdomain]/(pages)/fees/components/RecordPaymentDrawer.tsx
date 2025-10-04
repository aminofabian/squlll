'use client'

import React from 'react'
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerFooter,
  DrawerClose,
} from '@/components/ui/drawer'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Checkbox } from '@/components/ui/checkbox'
import { Loader2 } from 'lucide-react'
import type { FeeInvoice, RecordPaymentForm } from '../types'
import { useStudentInvoices } from '../hooks/useStudentInvoices'

interface RecordPaymentDrawerProps {
  isOpen: boolean
  onClose: () => void
  form: RecordPaymentForm
  setForm: (updater: (prev: RecordPaymentForm) => RecordPaymentForm) => void
  onSubmit: () => void
  studentId: string | null
  studentInfo?: {
    name: string
    admissionNumber: string
    className: string
  }
  onPaymentSuccess?: () => void
}

export default function RecordPaymentDrawer({
  isOpen,
  onClose,
  form,
  setForm,
  onSubmit,
  studentId,
  studentInfo,
  onPaymentSuccess,
}: RecordPaymentDrawerProps) {
  // Query invoices for the selected student
  const { invoices, loading: invoicesLoading, error: invoicesError, refetch: refetchInvoices } = useStudentInvoices(studentId, studentInfo)
  const handleChange = (field: keyof RecordPaymentForm, value: string | boolean) => {
    setForm((prev) => ({
      ...prev,
      [field]: value,
    }))
  }

  const handleSubmit = async () => {
    try {
      // Execute the payment submission
      await onSubmit()
      
      console.log('🔄 Payment submitted successfully, refreshing all data...')
      
      // Force refresh invoices with cache busting
      console.log('📊 Refreshing invoice data...')
      refetchInvoices()
      
      // Call parent callback to refresh student summary and fee data
      if (onPaymentSuccess) {
        console.log('📈 Refreshing student summary and fee data...')
        onPaymentSuccess()
      }
      
      console.log('✅ All data refresh operations triggered')
    } catch (error) {
      console.error('❌ Error during payment submission:', error)
    }
  }

  const paymentMethods = [
    { value: 'MPESA', label: 'MPESA' },
    { value: 'cash', label: 'Cash' },
    { value: 'bank', label: 'Bank' },
    { value: 'online', label: 'Online' },
    { value: 'cheque', label: 'Cheque' },
  ]

  return (
    <Drawer open={isOpen} onOpenChange={(open) => { if (!open) onClose() }} direction="right">
      <DrawerContent className="max-w-xl">
        <DrawerHeader>
          <DrawerTitle className="text-lg">Record Payment</DrawerTitle>
        </DrawerHeader>

        <div className="p-4 space-y-4">
          <div className="space-y-2">
            <Label htmlFor="invoice">Invoice</Label>
            <Select value={form.invoiceId} onValueChange={(v) => handleChange('invoiceId', v)}>
              <SelectTrigger id="invoice">
                <SelectValue placeholder={invoicesLoading ? "Loading invoices..." : "Select invoice"} />
              </SelectTrigger>
              <SelectContent>
                {invoicesLoading ? (
                  <div className="flex items-center justify-center p-4">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span className="ml-2">Loading invoices...</span>
                  </div>
                ) : invoicesError ? (
                  <div className="p-4 text-sm text-red-600">
                    Error loading invoices: {invoicesError}
                  </div>
                ) : invoices.length === 0 ? (
                  <div className="p-4 text-sm text-gray-500">
                    No invoices found for this student
                  </div>
                ) : (
                  invoices.map((inv) => (
                    <SelectItem key={inv.id} value={inv.id}>
                      {inv.feeType.toUpperCase()} • Due {new Date(inv.dueDate).toLocaleDateString()} • KES {inv.amountDue.toLocaleString()}
                    </SelectItem>
                  ))
                )}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="amount">Amount Paid (KES)</Label>
            <Input
              id="amount"
              inputMode="decimal"
              value={form.amountPaid}
              onChange={(e) => handleChange('amountPaid', e.target.value)}
              placeholder="0.00"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="method">Payment Method</Label>
            <Select value={form.paymentMethod} onValueChange={(v) => handleChange('paymentMethod', v)}>
              <SelectTrigger id="method">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {paymentMethods.map((m) => (
                  <SelectItem key={m.value} value={m.value}>{m.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="date">Payment Date</Label>
            <Input
              id="date"
              type="date"
              value={form.paymentDate}
              onChange={(e) => handleChange('paymentDate', e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="ref">Reference Number</Label>
            <Input
              id="ref"
              value={form.referenceNumber}
              onChange={(e) => handleChange('referenceNumber', e.target.value)}
              placeholder="e.g., TXN-12345"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Notes</Label>
            <Input
              id="notes"
              value={form.notes}
              onChange={(e) => handleChange('notes', e.target.value)}
              placeholder="Optional notes"
            />
          </div>

          <div className="flex items-center space-x-2">
            <Checkbox
              id="partial"
              checked={form.partialPayment}
              onCheckedChange={(checked) => handleChange('partialPayment', Boolean(checked))}
            />
            <Label htmlFor="partial">Mark as partial payment</Label>
          </div>
        </div>

        <DrawerFooter>
          <div className="flex gap-2">
            <Button 
              onClick={handleSubmit} 
              disabled={!form.invoiceId || !form.amountPaid || !form.paymentDate || invoicesLoading}
            >
              {invoicesLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Loading...
                </>
              ) : (
                'Save Payment'
              )}
            </Button>
            <DrawerClose asChild>
              <Button variant="outline" onClick={onClose}>Cancel</Button>
            </DrawerClose>
          </div>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  )
}


