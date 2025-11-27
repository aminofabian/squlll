import React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Button } from '@/components/ui/button'
import { StudentSummaryDetail } from '../types'
import { User, Mail, Phone, GraduationCap, Calendar, Coins, AlertCircle, RefreshCw } from 'lucide-react'

interface StudentDetailsCardProps {
  studentData: StudentSummaryDetail | null
  loading: boolean
  error: string | null
  onRefresh?: () => void
}

export const StudentDetailsCard: React.FC<StudentDetailsCardProps> = ({
  studentData,
  loading,
  error,
  onRefresh
}) => {
  if (loading) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            Student Details
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
            <AlertCircle className="h-5 w-5" />
            Error Loading Student Details
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-red-600">{error}</p>
          
          {error.includes('Authentication required') && (
            <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
              <p className="text-yellow-800 text-sm">
                <strong>Authentication Issue:</strong> You may need to log in again to access student data.
                Try refreshing the page or logging out and back in.
              </p>
            </div>
          )}
          
          {error.includes('Access denied') && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-red-800 text-sm">
                <strong>Permission Issue:</strong> You don't have permission to view this student's details.
                Contact your administrator if you believe this is an error.
              </p>
            </div>
          )}
          
          {error.includes('Student not found') && (
            <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="text-blue-800 text-sm">
                <strong>Student Not Found:</strong> The selected student may have been removed or the ID is incorrect.
                Try selecting a different student from the sidebar.
              </p>
            </div>
          )}
          
          {onRefresh && (
            <Button
              variant="outline"
              onClick={onRefresh}
              className="flex items-center gap-2"
            >
              <RefreshCw className="h-4 w-4" />
              Try Again
            </Button>
          )}
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
            Student Details
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-500">No student selected</p>
        </CardContent>
      </Card>
    )
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-KE', {
      style: 'currency',
      currency: 'KES',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-KE', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  return (
    <div className="space-y-6">
      {/* Basic Information */}
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            Student Information
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <User className="h-4 w-4 text-gray-500" />
                <span className="text-sm font-medium text-gray-600">Full Name</span>
              </div>
              <p className="text-lg font-semibold text-gray-900">{studentData.studentName}</p>
            </div>

            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <GraduationCap className="h-4 w-4 text-gray-500" />
                <span className="text-sm font-medium text-gray-600">Admission Number</span>
              </div>
              <p className="text-lg font-semibold text-gray-900">{studentData.admissionNumber}</p>
            </div>

            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Mail className="h-4 w-4 text-gray-500" />
                <span className="text-sm font-medium text-gray-600">Email</span>
              </div>
              <p className="text-sm text-gray-700">{studentData.email}</p>
            </div>

            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Phone className="h-4 w-4 text-gray-500" />
                <span className="text-sm font-medium text-gray-600">Phone</span>
              </div>
              <p className="text-sm text-gray-700">{studentData.phone}</p>
            </div>

            <div className="space-y-2">
              <span className="text-sm font-medium text-gray-600">Gender</span>
              <Badge variant="outline" className="capitalize">
                {studentData.gender.toLowerCase()}
              </Badge>
            </div>

            <div className="space-y-2">
              <span className="text-sm font-medium text-gray-600">School Type</span>
              <Badge variant="outline" className="capitalize">
                {studentData.schoolType}
              </Badge>
            </div>
          </div>

          <Separator />

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <span className="text-sm font-medium text-gray-600">Grade Level</span>
              <p className="text-sm text-gray-700">{studentData.gradeLevelName}</p>
            </div>

            <div className="space-y-2">
              <span className="text-sm font-medium text-gray-600">Curriculum</span>
              <p className="text-sm text-gray-700">{studentData.curriculumName}</p>
            </div>

            <div className="space-y-2">
              <span className="text-sm font-medium text-gray-600">Stream</span>
              <p className="text-sm text-gray-700">
                {studentData.streamName || 'Not assigned'}
              </p>
            </div>
          </div>

          <Separator />

          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-gray-600">Status</span>
            <Badge variant={studentData.isActive ? "default" : "secondary"}>
              {studentData.isActive ? 'Active' : 'Inactive'}
            </Badge>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-600">
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              <span>Created: {formatDate(studentData.createdAt)}</span>
            </div>
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              <span>Updated: {formatDate(studentData.updatedAt)}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Fee Summary */}
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Coins className="h-5 w-5" />
            Fee Summary
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <p className="text-sm font-medium text-blue-600">Total Owed</p>
              <p className="text-2xl font-bold text-blue-900">
                {formatCurrency(studentData.feeSummary.totalOwed)}
              </p>
            </div>

            <div className="text-center p-4 bg-green-50 rounded-lg">
              <p className="text-sm font-medium text-green-600">Total Paid</p>
              <p className="text-2xl font-bold text-green-900">
                {formatCurrency(studentData.feeSummary.totalPaid)}
              </p>
            </div>

            <div className="text-center p-4 bg-red-50 rounded-lg">
              <p className="text-sm font-medium text-red-600">Balance</p>
              <p className="text-2xl font-bold text-red-900">
                {formatCurrency(studentData.feeSummary.balance)}
              </p>
            </div>
          </div>

          <Separator />

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-600">Number of Fee Items</span>
              <Badge variant="outline">{studentData.feeSummary.numberOfFeeItems}</Badge>
            </div>

            {studentData.feeSummary.feeItems.length > 0 && (
              <div className="space-y-2">
                <p className="text-sm font-medium text-gray-600">Fee Items:</p>
                <div className="space-y-2">
                  {studentData.feeSummary.feeItems.map((item) => (
                    <div
                      key={item.id}
                      className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                    >
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <p className="font-medium text-gray-900">{item.feeBucketName}</p>
                          {item.isMandatory && (
                            <Badge variant="destructive" className="text-xs">
                              Mandatory
                            </Badge>
                          )}
                        </div>
                        <p className="text-sm text-gray-600">
                          {item.feeStructureName} • {item.academicYearName}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold text-gray-900">
                          {formatCurrency(item.amount)}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
