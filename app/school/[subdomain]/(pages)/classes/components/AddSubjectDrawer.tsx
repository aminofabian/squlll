'use client'

import React, { useState, useMemo } from 'react'
import { useForm, SubmitHandler } from 'react-hook-form'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { 
  Drawer, 
  DrawerClose, 
  DrawerContent, 
  DrawerDescription, 
  DrawerFooter, 
  DrawerHeader, 
  DrawerTitle, 
  DrawerTrigger 
} from "@/components/ui/drawer"
import { Plus, X, ChevronRight, BookOpen, Code2, GraduationCap, Calculator } from "lucide-react"
import { useSchoolConfigStore } from '@/lib/stores/useSchoolConfigStore'

// Types for the form data
type CreateSubjectFormData = {
  name: string
  code: string
  curriculumId: string
  subjectType: 'core' | 'elective' | 'optional'
  isCompulsory: boolean
  totalMarks: number
  passingMarks: number
  creditHours: number
  description?: string
}

interface AddSubjectDrawerProps {
  onSubjectCreated?: () => void
}

export function AddSubjectDrawer({ onSubjectCreated = () => {} }: AddSubjectDrawerProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isOpen, setIsOpen] = useState(false)
  const { config, getTenantSubjects } = useSchoolConfigStore()

  // Define curriculum level order
  const CURRICULUM_ORDER: { [key: string]: number } = {
    'PrePrimary': 0,
    'EarlyYears': 1,
    'LowerPrimary': 2,
    'UpperPrimary': 3,
    'JuniorSecondary': 4,
    'SeniorSecondary': 5,
    'Primary': 6,
    'Secondary': 7,
    'Tertiary': 8,
  }

  // Get all available curricula from tenant subjects
  const availableCurricula = useMemo(() => {
    const tenantSubjects = getTenantSubjects()
    if (!tenantSubjects || tenantSubjects.length === 0) return []
    
    const curriculaSet = new Set<string>()
    const curricula: Array<{ id: string; name: string; displayName: string; order: number }> = []
    
    tenantSubjects.forEach(tenantSubject => {
      if (tenantSubject.curriculum && !curriculaSet.has(tenantSubject.curriculum.id)) {
        curriculaSet.add(tenantSubject.curriculum.id)
        const levelName = tenantSubject.curriculum.name.replace(/^[^_]*_/, '')
        curricula.push({
          id: tenantSubject.curriculum.id,
          name: tenantSubject.curriculum.name,
          displayName: levelName,
          order: CURRICULUM_ORDER[levelName] ?? 999
        })
      }
    })
    
    // Sort curricula by their defined order
    return curricula.sort((a, b) => a.order - b.order)
  }, [getTenantSubjects])

  const form = useForm<CreateSubjectFormData>({
    defaultValues: {
      name: '',
      code: '',
      curriculumId: '',
      subjectType: 'elective',
      isCompulsory: false,
      totalMarks: 100,
      passingMarks: 40,
      creditHours: 2,
      description: '',
    },
  })

  // Set default curriculum ID when available curricula change
  React.useEffect(() => {
    if (availableCurricula.length > 0 && !form.getValues('curriculumId')) {
      form.setValue('curriculumId', availableCurricula[0].id)
    }
  }, [availableCurricula, form])

  const selectedCurriculumId = form.watch('curriculumId')
  const selectedSubjectType = form.watch('subjectType')

  const onSubmit: SubmitHandler<CreateSubjectFormData> = async (data) => {
    try {
      setIsSubmitting(true)
      
      const mutation = `
        mutation CreateCustomSubject($input: CreateCustomSubjectInput!) {
          createCustomSubject(input: $input) {
            id
            customSubject {
              id
              name
              code
              subjectType
              isCompulsory
              totalMarks
              passingMarks
              creditHours
            }
          }
        }
      `

      const response = await fetch('/api/graphql', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          query: mutation,
          variables: {
            input: {
              name: data.name,
              code: data.code,
              curriculumId: data.curriculumId,
              subjectType: data.subjectType,
              isCompulsory: data.isCompulsory,
              totalMarks: data.totalMarks,
              passingMarks: data.passingMarks,
              creditHours: data.creditHours,
            }
          }
        }),
      })

      const result = await response.json()
      
      if (result.errors) {
        console.error('GraphQL errors:', result.errors)
        throw new Error(result.errors[0]?.message || 'Failed to create subject')
      }

      console.log('Subject created successfully:', result.data.createCustomSubject)
      
      // Reset form and close drawer
      form.reset()
      setIsOpen(false)
      onSubjectCreated()
      
      // Show success message
      alert('Subject created successfully!')
      
    } catch (error) {
      console.error('Error creating subject:', error)
      alert(error instanceof Error ? error.message : 'Failed to create subject. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Drawer open={isOpen} onOpenChange={setIsOpen}>
      <DrawerTrigger asChild>
        <Button 
          variant="outline"
          size="sm"
          className="h-7 px-2 border-primary/30 hover:bg-primary/5 hover:text-primary hover:border-primary/30 transition-all duration-200"
        >
          <Plus className="h-3.5 w-3.5 mr-1" />
          <span className="text-xs">Add Subject</span>
        </Button>
      </DrawerTrigger>
      
      <DrawerContent 
        className="h-screen w-full md:w-3/5 lg:w-2/5 bg-white shadow-xl" 
        data-vaul-drawer-direction="right"
      >
        <DrawerHeader className="border-b border-primary/20 pb-4 bg-primary/5">
          <div className="flex items-center justify-center">
            <div className="bg-primary p-3 rounded-full shadow-md">
              <BookOpen className="h-6 w-6 text-white" />
            </div>
          </div>
          <DrawerTitle className="text-2xl text-primary font-medium text-center mt-4 flex items-center justify-center gap-2">
            Add Custom Subject
          </DrawerTitle>
          <DrawerDescription className="text-center text-sm text-slate-600 dark:text-slate-400 mt-2">
            Create a new subject that can be assigned to classes
          </DrawerDescription>
        </DrawerHeader>
        
        <div className="p-6 md:p-8 overflow-y-auto flex-1">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              
              {/* Basic Subject Information */}
              <div className="space-y-4 p-6 bg-white dark:bg-slate-800 border-2 border-primary/20 hover:border-primary/30 transition-all">
                <h3 className="text-lg font-medium text-primary mb-4 flex items-center gap-2 pb-2 border-b border-primary/20">
                  <BookOpen className="h-5 w-5" />
                  Basic Information
                </h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="name"
                    rules={{ required: 'Subject name is required' }}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Subject Name</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="e.g., Advanced Mathematics"
                            {...field}
                            className="border-primary/20 focus:border-primary"
                          />
                        </FormControl>
                        <FormDescription className="text-slate-600 dark:text-slate-400">
                          The full name of the subject
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="code"
                    rules={{ required: 'Subject code is required' }}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Subject Code</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="e.g., MATH-301"
                            {...field}
                            className="border-primary/20 focus:border-primary"
                          />
                        </FormControl>
                        <FormDescription className="text-slate-600 dark:text-slate-400">
                          Unique identifier for the subject
                        </FormDescription>
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
                      <FormLabel>Description (Optional)</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Brief description of the subject..."
                          {...field}
                          rows={3}
                          className="border-primary/20 focus:border-primary resize-none"
                        />
                      </FormControl>
                      <FormDescription className="text-slate-600 dark:text-slate-400">
                        Optional description of what this subject covers
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* Curriculum and Type */}
              <div className="space-y-4 p-6 bg-white dark:bg-slate-800 border-2 border-primary/20 hover:border-primary/30 transition-all">
                <h3 className="text-lg font-medium text-primary mb-4 flex items-center gap-2 pb-2 border-b border-primary/20">
                  <GraduationCap className="h-5 w-5" />
                  Classification
                </h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="curriculumId"
                    rules={{ required: 'Please select a curriculum' }}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Curriculum</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger className="border-primary/20 focus:border-primary">
                              <SelectValue placeholder="Select curriculum" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent className="max-h-60">
                            {availableCurricula.length > 0 ? (
                              availableCurricula.map((curriculum) => (
                                <SelectItem 
                                  key={curriculum.id} 
                                  value={curriculum.id}
                                  className="py-3 px-4 hover:bg-primary/5 focus:bg-primary/10 transition-colors"
                                >
                                  <div className="flex flex-col space-y-1">
                                    <span className="font-medium text-slate-900 dark:text-slate-100">
                                      {curriculum.displayName}
                                    </span>
                                    <span className="text-xs text-slate-500 dark:text-slate-400">
                                      Level {curriculum.order + 1}
                                    </span>
                                  </div>
                                </SelectItem>
                              ))
                            ) : (
                              <SelectItem value="" disabled className="py-3 px-4">
                                <span className="text-slate-500 dark:text-slate-400">
                                  No curricula found in school configuration
                                </span>
                              </SelectItem>
                            )}
                          </SelectContent>
                        </Select>
                        <FormDescription className="text-slate-600 dark:text-slate-400">
                          The curriculum this subject belongs to
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="subjectType"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Subject Type</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger className="border-primary/20 focus:border-primary">
                              <SelectValue />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="core">Core</SelectItem>
                            <SelectItem value="elective">Elective</SelectItem>
                            <SelectItem value="optional">Optional</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormDescription className="text-slate-600 dark:text-slate-400">
                          Classification of the subject
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="flex items-center space-x-2">
                  <FormField
                    control={form.control}
                    name="isCompulsory"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                        <FormControl>
                          <input
                            type="checkbox"
                            checked={field.value}
                            onChange={field.onChange}
                            className="h-4 w-4 text-primary focus:ring-primary border-primary/20 rounded"
                          />
                        </FormControl>
                        <div className="space-y-1 leading-none">
                          <FormLabel>Compulsory Subject</FormLabel>
                          <FormDescription className="text-slate-600 dark:text-slate-400">
                            Mark if this subject is mandatory for all students
                          </FormDescription>
                        </div>
                      </FormItem>
                    )}
                  />
                </div>
              </div>

              {/* Assessment Configuration */}
              <div className="space-y-4 p-6 bg-white dark:bg-slate-800 border-2 border-primary/20 hover:border-primary/30 transition-all">
                <h3 className="text-lg font-medium text-primary mb-4 flex items-center gap-2 pb-2 border-b border-primary/20">
                  <Calculator className="h-5 w-5" />
                  Assessment & Credits
                </h3>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <FormField
                    control={form.control}
                    name="totalMarks"
                    rules={{ 
                      required: 'Total marks is required',
                      min: { value: 1, message: 'Must be at least 1' }
                    }}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Total Marks</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            placeholder="100"
                            {...field}
                            onChange={(e) => field.onChange(Number(e.target.value))}
                            className="border-primary/20 focus:border-primary"
                          />
                        </FormControl>
                        <FormDescription className="text-slate-600 dark:text-slate-400">
                          Maximum marks for assessments
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="passingMarks"
                    rules={{ 
                      required: 'Passing marks is required',
                      min: { value: 1, message: 'Must be at least 1' }
                    }}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Passing Marks</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            placeholder="40"
                            {...field}
                            onChange={(e) => field.onChange(Number(e.target.value))}
                            className="border-primary/20 focus:border-primary"
                          />
                        </FormControl>
                        <FormDescription className="text-slate-600 dark:text-slate-400">
                          Minimum marks to pass
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="creditHours"
                    rules={{ 
                      required: 'Credit hours is required',
                      min: { value: 1, message: 'Must be at least 1' }
                    }}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Credit Hours</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            placeholder="2"
                            {...field}
                            onChange={(e) => field.onChange(Number(e.target.value))}
                            className="border-primary/20 focus:border-primary"
                          />
                        </FormControl>
                        <FormDescription className="text-slate-600 dark:text-slate-400">
                          Academic credit hours
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>

            </form>
          </Form>
        </div>

        <DrawerFooter className="border-t border-primary/20 pt-6 bg-primary/5">
          <div className="flex justify-between w-full gap-4">
            <DrawerClose asChild>
              <Button 
                variant="outline" 
                className="border-primary/30 hover:bg-primary/5 text-primary"
                disabled={isSubmitting}
              >
                <X className="h-4 w-4 mr-2" />
                Cancel
              </Button>
            </DrawerClose>
            
            <Button
              type="submit"
              onClick={form.handleSubmit(onSubmit)}
              className="bg-primary hover:bg-primary/90 text-white font-medium shadow-md hover:shadow-lg transition-all duration-300"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  Creating Subject...
                  <div className="ml-2 h-4 w-4 rounded-full border-2 border-white border-t-transparent animate-spin"></div>
                </>
              ) : (
                <>
                  Create Subject
                  <ChevronRight className="h-4 w-4 ml-1" />
                </>
              )}
            </Button>
          </div>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  )
}

export default AddSubjectDrawer
