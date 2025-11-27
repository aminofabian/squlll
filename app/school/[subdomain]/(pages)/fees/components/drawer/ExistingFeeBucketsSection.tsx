'use client'

import React, { useState } from 'react'
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Badge } from "@/components/ui/badge"
import { Edit3, Trash2, Clock, GraduationCap, Plus, Eye, ChevronDown, ChevronRight, Coins, CheckCircle, Calendar } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"

interface FeeBucket {
  id: string
  name: string
  description: string
  isActive: boolean
  createdAt: string
  components?: Array<{
    name: string
    description: string
    amount: string
    category: string
  }>
}

interface TermStructure {
  term: string
}

interface ExistingFeeBucketsSectionProps {
  feeBuckets: FeeBucket[]
  bucketsLoading: boolean
  bucketsError: any
  selectedExistingBuckets: string[]
  onBucketSelect: (id: string) => void
  onAddToAllTerms: () => void
  onRefetchBuckets: () => void
  onAddExistingBucket: (termIndex: number, bucketId: string) => void
  onEditBucket: (bucket: { id: string; name: string; description: string; isActive: boolean }) => void
  onDeleteBucket: (bucketId: string) => void
  termStructures: { term: string }[]
  currentTermIndex: number
}

export const ExistingFeeBucketsSection: React.FC<ExistingFeeBucketsSectionProps> = ({
  feeBuckets,
  bucketsLoading,
  bucketsError,
  selectedExistingBuckets,
  onBucketSelect,
  onAddToAllTerms,
  onRefetchBuckets,
  onAddExistingBucket,
  onEditBucket,
  onDeleteBucket,
  termStructures,
  currentTermIndex
}) => {
  const [expandedBuckets, setExpandedBuckets] = useState<Set<string>>(new Set())
  const [hoveredBucket, setHoveredBucket] = useState<string | null>(null)
  const [addingToTerm, setAddingToTerm] = useState<{bucketId: string, termIndex: number} | null>(null)

  // Toggle bucket expansion with option to force expand
  const toggleBucketExpansion = (bucketId: string, forceExpand: boolean = false) => {
    setExpandedBuckets(prev => {
      const newSet = new Set(prev)
      // If it's already expanded and we're not forcing expansion, collapse it
      // Otherwise, expand it
      if (newSet.has(bucketId) && !forceExpand) {
        newSet.delete(bucketId)
      } else {
        newSet.add(bucketId)
      }
      return newSet
    })
  }

  const calculateTotalAmount = (components: any[]) => {
    return components?.reduce((total, comp) => total + (parseFloat(comp.amount) || 0), 0) || 0
  }

  const handleAddToTerm = async (termIndex: number, bucketId: string) => {
    setAddingToTerm({ bucketId, termIndex })
    try {
      await onAddExistingBucket(termIndex, bucketId)
      // Add a brief success indication
      setTimeout(() => setAddingToTerm(null), 1000)
    } catch (error) {
      setAddingToTerm(null)
    }
  }

  return (
    <div className="mb-6 p-4 bg-primary/5 border border-primary/20">
      {/* Current term indicator */}
      <div className="mb-3 flex items-center justify-between p-2 bg-primary/10 rounded-md border border-primary/20">
        <div className="flex items-center gap-2">
          <Calendar className="h-4 w-4 text-primary" />
          <span className="text-xs font-medium text-primary">
            Working with {termStructures[currentTermIndex]?.term || 'Current Term'}
          </span>
        </div>
        <Badge variant="outline" className="bg-white text-primary border-primary text-xs">
          <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse mr-1.5"></span>
          Active Term
        </Badge>
      </div>

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
            onClick={onRefetchBuckets}
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
              onClick={onAddToAllTerms}
            >
              <GraduationCap className="h-3 w-3 mr-1" />
              Add to All Terms ({selectedExistingBuckets.length})
            </Button>
          )}
        </div>
      </div>
      
      {bucketsError && (
        <div className="mb-3 p-2 bg-red-50 border border-red-200 text-xs text-red-700">
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
        <TooltipProvider>
          <div className="space-y-3">
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg p-4 mb-4">
              <div className="flex items-start gap-3">
                <div className="h-8 w-8 rounded-full bg-blue-100 border border-blue-300 flex items-center justify-center flex-shrink-0 mt-0.5 shadow-sm">
                  <span className="text-sm font-bold text-blue-600">💡</span>
                </div>
                <div className="text-xs text-blue-800">
                  <strong className="text-sm">How to add buckets to voteheads:</strong>
                  <div className="mt-3 grid grid-cols-1 md:grid-cols-3 gap-3">
                    <div className="bg-white rounded-lg p-3 shadow-sm border border-blue-200">
                      <div className="flex items-center gap-2 mb-2">
                        <div className="w-5 h-5 rounded-full bg-blue-100 flex items-center justify-center text-xs font-bold text-blue-700">1</div>
                        <strong className="text-blue-800">Quick Add</strong>
                      </div>
                      <p className="text-blue-700">Click "Add to Term 1/2/3" buttons to instantly add a bucket to a specific term</p>
                    </div>
                    <div className="bg-white rounded-lg p-3 shadow-sm border border-blue-200">
                      <div className="flex items-center gap-2 mb-2">
                        <div className="w-5 h-5 rounded-full bg-blue-100 flex items-center justify-center text-xs font-bold text-blue-700">2</div>
                        <strong className="text-blue-800">Bulk Select</strong>
                      </div>
                      <p className="text-blue-700">Check multiple buckets and use "Add to All Terms" for efficiency</p>
                    </div>
                    <div className="bg-white rounded-lg p-3 shadow-sm border border-blue-200">
                      <div className="flex items-center gap-2 mb-2">
                        <div className="w-5 h-5 rounded-full bg-blue-100 flex items-center justify-center text-xs font-bold text-blue-700">3</div>
                        <strong className="text-blue-800">Preview</strong>
                      </div>
                      <p className="text-blue-700">Click the expand arrow to see all voteheads (fee components) in each bucket</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="grid grid-cols-1 gap-3 max-h-64 overflow-y-auto">
              {feeBuckets.map((bucket) => {
                const isExpanded = expandedBuckets.has(bucket.id)
                const isSelected = selectedExistingBuckets.includes(bucket.id)
                const totalAmount = calculateTotalAmount(bucket.components || [])
                const hasComponents = bucket.components && bucket.components.length > 0
                
                return (
                  <Card
                    key={bucket.id}
                    className={`transition-all duration-300 hover:shadow-md cursor-pointer ${
                      isSelected
                        ? 'bg-primary/10 border-primary/40 shadow-md ring-2 ring-primary/20'
                        : 'bg-white border-primary/20 hover:bg-primary/5 hover:border-primary/30'
                    }`}
                    onMouseEnter={() => setHoveredBucket(bucket.id)}
                    onMouseLeave={() => setHoveredBucket(null)}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-start space-x-3">
                        <Checkbox
                          checked={isSelected}
                          className="w-5 h-5 mt-1 border-2 data-[state=checked]:bg-primary data-[state=checked]:border-primary"
                          onClick={(e) => {
                            e.stopPropagation()
                            onBucketSelect(bucket.id)
                          }}
                        />
                        
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-2">
                              <div className={`p-1.5 rounded-md ${isSelected ? 'bg-primary/20' : 'bg-blue-50'}`}>
                                <Coins className={`h-4 w-4 ${isSelected ? 'text-primary' : 'text-blue-600'}`} />
                              </div>
                              <h5 className="text-sm font-semibold text-slate-800 truncate">
                                {bucket.name}
                              </h5>
                              {bucket.isActive && (
                                <Badge variant="outline" className="text-xs bg-green-50 text-green-700 border-green-200">
                                  Active
                                </Badge>
                              )}
                              {hasComponents && (
                                <Badge variant="outline" className="text-xs bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100">
                                  {bucket.components?.length} components
                                </Badge>
                              )}
                            </div>
                            <div className="flex items-center gap-1">
                              {hasComponents && (
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className={`h-6 w-6 p-0 rounded-full ${isExpanded ? 'bg-blue-100 text-blue-700' : 'text-slate-500 hover:bg-slate-100'}`}
                                  onClick={(e) => {
                                    e.stopPropagation()
                                    toggleBucketExpansion(bucket.id, !expandedBuckets.has(bucket.id))
                                  }}
                                >
                                  {isExpanded ? <ChevronDown className="h-3.5 w-3.5" /> : <ChevronRight className="h-3.5 w-3.5" />}
                                </Button>
                              )}
                            </div>
                          </div>
                          
                          <p className="text-xs text-slate-600 mb-2 line-clamp-2">
                            {bucket.description}
                          </p>
                          
                          <div className="flex items-center justify-between text-xs text-slate-500">
                            <span>Created: {new Date(bucket.createdAt).toLocaleDateString()}</span>
                            {hasComponents && totalAmount > 0 && (
                              <span className="font-medium text-slate-700">
                                Total: KES {totalAmount.toLocaleString()}
                              </span>
                            )}
                          </div>
                          
                          {/* Expanded components view */}
                          {isExpanded && hasComponents && (
                            <div className="mt-3 pt-3 border-t border-blue-100">
                              <div className="flex justify-between items-center mb-2">
                                <div className="text-xs font-medium text-blue-700 flex items-center gap-1.5">
                                  <div className="p-1 rounded bg-blue-50">
                                    <Coins className="h-3 w-3 text-blue-600" />
                                  </div>
                                  Vote Heads ({bucket.components?.length})
                                </div>
                                <Badge variant="outline" className="text-xs bg-blue-50 text-blue-700 border-blue-200">
                                  Total: KES {totalAmount.toLocaleString()}
                                </Badge>
                              </div>
                              <div className="space-y-2">
                                {bucket.components?.map((component, index) => {
                                  // Determine category info for icon and styling
                                  const categoryMap: {[key: string]: {color: string, bgColor: string}} = {
                                    academic: { color: 'text-blue-600', bgColor: 'bg-blue-50' },
                                    technology: { color: 'text-purple-600', bgColor: 'bg-purple-50' },
                                    transport: { color: 'text-indigo-600', bgColor: 'bg-indigo-50' },
                                    meals: { color: 'text-red-600', bgColor: 'bg-red-50' },
                                  };
                                  const category = component.category || 'academic';
                                  const { color, bgColor } = categoryMap[category] || { color: 'text-slate-600', bgColor: 'bg-slate-50' };
                                  
                                  return (
                                    <div key={index} className="flex items-center justify-between text-xs bg-white p-2 rounded border border-blue-100 hover:bg-blue-50/30 transition-colors duration-200">
                                      <div className="flex items-center gap-2">
                                        <div className={`p-1 rounded ${bgColor}`}>
                                          <Coins className={`h-3 w-3 ${color}`} />
                                        </div>
                                        <div className="flex-1">
                                          <span className="font-medium text-slate-800">{component.name}</span>
                                          {component.description && (
                                            <span className="text-slate-500 ml-2 text-xs">- {component.description}</span>
                                          )}
                                        </div>
                                      </div>
                                      <span className="font-medium text-slate-700 bg-white py-0.5 px-2 rounded border border-slate-200">
                                        KES {parseFloat(component.amount || '0').toLocaleString()}
                                      </span>
                                    </div>
                                  );
                                })}
                              </div>
                            </div>
                          )}
                        </div>
                        
                        {/* Action buttons */}
                        <div className="flex flex-col gap-1">
                          {/* Quick add to terms */}
                          <div className="flex flex-col gap-2 mb-2">
                            <div className="text-xs text-blue-700 font-medium flex items-center gap-1.5">
                              <div className="p-1 bg-blue-50 rounded-full">
                                <Plus className="h-2.5 w-2.5 text-blue-600" />
                              </div>
                              Add to Voteheads:
                            </div>
                            <div className="grid grid-cols-3 gap-1.5">
                              {termStructures.map((term, termIndex) => {
                                const isAdding = addingToTerm?.bucketId === bucket.id && addingToTerm?.termIndex === termIndex;
                                const isCurrentTerm = termIndex === currentTermIndex;
                                const termNumber = term.term.split(' ')[1] || (termIndex + 1);
                                
                                return (
                                  <Tooltip key={termIndex}>
                                    <TooltipTrigger asChild>
                                      <Button
                                        variant="outline"
                                        size="sm"
                                        className={`relative h-9 text-xs transition-all duration-300 ${isAdding 
                                          ? 'bg-green-50 border-green-300 text-green-700 shadow-sm' 
                                          : isCurrentTerm
                                            ? 'bg-primary/10 border-primary/50 text-primary hover:bg-primary/20 font-medium shadow-sm'
                                            : 'hover:bg-primary/10 text-primary border-primary/30 hover:border-primary/50 hover:shadow-sm'
                                        }`}
                                        onClick={(e) => {
                                          e.stopPropagation()
                                          handleAddToTerm(termIndex, bucket.id)
                                        }}
                                        disabled={isAdding}
                                      >
                                        {isAdding ? (
                                          <div className="flex items-center justify-center w-full gap-1.5">
                                            <CheckCircle className="h-3.5 w-3.5 text-green-600" />
                                            <span>Added!</span>
                                          </div>
                                        ) : (
                                          <div className="flex flex-col items-center justify-center">
                                            <div className="flex items-center gap-1">
                                              {isCurrentTerm ? (
                                                <>
                                                  <span className="w-2 h-2 rounded-full bg-primary animate-pulse mr-1"></span>
                                                  <span className="font-medium">Term {termNumber}</span>
                                                  <span className="text-[10px] bg-primary/20 text-primary px-1 py-0.5 rounded ml-1">Active</span>
                                                </>
                                              ) : (
                                                <>
                                                  <Plus className="h-3 w-3" />
                                                  <span className="font-medium">Term {termNumber}</span>
                                                </>
                                              )}
                                            </div>
                                            <span className="text-[10px] opacity-80">{isCurrentTerm ? 'Current term' : 'Click to add'}</span>
                                          </div>
                                        )}
                                      </Button>
                                    </TooltipTrigger>
                                    <TooltipContent>
                                      <p>Add this bucket to {term.term} voteheads</p>
                                    </TooltipContent>
                                  </Tooltip>
                                );
                              })}
                            </div>
                          </div>
                          
                          {/* Management buttons */}
                          <div className="flex gap-2 mt-2 pt-2 border-t border-blue-100">
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  className="h-8 px-3 text-xs bg-blue-50 border-blue-200 hover:bg-blue-100 text-blue-700 flex items-center gap-1.5"
                                  onClick={(e) => {
                                    e.stopPropagation()
                                    onEditBucket({
                                      id: bucket.id,
                                      name: bucket.name,
                                      description: bucket.description,
                                      isActive: bucket.isActive
                                    })
                                  }}
                                >
                                  <Edit3 className="h-3 w-3" />
                                  Edit
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent>
                                <p>Edit bucket details</p>
                              </TooltipContent>
                            </Tooltip>
                            
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  className="h-8 px-3 text-xs hover:bg-red-50 hover:text-red-700 border-slate-200 text-slate-600 flex items-center gap-1.5"
                                  onClick={(e) => {
                                    e.stopPropagation()
                                    if (confirm(`Are you sure you want to delete "${bucket.name}"? This action cannot be undone.`)) {
                                      onDeleteBucket(bucket.id)
                                    }
                                  }}
                                >
                                  <Trash2 className="h-3 w-3" />
                                  Delete
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent>
                                <p>Delete this bucket permanently</p>
                              </TooltipContent>
                            </Tooltip>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          </div>
        </TooltipProvider>
      )}
    </div>
  )
}
