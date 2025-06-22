'use client'

import * as React from "react"
import { Check } from "lucide-react"
import * as ToggleGroupPrimitive from "@radix-ui/react-toggle-group"
import * as TogglePrimitive from "@radix-ui/react-toggle"
import * as PopoverPrimitive from "@radix-ui/react-popover"
import { cn } from "@/lib/utils"

// Filter root component
const Filter = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      "relative",
      className
    )}
    {...props}
  />
))
Filter.displayName = "Filter"

// Filter trigger component - similar to PopoverTrigger
const FilterTrigger = React.forwardRef<
  React.ElementRef<typeof PopoverPrimitive.Trigger>,
  React.ComponentPropsWithoutRef<typeof PopoverPrimitive.Trigger>
>(({ className, children, ...props }, ref) => (
  <PopoverPrimitive.Trigger
    ref={ref}
    className={cn(
      "inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50",
      "bg-background hover:bg-muted h-9 px-4 py-2",
      className
    )}
    {...props}
  >
    {children}
  </PopoverPrimitive.Trigger>
))
FilterTrigger.displayName = "FilterTrigger"

// Filter content component - similar to PopoverContent
const FilterContent = React.forwardRef<
  React.ElementRef<typeof PopoverPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof PopoverPrimitive.Content>
>(({ className, children, ...props }, ref) => (
  <PopoverPrimitive.Content
    ref={ref}
    className={cn(
      "relative z-50 min-w-[8rem] overflow-hidden rounded-md border bg-popover text-popover-foreground shadow-md data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2",
      className
    )}
    {...props}
  >
    {children}
  </PopoverPrimitive.Content>
))
FilterContent.displayName = "FilterContent"

// Filter group component - using ToggleGroup
const FilterGroup = React.forwardRef<
  React.ElementRef<typeof ToggleGroupPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof ToggleGroupPrimitive.Root>
>(({ className, ...props }, ref) => (
  <ToggleGroupPrimitive.Root
    ref={ref}
    className={cn("flex flex-wrap gap-1", className)}
    {...props}
  />
))
FilterGroup.displayName = "FilterGroup"

// Filter separator
const FilterSeparator = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("-mx-1 my-2 h-px bg-muted", className)}
    {...props}
  />
))
FilterSeparator.displayName = "FilterSeparator"

// Filter label
const FilterLabel = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("px-2 py-1.5 text-sm font-semibold", className)}
    {...props}
  />
))
FilterLabel.displayName = "FilterLabel"

// Filter item - using Toggle from Radix UI
const FilterItem = React.forwardRef<
  React.ElementRef<typeof ToggleGroupPrimitive.Item>,
  React.ComponentPropsWithoutRef<typeof ToggleGroupPrimitive.Item>
>(({ className, children, ...props }, ref) => (
  <ToggleGroupPrimitive.Item
    ref={ref}
    className={cn(
      "relative flex cursor-pointer select-none items-center rounded-sm py-1.5 pl-8 pr-2 text-sm outline-none focus:bg-accent focus:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50 data-[state=on]:bg-accent/50",
      className
    )}
    {...props}
  >
    <span className="absolute left-2 flex h-3.5 w-3.5 items-center justify-center">
      <span className="h-2 w-2 rounded-full data-[state=on]:bg-primary">{(props as any)["data-state"] === "on" && <Check className="h-3 w-3" />}</span>
    </span>
    <span>{children}</span>
  </ToggleGroupPrimitive.Item>
))
FilterItem.displayName = "FilterItem"

// Filter checkbox component
const FilterCheckbox = React.forwardRef<
  React.ElementRef<typeof TogglePrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof TogglePrimitive.Root>
>(({ className, children, ...props }, ref) => (
  <TogglePrimitive.Root
    ref={ref}
    className={cn(
      "relative cursor-pointer rounded-sm py-1.5 pl-8 pr-2 text-sm outline-none focus:bg-accent focus:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50 data-[state=on]:bg-accent/50",
      className
    )}
    {...props}
  >
    <span className="absolute left-2 flex h-4 w-4 items-center justify-center border rounded">
      {(props as any)["data-state"] === "on" && <Check className="h-3 w-3" />}
    </span>
    <span>{children}</span>
  </TogglePrimitive.Root>
))
FilterCheckbox.displayName = "FilterCheckbox"

export {
  Filter,
  FilterTrigger,
  FilterContent,
  FilterGroup,
  FilterSeparator,
  FilterLabel,
  FilterItem,
  FilterCheckbox,
}
