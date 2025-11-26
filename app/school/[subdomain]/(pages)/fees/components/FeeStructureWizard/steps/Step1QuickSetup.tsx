'use client'

import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Check } from 'lucide-react'
import { cn } from '@/lib/utils'

interface Step1QuickSetupProps {
    formData: {
        name: string
        selectedGrades: string[]
        boardingType: 'day' | 'boarding' | 'both'
        academicYear: string
    }
    onChange: (field: string, value: any) => void
    errors?: Record<string, string>
}

export const Step1QuickSetup = ({ formData, onChange, errors }: Step1QuickSetupProps) => {
    const currentYear = new Date().getFullYear()
    const grades = [
        'Grade 1', 'Grade 2', 'Grade 3', 'Grade 4',
        'Grade 5', 'Grade 6', 'Grade 7', 'Grade 8',
        'Form 1', 'Form 2', 'Form 3', 'Form 4'
    ]

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
                    <Select value={formData.academicYear} onValueChange={(v) => onChange('academicYear', v)}>
                        <SelectTrigger className="h-11">
                            <SelectValue placeholder="Select year" />
                        </SelectTrigger>
                        <SelectContent>
                            {[currentYear - 1, currentYear, currentYear + 1].map(y => (
                                <SelectItem key={y} value={y.toString()}>{y}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
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
