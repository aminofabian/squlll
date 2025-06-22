'use client'

import * as React from "react"
import * as FilterPrimitive from "@radix-ui/react-filter"
import { cn } from "@/lib/utils"

const Filter = React.forwardRef<
  React.ElementRef<typeof FilterPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof FilterPrimitive.Root>
>(({ className, ...props }, ref) => (
  <FilterPrimitive.Root
    ref={ref}
    className={cn(
      "relative",
      className
    )}
    {...props}
  />
))
Filter.displayName = FilterPrimitive.Root.displayName

const FilterTrigger = React.forwardRef<
  React.ElementRef<typeof FilterPrimitive.Trigger>,
  React.ComponentPropsWithoutRef<typeof FilterPrimitive.Trigger>
>(({ className, children, ...props }, ref) => (
  <FilterPrimitive.Trigger
    ref={ref}
    className={cn(
      "inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50",
      "bg-background hover:bg-muted h-9 px-4 py-2",
      className
    )}
    {...props}
  >
    {children}
  </FilterPrimitive.Trigger>
))
FilterTrigger.displayName = FilterPrimitive.Trigger.displayName

const FilterContent = React.forwardRef<
  React.ElementRef<typeof FilterPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof FilterPrimitive.Content>
>(({ className, children, ...props }, ref) => (
  <FilterPrimitive.Content
    ref={ref}
    className={cn(
      "relative z-50 min-w-[8rem] overflow-hidden rounded-md border bg-popover text-popover-foreground shadow-md data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2",
      className
    )}
    {...props}
  >
    {children}
    <FilterPrimitive.Viewport className="absolute bottom-0 left-0 right-0 top-full" />
  </FilterPrimitive.Content>
))
FilterContent.displayName = FilterPrimitive.Content.displayName

const FilterGroup = FilterPrimitive.Group

const FilterSeparator = React.forwardRef<
  React.ElementRef<typeof FilterPrimitive.Separator>,
  React.ComponentPropsWithoutRef<typeof FilterPrimitive.Separator>
>(({ className, ...props }, ref) => (
  <FilterPrimitive.Separator
    ref={ref}
    className={cn("-mx-1 my-2 h-px bg-muted", className)}
    {...props}
  />
))
FilterSeparator.displayName = FilterPrimitive.Separator.displayName

const FilterLabel = React.forwardRef<
  React.ElementRef<typeof FilterPrimitive.Label>,
  React.ComponentPropsWithoutRef<typeof FilterPrimitive.Label>
>(({ className, ...props }, ref) => (
  <FilterPrimitive.Label
    ref={ref}
    className={cn("px-2 py-1.5 text-sm font-semibold", className)}
    {...props}
  />
))
FilterLabel.displayName = FilterPrimitive.Label.displayName

const FilterItem = React.forwardRef<
  React.ElementRef<typeof FilterPrimitive.Item>,
  React.ComponentPropsWithoutRef<typeof FilterPrimitive.Item>
>(({ className, children, ...props }, ref) => (
  <FilterPrimitive.Item
    ref={ref}
    className={cn(
      "relative flex cursor-default select-none items-center rounded-sm py-1.5 pl-2 pr-8 text-sm outline-none focus:bg-accent focus:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50",
      className
    )}
    {...props}
  >
    <span className="absolute right-2 flex h-3.5 w-3.5 items-center justify-center">
      <FilterPrimitive.ItemIndicator className="h-2 w-2 rounded-full bg-primary" />
    </span>

    <FilterPrimitive.ItemText>{children}</FilterPrimitive.ItemText>
  </FilterPrimitive.Item>
))
FilterItem.displayName = FilterPrimitive.Item.displayName

const FilterCheckbox = React.forwardRef<
  React.ElementRef<typeof FilterPrimitive.Checkbox>,
  React.ComponentPropsWithoutRef<typeof FilterPrimitive.Checkbox>
>(({ className, children, ...props }, ref) => (
  <FilterPrimitive.Checkbox
    ref={ref}
    className={cn(
      "relative cursor-default rounded-sm py-1.5 pl-3 pr-8 text-sm outline-none focus:bg-accent focus:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50",
      className
    )}
    {...props}
  >
    <FilterPrimitive.CheckboxIndicator className="absolute left-0 top-1/2 h-4 w-4 -translate-y-1/2" />
    <FilterPrimitive.ItemText>{children}</FilterPrimitive.ItemText>
  </FilterPrimitive.Checkbox>
))
FilterCheckbox.displayName = FilterPrimitive.Checkbox.displayName

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
