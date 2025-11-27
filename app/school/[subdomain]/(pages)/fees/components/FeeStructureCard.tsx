'use client'

import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import {
    Drawer,
    DrawerContent,
    DrawerHeader,
    DrawerTitle,
    DrawerDescription,
    DrawerFooter,
    DrawerClose,
} from '@/components/ui/drawer'
import {
    Edit,
    Trash2,
    Users,
    FileText,
    ChevronDown,
    ChevronRight,
    Coins,
    Calendar,
    Building2,
    CheckCircle,
    ArrowRight,
    Plus,
    Eye,
    Download,
    X,
    Loader2
} from 'lucide-react'
import { ProcessedFeeStructure } from './FeeStructureManager/types'
import { useState, useMemo, useEffect } from 'react'
import { useParams } from 'next/navigation'
import { cn } from '@/lib/utils'
import { BucketCreationModal } from './drawer/BucketCreationModal'
import { FeeStructurePDFPreview } from './FeeStructurePDFPreview'
import { FeeStructureForm } from '../types'
import { useFeeAssignmentsByGradeLevels } from '../hooks/useFeeAssignmentsByGradeLevels'
import { ScrollArea } from '@/components/ui/scroll-area'

interface FeeStructureCardProps {
    structure: ProcessedFeeStructure
    onEdit: () => void
    onDelete: () => void
    onAssignToGrade: (feeStructureId: string) => void
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
    const params = useParams()
    const subdomain = params.subdomain as string
    
    // Get school name from subdomain
    const schoolName = useMemo(() => {
        if (!subdomain) return "KANYAWANGA HIGH SCHOOL"
        return subdomain
            .split('-')
            .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
            .join(' ')
            .replace(/\bSchool\b/i, '')
            .trim() + ' School'
    }, [subdomain])
    
    const [isExpanded, setIsExpanded] = useState(false)
    const [showBucketModal, setShowBucketModal] = useState(false)
    const [showPDFPreview, setShowPDFPreview] = useState(false)
    const [isCreatingBucket, setIsCreatingBucket] = useState(false)
    const [bucketModalData, setBucketModalData] = useState({ name: '', description: '' })
    const [selectedTermId, setSelectedTermId] = useState(structure.termId)
    const [showGradeFeeStructure, setShowGradeFeeStructure] = useState(false)
    const [selectedGradeLevelId, setSelectedGradeLevelId] = useState<string | null>(null)
    
    const { data: gradeFeeAssignments, loading: loadingGradeFees, error: gradeFeesError, fetchAssignments } = useFeeAssignmentsByGradeLevels()

    // Sync selectedTermId if structure changes
    useEffect(() => {
        if (structure.termId && structure.termId !== selectedTermId) {
            setSelectedTermId(structure.termId)
        }
    }, [structure.termId])

    // Debug: Log the structure data
    console.log(`🎯 FeeStructureCard - kes{structure.structureName}:`, {
        termId: structure.termId,
        terms: structure.terms,
        termFeesMapKeys: structure.termFeesMap ? Object.keys(structure.termFeesMap) : [],
        selectedTermId
    })

    // Sort terms by term number (Term 1, Term 2, Term 3)
    const sortedTerms = useMemo(() => {
        if (!structure.terms || structure.terms.length === 0) return []
        
        return [...structure.terms].sort((a, b) => {
            // Extract term number from name (e.g., "Term 1" -> 1, "Term 2" -> 2)
            const getTermNumber = (name: string): number => {
                const match = name.match(/\d+/)
                return match ? parseInt(match[0], 10) : 999 // Put non-numeric terms at the end
            }
            
            return getTermNumber(a.name) - getTermNumber(b.name)
        })
    }, [structure.terms])

