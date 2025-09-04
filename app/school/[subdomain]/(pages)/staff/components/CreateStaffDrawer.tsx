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
import { toast } from 'sonner'
import { useSchoolConfig } from '@/lib/hooks/useSchoolConfig'

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
  gender: string
}

export function CreateStaffDrawer({ open, onOpenChange, onStaffCreated }: CreateStaffDrawerProps) {
  const { data: schoolConfig } = useSchoolConfig()
  // Phone number formatting utility
  const formatPhoneNumber = (value: string): string => {
    // If user is trying to clear the field, allow empty or just +254
    if (value === '' || value === '+' || value === '+2' || value === '+25') {
      return '+254';
    }
    
    // Remove all non-digit characters except + at the start
    let cleaned = value.replace(/[^\d+]/g, '');
    
    // If it starts with 0, replace with +254
    if (cleaned.startsWith('0')) {
      cleaned = '+254' + cleaned.substring(1);
    }
    // If it's just digits without +, prepend +254
    else if (cleaned && /^\d/.test(cleaned) && !cleaned.startsWith('+')) {
      cleaned = '+254' + cleaned;
    }
    // If it starts with +254, ensure it's properly formatted and remove any 0 after +254
    else if (cleaned.startsWith('+254')) {
      // Remove 0 immediately after +254 (e.g., +2540712345678 -> +254712345678)
      if (cleaned.startsWith('+2540')) {
        cleaned = '+254' + cleaned.substring(5);
      }
    }
    // If it starts with + but not +254, keep as is (for other country codes)
    else if (cleaned.startsWith('+') && !cleaned.startsWith('+254')) {
      // Keep as is for international numbers
    }
    // If empty or just +, default to +254
    else if (!cleaned || cleaned === '+') {
      cleaned = '+254';
    }
    
    return cleaned;
  };

  const [formData, setFormData] = useState<StaffFormData>({
    name: '',
    employeeId: '',
    email: '',
    phone: '+254',
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
    emergencyContactPhone: '+254',
    gender: ''
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
    // Apply phone formatting for phone number fields
    if (field === 'phone' || field === 'emergencyContactPhone') {
      value = formatPhoneNumber(value);
    }
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!schoolConfig?.tenant?.id) {
      toast.error("Configuration Error", {
        description: "School configuration not available. Please refresh and try again."
      });
      return;
    }

    // Validate required fields
    const requiredFields = {
      name: formData.name,
      employeeId: formData.employeeId,
      email: formData.email,
      phone: formData.phone,
      gender: formData.gender,
      department: formData.department,
      position: formData.position,
      qualifications: formData.qualifications
    };

    const missingFields = Object.entries(requiredFields)
      .filter(([key, value]) => !value || value.trim() === '')
      .map(([key]) => key);

    if (missingFields.length > 0) {
      toast.error("Validation Error", {
        description: `Please fill in all required fields: ${missingFields.join(', ')}`
      });
      return;
    }

    setIsSubmitting(true)

    try {
      const response = await fetch('/api/school/create-staff', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          tenantId: schoolConfig.tenant.id
        }),
      });

      const result = await response.json();
      
      if (!response.ok) {
        // Handle specific validation errors
        if (result.details && Array.isArray(result.details)) {
          const errorMessages = result.details.map((error: any) => error.message).join(', ');
          throw new Error(`Validation failed: ${errorMessages}`);
        }
        throw new Error(result.error || 'Failed to create staff member');
      }

      const staffData = result.inviteStaff;
      
      toast.success("Staff Member Created", {
        description: `Successfully created staff member ${staffData.fullName}. An invitation email has been sent to ${staffData.email}.`
      });
      
      // Reset form
      setFormData({
        name: '', employeeId: '', email: '', phone: '', dateOfBirth: '', address: '',
        position: '', department: '', staffType: 'teaching', joinDate: '', workSchedule: 'Full-time',
        officeLocation: '', qualifications: '', experience: '', subjects: '', specializations: '',
        responsibilities: '', emergencyContactName: '', emergencyContactRelationship: '', emergencyContactPhone: '', gender: ''
      })
      
      onStaffCreated()
      onOpenChange(false)
      
    } catch (error) {
      console.error('Error creating staff member:', error);
      toast.error("Creation Failed", {
        description: error instanceof Error ? error.message : "An error occurred while creating the staff member"
      });
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Drawer open={open} onOpenChange={onOpenChange}>
      <DrawerContent className="h-full w-full md:w-1/2 bg-background" data-vaul-drawer-direction="right">
        <div className="flex flex-col h-full">
          <DrawerHeader className="border-b-2 border-primary/20 bg-gradient-to-r from-primary/5 to-primary/10">
            <div className="flex items-center gap-4 mb-4">
              <div className="w-12 h-12 bg-primary/10 border border-primary/20 flex items-center justify-center rounded-lg">
                <UserPlus className="h-6 w-6 text-primary" />
              </div>
              <div className="flex-1">
                <DrawerTitle className="text-xl font-mono font-bold text-foreground uppercase tracking-wide">
                  Staff Registration
                </DrawerTitle>
                <DrawerDescription className="text-sm text-muted-foreground font-medium">
                  Send an invitation email to a new staff member
                </DrawerDescription>
              </div>
              <div className="px-3 py-1 bg-primary/10 border border-primary/30 text-xs font-mono text-primary uppercase tracking-wide rounded-md">
                New Entry
              </div>
            </div>
          </DrawerHeader>

          <form onSubmit={handleSubmit} className="flex-1 p-6 space-y-8 overflow-y-auto">
            <div className="max-w-none">
            {/* Personal Information */}
            <div className="space-y-4">
              <div className="inline-block w-fit px-4 py-2 bg-gradient-to-r from-primary/10 to-primary/5 border border-primary/20 rounded-lg shadow-sm">
                <span className="text-sm font-mono uppercase tracking-wide text-primary font-semibold">
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
                      className="pl-10 border-primary/20 font-mono focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all duration-200"
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
                      placeholder="+254700000000"
                      value={formData.phone}
                      onChange={(e) => handleInputChange('phone', e.target.value)}
                      className="pl-10 border-primary/20 font-mono"
                      required
                    />
                  </div>
                  <div className="text-xs text-slate-500 dark:text-slate-400 ml-1">
                    Kenya numbers start with +254. If you enter 0, it will be automatically converted.
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
                  <Label htmlFor="gender" className="text-sm font-mono">Gender *</Label>
                  <Select value={formData.gender} onValueChange={(value) => handleInputChange('gender', value)}>
                    <SelectTrigger className="border-primary/20 font-mono focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all duration-200">
                      <SelectValue placeholder="Select gender" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="male">Male</SelectItem>
                      <SelectItem value="female">Female</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
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
              <div className="inline-block w-fit px-4 py-2 bg-gradient-to-r from-primary/10 to-primary/5 border border-primary/20 rounded-lg shadow-sm">
                <span className="text-sm font-mono uppercase tracking-wide text-primary font-semibold">
                  Professional Information
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="staffType" className="text-sm font-mono">Staff Type *</Label>
                  <Select value={formData.staffType} onValueChange={(value) => handleInputChange('staffType', value)}>
                    <SelectTrigger className="border-primary/20 font-mono focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all duration-200">
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
                    <SelectTrigger className="border-primary/20 font-mono focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all duration-200">
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
                    <SelectTrigger className="border-primary/20 font-mono focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all duration-200">
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
                      className="pl-10 border-primary/20 font-mono min-h-[80px] focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all duration-200"
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
              <div className="inline-block w-fit px-4 py-2 bg-gradient-to-r from-primary/10 to-primary/5 border border-primary/20 rounded-lg shadow-sm">
                <span className="text-sm font-mono uppercase tracking-wide text-primary font-semibold">
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
                      placeholder="+254700000000"
                      value={formData.emergencyContactPhone}
                      onChange={(e) => handleInputChange('emergencyContactPhone', e.target.value)}
                      className="pl-10 border-primary/20 font-mono"
                    />
                  </div>
                  <div className="text-xs text-slate-500 dark:text-slate-400 ml-1">
                    Kenya numbers start with +254. If you enter 0, it will be automatically converted.
                  </div>
                </div>
              </div>
            </div>
            </div>
          </form>

          <DrawerFooter className="border-t-2 border-primary/20 bg-gradient-to-r from-primary/5 to-primary/10 p-6">
            <div className="flex gap-3">
              <Button
                type="submit"
                disabled={isSubmitting}
                onClick={handleSubmit}
                className="flex-1 bg-primary hover:bg-primary/90 text-white font-mono h-12 text-base font-semibold shadow-lg hover:shadow-xl transition-all duration-200"
              >
                <UserPlus className="h-5 w-5 mr-2" />
                {isSubmitting ? 'Adding Staff...' : 'Add Staff Member'}
              </Button>
              <DrawerClose asChild>
                <Button variant="outline" className="flex-1 border-primary/20 font-mono h-12 text-base hover:bg-primary/5 transition-all duration-200">
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