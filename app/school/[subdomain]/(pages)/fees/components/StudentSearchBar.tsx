import { Search, X } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { StudentSummary } from '../types'
import { useState, useRef, useEffect } from 'react'

interface StudentSearchBarProps {
    selectedStudent: string | null
    searchTerm: string
    setSearchTerm: (term: string) => void
    filteredStudents: StudentSummary[]
    onStudentSelect: (studentId: string) => void
    onClearSelection: () => void
}

export const StudentSearchBar = ({
    selectedStudent,
    searchTerm,
    setSearchTerm,
    filteredStudents,
    onStudentSelect,
    onClearSelection
}: StudentSearchBarProps) => {
    const [showDropdown, setShowDropdown] = useState(false)
    const searchRef = useRef<HTMLDivElement>(null)

    // Close dropdown when clicking outside
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
                // Show selected student with clear button
                <div className="flex items-center gap-2 p-3 bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200 rounded-xl">
                    <div className="flex-1">
                        <div className="flex items-center gap-2">
                            <span className="text-sm font-semibold text-slate-700">Selected Student:</span>
                            <span className="text-sm font-bold text-blue-600">
                                {selectedStudentData?.name || 'Unknown Student'}
                            </span>
                            {selectedStudentData?.admissionNumber && (
                                <span className="text-xs text-slate-500 font-mono">
                                    ({selectedStudentData.admissionNumber})
                                </span>
                            )}
                        </div>
                    </div>
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={onClearSelection}
                        className="hover:bg-red-100 hover:text-red-600 transition-colors"
                    >
                        <X className="h-4 w-4 mr-1" />
                        Clear
                    </Button>
                </div>
            ) : (
                // Show search input
                <div className="relative">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
                        <Input
                            type="text"
                            placeholder="Search students..."
                            value={searchTerm}
                            onChange={(e) => {
                                setSearchTerm(e.target.value)
                                setShowDropdown(true)
                            }}
                            onFocus={() => setShowDropdown(true)}
                            className="pl-10 pr-4 py-6 text-sm border-slate-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 rounded-xl"
                        />
                    </div>

                    {/* Dropdown with search results */}
                    {showDropdown && searchTerm && filteredStudents.length > 0 && (
                        <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-slate-200 rounded-xl shadow-xl max-h-80 overflow-y-auto z-50">
                            <div className="p-2">
                                <div className="text-xs font-semibold text-slate-500 px-3 py-2">
                                    {filteredStudents.length} student{filteredStudents.length !== 1 ? 's' : ''} found
                                </div>
                                {filteredStudents.slice(0, 10).map((student) => (
                                    <button
                                        key={student.id}
                                        onClick={() => {
                                            onStudentSelect(student.id)
                                            setShowDropdown(false)
                                            setSearchTerm('')
                                        }}
                                        className="w-full text-left px-3 py-3 hover:bg-blue-50 rounded-lg transition-colors group"
                                    >
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <div className="font-semibold text-sm text-slate-900 group-hover:text-blue-600">
                                                    {student.name}
                                                </div>
                                                <div className="text-xs text-slate-500 mt-0.5">
                                                    {student.admissionNumber} • {student.class}
                                                </div>
                                            </div>
                                            <div className="text-xs font-mono text-slate-400">
                                                Click to view
                                            </div>
                                        </div>
                                    </button>
                                ))}
                                {filteredStudents.length > 10 && (
                                    <div className="text-xs text-slate-500 px-3 py-2 text-center border-t border-slate-100 mt-2">
                                        Showing 10 of {filteredStudents.length} results. Keep typing to narrow down.
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    {/* No results message */}
                    {showDropdown && searchTerm && filteredStudents.length === 0 && (
                        <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-slate-200 rounded-xl shadow-xl p-4 z-50">
                            <div className="text-center text-sm text-slate-500">
                                No students found matching "{searchTerm}"
                            </div>
                        </div>
                    )}
                </div>
            )}
        </div>
    )
}
