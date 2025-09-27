'use client'

import React from 'react'
import { Button } from "@/components/ui/button"
import { Sparkles } from "lucide-react"

interface FeeTemplate {
  name: string
  amount: string
  icon: React.ElementType
  description: string
}

interface FeeTemplateCategory {
  [category: string]: FeeTemplate[]
}

interface QuickAddTemplatesSectionProps {
  feeTemplates: FeeTemplateCategory
  feeBuckets: any[]
  isCreatingBucket: boolean
  onAddFromTemplate: (bucketName: string, description: string, name: string, amount: string, category: string) => void
}

export const QuickAddTemplatesSection: React.FC<QuickAddTemplatesSectionProps> = ({
  feeTemplates,
  feeBuckets,
  isCreatingBucket,
  onAddFromTemplate
}) => {
  return (
    <div className="mb-6 p-4 bg-primary/5 border border-primary/20">
      <h4 className="text-sm font-medium text-slate-700 mb-3 flex items-center gap-2">
        <Sparkles className="h-4 w-4 text-primary" />
        Quick Add Common Fees
      </h4>
      <div className="grid grid-cols-2 gap-3">
        {Object.entries(feeTemplates).map(([category, templates]) => {
          // Filter out templates that already exist in fee buckets
          const filteredTemplates = templates.filter(template => {
            const bucketExists = feeBuckets.some(bucket => 
              bucket.name.toLowerCase().includes(template.name.toLowerCase()) ||
              template.name.toLowerCase().includes(bucket.name.toLowerCase())
            )
            return !bucketExists
          })

          // Don't show category if all templates are filtered out
          if (filteredTemplates.length === 0) return null

          return (
            <div key={category} className="space-y-2">
              <h5 className="text-xs font-medium text-slate-600 uppercase tracking-wide">
                {category}
              </h5>
              <div className="space-y-1">
                {filteredTemplates.map((template, index) => {
                  const IconComponent = template.icon
                  return (
                    <Button
                      key={index}
                      variant="ghost"
                      size="sm"
                      className="w-full justify-start text-xs h-8 hover:bg-primary/5 hover:shadow-sm border-primary/10"
                      disabled={isCreatingBucket}
                      onClick={() => onAddFromTemplate(
                        template.name, 
                        template.description || `${template.name} related fees`,
                        template.name,
                        template.amount,
                        category
                      )}
                    >
                      <IconComponent className="h-3 w-3 mr-2" />
                      {template.name}
                      <span className="ml-auto text-primary font-mono">
                        {template.amount}
                      </span>
                    </Button>
                  )
                })}
              </div>
            </div>
          )
        })}
      </div>
      {Object.entries(feeTemplates).every(([_, templates]) => 
        templates.every(template => 
          feeBuckets.some(bucket => 
            bucket.name.toLowerCase().includes(template.name.toLowerCase()) ||
            template.name.toLowerCase().includes(bucket.name.toLowerCase())
          )
        )
      ) && (
        <div className="text-center py-4 text-sm text-slate-600">
          <Sparkles className="h-4 w-4 mx-auto mb-2 text-slate-400" />
          All common fees already exist in your buckets! 
          <br />
          <span className="text-xs">Check the "Existing Buckets" section above.</span>
        </div>
      )}
    </div>
  )
}
