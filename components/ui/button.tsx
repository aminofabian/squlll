import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-colors outline-none focus-visible:ring-2 focus-visible:ring-primary/35 focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:pointer-events-none active:scale-[0.985] [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 shrink-0 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        default:
          "bg-primary text-white shadow-sm hover:bg-primary-dark",
        destructive:
          "bg-red-600 text-white shadow-sm hover:bg-red-700",
        outline:
          "border border-primary/25 bg-background text-primary hover:border-primary/45 hover:bg-primary/5",
        secondary:
          "bg-secondary text-secondary-foreground hover:bg-secondary/70",
        ghost:
          "text-primary hover:bg-primary/10",
        link: "text-primary underline-offset-4 hover:underline",
      },
      size: {
        default: "h-9 px-4 py-2 has-[>svg]:px-3",
        sm: "h-8 gap-1.5 px-3 text-[13px] has-[>svg]:px-2.5",
        lg: "h-10 px-6 has-[>svg]:px-4",
        icon: "size-9",
      },
    },
    compoundVariants: [
      {
        variant: ["default", "destructive"],
        class:
          "disabled:bg-slate-200 disabled:text-slate-500 disabled:shadow-none dark:disabled:bg-slate-800 dark:disabled:text-slate-400",
      },
      {
        variant: ["outline", "secondary"],
        class:
          "disabled:border-slate-200 disabled:bg-slate-100 disabled:text-slate-400 disabled:shadow-none dark:disabled:border-slate-700 dark:disabled:bg-slate-800 dark:disabled:text-slate-500",
      },
      {
        variant: ["ghost", "link"],
        class: "disabled:bg-transparent disabled:text-slate-400",
      },
    ],
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

function Button({
  className,
  variant,
  size,
  asChild = false,
  ...props
}: React.ComponentProps<"button"> &
  VariantProps<typeof buttonVariants> & {
    asChild?: boolean
  }) {
  const Comp = asChild ? Slot : "button"

  return (
    <Comp
      data-slot="button"
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  )
}

export { Button, buttonVariants }
