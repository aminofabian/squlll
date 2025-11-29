'use client'

import { useState } from 'react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { 
  Plus, 
  Trash2, 
  Save, 
  X,
  Coins,
  Calendar,
  Users,
  BookOpen,
  School,
  Bus,
  Utensils,
  Home,
  Activity,
  GraduationCap,
  Book,
  Calculator,
  Lightbulb,
  Copy,
  CheckCircle,
  ArrowRight,
  Info
} from 'lucide-react'
import { FeeStructureForm, TermFeeStructureForm, FeeBucketForm, FeeComponentForm } from '../types'

interface FeeStructureFormProps {
  isOpen: boolean
  onClose: () => void
  onSave: (feeStructure: FeeStructureForm) => void
  initialData?: FeeStructureForm
  mode: 'create' | 'edit'
}

export const FeeStructureFormComponent = ({
  isOpen,
  onClose,
  onSave,
  initialData,
  mode
}: FeeStructureFormProps) => {
  const [formData, setFormData] = useState<FeeStructureForm>(
    initialData || {
      name: '',
      grade: '',
      boardingType: 'day',
      academicYear: '2024',
      termStructures: [
        {
          term: 'Term 1',
          dueDate: '',
          latePaymentFee: '',
          earlyPaymentDiscount: '',
          earlyPaymentDeadline: '',
          buckets: []
        }
      ]
    }
  )

  const [activeTab, setActiveTab] = useState('basic')

  // Predefined fee bucket templates
  const feeBucketTemplates = {
    tuition: {
      name: 'Tuition & Academic Fees',
      type: 'tuition',
      description: 'Core academic instruction and educational services',
      components: [
        { name: 'Tuition Fees', amount: '18000', category: 'academic', description: 'Core teaching fees' },
        { name: 'Library Fees', amount: '2000', category: 'academic', description: 'Library and resource access' },
        { name: 'Computer Lab', amount: '1500', category: 'technology', description: 'Computer and technology access' },
        { name: 'Examination Fees', amount: '1000', category: 'assessment', description: 'Internal examination costs' }
      ]
    },
    transport: {
      name: 'Transportation Fees',
      type: 'transport',
      description: 'School bus and transportation services',
      components: [
        { name: 'Bus Fees', amount: '8000', category: 'transport', description: 'Daily bus transportation' },
        { name: 'Fuel Surcharge', amount: '500', category: 'transport', description: 'Variable fuel costs' }
      ]
    },
    meals: {
      name: 'Meals & Catering',
      type: 'meals',
      description: 'School meals and catering services',
      components: [
        { name: 'Lunch Fees', amount: '12000', category: 'meals', description: 'Daily lunch service' },
        { name: 'Snack Fees', amount: '3000', category: 'meals', description: 'Morning and afternoon snacks' }
      ]
    },
    boarding: {
      name: 'Boarding & Accommodation',
      type: 'boarding',
      description: 'Residential and accommodation services',
      components: [
        { name: 'Boarding Fees', amount: '25000', category: 'boarding', description: 'Room and accommodation' },
        { name: 'Laundry Service', amount: '3000', category: 'boarding', description: 'Weekly laundry service' },
        { name: 'Evening Meals', amount: '8000', category: 'meals', description: 'Dinner and evening meals' }
      ]
    },
    activities: {
      name: 'Co-curricular Activities',
      type: 'activities',
      description: 'Sports, clubs, and extracurricular activities',
      components: [
        { name: 'Sports Fees', amount: '4000', category: 'sports', description: 'Sports equipment and coaching' },
        { name: 'Music & Arts', amount: '3000', category: 'arts', description: 'Music and arts programs' },
        { name: 'Clubs & Societies', amount: '2000', category: 'activities', description: 'Various student clubs' }
      ]
    },
    development: {
      name: 'Development & Infrastructure',
      type: 'development',
      description: 'School development and infrastructure fees',
      components: [
        { name: 'Building Fund', amount: '5000', category: 'infrastructure', description: 'School building maintenance' },
        { name: 'Equipment Fund', amount: '3000', category: 'infrastructure', description: 'Educational equipment' },
        { name: 'Technology Fund', amount: '2000', category: 'technology', description: 'IT infrastructure' }
      ]
    }
  }

  // Grade-specific fee suggestions
  const getGradeSpecificSuggestions = (grade: string, boardingType: string) => {
    const suggestions = []
    
    // Always include tuition
    suggestions.push(feeBucketTemplates.tuition)
    
    // Add transport for day students
    if (boardingType === 'day' || boardingType === 'both') {
      suggestions.push(feeBucketTemplates.transport)
    }
    
    // Add meals for day students
    if (boardingType === 'day' || boardingType === 'both') {
      suggestions.push(feeBucketTemplates.meals)
    }
    
    // Add boarding for boarding students
    if (boardingType === 'boarding' || boardingType === 'both') {
      suggestions.push(feeBucketTemplates.boarding)
    }
    
    // Add activities (common for all)
    suggestions.push(feeBucketTemplates.activities)
    
    // Add development fund
    suggestions.push(feeBucketTemplates.development)
    
    // Grade-specific adjustments
    if (grade.includes('Form 4') || grade.includes('Grade 8')) {
      // Add graduation fees for final year
      suggestions.push({
        name: 'Graduation & Certification',
        type: 'graduation',
        description: 'Graduation ceremony and certification fees',
        components: [
          { name: 'Graduation Ceremony', amount: '5000', category: 'graduation', description: 'Graduation ceremony costs' },
          { name: 'Certificate Fees', amount: '2000', category: 'graduation', description: 'Official certificates' }
        ]
      })
    }
    
    return suggestions
  }

  const updateFormData = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const updateTermStructure = (termIndex: number, field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      termStructures: prev.termStructures.map((term, index) =>
        index === termIndex ? { ...term, [field]: value } : term
      )
    }))
  }

  const addTermStructure = () => {
    const newTerm: TermFeeStructureForm = {
      term: `Term ${formData.termStructures.length + 1}` as 'Term 1' | 'Term 2' | 'Term 3',
      dueDate: '',
      latePaymentFee: '',
      earlyPaymentDiscount: '',
      earlyPaymentDeadline: '',
      buckets: []
    }
    setFormData(prev => ({
      ...prev,
      termStructures: [...prev.termStructures, newTerm]
    }))
  }

  const removeTermStructure = (termIndex: number) => {
    setFormData(prev => ({
      ...prev,
      termStructures: prev.termStructures.filter((_, index) => index !== termIndex)
    }))
  }

  const addBucket = (termIndex: number) => {
    const newBucket: FeeBucketForm = {
      type: 'tuition',
      name: '',
      description: '',
      isOptional: false,
      components: []
    }
    updateTermStructure(termIndex, 'buckets', [
      ...formData.termStructures[termIndex].buckets,
      newBucket
    ])
  }

  const addTemplateBucket = (termIndex: number, templateKey: string) => {
    const template = feeBucketTemplates[templateKey as keyof typeof feeBucketTemplates]
    if (!template) return

    const newBucket: FeeBucketForm = {
      type: template.type as 'tuition' | 'transport' | 'meals' | 'boarding',
      name: template.name,
      description: template.description,
      isOptional: false,
      components: template.components.map(comp => ({
        name: comp.name,
        description: comp.description,
        amount: comp.amount,
        category: comp.category
      }))
    }
    
    updateTermStructure(termIndex, 'buckets', [
      ...formData.termStructures[termIndex].buckets,
      newBucket
    ])
  }

  const addAllSuggestedBuckets = (termIndex: number) => {
    const suggestions = getGradeSpecificSuggestions(formData.grade, formData.boardingType)
    const newBuckets = suggestions.map(template => ({
      type: template.type as 'tuition' | 'transport' | 'meals' | 'boarding',
      name: template.name,
      description: template.description,
      isOptional: false,
      components: template.components.map(comp => ({
        name: comp.name,
        description: comp.description,
        amount: comp.amount,
        category: comp.category
      }))
    }))
    
    updateTermStructure(termIndex, 'buckets', [
      ...formData.termStructures[termIndex].buckets,
      ...newBuckets
    ])
  }

  const updateBucket = (termIndex: number, bucketIndex: number, field: string, value: any) => {
    const updatedBuckets = formData.termStructures[termIndex].buckets.map((bucket, index) =>
      index === bucketIndex ? { ...bucket, [field]: value } : bucket
    )
    updateTermStructure(termIndex, 'buckets', updatedBuckets)
  }

  const removeBucket = (termIndex: number, bucketIndex: number) => {
    const updatedBuckets = formData.termStructures[termIndex].buckets.filter(
      (_, index) => index !== bucketIndex
    )
    updateTermStructure(termIndex, 'buckets', updatedBuckets)
  }

  const addComponent = (termIndex: number, bucketIndex: number) => {
    const newComponent: FeeComponentForm = {
      name: '',
      description: '',
      amount: '',
      category: ''
    }
    const updatedBuckets = [...formData.termStructures[termIndex].buckets]
    updatedBuckets[bucketIndex].components.push(newComponent)
    updateTermStructure(termIndex, 'buckets', updatedBuckets)
  }

  const updateComponent = (
    termIndex: number, 
    bucketIndex: number, 
    componentIndex: number, 
    field: string, 
    value: any
  ) => {
    const updatedBuckets = [...formData.termStructures[termIndex].buckets]
    updatedBuckets[bucketIndex].components[componentIndex] = {
      ...updatedBuckets[bucketIndex].components[componentIndex],
      [field]: value
    }
    updateTermStructure(termIndex, 'buckets', updatedBuckets)
  }

  const removeComponent = (termIndex: number, bucketIndex: number, componentIndex: number) => {
    const updatedBuckets = [...formData.termStructures[termIndex].buckets]
    updatedBuckets[bucketIndex].components = updatedBuckets[bucketIndex].components.filter(
      (_, index) => index !== componentIndex
    )
    updateTermStructure(termIndex, 'buckets', updatedBuckets)
  }

  const calculateBucketTotal = (bucket: FeeBucketForm) => {
    return bucket.components.reduce((sum, component) => sum + (parseFloat(component.amount) || 0), 0)
  }

  const calculateTermTotal = (termStructure: TermFeeStructureForm) => {
    return termStructure.buckets.reduce((sum, bucket) => sum + calculateBucketTotal(bucket), 0)
  }

  const handleSave = () => {
    onSave(formData)
    onClose()
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg w-full max-w-6xl max-h-[90vh] overflow-hidden">
        <div className="flex justify-between items-center p-6 border-b">
          <h2 className="text-2xl font-bold">
            {mode === 'create' ? 'Create New Fee Structure' : 'Edit Fee Structure'}
          </h2>
          <Button variant="outline" size="sm" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </div>

        <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="mb-6">
              <TabsTrigger value="basic">Basic Info</TabsTrigger>
              <TabsTrigger value="terms">Term Structure</TabsTrigger>
              <TabsTrigger value="preview">Preview</TabsTrigger>
            </TabsList>

            {/* Basic Information Tab */}
            <TabsContent value="basic" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Basic Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="name">Fee Structure Name</Label>
                      <Input
                        id="name"
                        value={formData.name}
                        onChange={(e) => updateFormData('name', e.target.value)}
                        placeholder="e.g., Grade 1 Day Student Fee Structure"
                      />
                    </div>
                    <div>
                      <Label htmlFor="grade">Grade/Form</Label>
                      <Select value={formData.grade} onValueChange={(value) => updateFormData('grade', value)}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select grade" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Grade 1">Grade 1</SelectItem>
                          <SelectItem value="Grade 2">Grade 2</SelectItem>
                          <SelectItem value="Grade 3">Grade 3</SelectItem>
                          <SelectItem value="Form 1">Form 1</SelectItem>
                          <SelectItem value="Form 2">Form 2</SelectItem>
                          <SelectItem value="Form 3">Form 3</SelectItem>
                          <SelectItem value="Form 4">Form 4</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="boardingType">Boarding Type</Label>
                      <Select 
                        value={formData.boardingType} 
                        onValueChange={(value) => updateFormData('boardingType', value)}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="day">Day Students</SelectItem>
                          <SelectItem value="boarding">Boarding Students</SelectItem>
                          <SelectItem value="both">Both Day & Boarding</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="academicYear">Academic Year</Label>
                      <Input
                        id="academicYear"
                        value={formData.academicYear}
                        onChange={(e) => updateFormData('academicYear', e.target.value)}
                        placeholder="2024"
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Term Structure Tab */}
            <TabsContent value="terms" className="space-y-6">
              {formData.termStructures.map((termStructure, termIndex) => (
                <Card key={termIndex}>
                  <CardHeader>
                    <div className="flex justify-between items-center">
                      <CardTitle className="flex items-center gap-2">
                        <Calendar className="h-5 w-5" />
                        {termStructure.term}
                        <Badge variant="outline">
                          KES {calculateTermTotal(termStructure).toLocaleString()}
                        </Badge>
                      </CardTitle>
                      {formData.termStructures.length > 1 && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => removeTermStructure(termIndex)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {/* Term Basic Info */}
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                      <div>
                        <Label>Due Date</Label>
                        <Input
                          type="date"
                          value={termStructure.dueDate}
                          onChange={(e) => updateTermStructure(termIndex, 'dueDate', e.target.value)}
                        />
                      </div>
                      <div>
                        <Label>Late Payment Fee</Label>
                        <Input
                          type="number"
                          value={termStructure.latePaymentFee}
                          onChange={(e) => updateTermStructure(termIndex, 'latePaymentFee', e.target.value)}
                          placeholder="2000"
                        />
                      </div>
                      <div>
                        <Label>Early Payment Discount</Label>
                        <Input
                          type="number"
                          value={termStructure.earlyPaymentDiscount}
                          onChange={(e) => updateTermStructure(termIndex, 'earlyPaymentDiscount', e.target.value)}
                          placeholder="1500"
                        />
                      </div>
                      <div>
                        <Label>Early Payment Deadline</Label>
                        <Input
                          type="date"
                          value={termStructure.earlyPaymentDeadline}
                          onChange={(e) => updateTermStructure(termIndex, 'earlyPaymentDeadline', e.target.value)}
                        />
                      </div>
                    </div>

                    {/* Fee Buckets */}
                    <div className="space-y-6">
                      <div className="flex justify-between items-center">
                        <h4 className="font-medium flex items-center gap-2">
                          <Coins className="h-5 w-5 text-primary" />
                          Fee Buckets
                        </h4>
                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => addBucket(termIndex)}
                          >
                            <Plus className="h-4 w-4 mr-1" />
                            Add Empty Bucket
                          </Button>
                        </div>
                      </div>

                      {/* Smart Suggestions Section */}
                      {formData.grade && formData.boardingType && (
                        <div className="bg-blue-50 border border-blue-200 p-4 rounded-lg">
                          <div className="flex items-center gap-2 mb-3">
                            <Lightbulb className="h-5 w-5 text-blue-600" />
                            <h5 className="font-medium text-blue-800">Smart Suggestions for {formData.grade} ({formData.boardingType})</h5>
                          </div>
                          
                          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 mb-4">
                            {Object.entries(feeBucketTemplates).map(([key, template]) => {
                              const iconMap = {
                                tuition: School,
                                transport: Bus,
                                meals: Utensils,
                                boarding: Home,
                                activities: Activity,
                                development: GraduationCap
                              }
                              const Icon = iconMap[key as keyof typeof iconMap] || Book
                              
                              return (
                                <div key={key} className="bg-white border border-blue-200 rounded-lg p-3 hover:shadow-md transition-shadow">
                                  <div className="flex items-start justify-between mb-2">
                                    <div className="flex items-center gap-2">
                                      <Icon className="h-4 w-4 text-blue-600" />
                                      <span className="font-medium text-sm">{template.name}</span>
                                    </div>
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      className="h-6 w-6 p-0"
                                      onClick={() => addTemplateBucket(termIndex, key)}
                                    >
                                      <Plus className="h-3 w-3" />
                                    </Button>
                                  </div>
                                  <p className="text-xs text-gray-600 mb-2">{template.description}</p>
                                  <div className="flex flex-wrap gap-1">
                                    {template.components.slice(0, 2).map((comp, i) => (
                                      <Badge key={i} variant="outline" className="text-xs">
                                        {comp.name}
                                      </Badge>
                                    ))}
                                    {template.components.length > 2 && (
                                      <Badge variant="outline" className="text-xs">
                                        +{template.components.length - 2} more
                                      </Badge>
                                    )}
                                  </div>
                                </div>
                              )
                            })}
                          </div>
                          
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2 text-sm text-blue-700">
                              <Info className="h-4 w-4" />
                              <span>Quick setup with all suggested buckets</span>
                            </div>
                            <Button
                              variant="default"
                              size="sm"
                              onClick={() => addAllSuggestedBuckets(termIndex)}
                              className="bg-blue-600 hover:bg-blue-700"
                            >
                              <Copy className="h-4 w-4 mr-1" />
                              Add All Suggested
                            </Button>
                          </div>
                        </div>
                      )}

                      {termStructure.buckets.map((bucket, bucketIndex) => (
                        <Card key={bucketIndex} className="border-l-4 border-l-blue-500">
                          <CardHeader className="pb-3">
                            <div className="flex justify-between items-center">
                              <div className="flex items-center gap-2">
                                <Coins className="h-4 w-4" />
                                <span className="font-medium">{bucket.name || 'Unnamed Bucket'}</span>
                                <Badge variant="outline">
                                  KES {calculateBucketTotal(bucket).toLocaleString()}
                                </Badge>
                                {bucket.isOptional && <Badge variant="secondary">Optional</Badge>}
                              </div>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => removeBucket(termIndex, bucketIndex)}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </CardHeader>
                          <CardContent className="space-y-4">
                            {/* Bucket Basic Info */}
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                              <div>
                                <Label>Bucket Type</Label>
                                <Select
                                  value={bucket.type}
                                  onValueChange={(value) => updateBucket(termIndex, bucketIndex, 'type', value)}
                                >
                                  <SelectTrigger>
                                    <SelectValue />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="tuition">Tuition</SelectItem>
                                    <SelectItem value="transport">Transport</SelectItem>
                                    <SelectItem value="meals">Meals</SelectItem>
                                    <SelectItem value="boarding">Boarding</SelectItem>
                                  </SelectContent>
                                </Select>
                              </div>
                              <div>
                                <Label>Bucket Name</Label>
                                <Input
                                  value={bucket.name}
                                  onChange={(e) => updateBucket(termIndex, bucketIndex, 'name', e.target.value)}
                                  placeholder="e.g., Tuition & Academic Fees"
                                />
                              </div>
                              <div className="flex items-center space-x-2 pt-6">
                                <Checkbox
                                  id={`optional-${termIndex}-${bucketIndex}`}
                                  checked={bucket.isOptional}
                                  onCheckedChange={(checked) => 
                                    updateBucket(termIndex, bucketIndex, 'isOptional', checked)
                                  }
                                />
                                <Label htmlFor={`optional-${termIndex}-${bucketIndex}`}>
                                  Optional
                                </Label>
                              </div>
                            </div>
                            <div>
                              <Label>Description</Label>
                              <Textarea
                                value={bucket.description}
                                onChange={(e) => updateBucket(termIndex, bucketIndex, 'description', e.target.value)}
                                placeholder="Describe what this bucket covers"
                              />
                            </div>

                            {/* Fee Components */}
                            <div className="space-y-4">
                              <div className="flex justify-between items-center">
                                <h5 className="font-medium flex items-center gap-2">
                                  <Calculator className="h-4 w-4 text-primary" />
                                  Fee Components
                                  <Badge variant="outline" className="text-xs">
                                    {bucket.components.length} items
                                  </Badge>
                                </h5>
                                <div className="flex gap-2">
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => addComponent(termIndex, bucketIndex)}
                                  >
                                    <Plus className="h-4 w-4 mr-1" />
                                    Add Component
                                  </Button>
                                </div>
                              </div>

                              {/* Quick component suggestions */}
                              {bucket.components.length === 0 && (
                                <div className="bg-gray-50 border border-gray-200 p-4 rounded-lg">
                                  <div className="flex items-center gap-2 mb-3">
                                    <Lightbulb className="h-4 w-4 text-gray-600" />
                                    <h6 className="font-medium text-gray-700">Common components for {bucket.type}:</h6>
                                  </div>
                                  <div className="flex flex-wrap gap-2">
                                    {(() => {
                                      const commonComponents = {
                                        tuition: ['Tuition Fees', 'Library Fees', 'Computer Lab', 'Examination Fees'],
                                        transport: ['Bus Fees', 'Fuel Surcharge', 'Route Fees'],
                                        meals: ['Lunch Fees', 'Snack Fees', 'Breakfast'],
                                        boarding: ['Boarding Fees', 'Laundry Service', 'Evening Meals', 'Room Service'],
                                        activities: ['Sports Fees', 'Music & Arts', 'Clubs & Societies'],
                                        development: ['Building Fund', 'Equipment Fund', 'Technology Fund']
                                      }
                                      return (commonComponents[bucket.type as keyof typeof commonComponents] || []).map((comp, i) => (
                                        <Button
                                          key={i}
                                          variant="ghost"
                                          size="sm"
                                          className="h-7 text-xs text-gray-600 hover:text-primary"
                                          onClick={() => {
                                            addComponent(termIndex, bucketIndex)
                                            // Set the component name after adding
                                            setTimeout(() => {
                                              const lastComponentIndex = bucket.components.length
                                              updateComponent(termIndex, bucketIndex, lastComponentIndex, 'name', comp)
                                            }, 100)
                                          }}
                                        >
                                          <Plus className="h-3 w-3 mr-1" />
                                          {comp}
                                        </Button>
                                      ))
                                    })()}
                                  </div>
                                </div>
                              )}

                              {bucket.components.map((component, componentIndex) => (
                                <div key={componentIndex} className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-sm transition-shadow">
                                  <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                                    <div>
                                      <Label className="text-sm font-medium">Component Name</Label>
                                      <Input
                                        value={component.name}
                                        onChange={(e) => updateComponent(termIndex, bucketIndex, componentIndex, 'name', e.target.value)}
                                        placeholder="e.g., Tuition Fees"
                                        className="mt-1"
                                      />
                                    </div>
                                    <div>
                                      <Label className="text-sm font-medium">Amount (KES)</Label>
                                      <Input
                                        type="number"
                                        value={component.amount}
                                        onChange={(e) => updateComponent(termIndex, bucketIndex, componentIndex, 'amount', e.target.value)}
                                        placeholder="18000"
                                        className="mt-1"
                                      />
                                    </div>
                                    <div>
                                      <Label className="text-sm font-medium">Category</Label>
                                      <Select
                                        value={component.category}
                                        onValueChange={(value) => updateComponent(termIndex, bucketIndex, componentIndex, 'category', value)}
                                      >
                                        <SelectTrigger className="mt-1">
                                          <SelectValue placeholder="Select category" />
                                        </SelectTrigger>
                                        <SelectContent>
                                          <SelectItem value="academic">Academic</SelectItem>
                                          <SelectItem value="transport">Transport</SelectItem>
                                          <SelectItem value="meals">Meals</SelectItem>
                                          <SelectItem value="boarding">Boarding</SelectItem>
                                          <SelectItem value="sports">Sports</SelectItem>
                                          <SelectItem value="arts">Arts</SelectItem>
                                          <SelectItem value="activities">Activities</SelectItem>
                                          <SelectItem value="infrastructure">Infrastructure</SelectItem>
                                          <SelectItem value="technology">Technology</SelectItem>
                                          <SelectItem value="assessment">Assessment</SelectItem>
                                          <SelectItem value="graduation">Graduation</SelectItem>
                                        </SelectContent>
                                      </Select>
                                    </div>
                                    <div>
                                      <Label className="text-sm font-medium">Description</Label>
                                      <Input
                                        value={component.description}
                                        onChange={(e) => updateComponent(termIndex, bucketIndex, componentIndex, 'description', e.target.value)}
                                        placeholder="Brief description"
                                        className="mt-1"
                                      />
                                    </div>
                                    <div className="flex items-end justify-between">
                                      <div className="text-right">
                                        <div className="text-sm font-medium text-gray-900">
                                          KES {parseFloat(component.amount || '0').toLocaleString()}
                                        </div>
                                        <div className="text-xs text-gray-500">Amount</div>
                                      </div>
                                      <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => removeComponent(termIndex, bucketIndex, componentIndex)}
                                        className="text-red-500 hover:text-red-700 hover:bg-red-50"
                                      >
                                        <Trash2 className="h-4 w-4" />
                                      </Button>
                                    </div>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                      
                      {/* Term Summary */}
                      {termStructure.buckets.length > 0 && (
                        <div className="bg-green-50 border border-green-200 p-4 rounded-lg">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <CheckCircle className="h-5 w-5 text-green-600" />
                              <span className="font-medium text-green-800">Term Summary</span>
                            </div>
                            <div className="text-right">
                              <div className="text-lg font-bold text-green-800">
                                KES {calculateTermTotal(termStructure).toLocaleString()}
                              </div>
                              <div className="text-sm text-green-600">
                                {termStructure.buckets.length} bucket{termStructure.buckets.length !== 1 ? 's' : ''} • {termStructure.buckets.reduce((sum, bucket) => sum + bucket.components.length, 0)} components
                              </div>
                            </div>
                          </div>
                          
                          {/* Breakdown */}
                          <div className="mt-3 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
                            {termStructure.buckets.map((bucket, bucketIndex) => (
                              <div key={bucketIndex} className="flex items-center justify-between bg-white p-2 rounded border">
                                <span className="text-sm text-gray-700 truncate">{bucket.name}</span>
                                <span className="text-sm font-medium text-gray-900">
                                  KES {calculateBucketTotal(bucket).toLocaleString()}
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}

              <Button onClick={addTermStructure} variant="outline" className="w-full">
                <Plus className="h-4 w-4 mr-2" />
                Add Another Term
              </Button>
            </TabsContent>

            {/* Preview Tab */}
            <TabsContent value="preview" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Fee Structure Preview</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label className="text-sm font-semibold text-slate-700 mb-1 block">Structure Name:</Label>
                        <p className="text-base text-slate-900 font-medium">{formData.name || 'Unnamed Structure'}</p>
                      </div>
                      <div className="bg-primary/5 border-2 border-primary/10 p-3">
                        <Label className="text-xs font-semibold text-primary/70 uppercase tracking-wide mb-2 block">Select Grade:</Label>
                        <p className="text-lg font-bold text-primary">{formData.grade || 'Not selected'}</p>
                      </div>
                      <div>
                        <Label className="text-sm font-semibold text-slate-700 mb-1 block">Boarding Type:</Label>
                        <p className="text-base text-slate-900 font-medium capitalize">{formData.boardingType}</p>
                      </div>
                      <div>
                        <Label className="text-sm font-semibold text-slate-700 mb-1 block">Academic Year:</Label>
                        <p className="text-base text-slate-900 font-medium">{formData.academicYear}</p>
                      </div>
                    </div>

                    {formData.termStructures.map((term, index) => (
                      <div key={index} className="border rounded-lg p-4">
                        <h4 className="font-medium mb-2">{term.term}</h4>
                        <p className="text-sm text-gray-600 mb-3">
                          Total: KES {calculateTermTotal(term).toLocaleString()}
                        </p>
                        <div className="space-y-2">
                          {term.buckets.map((bucket, bucketIndex) => (
                            <div key={bucketIndex} className="flex justify-between items-center p-2 bg-gray-50 rounded">
                              <span>{bucket.name}</span>
                              <span className="font-medium">KES {calculateBucketTotal(bucket).toLocaleString()}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>

        <div className="flex justify-end gap-2 p-6 border-t">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleSave}>
            <Save className="h-4 w-4 mr-2" />
            {mode === 'create' ? 'Create Structure' : 'Save Changes'}
          </Button>
        </div>
      </div>
    </div>
  )
}
