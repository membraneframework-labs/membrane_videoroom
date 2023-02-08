import React, { useState } from "react";

export type PinningApi = {
  pinnedTileId: string;
  pin: (tileId: string) => void;
  unpin: () => void;
};

const usePinning = (): PinningApi => {
  const [pinnedTileId, setPinnedTileId] = useState<string>("");

  return { pinnedTileId, pin: setPinnedTileId, unpin: () => setPinnedTileId("") };
};

export default usePinning;
