'use client'

import { useEffect, useState } from 'react'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Button } from '@/components/ui/button'
import { Check, Loader2, Settings2 } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useGradeLevelsForSchoolType } from '@/lib/hooks/useGradeLevelsForSchoolType'
import { FeesWizardSection } from '../FeesWizardLayout'

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
    /** Grades/year already chosen in guided setup — show summary only */
    guidedFromSetup?: boolean
    onEditSetup?: () => void
}

export const Step1QuickSetup = ({
    formData,
    onChange,
    errors,
    guidedFromSetup = false,
    onEditSetup,
}: Step1QuickSetupProps) => {
    const [academicYears, setAcademicYears] = useState<Array<{ id: string; name: string; terms: Array<{ id: string; name: string }> }>>([])
    const [isLoadingYears, setIsLoadingYears] = useState(false)
    
    const { data: gradeLevels = [], isLoading: gradesLoading } =
        useGradeLevelsForSchoolType()

    const gradeOptions = gradeLevels
        .map((gl) => gl.gradeLevel?.name || gl.shortName || '')
        .filter((name): name is string => Boolean(name?.trim()))

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
                                    terms { id name }
                                }
                            }
                        `
                    })
                })

                if (!response.ok) return

                const result = await response.json()
                if (result.errors || !result.data?.academicYears) return

                setAcademicYears(result.data.academicYears)
                
                if (
                    !guidedFromSetup &&
                    !formData.academicYearId &&
                    result.data.academicYears.length > 0
                ) {
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
    }, [guidedFromSetup])

    const handleAcademicYearChange = (yearName: string) => {
        onChange('academicYear', yearName)
        const selectedYear = academicYears.find(ay => ay.name === yearName)
        if (selectedYear) {
            onChange('academicYearId', selectedYear.id)
            onChange('terms', selectedYear.terms || [])
        }
    }

    const selectedGrades = formData.selectedGrades || []
    const selectedCount = selectedGrades.length
    const termLabels =
        formData.terms?.map((t) => t.name).join(' · ') || '—'

    return (
        <div className="space-y-5">
            {guidedFromSetup && onEditSetup ? (
                <div className="flex justify-end">
                    <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        className="h-8 border-emerald-200 text-emerald-900"
                        onClick={onEditSetup}
                    >
                        <Settings2 className="mr-1.5 h-3.5 w-3.5" />
                        Edit categories & grade amounts
                    </Button>
                </div>
            ) : null}

            <FeesWizardSection title="Basics">
                <div className="space-y-4">
                    <div>
                        <label className="text-xs font-medium uppercase tracking-wide text-slate-400 mb-1.5 block">
                            Plan name
                        </label>
                        <Input
                            value={formData.name}
                            onChange={(e) => onChange('name', e.target.value)}
                            placeholder="e.g. 2027-2028 · All grades · Day & boarding"
                            className={cn('h-10', errors?.name && 'border-red-500')}
                        />
                        {errors?.name && (
                            <p className="text-xs text-red-600 mt-1">{errors.name}</p>
                        )}
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                            <label className="text-xs font-medium uppercase tracking-wide text-slate-400 mb-1.5 block">
                                Academic year
                            </label>
                            {guidedFromSetup ? (
                                <p className="h-10 flex items-center text-sm font-medium text-slate-800">
                                    {formData.academicYear || '—'}
                                    {formData.terms?.length ? (
                                        <span className="ml-2 text-slate-500 font-normal">
                                            · {termLabels}
                                        </span>
                                    ) : null}
                                </p>
                            ) : isLoadingYears ? (
                                <div className="h-10 flex items-center gap-2 text-sm text-slate-500">
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                    Loading…
                                </div>
                            ) : (
                                <Select value={formData.academicYear} onValueChange={handleAcademicYearChange}>
                                    <SelectTrigger className="h-10">
                                        <SelectValue placeholder="Select year" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {academicYears.map(ay => (
                                            <SelectItem key={ay.id} value={ay.name}>
                                                {ay.name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            )}
                        </div>

                        <div>
                            <label className="text-xs font-medium uppercase tracking-wide text-slate-400 mb-1.5 block">
                                Student type
                            </label>
                            <Select value={formData.boardingType} onValueChange={(v) => onChange('boardingType', v as 'day' | 'boarding' | 'both')}>
                                <SelectTrigger className="h-10">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="day">Day</SelectItem>
                                    <SelectItem value="boarding">Boarding</SelectItem>
                                    <SelectItem value="both">Day & boarding</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                </div>
            </FeesWizardSection>

            <FeesWizardSection
                title={
                    guidedFromSetup
                        ? `Grades · ${selectedCount}`
                        : `Grades${selectedCount > 0 ? ` · ${selectedCount} selected` : ''}`
                }
            >
                {guidedFromSetup ? (
                    <div className="flex flex-wrap gap-1.5">
                        {selectedGrades.map((grade) => (
                            <span
                                key={grade}
                                className="inline-flex items-center rounded-full border border-emerald-200 bg-white px-2.5 py-1 text-sm font-medium text-slate-800"
                            >
                                {grade}
                            </span>
                        ))}
                    </div>
                ) : gradesLoading ? (
                    <div className="flex items-center gap-2 text-sm text-slate-500 py-2">
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Loading…
                    </div>
                ) : gradeOptions.length === 0 ? (
                    <p className="text-sm text-slate-500">
                        No grades found. Complete school setup first.
                    </p>
                ) : (
                    <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                        {gradeOptions.map((grade) => {
                            const isSelected = selectedGrades.includes(grade)

                            return (
                                <button
                                    key={grade}
                                    type="button"
                                    onClick={() => {
                                        const newSelected = isSelected
                                            ? selectedGrades.filter((g) => g !== grade)
                                            : [...selectedGrades, grade]
                                        onChange('selectedGrades', newSelected)
                                    }}
                                    className={cn(
                                        'h-9 rounded-lg border text-sm font-medium transition-colors flex items-center justify-center gap-1',
                                        isSelected
                                            ? 'border-primary bg-primary text-white shadow-sm'
                                            : 'border-slate-200 bg-white text-slate-700 hover:border-slate-300',
                                    )}
                                >
                                    {grade}
                                    {isSelected && <Check className="h-3.5 w-3.5" />}
                                </button>
                            )
                        })}
                    </div>
                )}
                {!guidedFromSetup && errors?.selectedGrades ? (
                    <p className="text-xs text-red-600 mt-3">{errors.selectedGrades}</p>
                ) : null}
            </FeesWizardSection>
        </div>
    )
}
