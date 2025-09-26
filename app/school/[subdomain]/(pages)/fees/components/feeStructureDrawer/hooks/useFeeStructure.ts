'use client'

import { useState, useEffect, useMemo, useRef } from 'react'
import { FeeStructureForm, TermFeeStructureForm, FeeBucketForm, FeeComponentForm } from '../../../types'
import { ValidationError } from '../types'

const defaultTermStructure: TermFeeStructureForm = {
  term: '', // Will be populated from available terms
  academicYear: '',
  dueDate: '',
  latePaymentFee: '0',
  earlyPaymentDiscount: '0',
  earlyPaymentDeadline: '',
  buckets: [
    {
      type: 'tuition',
      name: 'Tuition Fees',
      description: 'Academic fees for the term',
      isOptional: false,
      components: [
        {
          name: 'Base Tuition',
          description: 'Standard tuition fee',
          amount: '0',
          category: 'academic'
        }
      ]
    }
  ]
}

const defaultBucket: FeeBucketForm = {
  type: 'tuition',
  name: '',
  description: '',
  isOptional: false,
  components: [
    {
      name: '',
      description: '',
      amount: '0',
      category: 'academic'
    }
  ]
}

const defaultComponent: FeeComponentForm = {
  name: '',
  description: '',
  amount: '0',
  category: 'academic'
}

interface UseFeeStructureProps {
  initialData?: FeeStructureForm
  subdomain: string
  schoolName?: string
  academicYears: any[]
}

