'use client'

import { GraduationCap, Calendar } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

interface Step1BasicInfoProps {
    formData: {
        name: string
        grade: string
        boardingType: 'day' | 'boarding' | 'both'
        academicYear: string
    }
    onChange: (field: string, value: any) => void
    errors?: Record<string, string>
}

export const Step1BasicInfo = ({ formData, onChange, errors }: Step1BasicInfoProps) => {
    const grades = [
        'Grade 1', 'Grade 2', 'Grade 3', 'Grade 4', 'Grade 5', 'Grade 6',
        'Grade 7', 'Grade 8', 'Form 1', 'Form 2', 'Form 3', 'Form 4'
    ]

    const currentYear = new Date().getFullYear()
    const years = [currentYear - 1, currentYear, currentYear + 1]

    return (
        <div className="space-y-6 animate-fadeIn">
            {/* Welcome Card */}
            <Card className="p-6 bg-gradient-to-br from-primary/5 to-primary-light/5 border-2 border-primary/20">
                <div className="flex items-start gap-4">
                    <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center">
                        <GraduationCap className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                        <h3 className="text-lg font-bold text-primary mb-1">Let's Create Your Fee Structure</h3>
                        <p className="text-sm text-slate-600">
                            Start by providing some basic information about this fee structure. Don't worry, you can always edit these later!
                        </p>
                    </div>
                </div>
            </Card>

            {/* Form Fields */}
            <div className="space-y-5">
                {/* Structure Name */}
                <div className="space-y-2">
                    <Label htmlFor="name" className="text-base font-semibold flex items-center gap-2">
                        Structure Name
                        <span className="text-red-500">*</span>
                    </Label>
                    <Input
                        id="name"
                        value={formData.name}
                        onChange={(e) => onChange('name', e.target.value)}
                        placeholder="e.g., Grade 1 Day Students - 2024"
                        className={`h-12 text-base ${errors?.name ? 'border-red-500' : 'border-slate-300 focus:border-primary'}`}
                    />
                    {errors?.name && (
                        <p className="text-sm text-red-600">{errors.name}</p>
                    )}
                    <p className="text-xs text-slate-500">
                        💡 Tip: Include the grade and year for easy identification
                    </p>
                </div>

                {/* Grid Layout for other fields */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    {/* Academic Year */}
                    <div className="space-y-2">
                        <Label htmlFor="academicYear" className="text-base font-semibold flex items-center gap-2">
                            <Calendar className="h-4 w-4 text-primary" />
                            Academic Year
                            <span className="text-red-500">*</span>
                        </Label>
                        <Select value={formData.academicYear} onValueChange={(value) => onChange('academicYear', value)}>
                            <SelectTrigger className={`h-12 ${errors?.academicYear ? 'border-red-500' : ''}`}>
                                <SelectValue placeholder="Select year" />
                            </SelectTrigger>
                            <SelectContent>
                                {years.map(year => (
                                    <SelectItem key={year} value={year.toString()}>{year}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        {errors?.academicYear && (
                            <p className="text-sm text-red-600">{errors.academicYear}</p>
                        )}
                    </div>

                    {/* Grade Selection */}
                    <div className="space-y-2">
                        <Label htmlFor="grade" className="text-base font-semibold flex items-center gap-2">
                            <GraduationCap className="h-4 w-4 text-primary" />
                            Grade/Form
                            <span className="text-red-500">*</span>
                        </Label>
                        <Select value={formData.grade} onValueChange={(value) => onChange('grade', value)}>
                            <SelectTrigger className={`h-12 ${errors?.grade ? 'border-red-500' : ''}`}>
                                <SelectValue placeholder="Select grade" />
                            </SelectTrigger>
                            <SelectContent>
                                {grades.map(grade => (
                                    <SelectItem key={grade} value={grade}>{grade}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        {errors?.grade && (
                            <p className="text-sm text-red-600">{errors.grade}</p>
                        )}
                    </div>
                </div>

                {/* Boarding Type - Full Width with Visual Cards */}
                <div className="space-y-3">
                    <Label className="text-base font-semibold flex items-center gap-2">
                        Boarding Type
                        <span className="text-red-500">*</span>
                    </Label>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {[
                            { value: 'day', label: 'Day Students', icon: '🏫', description: 'Students who go home daily' },
                            { value: 'boarding', label: 'Boarding Students', icon: '🏠', description: 'Students who stay at school' },
                            { value: 'both', label: 'Day & Boarding', icon: '🎯', description: 'Mixed student types' }
                        ].map((option) => (
                            <button
                                key={option.value}
                                type="button"
                                onClick={() => onChange('boardingType', option.value)}
                                className={cn(
                                    "p-4 rounded-xl border-2 transition-all duration-300 text-left",
                                    formData.boardingType === option.value
                                        ? "border-primary bg-primary/5 shadow-lg shadow-primary/20"
                                        : "border-slate-200 hover:border-primary/40 hover:shadow-md"
                                )}
                            >
                                <div className="flex items-start gap-3">
                                    <span className="text-2xl">{option.icon}</span>
                                    <div className="flex-1">
                                        <div className="font-semibold text-slate-900">{option.label}</div>
                                        <div className="text-xs text-slate-600 mt-1">{option.description}</div>
                                    </div>
                                    {formData.boardingType === option.value && (
                                        <Badge className="bg-primary text-white">Selected</Badge>
                                    )}
                                </div>
                            </button>
                        ))}
                    </div>
                    {errors?.boardingType && (
                        <p className="text-sm text-red-600">{errors.boardingType}</p>
                    )}
                </div>
            </div>

            {/* Summary Preview */}
            {formData.name && formData.grade && (
                <Card className="p-4 bg-slate-50 border-slate-200">
                    <div className="text-sm text-slate-600">
                        <span className="font-semibold text-slate-700">Preview:</span>{' '}
                        Creating fee structure for <span className="font-semibold text-primary">{formData.grade}</span>{' '}
                        {formData.boardingType && (
                            <>
                                ({formData.boardingType === 'both' ? 'Day & Boarding' : formData.boardingType === 'day' ? 'Day Students' : 'Boarding Students'}){' '}
                            </>
                        )}
                        for academic year <span className="font-semibold text-primary">{formData.academicYear}</span>
                    </div>
                </Card>
            )}
        </div>
    )
}

function cn(...classes: (string | boolean | undefined)[]) {
    return classes.filter(Boolean).join(' ')
}
