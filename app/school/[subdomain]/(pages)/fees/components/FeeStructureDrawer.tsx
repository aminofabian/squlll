'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import { X, Plus, Copy, Trash2, Save, Eye, Edit3, GraduationCap, Wand2, Calculator, Clock, ChevronDown, ChevronRight, Sparkles, Zap, BookOpen, Bus, Home, Utensils, FlaskConical, Trophy, Library, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { useSchoolConfig } from '@/lib/hooks/useSchoolConfig'
import { useFeeBuckets } from '@/lib/hooks/useFeeBuckets'
import { useAcademicYears } from '@/lib/hooks/useAcademicYears'
import { FeeStructure, FeeStructureForm, Grade, TermFeeStructureForm, FeeBucketForm, FeeComponentForm, BankAccount } from '../types'
import { FeeStructurePDFPreview } from './FeeStructurePDFPreview'

interface FeeStructureDrawerProps {
  isOpen: boolean
  onClose: () => void
  onSave: (formData: FeeStructureForm) => Promise<string | null> // Return fee structure ID
  initialData?: FeeStructureForm
  mode: 'create' | 'edit'
  availableGrades: Grade[]
}

const defaultTermStructure: TermFeeStructureForm = {
  term: 'Term 1',
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

export const FeeStructureDrawer = ({
  isOpen,
  onClose,
  onSave,
  initialData,
  mode,
  availableGrades
}: FeeStructureDrawerProps) => {
  const params = useParams()
  const subdomain = params.subdomain as string
  const { data: schoolConfig } = useSchoolConfig()
  const { feeBuckets, loading: bucketsLoading, error: bucketsError, refetch: refetchBuckets } = useFeeBuckets()
  const { academicYears, loading: academicYearsLoading, error: academicYearsError, refetch: refetchAcademicYears, getActiveAcademicYear, getTermsForAcademicYear } = useAcademicYears()
  
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
  const [activeTab, setActiveTab] = useState<'form' | 'preview'>('form')
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set())
  const [collapsedTerms, setCollapsedTerms] = useState<Set<number>>(new Set())
  const [showQuickAdd, setShowQuickAdd] = useState(false)
  const [smartSuggestions, setSmartSuggestions] = useState<string[]>([])
  const [currentEditingField, setCurrentEditingField] = useState<string | null>(null)
  const [toasts, setToasts] = useState<Array<{id: string, message: string, type: 'success' | 'error' | 'info'}>>([])
  const [isCreatingBucket, setIsCreatingBucket] = useState(false)
  const [showBucketModal, setShowBucketModal] = useState(false)
  const [bucketModalData, setBucketModalData] = useState({ name: '', description: '' })
  const [showExistingBuckets, setShowExistingBuckets] = useState(false)
  const [selectedExistingBuckets, setSelectedExistingBuckets] = useState<string[]>([])
  const [editingBucket, setEditingBucket] = useState<{id: string, name: string, description: string, isActive: boolean} | null>(null)
  const [showEditBucketModal, setShowEditBucketModal] = useState(false)

  const showToast = (message: string, type: 'success' | 'error' | 'info' = 'success') => {
    const id = Math.random().toString(36).substr(2, 9)
    setToasts(prev => [...prev, { id, message, type }])
    setTimeout(() => {
      setToasts(prev => prev.filter(toast => toast.id !== id))
    }, 3000)
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

  // Smart fee templates
  const feeTemplates = {
    academic: [
      { name: 'Tuition Fee', amount: '15000', icon: BookOpen, description: 'Regular tuition fees for academic instruction' },
      { name: 'Examination Fee', amount: '2000', icon: FlaskConical, description: 'Costs for tests, exams and assessments' },
      { name: 'Library Fee', amount: '500', icon: Library, description: 'Library access, maintenance and materials' },
      { name: 'Computer Lab Fee', amount: '1000', icon: Calculator, description: 'ICT/computer lab access and maintenance' }
    ],
    boarding: [
      { name: 'Boarding Fee', amount: '8000', icon: Home, description: 'Boarding accommodation and related services' },
      { name: 'Meals Fee', amount: '6000', icon: Utensils, description: 'Meal plans and catering services' },
      { name: 'Laundry Fee', amount: '1000', icon: Sparkles, description: 'Laundry services for boarders' }
    ],
    transport: [
      { name: 'Transport Fee', amount: '3000', icon: Bus, description: 'School transport/bus services' }
    ],
    activities: [
      { name: 'Sports Fee', amount: '800', icon: Trophy, description: 'Sports activities and equipment' },
      { name: 'Music Fee', amount: '600', icon: Zap, description: 'Music lessons and activities' }
    ]
  }

  useEffect(() => {
    if (initialData) {
      setFormData(initialData)
      setSelectedGrades([initialData.grade])
    } else {
      setFormData({
        name: '',
        grade: '',
        boardingType: 'both',
        academicYear: new Date().getFullYear().toString(),
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
      setSelectedGrades([])
    }
  }, [initialData, isOpen, schoolConfig, subdomain])

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
    console.log('Academic years data:', academicYears)
    console.log('Academic years loading:', academicYearsLoading)
    console.log('Academic years error:', academicYearsError)
    console.log('Current form academic year:', formData.academicYear)
    
    if (academicYears.length > 0 && !formData.academicYear) {
      const activeYear = getActiveAcademicYear()
      console.log('Active academic year:', activeYear)
      if (activeYear) {
        console.log('Setting academic year to:', activeYear.name)
        setFormData(prev => ({
          ...prev,
          academicYear: activeYear.name
        }))
      }
    }
  }, [academicYears, formData.academicYear, getActiveAcademicYear, academicYearsLoading, academicYearsError])

  const handleGradeToggle = (gradeId: string) => {
    setSelectedGrades(prev => 
      prev.includes(gradeId) 
        ? prev.filter(id => id !== gradeId)
        : [...prev, gradeId]
    )
  }

  const addTermStructure = () => {
    const newTermNumber = formData.termStructures.length + 1
    setFormData(prev => ({
      ...prev,
      termStructures: [...prev.termStructures, { ...defaultTermStructure, term: `Term ${newTermNumber}` }]
    }))
    showToast(`✅ Term ${newTermNumber} added successfully!`, 'success')
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
    setFormData(prev => ({
      ...prev,
      termStructures: prev.termStructures.map((term, i) => 
        i === index ? { ...term, [field]: value } : term
      )
    }))
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
    if (!existingBucket) return

    const newBucket: FeeBucketForm = {
      id: existingBucket.id,
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

    setFormData(prev => ({
      ...prev,
      termStructures: prev.termStructures.map((term, i) => 
        i === termIndex 
          ? { ...term, buckets: [...term.buckets, newBucket] }
          : term
      )
    }))

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

  // Create fee structure item in database
  const createFeeStructureItem = async (feeStructureId: string, feeBucketId: string, amount: number, isMandatory: boolean) => {
    // Validate inputs
    if (!feeStructureId || !feeBucketId || amount <= 0) {
      throw new Error(`Invalid input: feeStructureId=${feeStructureId}, feeBucketId=${feeBucketId}, amount=${amount}`)
    }

    try {
      console.log('🚀 Creating fee structure item with:', {
        feeStructureId,
        feeBucketId,
        amount,
        isMandatory
      })

      const response = await fetch('/api/graphql', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          query: `
            mutation CreateFeeStructureItem($input: CreateFeeStructureItemInput!) {
              createFeeStructureItem(input: $input) {
                id
                feeBucket {
                  id
                  name
                  description
                }
                feeStructure {
                  id
                  name
                  academicYear {
                    name
                  }
                  term {
                    name
                  }
                  tenantGradeLevel {
                    gradeLevel {
                      name
                    }
                  }
                }
                amount
                isMandatory
              }
            }
          `,
          variables: {
            input: {
              feeStructureId,
              feeBucketId,
              amount,
              isMandatory
            }
          }
        }),
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const result = await response.json()
      
      if (result.errors) {
        console.error('GraphQL errors:', result.errors)
        throw new Error(result.errors[0]?.message || 'Failed to create fee structure item')
      }

      console.log('✅ Fee structure item created successfully:', result.data.createFeeStructureItem)
      return result.data.createFeeStructureItem
    } catch (error) {
      console.error('Error creating fee structure item:', error)
      throw error
    }
  }

  // Create fee structure (GraphQL) and return ID
  const createFeeStructureGraphQL = async (name: string, academicYearNameOrId: string, termNameOrId: string) => {
    try {
      // Ensure we have academic years loaded
      let years = academicYears
      if (!years || years.length === 0) {
        await refetchAcademicYears()
        years = academicYears
      }

      // Resolve Academic Year by id or name (case-insensitive), fallback to active year
      const normalize = (s: string) => (s || '').trim().toLowerCase()
      let year: typeof academicYears[number] | undefined = years.find(y => y.id === academicYearNameOrId)
      if (!year) {
        year = years.find(y => normalize(y.name) === normalize(academicYearNameOrId))
      }
      if (!year) {
        year = years.find(y => normalize(y.name).includes(normalize(academicYearNameOrId)))
      }
      if (!year) {
        year = getActiveAcademicYear() || undefined
      }
      if (!year) {
        // Graceful fallback: let caller fallback to alternate save path
        showToast('⚠️ Could not resolve academic year, using fallback save method.', 'info')
        return null
      }

      // Resolve Term by id or name within the resolved year; fallback to first term
      let term: { id: string; name: string } | undefined = year.terms.find(t => t.id === termNameOrId)
      if (!term) {
        term = year.terms.find(t => normalize(t.name) === normalize(termNameOrId))
      }
      if (!term) {
        term = year.terms.find(t => normalize(t.name).includes(normalize(termNameOrId)))
      }
      if (!term && year.terms && year.terms.length > 0) {
        term = year.terms[0]
      }
      if (!term) {
        showToast('⚠️ Could not resolve term, using fallback save method.', 'info')
        return null
      }

      const response = await fetch('/api/graphql', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          query: `
            mutation CreateFeeStructure($input: CreateFeeStructureInput!) {
              createFeeStructure(input: $input) {
                id
                name
                academicYear { id name }
                term { id name }
              }
            }
          `,
          variables: {
            input: {
              name,
              academicYearId: year.id,
              termId: term.id
            }
          }
        })
      })
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`)
      const result = await response.json()
      if (result.errors) throw new Error(result.errors[0]?.message || 'Failed to create fee structure')
      const created = result.data.createFeeStructure
      showToast(`✅ Created fee structure "${created.name}" for ${created.term.name}`, 'success')
      return created.id as string
    } catch (error) {
      console.error('Error creating fee structure (GraphQL):', error)
      // Do not hard fail here; allow fallback to parent onSave
      showToast(`⚠️ Falling back to alternate save method.`, 'info')
      return null
    }
  }

  const handleSave = async () => {
    try {
      // Create separate fee structures for each selected grade
      for (const gradeId of selectedGrades) {
        const gradeData = {
          ...formData,
          grade: gradeId,
          name: selectedGrades.length > 1 
            ? `${formData.name} - ${availableGrades.find(g => g.id === gradeId)?.name || gradeId}`
            : formData.name
        }
        
        // Save the fee structure first via GraphQL and get the ID (use first term)
        const firstTermName = gradeData.termStructures[0]?.term || 'Term 1'
        let feeStructureId = await createFeeStructureGraphQL(gradeData.name, gradeData.academicYearId || gradeData.academicYear, firstTermName)
        if (!feeStructureId) {
          // Fallback to parent handler
          feeStructureId = await onSave(gradeData)
        }
        
        if (feeStructureId) {
          // Create fee structure items for each bucket component
          let itemsCreated = 0
          let itemsFailed = 0
          
          console.log('Creating fee structure items for feeStructureId:', feeStructureId)
          console.log('Form data termStructures:', formData.termStructures)
          
          for (const term of formData.termStructures) {
            // Only create items for the same term as the created fee structure
            if (term.term !== firstTermName) {
              console.log(`Skipping term ${term.term} (created structure term is ${firstTermName})`)
              continue
            }
            console.log(`Processing term: ${term.term}`)
            for (const bucket of term.buckets) {
              console.log(`Processing bucket: ${bucket.name} (ID: ${bucket.id})`)
              if (bucket.id) { // Only create items for buckets with server IDs
                for (const component of bucket.components) {
                  const amountNum = parseFloat(component.amount) || 0
                  console.log(`Processing component: ${component.name} (Amount: ${amountNum})`)
                  
                  if (amountNum > 0) { // Only create items with valid amounts
                    try {
                      console.log(`Creating fee structure item:`, {
                        feeStructureId,
                        feeBucketId: bucket.id,
                        amount: amountNum,
                        isMandatory: !bucket.isOptional
                      })
                      
                      const result = await createFeeStructureItem(
                        feeStructureId,
                        bucket.id,
                        amountNum,
                        !bucket.isOptional // isMandatory = !isOptional
                      )
                      
                      console.log('Fee structure item created successfully:', result)
                      itemsCreated++
                    } catch (error) {
                      console.error(`Failed to create fee structure item for ${component.name}:`, error)
                      itemsFailed++
                    }
                  } else {
                    console.log(`Skipping component ${component.name} - amount is 0 or invalid`)
                  }
                }
              } else {
                console.log(`Skipping bucket ${bucket.name} - no server ID`)
              }
            }
          }
          
          if (itemsCreated > 0) {
            showToast(`✅ Fee structure created with ${itemsCreated} fee items for ${availableGrades.find(g => g.id === gradeId)?.name || gradeId}${itemsFailed > 0 ? ` (${itemsFailed} failed)` : ''}`, 'success')
          } else {
            showToast(`⚠️ Fee structure created but no fee items were saved for ${availableGrades.find(g => g.id === gradeId)?.name || gradeId}`, 'info')
          }
        } else {
          showToast(`⚠️ Fee structure created but couldn't create fee items for ${availableGrades.find(g => g.id === gradeId)?.name || gradeId}`, 'info')
        }
      }
      
      onClose()
    } catch (error) {
      console.error('Error saving fee structure:', error)
      showToast(`❌ Failed to save fee structure: ${error instanceof Error ? error.message : 'Unknown error'}`, 'error')
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex">
      {/* Backdrop */}
      <div className="flex-1 bg-black/20" onClick={onClose} />
      
      {/* Drawer */}
      <div className="w-[900px] bg-white shadow-xl flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-primary/20 bg-primary/5">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary/10 rounded-lg border border-primary/20">
              <GraduationCap className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-900">
                {mode === 'create' ? 'Create Fee Structure' : 'Edit Fee Structure'}
              </h2>
              <p className="text-sm text-slate-600">
                Set up fees by term and assign to multiple grades
              </p>
            </div>
          </div>
          <Button variant="ghost" size="sm" onClick={onClose} className="hover:bg-primary/10">
            <X className="h-4 w-4" />
          </Button>
        </div>

        {/* Progress Steps */}
        <div className="px-6 py-4 bg-primary/5 border-b border-primary/20">
          <div className="flex items-center gap-4 text-sm">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 bg-primary text-white rounded-full flex items-center justify-center text-xs font-medium shadow-sm">1</div>
              <span className="text-slate-700 font-medium">Basic Info</span>
            </div>
            <div className="w-8 h-px bg-primary/30"></div>
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 bg-primary text-white rounded-full flex items-center justify-center text-xs font-medium shadow-sm">2</div>
              <span className="text-slate-700 font-medium">Select Grades</span>
            </div>
            <div className="w-8 h-px bg-primary/30"></div>
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 bg-primary text-white rounded-full flex items-center justify-center text-xs font-medium shadow-sm">3</div>
              <span className="text-slate-700 font-medium">Fee Structure</span>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto">
          <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as 'form' | 'preview')} className="h-full flex flex-col">
            <div className="px-6 pt-4 pb-2 border-b border-primary/20">
              <TabsList className="grid w-full grid-cols-2 bg-primary/5">
                <TabsTrigger value="form" className="flex items-center gap-2 data-[state=active]:bg-primary data-[state=active]:text-white">
                  <Edit3 className="h-4 w-4" />
                  Edit Structure
                </TabsTrigger>
                <TabsTrigger value="preview" className="flex items-center gap-2 data-[state=active]:bg-primary data-[state=active]:text-white">
                  <Eye className="h-4 w-4" />
                  PDF Preview
                </TabsTrigger>
              </TabsList>
            </div>

            <TabsContent value="form" className="flex-1 p-8 m-0">
              {/* Document-style editing interface */}
              <div className="bg-white max-w-4xl mx-auto shadow-lg" style={{ fontFamily: 'Times New Roman, serif' }}>
                
                {/* Header Section - Editable */}
                <div className="text-center mb-6 p-6 border-b">
                  <div className="flex items-center justify-center gap-4 mb-2">
                    <div className="w-16 h-16 bg-gray-200 rounded border flex items-center justify-center">
                      <span className="text-xs text-gray-500">LOGO</span>
                    </div>
                    <div>
                      <input
                        className="text-2xl font-bold underline bg-transparent border-0 text-center focus:bg-yellow-50 focus:outline-none focus:ring-1 focus:ring-blue-300 rounded px-2"
                        value={formData.schoolDetails?.name || ''}
                        onChange={(e) => setFormData(prev => ({
                          ...prev,
                          schoolDetails: { ...prev.schoolDetails!, name: e.target.value }
                        }))}
                        placeholder="SCHOOL NAME"
                      />
                      <br />
                      <input
                        className="text-sm bg-transparent border-0 text-center focus:bg-yellow-50 focus:outline-none focus:ring-1 focus:ring-blue-300 rounded px-2 mt-1"
                        value={formData.schoolDetails?.address || ''}
                        onChange={(e) => setFormData(prev => ({
                          ...prev,
                          schoolDetails: { ...prev.schoolDetails!, address: e.target.value }
                        }))}
                        placeholder="School Address"
                      />
                      <br />
                      <input
                        className="text-sm bg-transparent border-0 text-center focus:bg-yellow-50 focus:outline-none focus:ring-1 focus:ring-blue-300 rounded px-2 mt-1"
                        value={`E-mail: ${formData.schoolDetails?.email || ''}`}
                        onChange={(e) => setFormData(prev => ({
                          ...prev,
                          schoolDetails: { ...prev.schoolDetails!, email: e.target.value.replace('E-mail: ', '') }
                        }))}
                        placeholder="E-mail: school@email.com"
                      />
                    </div>
                  </div>
                </div>

                {/* Reference and Date */}
                <div className="mb-6 px-6">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="mb-1">Our Ref: ................................</p>
                      <p>Your Ref: ................................</p>
                    </div>
                    <div className="text-right">
                      <p>Date: {new Date().toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric' })}</p>
                    </div>
                  </div>
                </div>

                {/* Title */}
                <div className="text-center mb-6 px-6">
                  <h2 className="text-lg font-bold underline">
                    FEES STRUCTURE{' '}
                    <Select
                      value={formData.academicYear}
                      onValueChange={(value) => setFormData(prev => {
                        const year = academicYears.find(y => y.name === value)
                        return { ...prev, academicYear: value, academicYearId: year?.id }
                      })}
                    >
                      <SelectTrigger className="inline-flex w-32 h-8 bg-transparent border-0 focus:bg-yellow-50 focus:outline-none focus:ring-1 focus:ring-blue-300 rounded px-1 text-center">
                        <SelectValue placeholder="Select Year" />
                      </SelectTrigger>
                      <SelectContent>
                        {academicYearsLoading ? (
                          <SelectItem value="loading" disabled>
                            <div className="flex items-center gap-2">
                              <Loader2 className="h-4 w-4 animate-spin" />
                              <span>Loading academic years...</span>
                            </div>
                          </SelectItem>
                        ) : academicYearsError ? (
                          <SelectItem value="error" disabled>
                            <div className="flex items-center gap-2 text-red-600">
                              <span>Error loading academic years</span>
                            </div>
                          </SelectItem>
                        ) : academicYears.length === 0 ? (
                          <SelectItem value="empty" disabled>
                            <div className="flex items-center gap-2 text-gray-500">
                              <span>No academic years found</span>
                            </div>
                          </SelectItem>
                        ) : (
                          academicYears.map((year) => (
                            <SelectItem key={year.id} value={year.name}>
                              <div className="flex items-center gap-2">
                                <span>{year.name}</span>
                                {year.isActive && (
                                  <Badge variant="outline" className="text-xs bg-green-50 text-green-700 border-green-200">
                                    Active
                                  </Badge>
                                )}
                              </div>
                            </SelectItem>
                          ))
                        )}
                      </SelectContent>
                    </Select>
                  </h2>
                </div>

                {/* Smart Grade Selection with AI Suggestions */}
                <div className="mb-6 px-6">
                  <div className="bg-primary/5 p-4 rounded-lg border border-primary/20">
                    <div className="flex items-center gap-2 mb-3">
                      <Sparkles className="h-4 w-4 text-primary" />
                      <Label className="text-sm font-medium text-slate-700">Smart Grade Assignment</Label>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="ml-auto text-xs text-primary hover:bg-primary/10"
                        onClick={() => {
                          // Auto-select similar grades based on name pattern
                          const primaryGrades = availableGrades.filter(g => g.name.toLowerCase().includes('primary'))
                          const secondaryGrades = availableGrades.filter(g => g.name.toLowerCase().includes('secondary'))
                          if (primaryGrades.length > 0) {
                            setSelectedGrades(primaryGrades.map(g => g.id))
                          }
                        }}
                      >
                        <Wand2 className="h-3 w-3 mr-1" />
                        Auto-select
                      </Button>
                    </div>
                    <div className="grid grid-cols-4 gap-2">
                      {availableGrades.map((grade) => (
                        <label 
                          key={grade.id} 
                          className={`flex items-center space-x-2 p-2 rounded-lg border cursor-pointer transition-all duration-200 hover:scale-105 ${
                            selectedGrades.includes(grade.id) 
                              ? 'bg-primary/10 border-primary/30 shadow-md' 
                              : 'bg-white border-primary/20 hover:bg-primary/5'
                          }`}
                        >
                          <Checkbox
                            checked={selectedGrades.includes(grade.id)}
                            onCheckedChange={() => handleGradeToggle(grade.id)}
                            className="w-4 h-4"
                          />
                          <div className="flex items-center gap-1">
                            <GraduationCap className="h-3 w-3 text-gray-500" />
                            <span className="text-xs font-medium text-slate-700">{grade.name}{grade.section}</span>
                          </div>
                        </label>
                      ))}
                    </div>
                    {selectedGrades.length > 0 && (
                      <div className="mt-3 p-2 bg-white rounded border border-primary/20">
                        <div className="text-xs text-primary mb-1">Selected ({selectedGrades.length} grades):</div>
                        <div className="flex flex-wrap gap-1">
                          {selectedGrades.map(gradeId => {
                            const grade = availableGrades.find(g => g.id === gradeId)
                            return (
                              <Badge key={gradeId} variant="default" className="bg-primary text-white text-xs">
                                {grade?.name}{grade?.section}
                                <X 
                                  className="h-3 w-3 ml-1 cursor-pointer hover:bg-primary/80 rounded-full" 
                                  onClick={(e) => {
                                    e.preventDefault()
                                    handleGradeToggle(gradeId)
                                  }}
                                />
                              </Badge>
                            )
                          })}
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Smart Fee Builder with Quick Templates */}
                <div className="mb-8 px-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-bold">Fee Structure Builder</h3>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        className="text-xs bg-primary text-white border-primary hover:bg-primary/80 shadow-md hover:shadow-lg transition-all duration-200 hover:scale-105"
                        onClick={addTermStructure}
                      >
                        <Plus className="h-3 w-3 mr-1" />
                        ➕ New Term
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="text-xs border-primary text-primary hover:bg-primary/10"
                        disabled={isCreatingBucket}
                        onClick={() => setShowBucketModal(true)}
                      >
                        <Plus className="h-3 w-3 mr-1" />
                        {isCreatingBucket ? 'Creating...' : '🪣 New Bucket'}
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="text-xs border-primary text-primary hover:bg-primary/10"
                        onClick={() => setShowQuickAdd(!showQuickAdd)}
                      >
                        <Wand2 className="h-3 w-3 mr-1" />
                        Quick Add
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="text-xs border-primary text-primary hover:bg-primary/10"
                        onClick={() => setShowExistingBuckets(!showExistingBuckets)}
                        disabled={bucketsLoading || feeBuckets.length === 0}
                      >
                        <GraduationCap className="h-3 w-3 mr-1" />
                        {bucketsLoading ? 'Loading...' : `Existing Buckets (${feeBuckets.length})`}
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="text-xs border-primary text-primary hover:bg-primary/10"
                        onClick={() => {
                          const total = calculateGrandTotal()
                          alert(`Total: KES ${total.toLocaleString()}`)
                        }}
                      >
                        <Calculator className="h-3 w-3 mr-1" />
                        Calculate
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="text-xs bg-red-500 text-white border-red-500 hover:bg-red-600 shadow-md hover:shadow-lg transition-all duration-200 hover:scale-105"
                        onClick={() => {
                          if (confirm('Are you sure you want to clear all fees? This action cannot be undone.')) {
                            setFormData(prev => ({
                              ...prev,
                              termStructures: [{
                                term: 'Term 1',
                                dueDate: '',
                                latePaymentFee: '0',
                                earlyPaymentDiscount: '0',
                                earlyPaymentDeadline: '',
                                buckets: [{
                                  type: 'tuition',
                                  name: 'Tuition Fees',
                                  description: 'Academic fees for the term',
                                  isOptional: false,
                                  components: [{
                                    name: '',
                                    description: '',
                                    amount: '0',
                                    category: 'academic'
                                  }]
                                }]
                              }]
                            }))
                            showToast('🗑️ All fees cleared! Starting fresh.', 'info')
                          }
                        }}
                      >
                        <Trash2 className="h-3 w-3 mr-1" />
                        🗑️ Clear All
                      </Button>
                    </div>
                  </div>

                  {/* Quick Add Templates */}
                  {showQuickAdd && (
                    <div className="mb-6 p-4 bg-primary/5 rounded-lg border border-primary/20">
                      <h4 className="text-sm font-medium text-slate-700 mb-3 flex items-center gap-2">
                        <Sparkles className="h-4 w-4 text-primary" />
                        Quick Add Common Fees
                      </h4>
                      <div className="grid grid-cols-2 gap-3">
                        {Object.entries(feeTemplates).map(([category, templates]) => {
                          // Filter out templates that already exist in fee buckets
                          const filteredTemplates = templates.filter(template => {
                            const bucketExists = feeBuckets.some(bucket => 
                              bucket.name.toLowerCase().includes(template.name.toLowerCase()) ||
                              template.name.toLowerCase().includes(bucket.name.toLowerCase())

                            )
                            return !bucketExists
                          })

                          // Don't show category if all templates are filtered out
                          if (filteredTemplates.length === 0) return null

                          return (
                            <div key={category} className="space-y-2">
                              <h5 className="text-xs font-medium text-slate-600 uppercase tracking-wide">
                                {category}
                              </h5>
                              <div className="space-y-1">
                                {filteredTemplates.map((template, index) => {
                                  const IconComponent = template.icon
                                  return (
                                    <Button
                                      key={index}
                                      variant="ghost"
                                      size="sm"
                                      className="w-full justify-start text-xs h-8 hover:bg-primary/5 hover:shadow-sm border-primary/10"
                                      disabled={isCreatingBucket}
                                      onClick={async () => {
                                        if (formData.termStructures[0]?.buckets[0]) {
                                          // For fee templates, create a new bucket using the actual fee name
                                          const bucketName = template.name
                                          const bucketDescription = template.description || `${template.name} related fees`
                                          
                                          // Check if bucket already exists
                                          const existingBucket = formData.termStructures[0].buckets.find(b => 
                                            b.name.toLowerCase() === bucketName.toLowerCase()
                                          )
                                          
                                          let targetBucketIndex = 0
                                          
                                          if (!existingBucket) {
                                            // Create new bucket via API
                                            await addBucketWithAPI(0, bucketName, bucketDescription)
                                            targetBucketIndex = formData.termStructures[0].buckets.length
                                          } else {
                                            targetBucketIndex = formData.termStructures[0].buckets.findIndex(b => b === existingBucket)
                                          }
                                          
                                          // Add component to the bucket
                                          addComponent(0, targetBucketIndex)
                                          
                                          // Update the newly added component
                                          setTimeout(() => {
                                            const componentIndex = formData.termStructures[0].buckets[targetBucketIndex].components.length - 1
                                            updateComponent(0, targetBucketIndex, componentIndex, 'name', template.name)
                                            updateComponent(0, targetBucketIndex, componentIndex, 'amount', template.amount)
                                            updateComponent(0, targetBucketIndex, componentIndex, 'category', category)
                                          }, 100)
                                          
                                          showToast(`✨ ${template.name} added from template!`, 'success')
                                        }
                                      }}
                                    >
                                      <IconComponent className="h-3 w-3 mr-2" />
                                      {template.name}
                                      <span className="ml-auto text-primary font-mono">
                                        {template.amount}
                                      </span>
                                    </Button>
                                  )
                                })}
                              </div>
                            </div>
                          )
                        })}
                      </div>
                      {Object.entries(feeTemplates).every(([_, templates]) => 
                        templates.every(template => 
                          feeBuckets.some(bucket => 
                            bucket.name.toLowerCase().includes(template.name.toLowerCase()) ||
                            template.name.toLowerCase().includes(bucket.name.toLowerCase())
                          )
                        )
                      ) && (
                        <div className="text-center py-4 text-sm text-slate-600">
                          <Sparkles className="h-4 w-4 mx-auto mb-2 text-slate-400" />
                          All common fees already exist in your buckets! 
                          <br />
                          <span className="text-xs">Check the "Existing Buckets" section above.</span>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Existing Fee Buckets */}
                  {showExistingBuckets && (
                    <div className="mb-6 p-4 bg-primary/5 rounded-lg border border-primary/20">
                      <div className="flex items-center justify-between mb-3">
                        <h4 className="text-sm font-medium text-slate-700 flex items-center gap-2">
                          <GraduationCap className="h-4 w-4 text-primary" />
                          Existing Fee Buckets
                        </h4>
                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            className="text-xs border-primary text-primary hover:bg-primary/10"
                            onClick={refetchBuckets}
                            disabled={bucketsLoading}
                          >
                            <Clock className="h-3 w-3 mr-1" />
                            {bucketsLoading ? 'Refreshing...' : 'Refresh'}
                          </Button>
                          {selectedExistingBuckets.length > 0 && (
                            <Button
                              variant="outline"
                              size="sm"
                              className="text-xs bg-primary text-white border-primary hover:bg-primary/80"
                              onClick={addSelectedBucketsToAllTerms}
                            >
                              <Plus className="h-3 w-3 mr-1" />
                              Add to All Terms ({selectedExistingBuckets.length})
                            </Button>
                          )}
                        </div>
                      </div>
                      
                      {bucketsError && (
                        <div className="mb-3 p-2 bg-red-50 border border-red-200 rounded text-xs text-red-700">
                          ❌ Error loading buckets: {bucketsError}
                        </div>
                      )}

                      {bucketsLoading ? (
                        <div className="text-center py-4 text-sm text-slate-600">
                          <Clock className="h-4 w-4 mx-auto mb-2 animate-spin" />
                          Loading existing buckets...
                        </div>
                      ) : feeBuckets.length === 0 ? (
                        <div className="text-center py-4 text-sm text-slate-600">
                          <GraduationCap className="h-4 w-4 mx-auto mb-2 text-slate-400" />
                          No existing buckets found. Create your first bucket above!
                        </div>
                      ) : (
                        <div className="space-y-2">
                          <div className="text-xs text-slate-600 mb-2">
                            Select buckets to add to your fee structure:
                          </div>
                          <div className="grid grid-cols-1 gap-2 max-h-48 overflow-y-auto">
                            {feeBuckets.map((bucket) => (
                              <div
                                key={bucket.id}
                                className={`flex items-center space-x-3 p-3 rounded-lg border cursor-pointer transition-all duration-200 hover:scale-[1.02] ${
                                  selectedExistingBuckets.includes(bucket.id)
                                    ? 'bg-primary/10 border-primary/30 shadow-md'
                                    : 'bg-white border-primary/20 hover:bg-primary/5'
                                }`}
                                onClick={() => {
                                  setSelectedExistingBuckets(prev =>
                                    prev.includes(bucket.id)
                                      ? prev.filter(id => id !== bucket.id)
                                      : [...prev, bucket.id]
                                  )
                                }}
                              >
                                <Checkbox
                                  checked={selectedExistingBuckets.includes(bucket.id)}
                                  className="w-4 h-4"
                                />
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-center gap-2">
                                    <h5 className="text-sm font-medium text-slate-700 truncate">
                                      {bucket.name}
                                    </h5>
                                    {bucket.isActive && (
                                      <Badge variant="outline" className="text-xs bg-green-50 text-green-700 border-green-200">
                                        Active
                                      </Badge>
                                    )}
                                  </div>
                                  <p className="text-xs text-slate-500 truncate">
                                    {bucket.description}
                                  </p>
                                  <p className="text-xs text-slate-400">
                                    Created: {new Date(bucket.createdAt).toLocaleDateString()}
                                  </p>
                                </div>
                                <div className="flex gap-1">
                                  {formData.termStructures.map((term, termIndex) => (
                                    <Button
                                      key={termIndex}
                                      variant="ghost"
                                      size="sm"
                                      className="h-6 w-6 p-0 text-xs hover:bg-primary/10"
                                      onClick={(e) => {
                                        e.stopPropagation()
                                        addExistingBucket(termIndex, bucket.id)
                                      }}
                                      title={`Add to ${term.term}`}
                                    >
                                      {term.term.split(' ')[1]}
                                    </Button>
                                  ))}
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    className="h-6 w-6 p-0 text-xs hover:bg-blue-50 text-blue-600"
                                    onClick={(e) => {
                                      e.stopPropagation()
                                      setEditingBucket({
                                        id: bucket.id,
                                        name: bucket.name,
                                        description: bucket.description,
                                        isActive: bucket.isActive
                                      })
                                      setShowEditBucketModal(true)
                                    }}
                                    title="Edit bucket"
                                  >
                                    <Edit3 className="h-3 w-3" />
                                  </Button>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    className="h-6 w-6 p-0 text-xs hover:bg-red-50 text-red-600"
                                    onClick={(e) => {
                                      e.stopPropagation()
                                      if (confirm(`Are you sure you want to delete "${bucket.name}"? This action cannot be undone.`)) {
                                        deleteFeeBucket(bucket.id)
                                      }
                                    }}
                                    title="Delete bucket"
                                  >
                                    <Trash2 className="h-3 w-3" />
                                  </Button>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  <table className="w-full border-collapse border border-black shadow-lg">
                    <thead>
                      <tr className="bg-primary/10">
                        <th className="border border-primary/30 p-3 text-left font-bold text-slate-700">TERM</th>
                        <th className="border border-primary/30 p-3 text-left font-bold text-slate-700">VOTE HEAD</th>
                        <th className="border border-primary/30 p-3 text-right font-bold text-slate-700">AMOUNT</th>
                        <th className="border border-primary/30 p-3 w-20 text-center font-bold text-slate-700">ACTIONS</th>
                      </tr>
                    </thead>
                    <tbody>
                      {formData.termStructures.map((term, termIndex) => {
                        const termComponents = term.buckets.flatMap(bucket => bucket.components)
                        return termComponents.map((component, componentIndex) => {
                          const bucketIndex = term.buckets.findIndex(bucket => 
                            bucket.components.some(comp => comp === component)
                          )
                          const actualComponentIndex = term.buckets[bucketIndex].components.findIndex(comp => comp === component)
                          
                          return (
                            <tr key={`${termIndex}-${bucketIndex}-${actualComponentIndex}`} className="hover:bg-primary/5 group transition-all duration-200">
                              <td className="border border-primary/30 p-3 text-center">
                                {componentIndex === 0 ? (
                                  <div className="flex items-center justify-center">
                                    <Badge 
                                      variant="outline" 
                                      className={`text-xs font-bold shadow-sm ${
                                        term.term === 'Term 1' ? 'bg-primary/10 text-primary border-primary/30' :
                                        term.term === 'Term 2' ? 'bg-primary/15 text-primary border-primary/30' :
                                        term.term === 'Term 3' ? 'bg-primary/20 text-primary border-primary/30' :
                                        'bg-primary/25 text-primary border-primary/30'
                                      }`}
                                    >
                                      <Clock className="h-3 w-3 mr-1" />
                                      {term.term.toUpperCase()}
                                    </Badge>
                                  </div>
                                ) : (
                                  <div className="h-8 flex items-center justify-center">
                                    <div className="w-px h-4 bg-primary/30"></div>
                                  </div>
                                )}
                              </td>
                              <td className="border border-primary/30 p-3">
                                <div className="relative">
                                  <div className="flex items-center gap-2">
                                    {(!formData.termStructures[termIndex].buckets[bucketIndex].id) && (
                                      <Button
                                        variant="ghost"
                                        size="sm"
                                        className="h-8 px-2 text-xs hover:bg-primary/10"
                                        onClick={() => {
                                          updateBucket(termIndex, bucketIndex, 'id', undefined as any)
                                          updateBucket(termIndex, bucketIndex, 'name', '')
                                          updateBucket(termIndex, bucketIndex, 'description', '')
                                          updateComponent(termIndex, bucketIndex, actualComponentIndex, 'name', '')
                                        }}
                                        title="Custom fee name"
                                      >
                                        ✏️ Custom
                                      </Button>
                                    )}
                                    <div className="flex flex-wrap gap-1">
                                      {(() => {
                                        const selectedId = formData.termStructures[termIndex].buckets[bucketIndex].id
                                        const seenNames = new Set<string>()
                                        const source = selectedId
                                          ? feeBuckets.filter(b => b.id === selectedId)
                                          : feeBuckets
                                              .filter(bucket => {
                                                const isAlreadyUsed = formData.termStructures.some(term =>
                                                  term.buckets.some(b => b.id === bucket.id)
                                                )
                                                const isCurrentBucket = formData.termStructures[termIndex].buckets[bucketIndex].id === bucket.id
                                                return !isAlreadyUsed || isCurrentBucket
                                              })
                                              .filter(bucket => {
                                                const key = (bucket.name || '').trim().toLowerCase()
                                                if (seenNames.has(key)) return false
                                                seenNames.add(key)
                                                return true
                                              })
                                        return source.map((bucket) => {
                                          const isCurrentBucket = formData.termStructures[termIndex].buckets[bucketIndex].id === bucket.id
                                          return (
                                            <Button
                                              key={bucket.id}
                                              variant={isCurrentBucket ? 'secondary' : 'outline'}
                                              size="sm"
                                              className={`h-8 px-2 text-xs ${isCurrentBucket ? 'bg-primary/10 text-primary border-primary/30' : ''}`}
                                              onClick={() => {
                                                updateBucket(termIndex, bucketIndex, 'id', bucket.id)
                                                updateBucket(termIndex, bucketIndex, 'name', bucket.name)
                                                updateBucket(termIndex, bucketIndex, 'description', bucket.description)
                                                updateComponent(termIndex, bucketIndex, actualComponentIndex, 'name', bucket.name)
                                              }}
                                              title={bucket.name}
                                            >
                                              {bucket.name}
                                              {!bucket.isActive && !isCurrentBucket && (
                                                <span className="ml-1 text-[10px] text-gray-500">(Inactive)</span>
                                              )}
                                            </Button>
                                          )
                                        })
                                      })()}
                                    </div>
                                  </div>
                                  {component.name && !feeBuckets.some(bucket => bucket.name === component.name) && (
                                    <div className="mt-1">
                                      <input
                                        className="w-full bg-transparent border-0 focus:bg-primary/5 focus:outline-none focus:ring-2 focus:ring-primary/30 rounded-lg px-2 py-1 transition-all duration-200 text-xs"
                                        value={component.name}
                                        onChange={(e) => updateComponent(termIndex, bucketIndex, actualComponentIndex, 'name', e.target.value)}
                                        placeholder="Enter custom fee name..."
                                      />
                                    </div>
                                  )}
                                  {currentEditingField === `${termIndex}-${bucketIndex}-${actualComponentIndex}-name` && (
                                    <div className="absolute top-full left-0 mt-1 text-xs text-primary bg-primary/5 px-2 py-1 rounded shadow-sm">
                                      💡 Choose from existing buckets or create custom
                                    </div>
                                  )}
                                </div>
                              </td>
                              <td className="border border-primary/30 p-3 text-right">
                                <div className="relative">
                                  <input
                                    type="number"
                                    className="w-full bg-transparent border-0 text-right focus:bg-primary/5 focus:outline-none focus:ring-2 focus:ring-primary/30 rounded-lg px-2 py-1 font-mono transition-all duration-200"
                                    value={component.amount}
                                    onChange={(e) => updateComponent(termIndex, bucketIndex, actualComponentIndex, 'amount', e.target.value)}
                                    onFocus={() => setCurrentEditingField(`${termIndex}-${bucketIndex}-${actualComponentIndex}-amount`)}
                                    onBlur={() => setCurrentEditingField(null)}
                                    placeholder="0.00"
                                  />
                                  {currentEditingField === `${termIndex}-${bucketIndex}-${actualComponentIndex}-amount` && (
                                    <div className="absolute top-full right-0 mt-1 text-xs text-primary bg-primary/5 px-2 py-1 rounded shadow-sm">
                                      💰 KES {parseFloat(component.amount || '0').toLocaleString()}
                                    </div>
                                  )}
                                </div>
                              </td>
                              <td className="border border-primary/30 p-2 text-center">
                                <div className="flex items-center justify-center gap-1">
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    className="h-7 w-7 p-0 opacity-0 group-hover:opacity-100 transition-all duration-200 hover:bg-red-50 hover:scale-110"
                                    onClick={() => removeComponent(termIndex, bucketIndex, actualComponentIndex)}
                                    title="Delete fee"
                                  >
                                    <X className="h-3 w-3 text-red-500" />
                                  </Button>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    className="h-7 w-7 p-0 opacity-0 group-hover:opacity-100 transition-all duration-200 hover:bg-primary/10 hover:scale-110"
                                    onClick={() => {
                                      // Duplicate this fee item
                                      addComponent(termIndex, bucketIndex)
                                      const newIndex = formData.termStructures[termIndex].buckets[bucketIndex].components.length - 1
                                      updateComponent(termIndex, bucketIndex, newIndex, 'name', component.name)
                                      updateComponent(termIndex, bucketIndex, newIndex, 'amount', component.amount)
                                    }}
                                    title="Duplicate fee"
                                  >
                                    <Copy className="h-3 w-3 text-primary" />
                                  </Button>
                                  {/* Show edit and delete bucket buttons only for the first component of each bucket */}
                                  {actualComponentIndex === 0 && (
                                    <>
                                      {formData.termStructures[termIndex].buckets[bucketIndex].id && (
                                        <Button
                                          variant="ghost"
                                          size="sm"
                                          className="h-7 w-7 p-0 opacity-0 group-hover:opacity-100 transition-all duration-200 hover:bg-blue-50 hover:scale-110"
                                          onClick={() => {
                                            const bucket = formData.termStructures[termIndex].buckets[bucketIndex]
                                            setEditingBucket({
                                              id: bucket.id!,
                                              name: bucket.name,
                                              description: bucket.description,
                                              isActive: true // Default to active, could be enhanced to track actual status
                                            })
                                            setShowEditBucketModal(true)
                                          }}
                                          title="Edit bucket"
                                        >
                                          <Edit3 className="h-3 w-3 text-blue-500" />
                                        </Button>
                                      )}
                                      <Button
                                        variant="ghost"
                                        size="sm"
                                        className="h-7 w-7 p-0 opacity-0 group-hover:opacity-100 transition-all duration-200 hover:bg-red-50 hover:scale-110"
                                        onClick={async () => {
                                          const bucket = formData.termStructures[termIndex].buckets[bucketIndex]
                                          if (bucket.id) {
                                            // Delete from server if it has an ID
                                            if (confirm(`Are you sure you want to delete the entire "${bucket.name}" bucket? This will remove it from the server and all fee structures.`)) {
                                              await deleteFeeBucket(bucket.id)
                                              // Also remove from form
                                              deleteFormBucket(termIndex, bucketIndex)
                                            }
                                          } else {
                                            // Just remove from form if no server ID
                                            if (confirm(`Are you sure you want to remove the "${bucket.name}" bucket from this fee structure?`)) {
                                              deleteFormBucket(termIndex, bucketIndex)
                                            }
                                          }
                                        }}
                                        title="Delete entire bucket"
                                      >
                                        <Trash2 className="h-3 w-3 text-red-500" />
                                      </Button>
                                    </>
                                  )}
                                </div>
                              </td>
                            </tr>
                          )
                        })
                      })}
                      <tr className="bg-primary/5 hover:bg-primary/10 transition-all duration-300">
                        <td className="border border-primary/30 p-3 text-center">
                          <Select
                            onValueChange={(value) => {
                              const termIndex = parseInt(value)
                              if (formData.termStructures[termIndex]?.buckets[0]) {
                                addComponent(termIndex, 0)
                              } else {
                                addBucket(termIndex)
                              }
                            }}
                          >
                            <SelectTrigger className="text-xs bg-white border-2 border-primary/30 rounded-lg px-3 py-2 shadow-sm hover:shadow-md transition-all duration-200 focus:ring-2 focus:ring-primary/30 h-8">
                              <SelectValue placeholder="🎯 Select Term" />
                            </SelectTrigger>
                            <SelectContent>
                              {formData.termStructures.map((term, index) => (
                                <SelectItem key={index} value={index.toString()}>
                                  📅 {term.term}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </td>
                        <td className="border border-primary/30 p-3">
                          <div className="flex gap-2 items-center">
                            <Button
                              variant="outline"
                              size="sm"
                              className="text-xs bg-primary text-white border-primary hover:bg-primary/80 shadow-md hover:shadow-lg transition-all duration-200 hover:scale-105"
                              onClick={() => {
                                // Add new component to first term, first bucket
                                if (formData.termStructures[0]?.buckets[0]) {
                                  addComponent(0, 0)
                                } else {
                                  // If no buckets exist, add a default bucket first
                                  addBucket(0)
                                }
                              }}
                            >
                              <Plus className="h-3 w-3 mr-1" />
                              ✨ Add Fee
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              className="text-xs bg-primary text-white border-primary hover:bg-primary/80 shadow-md hover:shadow-lg transition-all duration-200 hover:scale-105"
                              onClick={() => {
                                // Add a new bucket/category
                                if (formData.termStructures[0]) {
                                  addBucket(0)
                                }
                              }}
                            >
                              <Plus className="h-3 w-3 mr-1" />
                              📁 Add Category
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              className="text-xs bg-primary text-white border-primary hover:bg-primary/80 shadow-md hover:shadow-lg transition-all duration-200 hover:scale-105"
                              onClick={() => {
                                // Bulk add common fees
                                const commonFees = [
                                  { name: 'Tuition Fee', amount: '15000' },
                                  { name: 'Transport Fee', amount: '3000' },
                                  { name: 'Examination Fee', amount: '2000' }
                                ]
                                commonFees.forEach(fee => {
                                  if (formData.termStructures[0]?.buckets[0]) {
                                    addComponent(0, 0)
                                    const termIndex = 0
                                    const bucketIndex = 0
                                    const componentIndex = formData.termStructures[termIndex].buckets[bucketIndex].components.length - 1
                                    updateComponent(termIndex, bucketIndex, componentIndex, 'name', fee.name)
                                    updateComponent(termIndex, bucketIndex, componentIndex, 'amount', fee.amount)
                                  }
                                })
                                showToast(`🚀 ${commonFees.length} common fees added in bulk!`, 'success')
                              }}
                            >
                              <Zap className="h-3 w-3 mr-1" />
                              🚀 Bulk Add
                            </Button>
                          </div>
                        </td>
                        <td className="border border-primary/30 p-3 text-center">
                          <div className="text-xs text-slate-500 font-mono">
                            💡 Quick Actions
                          </div>
                        </td>
                        <td className="border border-primary/30 p-3 text-center">
                          <div className="flex justify-center">
                            <Sparkles className="h-4 w-4 text-primary animate-pulse" />
                          </div>
                        </td>
                      </tr>
                      <tr className="bg-primary/10 font-bold">
                        <td className="border border-primary/30 p-2 text-slate-700">TOTAL</td>
                        <td className="border border-primary/30 p-2 text-right text-slate-700">
                          {calculateGrandTotal().toLocaleString('en-KE', { 
                            minimumFractionDigits: 2, 
                            maximumFractionDigits: 2 
                          })}
                        </td>
                        <td className="border border-primary/30 p-2"></td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                {/* Termly Payment Schedule */}
                <div className="mb-8 px-6">
                  <h3 className="text-center font-bold underline mb-4">
                    TERMLY PAYMENT FOR THE YEAR {formData.academicYear}
                  </h3>
                  <div className="flex justify-center">
                    <table className="border-collapse border border-primary/30">
                      <thead>
                        <tr className="bg-primary/10">
                          <th className="border border-primary/30 p-2 text-left font-bold text-slate-700">TERM</th>
                          <th className="border border-primary/30 p-2 text-right font-bold text-slate-700">AMOUNT</th>
                          <th className="border border-primary/30 p-2 w-16"></th>
                        </tr>
                      </thead>
                      <tbody>
                        {formData.termStructures.map((term, index) => (
                          <tr key={index} className="hover:bg-primary/5 group">
                            <td className="border border-primary/30 p-2">
                              <Select
                                value={term.term}
                                onValueChange={(value) => updateTermStructure(index, 'term', value)}
                              >
                                <SelectTrigger className="bg-transparent border-0 focus:bg-white focus:outline-none focus:ring-1 focus:ring-primary/30 rounded px-1 font-bold h-8">
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  {(() => {
                                    const selectedAcademicYear = academicYears.find(year => year.name === formData.academicYear)
                                    const availableTerms = selectedAcademicYear?.terms || []
                                    
                                    console.log('Selected academic year:', selectedAcademicYear)
                                    console.log('Available terms:', availableTerms)
                                    console.log('Form academic year:', formData.academicYear)
                                    
                                    if (availableTerms.length > 0) {
                                      return availableTerms.map((term) => (
                                        <SelectItem key={term.id} value={term.name}>
                                          {term.name.toUpperCase()}
                                        </SelectItem>
                                      ))
                                    } else {
                                      // Fallback to default terms if no academic year is selected
                                      return [
                                        <SelectItem key="term1" value="Term 1">TERM 1</SelectItem>,
                                        <SelectItem key="term2" value="Term 2">TERM 2</SelectItem>,
                                        <SelectItem key="term3" value="Term 3">TERM 3</SelectItem>,
                                        <SelectItem key="annual" value="Annual">ANNUAL</SelectItem>
                                      ]
                                    }
                                  })()}
                                </SelectContent>
                              </Select>
                            </td>
                            <td className="border border-primary/30 p-2 text-right">
                              {calculateTermTotal(index).toLocaleString('en-KE', { 
                                minimumFractionDigits: 2, 
                                maximumFractionDigits: 2 
                              })}
                            </td>
                            <td className="border border-primary/30 p-1 text-center">
                              {formData.termStructures.length > 1 && (
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                                  onClick={() => removeTermStructure(index)}
                                >
                                  <Trash2 className="h-3 w-3 text-red-500" />
                                </Button>
                              )}
                            </td>
                          </tr>
                        ))}
                        <tr>
                          <td className="border border-primary/30 p-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              className="text-xs text-primary hover:bg-primary/10"
                              onClick={addTermStructure}
                            >
                              <Plus className="h-3 w-3 mr-1" />
                              Add Term
                            </Button>
                          </td>
                          <td className="border border-primary/30 p-2"></td>
                          <td className="border border-primary/30 p-2"></td>
                        </tr>
                        <tr className="bg-primary/10 font-bold">
                          <td className="border border-primary/30 p-2 text-slate-700">TOTAL</td>
                          <td className="border border-primary/30 p-2 text-right text-slate-700">
                            {calculateGrandTotal().toLocaleString('en-KE', { 
                              minimumFractionDigits: 2, 
                              maximumFractionDigits: 2 
                            })}
                          </td>
                          <td className="border border-primary/30 p-2"></td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Payment Modes Section */}
                <div className="mb-8 px-6">
                  <h3 className="text-center font-bold underline mb-4">PAYMENT MODES</h3>
                  <div className="space-y-4">
                    <div className="bg-primary/5 p-4 rounded border border-primary/20">
                      <h4 className="font-bold mb-2 text-slate-700">Bank Details:</h4>
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <label className="block text-xs text-slate-600 mb-1">Bank Name:</label>
                          <input
                            className="w-full bg-transparent border-0 border-b border-primary/30 focus:bg-white focus:outline-none focus:ring-1 focus:ring-primary/30 rounded px-1"
                            value={formData.paymentModes?.bankAccounts?.[0]?.bankName || ''}
                            onChange={(e) => setFormData(prev => ({
                              ...prev,
                              paymentModes: {
                                ...prev.paymentModes!,
                                bankAccounts: [{
                                  ...prev.paymentModes?.bankAccounts?.[0]!,
                                  bankName: e.target.value
                                }]
                              }
                            }))}
                            placeholder="Enter bank name"
                          />
                        </div>
                        <div>
                          <label className="block text-xs text-slate-600 mb-1">Account Number:</label>
                          <input
                            className="w-full bg-transparent border-0 border-b border-primary/30 focus:bg-white focus:outline-none focus:ring-1 focus:ring-primary/30 rounded px-1"
                            value={formData.paymentModes?.bankAccounts?.[0]?.accountNumber || ''}
                            onChange={(e) => setFormData(prev => ({
                              ...prev,
                              paymentModes: {
                                ...prev.paymentModes!,
                                bankAccounts: [{
                                  ...prev.paymentModes?.bankAccounts?.[0]!,
                                  accountNumber: e.target.value
                                }]
                              }
                            }))}
                            placeholder="Enter account number"
                          />
                        </div>
                        <div>
                          <label className="block text-xs text-slate-600 mb-1">Account Holder:</label>
                          <input
                            className="w-full bg-transparent border-0 border-b border-primary/30 focus:bg-white focus:outline-none focus:ring-1 focus:ring-primary/30 rounded px-1"
                            value={formData.schoolDetails?.name || ''}
                            onChange={(e) => setFormData(prev => ({
                              ...prev,
                              schoolDetails: { ...prev.schoolDetails!, name: e.target.value }
                            }))}
                            placeholder="Account holder name"
                          />
                        </div>
                        <div>
                          <label className="block text-xs text-slate-600 mb-1">Branch:</label>
                          <input
                            className="w-full bg-transparent border-0 border-b border-primary/30 focus:bg-white focus:outline-none focus:ring-1 focus:ring-primary/30 rounded px-1"
                            value={formData.paymentModes?.bankAccounts?.[0]?.branch || ''}
                            onChange={(e) => setFormData(prev => ({
                              ...prev,
                              paymentModes: {
                                ...prev.paymentModes!,
                                bankAccounts: [{
                                  ...prev.paymentModes?.bankAccounts?.[0]!,
                                  branch: e.target.value
                                }]
                              }
                            }))}
                            placeholder="Enter branch"
                          />
                        </div>
                      </div>
                    </div>

                    <div className="bg-primary/5 p-4 rounded border border-primary/20">
                      <h4 className="font-bold mb-2 text-slate-700">Additional Settings:</h4>
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <label className="block text-xs text-slate-600 mb-1">Student Type:</label>
                          <select
                            className="w-full bg-transparent border-0 border-b border-primary/30 focus:bg-white focus:outline-none focus:ring-1 focus:ring-primary/30 rounded px-1"
                            value={formData.boardingType}
                            onChange={(e) => setFormData(prev => ({ ...prev, boardingType: e.target.value as any }))}
                          >
                            <option value="day">Day Students Only</option>
                            <option value="boarding">Boarding Students Only</option>
                            <option value="both">Both Day & Boarding</option>
                          </select>
                        </div>
                        <div>
                          <label className="block text-xs text-slate-600 mb-1">Structure Name:</label>
                          <input
                            className="w-full bg-transparent border-0 border-b border-primary/30 focus:bg-white focus:outline-none focus:ring-1 focus:ring-primary/30 rounded px-1"
                            value={formData.name}
                            onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                            placeholder="e.g., Primary School Fee Structure 2024"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Signature Section */}
                <div className="mb-8 px-6">
                  <div className="flex justify-between items-end">
                    <div>
                      <p className="mb-8">Yours faithfully,</p>
                      <div className="border-b border-black w-48 mb-2"></div>
                      <p className="text-sm">
                        <input
                          className="bg-transparent border-0 focus:bg-primary/5 focus:outline-none focus:ring-1 focus:ring-primary/30 rounded px-1"
                          value={formData.schoolDetails?.principalName || ''}
                          onChange={(e) => setFormData(prev => ({
                            ...prev,
                            schoolDetails: { ...prev.schoolDetails!, principalName: e.target.value }
                          }))}
                          placeholder="Principal Name"
                        />
                        <br />
                        PRINCIPAL
                      </p>
                    </div>
                    <div className="text-right">
                      <div className="w-24 h-24 border border-primary/30 flex items-center justify-center text-xs text-slate-500 mb-2">
                        SCHOOL<br />STAMP
                      </div>
                    </div>
                  </div>
                </div>

                {/* Instructions */}
                <div className="px-6 text-sm text-slate-600 bg-primary/5 p-4 rounded border border-primary/20">
                  <p className="mb-2 text-slate-700"><strong>Instructions:</strong></p>
                  <ul className="text-xs space-y-1 list-disc list-inside">
                    <li>Click on any field to edit it directly</li>
                    <li>Add new fee items using the "Add Fee Item" button</li>
                    <li>Add or remove terms using the buttons in the payment schedule</li>
                    <li>Use the Preview tab to see the final document</li>
                  </ul>
                </div>

              </div>
            </TabsContent>

            <TabsContent value="preview" className="flex-1 p-6 m-0">
              <div className="h-full overflow-y-auto">
                <FeeStructurePDFPreview
                  formData={formData}
                  schoolName={formData.schoolDetails?.name}
                  schoolAddress={formData.schoolDetails?.address}
                  schoolContact={formData.schoolDetails?.contact}
                  schoolEmail={formData.schoolDetails?.email}
                />
              </div>
            </TabsContent>
          </Tabs>
        </div>

        {/* Bucket Creation Modal */}
        <Dialog open={showBucketModal} onOpenChange={setShowBucketModal}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <GraduationCap className="h-5 w-5 text-primary" />
                Create New Fee Bucket
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="bucket-name" className="text-sm font-medium text-slate-700">
                  Bucket Name
                </Label>
                <Input
                  id="bucket-name"
                  placeholder="e.g., Tuition Fees, Transport Fees"
                  value={bucketModalData.name}
                  onChange={(e) => setBucketModalData(prev => ({ ...prev, name: e.target.value }))}
                  className="focus:ring-2 focus:ring-primary/30"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="bucket-description" className="text-sm font-medium text-slate-700">
                  Description
                </Label>
                <Input
                  id="bucket-description"
                  placeholder="e.g., Academic fees for the term"
                  value={bucketModalData.description}
                  onChange={(e) => setBucketModalData(prev => ({ ...prev, description: e.target.value }))}
                  className="focus:ring-2 focus:ring-primary/30"
                />
              </div>
            </div>
            <div className="flex justify-end gap-3 pt-4 border-t">
              <Button
                variant="outline"
                onClick={() => {
                  setShowBucketModal(false)
                  setBucketModalData({ name: '', description: '' })
                }}
              >
                Cancel
              </Button>
              <Button
                onClick={async () => {
                  if (bucketModalData.name.trim() && bucketModalData.description.trim()) {
                    await addBucketWithAPI(0, bucketModalData.name.trim(), bucketModalData.description.trim())
                    setShowBucketModal(false)
                    setBucketModalData({ name: '', description: '' })
                  }
                }}
                disabled={!bucketModalData.name.trim() || !bucketModalData.description.trim() || isCreatingBucket}
                className="bg-primary text-white hover:bg-primary/80"
              >
                {isCreatingBucket ? 'Creating...' : 'Create Bucket'}
              </Button>
            </div>
          </DialogContent>
        </Dialog>

        {/* Edit Bucket Modal */}
        <Dialog open={showEditBucketModal} onOpenChange={setShowEditBucketModal}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Edit3 className="h-5 w-5 text-primary" />
                Edit Fee Bucket
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="edit-bucket-name" className="text-sm font-medium text-slate-700">
                  Bucket Name
                </Label>
                <Input
                  id="edit-bucket-name"
                  placeholder="e.g., Tuition Fees, Transport Fees"
                  value={editingBucket?.name || ''}
                  onChange={(e) => setEditingBucket(prev => prev ? { ...prev, name: e.target.value } : null)}
                  className="focus:ring-2 focus:ring-primary/30"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-bucket-description" className="text-sm font-medium text-slate-700">
                  Description
                </Label>
                <Input
                  id="edit-bucket-description"
                  placeholder="e.g., Academic fees for the term"
                  value={editingBucket?.description || ''}
                  onChange={(e) => setEditingBucket(prev => prev ? { ...prev, description: e.target.value } : null)}
                  className="focus:ring-2 focus:ring-primary/30"
                />
              </div>
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="edit-bucket-active"
                    checked={editingBucket?.isActive || false}
                    onCheckedChange={(checked) => setEditingBucket(prev => prev ? { ...prev, isActive: checked as boolean } : null)}
                  />
                  <Label htmlFor="edit-bucket-active" className="text-sm font-medium text-slate-700">
                    Active (available for use in fee structures)
                  </Label>
                </div>
              </div>
            </div>
            <div className="flex justify-end gap-3 pt-4 border-t">
              <Button
                variant="outline"
                onClick={() => {
                  setShowEditBucketModal(false)
                  setEditingBucket(null)
                }}
              >
                Cancel
              </Button>
              <Button
                onClick={async () => {
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
                disabled={!editingBucket?.name.trim() || !editingBucket?.description.trim()}
                className="bg-primary text-white hover:bg-primary/80"
              >
                Update Bucket
              </Button>
            </div>
          </DialogContent>
        </Dialog>

        {/* Toast Notifications */}
        <div className="fixed top-4 right-4 z-50 space-y-2">
          {toasts.map((toast) => (
            <div
              key={toast.id}
              className={`px-4 py-3 rounded-lg shadow-lg border-l-4 transform transition-all duration-300 ease-in-out animate-in slide-in-from-right ${
                toast.type === 'success' 
                  ? 'bg-green-50 border-green-400 text-green-800' 
                  : toast.type === 'error'
                  ? 'bg-red-50 border-red-400 text-red-800'
                  : 'bg-primary/5 border-primary text-primary'
              }`}
            >
              <div className="flex items-center gap-2">
                {toast.type === 'success' && <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>}
                {toast.type === 'error' && <div className="w-2 h-2 bg-red-400 rounded-full animate-pulse"></div>}
                {toast.type === 'info' && <div className="w-2 h-2 bg-primary rounded-full animate-pulse"></div>}
                <span className="text-sm font-medium">{toast.message}</span>
              </div>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="border-t border-primary/20 p-6 flex items-center justify-between bg-primary/5">
          <div className="text-sm text-slate-600">
            {selectedGrades.length > 0 && (
              <span>Will create {selectedGrades.length} fee structure(s)</span>
            )}
          </div>
          <div className="flex gap-3">
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button 
              onClick={handleSave}
              disabled={!formData.name || selectedGrades.length === 0}
            >
              <Save className="h-4 w-4 mr-2" />
              Save Fee Structure
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}

