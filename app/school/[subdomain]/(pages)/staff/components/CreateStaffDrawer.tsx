"use client"

import { useState } from 'react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
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
} from '@/components/ui/drawer'
import { 
  User, 
  Mail, 
  Phone, 
  MapPin, 
  Briefcase, 
  GraduationCap,
  Calendar,
  Building,
  UserPlus,
  Clock,
  Shield
} from "lucide-react"

interface CreateStaffDrawerProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onStaffCreated: () => void
}

interface StaffFormData {
  name: string
  employeeId: string
  email: string
  phone: string
  dateOfBirth: string
  address: string
  position: string
  department: string
  staffType: 'teaching' | 'administrative' | 'support' | 'part-time' | 'substitute'
  joinDate: string
  workSchedule: string
  officeLocation: string
  qualifications: string
  experience: string
  subjects: string
  specializations: string
  responsibilities: string
  emergencyContactName: string
  emergencyContactRelationship: string
  emergencyContactPhone: string
}

export function CreateStaffDrawer({ open, onOpenChange, onStaffCreated }: CreateStaffDrawerProps) {
  const [formData, setFormData] = useState<StaffFormData>({
    name: '',
    employeeId: '',
    email: '',
    phone: '',
    dateOfBirth: '',
    address: '',
    position: '',
    department: '',
    staffType: 'teaching',
    joinDate: '',
    workSchedule: 'Full-time',
    officeLocation: '',
    qualifications: '',
    experience: '',
    subjects: '',
    specializations: '',
    responsibilities: '',
    emergencyContactName: '',
    emergencyContactRelationship: '',
    emergencyContactPhone: ''
  })
  const [isSubmitting, setIsSubmitting] = useState(false)

  const departments = [
    'Administration', 'Mathematics', 'Sciences', 'English', 'Languages',
    'Social Studies', 'Physical Education', 'Arts & Music', 'Computer Science',
    'Library Services', 'Laboratory', 'ICT Support', 'Security', 'Maintenance'
  ]

  const positions = {
    teaching: ['Mathematics Teacher', 'Science Teacher', 'English Teacher', 'Head of Department'],
    administrative: ['Principal', 'Deputy Principal', 'Registrar', 'Finance Officer'],
    support: ['Librarian', 'Lab Technician', 'ICT Technician', 'Secretary'],
    'part-time': ['Part-time Teacher', 'Consultant', 'Tutor'],
    substitute: ['Substitute Teacher', 'Relief Teacher', 'Temporary Staff']
  }

  const handleInputChange = (field: keyof StaffFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    await new Promise(resolve => setTimeout(resolve, 1000))
    console.log('Creating staff member:', formData)
    setFormData({
      name: '', employeeId: '', email: '', phone: '', dateOfBirth: '', address: '',
      position: '', department: '', staffType: 'teaching', joinDate: '', workSchedule: 'Full-time',
      officeLocation: '', qualifications: '', experience: '', subjects: '', specializations: '',
      responsibilities: '', emergencyContactName: '', emergencyContactRelationship: '', emergencyContactPhone: ''
    })
    setIsSubmitting(false)
    onStaffCreated()
    onOpenChange(false)
  }

  return (
    <Drawer open={open} onOpenChange={onOpenChange}>
      <DrawerContent className="max-h-[90vh]">
        <div className="mx-auto w-full max-w-4xl">
          <DrawerHeader className="border-b-2 border-primary/20">
            <DrawerTitle className="font-mono text-xl">Add New Staff Member</DrawerTitle>
            <DrawerDescription className="font-mono text-sm">
              Enter the staff member's information below
            </DrawerDescription>
          </DrawerHeader>

          <form onSubmit={handleSubmit} className="p-6 space-y-8 overflow-y-auto max-h-[calc(90vh-200px)]">
            {/* Personal Information */}
            <div className="space-y-4">
              <div className="inline-block w-fit px-3 py-1 bg-primary/5 border border-primary/20 rounded-md">
                <span className="text-xs font-mono uppercase tracking-wide text-primary">
                  Personal Information
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name" className="text-sm font-mono">Full Name *</Label>
                  <div className="relative">
                    <User className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                    <Input
                      id="name"
                      placeholder="Enter full name"
                      value={formData.name}
                      onChange={(e) => handleInputChange('name', e.target.value)}
                      className="pl-10 border-primary/20 font-mono"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="employeeId" className="text-sm font-mono">Employee ID *</Label>
                  <div className="relative">
                    <Shield className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                    <Input
                      id="employeeId"
                      placeholder="STF/2024/XXX"
                      value={formData.employeeId}
                      onChange={(e) => handleInputChange('employeeId', e.target.value)}
                      className="pl-10 border-primary/20 font-mono"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email" className="text-sm font-mono">Email Address *</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                    <Input
                      id="email"
                      type="email"
                      placeholder="staff@school.edu"
                      value={formData.email}
                      onChange={(e) => handleInputChange('email', e.target.value)}
                      className="pl-10 border-primary/20 font-mono"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phone" className="text-sm font-mono">Phone Number *</Label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                    <Input
                      id="phone"
                      placeholder="+254 XXX XXX XXX"
                      value={formData.phone}
                      onChange={(e) => handleInputChange('phone', e.target.value)}
                      className="pl-10 border-primary/20 font-mono"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="dateOfBirth" className="text-sm font-mono">Date of Birth</Label>
                  <div className="relative">
                    <Calendar className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                    <Input
                      id="dateOfBirth"
                      type="date"
                      value={formData.dateOfBirth}
                      onChange={(e) => handleInputChange('dateOfBirth', e.target.value)}
                      className="pl-10 border-primary/20 font-mono"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="address" className="text-sm font-mono">Address</Label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                    <Input
                      id="address"
                      placeholder="Physical address"
                      value={formData.address}
                      onChange={(e) => handleInputChange('address', e.target.value)}
                      className="pl-10 border-primary/20 font-mono"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Professional Information */}
            <div className="space-y-4">
              <div className="inline-block w-fit px-3 py-1 bg-primary/5 border border-primary/20 rounded-md">
                <span className="text-xs font-mono uppercase tracking-wide text-primary">
                  Professional Information
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="staffType" className="text-sm font-mono">Staff Type *</Label>
                  <Select value={formData.staffType} onValueChange={(value) => handleInputChange('staffType', value)}>
                    <SelectTrigger className="border-primary/20 font-mono">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="teaching">Teaching Staff</SelectItem>
                      <SelectItem value="administrative">Administrative Staff</SelectItem>
                      <SelectItem value="support">Support Staff</SelectItem>
                      <SelectItem value="part-time">Part-time Staff</SelectItem>
                      <SelectItem value="substitute">Substitute Staff</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="position" className="text-sm font-mono">Position *</Label>
                  <Select value={formData.position} onValueChange={(value) => handleInputChange('position', value)}>
                    <SelectTrigger className="border-primary/20 font-mono">
                      <SelectValue placeholder="Select position" />
                    </SelectTrigger>
                    <SelectContent>
                      {positions[formData.staffType]?.map(pos => (
                        <SelectItem key={pos} value={pos}>{pos}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="department" className="text-sm font-mono">Department *</Label>
                  <Select value={formData.department} onValueChange={(value) => handleInputChange('department', value)}>
                    <SelectTrigger className="border-primary/20 font-mono">
                      <SelectValue placeholder="Select department" />
                    </SelectTrigger>
                    <SelectContent>
                      {departments.map(dept => (
                        <SelectItem key={dept} value={dept}>{dept}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="joinDate" className="text-sm font-mono">Join Date *</Label>
                  <div className="relative">
                    <Calendar className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                    <Input
                      id="joinDate"
                      type="date"
                      value={formData.joinDate}
                      onChange={(e) => handleInputChange('joinDate', e.target.value)}
                      className="pl-10 border-primary/20 font-mono"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="experience" className="text-sm font-mono">Years of Experience *</Label>
                  <div className="relative">
                    <Clock className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                    <Input
                      id="experience"
                      type="number"
                      placeholder="Years"
                      value={formData.experience}
                      onChange={(e) => handleInputChange('experience', e.target.value)}
                      className="pl-10 border-primary/20 font-mono"
                      required
                      min="0"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="officeLocation" className="text-sm font-mono">Office Location</Label>
                  <div className="relative">
                    <Building className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                    <Input
                      id="officeLocation"
                      placeholder="Office/Room location"
                      value={formData.officeLocation}
                      onChange={(e) => handleInputChange('officeLocation', e.target.value)}
                      className="pl-10 border-primary/20 font-mono"
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="qualifications" className="text-sm font-mono">Qualifications *</Label>
                  <div className="relative">
                    <GraduationCap className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                    <Textarea
                      id="qualifications"
                      placeholder="List qualifications (comma separated)"
                      value={formData.qualifications}
                      onChange={(e) => handleInputChange('qualifications', e.target.value)}
                      className="pl-10 border-primary/20 font-mono min-h-[80px]"
                      required
                    />
                  </div>
                </div>

                {formData.staffType === 'teaching' && (
                  <div className="space-y-2">
                    <Label htmlFor="subjects" className="text-sm font-mono">Subjects Taught</Label>
                    <Textarea
                      id="subjects"
                      placeholder="List subjects (comma separated)"
                      value={formData.subjects}
                      onChange={(e) => handleInputChange('subjects', e.target.value)}
                      className="border-primary/20 font-mono min-h-[80px]"
                    />
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="responsibilities" className="text-sm font-mono">Key Responsibilities</Label>
                <div className="relative">
                  <Briefcase className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                  <Textarea
                    id="responsibilities"
                    placeholder="List key responsibilities (comma separated)"
                    value={formData.responsibilities}
                    onChange={(e) => handleInputChange('responsibilities', e.target.value)}
                    className="pl-10 border-primary/20 font-mono min-h-[100px]"
                  />
                </div>
              </div>
            </div>

            {/* Emergency Contact */}
            <div className="space-y-4">
              <div className="inline-block w-fit px-3 py-1 bg-primary/5 border border-primary/20 rounded-md">
                <span className="text-xs font-mono uppercase tracking-wide text-primary">
                  Emergency Contact
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="emergencyContactName" className="text-sm font-mono">Contact Name</Label>
                  <div className="relative">
                    <User className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                    <Input
                      id="emergencyContactName"
                      placeholder="Emergency contact name"
                      value={formData.emergencyContactName}
                      onChange={(e) => handleInputChange('emergencyContactName', e.target.value)}
                      className="pl-10 border-primary/20 font-mono"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="emergencyContactRelationship" className="text-sm font-mono">Relationship</Label>
                  <Select 
                    value={formData.emergencyContactRelationship} 
                    onValueChange={(value) => handleInputChange('emergencyContactRelationship', value)}
                  >
                    <SelectTrigger className="border-primary/20 font-mono">
                      <SelectValue placeholder="Select relationship" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="spouse">Spouse</SelectItem>
                      <SelectItem value="parent">Parent</SelectItem>
                      <SelectItem value="sibling">Sibling</SelectItem>
                      <SelectItem value="child">Child</SelectItem>
                      <SelectItem value="friend">Friend</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="emergencyContactPhone" className="text-sm font-mono">Phone Number</Label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                    <Input
                      id="emergencyContactPhone"
                      placeholder="+254 XXX XXX XXX"
                      value={formData.emergencyContactPhone}
                      onChange={(e) => handleInputChange('emergencyContactPhone', e.target.value)}
                      className="pl-10 border-primary/20 font-mono"
                    />
                  </div>
                </div>
              </div>
            </div>
          </form>

          <DrawerFooter className="border-t-2 border-primary/20">
            <div className="flex gap-3">
              <Button
                type="submit"
                disabled={isSubmitting}
                onClick={handleSubmit}
                className="flex-1 bg-primary hover:bg-primary/90 text-white font-mono"
              >
                <UserPlus className="h-4 w-4 mr-2" />
                {isSubmitting ? 'Adding Staff...' : 'Add Staff Member'}
              </Button>
              <DrawerClose asChild>
                <Button variant="outline" className="flex-1 border-primary/20 font-mono">
                  Cancel
                </Button>
              </DrawerClose>
            </div>
          </DrawerFooter>
        </div>
      </DrawerContent>
    </Drawer>
  )
} 