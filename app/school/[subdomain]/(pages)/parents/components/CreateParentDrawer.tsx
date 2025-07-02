"use client"

import React from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select"
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
import { Checkbox } from '@/components/ui/checkbox'
import { 
  UserPlus, 
  User, 
  Users, 
  Info, 
  Phone, 
  Mail, 
  MapPin, 
  Briefcase,
  Shield,
  MessageSquare,
} from "lucide-react"

// Form validation schema
const parentFormSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email().optional().or(z.literal("")),
  phone: z.string().min(10, "Valid phone number is required"),
  relationship: z.enum(["father", "mother", "guardian", "other"]),
  occupation: z.string().optional().or(z.literal("")),
  workAddress: z.string().optional().or(z.literal("")),
  homeAddress: z.string().optional().or(z.literal("")),
  emergencyContact: z.string().optional().or(z.literal("")),
  idNumber: z.string().optional().or(z.literal("")),
  studentName: z.string().min(2, "Student name is required"),
  studentGrade: z.string().min(1, "Student grade is required"),
  studentClass: z.string().min(1, "Student class is required"),
  studentStream: z.string().optional().or(z.literal("")),
  studentAdmissionNumber: z.string().min(1, "Student admission number is required"),
  communicationSms: z.boolean(),
  communicationEmail: z.boolean(),
  communicationWhatsapp: z.boolean(),
})

type ParentFormData = z.infer<typeof parentFormSchema>

// Mock grades data
const mockGrades = [
  { id: 'baby-class', displayName: 'Baby Class' },
  { id: 'pp1', displayName: 'PP1' },
  { id: 'pp2', displayName: 'PP2' },
  { id: 'grade1', displayName: 'Grade 1' },
  { id: 'grade2', displayName: 'Grade 2' },
  { id: 'grade3', displayName: 'Grade 3' },
  { id: 'grade7', displayName: 'Form 1' },
  { id: 'grade8', displayName: 'Form 2' },
  { id: 'grade9', displayName: 'Form 3' },
  { id: 'grade10', displayName: 'Form 4' },
]

interface CreateParentDrawerProps {
  onParentCreated: () => void
}

