import React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { StudentSummaryDetail } from '../types'
import { User, Mail, Phone, GraduationCap, Calendar } from 'lucide-react'

interface StudentInfoCardProps {
  studentData: StudentSummaryDetail | null
  loading: boolean
  error: string | null
}

export const StudentInfoCard: React.FC<StudentInfoCardProps> = ({
  studentData,
  loading,
  error
}) => {
  if (loading) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            Student Information
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-4">
            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
            <div className="h-4 bg-gray-200 rounded w-2/3"></div>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (error) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-red-600">
            <User className="h-5 w-5" />
            Student Information Error
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-red-600">{error}</p>
        </CardContent>
      </Card>
    )
  }

  if (!studentData) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            Student Information
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-500">No student selected</p>
        </CardContent>
      </Card>
    )
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-KE', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Personal Information Card */}
      <Card className="w-full">
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center gap-2 text-lg">
            <User className="h-5 w-5 text-blue-600" />
            Personal Information
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Primary Info */}
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-100 flex items-center justify-center">
                <User className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Full Name</p>
                <p className="text-lg font-semibold text-gray-900">{studentData.studentName}</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-green-100 flex items-center justify-center">
                <GraduationCap className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Admission Number</p>
                <p className="text-lg font-semibold text-gray-900">{studentData.admissionNumber}</p>
              </div>
            </div>
          </div>

          <Separator />

          {/* Contact Information */}
          <div className="space-y-4">
            <h4 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">Contact Details</h4>
            
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <Mail className="h-4 w-4 text-gray-500" />
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-600">Email</p>
                  <p className="text-sm text-gray-700 break-all">{studentData.email}</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <Phone className="h-4 w-4 text-gray-500" />
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-600">Phone</p>
                  <p className="text-sm text-gray-700">{studentData.phone}</p>
                </div>
              </div>
            </div>
          </div>

          <Separator />

          {/* Status */}
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-gray-600">Account Status</span>
            <Badge variant={studentData.isActive ? "default" : "secondary"} className="px-3 py-1">
              {studentData.isActive ? 'Active' : 'Inactive'}
            </Badge>
          </div>
        </CardContent>
      </Card>

      {/* Academic Information Card */}
      <Card className="w-full">
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center gap-2 text-lg">
            <GraduationCap className="h-5 w-5 text-purple-600" />
            Academic Information
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Academic Details */}
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <p className="text-sm font-medium text-gray-600">Grade Level</p>
                <div className="p-3 bg-purple-50 border border-purple-200">
                  <p className="text-sm font-semibold text-purple-900">{studentData.gradeLevelName}</p>
                </div>
              </div>

              <div className="space-y-2">
                <p className="text-sm font-medium text-gray-600">School Type</p>
                <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
                  <p className="text-sm font-semibold text-blue-900 capitalize">{studentData.schoolType}</p>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <p className="text-sm font-medium text-gray-600">Curriculum</p>
              <div className="p-3 bg-green-50 rounded-lg border border-green-200">
                <p className="text-sm font-semibold text-green-900">{studentData.curriculumName}</p>
              </div>
            </div>

            <div className="space-y-2">
              <p className="text-sm font-medium text-gray-600">Stream</p>
              <div className="p-3 bg-gray-50 rounded-lg border border-gray-200">
                <p className="text-sm font-semibold text-gray-900">
                  {studentData.streamName || 'Not assigned'}
                </p>
              </div>
            </div>
          </div>

          <Separator />

          {/* Demographics */}
          <div className="space-y-4">
            <h4 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">Demographics</h4>
            
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-600">Gender</span>
              <Badge variant="outline" className="capitalize px-3 py-1">
                {studentData.gender.toLowerCase()}
              </Badge>
            </div>
          </div>

          <Separator />

          {/* Timestamps */}
          <div className="space-y-4">
            <h4 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">Account Timeline</h4>
            
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <Calendar className="h-4 w-4 text-gray-500" />
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-600">Account Created</p>
                  <p className="text-sm text-gray-700">{formatDate(studentData.createdAt)}</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <Calendar className="h-4 w-4 text-gray-500" />
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-600">Last Updated</p>
                  <p className="text-sm text-gray-700">{formatDate(studentData.updatedAt)}</p>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
