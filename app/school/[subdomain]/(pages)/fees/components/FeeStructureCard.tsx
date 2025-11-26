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

    const totalFees = structure.buckets.reduce((sum: number, bucket: any) => sum + bucket.totalAmount, 0)
    const hasAssignments = assignedGrades.length > 0

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
            "group relative overflow-hidden transition-all duration-300 hover:shadow-xl border-2",
            structure.isActive
                ? "border-primary/20 hover:border-primary/40 bg-gradient-to-br from-white to-primary/5"
                : "border-slate-200 bg-slate-50/50"
        )}>
            {/* Status Ribbon */}
            <div className={cn(
                "absolute top-4 -right-10 px-12 py-1 text-xs font-bold text-white transform rotate-45 shadow-md",
                structure.isActive ? "bg-primary" : "bg-slate-400"
            )}>
                {structure.isActive ? "ACTIVE" : "INACTIVE"}
            </div>

            <div className="p-6">
                {/* Header */}
                <div className="flex items-start justify-between mb-4">
                    <div className="flex-1 pr-8">
                        <div className="flex items-center gap-3 mb-2">
                            <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                                <FileText className="h-5 w-5 text-primary" />
                            </div>
                            <div>
                                <h3 className="font-bold text-lg text-slate-900 group-hover:text-primary transition-colors">
                                    {structure.structureName}
                                </h3>
                                <div className="flex items-center gap-2 mt-1">
                                    <Badge variant="outline" className="text-xs font-medium border-primary/30 text-primary">
                                        <Calendar className="h-3 w-3 mr-1" />
                                        {structure.academicYear}
                                    </Badge>
                                    <Badge variant="outline" className="text-xs font-medium">
                                        {structure.termName}
                                    </Badge>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Quick Actions - Hidden on mobile, visible on hover on desktop */}
                    <div className="hidden md:flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                        <Button
                            size="sm"
                            variant="ghost"
                            onClick={onEdit}
                            className="hover:bg-primary/10 hover:text-primary"
                        >
                            <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                            size="sm"
                            variant="ghost"
                            onClick={onDelete}
                            className="hover:bg-red-50 hover:text-red-600"
                        >
                            <Trash2 className="h-4 w-4" />
                        </Button>
                    </div>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-3 gap-4 mb-4">
                    <div className="p-3 rounded-lg bg-primary/5 border border-primary/10">
                        <div className="flex items-center gap-2 mb-1">
                            <DollarSign className="h-4 w-4 text-primary" />
                            <span className="text-xs font-medium text-slate-600">Total Fees</span>
                        </div>
                        <div className="text-lg font-bold text-primary">
                            ${totalFees.toLocaleString()}
                        </div>
                    </div>

                    <div className="p-3 rounded-lg bg-slate-50 border border-slate-200">
                        <div className="flex items-center gap-2 mb-1">
                            <Building2 className="h-4 w-4 text-slate-600" />
                            <span className="text-xs font-medium text-slate-600">Grades</span>
                        </div>
                        <div className="text-lg font-bold text-slate-900">
                            {assignedGrades.length}
                        </div>
                    </div>

                    <div className="p-3 rounded-lg bg-slate-50 border border-slate-200">
                        <div className="flex items-center gap-2 mb-1">
                            <Users className="h-4 w-4 text-slate-600" />
                            <span className="text-xs font-medium text-slate-600">Students</span>
                        </div>
                        <div className="text-lg font-bold text-slate-900">
                            {totalStudents}
                        </div>
                    </div>
                </div>

                {/* Fee Buckets Preview */}
                {!isExpanded && structure.buckets.length > 0 && (
                    <div className="mb-4 p-3 bg-white rounded-lg border border-slate-100">
                        <div className="text-xs font-semibold text-slate-500 mb-2">Fee Components</div>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {structure.buckets.slice(0, 3).map((bucket: any, idx: number) => (
                                <Badge
                                    key={idx}
                                    variant="secondary"
                                    className="text-xs"
                                >
                                    {bucket.name}: ${bucket.totalAmount}
                                </Badge>
                            ))}
                            {structure.buckets.length > 3 && (
                                <Badge variant="secondary" className="text-xs">
                                    +{structure.buckets.length - 3} more
                                </Badge>
                            )}
                        </div>
                    </div>
                )}

                {/* Expanded Details */}
                {isExpanded && (
                    <div className="mb-4 p-4 bg-white rounded-lg border border-slate-200 space-y-3">
                        <div className="text-sm font-semibold text-slate-700 mb-3">Fee Breakdown</div>
                        {structure.buckets.map((bucket: any, idx: number) => (
                            <div key={idx} className="flex items-center justify-between p-2 hover:bg-slate-50 rounded">
                                <div className="flex items-center gap-2">
                                    <div className={cn(
                                        "h-2 w-2 rounded-full",
                                        bucket.isOptional ? "bg-amber-400" : "bg-primary"
                                    )} />
                                    <span className="text-sm text-slate-700">{bucket.name}</span>
                                    {bucket.isOptional && (
                                        <Badge variant="outline" className="text-xs">Optional</Badge>
                                    )}
                                </div>
                                <span className="text-sm font-semibold text-slate-900">
                                    ${bucket.totalAmount.toLocaleString()}
                                </span>
                            </div>
                        ))}
                    </div>
                )}

                {/* Expand/Collapse Button */}
                {structure.buckets.length > 0 && (
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setIsExpanded(!isExpanded)}
                        className="w-full mb-4 text-primary hover:bg-primary/5"
                    >
                        {isExpanded ? (
                            <>
                                <ChevronDown className="h-4 w-4 mr-2" />
                                Show Less
                            </>
                        ) : (
                            <>
                                <ChevronRight className="h-4 w-4 mr-2" />
                                View Full Breakdown
                            </>
                        )}
                    </Button>
                )}

                {/* Action Buttons */}
                <div className="flex flex-col gap-2">
                    <div className="flex flex-col sm:flex-row gap-2">
                        {hasAssignments ? (
                            <Button
                                onClick={onGenerateInvoices}
                                className="flex-1 bg-primary hover:bg-primary-dark text-white shadow-md hover:shadow-lg transition-all duration-300 group"
                            >
                                <FileText className="h-4 w-4 mr-2" />
                                Generate Invoices
                                <ArrowRight className="h-4 w-4 ml-2 group-hover:translate-x-1 transition-transform" />
                            </Button>
                        ) : (
                            <Button
                                onClick={onAssignToGrade}
                                className="flex-1 bg-primary hover:bg-primary-dark text-white shadow-md hover:shadow-lg transition-all duration-300 group"
                            >
                                <Users className="h-4 w-4 mr-2" />
                                Assign to Grades
                                <ArrowRight className="h-4 w-4 ml-2 group-hover:translate-x-1 transition-transform" />
                            </Button>
                        )}

                        <Button
                            onClick={onEdit}
                            variant="outline"
                            className="sm:w-auto border-2 border-primary/30 text-primary hover:bg-primary/5 hover:border-primary/50 transition-all duration-300"
                        >
                            <Edit className="h-4 w-4 mr-2" />
                            Edit
                        </Button>
                    </div>

                    {/* Secondary Actions */}
                    <div className="flex flex-col sm:flex-row gap-2 pt-2 border-t border-slate-200">
                        <Button
                            onClick={() => setShowBucketModal(true)}
                            variant="outline"
                            size="sm"
                            className="flex-1 border-blue-200 text-blue-700 hover:bg-blue-50"
                        >
                            <Plus className="h-3.5 w-3.5 mr-1.5" />
                            Create Bucket
                        </Button>
                        <Button
                            onClick={() => setShowPDFPreview(true)}
                            variant="outline"
                            size="sm"
                            className="flex-1 border-emerald-200 text-emerald-700 hover:bg-emerald-50"
                        >
                            <Eye className="h-3.5 w-3.5 mr-1.5" />
                            Preview PDF
                        </Button>
                    </div>
                </div>

                {/* Assignment Status Indicator */}
                {hasAssignments && (
                    <div className="mt-4 p-3 bg-primary/5 rounded-lg border border-primary/20">
                        <div className="flex items-center gap-2 text-sm">
                            <CheckCircle className="h-4 w-4 text-primary" />
                            <span className="font-medium text-primary">
                                Assigned to {assignedGrades.length} grade{assignedGrades.length !== 1 ? 's' : ''}
                                {totalStudents > 0 && ` • ${totalStudents} student${totalStudents !== 1 ? 's' : ''}`}
                            </span>
                        </div>
                    </div>
                )}
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
