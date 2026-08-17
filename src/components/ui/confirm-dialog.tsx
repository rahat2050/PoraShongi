"use client";

import { useEffect, useId } from "react";
import { Button } from "@/components/ui/button";

/**
 * হালকা confirm dialog — delete/ধ্বংসাত্মক action-এর আগে "নিশ্চিত?" দেখায়।
 */
export function ConfirmDialog({
  open,
  title,
  message,
  confirmLabel = "হ্যাঁ, নিশ্চিত",
  cancelLabel = "বাতিল",
  danger = true,
  loading = false,
  onConfirm,
  onCancel,
}: {
  open: boolean;
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  danger?: boolean;
  loading?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}) {
  const titleId = useId();
  const descriptionId = useId();

  useEffect(() => {
    if (!open) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape" && !loading) onCancel();
    };
    window.addEventListener("keydown", closeOnEscape);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", closeOnEscape);
    };
  }, [loading, onCancel, open]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4 pb-[calc(1rem+env(safe-area-inset-bottom))] backdrop-blur-sm" onClick={onCancel}>
      <div className="max-h-[calc(100dvh-5rem)] w-full max-w-sm overflow-y-auto overscroll-contain rounded-2xl bg-white p-6 shadow-xl sm:max-h-[calc(100vh-2rem)] dark:bg-slate-800" onClick={(e) => e.stopPropagation()} role="alertdialog" aria-modal="true" aria-labelledby={titleId} aria-describedby={descriptionId}>
        <h2 id={titleId} className="text-lg font-semibold text-slate-900 dark:text-slate-100">{title}</h2>
        <p id={descriptionId} className="mt-1.5 text-sm text-slate-500 dark:text-slate-300">{message}</p>
        <div className="mt-5 flex justify-end gap-2">
          <Button variant="outline" onClick={onCancel} disabled={loading}>{cancelLabel}</Button>
          <Button variant={danger ? "danger" : "primary"} onClick={onConfirm} loading={loading} autoFocus>
            {confirmLabel}
          </Button>
        </div>
      </div>
    </div>
  );
}
