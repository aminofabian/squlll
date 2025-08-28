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
import { Progress } from "@/components/ui/progress"
import { 
  Send, 
  X, 
  Users, 
  DollarSign, 
  Calendar,
  FileText,
  CheckCircle,
  AlertTriangle
} from 'lucide-react'
import { FeeStructure, Grade, BulkInvoiceGeneration } from '../types'
import { mockFeeStructures, mockGrades } from '../data/mockData'

interface BulkInvoiceGeneratorProps {
  isOpen: boolean
  onClose: () => void
  onGenerate: (generation: BulkInvoiceGeneration) => void
  preselectedStructureId?: string
  preselectedTerm?: string
}

export const BulkInvoiceGenerator = ({
  isOpen,
  onClose,
  onGenerate,
  preselectedStructureId,
  preselectedTerm
}: BulkInvoiceGeneratorProps) => {
  const [feeStructures] = useState<FeeStructure[]>(mockFeeStructures)
  const [grades] = useState<Grade[]>(mockGrades)
  const [isGenerating, setIsGenerating] = useState(false)
  const [generationProgress, setGenerationProgress] = useState(0)
  const [generationComplete, setGenerationComplete] = useState(false)

  const [formData, setFormData] = useState<BulkInvoiceGeneration>({
    feeStructureId: preselectedStructureId || '',
    term: (preselectedTerm as 'Term 1' | 'Term 2' | 'Term 3') || 'Term 1',
    gradeIds: [],
    studentIds: [],
    generateDate: new Date().toISOString().split('T')[0],
    dueDate: '',
    includeOptionalFees: false,
    selectedBuckets: [],
    customMessage: ''
  })

  const selectedStructure = feeStructures.find(fs => fs.id === formData.feeStructureId)
  const selectedTermStructure = selectedStructure?.termStructures.find(ts => ts.term === formData.term)
  const availableGrades = grades.filter(grade => grade.feeStructureId === formData.feeStructureId)
  const selectedGrades = grades.filter(grade => formData.gradeIds.includes(grade.id))
  const totalStudents = selectedGrades.reduce((sum, grade) => sum + grade.studentCount, 0)

  const updateFormData = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const toggleGrade = (gradeId: string) => {
    setFormData(prev => ({
      ...prev,
      gradeIds: prev.gradeIds.includes(gradeId)
        ? prev.gradeIds.filter(id => id !== gradeId)
        : [...prev.gradeIds, gradeId]
    }))
  }

  const toggleBucket = (bucketId: string) => {
    setFormData(prev => ({
      ...prev,
      selectedBuckets: prev.selectedBuckets.includes(bucketId)
        ? prev.selectedBuckets.filter(id => id !== bucketId)
        : [...prev.selectedBuckets, bucketId]
    }))
  }

  const selectAllGrades = () => {
    setFormData(prev => ({
      ...prev,
      gradeIds: availableGrades.map(grade => grade.id)
    }))
  }

  const selectAllBuckets = () => {
    if (selectedTermStructure) {
      setFormData(prev => ({
        ...prev,
        selectedBuckets: selectedTermStructure.buckets.map(bucket => bucket.id)
      }))
    }
  }

  const calculateTotalAmount = () => {
    if (!selectedTermStructure) return 0
    return selectedTermStructure.buckets
      .filter(bucket => formData.selectedBuckets.includes(bucket.id))
      .reduce((sum, bucket) => sum + bucket.amount, 0)
  }

  const handleGenerate = async () => {
    setIsGenerating(true)
    setGenerationProgress(0)

    // Simulate invoice generation progress
    const interval = setInterval(() => {
      setGenerationProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval)
          setIsGenerating(false)
          setGenerationComplete(true)
          return 100
        }
        return prev + 10
      })
    }, 200)

    // Call the actual generation function
    onGenerate(formData)
  }

  const handleReset = () => {
    setGenerationComplete(false)
    setGenerationProgress(0)
    setFormData({
      feeStructureId: preselectedStructureId || '',
      term: (preselectedTerm as 'Term 1' | 'Term 2' | 'Term 3') || 'Term 1',
      gradeIds: [],
      studentIds: [],
      generateDate: new Date().toISOString().split('T')[0],
      dueDate: '',
      includeOptionalFees: false,
      selectedBuckets: [],
      customMessage: ''
    })
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg w-full max-w-4xl max-h-[90vh] overflow-hidden">
        <div className="flex justify-between items-center p-6 border-b">
          <h2 className="text-2xl font-bold">Generate Term Invoices</h2>
          <Button variant="outline" size="sm" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </div>

        <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
          {generationComplete ? (
            // Success State
            <div className="text-center space-y-6">
              <div className="flex justify-center">
                <CheckCircle className="h-16 w-16 text-green-500" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-green-700">Invoices Generated Successfully!</h3>
                <p className="text-gray-600 mt-2">
                  {totalStudents} invoices have been generated and are ready to be sent to parents.
                </p>
              </div>
              <div className="grid grid-cols-2 gap-4 max-w-md mx-auto">
                <div className="text-center p-4 bg-green-50 rounded-lg">
                  <p className="text-2xl font-bold text-green-700">{totalStudents}</p>
                  <p className="text-sm text-gray-600">Invoices Created</p>
                </div>
                <div className="text-center p-4 bg-blue-50 rounded-lg">
                  <p className="text-2xl font-bold text-blue-700">
                    KES {(calculateTotalAmount() * totalStudents).toLocaleString()}
                  </p>
                  <p className="text-sm text-gray-600">Total Amount</p>
                </div>
              </div>
              <div className="flex gap-2 justify-center">
                <Button onClick={handleReset} variant="outline">
                  Generate More
                </Button>
                <Button onClick={onClose}>
                  Close
                </Button>
              </div>
            </div>
          ) : isGenerating ? (
            // Generating State
            <div className="text-center space-y-6">
              <div className="flex justify-center">
                <FileText className="h-16 w-16 text-blue-500 animate-pulse" />
              </div>
              <div>
                <h3 className="text-xl font-bold">Generating Invoices...</h3>
                <p className="text-gray-600 mt-2">
                  Creating {totalStudents} invoices for {formData.term}
                </p>
              </div>
              <div className="max-w-md mx-auto">
                <Progress value={generationProgress} className="h-3" />
                <p className="text-sm text-gray-600 mt-2">{generationProgress}% Complete</p>
              </div>
            </div>
          ) : (
            // Form State
            <div className="space-y-6">
              {/* Fee Structure Selection */}
              <Card>
                <CardHeader>
                  <CardTitle>Select Fee Structure & Term</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label>Fee Structure</Label>
                      <Select 
                        value={formData.feeStructureId} 
                        onValueChange={(value) => updateFormData('feeStructureId', value)}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select fee structure" />
                        </SelectTrigger>
                        <SelectContent>
                          {feeStructures.map(structure => (
                            <SelectItem key={structure.id} value={structure.id}>
                              {structure.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label>Term</Label>
                      <Select 
                        value={formData.term} 
                        onValueChange={(value) => updateFormData('term', value)}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {selectedStructure?.termStructures.map(term => (
                            <SelectItem key={term.id} value={term.term}>
                              {term.term}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  {selectedStructure && (
                    <div className="p-4 bg-gray-50 rounded-lg">
                      <h4 className="font-medium mb-2">{selectedStructure.name}</h4>
                      <div className="grid grid-cols-3 gap-4 text-sm">
                        <div>
                          <span className="text-gray-600">Grade:</span> {selectedStructure.grade}
                        </div>
                        <div>
                          <span className="text-gray-600">Type:</span> {selectedStructure.boardingType}
                        </div>
                        <div>
                          <span className="text-gray-600">Year:</span> {selectedStructure.academicYear}
                        </div>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Grade Selection */}
              {availableGrades.length > 0 && (
                <Card>
                  <CardHeader>
                    <div className="flex justify-between items-center">
                      <CardTitle>Select Classes</CardTitle>
                      <Button variant="outline" size="sm" onClick={selectAllGrades}>
                        Select All
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {availableGrades.map(grade => (
                        <div key={grade.id} className="flex items-center space-x-3 p-3 border rounded-lg">
                          <Checkbox
                            id={grade.id}
                            checked={formData.gradeIds.includes(grade.id)}
                            onCheckedChange={() => toggleGrade(grade.id)}
                          />
                          <div className="flex-1">
                            <Label htmlFor={grade.id} className="font-medium">
                              {grade.name} - Section {grade.section}
                            </Label>
                            <p className="text-sm text-gray-600">
                              {grade.studentCount} students • {grade.boardingType}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Fee Buckets Selection */}
              {selectedTermStructure && (
                <Card>
                  <CardHeader>
                    <div className="flex justify-between items-center">
                      <CardTitle>Select Fee Components</CardTitle>
                      <Button variant="outline" size="sm" onClick={selectAllBuckets}>
                        Select All
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {selectedTermStructure.buckets.map(bucket => (
                        <div key={bucket.id} className="flex items-center space-x-3 p-3 border rounded-lg">
                          <Checkbox
                            id={bucket.id}
                            checked={formData.selectedBuckets.includes(bucket.id)}
                            onCheckedChange={() => toggleBucket(bucket.id)}
                          />
                          <div className="flex-1">
                            <div className="flex items-center gap-2">
                              <Label htmlFor={bucket.id} className="font-medium">
                                {bucket.name}
                              </Label>
                              <Badge variant="outline">
                                KES {bucket.amount.toLocaleString()}
                              </Badge>
                              {bucket.isOptional && <Badge variant="secondary">Optional</Badge>}
                            </div>
                            <p className="text-sm text-gray-600">{bucket.description}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Invoice Settings */}
              <Card>
                <CardHeader>
                  <CardTitle>Invoice Settings</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label>Generation Date</Label>
                      <Input
                        type="date"
                        value={formData.generateDate}
                        onChange={(e) => updateFormData('generateDate', e.target.value)}
                      />
                    </div>
                    <div>
                      <Label>Due Date</Label>
                      <Input
                        type="date"
                        value={formData.dueDate}
                        onChange={(e) => updateFormData('dueDate', e.target.value)}
                      />
                    </div>
                  </div>
                  <div>
                    <Label>Custom Message (Optional)</Label>
                    <Textarea
                      value={formData.customMessage}
                      onChange={(e) => updateFormData('customMessage', e.target.value)}
                      placeholder="Add a custom message to include in the invoices..."
                      rows={3}
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Summary */}
              {formData.gradeIds.length > 0 && formData.selectedBuckets.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle>Generation Summary</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div className="text-center p-3 bg-blue-50 rounded-lg">
                        <Users className="h-6 w-6 text-blue-500 mx-auto mb-1" />
                        <p className="text-lg font-bold text-blue-700">{totalStudents}</p>
                        <p className="text-xs text-gray-600">Students</p>
                      </div>
                      <div className="text-center p-3 bg-green-50 rounded-lg">
                        <DollarSign className="h-6 w-6 text-green-500 mx-auto mb-1" />
                        <p className="text-lg font-bold text-green-700">
                          KES {calculateTotalAmount().toLocaleString()}
                        </p>
                        <p className="text-xs text-gray-600">Per Student</p>
                      </div>
                      <div className="text-center p-3 bg-purple-50 rounded-lg">
                        <FileText className="h-6 w-6 text-purple-500 mx-auto mb-1" />
                        <p className="text-lg font-bold text-purple-700">{totalStudents}</p>
                        <p className="text-xs text-gray-600">Invoices</p>
                      </div>
                      <div className="text-center p-3 bg-orange-50 rounded-lg">
                        <Calendar className="h-6 w-6 text-orange-500 mx-auto mb-1" />
                        <p className="text-lg font-bold text-orange-700">
                          KES {(calculateTotalAmount() * totalStudents).toLocaleString()}
                        </p>
                        <p className="text-xs text-gray-600">Total Amount</p>
                      </div>
                    </div>

                    {!formData.dueDate && (
                      <div className="flex items-center gap-2 mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                        <AlertTriangle className="h-5 w-5 text-yellow-600" />
                        <p className="text-sm text-yellow-700">
                          Please set a due date before generating invoices.
                        </p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              )}
            </div>
          )}
        </div>

        {!generationComplete && !isGenerating && (
          <div className="flex justify-end gap-2 p-6 border-t">
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button 
              onClick={handleGenerate}
              disabled={formData.gradeIds.length === 0 || formData.selectedBuckets.length === 0 || !formData.dueDate}
            >
              <Send className="h-4 w-4 mr-2" />
              Generate {totalStudents} Invoices
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}
