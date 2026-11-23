import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center whitespace-nowrap rounded-[10px] text-xs sm:text-sm font-semibold transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#5945E8] dark:focus-visible:ring-[#7968FF] focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 select-none",
  {
    variants: {
      variant: {
        default:
          "bg-[#5945E8] hover:bg-[#4d39d9] active:bg-[#402EBE] dark:bg-[#7968FF] dark:hover:bg-[#6c57ff] text-white shadow-sm active:scale-[0.99]",
        destructive:
          "bg-[#E34E62] hover:bg-[#d43f53] dark:bg-[#F16B7B] dark:hover:bg-[#e05667] text-white shadow-sm active:scale-[0.99]",
        outline:
          "border border-[#E2E8F0] dark:border-[#1F2C4A] bg-white dark:bg-[#151D30] text-[#172033] dark:text-[#F1F3FA] hover:bg-[#F6F7FB] dark:hover:bg-[#1A243C] shadow-sm",
        secondary:
          "bg-[#EEF0FA] text-[#5945E8] dark:bg-[#1C2642] dark:text-[#A394FF] hover:bg-[#E3E6F7] dark:hover:bg-[#253255]",
        ghost:
          "text-[#68758B] dark:text-[#A0ABC0] hover:bg-[#EEF0FA] dark:hover:bg-[#1C2642] hover:text-[#172033] dark:hover:text-[#F1F3FA]",
        link:
          "text-[#5945E8] dark:text-[#7968FF] underline-offset-4 hover:underline",
      },
      size: {
        default: "h-9 sm:h-10 px-4 py-2",
        sm: "h-8 rounded-[8px] px-3 text-xs",
        lg: "h-11 sm:h-12 rounded-[12px] px-6 text-sm sm:text-base",
        icon: "h-9 w-9 sm:h-10 sm:w-10 p-0",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, ...props }, ref) => {
    return (
      <button
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    );
  }
);
Button.displayName = "Button";

export { Button, buttonVariants };
