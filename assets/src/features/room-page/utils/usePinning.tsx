import { useState } from "react";

export type PinningApi = {
  pinnedTileIds: string[];
  pin: (tileId: string) => void;
  unpin: (tileId: string) => void;
  pinIfNotAlreadyPinned: (tileId: string) => void;
};

const usePinning = (): PinningApi => {
  const [pinnedTileIds, setPinnedTileIds] = useState<string[]>([]);
  const [pinnedTileIdHistory, setPinnedTileIdHistory] = useState<string[]>([]);
  const historyLimit = 20;

  const pin = (newTileId: string) => {
    const updateHistory = (tileId: string) => {
      setPinnedTileIdHistory((oldHistory) => {
        if (oldHistory.length > historyLimit)
          oldHistory.pop();
        return oldHistory.includes(tileId) ? oldHistory : [tileId, ...oldHistory];
      });      
    }

    if (!pinnedTileIds.includes(newTileId)) {
      setPinnedTileIds((oldPinnedTileIds) => [newTileId, ...oldPinnedTileIds]);
      updateHistory(newTileId);
    }
  };

  const unpin = (tileIdToRemove: string) => {
    setPinnedTileIds((prevPinnedTiles) => prevPinnedTiles.filter((tileId) => tileId !== tileIdToRemove));
  };

  const wasPinned = (tileId: string) => {
    return pinnedTileIdHistory.includes(tileId);
  }

  const pinIfNotAlreadyPinned = (tileId: string) => {
    if (!wasPinned(tileId)){
      pin(tileId);
    }
  }

  return { pinnedTileIds, pin, unpin, pinIfNotAlreadyPinned };
};

export default usePinning;
