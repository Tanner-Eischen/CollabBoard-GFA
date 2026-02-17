"use client";

import { createContext, useCallback, useContext, useState } from "react";
import { cn } from "@/lib/utils/cn";

interface ToastMessage {
  id: string;
  message: string;
  type?: "success" | "error" | "info";
}

interface ToastContextValue {
  toast: (message: string, type?: ToastMessage["type"]) => void;
}

const ToastContext = createContext<ToastContextValue | null>(null);

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const toast = useCallback((message: string, type: ToastMessage["type"] = "info") => {
    const id = crypto.randomUUID();
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((item) => item.id !== id));
    }, 3000);
  }, []);

  return (
    <ToastContext.Provider value={{ toast }}>
      {children}
      <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2" aria-live="polite">
        {toasts.map((item) => (
          <div
            key={item.id}
            role="alert"
            className={cn(
              "rounded-lg px-4 py-2 text-sm shadow-lg",
              item.type === "error" && "bg-red-100 text-red-800",
              item.type === "success" && "bg-green-100 text-green-800",
              (item.type === "info" || !item.type) && "bg-gray-900 text-white"
            )}
          >
            {item.message}
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error("useToast must be used within ToastProvider");
  }
  return context;
}
