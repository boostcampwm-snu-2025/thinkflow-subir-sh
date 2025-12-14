import { useCallback, useState } from "react";
import type { Item } from "../../../shared/types";

export function useItemDeleteModal() {
  const [open, setOpen] = useState(false);
  const [target, setTarget] = useState<Item | null>(null);

  const openModal = useCallback((item: Item) => {
    setTarget(item);
    setOpen(true);
  }, []);

  const closeModal = useCallback(() => {
    setOpen(false);
    setTarget(null);
  }, []);

  return {
    open,
    target,
    openModal,
    closeModal,
    setOpen,   // 필요하면 외부에서 제어
    setTarget, // 필요하면 외부에서 제어
  };
}
