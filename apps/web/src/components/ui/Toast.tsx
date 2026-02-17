"use client";

import { createContext, useCallback, useContext, useState } from "react";
import { cn } from "@/lib/utils/cn";

interface ToastMessage {
  id: string;
  message: string;
  type?: "success" | "error" | "info";
}

interface ToastContextValue {
  toasts: ToastMessage[];
  toast: (message: string, type?: ToastMessage["type"]) => void;
  dismiss: (id: string) => void;
}

const ToastContext = createContext<ToastContextValue | null>(null);

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const toast = useCallback(
    (message: string, type: ToastMessage["type"] = "info") => {
      const id = crypto.randomUUID();
      setToasts((prev) => [...prev, { id, message, type }]);
      setTimeout(() => setToasts((prev) => prev.filter((t) => t.id !== id)), 3000);
    },
    []
  );

  const dismiss = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  return (
    <ToastContext.Provider value={{ toasts, toast, dismiss }}>
      {children}
      <div
        className="fixed bottom-4 right-4 z-50 flex flex-col gap-2"
        aria-live="polite"
      >
        {toasts.map((t) => (
          <div
            key={t.id}
            role="alert"
            className={cn(
              "rounded-lg px-4 py-2 text-sm shadow-lg",
              t.type === "error" && "bg-red-100 text-red-800",
              t.type === "success" && "bg-green-100 text-green-800",
              (t.type === "info" || !t.type) && "bg-gray-900 text-white"
            )}
          >
            {t.message}
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToast must be used within ToastProvider");
  return ctx;
}
