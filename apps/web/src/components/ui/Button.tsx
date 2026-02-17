import React, { forwardRef } from "react";
import { cn } from "@/lib/utils/cn";

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "ghost";
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "primary", ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={cn(
          "rounded-lg px-4 py-2 text-sm font-medium transition-colors",
          variant === "primary" &&
            "bg-indigo-600 text-white hover:bg-indigo-700",
          variant === "secondary" &&
            "bg-white text-gray-900 shadow ring-1 ring-inset ring-gray-300 hover:bg-gray-50",
          variant === "ghost" && "text-gray-700 hover:bg-gray-100",
          className
        )}
        {...props}
      />
    );
  }
);

Button.displayName = "Button";
