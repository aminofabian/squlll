import React from 'react'

interface FeeAmountInputProps {
  termIndex: number
  bucketIndex: number
  componentIndex: number
  component: any
  currentEditingField: string | null
  setCurrentEditingField: (field: string | null) => void
  updateComponent: (termIndex: number, bucketIndex: number, componentIndex: number, field: keyof any, value: any) => void
}

export const FeeAmountInput: React.FC<FeeAmountInputProps> = ({
  termIndex,
  bucketIndex,
  componentIndex,
  component,
  currentEditingField,
  setCurrentEditingField,
  updateComponent
}) => {
  const fieldId = `${termIndex}-${bucketIndex}-${componentIndex}-amount`
  const isEditing = currentEditingField === fieldId
  
  return (
    <div className="relative">
      <input
        type="number"
        className="w-full bg-transparent border-0 text-right focus:bg-primary/5 focus:outline-none focus:ring-2 focus:ring-primary/30 px-2 py-1 font-mono transition-all duration-200"
        value={component.amount}
        onChange={(e) => updateComponent(termIndex, bucketIndex, componentIndex, 'amount', e.target.value)}
        onFocus={() => setCurrentEditingField(fieldId)}
        onBlur={() => setCurrentEditingField(null)}
        placeholder="0.00"
      />
      {isEditing && (
        <div className="absolute top-full right-0 mt-1 text-xs text-primary bg-primary/5 px-2 py-1 shadow-sm">
          💰 KES {parseFloat(component.amount || '0').toLocaleString()}
        </div>
      )}
    </div>
  )
}
