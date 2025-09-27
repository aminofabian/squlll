'use client'

import React from 'react'
import { FeeStructureForm } from '../types'

interface FeeStructurePDFPreviewProps {
  formData: FeeStructureForm
  schoolName?: string
  schoolAddress?: string
  schoolContact?: string
  schoolEmail?: string
}

export const FeeStructurePDFPreview = ({
  formData,
  schoolName = "KANYAWANGA HIGH SCHOOL",
  schoolAddress = "P.O. Box 100 - 40404, RONGO KENYA. Cell: 0710215418",
  schoolEmail = "kanyawangaschool@hotmail.com"
}: FeeStructurePDFPreviewProps) => {
  const calculateTermTotal = (termIndex: number) => {
    return formData.termStructures[termIndex]?.buckets.reduce((termSum, bucket) => 
      termSum + bucket.components.reduce((bucketSum, component) => 
        bucketSum + (parseFloat(component.amount) || 0), 0), 0) || 0
  }

  const calculateGrandTotal = () => {
    return formData.termStructures.reduce((total, term, index) => 
      total + calculateTermTotal(index), 0)
  }

  const getCurrentDate = () => {
    return new Date().toLocaleDateString('en-GB', {
      day: '2-digit',
      month: '2-digit', 
      year: 'numeric'
    })
  }

  return (
    <div className="bg-white p-8 max-w-4xl mx-auto shadow-lg" style={{ fontFamily: 'Times New Roman, serif' }}>
      {/* Header */}
      <div className="text-center mb-6">
        <div className="flex items-center justify-center gap-4 mb-2">
          <div className="w-16 h-16 bg-gray-200 rounded border flex items-center justify-center">
            <span className="text-xs text-gray-500">LOGO</span>
          </div>
          <div>
            <h1 className="text-2xl font-bold underline">{schoolName}</h1>
            <p className="text-sm">{schoolAddress}</p>
            <p className="text-sm">E-mail: {schoolEmail}</p>
          </div>
        </div>
      </div>

      {/* Reference and Date */}
      <div className="mb-6">
        <div className="flex justify-between items-start">
          <div>
            <p className="mb-1">Our Ref: ................................</p>
            <p>Your Ref: ................................</p>
          </div>
          <div className="text-right">
            <p>Date: {getCurrentDate()}</p>
          </div>
        </div>
      </div>

      {/* Title */}
      <div className="text-center mb-6">
        <h2 className="text-lg font-bold underline">FEES STRUCTURE {formData.academicYear}</h2>
      </div>

      {/* Fee Structure Table with Term Distinctions */}
      <div className="mb-8">
        <table className="w-full border-collapse border border-black">
          <thead>
            <tr className="bg-gray-100">
              <th className="border border-black p-2 text-left font-bold">VOTE HEAD</th>
              <th className="border border-black p-2 text-right font-bold">AMOUNT</th>
            </tr>
          </thead>
          <tbody>
            {formData.termStructures.map((term, termIndex) => (
              <React.Fragment key={`term-section-${termIndex}`}>
                {/* Term Header Row */}
                <tr className="bg-gray-200">
                  <td 
                    colSpan={2} 
                    className="border border-black p-2 font-bold text-center"
                  >
                    {term.term.toUpperCase()}
                  </td>
                </tr>
                
                {/* Bucket and Component Rows */}
                {term.buckets.map((bucket, bucketIndex) => (
                  <React.Fragment key={`bucket-${termIndex}-${bucketIndex}`}>
                    {/* Optional Bucket Header */}
                    {bucket.name && (
                      <tr className="bg-gray-100">
                        <td 
                          colSpan={2} 
                          className="border border-black p-2 font-semibold"
                        >
                          {bucket.name} {bucket.isOptional ? '(Optional)' : ''}
                        </td>
                      </tr>
                    )}
                    
                    {/* Component Rows */}
                    {bucket.components.map((component, componentIndex) => (
                      <tr key={`${termIndex}-${bucketIndex}-${componentIndex}`}>
                        <td className="border border-black p-2 pl-4">{component.name}</td>
                        <td className="border border-black p-2 text-right">
                          {parseFloat(component.amount).toLocaleString('en-KE', { 
                            minimumFractionDigits: 2, 
                            maximumFractionDigits: 2 
                          })}
                        </td>
                      </tr>
                    ))}
                  </React.Fragment>
                ))}
                
                {/* Term Subtotal */}
                <tr className="bg-gray-100">
                  <td className="border border-black p-2 font-semibold">{term.term.toUpperCase()} SUBTOTAL</td>
                  <td className="border border-black p-2 text-right font-semibold">
                    {calculateTermTotal(termIndex).toLocaleString('en-KE', { 
                      minimumFractionDigits: 2, 
                      maximumFractionDigits: 2 
                    })}
                  </td>
                </tr>
              </React.Fragment>
            ))}
            
            {/* Grand Total */}
            <tr className="bg-gray-300 font-bold">
              <td className="border border-black p-2">TOTAL</td>
              <td className="border border-black p-2 text-right">
                {calculateGrandTotal().toLocaleString('en-KE', { 
                  minimumFractionDigits: 2, 
                  maximumFractionDigits: 2 
                })}
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* Termly Payment Schedule */}
      <div className="mb-8">
        <h3 className="text-center font-bold underline mb-4">
          TERMLY PAYMENT FOR THE YEAR {formData.academicYear}
        </h3>
        <div className="flex justify-center">
          <table className="border-collapse border border-black">
            <thead>
              <tr className="bg-gray-100">
                <th className="border border-black p-2 text-left font-bold">TERM</th>
                <th className="border border-black p-2 text-right font-bold">AMOUNT</th>
              </tr>
            </thead>
            <tbody>
              {formData.termStructures.map((term, index) => (
                <tr key={index}>
                  <td className="border border-black p-2">{term.term.toUpperCase()}</td>
                  <td className="border border-black p-2 text-right">
                    {calculateTermTotal(index).toLocaleString('en-KE', { 
                      minimumFractionDigits: 2, 
                      maximumFractionDigits: 2 
                    })}
                  </td>
                </tr>
              ))}
              <tr className="bg-gray-100 font-bold">
                <td className="border border-black p-2">TOTAL</td>
                <td className="border border-black p-2 text-right">
                  {calculateGrandTotal().toLocaleString('en-KE', { 
                    minimumFractionDigits: 2, 
                    maximumFractionDigits: 2 
                  })}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Mode of Payment */}
      <div className="mb-8">
        <h3 className="font-bold underline mb-4">MODE OF PAYMENT:</h3>
        <p className="mb-4">
          Full school fees should be paid at the beginning of the term to any of the school accounts listed hereunder.
        </p>
        
        <div className="mb-4">
          <p className="mb-2">1. Kenya Commercial Bank&nbsp;&nbsp;&nbsp;&nbsp;Rongo Branch&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;A/C No: <u>1172699240</u></p>
          <p className="mb-2">2. National Bank of Kenya&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;Awendo Branch&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;A/C No: <u>01021045775100</u></p>
          <p className="mb-2">3. Postal Money Order&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;Repayable at Rongo Post Office</p>
        </div>

        <div className="mb-4">
          <p className="font-bold">NB.</p>
        </div>

        <div className="mb-4 space-y-2">
          <p>The school official receipts shall be issued upon presentation of original pay-in slips or Money Orders.</p>
          <p>The fees may be deposited at any Branch of National Bank or Kenya Commercial Bank County wide.</p>
          <p>Fees can be paid by Banker's Cheque, but personal cheques will not be accepted.</p>
        </div>
      </div>

      {/* Signature Section */}
      <div className="mt-12">
        <div className="flex justify-between items-end">
          <div>
            <p className="font-bold">JACOB MBOGO</p>
            <p className="font-bold">PRINCIPAL/SEC BOM.</p>
          </div>
          <div className="text-right">
            <div className="w-32 h-16 border-b border-black mb-2"></div>
            <p className="text-sm">PRINCIPAL</p>
            <p className="text-xs">DATE: ........................</p>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="mt-8 text-center">
        <p className="text-xs italic">When replying please quote our reference</p>
      </div>
    </div>
  )
}
