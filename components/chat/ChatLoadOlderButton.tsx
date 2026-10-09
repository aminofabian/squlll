'use client'

import { Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface ChatLoadOlderButtonProps {
  loadingMore: boolean
  onClick: () => void
}

export function ChatLoadOlderButton({ loadingMore, onClick }: ChatLoadOlderButtonProps) {
  return (
    <div className="mb-4 flex justify-center">
      <Button
        type="button"
        variant="outline"
        size="sm"
        disabled={loadingMore}
        onClick={onClick}
        className="rounded-full bg-card shadow-sm"
      >
        {loadingMore ? <Loader2 className="animate-spin" /> : null}
        Load older messages
      </Button>
    </div>
  )
}
