"use client"

import * as React from "react"
import { ChevronLeft, ChevronRight } from "lucide-react"
import {
  DayPicker,
  DayFlag,
  getDefaultClassNames,
  SelectionState,
  UI,
  type ClassNames,
} from "react-day-picker"

import { cn } from "@/lib/utils"
import { buttonVariants } from "@/components/ui/button"

function Calendar({
  className,
  classNames,
  showOutsideDays = true,
  ...props
}: React.ComponentProps<typeof DayPicker>) {
  const defaults = getDefaultClassNames()
  const overrides = classNames ?? {}

  const merge = (key: keyof ClassNames, base: string) =>
    cn(base, defaults[key], overrides[key])

  return (
    <DayPicker
      showOutsideDays={showOutsideDays}
      navLayout="around"
      className={cn("p-2", className)}
      classNames={{
        [UI.Root]: merge(UI.Root, "w-fit"),
        [UI.Months]: merge(UI.Months, "relative flex flex-col"),
        [UI.Month]: merge(UI.Month, "relative flex w-full flex-col gap-1"),
        [UI.MonthCaption]: merge(
          UI.MonthCaption,
          "relative flex h-8 w-full items-center justify-center",
        ),
        [UI.CaptionLabel]: merge(UI.CaptionLabel, "text-sm font-semibold"),
        [UI.Nav]: merge(UI.Nav, "hidden"),
        [UI.PreviousMonthButton]: merge(
          UI.PreviousMonthButton,
          cn(
            buttonVariants({ variant: "outline" }),
            "absolute left-0 top-0 z-10 h-7 w-7 bg-transparent p-0 opacity-70 hover:opacity-100",
          ),
        ),
        [UI.NextMonthButton]: merge(
          UI.NextMonthButton,
          cn(
            buttonVariants({ variant: "outline" }),
            "absolute right-0 top-0 z-10 h-7 w-7 bg-transparent p-0 opacity-70 hover:opacity-100",
          ),
        ),
        [UI.MonthGrid]: merge(UI.MonthGrid, "w-full border-collapse"),
        [UI.Weekdays]: merge(UI.Weekdays, defaults[UI.Weekdays]),
        [UI.Weekday]: merge(
          UI.Weekday,
          "w-9 pb-1 text-center text-[0.7rem] font-medium uppercase tracking-wide text-muted-foreground",
        ),
        [UI.Week]: merge(UI.Week, defaults[UI.Week]),
        [UI.Day]: merge(UI.Day, "relative p-0 text-center align-middle"),
        [UI.DayButton]: merge(
          UI.DayButton,
          cn(
            buttonVariants({ variant: "ghost" }),
            "h-8 w-8 p-0 text-sm font-normal",
          ),
        ),
        [SelectionState.selected]: merge(
          SelectionState.selected,
          "[&>button]:bg-primary [&>button]:text-primary-foreground [&>button]:hover:bg-primary [&>button]:hover:text-primary-foreground",
        ),
        [DayFlag.today]: merge(
          DayFlag.today,
          "[&>button]:bg-accent [&>button]:font-semibold [&>button]:text-accent-foreground",
        ),
        [DayFlag.outside]: merge(
          DayFlag.outside,
          "[&>button]:text-muted-foreground [&>button]:opacity-50",
        ),
        [DayFlag.disabled]: merge(
          DayFlag.disabled,
          "[&>button]:text-muted-foreground [&>button]:opacity-40",
        ),
        [DayFlag.hidden]: merge(DayFlag.hidden, "invisible"),
        [SelectionState.range_start]: merge(
          SelectionState.range_start,
          "rounded-l-md",
        ),
        [SelectionState.range_middle]: merge(
          SelectionState.range_middle,
          "rounded-none",
        ),
        [SelectionState.range_end]: merge(SelectionState.range_end, "rounded-r-md"),
      }}
      components={{
        Chevron: ({ className, orientation, ...chevronProps }) => {
          const Icon = orientation === "left" ? ChevronLeft : ChevronRight
          return <Icon className={cn("h-4 w-4", className)} {...chevronProps} />
        },
      }}
      {...props}
    />
  )
}

export { Calendar }
