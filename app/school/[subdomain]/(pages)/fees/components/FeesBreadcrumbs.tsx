'use client'

import {
  Breadcrumb,
  BreadcrumbList,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb'
import { Home, FileText, Coins } from 'lucide-react'

interface FeesBreadcrumbsProps {
  activeTab: 'structures' | 'invoices'
  selectedStudent?: string | null
  studentName?: string
}

export const FeesBreadcrumbs = ({ activeTab, selectedStudent, studentName }: FeesBreadcrumbsProps) => {
  return (
    <Breadcrumb className="px-6 py-3 bg-white/80 border-b border-slate-200">
      <BreadcrumbList>
        <BreadcrumbItem>
          <BreadcrumbLink href="#" className="flex items-center gap-1.5">
            <Home className="h-4 w-4" />
            <span>Dashboard</span>
          </BreadcrumbLink>
        </BreadcrumbItem>
        <BreadcrumbSeparator />
        <BreadcrumbItem>
          <BreadcrumbLink href="#" className="flex items-center gap-1.5">
            <Coins className="h-4 w-4" />
            <span>Fees</span>
          </BreadcrumbLink>
        </BreadcrumbItem>
        <BreadcrumbSeparator />
        <BreadcrumbItem>
          {activeTab === 'structures' ? (
            <BreadcrumbPage className="flex items-center gap-1.5">
              <FileText className="h-4 w-4" />
              <span>Fee Structures</span>
            </BreadcrumbPage>
          ) : (
            <>
              <BreadcrumbLink href="#" className="flex items-center gap-1.5">
                <FileText className="h-4 w-4" />
                <span>Invoices</span>
              </BreadcrumbLink>
              {selectedStudent && (
                <>
                  <BreadcrumbSeparator />
                  <BreadcrumbPage>
                    {studentName || 'Student Details'}
                  </BreadcrumbPage>
                </>
              )}
            </>
          )}
        </BreadcrumbItem>
      </BreadcrumbList>
    </Breadcrumb>
  )
}