export function CreateParentDrawer({ onParentCreated }: CreateParentDrawerProps) {
  // Form handling
  const form = useForm<ParentFormData>({
    resolver: zodResolver(parentFormSchema),
    defaultValues: {
      name: '',
      email: '',
      phone: '',
      relationship: 'father',
      occupation: '',
      workAddress: '',
      homeAddress: '',
      emergencyContact: '',
      idNumber: '',
      studentName: '',
      studentGrade: '',
      studentClass: '',
      studentStream: '',
      studentAdmissionNumber: '',
      communicationSms: true,
      communicationEmail: false,
      communicationWhatsapp: true,
    },
  })

  // Submit handler
  const onSubmit = (data: ParentFormData) => {
    // In a real application, this would call an API to create the parent
    console.log('Creating parent:', data)
    // Simulate API call
    setTimeout(() => {
      onParentCreated()
      form.reset()
    }, 500)
  }

  return (
    <Drawer>
      <DrawerTrigger asChild>
        <Button variant="default" className="flex items-center gap-2 font-mono">
          <UserPlus className="h-4 w-4" />
          Add New Parent
        </Button>
      </DrawerTrigger>
      <DrawerContent className="h-full w-full md:w-1/2 bg-slate-50 dark:bg-slate-900" data-vaul-drawer-direction="right">
        <DrawerHeader className="border-b-2 border-primary/20 pb-6">
          <div className="flex flex-col items-center space-y-4">
            <div className="inline-block w-fit px-3 py-1 bg-primary/5 border border-primary/20 rounded-md">
              <span className="text-xs font-mono uppercase tracking-wide text-primary">
                Parent Registration
              </span>
            </div>
            <div className="flex items-center gap-3">
              <div className="bg-primary/10 border-2 border-primary/20 rounded-xl p-3">
                <Users className="h-6 w-6 text-primary" />
              </div>
              <DrawerTitle className="text-2xl font-mono font-bold tracking-wide text-slate-900 dark:text-slate-100">
                New Parent/Guardian
              </DrawerTitle>
            </div>
            <DrawerDescription className="text-center text-sm text-slate-600 dark:text-slate-400 font-medium max-w-md">
              Register a new parent or guardian and link them to their student
            </DrawerDescription>
          </div>
        </DrawerHeader>
        <div className="px-6 py-4 overflow-y-auto">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 p-2">
              {/* Parent Personal Information */}
              <div className="border-2 border-primary/20 bg-primary/5 rounded-xl p-6">
                <div className="inline-block w-fit px-3 py-1 bg-primary/10 border border-primary/20 rounded-md mb-4">
                  <h3 className="text-xs font-mono uppercase tracking-wide text-primary flex items-center">
                    <User className="h-3 w-3 mr-2" />
                    Parent Information
                  </h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="font-mono text-sm">Full Name *</FormLabel>
                        <FormControl>
                          <Input placeholder="Parent/Guardian full name" {...field} className="font-mono" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="relationship"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="font-mono text-sm">Relationship *</FormLabel>
                        <Select 
                          onValueChange={field.onChange} 
                          defaultValue={field.value}
                        >
                          <FormControl>
                            <SelectTrigger className="font-mono">
                              <SelectValue placeholder="Select relationship" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="father">Father</SelectItem>
                            <SelectItem value="mother">Mother</SelectItem>
                            <SelectItem value="guardian">Guardian</SelectItem>
                            <SelectItem value="other">Other</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="phone"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="flex items-center gap-1 font-mono text-sm">
                          <Phone className="h-3.5 w-3.5 text-primary" />
                          Phone Number *
                        </FormLabel>
                        <FormControl>
                          <Input placeholder="+254700000000" {...field} className="font-mono" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="flex items-center gap-1 font-mono text-sm">
                          <Mail className="h-3.5 w-3.5 text-primary" />
                          Email (Optional)
                        </FormLabel>
                        <FormControl>
                          <Input placeholder="parent@example.com" {...field} className="font-mono" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="idNumber"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="flex items-center gap-1 font-mono text-sm">
                          <Shield className="h-3.5 w-3.5 text-primary" />
                          ID Number (Optional)
                        </FormLabel>
                        <FormControl>
                          <Input placeholder="National ID Number" {...field} className="font-mono" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="occupation"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="flex items-center gap-1 font-mono text-sm">
                          <Briefcase className="h-3.5 w-3.5 text-primary" />
                          Occupation (Optional)
                        </FormLabel>
                        <FormControl>
                          <Input placeholder="Job title or profession" {...field} className="font-mono" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="homeAddress"
                    render={({ field }) => (
                      <FormItem className="md:col-span-2">
                        <FormLabel className="flex items-center gap-1 font-mono text-sm">
                          <MapPin className="h-3.5 w-3.5 text-primary" />
                          Home Address (Optional)
                        </FormLabel>
                        <FormControl>
                          <Input placeholder="Physical home address" {...field} className="font-mono" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="workAddress"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="font-mono text-sm">Work Address (Optional)</FormLabel>
                        <FormControl>
                          <Input placeholder="Work location" {...field} className="font-mono" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="emergencyContact"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="font-mono text-sm">Emergency Contact (Optional)</FormLabel>
                        <FormControl>
                          <Input placeholder="+254700000000" {...field} className="font-mono" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>
              
              {/* Student Information */}
              <div className="border-2 border-primary/20 bg-primary/5 rounded-xl p-6">
                <div className="inline-block w-fit px-3 py-1 bg-primary/10 border border-primary/20 rounded-md mb-4">
                  <h3 className="text-xs font-mono uppercase tracking-wide text-primary flex items-center">
                    <Users className="h-3 w-3 mr-2" />
                    Student Information
                  </h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="studentName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="font-mono text-sm">Student Name *</FormLabel>
                        <FormControl>
                          <Input placeholder="Student's full name" {...field} className="font-mono" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="studentAdmissionNumber"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="font-mono text-sm">Admission Number *</FormLabel>
                        <FormControl>
                          <Input placeholder="e.g., KPS/2023/001" {...field} className="font-mono" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="studentGrade"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="font-mono text-sm">Grade *</FormLabel>
                        <Select 
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                        >
                          <FormControl>
                            <SelectTrigger className="font-mono">
                              <SelectValue placeholder="Select grade" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {mockGrades.map(grade => (
                              <SelectItem key={grade.id} value={grade.id}>
                                {grade.displayName}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="studentClass"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="font-mono text-sm">Class *</FormLabel>
                        <FormControl>
                          <Input placeholder="e.g., Form 1 East" {...field} className="font-mono" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="studentStream"
                    render={({ field }) => (
                      <FormItem className="md:col-span-2">
                        <FormLabel className="font-mono text-sm">Stream (Optional)</FormLabel>
                        <FormControl>
                          <Input placeholder="e.g., East, West, Blue" {...field} className="font-mono" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>
              
              {/* Communication Preferences */}
              <div className="border-2 border-primary/20 bg-primary/10 rounded-xl p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="inline-block w-fit px-3 py-1 bg-primary/10 border border-primary/20 rounded-md">
                    <h3 className="text-xs font-mono uppercase tracking-wide text-primary flex items-center">
                      <MessageSquare className="h-3 w-3 mr-2" />
                      Communication Preferences
                    </h3>
                  </div>
                  <Badge className="bg-primary/20 text-primary border border-primary/30 font-mono text-xs">Optional</Badge>
                </div>
                <p className="text-sm text-slate-600 dark:text-slate-400 font-medium mb-4 leading-relaxed">
                  Select how you would like to receive school communications and updates.
                </p>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <FormField
                    control={form.control}
                    name="communicationSms"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border border-primary/20 p-4 bg-primary/5">
                        <FormControl>
                          <Checkbox
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                        <div className="space-y-1 leading-none">
                          <FormLabel className="font-mono text-sm">
                            SMS Messages
                          </FormLabel>
                          <p className="text-xs text-slate-500">
                            Receive text messages
                          </p>
                        </div>
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="communicationEmail"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border border-primary/20 p-4 bg-primary/5">
                        <FormControl>
                          <Checkbox
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                        <div className="space-y-1 leading-none">
                          <FormLabel className="font-mono text-sm">
                            Email Updates
                          </FormLabel>
                          <p className="text-xs text-slate-500">
                            Receive email notifications
                          </p>
                        </div>
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="communicationWhatsapp"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border border-primary/20 p-4 bg-primary/5">
                        <FormControl>
                          <Checkbox
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                        <div className="space-y-1 leading-none">
                          <FormLabel className="font-mono text-sm">
                            WhatsApp
                          </FormLabel>
                          <p className="text-xs text-slate-500">
                            Receive WhatsApp messages
                          </p>
                        </div>
                      </FormItem>
                    )}
                  />
                </div>
              </div>

              <DrawerFooter className="border-t-2 border-primary/20 pt-6 space-y-3">
                <Button type="submit" className="bg-primary hover:bg-primary/90 text-white gap-2 font-mono transition-colors">
                  <UserPlus className="h-4 w-4" />
                  Register Parent/Guardian
                </Button>
                <DrawerClose asChild>
                  <Button variant="outline" className="border-primary/20 text-slate-600 dark:text-slate-400 hover:bg-primary/5 hover:border-primary/40 font-mono transition-colors">
                    Cancel
                  </Button>
                </DrawerClose>
              </DrawerFooter>
            </form>
          </Form>
        </div>
      </DrawerContent>
    </Drawer>
  )
} 