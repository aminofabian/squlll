"use client"

import * as React from "react"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { DayPicker, getDefaultClassNames, type ClassNames } from "react-day-picker"

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
        root: merge("root", "w-fit"),
        months: merge("months", "relative flex flex-col"),
        month: merge("month", "relative flex w-full flex-col gap-1"),
        month_caption: merge(
          "month_caption",
          "relative flex h-8 w-full items-center justify-center",
        ),
        caption_label: merge("caption_label", "text-sm font-semibold"),
        nav: merge("nav", "hidden"),
        button_previous: merge(
          "button_previous",
          cn(
            buttonVariants({ variant: "outline" }),
            "absolute left-0 top-0 z-10 h-7 w-7 bg-transparent p-0 opacity-70 hover:opacity-100",
          ),
        ),
        button_next: merge(
          "button_next",
          cn(
            buttonVariants({ variant: "outline" }),
            "absolute right-0 top-0 z-10 h-7 w-7 bg-transparent p-0 opacity-70 hover:opacity-100",
          ),
        ),
        month_grid: merge("month_grid", "w-full border-collapse"),
        weekdays: merge("weekdays", defaults.weekdays),
        weekday: merge(
          "weekday",
          "w-9 pb-1 text-center text-[0.7rem] font-medium uppercase tracking-wide text-muted-foreground",
        ),
        week: merge("week", defaults.week),
        day: merge("day", "relative p-0 text-center align-middle"),
        day_button: merge(
          "day_button",
          cn(
            buttonVariants({ variant: "ghost" }),
            "h-8 w-8 p-0 text-sm font-normal",
          ),
        ),
        selected: merge(
          "selected",
          "[&>button]:bg-primary [&>button]:text-primary-foreground [&>button]:hover:bg-primary [&>button]:hover:text-primary-foreground",
        ),
        today: merge(
          "today",
          "[&>button]:bg-accent [&>button]:font-semibold [&>button]:text-accent-foreground",
        ),
        outside: merge(
          "outside",
          "[&>button]:text-muted-foreground [&>button]:opacity-50",
        ),
        disabled: merge(
          "disabled",
          "[&>button]:text-muted-foreground [&>button]:opacity-40",
        ),
        hidden: merge("hidden", "invisible"),
        range_start: merge("range_start", "rounded-l-md"),
        range_middle: merge("range_middle", "rounded-none"),
        range_end: merge("range_end", "rounded-r-md"),
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
