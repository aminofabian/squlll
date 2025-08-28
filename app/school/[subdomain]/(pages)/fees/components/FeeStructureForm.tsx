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
  DollarSign,
  Calendar,
  Users,
  BookOpen
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
                    <div className="space-y-4">
                      <div className="flex justify-between items-center">
                        <h4 className="font-medium">Fee Buckets</h4>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => addBucket(termIndex)}
                        >
                          <Plus className="h-4 w-4 mr-1" />
                          Add Bucket
                        </Button>
                      </div>

                      {termStructure.buckets.map((bucket, bucketIndex) => (
                        <Card key={bucketIndex} className="border-l-4 border-l-blue-500">
                          <CardHeader className="pb-3">
                            <div className="flex justify-between items-center">
                              <div className="flex items-center gap-2">
                                <DollarSign className="h-4 w-4" />
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
                            <div className="space-y-3">
                              <div className="flex justify-between items-center">
                                <h5 className="font-medium">Fee Components</h5>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => addComponent(termIndex, bucketIndex)}
                                >
                                  <Plus className="h-4 w-4 mr-1" />
                                  Add Component
                                </Button>
                              </div>

                              {bucket.components.map((component, componentIndex) => (
                                <div key={componentIndex} className="grid grid-cols-1 md:grid-cols-5 gap-3 p-3 border rounded">
                                  <div>
                                    <Label>Name</Label>
                                    <Input
                                      value={component.name}
                                      onChange={(e) => updateComponent(termIndex, bucketIndex, componentIndex, 'name', e.target.value)}
                                      placeholder="e.g., Tuition"
                                    />
                                  </div>
                                  <div>
                                    <Label>Amount</Label>
                                    <Input
                                      type="number"
                                      value={component.amount}
                                      onChange={(e) => updateComponent(termIndex, bucketIndex, componentIndex, 'amount', e.target.value)}
                                      placeholder="18000"
                                    />
                                  </div>
                                  <div>
                                    <Label>Category</Label>
                                    <Input
                                      value={component.category}
                                      onChange={(e) => updateComponent(termIndex, bucketIndex, componentIndex, 'category', e.target.value)}
                                      placeholder="academic"
                                    />
                                  </div>
                                  <div>
                                    <Label>Description</Label>
                                    <Input
                                      value={component.description}
                                      onChange={(e) => updateComponent(termIndex, bucketIndex, componentIndex, 'description', e.target.value)}
                                      placeholder="Core teaching fees"
                                    />
                                  </div>
                                  <div className="flex items-end">
                                    <Button
                                      variant="outline"
                                      size="sm"
                                      onClick={() => removeComponent(termIndex, bucketIndex, componentIndex)}
                                    >
                                      <Trash2 className="h-4 w-4" />
                                    </Button>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </CardContent>
                        </Card>
                      ))}
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
                        <Label className="font-medium">Structure Name:</Label>
                        <p>{formData.name || 'Unnamed Structure'}</p>
                      </div>
                      <div>
                        <Label className="font-medium">Grade:</Label>
                        <p>{formData.grade || 'Not selected'}</p>
                      </div>
                      <div>
                        <Label className="font-medium">Boarding Type:</Label>
                        <p className="capitalize">{formData.boardingType}</p>
                      </div>
                      <div>
                        <Label className="font-medium">Academic Year:</Label>
                        <p>{formData.academicYear}</p>
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
