import React, { createContext, ReactNode, useCallback, useMemo, useState } from "react";
import Toast from "../components/Toast";

const DEFAULT_TOAST_TIMEOUT = 2500;

export type ToastType = { id: string; message?: string; timeout?: number | "INFINITY"; type?: "information" | "error" };

export const ToastContext = createContext({
  addToast: (newToast: ToastType) => console.log(`Unknown error while adding toast: ${newToast}`),
});

export const ToastProvider = ({ children }: { children?: ReactNode }) => {
  const [toasts, setToasts] = useState<ToastType[]>([]);

  const addToast = useCallback(
    (newToast: ToastType) => {
      const toastExists = toasts.find((el) => el.id == newToast.id);

      if (toastExists) return;

      setToasts((prev) => [...prev, newToast]);
      if (newToast.timeout === "INFINITY") return;

      setTimeout(() => {
        removeToast(newToast.id);
      }, newToast.timeout || DEFAULT_TOAST_TIMEOUT);
    },
    [toasts]
  );

  const removeToast = (toastId: string) => {
    document.getElementById(toastId)?.classList.add("fadeOut");
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id != toastId));
    }, 2000);
  };

  const value = useMemo(() => ({ addToast }), [addToast]);

  return (
    <ToastContext.Provider value={value}>
      {children}

      <div className="absolute left-1/2 top-4 -translate-x-1/2 transform space-y-2">
        {toasts.map((toast, idx) => (
          <Toast key={`${toast.id}-${idx}`} {...toast} onClose={() => removeToast(toast.id)}></Toast>
        ))}
      </div>
    </ToastContext.Provider>
  );
};