    // Get buckets for the selected term - use useMemo to ensure proper recomputation
    const displayBuckets = useMemo(() => {
        console.log(`  🔍 Computing displayBuckets for term: kes{selectedTermId}`)

        if (structure.termFeesMap && selectedTermId) {
            const buckets = structure.termFeesMap[selectedTermId]
            console.log(`  📦 Found kes{buckets?.length || 0} buckets in termFeesMap for term kes{selectedTermId}`)
            if (buckets && buckets.length > 0) {
                return buckets
            }
        }

        console.log(`  ⚠️ Falling back to default buckets (kes{structure.buckets?.length || 0})`)
        return structure.buckets || []
    }, [structure.termFeesMap, structure.buckets, selectedTermId])

    console.log(`  💰 Final display buckets:`, displayBuckets.map(b => `kes{b.name}: keskes{b.totalAmount}`))

    // Calculate term total (currently selected term)
    const termTotal = displayBuckets.reduce((sum: number, bucket: any) => sum + bucket.totalAmount, 0)

    // Calculate year total (all terms combined)
    const yearTotal = useMemo(() => {
        console.log(`  🧮 Calculating year total...`)

        if (!structure.termFeesMap || Object.keys(structure.termFeesMap).length === 0) {
            console.log(`  ⚠️ No termFeesMap, using termTotal * number of terms`)
            return termTotal * structure.terms.length
        }

        // Sum all buckets from all terms
        const total = Object.entries(structure.termFeesMap).reduce((yearSum, [termId, termBuckets]) => {
            const termSum = termBuckets.reduce((sum: number, bucket: any) => sum + bucket.totalAmount, 0)
            console.log(`    📊 Term kes{termId}: keskes{termSum}`)
            return yearSum + termSum
        }, 0)

        console.log(`  💵 Year Total: keskes{total}`)
        return total
    }, [structure.termFeesMap, structure.terms.length, termTotal])

    const hasAssignments = assignedGrades.length > 0

