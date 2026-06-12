import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-semibold transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue/50 disabled:pointer-events-none disabled:opacity-50 [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        primary: "bg-blue text-white shadow-lg shadow-blue/25 hover:bg-blue-dark",
        gold: "bg-gold text-kaizen-black shadow-lg shadow-gold/25 hover:bg-gold-dark",
        secondary: "bg-kaizen-dark text-kaizen-gray border border-blue/30 hover:border-blue hover:bg-blue/10",
        outline: "border border-blue/50 bg-transparent text-kaizen-gray hover:bg-blue/10",
        ghost: "text-kaizen-gray hover:bg-kaizen-dark",
        destructive: "bg-red-600 text-white hover:bg-red-700",
        link: "text-blue underline-offset-4 hover:underline",
      },
      size: {
        sm: "h-9 px-3.5",
        default: "h-11 px-6",
        lg: "h-12 px-8 text-base",
        xl: "h-16 px-10 text-lg",
        icon: "h-10 w-10",
      },
    },
    defaultVariants: { variant: "primary", size: "default" },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    );
  }
);
Button.displayName = "Button";

export { Button, buttonVariants };
