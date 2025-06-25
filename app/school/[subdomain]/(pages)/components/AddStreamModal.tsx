'use client'

import { useState } from 'react'
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle 
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { toast } from 'sonner'
import { Loader2 } from 'lucide-react'

interface AddStreamModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
  gradeId: string
  gradeName: string
}

export function AddStreamModal({ isOpen, onClose, onSuccess, gradeId, gradeName }: AddStreamModalProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    capacity: '30'
  })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.name) {
      toast.error("Validation Error", {
        description: "Stream name is required"
      })
      return
    }

    if (!formData.capacity || isNaN(Number(formData.capacity)) || Number(formData.capacity) < 1) {
      toast.error("Validation Error", {
        description: "Capacity must be a positive number"
      })
      return
    }

    setIsLoading(true)

    try {
      const response = await fetch('/api/school/create-stream', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: formData.name,
          capacity: formData.capacity,
          gradeId
        }),
      })

      const data = await response.json()
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to create stream')
      }

      toast.success(`Stream Created: ${formData.name}`, {
        description: `New stream has been successfully added to ${gradeName} with capacity of ${formData.capacity} students.`,
        duration: 5000,
        action: {
          label: 'View',
          onClick: () => {
            // This action could navigate to the stream details or refresh the current view
            console.log('View stream action clicked')
            // You could add navigation here if needed
          }
        }
      })
      
      onSuccess()
      onClose()
    } catch (error) {
      console.error('Error creating stream:', error)
      toast.error("Error", {
        description: error instanceof Error ? error.message : "An error occurred while creating the stream"
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Add Stream for {gradeName}</DialogTitle>
          <DialogDescription>
            Create a new stream for this grade level. A stream represents a class section or group.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="name" className="text-right">
                Stream Name
              </Label>
              <Input
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="e.g. Stream A, Red Stream"
                className="col-span-3"
                required
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="capacity" className="text-right">
                Capacity
              </Label>
              <Input
                id="capacity"
                name="capacity"
                type="number"
                value={formData.capacity}
                onChange={handleChange}
                className="col-span-3"
                min={1}
                required
              />
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose} disabled={isLoading}>
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Creating...
                </>
              ) : (
                'Create Stream'
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
