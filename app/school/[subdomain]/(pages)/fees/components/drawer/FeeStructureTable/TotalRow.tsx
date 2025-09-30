import React from 'react'

interface TotalRowProps {
  calculateGrandTotal: () => number
}

export const TotalRow: React.FC<TotalRowProps> = ({
  calculateGrandTotal
}) => {
  return (
    <tr className="bg-primary/10 font-bold">
      <td className="border border-primary/30 p-2 text-slate-700">TOTAL</td>
      <td className="border border-primary/30 p-2 text-right text-slate-700">
        {calculateGrandTotal().toLocaleString('en-KE', { 
          minimumFractionDigits: 2, 
          maximumFractionDigits: 2 
        })}
      </td>
      <td className="border border-primary/30 p-2"></td>
      <td className="border border-primary/30 p-2"></td>
    </tr>
  )
}
