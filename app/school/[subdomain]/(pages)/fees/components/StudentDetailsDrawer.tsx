'use client'

import { Drawer, DrawerContent, DrawerHeader, DrawerTitle, DrawerDescription } from '@/components/ui/drawer'
import { StudentDetailsCard } from './StudentDetailsCard'
import { StudentSummaryDetail } from '../types'

interface StudentDetailsDrawerProps {
  isOpen: boolean
  onClose: () => void
  studentData: StudentSummaryDetail | null
  loading: boolean
  error: string | null
  onRefresh?: () => void
}

export const StudentDetailsDrawer = ({
  isOpen,
  onClose,
  studentData,
  loading,
  error,
  onRefresh
}: StudentDetailsDrawerProps) => {
  return (
    <Drawer open={isOpen} onOpenChange={onClose}>
      <DrawerContent className="max-h-[90vh] overflow-y-auto">
        <DrawerHeader>
          <DrawerTitle>Student Details</DrawerTitle>
          <DrawerDescription>
            View comprehensive student information and fee summary
          </DrawerDescription>
        </DrawerHeader>
        <div className="px-4 pb-4">
          <StudentDetailsCard
            studentData={studentData}
            loading={loading}
            error={error}
            onRefresh={onRefresh}
          />
        </div>
      </DrawerContent>
    </Drawer>
  )
}

