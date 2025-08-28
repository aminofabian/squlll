'use client'

import { useState, useEffect } from 'react'
import { X, Plus, Copy, Trash2, Save, Eye, Edit3, GraduationCap, Wand2, Calculator, Clock, ChevronDown, ChevronRight, Sparkles, Zap, BookOpen, Bus, Home, Utensils, FlaskConical, Trophy, Library } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { FeeStructure, FeeStructureForm, Grade, TermFeeStructureForm, FeeBucketForm, FeeComponentForm, BankAccount } from '../types'
import { FeeStructurePDFPreview } from './FeeStructurePDFPreview'

interface FeeStructureDrawerProps {
  isOpen: boolean
  onClose: () => void
  onSave: (formData: FeeStructureForm) => void
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
  const [formData, setFormData] = useState<FeeStructureForm>({
    name: '',
    grade: '',
    boardingType: 'both',
    academicYear: new Date().getFullYear().toString(),
    termStructures: [defaultTermStructure],
    schoolDetails: {
      name: 'KANYAWANGA HIGH SCHOOL',
      address: 'P.O. Box 100 - 40404, RONGO KENYA. Cell: 0710215418',
      contact: '0710215418',
      email: 'kanyawangaschool@hotmail.com',
      principalName: 'JACOB MBOGO',
      principalTitle: 'PRINCIPAL/SEC BOM.'
    },
    paymentModes: {
      bankAccounts: [
        { bankName: 'Kenya Commercial Bank', branch: 'Rongo Branch', accountNumber: '1172699240' },
        { bankName: 'National Bank of Kenya', branch: 'Awendo Branch', accountNumber: '01021045775100' }
      ],
      postalAddress: 'Repayable at Rongo Post Office',
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

  const showToast = (message: string, type: 'success' | 'error' | 'info' = 'success') => {
    const id = Math.random().toString(36).substr(2, 9)
    setToasts(prev => [...prev, { id, message, type }])
    setTimeout(() => {
      setToasts(prev => prev.filter(toast => toast.id !== id))
    }, 3000)
  }

  // Smart fee templates
  const feeTemplates = {
    academic: [
      { name: 'Tuition Fee', amount: '15000', icon: BookOpen },
      { name: 'Examination Fee', amount: '2000', icon: FlaskConical },
      { name: 'Library Fee', amount: '500', icon: Library },
      { name: 'Computer Lab Fee', amount: '1000', icon: Calculator }
    ],
    boarding: [
      { name: 'Boarding Fee', amount: '8000', icon: Home },
      { name: 'Meals Fee', amount: '6000', icon: Utensils },
      { name: 'Laundry Fee', amount: '1000', icon: Sparkles }
    ],
    transport: [
      { name: 'Transport Fee', amount: '3000', icon: Bus }
    ],
    activities: [
      { name: 'Sports Fee', amount: '800', icon: Trophy },
      { name: 'Music Fee', amount: '600', icon: Zap }
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
        termStructures: [defaultTermStructure]
      })
      setSelectedGrades([])
    }
  }, [initialData, isOpen])

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

  const handleSave = () => {
    // Create separate fee structures for each selected grade
    selectedGrades.forEach(gradeId => {
      const gradeData = {
        ...formData,
        grade: gradeId,
        name: selectedGrades.length > 1 
          ? `${formData.name} - ${availableGrades.find(g => g.id === gradeId)?.name || gradeId}`
          : formData.name
      }
      onSave(gradeData)
    })
    onClose()
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
                    <input
                      className="bg-transparent border-0 focus:bg-yellow-50 focus:outline-none focus:ring-1 focus:ring-blue-300 rounded px-1 w-16 text-center"
                      value={formData.academicYear}
                      onChange={(e) => setFormData(prev => ({ ...prev, academicYear: e.target.value }))}
                      placeholder="2024"
                    />
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
                        onClick={() => setShowQuickAdd(!showQuickAdd)}
                      >
                        <Wand2 className="h-3 w-3 mr-1" />
                        Quick Add
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
                        {Object.entries(feeTemplates).map(([category, templates]) => (
                          <div key={category} className="space-y-2">
                            <h5 className="text-xs font-medium text-slate-600 uppercase tracking-wide">
                              {category}
                            </h5>
                            <div className="space-y-1">
                              {templates.map((template, index) => {
                                const IconComponent = template.icon
                                return (
                                  <Button
                                    key={index}
                                    variant="ghost"
                                    size="sm"
                                    className="w-full justify-start text-xs h-8 hover:bg-primary/5 hover:shadow-sm border-primary/10"
                                    onClick={() => {
                                      if (formData.termStructures[0]?.buckets[0]) {
                                        addComponent(0, 0)
                                        // Update the newly added component
                                        const termIndex = 0
                                        const bucketIndex = 0
                                        const componentIndex = formData.termStructures[termIndex].buckets[bucketIndex].components.length - 1
                                        updateComponent(termIndex, bucketIndex, componentIndex, 'name', template.name)
                                        updateComponent(termIndex, bucketIndex, componentIndex, 'amount', template.amount)
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
                        ))}
                      </div>
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
                                  <input
                                    className="w-full bg-transparent border-0 focus:bg-primary/5 focus:outline-none focus:ring-2 focus:ring-primary/30 rounded-lg px-2 py-1 transition-all duration-200"
                                    value={component.name}
                                    onChange={(e) => updateComponent(termIndex, bucketIndex, actualComponentIndex, 'name', e.target.value)}
                                    onFocus={() => setCurrentEditingField(`${termIndex}-${bucketIndex}-${actualComponentIndex}-name`)}
                                    onBlur={() => setCurrentEditingField(null)}
                                    placeholder="Enter fee name..."
                                  />
                                  {currentEditingField === `${termIndex}-${bucketIndex}-${actualComponentIndex}-name` && (
                                    <div className="absolute top-full left-0 mt-1 text-xs text-primary bg-primary/5 px-2 py-1 rounded shadow-sm">
                                      💡 Try: Tuition, Transport, Boarding, etc.
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
                                </div>
                              </td>
                            </tr>
                          )
                        })
                      })}
                      <tr className="bg-primary/5 hover:bg-primary/10 transition-all duration-300">
                        <td className="border border-primary/30 p-3 text-center">
                          <select 
                            className="text-xs bg-white border-2 border-primary/30 rounded-lg px-3 py-2 shadow-sm hover:shadow-md transition-all duration-200 focus:ring-2 focus:ring-primary/30"
                            onChange={(e) => {
                              const termIndex = parseInt(e.target.value)
                              if (formData.termStructures[termIndex]?.buckets[0]) {
                                addComponent(termIndex, 0)
                              } else {
                                addBucket(termIndex)
                              }
                              e.target.value = "" // Reset selection
                            }}
                            defaultValue=""
                          >
                            <option value="" disabled>🎯 Select Term</option>
                            {formData.termStructures.map((term, index) => (
                              <option key={index} value={index}>
                                📅 {term.term}
                              </option>
                            ))}
                          </select>
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
                              <select
                                className="bg-transparent border-0 focus:bg-white focus:outline-none focus:ring-1 focus:ring-primary/30 rounded px-1 font-bold"
                                value={term.term}
                                onChange={(e) => updateTermStructure(index, 'term', e.target.value)}
                              >
                                <option value="Term 1">TERM 1</option>
                                <option value="Term 2">TERM 2</option>
                                <option value="Term 3">TERM 3</option>
                                <option value="Annual">ANNUAL</option>
                              </select>
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
