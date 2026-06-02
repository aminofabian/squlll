import { Search, X, User } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { StudentSummary } from '../types'
import { useState, useRef, useEffect } from 'react'
import { cn } from '@/lib/utils'
import { FEES_BRAND } from '../lib/fees-ui'

interface StudentSearchBarProps {
    selectedStudent: string | null
    searchTerm: string
    setSearchTerm: (term: string) => void
    filteredStudents: StudentSummary[]
    onStudentSelect: (studentId: string) => void
    onClearSelection: () => void
    variant?: 'default' | 'compact'
}

export const StudentSearchBar = ({
    selectedStudent,
    searchTerm,
    setSearchTerm,
    filteredStudents,
    onStudentSelect,
    onClearSelection,
    variant = 'default',
}: StudentSearchBarProps) => {
    const [showDropdown, setShowDropdown] = useState(false)
    const searchRef = useRef<HTMLDivElement>(null)
    const compact = variant === 'compact'

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
                setShowDropdown(false)
            }
        }
        document.addEventListener('mousedown', handleClickOutside)
        return () => document.removeEventListener('mousedown', handleClickOutside)
    }, [])

    const selectedStudentData = filteredStudents.find(s => s.id === selectedStudent)

    return (
        <div className="relative" ref={searchRef}>
            {selectedStudent ? (
                <div
                    className={cn(
                        'flex items-center gap-2 rounded-xl border',
                        compact
                            ? 'border-emerald-200/80 bg-white px-3 py-2 shadow-sm'
                            : 'border-emerald-100 bg-emerald-50/50 p-3',
                    )}
                >
                    <div
                        className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-white"
                        style={{ backgroundColor: FEES_BRAND.primary }}
                    >
                        <User className="h-4 w-4" />
                    </div>
                    <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-semibold text-slate-900">
                            {selectedStudentData?.name || 'Student'}
                        </p>
                        {selectedStudentData?.admissionNumber && (
                            <p className="truncate text-xs text-slate-500">
                                {selectedStudentData.admissionNumber}
                                {selectedStudentData.class
                                    ? ` · ${selectedStudentData.class}`
                                    : ''}
                            </p>
                        )}
                    </div>
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={onClearSelection}
                        className="h-8 shrink-0 text-slate-500 hover:text-slate-800"
                    >
                        <X className="h-4 w-4" />
                    </Button>
                </div>
            ) : (
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                    <Input
                        type="text"
                        placeholder={
                            compact
                                ? 'Name or admission no…'
                                : 'Search by name or admission number…'
                        }
                        value={searchTerm}
                        onChange={(e) => {
                            setSearchTerm(e.target.value)
                            setShowDropdown(true)
                        }}
                        onFocus={() => setShowDropdown(true)}
                        className={cn(
                            'rounded-xl border-slate-200 bg-white pl-10 shadow-sm focus-visible:ring-emerald-600/25',
                            compact ? 'h-10 text-sm' : 'h-11 text-sm',
                        )}
                    />

                    {showDropdown && searchTerm && filteredStudents.length > 0 && (
                        <div className="absolute top-full left-0 right-0 z-50 mt-2 max-h-72 overflow-y-auto rounded-xl border border-slate-200 bg-white shadow-xl">
                            <div className="p-1.5">
                                <div className="px-3 py-2 text-xs font-medium text-slate-500">
                                    {filteredStudents.length} match
                                    {filteredStudents.length !== 1 ? 'es' : ''}
                                </div>
                                {filteredStudents.slice(0, 10).map((student) => (
                                    <button
                                        key={student.id}
                                        type="button"
                                        onClick={() => {
                                            onStudentSelect(student.id)
                                            setShowDropdown(false)
                                            setSearchTerm('')
                                        }}
                                        className="w-full rounded-lg px-3 py-2.5 text-left transition-colors hover:bg-emerald-50"
                                    >
                                        <div className="text-sm font-medium text-slate-900">
                                            {student.name}
                                        </div>
                                        <div className="text-xs text-slate-500">
                                            {student.admissionNumber} · {student.class}
                                        </div>
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}

                    {showDropdown && searchTerm && filteredStudents.length === 0 && (
                        <div className="absolute top-full left-0 right-0 z-50 mt-2 rounded-xl border border-slate-200 bg-white p-4 shadow-xl">
                            <p className="text-center text-sm text-slate-500">
                                No students match &quot;{searchTerm}&quot;
                            </p>
                        </div>
                    )}
                </div>
            )}
        </div>
    )
}
