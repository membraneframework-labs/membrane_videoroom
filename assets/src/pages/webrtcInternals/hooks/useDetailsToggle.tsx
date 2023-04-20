import { useCallback, useState } from "react";

type DetailsToggleApi = {
  openKeys: Set<string>;
  isOpen: (key: string) => boolean;
  toggle: (key: string) => void;
};

const useDetailsToggle = (): DetailsToggleApi => {
  const [openKeys, setOpenKeys] = useState<Set<string>>(new Set());

  const isOpen = useCallback((key: string) => openKeys.has(key), [openKeys]);

  const toggle = useCallback(
    (key: string) => {
      const openDetails = (keyToAdd: string) => {
        setOpenKeys((prev) => new Set(prev).add(keyToAdd));
      };

      const closeDetails = (keyToRemove: string) => {
        setOpenKeys((prev) => new Set([...prev].filter((key) => key !== keyToRemove)));
      };

      if (isOpen(key)) closeDetails(key);
      else openDetails(key);
    },
    [isOpen]
  );

  return { openKeys, isOpen, toggle };
};

export default useDetailsToggle;