    // Handle term click to filter fees
    const handleTermClick = (termId: string) => {
        console.log(`🔄 User clicked term: kes{termId}`)
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
                        mutation CreateFeeBucket(kesinput: CreateFeeBucketInput!) {
                            createFeeBucket(input: kesinput) {
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
                throw new Error(`HTTP error! status: kes{response.status}`)
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
        // Use sorted terms to ensure proper order (Term 1, Term 2, Term 3)
        const termsToUse = sortedTerms.length > 0 ? sortedTerms : (structure.terms || [])
        
        // Use term-specific buckets from termFeesMap
        const termStructures = termsToUse.map((term) => {
            // Get buckets for this specific term, fallback to default buckets
            const termBuckets = structure.termFeesMap?.[term.id] || displayBuckets

            return {
                term: term.name as 'Term 1' | 'Term 2' | 'Term 3',
                academicYear: structure.academicYear,
                dueDate: '',
                latePaymentFee: '',
                earlyPaymentDiscount: '',
                earlyPaymentDeadline: '',
                buckets: termBuckets.map(bucket => ({
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
            }
        })

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
                buckets: displayBuckets.map(bucket => ({
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

    // Handle PDF download with slug-based filename
    const handleDownloadPDF = () => {
        // Create a slug from structure ID for the filename
        const pdfId = structure.structureId || structure.structureName.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')
        
        // Ensure print styles are applied by waiting a moment
        setTimeout(() => {
            window.print()
        }, 100)
    }

    return (
        <Card className={cn(
            "group relative overflow-hidden transition-all duration-300",
            "bg-gradient-to-br from-white via-white to-slate-50/30 border border-slate-200",
            "hover:shadow-xl hover:border-primary/30 hover:-translate-y-1 hover:shadow-primary/5",
            structure.isActive
                ? "shadow-lg ring-1 ring-primary/10 bg-gradient-to-br from-white via-primary/5 to-primary/10"
                : "shadow-sm opacity-90"
        )}>
            {/* Top accent bar with gradient */}
            <div className={cn(
                "absolute top-0 left-0 right-0 h-1.5",
                structure.isActive
                    ? "bg-gradient-to-r from-primary via-primary/90 to-primary/70"
                    : "bg-gradient-to-r from-slate-300 via-slate-300/80 to-slate-300/60"
            )} />

            {/* Status Badge - Top Right Corner */}
            {structure.isActive && (
                <div className="absolute top-0 right-0 z-10">
                    <Badge className="bg-primary text-white text-[9px] font-semibold uppercase px-2.5 py-1 shadow-md border-0">
                        Active
                    </Badge>
                </div>
            )}

            {/* Main Content */}
            <div className="px-5 pb-5 pt-3 relative">
                {/* Header Section */}
                <div className="flex items-start gap-3 mb-4">
                    <div className={cn(
                        "h-10 w-10 flex items-center justify-center flex-shrink-0 rounded-xl shadow-md transition-all duration-300 group-hover:scale-110 group-hover:shadow-lg relative",
                        structure.isActive
                            ? "bg-gradient-to-br from-primary via-primary/90 to-primary/80 text-white ring-2 ring-primary/20"
                            : "bg-gradient-to-br from-slate-400 via-slate-450 to-slate-500 text-white ring-2 ring-slate-200/50"
                    )}>
                        <FileText className="h-5 w-5 drop-shadow-sm" />
                        {structure.isActive && (
                            <div className="absolute inset-0 rounded-xl bg-primary/20 blur-sm -z-10" />
                        )}
                    </div>

                    <div className="flex-1 min-w-0 overflow-hidden">
                        <h3 className="text-sm font-semibold text-slate-900 leading-tight group-hover:text-primary transition-colors uppercase tracking-tight mb-1.5">
                            {structure.structureName}
                        </h3>
                        <div className="flex items-center gap-1.5 text-[10px] text-slate-600">
                            <Calendar className="h-3 w-3 flex-shrink-0 text-slate-500" />
                            <span className="font-medium truncate">{structure.academicYear}</span>
                        </div>
                    </div>
                </div>

                {/* Terms - Enhanced Design */}
                {(sortedTerms && sortedTerms.length > 0) || structure.termName ? (
                    <div className="mb-3">
                        <div className="flex flex-wrap gap-1.5 items-center">
                            {sortedTerms && sortedTerms.length > 0 ? (
                                sortedTerms.map((term: { id: string; name: string }) => (
                                    <button
                                        key={term.id}
                                        onClick={() => handleTermClick(term.id)}
                                        className={cn(
                                            "px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wide border rounded transition-all cursor-pointer shadow-sm",
                                            selectedTermId === term.id
                                                ? "bg-primary text-white border-primary shadow-md scale-105"
                                                : "bg-white text-slate-600 border-slate-200 hover:bg-primary/5 hover:border-primary/30 hover:shadow-md"
                                        )}
                                    >
                                        {term.name.toUpperCase()}
                                    </button>
                                ))
                            ) : (
                                <button className="px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wide bg-white text-slate-600 border border-slate-200 rounded hover:bg-primary/5 hover:border-primary/30 hover:shadow-md transition-all cursor-pointer shadow-sm">
                                    {structure.termName?.toUpperCase()}
                                </button>
                            )}
                        </div>
                    </div>
                ) : null}

                {/* Grades */}
                {structure.gradeLevels && structure.gradeLevels.length > 0 && (
                    <div className="mb-3">
                        <div className="flex items-center gap-1.5 mb-1.5">
                            <div className="text-[9px] font-semibold text-slate-500 uppercase tracking-wider">Grades</div>
                            <Badge variant="outline" className="text-[9px] border-slate-300 text-slate-600 bg-slate-50 px-1.5 py-0 font-normal">
                                {structure.gradeLevels?.length || 0}
                            </Badge>
                        </div>
                        <div className="flex flex-wrap gap-1.5">
                            {structure.gradeLevels.map((gradeLevel: any) => (
                                <button
                                    key={gradeLevel.id}
                                    onClick={() => {
                                        setSelectedGradeLevelId(gradeLevel.id)
                                        setShowGradeFeeStructure(true)
                                        fetchAssignments({
                                            tenantGradeLevelIds: [gradeLevel.id],
                                            feeStructureId: structure.structureId
                                        })
                                    }}
                                    className="px-2 py-0.5 text-[10px] font-normal bg-slate-50 text-slate-700 border border-slate-200 rounded-md hover:bg-primary/10 hover:border-primary/30 hover:text-primary transition-all cursor-pointer"
                                >
                                    {gradeLevel.gradeLevel?.name || gradeLevel.shortName || gradeLevel.name || 'Unknown'}
                                </button>
                            ))}
                        </div>
                    </div>
                )}

                {/* Totals - Enhanced Design */}
                <div className="mb-3 px-3 py-2 bg-gradient-to-r from-primary/10 via-primary/5 to-transparent border-l-2 border-primary/30">
                    <div className="flex items-center gap-1.5">
                        <div className="p-1 bg-primary/20 rounded">
                            <Coins className="h-3 w-3 text-primary flex-shrink-0" />
                        </div>
                        <span className="text-xs font-bold text-primary whitespace-nowrap">
                            <span className="text-[8px] font-normal opacity-70">KES</span> {termTotal.toLocaleString()}
                        </span>
                        {structure.terms.length > 1 && (
                            <>
                                <span className="text-[10px] text-slate-400 font-bold">•</span>
                                <div className="p-1 bg-emerald-100 rounded">
                                    <Building2 className="h-3 w-3 text-emerald-600 flex-shrink-0" />
                                </div>
                                <span className="text-xs font-bold text-emerald-700 whitespace-nowrap">
                                    <span className="text-[8px] font-normal opacity-70">KES</span> {yearTotal.toLocaleString()}
                                </span>
                            </>
                        )}
                    </div>
                </div>

                {/* Fee Components - One Per Row, No Dots */}
                {displayBuckets.length > 0 && (
                    <div className="mb-4">
                        <div className="flex items-center justify-between mb-2">
                            <h4 className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider">Components</h4>
                            <Badge variant="secondary" className="text-[10px] bg-slate-100 text-slate-600 border-slate-200 px-1.5 py-0 font-normal">
                                {displayBuckets.length}
                            </Badge>
                        </div>

                        {!isExpanded ? (
                            <div className="space-y-1.5">
                                {displayBuckets.slice(0, 2).map((bucket: any, idx: number) => (
                                    <div
                                        key={idx}
                                        className="flex items-center justify-between gap-2 px-3 py-2 bg-white border-l-2 border-slate-200 hover:border-l-primary hover:bg-primary/5 hover:shadow-sm transition-all group/item"
                                    >
                                        <div className="flex items-center gap-2 min-w-0 flex-1">
                                            <span className={cn(
                                                "text-xs font-normal truncate",
                                                bucket.isOptional ? "text-slate-600" : "text-slate-800"
                                            )}>
                                                {bucket.name}
                                            </span>
                                            {bucket.isOptional && (
                                                <Badge variant="outline" className="text-[9px] border-amber-200 text-amber-600 bg-amber-50 px-1 py-0 flex-shrink-0 font-medium">
                                                    OPT
                                                </Badge>
                                            )}
                                        </div>
                                        <span className="text-xs font-semibold text-slate-900 flex-shrink-0 whitespace-nowrap">
                                            <span className="text-[8px] font-normal opacity-70">KES</span> {bucket.totalAmount.toLocaleString()}
                                        </span>
                                    </div>
                                ))}
                                {displayBuckets.length > 2 && (
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => setIsExpanded(true)}
                                        className="w-full text-primary text-[10px] hover:bg-primary/5 hover:text-primary font-normal h-7"
                                    >
                                        <ChevronRight className="h-3 w-3 mr-1" />
                                        +{displayBuckets.length - 2} more
                                    </Button>
                                )}
                            </div>
                        ) : (
                            <div className="space-y-1.5">
                                {displayBuckets.map((bucket: any, idx: number) => (
                                    <div
                                        key={idx}
                                        className="flex items-center justify-between gap-2 px-3 py-2 bg-white border-l-2 border-slate-200 hover:border-l-primary hover:bg-primary/5 hover:shadow-sm transition-all group/item"
                                    >
                                        <div className="flex items-center gap-2 min-w-0 flex-1">
                                            <span className={cn(
                                                "text-xs font-normal truncate",
                                                bucket.isOptional ? "text-slate-600" : "text-slate-800"
                                            )}>
                                                {bucket.name}
                                            </span>
                                            {bucket.isOptional && (
                                                <Badge variant="outline" className="text-[9px] border-amber-200 text-amber-600 bg-amber-50 px-1 py-0 flex-shrink-0 font-medium">
                                                    OPT
                                                </Badge>
                                            )}
                                        </div>
                                        <span className="text-xs font-semibold text-slate-900 flex-shrink-0 whitespace-nowrap">
                                            <span className="text-[8px] font-normal opacity-70">KES</span> {bucket.totalAmount.toLocaleString()}
                                        </span>
                                    </div>
                                ))}
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => setIsExpanded(false)}
                                    className="w-full text-primary text-[10px] hover:bg-primary/5 hover:text-primary font-normal h-7"
                                >
                                    <ChevronDown className="h-3 w-3 mr-1" />
                                    Show less
                                </Button>
                            </div>
                        )}
                    </div>
                )}

                {/* Assignment Status Section - Enhanced */}
                {hasAssignments && (
                    <div className="mb-4 p-3 bg-gradient-to-br from-emerald-50 via-emerald-50/50 to-emerald-50/30 border-l-2 border-emerald-400 shadow-sm">
                        <div className="flex items-center gap-3">
                            <div className="h-10 w-10 rounded-full bg-gradient-to-br from-emerald-500 to-emerald-600 flex items-center justify-center shadow-md flex-shrink-0 ring-2 ring-emerald-200">
                                <CheckCircle className="h-5 w-5 text-white" />
                            </div>
                            <div className="flex-1 min-w-0">
                                <div className="text-xs font-bold text-emerald-900 mb-1 truncate">Currently Assigned</div>
                                <div className="text-[10px] text-slate-700 font-semibold truncate">
                                    {assignedGrades.length} grade{assignedGrades.length !== 1 ? 's' : ''} • {totalStudents} student{totalStudents !== 1 ? 's' : ''}
                                </div>
                            </div>
                            <Badge className="bg-emerald-600 text-white text-[9px] font-bold px-2.5 py-1 border-0 flex-shrink-0 whitespace-nowrap shadow-sm">Active</Badge>
                        </div>
                    </div>
                )}

                {/* Action Buttons - Enhanced Design */}
                <div className="pt-4 border-t-2 border-slate-200/50">
                    {/* Primary CTA - Full Width */}
                    {hasAssignments ? (
                        <Button
                            onClick={onGenerateInvoices}
                            size="sm"
                            className="w-full bg-gradient-to-r from-primary via-primary/95 to-primary/90 hover:from-primary/90 hover:via-primary hover:to-primary text-white shadow-md hover:shadow-lg transition-all duration-300 font-semibold mb-3 hover:scale-[1.02]"
                        >
                            <FileText className="h-4 w-4 mr-2" />
                            Generate Invoices
                        </Button>
                    ) : (
                        <Button
                            onClick={() => onAssignToGrade(structure.structureId)}
                            size="sm"
                            className="w-full bg-gradient-to-r from-primary via-primary/95 to-primary/90 hover:from-primary/90 hover:via-primary hover:to-primary text-white shadow-md hover:shadow-lg transition-all duration-300 font-semibold mb-3 hover:scale-[1.02]"
                        >
                            <Users className="h-4 w-4 mr-2" />
                            Assign to Grades
                        </Button>
                    )}

                    {/* Secondary Actions - Enhanced Icon Buttons */}
                    <div className="flex items-center gap-2">
                        <Button
                            onClick={onEdit}
                            variant="outline"
                            size="sm"
                            className="flex-1 border-slate-300 text-slate-700 hover:bg-primary/10 hover:border-primary/40 hover:text-primary transition-all duration-200 h-8 px-2 shadow-sm hover:shadow-md hover:scale-105"
                            title="Edit Structure"
                        >
                            <Edit className="h-4 w-4" />
                        </Button>

                        <Button
                            onClick={() => setShowBucketModal(true)}
                            variant="outline"
                            size="sm"
                            className="flex-1 border-slate-300 text-slate-700 hover:bg-primary/10 hover:border-primary/40 hover:text-primary transition-all duration-200 h-8 px-2 shadow-sm hover:shadow-md hover:scale-105"
                            title="Add Fee Bucket"
                        >
                            <Plus className="h-4 w-4" />
                        </Button>

                        <Button
                            onClick={() => setShowPDFPreview(true)}
                            variant="outline"
                            size="sm"
                            className="flex-1 border-slate-300 text-slate-700 hover:bg-primary/10 hover:border-primary/40 hover:text-primary transition-all duration-200 h-8 px-2 shadow-sm hover:shadow-md hover:scale-105"
                            title="Preview PDF"
                        >
                            <Eye className="h-4 w-4" />
                        </Button>

                        <Button
                            onClick={onDelete}
                            variant="outline"
                            size="sm"
                            className="flex-1 border-red-200 text-red-600 hover:bg-red-50 hover:border-red-300 hover:text-red-700 transition-all duration-200 h-8 px-2 shadow-sm hover:shadow-md hover:scale-105"
                            title="Delete Structure"
                        >
                            <Trash2 className="h-4 w-4" />
                        </Button>
                    </div>
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

            {/* PDF Preview Modal - A4 Sized */}
            <Dialog open={showPDFPreview} onOpenChange={setShowPDFPreview}>
                <style>{`
                    @media print {
                        @page {
                            margin: 15mm;
                            size: A4;
                        }
                        /* Hide dialog elements */
                        [data-radix-dialog-overlay],
                        [data-radix-dialog-content] > header,
                        button {
                            display: none !important;
                        }
                        /* Make dialog content full page */
                        [data-radix-dialog-content] {
                            position: static !important;
                            max-width: 100% !important;
                            width: 100% !important;
                            height: auto !important;
                            max-height: none !important;
                            margin: 0 !important;
                            padding: 0 !important;
                            box-shadow: none !important;
                            border: none !important;
                            overflow: visible !important;
                            page-break-inside: auto !important;
                        }
                        /* Remove any flex constraints */
                        [data-radix-dialog-content] > div {
                            height: auto !important;
                            max-height: none !important;
                            overflow: visible !important;
                            page-break-inside: auto !important;
                        }
                        /* PDF content container */
                        [data-pdf-content] {
                            position: static !important;
                            width: 100% !important;
                            height: auto !important;
                            min-height: 0 !important;
                            max-height: none !important;
                            margin: 0 !important;
                            padding: 0 !important;
                            overflow: visible !important;
                            display: block !important;
                            page-break-inside: auto !important;
                            break-inside: auto !important;
                        }
                        /* PDF preview container */
                        [data-pdf-content] > div {
                            position: static !important;
                            width: 100% !important;
                            height: auto !important;
                            min-height: 0 !important;
                            max-height: none !important;
                            margin: 0 !important;
                            padding: 0 !important;
                            page-break-inside: auto !important;
                            break-inside: auto !important;
                            overflow: visible !important;
                        }
                        /* Force content to flow */
                        [data-pdf-content] > div > * {
                            page-break-inside: auto !important;
                            break-inside: auto !important;
                        }
                        /* Allow tables to break across pages */
                        table {
                            page-break-inside: auto !important;
                        }
                        /* Allow rows to break */
                        tr {
                            page-break-inside: auto !important;
                        }
                        /* Table headers repeat on each page */
                        thead {
                            display: table-header-group !important;
                        }
                        /* Allow sections to break */
                        div {
                            page-break-inside: auto !important;
                        }
                        /* Body and html */
                        body, html {
                            margin: 0 !important;
                            padding: 0 !important;
                            height: auto !important;
                        }
                    }
                `}</style>
                <DialogContent className="max-w-[280mm] w-[280mm] max-h-[95vh] p-0 overflow-hidden flex flex-col print:p-0 print:m-0 print:max-w-none print:w-full print:h-full">
                    <DialogHeader className="px-6 pt-6 pb-4 border-b border-slate-200/60 bg-gradient-to-br from-white via-slate-50/30 to-white flex-shrink-0 print:hidden shadow-sm">
                        <div className="flex items-center justify-between">
                            <DialogTitle className="flex items-center gap-3">
                                <div className="h-10 w-10 flex items-center justify-center rounded-xl bg-gradient-to-br from-primary via-primary/90 to-primary/80 text-white shadow-md ring-2 ring-primary/20">
                                    <FileText className="h-5 w-5 drop-shadow-sm" />
                                </div>
                                <div className="flex flex-col">
                                    <span className="text-base font-semibold text-slate-900 leading-tight">
                                        Fee Structure Preview
                                    </span>
                                    <span className="text-sm text-slate-600 font-medium truncate max-w-md">
                                        {structure.structureName}
                                    </span>
                                </div>
                            </DialogTitle>
                            <div className="flex items-center gap-2">
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={handleDownloadPDF}
                                    className="border-primary/30 text-primary hover:bg-primary/10 hover:border-primary/50 hover:shadow-md transition-all duration-200 font-medium print:hidden"
                                >
                                    <Download className="h-4 w-4 mr-2" />
                                    Download PDF
                                </Button>
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => setShowPDFPreview(false)}
                                    className="h-9 w-9 p-0 hover:bg-slate-100 hover:text-slate-900 transition-all duration-200 print:hidden rounded-lg"
                                >
                                    <X className="h-4 w-4" />
                                </Button>
                            </div>
                        </div>
                    </DialogHeader>
                    <div className="flex-1 overflow-y-auto px-6 py-4 print:px-0 print:py-0 print:overflow-visible print:h-auto print:max-h-none">
                        <div data-pdf-content className="print:block print:w-full print:h-auto print:max-h-none">
                            <FeeStructurePDFPreview
                                formData={convertToPDFForm()}
                                schoolName={schoolName}
                                feeBuckets={displayBuckets.map(b => ({
                                    id: b.feeBucketId,
                                    name: b.name,
                                    description: ''
                                }))}
                                gradeLevels={structure.gradeLevels}
                            />
                        </div>
                    </div>
                </DialogContent>
            </Dialog>

            {/* Grade Fee Structure Drawer */}
            <Drawer open={showGradeFeeStructure} onOpenChange={(open) => { if (!open) setShowGradeFeeStructure(false) }} direction="right">
                <DrawerContent className="max-w-2xl">
                    <DrawerHeader>
                        <DrawerTitle className="flex items-center gap-2">
                            <Users className="h-5 w-5 text-primary" />
                            Fee Structure for Grade
                        </DrawerTitle>
                        <DrawerDescription>
                            {structure.gradeLevels.find((gl: any) => gl.id === selectedGradeLevelId)?.gradeLevel?.name || 
                             structure.gradeLevels.find((gl: any) => gl.id === selectedGradeLevelId)?.shortName || 
                             'Selected Grade'}
                        </DrawerDescription>
                    </DrawerHeader>

                    <ScrollArea className="flex-1 px-4">
                        {loadingGradeFees ? (
                            <div className="flex items-center justify-center p-8">
                                <Loader2 className="h-6 w-6 animate-spin text-primary" />
                                <span className="ml-2 text-sm">Loading fee assignments...</span>
                            </div>
                        ) : gradeFeesError ? (
                            <div className="p-4 border border-rose-200/40 rounded-md bg-rose-50/30 text-rose-700/70">
                                <p className="text-sm">{gradeFeesError}</p>
                            </div>
                        ) : gradeFeeAssignments && gradeFeeAssignments.length > 0 ? (
                            <div className="space-y-4 py-4">
                                {gradeFeeAssignments.map((assignment, index) => (
                                    <Card key={assignment.feeAssignment.id || index} className="p-4">
                                        <div className="space-y-3">
                                            <div className="flex items-start justify-between">
                                                <div>
                                                    <h3 className="font-semibold text-sm">{assignment.feeAssignment.feeStructure.name}</h3>
                                                    <p className="text-xs text-slate-600 mt-1">{assignment.feeAssignment.description}</p>
                                                </div>
                                                <Badge variant={assignment.feeAssignment.isActive ? "default" : "secondary"}>
                                                    {assignment.feeAssignment.isActive ? "Active" : "Inactive"}
                                                </Badge>
                                            </div>

                                            <div className="grid grid-cols-2 gap-2 text-xs">
                                                <div>
                                                    <span className="text-slate-500">Total Students:</span>
                                                    <span className="ml-2 font-medium">{assignment.totalStudents}</span>
                                                </div>
                                                <div>
                                                    <span className="text-slate-500">Assigned By:</span>
                                                    <span className="ml-2 font-medium">{assignment.feeAssignment.assignedByUser.name}</span>
                                                </div>
                                                <div>
                                                    <span className="text-slate-500">Created:</span>
                                                    <span className="ml-2 font-medium">{new Date(assignment.feeAssignment.createdAt).toLocaleDateString()}</span>
                                                </div>
                                                <div>
                                                    <span className="text-slate-500">Students Assigned:</span>
                                                    <span className="ml-2 font-medium">{assignment.feeAssignment.studentsAssignedCount}</span>
                                                </div>
                                            </div>

                                            {assignment.studentAssignments && assignment.studentAssignments.length > 0 && (
                                                <div className="mt-4 pt-4 border-t">
                                                    <h4 className="text-xs font-semibold mb-2">Student Assignments ({assignment.studentAssignments.length})</h4>
                                                    <div className="space-y-2 max-h-60 overflow-y-auto">
                                                        {assignment.studentAssignments.map((studentAssignment) => (
                                                            <div key={studentAssignment.id} className="p-2 bg-slate-50 rounded text-xs">
                                                                <div className="font-medium">{studentAssignment.student.user.name}</div>
                                                                <div className="text-slate-600">
                                                                    {studentAssignment.student.grade.gradeLevel.name}
                                                                </div>
                                                                {studentAssignment.feeItems && studentAssignment.feeItems.length > 0 && (
                                                                    <div className="mt-1 text-slate-500">
                                                                        {studentAssignment.feeItems.length} fee item{studentAssignment.feeItems.length !== 1 ? 's' : ''}
                                                                    </div>
                                                                )}
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>
                                            )}

                                            {assignment.studentAssignments.length === 0 && (
                                                <div className="text-center py-4 text-sm text-slate-500">
                                                    No students assigned yet
                                                </div>
                                            )}
                                        </div>
                                    </Card>
                                ))}
                            </div>
                        ) : (
                            <div className="p-8 text-center">
                                <p className="text-sm text-slate-500">No fee assignments found for this grade level</p>
                            </div>
                        )}
                    </ScrollArea>

                    <DrawerFooter>
                        <DrawerClose asChild>
                            <Button variant="outline">Close</Button>
                        </DrawerClose>
                    </DrawerFooter>
                </DrawerContent>
            </Drawer>
        </Card>
    )
}
