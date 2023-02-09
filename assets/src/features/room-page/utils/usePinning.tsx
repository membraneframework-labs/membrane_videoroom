import { useState } from "react";

export type PinningApi = {
  pinnedTileIds: string[];
  pin: (tileId: string) => void;
  unpin: (tileId: string) => void;
};

const usePinning = (): PinningApi => {
  const [pinnedTileIds, setPinnedTileIds] = useState<string[]>([]);

  const pin = (newTileId: string) => {
    if (!pinnedTileIds.includes(newTileId)) setPinnedTileIds((oldPinnedTileIds) => [newTileId, ...oldPinnedTileIds]);
  };

  const unpin = (tileIdToRemove: string) => {
    setPinnedTileIds((prevPinnedTiles) => prevPinnedTiles.filter((tileId) => tileId !== tileIdToRemove));
  };

  return { pinnedTileIds, pin, unpin };
};

export default usePinning;
