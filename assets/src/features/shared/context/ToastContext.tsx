import React, { createContext, ReactNode, useCallback, useMemo, useState } from "react";
import Toast from "../components/Toast";

const TOAST_TIMEOUT = 2500;

export type ToastType = { id: string; message?: string };

export const ToastContext = createContext({
  addToast: (newToast: ToastType) => console.log(`Unknown error while adding toast: ${newToast}`),
});

export const ToastProvder = ({ children }: { children?: ReactNode }) => {
  const [toasts, setToasts] = useState<ToastType[]>([]);

  const addToast = useCallback(
    (newToast: ToastType) => {
      const toastExists = toasts.find((el) => el.id == newToast.id);

      if (toastExists) return;

      setToasts((prev) => [...prev, newToast]);
      const timer = setTimeout(() => {
        removeToast(newToast.id);
        clearTimeout(timer);
      }, TOAST_TIMEOUT);
    },
    [toasts]
  );

  const removeToast = (toastId: string) => {
    setToasts((prev) => prev.filter((t) => t.id != toastId));
  };

  const value = useMemo(() => ({ addToast }), [addToast]);

  return (
    <ToastContext.Provider value={value}>
      {children}

      <div className="absolute left-1/2 top-4 -translate-x-1/2 transform space-y-2">
        {toasts.map((toast) => (
          <Toast {...toast} onClose={() => removeToast(toast.id)}></Toast>
        ))}
      </div>
    </ToastContext.Provider>
  );
};
