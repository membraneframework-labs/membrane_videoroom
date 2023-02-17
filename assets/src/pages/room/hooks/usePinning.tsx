import { useState } from "react";

export type PinningApi = {
  pinnedTileIds: string[];
  pin: (tileId: string) => void;
  unpin: (tileId: string) => void;
  pinIfNotAlreadyPinned: (tileId: string) => void;
};

const usePinning = (): PinningApi => {
  const [pinnedTileIds, setPinnedTileIds] = useState<string[]>([]);
  const [pinnedTileIdHistory, setPinnedTileIdHistory] = useState<Set<string>>(new Set());

  const pin = (newTileId: string) => {
    const addToHistory = (tileId: string) => {
      setPinnedTileIdHistory((oldHistory) => new Set(oldHistory).add(tileId));
    };

    if (!pinnedTileIds.includes(newTileId)) {
      setPinnedTileIds((oldPinnedTileIds) => [newTileId, ...oldPinnedTileIds]);
      addToHistory(newTileId);
    }
  };

  const unpin = (tileIdToRemove: string) => {
    setPinnedTileIds((prevPinnedTiles) => prevPinnedTiles.filter((tileId) => tileId !== tileIdToRemove));
  };

  const wasPinned = (tileId: string) => {
    return pinnedTileIdHistory.has(tileId);
  };

  const pinIfNotAlreadyPinned = (tileId: string) => {
    if (!wasPinned(tileId)) {
      pin(tileId);
    }
  };

  return { pinnedTileIds, pin, unpin, pinIfNotAlreadyPinned };
};

export default usePinning;
