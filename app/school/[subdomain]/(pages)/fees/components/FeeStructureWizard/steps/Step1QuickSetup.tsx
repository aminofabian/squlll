'use client'

import { useEffect, useState } from 'react'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Check, Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils'

interface Step1QuickSetupProps {
    formData: {
        name: string
        selectedGrades: string[]
        boardingType: 'day' | 'boarding' | 'both'
        academicYear: string
        academicYearId?: string
        terms?: Array<{ id: string; name: string }>
    }
    onChange: (field: string, value: any) => void
    errors?: Record<string, string>
}

export const Step1QuickSetup = ({ formData, onChange, errors }: Step1QuickSetupProps) => {
    const currentYear = new Date().getFullYear()
    const [academicYears, setAcademicYears] = useState<Array<{ id: string; name: string; terms: Array<{ id: string; name: string }> }>>([])
    const [isLoadingYears, setIsLoadingYears] = useState(false)
    
    const grades = [
        'Grade 1', 'Grade 2', 'Grade 3', 'Grade 4',
        'Grade 5', 'Grade 6', 'Grade 7', 'Grade 8',
        'Form 1', 'Form 2', 'Form 3', 'Form 4'
    ]

    // Fetch academic years with terms
    useEffect(() => {
        const fetchAcademicYears = async () => {
            setIsLoadingYears(true)
            try {
                const response = await fetch('/api/graphql', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        query: `
                            query GetAcademicYears {
                                academicYears {
                                    id
                                    name
                                    terms {
                                        id
                                        name
                                    }
                                }
                            }
                        `
                    })
                })

                if (!response.ok) return

                const result = await response.json()
                if (result.errors || !result.data?.academicYears) return

                setAcademicYears(result.data.academicYears)
                
                // Auto-select first academic year if none selected
                if (!formData.academicYearId && result.data.academicYears.length > 0) {
                    const firstYear = result.data.academicYears[0]
                    onChange('academicYear', firstYear.name)
                    onChange('academicYearId', firstYear.id)
                    onChange('terms', firstYear.terms || [])
                }
            } catch (error) {
                console.error('Error fetching academic years:', error)
            } finally {
                setIsLoadingYears(false)
            }
        }

        fetchAcademicYears()
    }, [])

    // Update terms when academic year changes
    const handleAcademicYearChange = (yearName: string) => {
        onChange('academicYear', yearName)
        const selectedYear = academicYears.find(ay => ay.name === yearName)
        if (selectedYear) {
            onChange('academicYearId', selectedYear.id)
            onChange('terms', selectedYear.terms || [])
        }
    }

    const toggleGrade = (grade: string) => {
        const selected = formData.selectedGrades || []
        const newSelected = selected.includes(grade)
            ? selected.filter(g => g !== grade)
            : [...selected, grade]
        onChange('selectedGrades', newSelected)
    }

    return (
        <div className="space-y-6">
            {/* Structure Name */}
            <div>
                <label className="text-sm font-medium text-slate-700 mb-2 block">
                    Structure Name
                </label>
                <Input
                    value={formData.name}
                    onChange={(e) => onChange('name', e.target.value)}
                    placeholder="e.g., Primary Day Students 2024"
                    className={cn("h-11", errors?.name && "border-red-500")}
                />
                {errors?.name && (
                    <p className="text-sm text-red-600 mt-1">{errors.name}</p>
                )}
            </div>

            {/* Academic Year & Boarding Type */}
            <div className="grid grid-cols-2 gap-4">
                <div>
                    <label className="text-sm font-medium text-slate-700 mb-2 block">
                        Academic Year
                    </label>
                    {isLoadingYears ? (
                        <div className="h-11 flex items-center gap-2 text-sm text-slate-500">
                            <Loader2 className="h-4 w-4 animate-spin" />
                            Loading...
                        </div>
                    ) : (
                        <Select value={formData.academicYear} onValueChange={handleAcademicYearChange}>
                            <SelectTrigger className="h-11">
                                <SelectValue placeholder="Select academic year" />
                            </SelectTrigger>
                            <SelectContent>
                                {academicYears.map(ay => (
                                    <SelectItem key={ay.id} value={ay.name}>
                                        {ay.name} {ay.terms.length > 0 && `(${ay.terms.length} terms)`}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    )}
                    {formData.terms && formData.terms.length > 0 && (
                        <p className="text-xs text-slate-500 mt-1">
                            {formData.terms.length} term{formData.terms.length !== 1 ? 's' : ''} available: {formData.terms.map(t => t.name).join(', ')}
                        </p>
                    )}
                </div>

                <div>
                    <label className="text-sm font-medium text-slate-700 mb-2 block">
                        Student Type
                    </label>
                    <Select value={formData.boardingType} onValueChange={(v) => onChange('boardingType', v as any)}>
                        <SelectTrigger className="h-11">
                            <SelectValue placeholder="Select type" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="day">🏫 Day Students</SelectItem>
                            <SelectItem value="boarding">🏠 Boarding Students</SelectItem>
                            <SelectItem value="both">🎯 Day & Boarding</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
            </div>

            {/* Multi-Grade Selection */}
            <div>
                <label className="text-sm font-medium text-slate-700 mb-2 block">
                    Select Grades <span className="text-slate-500">(select one or more)</span>
                </label>
                <div className="grid grid-cols-3 md:grid-cols-4 gap-2">
                    {grades.map((grade) => {
                        const isSelected = (formData.selectedGrades || []).includes(grade)

                        return (
                            <button
                                key={grade}
                                type="button"
                                onClick={() => toggleGrade(grade)}
                                className={cn(
                                    "relative h-11 rounded-lg border-2 transition-all font-medium text-sm flex items-center justify-center gap-2",
                                    isSelected
                                        ? "border-primary bg-primary text-white"
                                        : "border-slate-200 hover:border-primary/50 text-slate-700"
                                )}
                            >
                                {grade}
                                {isSelected && (
                                    <Check className="h-4 w-4" />
                                )}
                            </button>
                        )
                    })}
                </div>
                {errors?.selectedGrades && (
                    <p className="text-sm text-red-600 mt-2">{errors.selectedGrades}</p>
                )}
            </div>

            {/* Selected Summary */}
            {formData.selectedGrades?.length > 0 && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <div className="flex items-center gap-2">
                        <div className="text-sm font-medium text-blue-900">
                            {formData.selectedGrades.length} {formData.selectedGrades.length === 1 ? 'grade' : 'grades'} selected
                        </div>
                        <div className="text-sm text-blue-700">
                            • {formData.selectedGrades.join(', ')}
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}
