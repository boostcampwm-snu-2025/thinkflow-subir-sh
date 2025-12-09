import type { PropsWithChildren } from "react";
import clsx from "clsx";

interface ModalProps extends PropsWithChildren {
  open: boolean;
  onClose: () => void;
}

export function Modal({ open, onClose, children }: ModalProps) {
  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/30"
      onClick={onClose}
    >
      <div
        className={clsx(
          "w-full max-w-sm rounded-2xl bg-white p-5 shadow-lg",
        )}
        onClick={(e) => e.stopPropagation()}
      >
        {children}
      </div>
    </div>
  );
}