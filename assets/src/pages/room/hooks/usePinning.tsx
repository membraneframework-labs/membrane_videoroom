import { useState } from "react";

export type PinningApi = {
  pinnedTileIds: string[];
  pin: (tileId: string) => void;
  unpin: (tileId: string) => void;
  pinIfNotAlreadyPinned: (tileId: string) => void;
  removePinnedEarlier: (localTileId: string, remoteTileId: string) => void;
};

const usePinning = (): PinningApi => {
  const [pinnedTileIds, setPinnedTileIds] = useState<string[]>([]);
  const [pinnedTileIdHistory, setPinnedTileIdHistory] = useState<Set<string>>(new Set());
  const [lastPinnedTileId, setLastPinnedTileId] = useState<string | null>(null);

  const pin = (newTileId: string) => {
    const addToHistory = (tileId: string) => {
      setPinnedTileIdHistory((oldHistory) => new Set(oldHistory).add(tileId));
    };

    if (!pinnedTileIds.includes(newTileId)) {
      setPinnedTileIds((oldPinnedTileIds) => [newTileId, ...oldPinnedTileIds]);
      addToHistory(newTileId);
      setLastPinnedTileId(newTileId);
    }
  };

  const unpin = (tileIdToRemove: string) => {
    setPinnedTileIds((prevPinnedTiles) => prevPinnedTiles.filter((tileId) => tileId !== tileIdToRemove));
    setLastPinnedTileId(null);
  };

  const wasPinned = (tileId: string) => {
    return pinnedTileIdHistory.has(tileId);
  };

  const pinIfNotAlreadyPinned = (tileId: string) => {
    if (!wasPinned(tileId)) {
      pin(tileId);
    }
  };

  const removePinnedEarlier = (localTileId: string, remoteTileId: string) => {
    if (!lastPinnedTileId) return;

    if (localTileId === lastPinnedTileId) unpin(remoteTileId);
    if (remoteTileId === lastPinnedTileId) unpin(localTileId);
  }

  return { pinnedTileIds, pin, unpin, pinIfNotAlreadyPinned, removePinnedEarlier};
};

export default usePinning;
