import { cn } from "@/lib/utils"
import { IconSpinner } from "@/components/icons/veerly-icons"

function Spinner({ className, ...props }: React.ComponentProps<"svg">) {
  return (
    <IconSpinner data-slot="spinner" role="status" aria-label="Loading" className={cn("size-4 animate-spin", className)} {...props} />
  )
}

export { Spinner }
