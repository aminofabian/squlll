'use client'

import { useState } from 'react'
import { FeeStructureManager } from '../components/FeeStructureManager'
import { FeeStructureFormComponent } from '../components/FeeStructureForm'
import { BulkInvoiceGenerator } from '../components/BulkInvoiceGenerator'
import { useFeeStructures } from '../hooks/useFeeStructures'
import { FeeStructure, FeeStructureForm, BulkInvoiceGeneration } from '../types'

export default function FeeStructuresPage() {
  const {
    feeStructures,
    grades,
    createFeeStructure,
    updateFeeStructure,
    deleteFeeStructure,
    assignFeeStructureToGrade,
    generateBulkInvoices
  } = useFeeStructures()

  const [showCreateForm, setShowCreateForm] = useState(false)
  const [showEditForm, setShowEditForm] = useState(false)
  const [showInvoiceGenerator, setShowInvoiceGenerator] = useState(false)
  const [selectedStructure, setSelectedStructure] = useState<FeeStructure | null>(null)
  const [preselectedStructureId, setPreselectedStructureId] = useState<string>('')
  const [preselectedTerm, setPreselectedTerm] = useState<string>('')

  const handleCreateNew = () => {
    setSelectedStructure(null)
    setShowCreateForm(true)
  }

  const handleEdit = (feeStructure: FeeStructure) => {
    setSelectedStructure(feeStructure)
    setShowEditForm(true)
  }

  const handleSaveStructure = (formData: FeeStructureForm) => {
    if (selectedStructure) {
      updateFeeStructure(selectedStructure.id, formData)
    } else {
      createFeeStructure(formData)
    }
    setShowCreateForm(false)
    setShowEditForm(false)
    setSelectedStructure(null)
  }

  const handleGenerateInvoices = (feeStructureId: string, term: string) => {
    setPreselectedStructureId(feeStructureId)
    setPreselectedTerm(term)
    setShowInvoiceGenerator(true)
  }

  const handleBulkGeneration = (generation: BulkInvoiceGeneration) => {
    try {
      const newInvoices = generateBulkInvoices(generation)
      console.log(`Generated ${newInvoices.length} invoices successfully`)
      // You could add a toast notification here
    } catch (error) {
      console.error('Failed to generate invoices:', error)
      // You could add error handling here
    }
  }

  const handleAssignToGrade = (feeStructureId: string) => {
    // This could open a modal to select grades
    console.log('Assign to grade:', feeStructureId)
  }

  const convertStructureToForm = (structure: FeeStructure): FeeStructureForm => {
    return {
      name: structure.name,
      grade: structure.grade,
      boardingType: structure.boardingType,
      academicYear: structure.academicYear,
      termStructures: structure.termStructures.map(term => ({
        term: term.term,
        dueDate: term.dueDate,
        latePaymentFee: term.latePaymentFee.toString(),
        earlyPaymentDiscount: (term.earlyPaymentDiscount || 0).toString(),
        earlyPaymentDeadline: term.earlyPaymentDeadline || '',
        buckets: term.buckets.map(bucket => ({
          type: bucket.type,
          name: bucket.name,
          description: bucket.description,
          isOptional: bucket.isOptional,
          components: bucket.components.map(component => ({
            name: component.name,
            description: component.description,
            amount: component.amount.toString(),
            category: component.category
          }))
        }))
      }))
    }
  }

  return (
    <div className="container mx-auto py-8">
      <FeeStructureManager
        onCreateNew={handleCreateNew}
        onEdit={handleEdit}
        onGenerateInvoices={handleGenerateInvoices}
        onAssignToGrade={handleAssignToGrade}
      />

      {/* Create Form */}
      <FeeStructureFormComponent
        isOpen={showCreateForm}
        onClose={() => setShowCreateForm(false)}
        onSave={handleSaveStructure}
        mode="create"
      />

      {/* Edit Form */}
      <FeeStructureFormComponent
        isOpen={showEditForm}
        onClose={() => setShowEditForm(false)}
        onSave={handleSaveStructure}
        initialData={selectedStructure ? convertStructureToForm(selectedStructure) : undefined}
        mode="edit"
      />

      {/* Bulk Invoice Generator */}
      <BulkInvoiceGenerator
        isOpen={showInvoiceGenerator}
        onClose={() => setShowInvoiceGenerator(false)}
        onGenerate={handleBulkGeneration}
        preselectedStructureId={preselectedStructureId}
        preselectedTerm={preselectedTerm}
      />
    </div>
  )
}
