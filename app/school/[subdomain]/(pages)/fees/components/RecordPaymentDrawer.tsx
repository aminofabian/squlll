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
import type { FeeInvoice, RecordPaymentForm } from '../types'

interface RecordPaymentDrawerProps {
  isOpen: boolean
  onClose: () => void
  form: RecordPaymentForm
  setForm: (updater: (prev: RecordPaymentForm) => RecordPaymentForm) => void
  onSubmit: () => void
  invoices: FeeInvoice[]
}

export default function RecordPaymentDrawer({
  isOpen,
  onClose,
  form,
  setForm,
  onSubmit,
  invoices,
}: RecordPaymentDrawerProps) {
  const handleChange = (field: keyof RecordPaymentForm, value: string | boolean) => {
    setForm((prev) => ({
      ...prev,
      [field]: value,
    }))
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
                <SelectValue placeholder="Select invoice" />
              </SelectTrigger>
              <SelectContent>
                {invoices.map((inv) => (
                  <SelectItem key={inv.id} value={inv.id}>
                    {inv.feeType.toUpperCase()} • Due {new Date(inv.dueDate).toLocaleDateString()} • KES {inv.amountDue.toLocaleString()}
                  </SelectItem>
                ))}
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
            <Button onClick={onSubmit} disabled={!form.invoiceId || !form.amountPaid || !form.paymentDate}>
              Save Payment
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


