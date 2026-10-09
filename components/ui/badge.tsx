import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const badgeVariants = cva(
  "inline-flex items-center justify-center gap-1 rounded-full border px-2.5 py-0.5 text-xs font-medium w-fit whitespace-nowrap shrink-0 [&>svg]:size-3 [&>svg]:pointer-events-none focus-visible:ring-2 focus-visible:ring-primary/35 transition-colors overflow-hidden",
  {
    variants: {
      variant: {
        default:
          "bg-primary text-white border-transparent [a&]:hover:bg-primary-dark",
        secondary:
          "bg-muted text-muted-foreground border-transparent [a&]:hover:bg-muted/70",
        destructive:
          "bg-red-600 text-white border-transparent [a&]:hover:bg-red-700",
        outline:
          "bg-transparent text-foreground border-border [a&]:hover:bg-muted",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

function Badge({
  className,
  variant,
  asChild = false,
  ...props
}: React.ComponentProps<"span"> &
  VariantProps<typeof badgeVariants> & { asChild?: boolean }) {
  const Comp = asChild ? Slot : "span"

  return (
    <Comp
      data-slot="badge"
      className={cn(badgeVariants({ variant }), className)}
      {...props}
    />
  )
}

export { Badge, badgeVariants }
