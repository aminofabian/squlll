'use client'

import { Megaphone } from 'lucide-react'
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet'
import { Button } from '@/components/ui/button'
import { SchoolBroadcastSection } from '@/components/chat/SchoolBroadcastSection'

interface DashboardBroadcastSheetProps {
  subdomain: string
}

export function DashboardBroadcastSheet({ subdomain }: DashboardBroadcastSheetProps) {
  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className="inline-flex h-auto items-center gap-1 rounded px-1 py-0.5 font-medium text-slate-700 hover:text-slate-900 dark:text-slate-200 dark:hover:text-white"
        >
          <Megaphone className="h-3 w-3" />
          Announcement
        </Button>
      </SheetTrigger>
      <SheetContent className="w-full overflow-y-auto sm:max-w-lg">
        <SheetHeader className="mb-4 text-left">
          <SheetTitle className="flex items-center gap-2">
            <Megaphone className="h-5 w-5 text-primary" />
            School announcement
          </SheetTitle>
          <SheetDescription>
            Send a message to all students and parents. They receive it in chat and get a live
            notification.
          </SheetDescription>
        </SheetHeader>
        <SchoolBroadcastSection subdomain={subdomain} compact />
      </SheetContent>
    </Sheet>
  )
}
