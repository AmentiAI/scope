import { cn } from "@/lib/utils"

function Skeleton({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn("relative overflow-hidden rounded-md bg-muted", className)}
      {...props}
    >
      <div
        className="absolute inset-0 animate-shimmer"
        style={{
          background:
            "linear-gradient(90deg, hsl(240 5% 12%) 0%, hsl(240 5% 16%) 50%, hsl(240 5% 12%) 100%)",
          backgroundSize: "200% 100%",
        }}
      />
    </div>
  )
}

export { Skeleton }
