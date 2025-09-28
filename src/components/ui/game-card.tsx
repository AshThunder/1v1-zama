import * as React from "react"
import { cn } from "@/lib/utils"

interface GameCardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "default" | "selected" | "available" | "disabled" | "highlighted"
  children: React.ReactNode
}

const GameCard = React.forwardRef<HTMLDivElement, GameCardProps>(
  ({ className, variant = "default", children, ...props }, ref) => {
    const variants = {
      default: "bg-darkBase text-foreground hover:bg-darkBase/70 hover:shadow-[0_0_8px_var(--neon-teal)]",
      selected: "bg-neonCyan text-darkBase ring-2 ring-neonCyan shadow-[0_0_12px_var(--neon-cyan)]",
      available: "bg-darkBase text-foreground hover:bg-darkBase/70 shadow-[0_0_8px_var(--neon-purple)]",
      disabled: "bg-darkBase text-muted-foreground cursor-not-allowed opacity-60",
      highlighted: "bg-neonMagenta text-darkBase shadow-[0_0_12px_var(--neon-magenta)]"
    }

    return (
      <div
        className={cn(
          "relative flex items-center justify-center font-pixel text-lg transition-all duration-300 cursor-pointer select-none pixel-border",
          variants[variant],
          className
        )}
        ref={ref}
        {...props}
      >
        {children}
      </div>
    )
  }
)
GameCard.displayName = "GameCard"

export { GameCard }