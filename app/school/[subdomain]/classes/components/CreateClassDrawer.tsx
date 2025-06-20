'use client'

import { useState } from 'react'
import { useForm, Controller } from 'react-hook-form'
import { Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from '@/components/ui/drawer'
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Checkbox } from '@/components/ui/checkbox'

type EducationLevel = 'preschool' | 'primary' | 'junior-secondary' | 'senior-secondary' | 'other'

// Create Class Drawer component
export function CreateClassDrawer({ onClassCreated }: { onClassCreated: () => void }) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  
  // Define the form with react-hook-form
  const form = useForm({
    defaultValues: {
      name: '',
      description: '',
      instructor: '',
      level: 'primary' as EducationLevel,
      grade: '',
      scheduleDay: 'Monday',
      scheduleTime: '',
      capacity: '',
    }
  })

  // Form submission handler
  const onSubmit = async (data: any) => {
    try {
      setIsSubmitting(true)
      
      // Here you would normally send data to your API
      console.log('Submitting new class:', data)
      
      // Simulate API call with timeout
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      // Reset form and notify parent
      form.reset()
      onClassCreated()
      
      // Show success message or notification here
      alert('Class created successfully!')
    } catch (error) {
      console.error('Error creating class:', error)
      alert('Failed to create class. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }
  
  return (
    <Drawer>
      <DrawerTrigger asChild>
        <Button className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700">
          <Plus className="mr-2 h-4 w-4" />
          Add New Class
        </Button>
      </DrawerTrigger>
      <DrawerContent className="h-full w-full md:w-1/2 bg-gradient-to-br from-blue-50 to-white" data-vaul-drawer-direction="right">
        <DrawerHeader className="border-b border-blue-200 pb-4">
          <div className="flex items-center justify-center">
            <div className="bg-blue-100 p-2 rounded-full">
              <Plus className="h-6 w-6 text-blue-600" />
            </div>
          </div>
          <DrawerTitle className="text-xl text-blue-700 font-semibold text-center mt-2">Create New Class</DrawerTitle>
          <DrawerDescription className="text-center text-sm text-blue-600/70">Enter details for the new class</DrawerDescription>
        </DrawerHeader>
        
        <div className="p-4 md:p-6 overflow-y-auto">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Class Name</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="e.g. Class 4A" 
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="instructor"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Class Teacher</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="Select teacher..." 
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="level"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Education Level</FormLabel>
                      <Select 
                        onValueChange={field.onChange} 
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select level" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="preschool">Preschool</SelectItem>
                          <SelectItem value="primary">Primary</SelectItem>
                          <SelectItem value="junior-secondary">Junior Secondary</SelectItem>
                          <SelectItem value="senior-secondary">Senior Secondary</SelectItem>
                          <SelectItem value="other">Other</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="grade"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Grade</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="e.g. Grade 4, Form 1" 
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="scheduleDay"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Schedule Day</FormLabel>
                      <Select 
                        onValueChange={field.onChange} 
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select day" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="Monday">Monday</SelectItem>
                          <SelectItem value="Tuesday">Tuesday</SelectItem>
                          <SelectItem value="Wednesday">Wednesday</SelectItem>
                          <SelectItem value="Thursday">Thursday</SelectItem>
                          <SelectItem value="Friday">Friday</SelectItem>
                          <SelectItem value="Saturday">Saturday</SelectItem>
                          <SelectItem value="Sunday">Sunday</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="scheduleTime"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Schedule Time</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="e.g. 9:00 AM - 10:30 AM" 
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="capacity"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Capacity (Students)</FormLabel>
                      <FormControl>
                        <Input 
                          type="number" 
                          placeholder="e.g. 30" 
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              
              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="Enter class description..." 
                        {...field} 
                        className="min-h-[80px]"
                      />
                    </FormControl>
                    <FormDescription>
                      Provide a brief description of the class, its focus, and any special requirements.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <DrawerFooter className="border-t border-blue-200 pt-4">
                <div className="flex justify-between w-full">
                  <DrawerClose asChild>
                    <Button variant="outline">Cancel</Button>
                  </DrawerClose>
                  <Button 
                    type="submit" 
                    className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? 'Creating...' : 'Create Class'}
                  </Button>
                </div>
              </DrawerFooter>
            </form>
          </Form>
        </div>
      </DrawerContent>
    </Drawer>
  )
}

export default CreateClassDrawer;
