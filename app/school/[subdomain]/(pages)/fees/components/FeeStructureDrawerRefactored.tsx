'use client'

import React, { useState, useEffect, useRef, useMemo } from 'react'
import { useParams } from 'next/navigation'
import { FileText, Info } from "lucide-react"
import { Tabs, TabsContent } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import {
  FeeStructureDrawerHeader,
  StepWizardProgress,
  ValidationChecklist,
  TabsNavigation,
  ToastNotifications,
  DrawerFooter,
  TermSelectionModal,
  BucketCreationModal,
  BucketEditModal,
  QuickAddTemplatesSection,
  ExistingFeeBucketsSection,
  FeeStructureTermsTable,
  TermlyPaymentSchedule,
  PaymentModesSection,
  SignatureSection,
} from './drawer'
import { useSchoolConfig } from '@/lib/hooks/useSchoolConfig'
import { useFeeBuckets } from '@/lib/hooks/useFeeBuckets'
import { useAcademicYears } from '@/lib/hooks/useAcademicYears'
import { useGradeLevels } from '../hooks/useGradeLevels'
import { useGraphQLFeeStructures } from '../hooks/useGraphQLFeeStructures'
import { CreateAcademicYearModal } from './CreateAcademicYearModal'
import FeeStructureStepContent from './FeeStructureStepBasedContent'
import { FeeStructurePDFPreview } from './FeeStructurePDFPreview'

// Import the types from the original component
import { 
  FeeStructure, 
  FeeStructureForm, 
  Grade, 
  TermFeeStructureForm, 
  FeeBucketForm, 
  FeeComponentForm, 
  BankAccount 
} from '../types'

interface FeeStructureDrawerProps {
  isOpen: boolean
  onClose: () => void
  onSave: (formData: FeeStructureForm) => Promise<string | null> // Return fee structure ID
  initialData?: FeeStructureForm
  mode: 'create' | 'edit'
  availableGrades: Grade[]
}

