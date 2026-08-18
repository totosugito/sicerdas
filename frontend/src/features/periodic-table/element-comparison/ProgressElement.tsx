import * as React from "react"

import { cn } from "@/lib/utils"

function ProgressElement({
  className,
  value,
  max = 100,
  ...props
}: React.ComponentProps<"div"> & {
  value: number
  max?: number
}) {
  const percentage = max > 0 ? (value / max) * 100 : 0
  return (
    <div
      data-slot="progress"
      className={cn(
        "bg-muted relative h-4 w-full overflow-hidden rounded-full",
        className
      )}
      {...props}
    >
      <div
        className="bg-primary h-full w-full flex-1 transition-all striped-progress-bar"
        style={{ transform: `translateX(-${100 - percentage}%)` }}
      />
    </div>
  )
}

export { ProgressElement }
