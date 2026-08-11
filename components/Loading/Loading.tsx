import { LoaderIcon } from "lucide-react"

import { cn } from "@/lib/utils"

function Spinner({ className, ...props }: React.ComponentProps<"svg">) {
  return (
    <LoaderIcon
      role="status"
      aria-label="Loading"
      className={cn("size-36 animate-spin", className)}
      {...props}
    />
  )
}

export function Loading() {
  return (
    <div className="flex items-center  justify-center min-h-screen">
      <Spinner className="text-[#0497D8]"/>
    </div>
  )
}
