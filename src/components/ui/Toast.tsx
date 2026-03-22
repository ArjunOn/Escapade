"use client";

import { createContext, useContext, useState, useCallback, ReactNode } from "react";
import { CheckCircle2, AlertCircle, Info, X } from "lucide-react";
import { cn } from "@/lib/utils";

type ToastType = "success" | "error" | "info";
interface Toast { id: string; message: string; type: ToastType; }
interface ToastContextType { toast: (message: string, type?: ToastType) => void; }

const ToastContext = createContext<ToastContextType>({ toast: () => {} });

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const toast = useCallback((message: string, type: ToastType = "success") => {
    const id = crypto.randomUUID();
    setToasts(t => [...t, { id, message, type }]);
    setTimeout(() => setToasts(t => t.filter(x => x.id !== id)), 3500);
  }, []);

  const icons = { success: CheckCircle2, error: AlertCircle, info: Info };
  const colors = {
    success: "bg-white border-[var(--color-success)] text-[var(--color-success)]",
    error:   "bg-white border-[var(--color-error)]   text-[var(--color-error)]",
    info:    "bg-white border-[var(--color-primary)]  text-[var(--color-primary)]",
  };

  return (
    <ToastContext.Provider value={{ toast }}>
      {children}
      <div className="fixed bottom-20 lg:bottom-6 right-4 z-[200] flex flex-col gap-2 pointer-events-none">
        {toasts.map(t => {
          const Icon = icons[t.type];
          return (
            <div key={t.id}
              className={cn(
                "flex items-center gap-3 px-4 py-3 rounded-2xl border shadow-lg max-w-xs pointer-events-auto",
                "animate-fade-up",
                colors[t.type]
              )}>
              <Icon className="w-4 h-4 flex-shrink-0" />
              <span className="text-sm font-medium text-[var(--color-text-primary)] flex-1">{t.message}</span>
              <button onClick={() => setToasts(x => x.filter(i => i.id !== t.id))}
                className="text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)]">
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() { return useContext(ToastContext); }
