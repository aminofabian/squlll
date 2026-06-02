'use client'

import { useState } from 'react'
import { Drawer as DrawerPrimitive } from 'vaul'
import { SlidersHorizontal, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  DrawerClose,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerOverlay,
  DrawerPortal,
  DrawerTitle,
} from '@/components/ui/drawer'
import { cn } from '@/lib/utils'
import { FEES_BTN, FEES_LAYOUT } from '../../lib/fees-ui'

type FeeLetterPreviewSettingsDrawerProps = {
  /** Shown in drawer header and on the settings button tooltip. */
  summary?: string | null
  readinessMessage?: string | null
  children: React.ReactNode
  className?: string
}

export function FeeLetterPreviewSettingsDrawer({
  summary,
  readinessMessage,
  children,
  className,
}: FeeLetterPreviewSettingsDrawerProps) {
  const [open, setOpen] = useState(false)
  const settingsLabel = summary
    ? `Letter settings (${summary})`
    : 'Letter settings'

  return (
    <>
      <Button
        type="button"
        variant="outline"
        size="icon"
        className={cn(
          'h-9 w-9 shrink-0 rounded-lg border-slate-200 bg-white text-slate-700 shadow-sm hover:bg-slate-50',
          className,
        )}
        onClick={() => setOpen(true)}
        aria-label={settingsLabel}
        title={settingsLabel}
      >
        <SlidersHorizontal className="h-4 w-4 text-emerald-800" aria-hidden />
      </Button>

      <DrawerPrimitive.Root
        open={open}
        onOpenChange={setOpen}
        direction="left"
        shouldScaleBackground={false}
      >
        <DrawerPortal>
          <DrawerOverlay className="z-[70]" />
          <DrawerPrimitive.Content
            data-vaul-drawer-direction="left"
            className={cn(
              'fixed inset-0 z-[70] flex h-[100dvh] w-full max-w-full flex-col bg-white outline-none',
              'data-[state=open]:animate-in data-[state=closed]:animate-out',
              'data-[state=closed]:slide-out-to-left data-[state=open]:slide-in-from-left',
              'data-[state=closed]:duration-300 data-[state=open]:duration-300',
            )}
          >
            <DrawerHeader className="shrink-0 border-b border-slate-100 pb-3 text-left">
              <div className="flex items-start gap-2">
                <div className="min-w-0 flex-1">
                  <DrawerTitle className="text-base">Letter settings</DrawerTitle>
                  {summary ? (
                    <DrawerDescription
                      className={cn('text-xs text-slate-500', FEES_LAYOUT.textWrap)}
                    >
                      {summary}
                    </DrawerDescription>
                  ) : (
                    <DrawerDescription className="text-xs text-slate-500">
                      Grade, terms, letterhead, and layout.
                    </DrawerDescription>
                  )}
                </div>
                <DrawerClose asChild>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 shrink-0 rounded-lg text-slate-500"
                    aria-label="Close letter settings"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </DrawerClose>
              </div>
              {readinessMessage ? (
                <p
                  className={cn(
                    'mt-2 rounded-md border border-amber-200/80 bg-amber-50 px-2.5 py-1.5 text-xs font-medium text-amber-900',
                    FEES_LAYOUT.textWrap,
                  )}
                >
                  {readinessMessage}
                </p>
              ) : null}
            </DrawerHeader>

            <div className="min-h-0 flex-1 overflow-y-auto overflow-x-hidden px-4 py-3">
              {children}
            </div>

            <DrawerFooter
              className={cn(
                'shrink-0 border-t border-slate-100 pt-3',
                'pb-[max(1rem,env(safe-area-inset-bottom))]',
              )}
            >
              <DrawerClose asChild>
                <Button type="button" className={cn(FEES_BTN.primary, 'h-10 w-full')}>
                  Done
                </Button>
              </DrawerClose>
            </DrawerFooter>
          </DrawerPrimitive.Content>
        </DrawerPortal>
      </DrawerPrimitive.Root>
    </>
  )
}
