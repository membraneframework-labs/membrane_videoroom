import { useState } from "react";

export type PinningApi = {
  pinnedTileIds: string[];
  pin: (tileId: string) => void;
  unpin: (tileId: string) => void;
};

const usePinning = (): PinningApi => {
  const [pinnedTileIds, setPinnedTileIds] = useState<string[]>([]);

  const pin = (newTileId: string) => {
    console.log(pinnedTileIds);
    if (!(pinnedTileIds.includes(newTileId)))
      setPinnedTileIds(oldPinnedTileIds => [newTileId, ...oldPinnedTileIds]);
    console.log(pinnedTileIds);
  }

  const unpin = (tileIdToRemove: string) => {
    const idsWithoutGivenTile = pinnedTileIds.filter((tileId) => tileId !== tileIdToRemove);
    setPinnedTileIds(idsWithoutGivenTile);
  }

  return { pinnedTileIds, pin, unpin};
};

export default usePinning;
