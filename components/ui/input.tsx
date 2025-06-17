import * as React from "react"

import { cn } from "@/lib/utils"

function Input({ className, type, ...props }: React.ComponentProps<"input">) {
  return (
    <input
      type={type}
      data-slot="input"
      className={cn(
        "flex h-9 w-full min-w-0 border border-black bg-white px-3 py-1 text-base font-medium transition-colors outline-none placeholder:text-gray-500 disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 focus-visible:ring-2 focus-visible:ring-black file:border-0 file:bg-transparent file:text-sm file:font-medium md:text-sm",
        className
      )}
      {...props}
    />
  )
}

export { Input }
