'use client'

import { useState } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { toast } from 'sonner'
import { Loader2 } from 'lucide-react'
import { FormField } from '../classes/components/FormField'

interface AddStreamModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
  gradeId: string
  gradeName: string
}

export function AddStreamModal({ isOpen, onClose, onSuccess, gradeId, gradeName }: AddStreamModalProps) {
  const [isLoading, setIsLoading] = useState(false)
  const queryClient = useQueryClient()
  const [formData, setFormData] = useState({
    name: '',
    capacity: '30'
  })
  const [errors, setErrors] = useState<{ name?: string; capacity?: string }>({})

  const resetForm = () => {
    setFormData({ name: '', capacity: '30' })
    setErrors({})
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
    setErrors(prev => ({ ...prev, [name]: undefined }))
  }

  const validate = () => {
    const next: { name?: string; capacity?: string } = {}
    if (!formData.name.trim()) {
      next.name = 'Stream name is required'
    }
    const capacity = Number(formData.capacity)
    if (!formData.capacity || Number.isNaN(capacity) || capacity < 1) {
      next.capacity = 'Enter a capacity of at least 1 student'
    }
    setErrors(next)
    return Object.keys(next).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!validate()) return

    setIsLoading(true)

    try {
      const response = await fetch('/api/school/create-stream', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: formData.name.trim(),
          capacity: formData.capacity,
          gradeId
        }),
      })

      const data = await response.json()
      
      if (!response.ok) {
        if (data.details && Array.isArray(data.details) && data.details.length > 0) {
          const firstError = data.details[0];
          throw new Error(firstError.message || data.error || 'Failed to create stream');
        }
        throw new Error(data.error || 'Failed to create stream')
      }

      toast.success(`Stream "${formData.name.trim()}" created`)
      
      await queryClient.invalidateQueries({ queryKey: ['schoolConfig'] })
      
      resetForm()
      onSuccess()
      onClose()
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "An error occurred while creating the stream"
      const isValidationError = errorMessage.includes('already exists')
      
      if (isValidationError) {
        setErrors({ name: 'A stream with this name already exists in this grade' })
      } else {
        toast.error(errorMessage)
      }
    } finally {
      setIsLoading(false)
    }
  }

  const handleClose = () => {
    resetForm()
    onClose()
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md gap-0 overflow-hidden border-slate-200/80 bg-slate-50/50 p-0 dark:border-slate-800 dark:bg-slate-950">
        <DialogHeader className="border-b border-slate-200/80 bg-white px-5 py-4 text-left dark:border-slate-800 dark:bg-slate-900">
          <DialogTitle className="text-base font-semibold text-slate-900 dark:text-slate-100">
            Add stream
          </DialogTitle>
          <DialogDescription className="text-xs text-slate-500">
            Create a new class division for <span className="font-medium text-slate-700 dark:text-slate-300">{gradeName}</span>.
            Streams let you split one grade into groups (e.g. East, West, Blue).
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="space-y-4 px-5 py-4">
            <div className="rounded-xl border border-slate-200/80 bg-white p-4 space-y-4 dark:border-slate-800 dark:bg-slate-900/40">
              <FormField
                id="name"
                label="Stream name"
                required
                hint="Use a short, recognizable name"
                error={errors.name}
              >
                <Input
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="e.g. East, Stream A, Blue"
                  className="h-9 border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-900"
                  aria-invalid={!!errors.name}
                />
              </FormField>
              <FormField
                id="capacity"
                label="Maximum students"
                required
                hint="How many students this stream can hold"
                error={errors.capacity}
              >
                <Input
                  id="capacity"
                  name="capacity"
                  type="number"
                  value={formData.capacity}
                  onChange={handleChange}
                  className="h-9 border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-900"
                  min={1}
                  aria-invalid={!!errors.capacity}
                />
              </FormField>
            </div>
          </div>
          <div className="flex flex-col-reverse gap-2 border-t border-slate-200/80 bg-white px-5 py-3 dark:border-slate-800 dark:bg-slate-900 sm:flex-row sm:justify-end">
            <Button type="button" variant="ghost" size="sm" onClick={handleClose} disabled={isLoading}>
              Cancel
            </Button>
            <Button type="submit" size="sm" className="h-9 sm:min-w-[8rem]" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-3.5 w-3.5 animate-spin" />
                  Creating...
                </>
              ) : (
                'Create stream'
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
