"use client";

import type { InputHTMLAttributes } from "react";
import { cn } from "@/lib/utils/cn";

export type InputProps = InputHTMLAttributes<HTMLInputElement>;

export function Input({ className, ...props }: InputProps) {
  return (
    <input
      className={cn(
        "w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900 shadow-sm outline-none ring-blue-500 placeholder:text-gray-400 focus:ring-2",
        className
      )}
      {...props}
    />
  );
}
