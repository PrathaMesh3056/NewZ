import React, { useEffect, useState } from "react";

// Simple event bus for toasts
const listeners = new Set();
let idCounter = 0;

function subscribe(listener) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

function notify(toast) {
  listeners.forEach((l) => l(toast));
}

export function toast(message, type = "info") {
  notify({ id: ++idCounter, message, type });
}

toast.success = (message) => toast(message, 'success');
toast.error = (message) => toast(message, 'error');
toast.warning = (message) => toast(message, 'warning');

export const Toaster = () => {
  const [toasts, setToasts] = useState([]);

  useEffect(() => {
    const unsub = subscribe((t) => {
      setToasts((prev) => [...prev, t]);
      // Auto dismiss after 2.5s
      setTimeout(() => {
        setToasts((prev) => prev.filter((x) => x.id !== t.id));
      }, 2500);
    });
    return unsub;
  }, []);

  const base = "pointer-events-auto flex items-center gap-2 px-4 py-2 rounded-md shadow-md border text-sm backdrop-blur transition-all duration-300 animate-in slide-in-from-top-5";
  const variants = {
    info: "bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700 text-gray-800 dark:text-gray-200",
    success: "bg-green-50 dark:bg-green-900/30 border-green-200 dark:border-green-700 text-green-800 dark:text-green-300",
    error: "bg-red-50 dark:bg-red-900/30 border-red-200 dark:border-red-700 text-red-800 dark:text-red-300",
    warning: "bg-yellow-50 dark:bg-yellow-900/30 border-yellow-200 dark:border-yellow-700 text-yellow-800 dark:text-yellow-300",
  };

  return (
    <div className="fixed top-4 right-4 z-50 space-y-2">
      {toasts.map((t) => (
        <div key={t.id} className={`${base} ${variants[t.type] || variants.info}`}>
          {t.type === "success" && <span>✅</span>}
          {t.type === "error" && <span>⚠️</span>}
          {t.type === "warning" && <span>⚠️</span>}
          {(!t.type || t.type === "info") && <span>ℹ️</span>}
          <span>{t.message}</span>
        </div>
      ))}
    </div>
  );
};
