"use client"

import { Button } from "@/components/ui/button"
import { Menu } from "lucide-react"

export function MobileNav() {
  return (
    <div className="flex items-center justify-between p-4 lg:hidden border-b-2 border-slate-200 dark:border-slate-700">
      <div className="flex items-center gap-2">
        <Button 
          variant="ghost" 
          size="icon"
          className="lg:hidden"
        >
          <Menu className="h-6 w-6" />
        </Button>
        <span className="font-mono font-bold">SQUL</span>
      </div>
    </div>
  )
} 