'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { 
  Plus, 
  Edit, 
  Copy, 
  Trash2, 
  Users, 
  DollarSign, 
  Calendar,
  Settings,
  FileText,
  Send
} from 'lucide-react'
import { FeeStructure, Grade } from '../types'
import { mockFeeStructures, mockGrades } from '../data/mockData'
import { useFeeStructureItemsQuery, useFeeStructureItemsStore, type GraphQLFeeStructureItem } from '@/lib/stores/useFeeStructureItemsStore'

interface FeeStructureManagerProps {
  onCreateNew: () => void
  onEdit: (feeStructure: FeeStructure) => void
  onGenerateInvoices: (feeStructureId: string, term: string) => void
  onAssignToGrade: (feeStructureId: string) => void
}

export const FeeStructureManager = ({
  onCreateNew,
  onEdit,
  onGenerateInvoices,
  onAssignToGrade
}: FeeStructureManagerProps) => {
  const [selectedTab, setSelectedTab] = useState('structures')
  const [feeStructures] = useState<FeeStructure[]>(mockFeeStructures)
  const [grades] = useState<Grade[]>(mockGrades)

  // Live fee structure items (GraphQL)
  const { fetchFeeStructureItems } = useFeeStructureItemsQuery()
  const { items, isLoading } = useFeeStructureItemsStore()

  const didFetchRef = useRef(false)
  useEffect(() => {
    if (didFetchRef.current) return
    didFetchRef.current = true
    fetchFeeStructureItems().catch(() => {})
  }, [])

  // Group items into structures for display
  const groupedStructures = useMemo(() => {
    if (!items || items.length === 0) return [] as Array<{
      structureId: string
      structureName: string
      academicYear: string
      termName: string
      buckets: Array<{ id: string; name: string; totalAmount: number; isOptional: boolean }>
    }>

    const map = new Map<string, {
      structureId: string
      structureName: string
      academicYear: string
      termName: string
      buckets: Map<string, { id: string; name: string; totalAmount: number; isOptional: boolean }>
    }>()

    items.forEach((item: GraphQLFeeStructureItem) => {
      const key = item.feeStructure.id
      if (!map.has(key)) {
        map.set(key, {
          structureId: item.feeStructure.id,
          structureName: item.feeStructure.name,
          academicYear: item.feeStructure.academicYear?.name || '',
          termName: item.feeStructure.term?.name || '',
          buckets: new Map(),
        })
      }
      const entry = map.get(key)!

      const bucketKey = item.feeBucket.id
      const existingBucket = entry.buckets.get(bucketKey)
      if (existingBucket) {
        existingBucket.totalAmount += item.amount
        // Keep isOptional=false if any item is mandatory
        existingBucket.isOptional = existingBucket.isOptional && !item.isMandatory
      } else {
        entry.buckets.set(bucketKey, {
          id: item.feeBucket.id,
          name: item.feeBucket.name,
          totalAmount: item.amount,
          isOptional: !item.isMandatory,
        })
      }
    })

    return Array.from(map.values()).map(v => ({
      structureId: v.structureId,
      structureName: v.structureName,
      academicYear: v.academicYear,
      termName: v.termName,
      buckets: Array.from(v.buckets.values()),
    }))
  }, [items])

  const getAssignedGrades = (feeStructureId: string) => {
    return grades.filter(grade => grade.feeStructureId === feeStructureId)
  }

  const getTotalStudents = (feeStructureId: string) => {
    return getAssignedGrades(feeStructureId).reduce((sum, grade) => sum + grade.studentCount, 0)
  }

  const getBoardingTypeColor = (type: string) => {
    switch (type) {
      case 'day': return 'bg-blue-100 text-blue-800'
      case 'boarding': return 'bg-green-100 text-green-800'
      case 'both': return 'bg-purple-100 text-purple-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Fee Structure Management</h2>
          <p className="text-gray-600">Manage fee structures, assign to grades, and generate invoices</p>
        </div>
        <Button onClick={onCreateNew} className="flex items-center gap-2">
          <Plus className="h-4 w-4" />
          Create New Structure
        </Button>
      </div>

      <Tabs value={selectedTab} onValueChange={setSelectedTab}>
        <TabsList>
          <TabsTrigger value="structures">Fee Structures</TabsTrigger>
          <TabsTrigger value="grades">Grade Assignments</TabsTrigger>
          <TabsTrigger value="invoices">Invoice Generation</TabsTrigger>
        </TabsList>

        {/* Fee Structures Tab */}
        <TabsContent value="structures" className="space-y-4">
          <div className="grid gap-4">
            {/* Prefer live data if available; fallback to mock */}
            {(groupedStructures.length > 0 ? groupedStructures : []).map((structure) => (
              <Card key={structure.structureId} className="hover:shadow-md transition-shadow">
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="flex items-center gap-2">
                        {structure.structureName}
                        <Badge variant="outline">{structure.termName || 'Term'}</Badge>
                      </CardTitle>
                      <p className="text-sm text-gray-600">
                        {structure.academicYear}
                      </p>
                    </div>
                    <div className="flex gap-2" />
                  </div>
                </CardHeader>
                <CardContent>
                  {/* Fee Buckets Preview from live data */}
                  <div className="space-y-2">
                    <h4 className="text-sm font-medium">Fee Buckets:</h4>
                    <div className="flex flex-wrap gap-2">
                      {structure.buckets.map((bucket) => (
                        <Badge key={bucket.id} variant="outline" className="text-xs">
                          {bucket.name}: KES {bucket.totalAmount.toLocaleString()}
                          {bucket.isOptional && ' (Optional)'}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex gap-2 mt-4">
                    <Button variant="outline" size="sm" disabled>
                      <Users className="h-4 w-4 mr-1" />
                      Assign to Grade
                    </Button>
                    <Button variant="outline" size="sm" disabled>
                      <FileText className="h-4 w-4 mr-1" />
                      Generate Invoices
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
            {groupedStructures.length === 0 && (
              <div className="grid gap-4">
                {feeStructures.map((structure) => (
                  <Card key={structure.id} className="hover:shadow-md transition-shadow">
                    <CardHeader>
                      <div className="flex justify-between items-start">
                        <div>
                          <CardTitle className="flex items-center gap-2">
                            {structure.name}
                            <Badge className={getBoardingTypeColor(structure.boardingType)}>
                              {structure.boardingType}
                            </Badge>
                            {structure.isActive ? (
                              <Badge variant="default">Active</Badge>
                            ) : (
                              <Badge variant="secondary">Inactive</Badge>
                            )}
                          </CardTitle>
                          <p className="text-sm text-gray-600">
                            {structure.grade} • {structure.academicYear}
                          </p>
                        </div>
                        <div className="flex gap-2">
                          <Button variant="outline" size="sm" onClick={() => onEdit(structure)}>
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button variant="outline" size="sm">
                            <Copy className="h-4 w-4" />
                          </Button>
                          <Button variant="outline" size="sm">
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                        <div className="flex items-center gap-2">
                          <Users className="h-4 w-4 text-blue-500" />
                          <div>
                            <p className="text-sm font-medium">{getTotalStudents(structure.id)}</p>
                            <p className="text-xs text-gray-500">Students</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <DollarSign className="h-4 w-4 text-green-500" />
                          <div>
                            <p className="text-sm font-medium">
                              KES {structure.termStructures[0]?.totalAmount.toLocaleString() || 0}
                            </p>
                            <p className="text-xs text-gray-500">Per Term</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4 text-orange-500" />
                          <div>
                            <p className="text-sm font-medium">{structure.termStructures.length}</p>
                            <p className="text-xs text-gray-500">Terms</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Settings className="h-4 w-4 text-purple-500" />
                          <div>
                            <p className="text-sm font-medium">{getAssignedGrades(structure.id).length}</p>
                            <p className="text-xs text-gray-500">Classes</p>
                          </div>
                        </div>
                      </div>
                      {/* Fee Buckets Preview */}
                      <div className="space-y-2">
                        <h4 className="text-sm font-medium">Fee Buckets (Term 1):</h4>
                        <div className="flex flex-wrap gap-2">
                          {structure.termStructures[0]?.buckets.map((bucket) => (
                            <Badge key={bucket.id} variant="outline" className="text-xs">
                              {bucket.name}: KES {bucket.amount.toLocaleString()}
                              {bucket.isOptional && ' (Optional)'}
                            </Badge>
                          ))}
                        </div>
                      </div>
                      {/* Action Buttons */}
                      <div className="flex gap-2 mt-4">
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => onAssignToGrade(structure.id)}
                        >
                          <Users className="h-4 w-4 mr-1" />
                          Assign to Grade
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => onGenerateInvoices(structure.id, 'Term 1')}
                        >
                          <FileText className="h-4 w-4 mr-1" />
                          Generate Invoices
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </TabsContent>

        {/* Grade Assignments Tab */}
        <TabsContent value="grades" className="space-y-4">
          <div className="grid gap-4">
            {grades.map((grade) => {
              const assignedStructure = feeStructures.find(fs => fs.id === grade.feeStructureId)
              return (
                <Card key={grade.id}>
                  <CardContent className="pt-6">
                    <div className="flex justify-between items-center">
                      <div>
                        <h3 className="font-medium">{grade.name} - Section {grade.section}</h3>
                        <p className="text-sm text-gray-600">
                          {grade.studentCount} students • {grade.boardingType}
                        </p>
                      </div>
                      <div className="text-right">
                        {assignedStructure ? (
                          <div>
                            <Badge variant="default">{assignedStructure.name}</Badge>
                            <p className="text-sm text-gray-600 mt-1">
                              KES {assignedStructure.termStructures[0]?.totalAmount.toLocaleString()} per term
                            </p>
                          </div>
                        ) : (
                          <div>
                            <Badge variant="secondary">No Structure Assigned</Badge>
                            <Button variant="outline" size="sm" className="mt-2">
                              Assign Structure
                            </Button>
                          </div>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        </TabsContent>

        {/* Invoice Generation Tab */}
        <TabsContent value="invoices" className="space-y-4">
          <div className="grid gap-4">
            {feeStructures.map((structure) => (
              <Card key={structure.id}>
                <CardHeader>
                  <CardTitle className="text-lg">{structure.name}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {structure.termStructures.map((term) => (
                      <div key={term.id} className="border rounded-lg p-4">
                        <h4 className="font-medium mb-2">{term.term}</h4>
                        <p className="text-sm text-gray-600 mb-2">
                          Due: {new Date(term.dueDate).toLocaleDateString()}
                        </p>
                        <p className="text-sm font-medium mb-3">
                          KES {term.totalAmount.toLocaleString()}
                        </p>
                        <Button 
                          size="sm" 
                          className="w-full"
                          onClick={() => onGenerateInvoices(structure.id, term.term)}
                        >
                          <Send className="h-4 w-4 mr-1" />
                          Generate {term.term} Invoices
                        </Button>
                      </div>
                    ))}
                  </div>
                  <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                    <p className="text-sm text-gray-600">
                      <strong>{getTotalStudents(structure.id)}</strong> students across{' '}
                      <strong>{getAssignedGrades(structure.id).length}</strong> classes will receive invoices
                    </p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
