import * as React from "react";
import { cn } from "@/lib/utils";

export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(
          "flex h-10 w-full rounded-[10px] border border-[#E2E8F0] dark:border-[#1F2C4A] bg-white dark:bg-[#10182B] px-3.5 py-2 text-sm text-[#172033] dark:text-[#F1F3FA] placeholder:text-[#68758B] dark:placeholder:text-[#6F7C99] ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#5945E8] dark:focus-visible:ring-[#7968FF] focus-visible:ring-offset-1 disabled:cursor-not-allowed disabled:opacity-50 transition-all",
          className
        )}
        ref={ref}
        {...props}
      />
    );
  }
);
Input.displayName = "Input";

export { Input };
