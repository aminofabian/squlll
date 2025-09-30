import React from 'react'
import { GraduationCap } from "lucide-react"

export const TableHeader: React.FC = () => {
  return (
    <thead>
      <tr className="bg-primary/10">
        <th className="border border-primary/30 p-3 text-left font-bold text-slate-700">
          <div className="flex flex-col">
            <span>TERM</span>
            <span className="text-xs font-normal text-slate-600 flex items-center gap-1">
              <GraduationCap className="h-3 w-3" />
              ACADEMIC YEAR
            </span>
          </div>
        </th>
        <th className="border border-primary/30 p-3 text-left font-bold text-slate-700">VOTE HEAD</th>
        <th className="border border-primary/30 p-3 text-right font-bold text-slate-700">AMOUNT</th>
        <th className="border border-primary/30 p-3 w-20 text-center font-bold text-slate-700">ACTIONS</th>
      </tr>
    </thead>
  )
}
