import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[11px] font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-[#5945E8]",
  {
    variants: {
      variant: {
        default:
          "border-transparent bg-[#EEF0FA] text-[#5945E8] dark:bg-[#1C2642] dark:text-[#A394FF]",
        secondary:
          "border-transparent bg-[#F1F3F9] text-[#68758B] dark:bg-[#1E2945] dark:text-[#A0ABC0]",
        destructive:
          "border-transparent bg-[#FDECEF] text-[#E34E62] dark:bg-[#3B151F] dark:text-[#F16B7B]",
        success:
          "border-transparent bg-[#E6F8F3] text-[#0DAA78] dark:bg-[#0B3326] dark:text-[#21C997]",
        warning:
          "border-transparent bg-[#FEF5E9] text-[#E99A27] dark:bg-[#382408] dark:text-[#F4B544]",
        outline:
          "border border-[#E2E8F0] dark:border-[#1F2C4A] text-[#172033] dark:text-[#F1F3FA]",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props} />
  );
}

export { Badge, badgeVariants };
