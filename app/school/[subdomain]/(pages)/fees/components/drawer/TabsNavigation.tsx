'use client'

import React from 'react'
import { Edit3, Eye } from "lucide-react"
import { TabsList, TabsTrigger } from "@/components/ui/tabs"

interface TabsNavigationProps {
  activeTab: 'form' | 'preview'
  onChange: (value: 'form' | 'preview') => void
}

export const TabsNavigation: React.FC<TabsNavigationProps> = ({
  activeTab,
  onChange
}) => {
  return (
    <div className="px-6 pt-4 pb-2 border-b border-primary/20 bg-white shadow-sm">
      <TabsList className="grid w-full max-w-md mx-auto grid-cols-2 bg-slate-100 p-1 shadow-inner">
        <TabsTrigger 
          value="form" 
          onClick={() => onChange('form')}
          className="flex items-center gap-2 data-[state=active]:bg-primary data-[state=active]:text-white transition-all duration-200 shadow-sm data-[state=active]:shadow-md"
          data-state={activeTab === 'form' ? 'active' : 'inactive'}
        >
          <Edit3 className="h-4 w-4" />
          <span className="font-medium">Edit Structure</span>
        </TabsTrigger>
        <TabsTrigger 
          value="preview" 
          onClick={() => onChange('preview')}
          className="flex items-center gap-2 data-[state=active]:bg-primary data-[state=active]:text-white transition-all duration-200 shadow-sm data-[state=active]:shadow-md"
          data-state={activeTab === 'preview' ? 'active' : 'inactive'}
        >
          <Eye className="h-4 w-4" />
          <span className="font-medium">PDF Preview</span>
        </TabsTrigger>
      </TabsList>
    </div>
  )
}
