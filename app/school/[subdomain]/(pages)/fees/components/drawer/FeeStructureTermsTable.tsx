'use client'

import React from 'react'
import { 
  GraduationCap, Copy, Trash2, Edit3, Clock, Sparkles, 
  ChevronDown, Plus, Zap, Calculator, X
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"

interface FeeStructureTermsTableProps {
  formData: any
  currentEditingField: string | null
  setCurrentEditingField: (field: string | null) => void
  updateComponent: (termIndex: number, bucketIndex: number, componentIndex: number, field: keyof any, value: any) => void
  updateBucket: (termIndex: number, bucketIndex: number, field: keyof any, value: any) => void
  calculateBucketTotal: (termIndex: number, bucketIndex: number) => number
  calculateTermTotal: (termIndex: number) => number
  calculateGrandTotal: () => number
  addComponent: (termIndex: number, bucketIndex: number) => void
  removeComponent: (termIndex: number, bucketIndex: number, componentIndex: number) => void
  feeBuckets: any[]
  addBucket: (termIndex: number) => void
  deleteFormBucket: (termIndex: number, bucketIndex: number) => void
  deleteFeeBucket: (bucketId: string) => void
  setEditingBucket: (bucket: any) => void
  setShowEditBucketModal: (show: boolean) => void
  showToast: (message: string, type: 'success' | 'error' | 'info') => void
}

export const FeeStructureTermsTable: React.FC<FeeStructureTermsTableProps> = ({
  formData,
  currentEditingField,
  setCurrentEditingField,
  updateComponent,
  updateBucket,
  calculateBucketTotal,
  calculateTermTotal,
  calculateGrandTotal,
  addComponent,
  removeComponent,
  feeBuckets,
  addBucket,
  deleteFormBucket,
  deleteFeeBucket,
  setEditingBucket,
  setShowEditBucketModal,
  showToast
}) => {
  
  return (
    <table className="w-full border-collapse border border-black shadow-lg">
      <thead>
        <tr className="bg-primary/10">
          <th className="border border-primary/30 p-3 text-left font-bold text-slate-700">
            <div className="flex flex-col">
              <span>TERM</span>
              <span className="text-xs font-normal text-slate-600 flex items-center gap-1">
                <GraduationCap className="h-3 w-3" />
                ACADEMIC YEAR
              </span>
            </div>
          </th>
          <th className="border border-primary/30 p-3 text-left font-bold text-slate-700">VOTE HEAD</th>
          <th className="border border-primary/30 p-3 text-right font-bold text-slate-700">AMOUNT</th>
          <th className="border border-primary/30 p-3 w-20 text-center font-bold text-slate-700">ACTIONS</th>
        </tr>
      </thead>
      <tbody>
        {formData.termStructures.map((term: any, termIndex: number) => {
          const termComponents = term.buckets.flatMap((bucket: any) => bucket.components)
          return termComponents.map((component: any, componentIndex: number) => {
            const bucketIndex = term.buckets.findIndex((bucket: any) => 
              bucket.components.some((comp: any) => comp === component)
            )
            const actualComponentIndex = term.buckets[bucketIndex].components.findIndex((comp: any) => comp === component)
            
            return (
              <tr key={`${termIndex}-${bucketIndex}-${actualComponentIndex}`} className="hover:bg-primary/5 group transition-all duration-200">
                <td className="border border-primary/30 p-3 text-center">
                  {componentIndex === 0 ? (
                    <div className="flex flex-col items-center justify-center gap-1">
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
                      <Badge 
                        variant="outline" 
                        className="text-xs bg-blue-50 text-blue-700 border-blue-200 shadow-sm flex items-center"
                      >
                        <GraduationCap className="h-3 w-3 mr-1" />
                        {term.academicYear || formData.academicYear}
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
                                  const isAlreadyUsed = formData.termStructures.some((term: any) =>
                                    term.buckets.some((b: any) => b.id === bucket.id)
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
                          className="w-full bg-transparent border-0 focus:bg-primary/5 focus:outline-none focus:ring-2 focus:ring-primary/30 px-2 py-1 transition-all duration-200 text-xs"
                          value={component.name}
                          onChange={(e) => updateComponent(termIndex, bucketIndex, actualComponentIndex, 'name', e.target.value)}
                          placeholder="Enter custom fee name..."
                        />
                      </div>
                    )}
                    {currentEditingField === `${termIndex}-${bucketIndex}-${actualComponentIndex}-name` && (
                      <div className="absolute top-full left-0 mt-1 text-xs text-primary bg-primary/5 px-2 py-1 shadow-sm">
                        💡 Choose from existing buckets or create custom
                      </div>
                    )}
                  </div>
                </td>
                <td className="border border-primary/30 p-3 text-right">
                  <div className="relative">
                    <input
                      type="number"
                      className="w-full bg-transparent border-0 text-right focus:bg-primary/5 focus:outline-none focus:ring-2 focus:ring-primary/30 px-2 py-1 font-mono transition-all duration-200"
                      value={component.amount}
                      onChange={(e) => updateComponent(termIndex, bucketIndex, actualComponentIndex, 'amount', e.target.value)}
                      onFocus={() => setCurrentEditingField(`${termIndex}-${bucketIndex}-${actualComponentIndex}-amount`)}
                      onBlur={() => setCurrentEditingField(null)}
                      placeholder="0.00"
                    />
                    {currentEditingField === `${termIndex}-${bucketIndex}-${actualComponentIndex}-amount` && (
                      <div className="absolute top-full right-0 mt-1 text-xs text-primary bg-primary/5 px-2 py-1 shadow-sm">
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
              <SelectTrigger className="text-xs bg-white border-2 border-primary/30 px-3 py-2 shadow-sm hover:shadow-md transition-all duration-200 focus:ring-2 focus:ring-primary/30 h-8">
                <SelectValue placeholder="🎯 Select Term" />
              </SelectTrigger>
              <SelectContent>
                {formData.termStructures.map((term: any, index: number) => (
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
          <td className="border border-primary/30 p-2"></td>
        </tr>
      </tbody>
    </table>
  )
}