export const useFeeStructure = ({ 
  initialData, 
  subdomain, 
  schoolName, 
  academicYears 
}: UseFeeStructureProps) => {
  // Get school name from config or format subdomain as fallback
  const getSchoolName = () => {
    if (schoolName) {
      return schoolName.toUpperCase()
    }
    if (subdomain) {
      return subdomain.charAt(0).toUpperCase() + subdomain.slice(1).replace(/[-_]/g, ' ') + ' SCHOOL'
    }
    return 'SCHOOL NAME'
  }

  // Form data state
  const [formData, setFormData] = useState<FeeStructureForm>({
    name: '',
    grade: '',
    boardingType: 'both',
    academicYear: '',
    termStructures: [defaultTermStructure],
    schoolDetails: {
      name: getSchoolName(),
      address: 'P.O. Box 100 - 40404, KENYA. Cell: 0710000000',
      contact: '0710000000',
      email: `info@${subdomain || 'school'}.edu`,
      principalName: 'PRINCIPAL NAME',
      principalTitle: 'PRINCIPAL'
    },
    paymentModes: {
      bankAccounts: [
        { bankName: 'Kenya Commercial Bank', branch: 'Main Branch', accountNumber: '1234567890' },
        { bankName: 'National Bank of Kenya', branch: 'Main Branch', accountNumber: '0987654321' }
      ],
      postalAddress: 'Repayable at Main Post Office',
      notes: [
        'Full school fees should be paid at the beginning of the term to any of the school accounts listed.',
        'The school official receipts shall be issued upon presentation of original pay-in slips or Money Orders.',
        'The fees may be deposited at any Branch of National Bank or Kenya Commercial Bank County wide.',
        'Fees can be paid by Banker\'s Cheque, but personal cheques will not be accepted.'
      ]
    }
  })

  // Selected grades
  const [selectedGrades, setSelectedGrades] = useState<string[]>([])

  // Step wizard state for guided fee structure creation
  const [currentStep, setCurrentStep] = useState<number>(1)
  const totalSteps = 6

  // Tab state
  const [activeTab, setActiveTab] = useState<'form' | 'preview'>('form')
  const [activeGradeTab, setActiveGradeTab] = useState<'classes' | 'gradelevels'>('gradelevels')
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set())
  const [collapsedTerms, setCollapsedTerms] = useState<Set<number>>(new Set())

  // Initialize with default data or initialData
  useEffect(() => {
    if (initialData) {
      setFormData(initialData)
      setSelectedGrades([initialData.grade])
    } else {
      const currentYear = new Date().getFullYear().toString()
      // Try to get terms from the active academic year
      const activeYear = academicYears.find(year => year.isActive) || academicYears[0]
      
      let initialTerms = []
      if (activeYear && activeYear.terms && activeYear.terms.length > 0) {
        // Get the first term for initial setup
        const initialTerm = activeYear.terms[0].name
        
        // Create a term structure with this term
        initialTerms = [{
          ...defaultTermStructure,
          term: initialTerm,
          academicYear: activeYear.name
        }]
      } else {
        initialTerms = [{
          ...defaultTermStructure,
          academicYear: activeYear?.name || currentYear
        }]
      }

      setFormData({
        name: '',
        grade: '',
        boardingType: 'both',
        academicYear: activeYear?.name || currentYear,
        termStructures: initialTerms,
        schoolDetails: {
          name: getSchoolName(),
          address: 'P.O. Box 100 - 40404, KENYA. Cell: 0710000000',
          contact: '0710000000',
          email: `info@${subdomain || 'school'}.edu`,
          principalName: 'PRINCIPAL NAME',
          principalTitle: 'PRINCIPAL'
        },
        paymentModes: {
          bankAccounts: [
            { bankName: 'Kenya Commercial Bank', branch: 'Main Branch', accountNumber: '1234567890' },
            { bankName: 'National Bank of Kenya', branch: 'Main Branch', accountNumber: '0987654321' }
          ],
          postalAddress: 'Repayable at Main Post Office',
          notes: [
            'Full school fees should be paid at the beginning of the term to any of the school accounts listed.',
            'The school official receipts shall be issued upon presentation of original pay-in slips or Money Orders.',
            'The fees may be deposited at any Branch of National Bank or Kenya Commercial Bank County wide.',
            'Fees can be paid by Banker\'s Cheque, but personal cheques will not be accepted.'
          ]
        }
      })
      setSelectedGrades([])
    }
  }, [initialData, subdomain, schoolName, academicYears])

  // Step navigation functions
  const goToNextStep = () => {
    if (currentStep < totalSteps) {
      setCurrentStep(prev => prev + 1)
    }
  }
  
  const goToPrevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(prev => prev - 1)
    }
  }
  
  const goToStep = (stepNumber: number) => {
    if (stepNumber >= 1 && stepNumber <= totalSteps) {
      setCurrentStep(stepNumber)
    }
  }

  // Validation functions
  const isCurrentStepValid = () => {
    switch(currentStep) {
      case 1: // Basic Info
        return formData.name.trim() !== '' && formData.academicYear.trim() !== ''
      case 2: // Grade Selection
        return selectedGrades.length > 0
      case 3: // Terms Setup
        return formData.termStructures.length > 0 && formData.termStructures.every(term => term.term.trim() !== '')
      case 4: // Fee Components
        return formData.termStructures.every(term => term.buckets.some(bucket => bucket.name.trim() !== ''))
      case 5: // Review
        return true // Always valid as it's just review
      default:
        return false
    }
  }

  // Validation errors
  const validationErrors = useMemo(() => {
    const errors: ValidationError[] = []
    if (!formData.name?.trim()) errors.push({ message: 'Enter a name for the fee structure', anchorId: 'fee-structure-name' })
    if (!formData.academicYear?.trim()) errors.push({ message: 'Select the main academic year', anchorId: 'main-academic-year' })
    if (selectedGrades.length === 0) errors.push({ message: 'Select at least one grade', anchorId: 'grade-selection' })
    if (formData.termStructures.length === 0) errors.push({ message: 'Add at least one term', anchorId: 'terms-section' })
    formData.termStructures.forEach((term, tIndex) => {
      const tId = `term-${tIndex}`
      if (!term.term) errors.push({ message: `Select term name for term ${tIndex + 1}`, anchorId: tId })
      if (!term.buckets || term.buckets.length === 0) errors.push({ message: `Add at least one bucket in term ${tIndex + 1}`, anchorId: tId })
      term.buckets?.forEach((bucket, bIndex) => {
        const bId = `term-${tIndex}-bucket-${bIndex}`
        if (!bucket.name?.trim()) errors.push({ message: `Bucket ${bIndex + 1} needs a name`, anchorId: bId })
        if (!bucket.components || bucket.components.length === 0) errors.push({ message: `Add at least one component in bucket ${bucket.name || bIndex + 1}`, anchorId: bId })
        bucket.components?.forEach((comp, cIndex) => {
          const a = String(comp.amount ?? '').trim()
          if (a === '') errors.push({ message: `Enter amount for ${comp.name || `component ${cIndex + 1}`} in bucket ${bucket.name || bIndex + 1}`, anchorId: bId })
        })
      })
    })
    return errors
  }, [formData, selectedGrades])

  // Term and bucket management functions
  const addTermStructure = () => {
    // Find selected academic year
    const selectedAcademicYear = academicYears.find(year => year.name === formData.academicYear)
    
    // Get all available terms for this academic year
    const availableTerms = selectedAcademicYear?.terms || []
    
    // Find a term that isn't already being used
    let termName = ''
    if (availableTerms.length > 0) {
      const usedTermNames = new Set(formData.termStructures.map(ts => ts.term))
      
      const availableTerm = availableTerms.find(t => !usedTermNames.has(t.name))
      if (availableTerm) {
        termName = availableTerm.name
      } else {
        // If all terms are used, just use the first one
        termName = availableTerms[0].name
      }
    }
    
    setFormData(prev => ({
      ...prev,
      termStructures: [...prev.termStructures, { 
        ...defaultTermStructure, 
        term: termName,
        academicYear: prev.academicYear || ''
      }]
    }))
    
    return termName
  }

  const removeTermStructure = (index: number) => {
    if (formData.termStructures.length > 1) {
      const termName = formData.termStructures[index].term
      setFormData(prev => ({
        ...prev,
        termStructures: prev.termStructures.filter((_, i) => i !== index)
      }))
      return termName
    }
    return ''
  }

  const updateTermStructure = (index: number, field: keyof TermFeeStructureForm, value: any) => {
    setFormData(prev => {
      return {
        ...prev,
        termStructures: prev.termStructures.map((term, i) => 
          i === index ? { ...term, [field]: value } : term
        )
      }
    })
  }

  const addBucket = (termIndex: number) => {
    const newBucket = { ...defaultBucket }
    setFormData(prev => ({
      ...prev,
      termStructures: prev.termStructures.map((term, i) => 
        i === termIndex 
          ? { ...term, buckets: [...term.buckets, newBucket] }
          : term
      )
    }))
  }

  const removeBucket = (termIndex: number, bucketIndex: number) => {
    setFormData(prev => ({
      ...prev,
      termStructures: prev.termStructures.map((term, i) => 
        i === termIndex 
          ? { ...term, buckets: term.buckets.filter((_, j) => j !== bucketIndex) }
          : term
      )
    }))
  }

  const updateBucket = (termIndex: number, bucketIndex: number, field: keyof FeeBucketForm, value: any) => {
    setFormData(prev => ({
      ...prev,
      termStructures: prev.termStructures.map((term, i) => 
        i === termIndex 
          ? {
              ...term,
              buckets: term.buckets.map((bucket, j) => 
                j === bucketIndex ? { ...bucket, [field]: value } : bucket
              )
            }
          : term
      )
    }))
  }

  const addComponent = (termIndex: number, bucketIndex: number) => {
    setFormData(prev => ({
      ...prev,
      termStructures: prev.termStructures.map((term, tIndex) => 
        tIndex === termIndex 
          ? {
              ...term,
              buckets: term.buckets.map((bucket, bIndex) => 
                bIndex === bucketIndex 
                  ? { ...bucket, components: [...bucket.components, { ...defaultComponent }] }
                  : bucket
              )
            }
          : term
      )
    }))
  }

  const removeComponent = (termIndex: number, bucketIndex: number, componentIndex: number) => {
    setFormData(prev => ({
      ...prev,
      termStructures: prev.termStructures.map((term, i) => 
        i === termIndex 
          ? {
              ...term,
              buckets: term.buckets.map((bucket, j) => 
                j === bucketIndex 
                  ? { ...bucket, components: bucket.components.filter((_, k) => k !== componentIndex) }
                  : bucket
              )
            }
          : term
      )
    }))
  }

  const updateComponent = (termIndex: number, bucketIndex: number, componentIndex: number, field: keyof FeeComponentForm, value: any) => {
    setFormData(prev => ({
      ...prev,
      termStructures: prev.termStructures.map((term, i) => 
        i === termIndex 
          ? {
              ...term,
              buckets: term.buckets.map((bucket, j) => 
                j === bucketIndex 
                  ? {
                      ...bucket,
                      components: bucket.components.map((component, k) => 
                        k === componentIndex ? { ...component, [field]: value } : component
                      )
                    }
                  : bucket
              )
            }
          : term
      )
    }))
  }

  // Calculate totals
  const calculateTermTotal = (termIndex: number): number => {
    const term = formData.termStructures[termIndex]
    if (!term) return 0
    
    return term.buckets.reduce((termTotal, bucket) => {
      const bucketTotal = bucket.components.reduce((bucketSum, component) => {
        return bucketSum + (parseFloat(component.amount) || 0)
      }, 0)
      return termTotal + bucketTotal
    }, 0)
  }

  const calculateGrandTotal = (): number => {
    return formData.termStructures.reduce((grandTotal, term, index) => {
      return grandTotal + calculateTermTotal(index)
    }, 0)
  }

  const calculateBucketTotal = (termIndex: number, bucketIndex: number): number => {
    return formData.termStructures[termIndex]?.buckets[bucketIndex]?.components.reduce((sum, component) => 
      sum + (parseFloat(component.amount) || 0), 0) || 0
  }

  const handleGradeToggle = (gradeId: string) => {
    setSelectedGrades(prev => 
      prev.includes(gradeId) 
        ? prev.filter(id => id !== gradeId)
        : [...prev, gradeId]
    )
  }

  return {
    formData,
    setFormData,
    selectedGrades,
    setSelectedGrades,
    currentStep,
    setCurrentStep,
    totalSteps,
    activeTab,
    setActiveTab,
    activeGradeTab,
    setActiveGradeTab,
    expandedCategories,
    setExpandedCategories,
    collapsedTerms,
    setCollapsedTerms,
    goToNextStep,
    goToPrevStep,
    goToStep,
    isCurrentStepValid,
    validationErrors,
    addTermStructure,
    removeTermStructure,
    updateTermStructure,
    addBucket,
    removeBucket,
    updateBucket,
    addComponent,
    removeComponent,
    updateComponent,
    calculateTermTotal,
    calculateGrandTotal,
    calculateBucketTotal,
    handleGradeToggle,
    defaultTermStructure,
    defaultBucket,
    defaultComponent
  }
}
