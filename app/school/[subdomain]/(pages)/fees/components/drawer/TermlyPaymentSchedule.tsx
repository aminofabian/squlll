'use client'

import React from 'react'
import { Loader2, GraduationCap, Trash2, Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

interface TermlyPaymentScheduleProps {
  formData: any
  academicYears: any[]
  academicYearsLoading: boolean
  academicYearsError: any
  updateTermStructure: (index: number, field: string, value: any) => void
  addTermStructure: () => void
  removeTermStructure: (index: number) => void
  calculateTermTotal: (index: number) => number
  calculateGrandTotal: () => number
}

export const TermlyPaymentSchedule: React.FC<TermlyPaymentScheduleProps> = ({
  formData,
  academicYears,
  academicYearsLoading,
  academicYearsError,
  updateTermStructure,
  addTermStructure,
  removeTermStructure,
  calculateTermTotal,
  calculateGrandTotal
}) => {
  
  return (
    <div className="mb-8 px-6">
      <h3 className="text-center font-bold underline mb-2">
        TERMLY PAYMENT FOR THE YEAR {formData.academicYear}
      </h3>
      <div className="flex justify-center mb-3">
        <div className="inline-flex items-center bg-blue-50 text-blue-700 text-xs px-3 py-1 border border-blue-200">
          <GraduationCap className="h-3 w-3 mr-2" />
          Click on the Academic Year field under each term to set a specific year
        </div>
      </div>
      <div className="flex justify-center">
        <table className="border-collapse border border-primary/30">
          <thead>
            <tr className="bg-primary/10">
              <th className="border border-primary/30 p-2 text-left font-bold text-slate-700">
                <div className="flex items-center gap-2">
                  <span>TERM</span>
                  <Badge variant="outline" className="text-xs bg-blue-50 text-blue-700 border-blue-200">
                    <GraduationCap className="h-3 w-3 mr-1" />
                    ACADEMIC YEAR
                  </Badge>
                </div>
              </th>
              <th className="border border-primary/30 p-2 text-right font-bold text-slate-700">AMOUNT</th>
              <th className="border border-primary/30 p-2 w-16"></th>
            </tr>
          </thead>
          <tbody>
            {formData.termStructures.map((term: any, index: number) => (
              <tr key={index} className="hover:bg-primary/5 group">
                <td className="border border-primary/30 p-2">
                  <div className="flex flex-col gap-1">
                    <Select
                      value={term.term}
                      onValueChange={(value) => updateTermStructure(index, 'term', value)}
                    >
                      <SelectTrigger className="bg-transparent border-0 focus:bg-white focus:outline-none focus:ring-1 focus:ring-primary/30 px-1 font-bold h-8">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {(() => {
                          // Find academic year by name
                          const selectedAcademicYear = academicYears.find(year => year.name === formData.academicYear)
                          
                          // Get all terms for this academic year
                          let availableTerms = selectedAcademicYear?.terms || []
                          
                          // Render the terms as options
                          if (availableTerms && availableTerms.length > 0) {
                            return availableTerms.map((term: any) => (
                              <SelectItem key={term.id} value={term.name}>
                                {term.name.toUpperCase()}
                              </SelectItem>
                            ))
                          } else {
                            return (
                              <SelectItem value="" disabled>
                                {academicYearsLoading ? "Loading terms..." : "No terms available for this academic year"}
                              </SelectItem>
                            )
                          }
                        })()}
                      </SelectContent>
                    </Select>
                    <div className="flex items-center gap-1">
                      {/* Academic Year Display */}
                      <Select
                        value={term.academicYear || formData.academicYear}
                        onValueChange={(value) => updateTermStructure(index, 'academicYear', value)}
                      >
                        <SelectTrigger className="bg-blue-50 border border-blue-200 hover:bg-blue-100 focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary/30 px-2 text-xs text-blue-700 font-medium h-7 w-full transition-colors duration-200">
                          <div className="flex items-center gap-1">
                            <GraduationCap className="h-3 w-3" />
                            <SelectValue placeholder="Select Academic Year" />
                          </div>
                        </SelectTrigger>
                        <SelectContent>
                          {academicYearsLoading ? (
                            <SelectItem value="loading" disabled>
                              <div className="flex items-center gap-2">
                                <Loader2 className="h-3 w-3 animate-spin" />
                                <span>Loading...</span>
                              </div>
                            </SelectItem>
                          ) : academicYearsError ? (
                            <SelectItem value="error" disabled>
                              <div className="flex items-center gap-2 text-red-600">
                                <span>Error loading</span>
                              </div>
                            </SelectItem>
                          ) : academicYears.length === 0 ? (
                            <SelectItem value="empty" disabled>
                              <div className="flex items-center gap-2 text-gray-500">
                                <span>No academic years</span>
                              </div>
                            </SelectItem>
                          ) : (
                            academicYears.map((year) => (
                              <SelectItem key={year.id} value={year.name}>
                                <div className="flex items-center gap-2">
                                  <span>{year.name}</span>
                                  {year.isActive && (
                                    <Badge variant="outline" className="text-xs bg-green-50 text-green-700 border-green-200">
                                      Active
                                    </Badge>
                                  )}
                                </div>
                              </SelectItem>
                            ))
                          )}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </td>
                <td className="border border-primary/30 p-2 text-right">
                  {calculateTermTotal(index).toLocaleString('en-KE', { 
                    minimumFractionDigits: 2, 
                    maximumFractionDigits: 2 
                  })}
                </td>
                <td className="border border-primary/30 p-1 text-center">
                  {formData.termStructures.length > 1 && (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                      onClick={() => removeTermStructure(index)}
                    >
                      <Trash2 className="h-3 w-3 text-red-500" />
                    </Button>
                  )}
                </td>
              </tr>
            ))}
            <tr>
              <td className="border border-primary/30 p-2">
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-xs text-primary hover:bg-primary/10"
                  onClick={addTermStructure}
                >
                  <Plus className="h-3 w-3 mr-1" />
                  Add Term
                </Button>
              </td>
              <td className="border border-primary/30 p-2"></td>
              <td className="border border-primary/30 p-2"></td>
            </tr>
            <tr className="bg-primary/10 font-bold">
              <td className="border border-primary/30 p-2 text-slate-700">TOTAL</td>
              <td className="border border-primary/30 p-2 text-right text-slate-700">
                {calculateGrandTotal().toLocaleString('en-KE', { 
                  minimumFractionDigits: 2, 
                  maximumFractionDigits: 2 
                })}
              </td>
              <td className="border border-primary/30 p-2"></td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  )
}
