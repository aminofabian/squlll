import { useState, useMemo } from 'react'
import { FeeStructure, Grade, BulkInvoiceGeneration, FeeStructureForm, FeeInvoice } from '../types'
import { mockFeeStructures, mockGrades, mockFeeInvoices } from '../data/mockData'

export const useFeeStructures = () => {
  const [feeStructures, setFeeStructures] = useState<FeeStructure[]>(mockFeeStructures)
  const [grades, setGrades] = useState<Grade[]>(mockGrades)
  const [invoices, setInvoices] = useState<FeeInvoice[]>(mockFeeInvoices)

  // Get grades assigned to a specific fee structure
  const getAssignedGrades = (feeStructureId: string) => {
    return grades.filter(grade => grade.feeStructureId === feeStructureId)
  }

  // Get total students for a fee structure
  const getTotalStudents = (feeStructureId: string) => {
    return getAssignedGrades(feeStructureId).reduce((sum, grade) => sum + grade.studentCount, 0)
  }

  // Get unassigned grades
  const getUnassignedGrades = () => {
    return grades.filter(grade => !grade.feeStructureId)
  }

  // Create new fee structure
  const createFeeStructure = (formData: FeeStructureForm) => {
    const newStructure: FeeStructure = {
      id: `FS-${Date.now()}`,
      name: formData.name,
      grade: formData.grade,
      boardingType: formData.boardingType,
      academicYear: formData.academicYear,
      isActive: true,
      createdDate: new Date().toISOString(),
      lastModified: new Date().toISOString(),
      termStructures: formData.termStructures.map((term, index) => ({
        id: `TS-${Date.now()}-${index}`,
        term: term.term as 'Term 1' | 'Term 2' | 'Term 3',
        totalAmount: term.buckets.reduce((sum, bucket) => 
          sum + bucket.components.reduce((bucketSum, component) => 
            bucketSum + (parseFloat(component.amount) || 0), 0), 0),
        dueDate: term.dueDate,
        latePaymentFee: parseFloat(term.latePaymentFee) || 0,
        earlyPaymentDiscount: parseFloat(term.earlyPaymentDiscount) || 0,
        earlyPaymentDeadline: term.earlyPaymentDeadline,
        buckets: term.buckets.map((bucket, bucketIndex) => ({
          id: `B-${Date.now()}-${index}-${bucketIndex}`,
          type: bucket.type,
          name: bucket.name,
          description: bucket.description,
          amount: bucket.components.reduce((sum, component) => 
            sum + (parseFloat(component.amount) || 0), 0),
          isOptional: bucket.isOptional,
          components: bucket.components.map((component, componentIndex) => ({
            id: `C-${Date.now()}-${index}-${bucketIndex}-${componentIndex}`,
            name: component.name,
            description: component.description,
            amount: parseFloat(component.amount) || 0,
            category: component.category
          }))
        }))
      }))
    }

    setFeeStructures(prev => [...prev, newStructure])
    return newStructure.id
  }

  // Update fee structure
  const updateFeeStructure = (id: string, formData: FeeStructureForm) => {
    let updatedStructureId: string | null = null
    
    setFeeStructures(prev => prev.map(structure => {
      if (structure.id === id) {
        const updatedStructure: FeeStructure = {
          ...structure,
          name: formData.name,
          grade: formData.grade,
          boardingType: formData.boardingType,
          academicYear: formData.academicYear,
          lastModified: new Date().toISOString(),
          termStructures: formData.termStructures.map((term, index) => ({
            id: structure.termStructures[index]?.id || `TS-${Date.now()}-${index}`,
            term: term.term as 'Term 1' | 'Term 2' | 'Term 3',
            totalAmount: term.buckets.reduce((sum, bucket) => 
              sum + bucket.components.reduce((bucketSum, component) => 
                bucketSum + (parseFloat(component.amount) || 0), 0), 0),
            dueDate: term.dueDate,
            latePaymentFee: parseFloat(term.latePaymentFee) || 0,
            earlyPaymentDiscount: parseFloat(term.earlyPaymentDiscount) || 0,
            earlyPaymentDeadline: term.earlyPaymentDeadline,
            buckets: term.buckets.map((bucket, bucketIndex) => ({
              id: structure.termStructures[index]?.buckets[bucketIndex]?.id || `B-${Date.now()}-${index}-${bucketIndex}`,
              type: bucket.type,
              name: bucket.name,
              description: bucket.description,
              amount: bucket.components.reduce((sum, component) => 
                sum + (parseFloat(component.amount) || 0), 0),
              isOptional: bucket.isOptional,
              components: bucket.components.map((component, componentIndex) => ({
                id: structure.termStructures[index]?.buckets[bucketIndex]?.components[componentIndex]?.id || 
                    `C-${Date.now()}-${index}-${bucketIndex}-${componentIndex}`,
                name: component.name,
                description: component.description,
                amount: parseFloat(component.amount) || 0,
                category: component.category
              }))
            }))
          }))
        }
        updatedStructureId = updatedStructure.id
        return updatedStructure
      }
      return structure
    }))
    
    return updatedStructureId
  }

  // Delete fee structure
  const deleteFeeStructure = (id: string) => {
    setFeeStructures(prev => prev.filter(structure => structure.id !== id))
    // Unassign from grades
    setGrades(prev => prev.map(grade => 
      grade.feeStructureId === id 
        ? { ...grade, feeStructureId: undefined }
        : grade
    ))
  }

  // Assign fee structure to grade
  const assignFeeStructureToGrade = (feeStructureId: string, gradeId: string) => {
    setGrades(prev => prev.map(grade => 
      grade.id === gradeId 
        ? { ...grade, feeStructureId }
        : grade
    ))
  }

  // Unassign fee structure from grade
  const unassignFeeStructureFromGrade = (gradeId: string) => {
    setGrades(prev => prev.map(grade => 
      grade.id === gradeId 
        ? { ...grade, feeStructureId: undefined }
        : grade
    ))
  }

  // Generate bulk invoices from fee structure
  const generateBulkInvoices = (generation: BulkInvoiceGeneration) => {
    const feeStructure = feeStructures.find(fs => fs.id === generation.feeStructureId)
    const termStructure = feeStructure?.termStructures.find(ts => ts.term === generation.term)
    const selectedGrades = grades.filter(grade => generation.gradeIds.includes(grade.id))
    
    if (!feeStructure || !termStructure) {
      throw new Error('Fee structure or term not found')
    }

    const selectedBuckets = termStructure.buckets.filter(bucket => 
      generation.selectedBuckets.includes(bucket.id)
    )

    const newInvoices: FeeInvoice[] = []

    selectedGrades.forEach(grade => {
      // Generate invoices for each student in the grade
      for (let i = 1; i <= grade.studentCount; i++) {
        selectedBuckets.forEach(bucket => {
          const invoice: FeeInvoice = {
            id: `INV-${Date.now()}-${grade.id}-${i}-${bucket.id}`,
            studentId: `STU-${grade.id}-${i}`,
            studentName: `Student ${i} ${grade.name}${grade.section}`,
            admissionNumber: `ADM/${new Date().getFullYear()}/${grade.id}-${i}`,
            class: grade.name,
            section: grade.section,
            feeType: bucket.type,
            totalAmount: bucket.amount,
            amountPaid: 0,
            amountDue: bucket.amount,
            dueDate: generation.dueDate,
            paymentStatus: 'pending',
            invoiceDate: generation.generateDate,
            term: generation.term,
            academicYear: feeStructure.academicYear,
            paymentHistory: [],
            remindersSent: 0
          }
          newInvoices.push(invoice)
        })
      }
    })

    setInvoices(prev => [...prev, ...newInvoices])
    return newInvoices
  }

  // Get fee structure statistics
  const getFeeStructureStats = () => {
    return {
      totalStructures: feeStructures.length,
      activeStructures: feeStructures.filter(fs => fs.isActive).length,
      assignedGrades: grades.filter(grade => grade.feeStructureId).length,
      unassignedGrades: grades.filter(grade => !grade.feeStructureId).length,
      totalStudentsWithStructures: grades
        .filter(grade => grade.feeStructureId)
        .reduce((sum, grade) => sum + grade.studentCount, 0)
    }
  }

  // Get revenue projections
  const getRevenueProjections = () => {
    const projections = feeStructures.map(structure => {
      const assignedGrades = getAssignedGrades(structure.id)
      const totalStudents = assignedGrades.reduce((sum, grade) => sum + grade.studentCount, 0)
      
      return {
        structureId: structure.id,
        structureName: structure.name,
        grade: structure.grade,
        totalStudents,
        termProjections: structure.termStructures.map(term => ({
          term: term.term,
          amountPerStudent: term.totalAmount,
          totalProjected: term.totalAmount * totalStudents
        })),
        yearlyProjected: structure.termStructures.reduce((sum, term) => 
          sum + (term.totalAmount * totalStudents), 0)
      }
    })

    return projections
  }

  return {
    // Data
    feeStructures,
    grades,
    invoices,
    
    // Computed data
    getAssignedGrades,
    getTotalStudents,
    getUnassignedGrades,
    getFeeStructureStats,
    getRevenueProjections,
    
    // Actions
    createFeeStructure,
    updateFeeStructure,
    deleteFeeStructure,
    assignFeeStructureToGrade,
    unassignFeeStructureFromGrade,
    generateBulkInvoices
  }
}
