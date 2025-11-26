'use client'

import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import {
    Edit,
    Trash2,
    Users,
    FileText,
    ChevronDown,
    ChevronRight,
    DollarSign,
    Calendar,
    Building2,
    CheckCircle,
    ArrowRight,
    Plus,
    Eye,
    Download,
    X
} from 'lucide-react'
import { ProcessedFeeStructure } from './FeeStructureManager/types'
import { useState } from 'react'
import { cn } from '@/lib/utils'
import { BucketCreationModal } from './drawer/BucketCreationModal'
import { FeeStructurePDFPreview } from './FeeStructurePDFPreview'
import { FeeStructureForm } from '../types'

interface FeeStructureCardProps {
    structure: ProcessedFeeStructure
    onEdit: () => void
    onDelete: () => void
    onAssignToGrade: () => void
    onGenerateInvoices: () => void
    assignedGrades: any[]
    totalStudents: number
}

export const FeeStructureCard = ({
    structure,
    onEdit,
    onDelete,
    onAssignToGrade,
    onGenerateInvoices,
    assignedGrades,
    totalStudents
}: FeeStructureCardProps) => {
    const [isExpanded, setIsExpanded] = useState(false)
    const [showBucketModal, setShowBucketModal] = useState(false)
    const [showPDFPreview, setShowPDFPreview] = useState(false)
    const [isCreatingBucket, setIsCreatingBucket] = useState(false)
    const [bucketModalData, setBucketModalData] = useState({ name: '', description: '' })
    const [selectedTermId, setSelectedTermId] = useState(structure.termId)

    // Get buckets for the selected term
    const displayBuckets = structure.termFeesMap && selectedTermId
        ? (structure.termFeesMap[selectedTermId] || [])
        : structure.buckets

    const totalFees = displayBuckets.reduce((sum: number, bucket: any) => sum + bucket.totalAmount, 0)
    const hasAssignments = assignedGrades.length > 0

    // Handle term click to filter fees
    const handleTermClick = (termId: string) => {
        setSelectedTermId(termId)
        setIsExpanded(false) // Collapse expanded view when switching terms
    }

    // Create fee bucket via GraphQL
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

            // Reset modal and close
            setBucketModalData({ name: '', description: '' })
            setShowBucketModal(false)

            return result.data.createFeeBucket
        } catch (error) {
            console.error('Error creating fee bucket:', error)
            throw error
        } finally {
            setIsCreatingBucket(false)
        }
    }

    // Convert ProcessedFeeStructure to FeeStructureForm for PDF preview
    const convertToPDFForm = (): FeeStructureForm => {
        // Group buckets by term - for now, we'll create a single term structure
        // since ProcessedFeeStructure doesn't have term-specific buckets
        const termStructures = structure.terms.map((term, index) => ({
            term: term.name as 'Term 1' | 'Term 2' | 'Term 3',
            academicYear: structure.academicYear,
            dueDate: '',
            latePaymentFee: '',
            earlyPaymentDiscount: '',
            earlyPaymentDeadline: '',
            buckets: structure.buckets.map(bucket => ({
                id: bucket.feeBucketId,
                type: 'tuition' as const,
                name: bucket.name,
                description: '',
                isOptional: bucket.isOptional,
                components: [{
                    name: bucket.name,
                    description: '',
                    amount: bucket.totalAmount.toString(),
                    category: 'fee'
                }]
            })),
            existingBucketAmounts: {}
        }))

        return {
            name: structure.structureName,
            grade: '',
            boardingType: 'both',
            academicYear: structure.academicYear,
            academicYearId: structure.academicYearId,
            termStructures: termStructures.length > 0 ? termStructures : [{
                term: structure.termName as 'Term 1' | 'Term 2' | 'Term 3',
                academicYear: structure.academicYear,
                dueDate: '',
                latePaymentFee: '',
                earlyPaymentDiscount: '',
                earlyPaymentDeadline: '',
                buckets: structure.buckets.map(bucket => ({
                    id: bucket.feeBucketId,
                    type: 'tuition' as const,
                    name: bucket.name,
                    description: '',
                    isOptional: bucket.isOptional,
                    components: [{
                        name: bucket.name,
                        description: '',
                        amount: bucket.totalAmount.toString(),
                        category: 'fee'
                    }]
                })),
                existingBucketAmounts: {}
            }]
        }
    }

    // Handle PDF download
    const handleDownloadPDF = () => {
        // This would use a library like jsPDF or html2pdf
        // For now, we'll use the browser's print functionality
        window.print()
    }

    return (
        <Card className={cn(
            "group relative overflow-hidden transition-all duration-300 rounded-none",
            structure.isActive
                ? "bg-white shadow-md hover:shadow-xl border border-primary/20"
                : "bg-slate-50 shadow-sm hover:shadow-md border border-slate-200"
        )}>
            {/* Top accent bar */}
            <div className={cn(
                "absolute top-0 left-0 right-0 h-1",
                structure.isActive
                    ? "bg-primary"
                    : "bg-slate-300"
            )} />

            {/* Status Badge - moved inline with title */}
            <div className="p-3 pt-2">
                <div className="flex items-start gap-2 mb-3">
                    <div className={cn(
                        "h-10 w-10 flex items-center justify-center flex-shrink-0",
                        structure.isActive
                            ? "bg-primary"
                            : "bg-slate-400"
                    )}>
                        <FileText className="h-5 w-5 text-white" />
                    </div>

                    <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-3 mb-0.5">
                            <h3 className="text-base font-bold text-slate-900">
                                {structure.structureName}
                            </h3>
                            <Badge className={cn(
                                "text-[10px] font-bold uppercase flex-shrink-0",
                                structure.isActive
                                    ? "bg-primary text-white"
                                    : "bg-slate-400 text-white"
                            )}>
                                {structure.isActive ? "Active" : "Inactive"}
                            </Badge>
                        </div>
                        <div className="text-sm text-slate-500">
                            <Calendar className="h-3 w-3 inline mr-1" />
                            {structure.academicYear}
                        </div>
                    </div>
                </div>

                <div className="mb-3 space-y-2">
                    {/* Terms */}
                    {(structure.terms && structure.terms.length > 0) || structure.termName ? (
                        <div>
                            <div className="text-[10px] font-bold text-slate-500 uppercase mb-2">Terms</div>
                            <div className="flex flex-wrap gap-2">
                                {structure.terms && structure.terms.length > 0 ? (
                                    structure.terms.map((term: { id: string; name: string }) => (
                                        <button
                                            key={term.id}
                                            className="px-2.5 py-1 text-xs font-medium bg-primary/10 text-primary border border-primary/30 rounded-md hover:bg-primary/20 hover:border-primary/40 transition-colors cursor-pointer"
                                        >
                                            {term.name}
                                        </button>
                                    ))
                                ) : (
                                    <button className="px-2.5 py-1 text-xs font-medium bg-primary/10 text-primary border border-primary/30 rounded-md hover:bg-primary/20 hover:border-primary/40 transition-colors cursor-pointer">
                                        {structure.termName}
                                    </button>
                                )}
                            </div>
                        </div>
                    ) : null}

                    {/* Grades */}
                    {structure.gradeLevels && structure.gradeLevels.length > 0 && (
                        <div>
                            <div className="flex items-center gap-2 mb-2">
                                <div className="text-[10px] font-bold text-slate-500 uppercase">Grades</div>
                                <Badge variant="outline" className="text-[10px] border-slate-300 text-slate-600">
                                    {structure.gradeLevels?.length || 0} assigned
                                </Badge>
                            </div>
                            <div className="flex flex-wrap gap-2">
                                {structure.gradeLevels.map((gradeLevel: any) => (
                                    <button
                                        key={gradeLevel.id}
                                        className="px-2.5 py-1 text-xs font-medium bg-slate-100 text-slate-700 border border-slate-300 rounded-md hover:bg-slate-200 hover:border-slate-400 transition-colors cursor-pointer"
                                    >
                                        {gradeLevel.gradeLevel?.name || gradeLevel.shortName || gradeLevel.name || 'Unknown'}
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}
                </div>

                {/* Stats Section - Total Fees Only */}
                <div className="mb-3">
                    <div className="p-4 bg-primary/10 border border-primary/20">
                        <div className="flex items-center justify-between">
                            <div className="text-xs text-slate-500">Total Fees</div>
                            <div className="text-xl font-bold text-primary">${totalFees.toLocaleString()}</div>
                        </div>
                    </div>
                </div>

                {/* Fee Breakdown Section */}
                {structure.buckets.length > 0 && (
                    <div className="mb-3">
                        <div className="flex items-center justify-between mb-2">
                            <h4 className="text-xs font-bold text-slate-600 uppercase">Fee Components</h4>
                            <Badge variant="secondary" className="text-xs">{structure.buckets.length} total</Badge>
                        </div>

                        {!isExpanded ? (
                            <div className="space-y-2">
                                {structure.buckets.slice(0, 1).map((bucket: any, idx: number) => (
                                    <div
                                        key={idx}
                                        className="flex items-center justify-between p-2.5 bg-white border border-slate-200 hover:border-primary/30 transition-colors"
                                    >
                                        <div className="flex items-center gap-2">
                                            <div className={cn(
                                                "h-2 w-2 rounded-full",
                                                bucket.isOptional ? "bg-amber-400" : "bg-primary"
                                            )} />
                                            <span className="text-sm font-medium text-slate-800">
                                                {bucket.name}
                                            </span>
                                            {bucket.isOptional && (
                                                <Badge variant="outline" className="text-[10px] border-amber-200 text-amber-700">
                                                    Optional
                                                </Badge>
                                            )}
                                        </div>
                                        <span className="text-sm font-bold text-slate-900">
                                            ${bucket.totalAmount.toLocaleString()}
                                        </span>
                                    </div>
                                ))}
                                {structure.buckets.length > 1 && (
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => setIsExpanded(true)}
                                        className="w-full text-primary text-xs"
                                    >
                                        <ChevronRight className="h-3.5 w-3.5 mr-1" />
                                        Show {structure.buckets.length - 1} more
                                    </Button>
                                )}
                            </div>
                        ) : (
                            <div className="space-y-2">
                                {structure.buckets.map((bucket: any, idx: number) => (
                                    <div
                                        key={idx}
                                        className="flex items-center justify-between p-2.5 bg-white border border-slate-200 hover:border-primary/30 transition-colors"
                                    >
                                        <div className="flex items-center gap-2">
                                            <div className={cn(
                                                "h-2 w-2 rounded-full",
                                                bucket.isOptional ? "bg-amber-400" : "bg-primary"
                                            )} />
                                            <span className="text-sm font-medium text-slate-800">
                                                {bucket.name}
                                            </span>
                                            {bucket.isOptional && (
                                                <Badge variant="outline" className="text-[10px] border-amber-200 text-amber-700">
                                                    Optional
                                                </Badge>
                                            )}
                                        </div>
                                        <span className="text-sm font-bold text-slate-900">
                                            ${bucket.totalAmount.toLocaleString()}
                                        </span>
                                    </div>
                                ))}
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => setIsExpanded(false)}
                                    className="w-full text-primary text-xs"
                                >
                                    <ChevronDown className="h-3.5 w-3.5 mr-1" />
                                    Show less
                                </Button>
                            </div>
                        )}
                    </div>
                )}

                {/* Assignment Status Section */}
                {hasAssignments && (
                    <div className="mb-3 p-2.5 bg-emerald-50 border border-emerald-200">
                        <div className="flex items-center gap-2">
                            <div className="h-8 w-8 rounded-full bg-emerald-100 flex items-center justify-center">
                                <CheckCircle className="h-4 w-4 text-emerald-600" />
                            </div>
                            <div className="flex-1">
                                <div className="text-xs font-bold text-emerald-900">Currently Assigned</div>
                                <div className="text-xs text-slate-600">
                                    {assignedGrades.length} grade{assignedGrades.length !== 1 ? 's' : ''} • {totalStudents} student{totalStudents !== 1 ? 's' : ''}
                                </div>
                            </div>
                            <Badge className="bg-emerald-600 text-white text-[10px]">Active</Badge>
                        </div>
                    </div>
                )}

                <div className="space-y-2">
                    {/* Primary CTA */}
                    {hasAssignments ? (
                        <Button
                            onClick={onGenerateInvoices}
                            size="sm"
                            className="w-full bg-primary hover:bg-primary/90 text-white"
                        >
                            <FileText className="h-3.5 w-3.5 mr-1.5" />
                            Generate Invoices
                        </Button>
                    ) : (
                        <Button
                            onClick={onAssignToGrade}
                            size="sm"
                            className="w-full bg-primary hover:bg-primary/90 text-white"
                        >
                            <Users className="h-3.5 w-3.5 mr-1.5" />
                            Assign to Grades
                        </Button>
                    )}

                    {/* Secondary Actions */}
                    <div className="grid grid-cols-2 gap-2">
                        <Button
                            onClick={onEdit}
                            variant="outline"
                            size="sm"
                            className="border-slate-300 text-slate-700 hover:bg-slate-50 text-xs"
                        >
                            <Edit className="h-3 w-3 mr-1" />
                            Edit
                        </Button>

                        <Button
                            onClick={() => setShowBucketModal(true)}
                            variant="outline"
                            size="sm"
                            className="border-slate-300 text-slate-700 hover:bg-slate-50 text-xs"
                        >
                            <Plus className="h-3 w-3 mr-1" />
                            Add Bucket
                        </Button>
                    </div>

                    {/* Tertiary Action */}
                    <Button
                        onClick={() => setShowPDFPreview(true)}
                        variant="outline"
                        size="sm"
                        className="w-full border-slate-300 text-slate-700 hover:bg-slate-50 text-xs"
                    >
                        <Eye className="h-3 w-3 mr-1.5" />
                        Preview PDF
                    </Button>
                </div>
            </div>

            {/* Bucket Creation Modal */}
            <BucketCreationModal
                isOpen={showBucketModal}
                onClose={() => {
                    setShowBucketModal(false)
                    setBucketModalData({ name: '', description: '' })
                }}
                bucketData={bucketModalData}
                isCreating={isCreatingBucket}
                onChange={setBucketModalData}
                onCreateBucket={async () => {
                    if (bucketModalData.name.trim()) {
                        try {
                            await createFeeBucket({
                                name: bucketModalData.name.trim(),
                                description: bucketModalData.description.trim()
                            })
                        } catch (error) {
                            // Error is already logged in createFeeBucket
                        }
                    }
                }}
            />

            {/* PDF Preview Modal */}
            <Dialog open={showPDFPreview} onOpenChange={setShowPDFPreview}>
                <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                        <div className="flex items-center justify-between">
                            <DialogTitle className="flex items-center gap-2">
                                <FileText className="h-5 w-5 text-primary" />
                                Fee Structure Preview - {structure.structureName}
                            </DialogTitle>
                            <div className="flex items-center gap-2">
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={handleDownloadPDF}
                                    className="border-primary/30 text-primary hover:bg-primary/5"
                                >
                                    <Download className="h-4 w-4 mr-2" />
                                    Download PDF
                                </Button>
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => setShowPDFPreview(false)}
                                    className="h-8 w-8 p-0"
                                >
                                    <X className="h-4 w-4" />
                                </Button>
                            </div>
                        </div>
                    </DialogHeader>
                    <div className="mt-4">
                        <FeeStructurePDFPreview
                            formData={convertToPDFForm()}
                            feeBuckets={structure.buckets.map(b => ({
                                id: b.feeBucketId,
                                name: b.name,
                                description: ''
                            }))}
                        />
                    </div>
                </DialogContent>
            </Dialog>
        </Card>
    )
}
