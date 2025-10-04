import { useState, useMemo } from 'react'
import { FeeInvoice, StudentSummary, SummaryStats } from '../types'
import { mockFeeInvoices } from '../data/mockData'
import { useStudentsSummary } from '@/lib/hooks/useStudentsSummary'
import { useStudentInvoices } from './useStudentInvoices'

export const useFeesData = () => {
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedFeeType, setSelectedFeeType] = useState<string>('all')
  const [selectedStatus, setSelectedStatus] = useState<string>('all')
  const [selectedClass, setSelectedClass] = useState<string>('all')
  const [selectedSection, setSelectedSection] = useState<string>('all')
  const [dueDateFilter, setDueDateFilter] = useState<string>('all')
  const [selectedStudent, setSelectedStudent] = useState<string | null>(null)

  // Fetch students using the new summary query
  const { students } = useStudentsSummary()

  // Map API students to StudentSummary for the sidebar
  const allStudents = useMemo(() => {
    const mapped: StudentSummary[] = students.map(s => ({
      id: s.id,
      name: s.studentName,
      admissionNumber: s.admissionNumber,
      class: s.gradeLevelName,
      section: '',
      totalOutstanding: s.feeSummary.balance,
      totalPaid: s.feeSummary.totalPaid,
      invoiceCount: s.feeSummary.numberOfFeeItems,
      overdueCount: 0, // To be populated from actual overdue data
    }))
    return mapped.sort((a, b) => a.name.localeCompare(b.name))
  }, [students])

  // Filter students by search term
  const filteredStudents = useMemo(() => {
    if (!searchTerm) return allStudents
    return allStudents.filter(student =>
      student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.admissionNumber.toLowerCase().includes(searchTerm.toLowerCase())
    )
  }, [allStudents, searchTerm])

  // Get invoices for selected student using GraphQL
  const { invoices: selectedStudentInvoices, loading: selectedStudentInvoicesLoading, error: selectedStudentInvoicesError } = useStudentInvoices(selectedStudent)

  // Filter and calculate statistics
  const filteredInvoices = useMemo(() => {
    let filtered = mockFeeInvoices.filter(invoice => {
      const matchesSearch = searchTerm === '' || 
        invoice.studentName.toLowerCase().includes(searchTerm.toLowerCase())
      
      const matchesFeeType = selectedFeeType === 'all' || invoice.feeType === selectedFeeType
      const matchesStatus = selectedStatus === 'all' || invoice.paymentStatus === selectedStatus
      const matchesClass = selectedClass === 'all' || invoice.class === selectedClass
      const matchesSection = selectedSection === 'all' || invoice.section === selectedSection
      
      let matchesDueDate = true
      if (dueDateFilter === 'next7days') {
        const now = new Date()
        const dueDate = new Date(invoice.dueDate)
        const diffTime = dueDate.getTime() - now.getTime()
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
        matchesDueDate = diffDays <= 7 && diffDays >= 0
      } else if (dueDateFilter === 'overdue') {
        const now = new Date()
        const dueDate = new Date(invoice.dueDate)
        matchesDueDate = dueDate < now && invoice.paymentStatus !== 'paid'
      }
      
      return matchesSearch && matchesFeeType && matchesStatus && matchesClass && matchesSection && matchesDueDate
    })

    return filtered.sort((a, b) => new Date(b.invoiceDate).getTime() - new Date(a.invoiceDate).getTime())
  }, [searchTerm, selectedFeeType, selectedStatus, selectedClass, selectedSection, dueDateFilter])

  // Calculate summary statistics
  const summaryStats = useMemo(() => {
    const totalCollected = mockFeeInvoices.reduce((sum, inv) => sum + inv.amountPaid, 0)
    const totalOutstanding = mockFeeInvoices.reduce((sum, inv) => sum + inv.amountDue, 0)
    const studentsWithPendingFees = mockFeeInvoices.filter(inv => inv.amountDue > 0).length
    
    const now = new Date()
    const upcomingDueCount = mockFeeInvoices.filter(inv => {
      const dueDate = new Date(inv.dueDate)
      const diffTime = dueDate.getTime() - now.getTime()
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
      return diffDays <= 7 && diffDays >= 0 && inv.amountDue > 0
    }).length

    const overdueCount = mockFeeInvoices.filter(inv => inv.paymentStatus === 'overdue').length
    const collectionRate = totalCollected / (totalCollected + totalOutstanding) * 100

    return {
      totalCollected,
      totalOutstanding,
      studentsWithPendingFees,
      upcomingDueCount,
      overdueCount,
      collectionRate
    } as SummaryStats
  }, [])

  return {
    // State
    searchTerm,
    setSearchTerm,
    selectedFeeType,
    setSelectedFeeType,
    selectedStatus,
    setSelectedStatus,
    selectedClass,
    setSelectedClass,
    selectedSection,
    setSelectedSection,
    dueDateFilter,
    setDueDateFilter,
    selectedStudent,
    setSelectedStudent,
    
    // Computed data
    allStudents,
    filteredStudents,
    selectedStudentInvoices,
    selectedStudentInvoicesLoading,
    selectedStudentInvoicesError,
    filteredInvoices,
    summaryStats
  }
}
