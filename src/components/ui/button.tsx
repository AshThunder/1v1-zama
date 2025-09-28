import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap text-sm font-pixel ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 pixel-border",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground hover:bg-primary/90 hover:shadow-[0_0_8px_var(--neon-cyan)]",
        destructive: "bg-destructive text-destructive-foreground hover:bg-destructive/90 hover:shadow-[0_0_8px_var(--neon-magenta)]",
        outline: "border border-input bg-background hover:bg-accent hover:text-accent-foreground hover:shadow-[0_0_8px_var(--neon-purple)]",
        secondary: "bg-secondary text-secondary-foreground hover:bg-secondary/80 hover:shadow-[0_0_8px_var(--neon-purple)]",
        ghost: "hover:bg-accent hover:text-accent-foreground hover:shadow-[0_0_8px_var(--neon-teal)]",
        link: "text-primary underline-offset-4 hover:underline hover:shadow-[0_0_8px_var(--neon-cyan)]",
      },
      size: {
        default: "h-12 px-6 py-3", // Made chunkier
        sm: "h-10 px-4 py-2",   // Made chunkier
        lg: "h-14 px-10 py-3",  // Made chunkier
        icon: "h-12 w-12",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button"
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    )
  }
)
Button.displayName = "Button"

export { Button, buttonVariants }