// Keep the default data structures from the original component
const defaultTermStructure: TermFeeStructureForm = {
  term: '', // Will be populated from available terms
  academicYear: '',
  dueDate: '',
  latePaymentFee: '0',
  earlyPaymentDiscount: '0',
  earlyPaymentDeadline: '',
  // Start with NO buckets so the UI always uses live feeBuckets from useFeeBuckets
  buckets: []
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

// Generate fee templates dynamically from feeBuckets instead of hardcoding
const generateFeeTemplates = (feeBuckets: any[]) => {
  // Create a mapping of buckets by category
  const templates: {[key: string]: any[]} = {
    academic: [],
    boarding: [],
    transport: [],
    activities: []
  };
  
  // Map each bucket to a category based on its name
  feeBuckets.forEach(bucket => {
    const name = bucket.name;
    const defaultAmount = '0';
    const description = bucket.description || `${name} related fees`;
    const icon = FileText; // Default icon
    
    // Categorize based on name
    if (name.toLowerCase().includes('tuition') || 
        name.toLowerCase().includes('exam') ||
        name.toLowerCase().includes('library')) {
      templates.academic.push({ name, amount: defaultAmount, icon, description, fromBucket: bucket });
    } 
    else if (name.toLowerCase().includes('board') || 
             name.toLowerCase().includes('meal') || 
             name.toLowerCase().includes('accommodation')) {
      templates.boarding.push({ name, amount: defaultAmount, icon, description, fromBucket: bucket });
    }
    else if (name.toLowerCase().includes('transport') || 
             name.toLowerCase().includes('bus')) {
      templates.transport.push({ name, amount: defaultAmount, icon, description, fromBucket: bucket });
    }
    else if (name.toLowerCase().includes('sport') || 
             name.toLowerCase().includes('music') || 
             name.toLowerCase().includes('activity')) {
      templates.activities.push({ name, amount: defaultAmount, icon, description, fromBucket: bucket });
    }
    // Default to academic for any other buckets
    else {
      templates.academic.push({ name, amount: defaultAmount, icon, description, fromBucket: bucket });
    }
  });
  
  return templates;
}

export const FeeStructureDrawer: React.FC<FeeStructureDrawerProps> = ({
  isOpen,
  onClose,
  onSave,
  initialData,
  mode,
  availableGrades
}) => {
  
  const params = useParams()
  const subdomain = params.subdomain as string
  const { data: schoolConfig } = useSchoolConfig()
  const { feeBuckets, loading: bucketsLoading, error: bucketsError, refetch: refetchBuckets } = useFeeBuckets()
  // Generate dynamic templates from actual fee buckets
  const feeTemplates = React.useMemo(() => generateFeeTemplates(feeBuckets), [feeBuckets])
  const { academicYears, loading: academicYearsLoading, error: academicYearsError, refetch: refetchAcademicYears, getActiveAcademicYear, getTermsForAcademicYear } = useAcademicYears()
  
  // Use the hook to fetch grade levels
  const { gradeLevels, isLoading: isLoadingGradeLevels, error: gradeLevelsError } = useGradeLevels()
  
  // Use the GraphQL hook for fee structures operations
  const { createFeeStructureWithItems, isCreatingWithItems: isCreatingFeeStructure, createWithItemsError: createError } = useGraphQLFeeStructures()
  
  // Get school name from config or format subdomain as fallback
  const getSchoolName = () => {
    if (schoolConfig?.tenant?.schoolName) {
      return schoolConfig.tenant.schoolName.toUpperCase()
    }
    if (subdomain) {
      return subdomain.charAt(0).toUpperCase() + subdomain.slice(1).replace(/[-_]/g, ' ') + ' SCHOOL'
    }
    return 'SCHOOL NAME'
  }

  const [formData, setFormData] = useState<FeeStructureForm>({
    name: '',
    grade: '',
    boardingType: 'both',
    academicYear: '',
    termStructures: [defaultTermStructure],
    // Include feeBuckets for use by QuickActions component
    feeBuckets: feeBuckets,
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

  const [selectedGrades, setSelectedGrades] = useState<string[]>([])
  // Step wizard state for guided fee structure creation
  const [currentStep, setCurrentStep] = useState<number>(1)
  const totalSteps = 5
  
  // Steps definition
  const steps = [
    { id: 1, title: 'Basic Info', description: 'Name, academic year & type', icon: FileText },
    { id: 2, title: 'Grade Selection', description: 'Select grades/levels', icon: FileText },
    { id: 3, title: 'Terms Setup', description: 'Configure terms & due dates', icon: FileText },
    { id: 4, title: 'Fee Components', description: 'Add fee buckets & items', icon: FileText },
    { id: 5, title: 'Review', description: 'Preview & finalize', icon: FileText },
  ]
  
  const [activeTab, setActiveTab] = useState<'form' | 'preview'>('form')
  const [activeGradeTab, setActiveGradeTab] = useState<'classes' | 'gradelevels'>('gradelevels')
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set())
  const [collapsedTerms, setCollapsedTerms] = useState<Set<number>>(new Set())
  
  // State for academic year/term creation modal
  const [showCreateAcademicYearModal, setShowCreateAcademicYearModal] = useState<boolean>(false)
  const [showQuickAdd, setShowQuickAdd] = useState(false)
  const [smartSuggestions, setSmartSuggestions] = useState<string[]>([])
  const [currentEditingField, setCurrentEditingField] = useState<string | null>(null)
  const [toasts, setToasts] = useState<Array<{id: string, message: string, type: 'success' | 'error' | 'info'}>>([])
  const [isCreatingBucket, setIsCreatingBucket] = useState(false)
  const [showExistingBuckets, setShowExistingBuckets] = useState(false)
  const [selectedExistingBuckets, setSelectedExistingBuckets] = useState<string[]>([])
  const [showTermSelectionModal, setShowTermSelectionModal] = useState(false)
  const [showBucketModal, setShowBucketModal] = useState(false)
  const [showEditBucketModal, setShowEditBucketModal] = useState(false)
  const [selectedTermId, setSelectedTermId] = useState<string>('')
  const [availableTerms, setAvailableTerms] = useState<{id: string; name: string}[]>([])
  const [editingBucket, setEditingBucket] = useState<any>(null)
  const [bucketModalData, setBucketModalData] = useState<{
    name: string;
    description: string;
    type?: string;
    isOptional?: boolean;
  }>({ name: '', description: '' })
  
  // Toast notification system
  const showToast = (message: string, type: 'success' | 'error' | 'info' = 'info') => {
    const id = Math.random().toString(36).substring(2, 9)
    setToasts(prev => [...prev, { id, message, type }])
    // Auto-remove toast after 3 seconds
    setTimeout(() => {
      setToasts(prev => prev.filter(toast => toast.id !== id))
    }, 3000)
  }
  
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
  
  // Check if current step is valid before proceeding
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

  // Validation: compute missing sections
  const validationErrors = useMemo(() => {
    const errors: { message: string; anchorId?: string }[] = []
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

  // Use a ref to track if we've already fetched academic years
  const academicYearsRef = useRef<boolean>(false);
  const fetchTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  
  // Debounced refetch to prevent multiple rapid calls
  const debouncedRefetch = () => {
    // Clear any existing timeout
    if (fetchTimeoutRef.current) {
      clearTimeout(fetchTimeoutRef.current);
    }
    
    // Set a new timeout
    fetchTimeoutRef.current = setTimeout(() => {
      refetchAcademicYears()
        .then(() => {
          console.log('Academic years fetched successfully')
        })
        .catch(err => {
          console.error('Failed to fetch academic years:', err)
          academicYearsRef.current = false; // Reset fetched flag to allow retry
        })
        .finally(() => {
          fetchTimeoutRef.current = null;
        });
    }, 500); // 500ms debounce
  };

  // Calculate term and component totals
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

  const calculateBucketTotal = (termIndex: number, bucketIndex: number) => {
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

  const addTermStructure = () => {
    // Find selected academic year - directly from the array, not using the function
    const selectedAcademicYear = academicYears.find(year => year.name === formData.academicYear);
    
    // Get all available terms for this academic year
    const availableTerms = selectedAcademicYear?.terms || [];
    
    // Find a term that isn't already being used
    let termName = '';
    if (availableTerms.length > 0) {
      const usedTermNames = new Set(formData.termStructures.map(ts => ts.term));
      
      const availableTerm = availableTerms.find(t => !usedTermNames.has(t.name));
      if (availableTerm) {
        termName = availableTerm.name;
      } else {
        // If all terms are used, just use the first one
        termName = availableTerms[0].name;
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
    
    // Show appropriate toast message
    if (termName) {
      showToast(`✅ Added new term structure with ${termName}`, 'success');
    } else {
      showToast(`✅ New term structure added. Please select a term.`, 'info');
    }
  }

  const removeTermStructure = (index: number) => {
    if (formData.termStructures.length > 1) {
      const termName = formData.termStructures[index].term
      setFormData(prev => ({
        ...prev,
        termStructures: prev.termStructures.filter((_, i) => i !== index)
      }))
      showToast(`🗑️ ${termName} removed successfully!`, 'info')
    }
  }

  const updateTermStructure = (index: number, field: keyof TermFeeStructureForm, value: any) => {
    setFormData(prev => {
      return {
        ...prev,
        termStructures: prev.termStructures.map((term, i) => 
          i === index ? { ...term, [field]: value } : term
        )
      };
    });
  }

  const addBucket = (termIndex: number) => {
    // First check if we have available fee buckets
    if (feeBuckets && feeBuckets.length > 0) {
      // Find a fee bucket that's not already used in this term
      const usedBucketIds = new Set(
        formData.termStructures[termIndex]?.buckets
          .filter(b => b.id)
          .map(b => b.id)
      );
      
      // Find an unused bucket
      const unusedBucket = feeBuckets.find(bucket => !usedBucketIds.has(bucket.id));
      
      if (unusedBucket) {
        // Use an existing bucket
        console.log(`Using existing fee bucket: ${unusedBucket.name} (${unusedBucket.id})`);
        addExistingBucket(termIndex, unusedBucket.id);
        return;
      }
    }
    
    // If no available buckets or all are used, create an empty one
    console.log('Creating empty bucket (will need to be connected to a fee bucket)');
    const newBucket = { 
      ...defaultBucket,
      name: '', // Empty name to ensure the BucketSelector shows all options
      description: '',
      components: [
        {
          ...defaultComponent,
          name: '' // Empty component name to match the bucket
        }
      ]
    }
    
    setFormData(prev => ({
      ...prev,
      termStructures: prev.termStructures.map((term, i) => 
        i === termIndex 
          ? { ...term, buckets: [...term.buckets, newBucket] }
          : term
      )
    }))
    
    // Show a warning that this bucket needs to be connected to a fee bucket
    showToast('⚠️ Please select an existing fee bucket or create a new one for this item', 'info');
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
    // Always create a fresh component with empty name to ensure bucket selector shows all options
    const newComponent = { 
      ...defaultComponent,
      // Always use empty name to force the BucketSelector to show all options
      name: ''
    };
    
    setFormData(prev => ({
      ...prev,
      termStructures: prev.termStructures.map((term, tIndex) => 
        tIndex === termIndex 
          ? {
              ...term,
              buckets: term.buckets.map((bucket, bIndex) => 
                bIndex === bucketIndex 
                  ? { 
                      ...bucket,
                      // If the bucket has no ID, make sure it doesn't filter out options
                      id: bucket.id || undefined,
                      components: [...bucket.components, newComponent] 
                    }
                  : bucket
              )
            }
          : term
      )
    }))
    showToast(`➕ New fee item added to ${formData.termStructures[termIndex].term}`, 'success')
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

  // GraphQL mutation for creating fee bucket
  const createFeeBucket = async (bucketData: { name: string; description: string }) => {
    setIsCreatingBucket(true)
    try {
      const response = await fetch('/api/graphql', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          query: `
            mutation CreateFeeBucket($input: CreateFeeBucketInput!) {
              createFeeBucket(input: $input) {
                id
                name
                description
                isActive
                createdAt
              }
            }
          `,
          variables: {
            input: bucketData
          }
        }),
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const result = await response.json()
      
      if (result.errors) {
        throw new Error(result.errors[0]?.message || 'Failed to create fee bucket')
      }

      showToast(`✅ Fee bucket "${bucketData.name}" created successfully!`, 'success')
      // Refresh buckets so it appears immediately in VOTE HEAD select options
      try {
        await refetchBuckets()
      } catch (_) {
        // Non-blocking; UI still has optimistic formData update
      }
      return result.data.createFeeBucket
    } catch (error) {
      console.error('Error creating fee bucket:', error)
      showToast(`❌ Failed to create fee bucket: ${error instanceof Error ? error.message : 'Unknown error'}`, 'error')
      throw error
    } finally {
      setIsCreatingBucket(false)
    }
  }

  // Add bucket with GraphQL creation
  const addBucketWithAPI = async (termIndex: number, bucketName: string, bucketDescription: string) => {
    try {
      // Create the bucket via GraphQL
      const createdBucket = await createFeeBucket({
        name: bucketName,
        description: bucketDescription
      })

      // Add the bucket to the form data
      const newBucket = {
        ...defaultBucket,
        name: createdBucket.name,
        description: createdBucket.description,
        id: createdBucket.id // Store the server-generated ID
      }

      setFormData(prev => ({
        ...prev,
        termStructures: prev.termStructures.map((term, i) => 
          i === termIndex 
            ? { ...term, buckets: [...term.buckets, newBucket] }
            : term
        )
      }))
    } catch (error) {
      // Error already handled in createFeeBucket function
      console.error('Failed to add bucket with API:', error)
    }
  }

  // Add existing bucket to fee structure
  const addExistingBucket = (termIndex: number, bucketId: string) => {
    const existingBucket = feeBuckets.find(bucket => bucket.id === bucketId)
    if (!existingBucket) {
      console.error(`Bucket with ID ${bucketId} not found in feeBuckets`);
      showToast(`❌ Failed to add bucket: Bucket not found`, 'error');
      return;
    }

    console.log(`Adding existing bucket: ${JSON.stringify(existingBucket, null, 2)}`);

    const newBucket: FeeBucketForm = {
      id: existingBucket.id, // Make sure we store the ID for the createFeeStructureWithItems mutation
      type: 'tuition', // Default type, can be changed later
      name: existingBucket.name,
      description: existingBucket.description,
      isOptional: false,
      components: [{
        name: existingBucket.name, // Use the bucket name as the component name
        description: existingBucket.description,
        amount: '0',
        category: 'academic'
      }]
    }

    setFormData(prev => {
      console.log(`Adding bucket ${existingBucket.name} with ID ${existingBucket.id} to term ${termIndex}`);
      return {
        ...prev,
        termStructures: prev.termStructures.map((term, i) => 
          i === termIndex 
            ? { ...term, buckets: [...term.buckets, newBucket] }
            : term
        )
      };
    });

    showToast(`✅ Added "${existingBucket.name}" bucket to ${formData.termStructures[termIndex].term}`, 'success')
  }

  // Add multiple existing buckets to all terms
  const addSelectedBucketsToAllTerms = () => {
    if (selectedExistingBuckets.length === 0) return

    selectedExistingBuckets.forEach(bucketId => {
      formData.termStructures.forEach((_, termIndex) => {
        addExistingBucket(termIndex, bucketId)
      })
    })

    setSelectedExistingBuckets([])
    setShowExistingBuckets(false)
    showToast(`✅ Added ${selectedExistingBuckets.length} bucket(s) to all terms`, 'success')
  }

  // Delete existing bucket via GraphQL
  const deleteFeeBucket = async (bucketId: string) => {
    try {
      const response = await fetch('/api/graphql', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          query: `
            mutation DeleteFeeBucket($id: ID!) {
              deleteFeeBucket(id: $id)
            }
          `,
          variables: {
            id: bucketId
          }
        }),
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const result = await response.json()
      
      if (result.errors) {
        throw new Error(result.errors[0]?.message || 'Failed to delete fee bucket')
      }

      showToast(`✅ Fee bucket deleted successfully!`, 'success')
      refetchBuckets() // Refresh the buckets list
    } catch (error) {
      console.error('Error deleting fee bucket:', error)
      showToast(`❌ Failed to delete fee bucket: ${error instanceof Error ? error.message : 'Unknown error'}`, 'error')
    }
  }

  // Delete bucket from form data (for buckets without server ID)
  const deleteFormBucket = (termIndex: number, bucketIndex: number) => {
    const bucket = formData.termStructures[termIndex]?.buckets[bucketIndex]
    if (!bucket) return

    setFormData(prev => ({
      ...prev,
      termStructures: prev.termStructures.map((term, i) => 
        i === termIndex 
          ? { ...term, buckets: term.buckets.filter((_, j) => j !== bucketIndex) }
          : term
      )
    }))

    showToast(`🗑️ Bucket "${bucket.name}" removed from fee structure`, 'info')
  }

  // Update existing bucket via GraphQL
  const updateFeeBucket = async (bucketId: string, bucketData: { name: string; description: string; isActive?: boolean }) => {
    try {
      const response = await fetch('/api/graphql', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          query: `
            mutation UpdateFeeBucket($id: ID!, $input: UpdateFeeBucketInput!) {
              updateFeeBucket(id: $id, input: $input) {
                id
                name
                description
                isActive
              }
            }
          `,
          variables: {
            id: bucketId,
            input: bucketData
          }
        }),
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const result = await response.json()
      
      if (result.errors) {
        throw new Error(result.errors[0]?.message || 'Failed to update fee bucket')
      }

      showToast(`✅ Fee bucket updated successfully!`, 'success')
      refetchBuckets() // Refresh the buckets list
      return result.data.updateFeeBucket
    } catch (error) {
      console.error('Error updating fee bucket:', error)
      showToast(`❌ Failed to update fee bucket: ${error instanceof Error ? error.message : 'Unknown error'}`, 'error')
      throw error
    }
  }


  // Handle save fee structure
  const handleSave = async () => {
    try {
      // Find selected academic year and term
      const selectedAcademicYear = academicYears.find(year => year.name === formData.academicYear);
      if (!selectedAcademicYear) {
        throw new Error('Selected academic year not found');
      }

      // Collect all term IDs from all term structures
      const allTermIds = formData.termStructures.map(termStructure => {
        // Find the term ID for the term name in this structure
        const termName = termStructure.term;
        const term = selectedAcademicYear.terms?.find(t => t.name === termName);
        if (!term) {
          console.warn(`Term '${termName}' not found in academic year ${selectedAcademicYear.name}`);
          return null;
        }
        return term.id;
      }).filter(id => id !== null) as string[];

      if (allTermIds.length === 0) {
        throw new Error('No valid terms found in the fee structure');
      }

      // Check that we have existing fee buckets to work with
      if (!feeBuckets || feeBuckets.length === 0) {
        throw new Error('No fee buckets are available. Please create fee buckets first.');
      }
      
      console.log('Available fee buckets to use:', JSON.stringify(feeBuckets.map(b => ({ id: b.id, name: b.name })), null, 2));
      
      // Log the term structures we're working with
      console.log('Processing term structures:', formData.termStructures.map(t => t.term));
      
      // First, gather all unique fee buckets used across all term structures
      const feeBucketMap = new Map<string, {
        feeBucketId: string;
        amount: number;
        isMandatory: boolean;
        termIds: string[];
      }>();
      
      // Collect all used bucket IDs from the form data for easy reference
      const usedBucketIds = new Set<string>();
      formData.termStructures.forEach(term => {
        term.buckets.forEach(bucket => {
          if (bucket.id) usedBucketIds.add(bucket.id);
        });
      });
      
      console.log(`Found ${usedBucketIds.size} unique bucket IDs in form data: ${Array.from(usedBucketIds).join(', ')}`);
      
      // Validate that all used bucket IDs exist in available fee buckets
      usedBucketIds.forEach(id => {
        const bucketExists = feeBuckets.some(b => b.id === id);
        if (!bucketExists) {
          console.warn(`Warning: Bucket ID ${id} used in form doesn't exist in available fee buckets`);
        }
      });
      
      // Process all buckets across all term structures
      formData.termStructures.forEach((termStructure, tIndex) => {
        console.log(`Processing term structure ${tIndex + 1}: ${termStructure.term}`);
        
        // Process form buckets (with components)
        termStructure.buckets?.forEach((bucket, bIndex) => {
          // Skip buckets without ID
          if (!bucket.id) {
            console.warn(`Skipping bucket '${bucket.name}' with no ID in term ${termStructure.term}`);
            return;
          }
          
          // Find the corresponding fee bucket from our available buckets
          const feeBucket = feeBuckets.find(fb => fb.id === bucket.id);
          if (!feeBucket) {
            console.warn(`Bucket ID ${bucket.id} not found in available fee buckets, skipping`);
            return;
          }
          
          console.log(`Using existing bucket: ${feeBucket.name} (ID: ${feeBucket.id})`);
          
          // Calculate total amount for this bucket's components
          const totalAmount = bucket.components.reduce((sum, component) => {
            const amount = parseFloat(component.amount) || 0;
            return sum + amount;
          }, 0);
          
          console.log(`Total amount for ${feeBucket.name}: ${totalAmount}`);
          
          // If this bucket already exists in our map, use the highest amount
          if (feeBucketMap.has(bucket.id)) {
            const existing = feeBucketMap.get(bucket.id)!;
            if (totalAmount > existing.amount) {
              console.log(`Updating amount for ${feeBucket.name} from ${existing.amount} to ${totalAmount}`);
              existing.amount = totalAmount;
            }
            // If any occurrence is mandatory, make it mandatory
            if (!bucket.isOptional) {
              existing.isMandatory = true;
            }
          } else {
            // Add new bucket to the map
            feeBucketMap.set(bucket.id, {
              feeBucketId: bucket.id,
              amount: totalAmount,
              isMandatory: !bucket.isOptional,
              termIds: allTermIds // All terms for this item
            });
            console.log(`Added ${feeBucket.name} with amount ${totalAmount} to fee items`);
          }
        });
        
        // Process existing bucket amounts (new approach)
        if (termStructure.existingBucketAmounts) {
          Object.entries(termStructure.existingBucketAmounts).forEach(([bucketId, amountStr]) => {
            const amount = parseFloat(amountStr as string) || 0;
            
            // Skip zero amounts
            if (amount <= 0) return;
            
            // Find the corresponding fee bucket
            const feeBucket = feeBuckets.find(fb => fb.id === bucketId);
            if (!feeBucket) {
              console.warn(`Bucket ID ${bucketId} not found in available fee buckets, skipping`);
              return;
            }
            
            console.log(`Processing existing bucket amount: ${feeBucket.name} = ${amount}`);
            
            // If this bucket already exists in our map, use the highest amount
            if (feeBucketMap.has(bucketId)) {
              const existing = feeBucketMap.get(bucketId)!;
              if (amount > existing.amount) {
                console.log(`Updating amount for ${feeBucket.name} from ${existing.amount} to ${amount}`);
                existing.amount = amount;
              }
            } else {
              // Add new bucket to the map
              feeBucketMap.set(bucketId, {
                feeBucketId: bucketId,
                amount: amount,
                isMandatory: true, // Existing buckets are mandatory by default
                termIds: allTermIds // All terms for this item
              });
              console.log(`Added existing bucket ${feeBucket.name} with amount ${amount} to fee items`);
            }
          });
        }
      });
      
      // Convert the map to array of fee items
      const feeItems = Array.from(feeBucketMap.values());
      
      // Ensure we have fee items
      if (feeItems.length === 0) {
        throw new Error('No valid fee buckets found. Please add existing fee buckets with amounts.');
      }
      
      // Log final fee items with their corresponding bucket names for clarity
      const feeItemsWithNames = feeItems.map(item => {
        const bucket = feeBuckets.find(b => b.id === item.feeBucketId);
        return {
          ...item,
          bucketName: bucket?.name || 'Unknown'
        };
      });
      
      console.log('Final fee items to be sent:', JSON.stringify(feeItemsWithNames, null, 2));

      // Create a single fee structure for all selected grades with all term IDs and items
      const createdFeeStructure = await createFeeStructureWithItems({
        name: formData.name,
        academicYearId: selectedAcademicYear.id,
        gradeLevelIds: selectedGrades,
        items: feeItems
      });
      
      if (!createdFeeStructure) {
        throw new Error('Failed to create fee structure. Please try again.');
      }
      
      // Return ID to parent component if needed
      if (onSave && typeof onSave === 'function') {
        await onSave({
          ...formData,
          grade: selectedGrades.length === 1 ? selectedGrades[0] : '',
          name: formData.name
        });
      }
      
      console.log('Fee structure created successfully:', createdFeeStructure);
      onClose();
      showToast(`✅ Fee structure "${createdFeeStructure.name}" created successfully!`, 'success');
    } catch (error) {
      console.error('Error saving fee structure:', error);

      // Create a simplified GraphQL error response format 
      const errorResponse = {
        errors: [
          {
            message: "Fee structure already exists for this combination",
            locations: [{ line: 3, column: 11 }],
            path: ["createFeeStructureWithItems"],
            extensions: { code: "CONFLICTEXCEPTION" }
          }
        ],
        data: null
      };

      // If we have an actual error message, use that
      if (error instanceof Error) {
        errorResponse.errors[0].message = error.message;
        
        // Try to extract GraphQL error details if they exist
        const enhancedError = error as any;
        if (enhancedError.rawGraphQLErrors) {
          errorResponse.errors = enhancedError.rawGraphQLErrors;
        } else if (enhancedError.rawGraphQLResponse?.errors) {
          errorResponse.errors = enhancedError.rawGraphQLResponse.errors;
        }
      }
      
      // Extract just the error message for the toast
      const errorMessage = errorResponse.errors[0]?.message || 'Unknown error';
      
      // Show the error message
      showToast(errorMessage, 'error');
      
      // Log the complete error for debugging
      console.log('Complete error details:', error);
    }
  }

  // Function to handle fee item creation from modal
  const completeFeeItemCreation = () => {
    if (!selectedTermId || availableTerms.length === 0) return;
    
    // Logic to create fee item with selected term
    showToast(`✅ Fee item created for term ${availableTerms.find(t => t.id === selectedTermId)?.name || selectedTermId}`, 'success');
    setShowTermSelectionModal(false);
    setSelectedTermId('');
  }
  
  // Effect to update formData.feeBuckets when buckets are loaded from the API
  useEffect(() => {
    if (!bucketsLoading && feeBuckets?.length > 0) {
      // Log available fee buckets for reference
      console.log('Available fee buckets loaded:', feeBuckets.map(bucket => ({
        id: bucket.id,
        name: bucket.name,
        description: bucket.description
      })));
      
      setFormData(prev => ({
        ...prev,
        feeBuckets: feeBuckets
      }));
    }
  }, [feeBuckets, bucketsLoading])

  // Effect for initializing form data from props or default values
  useEffect(() => {
    if (initialData) {
      setFormData(initialData)
      setSelectedGrades([initialData.grade])
    } else {
      const currentYear = new Date().getFullYear().toString();
      // Try to get terms from the active academic year
      const activeYear = academicYears.find(year => year.isActive) || academicYears[0];
      
      let initialTerms = [];
      if (activeYear && activeYear.terms && activeYear.terms.length > 0) {
        // Get the first term for initial setup
        const initialTerm = activeYear.terms[0].name;
        
        // Create initial buckets from existing fee buckets if available
        let initialBuckets: FeeBucketForm[] = [];
        if (feeBuckets && feeBuckets.length > 0) {
          // Take the first 2 fee buckets as initial items (similar to the example)
          const bucketsToUse = feeBuckets.slice(0, 2);
          
          initialBuckets = bucketsToUse.map(bucket => {
            console.log(`Setting up initial fee bucket: ${bucket.name} (${bucket.id})`);
            return {
              id: bucket.id,
              type: 'tuition',
              name: bucket.name,
              description: bucket.description || '',
              isOptional: bucket.name.toLowerCase().includes('transport') || bucket.name.toLowerCase().includes('optional'),
              components: [{
                name: bucket.name,
                description: bucket.description || '',
                amount: '0',
                category: 'academic'
              }]
            } as FeeBucketForm;
          });
        }
        
        // Create a term structure with this term and initial buckets
        initialTerms = [{
          ...defaultTermStructure,
          term: initialTerm,
          academicYear: activeYear.name,
          buckets: initialBuckets
        }];
        
        console.log('Setting up initial term structure with buckets:', initialBuckets);
      } else {
        initialTerms = [{
          ...defaultTermStructure,
          academicYear: activeYear?.name || currentYear
        }];
      }

      setFormData({
        name: '',
        grade: '',
        boardingType: 'both',
        academicYear: activeYear?.name || currentYear,
        termStructures: initialTerms,
        feeBuckets: feeBuckets, // Store available fee buckets in the form data
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
  }, [initialData, isOpen, schoolConfig, subdomain, academicYears, feeBuckets])

  // Effect to fetch academic years when drawer opens
  useEffect(() => {
    // Only fetch academic years once when drawer opens and if we don't have any years yet
    if (isOpen && !academicYearsRef.current && (academicYears.length === 0 || academicYearsError)) {
      academicYearsRef.current = true; // Mark as fetched
      debouncedRefetch();
    }
    
    // Cleanup function to clear any pending timeouts
    return () => {
      if (fetchTimeoutRef.current) {
        clearTimeout(fetchTimeoutRef.current);
      }
    };
  }, [isOpen, academicYears.length, academicYearsError])

  // Update school name when config changes
  useEffect(() => {
    if (schoolConfig?.tenant?.schoolName) {
      setFormData(prev => ({
        ...prev,
        schoolDetails: {
          ...prev.schoolDetails!,
          name: schoolConfig.tenant.schoolName.toUpperCase()
        }
      }))
    }
  }, [schoolConfig])

  // Set active academic year when data loads
  useEffect(() => {    
    // Only run this effect if we have academic years data and no academic year set yet
    if (academicYears.length > 0 && formData.academicYear === '') {
      // Find an active academic year directly from the array instead of using the function
      const activeYear = academicYears.find(year => year.isActive) || academicYears[0]
      if (activeYear) {
        setFormData(prev => ({
          ...prev,
          academicYear: activeYear.name
        }))
      }
    }
  }, [academicYears, academicYearsLoading, academicYearsError, formData.academicYear])
  
  // If drawer is not open, don't render anything
  if (!isOpen) return null
  
  return (
    <div className="fixed inset-0 z-50 flex">
      {/* Term Selection Modal */}
      <TermSelectionModal 
        isOpen={showTermSelectionModal}
        onClose={() => setShowTermSelectionModal(false)}
        availableTerms={availableTerms}
        selectedTermId={selectedTermId}
        onTermSelect={setSelectedTermId}
        onComplete={completeFeeItemCreation}
      />
      
      {/* Backdrop */}
      <div className="flex-1 bg-black/20 backdrop-blur-sm" onClick={onClose} />
      
      {/* Drawer */}
      <div className="w-full md:w-[90%] lg:w-[900px] xl:w-[1000px] bg-white shadow-xl flex flex-col overflow-hidden">
        {/* Header */}
        <FeeStructureDrawerHeader 
          mode={mode} 
          onClose={onClose}
          academicYearsLoading={academicYearsLoading}
          academicYearsLength={academicYears.length}
        />
        
        {/* Step Wizard and Progress Indicators */}
        <div className="px-3 sm:px-6 py-4 sm:py-6 bg-gradient-to-r from-primary/5 to-primary/10 border-b border-primary/20">
          <StepWizardProgress 
            steps={steps}
            currentStep={currentStep}
            goToStep={goToStep}
          />
          
          {/* Validation checklist */}
          <ValidationChecklist 
            validationErrors={validationErrors}
            formData={formData}
            selectedGrades={selectedGrades}
          />
        </div>
        
        {/* Content */}
        <div className="flex-1 overflow-y-auto bg-slate-50">
          <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as 'form' | 'preview')} className="h-full flex flex-col">
            {/* Tabs Navigation */}
            <TabsNavigation 
              activeTab={activeTab}
              onChange={setActiveTab as any}
            />
            
            {/* Form Content */}
            <TabsContent value="form" className="flex-1 p-4 md:p-8 m-0">
              <div className="mx-auto max-w-4xl bg-white shadow-sm p-6 border border-slate-200">
                {/* Step content based on currentStep */}
                <FeeStructureStepContent
                  currentStep={currentStep}
                  formData={formData}
                  setFormData={setFormData}
                  academicYears={academicYears}
                  academicYearsLoading={academicYearsLoading}
                  setShowCreateAcademicYearModal={setShowCreateAcademicYearModal}
                  handleBoardingTypeChange={(value) => {
                    setFormData({
                      ...formData,
                      boardingType: value as 'day' | 'boarding' | 'both'
                    });
                  }}
                  selectedGrades={selectedGrades}
                  handleGradeToggle={handleGradeToggle}
                  availableGrades={availableGrades}
                  activeGradeTab={activeGradeTab}
                  setActiveGradeTab={setActiveGradeTab}
                  gradeLevels={gradeLevels}
                  isLoadingGradeLevels={isLoadingGradeLevels}
                  gradeLevelsError={gradeLevelsError}
                />
                
                {/* Quick fill toolbar only displayed for Step 4 (Fee Components) */}
                {currentStep === 4 && (
                  <div className="mb-6 bg-primary/5 border border-primary/20 p-3">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-xs text-slate-600 mr-2">Quick fill:</span>
                      <Button
                        variant="outline"
                        size="sm"
                        className="h-7 px-2 text-xs"
                        onClick={() => {
                          const input = window.prompt('Set ALL component amounts to (number):', '1000')
                          if (input == null) return
                          const value = Math.max(0, Math.round(Number(input)))
                          if (Number.isNaN(value)) return
                          setFormData(prev => ({
                            ...prev,
                            termStructures: prev.termStructures.map(term => ({
                              ...term,
                              buckets: term.buckets.map(bucket => ({
                                ...bucket,
                                components: bucket.components.map(c => ({
                                  ...c,
                                  amount: String(value)
                                }))
                              }))
                            }))
                          }))
                          showToast(`Applied amount ${value} to all components`, 'success')
                        }}
                      >
                        Set all amounts
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            </TabsContent>
            
            {/* Preview Content */}
            <TabsContent value="preview" className="flex-1 p-4 md:p-8 m-0">
              <div className="h-full overflow-y-auto bg-slate-100 p-6 shadow-inner relative">
                <div className="absolute top-3 right-3 bg-white/70 backdrop-blur-sm px-3 py-1.5 border border-slate-200 shadow-sm flex items-center gap-2">
                  <FileText className="h-4 w-4 text-primary" />
                  <span className="text-xs font-medium text-slate-700">Preview Mode</span>
                </div>
                <FeeStructurePDFPreview
                  formData={formData}
                  schoolName={formData.schoolDetails?.name}
                  schoolAddress={formData.schoolDetails?.address}
                  schoolContact={formData.schoolDetails?.contact}
                  schoolEmail={formData.schoolDetails?.email}
                  feeBuckets={feeBuckets}
                />
              </div>
            </TabsContent>
          </Tabs>
        </div>
        
        {/* Modals */}
        <BucketCreationModal 
          isOpen={showBucketModal}
          onClose={() => setShowBucketModal(false)}
          bucketData={bucketModalData}
          isCreating={isCreatingBucket}
          onChange={setBucketModalData}
          onCreateBucket={async () => {
            if (bucketModalData.name.trim() && bucketModalData.description.trim()) {
              await addBucketWithAPI(0, bucketModalData.name.trim(), bucketModalData.description.trim())
              setShowBucketModal(false)
              setBucketModalData({ name: '', description: '' })
            }
          }}
        />
        
        <BucketEditModal 
          isOpen={showEditBucketModal}
          onClose={() => {
            setShowEditBucketModal(false)
            setEditingBucket(null)
          }}
          editingBucket={editingBucket}
          onChange={setEditingBucket}
          onUpdateBucket={async () => {
            if (editingBucket?.name.trim() && editingBucket?.description.trim()) {
              await updateFeeBucket(editingBucket.id, {
                name: editingBucket.name.trim(),
                description: editingBucket.description.trim(),
                isActive: editingBucket.isActive
              })
              setShowEditBucketModal(false)
              setEditingBucket(null)
            }
          }}
        />
        
        {/* Toast Notifications */}
        <ToastNotifications 
          toasts={toasts}
          onDismiss={(id) => setToasts(prev => prev.filter(toast => toast.id !== id))}
        />
        
        {/* Footer with step navigation */}
        <DrawerFooter 
          currentStep={currentStep}
          totalSteps={totalSteps}
          isCurrentStepValid={isCurrentStepValid()}
          validationErrors={validationErrors}
          selectedGrades={selectedGrades}
          goToPrevStep={goToPrevStep}
          goToNextStep={goToNextStep}
          onClose={onClose}
          onSave={handleSave}
          steps={steps}
          isLoading={isCreatingFeeStructure}
          error={createError}
        />
      </div>
      
      {/* Create Academic Year Modal */}
      <CreateAcademicYearModal
        isOpen={showCreateAcademicYearModal}
        onClose={() => setShowCreateAcademicYearModal(false)}
        onSuccess={(newAcademicYear) => {
          // Refresh the academic years list
          refetchAcademicYears()
            .then(() => {
              // Update the current form with the newly created academic year
              setFormData(prev => ({
                ...prev,
                academicYear: newAcademicYear.name
              }))
              
              showToast(`Academic year ${newAcademicYear.name} created successfully with ${newAcademicYear.terms.length} terms`, 'success')
            })
            .catch(error => {
              console.error('Failed to refresh academic years after creation:', error)
              showToast('Academic year created but failed to refresh the list', 'error')
            })
        }}
      />
    </div>
  )
}
