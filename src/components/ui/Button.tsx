"use client";

import * as React from "react"

import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"
import { motion, HTMLMotionProps } from "framer-motion"
import { cn } from "@/lib/utils"
import { Loader2, Sparkles } from "lucide-react";


// We need to install class-variance-authority and @radix-ui/react-slot too!
// I'll add them to the install list in the next step if I forgot them.

const buttonVariants = cva(
    "inline-flex items-center justify-center whitespace-nowrap rounded-xl text-sm font-medium transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 relative overflow-hidden group",
    {
        variants: {
            variant: {
                default:
                    "bg-gradient-to-r from-amber-600 to-amber-500 text-white shadow-lg hover:shadow-amber-500/30 hover:from-amber-700 hover:to-amber-600 hover:scale-105",
                luxury:
                    "bg-gradient-to-r from-amber-500 to-amber-600 text-white shadow-xl hover:shadow-amber-500/40 hover:from-amber-600 hover:to-amber-700 hover:scale-105 border border-amber-400/20",
                destructive:
                    "bg-gradient-to-r from-red-600 to-red-500 text-white shadow-lg hover:shadow-red-500/30 hover:from-red-700 hover:to-red-600 hover:scale-105",
                outline:
                    "border-2 border-amber-500/30 bg-background shadow-md hover:bg-amber-50 hover:border-amber-500 hover:scale-105 hover:shadow-amber-500/20",
                secondary:
                    "bg-gradient-to-r from-slate-100 to-slate-200 text-slate-900 shadow-md hover:from-slate-200 hover:to-slate-300 hover:scale-105",
                ghost: "hover:bg-amber-50 hover:text-amber-700 hover:scale-105 rounded-lg",
                link: "text-amber-600 underline-offset-4 hover:underline hover:text-amber-700 font-medium",
            },
            size: {
                default: "h-11 px-6 py-2",
                sm: "h-9 rounded-lg px-4 text-xs",
                lg: "h-14 rounded-xl px-10 text-base",
                icon: "h-11 w-11 rounded-xl",
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
    loading?: boolean
    luxury?: boolean
}

// Enhanced Button with luxury animations and effects
const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
    ({ className, variant, size, asChild = false, loading, luxury, children, ...props }, ref) => {
        const Comp = asChild ? Slot : "button"
        const isLuxury = luxury || variant === "luxury"

        if (asChild) {
            return (
                <Comp
                    className={cn(buttonVariants({ variant, size, className }))}
                    ref={ref}
                    disabled={props.disabled || loading}
                    {...props}
                >
                    {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    {isLuxury && !loading && (
                        <Sparkles className="mr-2 h-4 w-4 animate-pulse" />
                    )}
                    {children}
                </Comp>
            )
        }

        return (
            <motion.button
                className={cn(buttonVariants({ variant, size, className }))}
                ref={ref}
                disabled={props.disabled || loading}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                transition={{ type: "spring", stiffness: 400, damping: 17 }}
                {...(props as any)}
            >
                {/* Shimmer effect for luxury buttons */}
                {isLuxury && (
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000 ease-out" />
                )}

                {/* Loading state */}
                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}

                {/* Luxury sparkle icon for luxury variant */}
                {isLuxury && !loading && (
                    <Sparkles className="mr-2 h-4 w-4 animate-pulse" />
                )}

                {children}

                {/* Subtle glow effect for luxury buttons */}
                {isLuxury && (
                    <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-amber-400/20 to-amber-600/20 blur-sm opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                )}
            </motion.button>
        )
    }
)
Button.displayName = "Button"

export { Button, buttonVariants }
