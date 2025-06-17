import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const badgeVariants = cva(
  "inline-flex items-center justify-center border px-2 py-0.5 text-xs font-medium w-fit whitespace-nowrap shrink-0 [&>svg]:size-3 gap-1 [&>svg]:pointer-events-none focus-visible:ring-2 focus-visible:ring-primary transition-colors overflow-hidden",
  {
    variants: {
      variant: {
        default:
          "bg-primary text-white border-primary [a&]:hover:bg-primary-dark",
        secondary:
          "bg-gray-200 text-primary border-gray-200 [a&]:hover:bg-gray-300",
        destructive:
          "bg-red-600 text-white border-red-600 [a&]:hover:bg-red-700",
        outline:
          "bg-white text-primary border-primary [a&]:hover:bg-primary/10",
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
