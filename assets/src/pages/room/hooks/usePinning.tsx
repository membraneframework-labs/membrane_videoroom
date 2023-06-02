import { useMemo, useReducer, useState } from "react";

export type PinningApi = {
  pinnedTileIds: string[];
  pin: (tileId: string) => void;
  unpin: (tileId: string) => void;
  pinIfNotAlreadyPinned: (tileId: string) => void;
};

export const InitialState: PinState = {
  pinnedTilesIds: [],
  pinnedTileIdHistory: new Set<string>(),
};

type Action =
  | { type: "pin"; tileId: string }
  | { type: "unpin"; tileId: string }
  | {
      type: "pinIfNotAlreadyPinned";
      tileId: string;
    };

const pin = (state: PinState, tileId: string) => {
  const pinned = [...state.pinnedTilesIds];
  if (!pinned.includes(tileId)) {
    return {
      pinnedTilesIds: [...pinned, tileId],
      pinnedTileIdHistory: new Set(state.pinnedTileIdHistory).add(tileId),
    };
  }
  return state;
};

export const reducer = (state: PinState, action: Action): PinState => {
  if (action.type === "pin") {
    return pin(state, action.tileId);
  } else if (action.type === "unpin") {
    return {
      ...state,
      pinnedTilesIds: state.pinnedTilesIds.filter((tileId) => tileId !== action.tileId),
    };
  } else if (action) {
    if (!state.pinnedTileIdHistory.has(action.tileId)) {
      return pin(state, action.tileId);
    }
  }

  return InitialState;
};

export type PinState = {
  pinnedTilesIds: string[];
  pinnedTileIdHistory: Set<string>;
};

// todo remove
const usePinning = (): PinningApi => {
  const [state, dispatch] = useReducer(reducer, InitialState);

  return useMemo(
      () => ({
        pinnedTileIds: state.pinnedTilesIds,
        pin: (tileId: string) => dispatch({type: "pin", tileId}),
        unpin: (tileId: string) => dispatch({type: "unpin", tileId}),
        pinIfNotAlreadyPinned: (tileId: string) => dispatch({type: "pinIfNotAlreadyPinned", tileId}),
      }),
      [state.pinnedTilesIds, dispatch]
  );
};

const usePinning2 = (): PinningApi => {
  const [pinnedTileIds, setPinnedTileIds] = useState<string[]>([]);
  const [pinnedTileIdHistory, setPinnedTileIdHistory] = useState<Set<string>>(new Set());

  const pin = (newTileId: string) => {
    if (!pinnedTileIds.includes(newTileId)) {
      setPinnedTileIds((oldPinnedTileIds) => [newTileId, ...oldPinnedTileIds]);
      setPinnedTileIdHistory((oldHistory) => new Set(oldHistory).add(newTileId));
    }
  };

  const unpin = (tileIdToRemove: string) => {
    setPinnedTileIds((prevPinnedTiles) => prevPinnedTiles.filter((tileId) => tileId !== tileIdToRemove));
  };

  const pinIfNotAlreadyPinned = (tileId: string) => {
    if (!pinnedTileIdHistory.has(tileId)) {
      pin(tileId);
    }
  };

  return { pinnedTileIds, pin, unpin, pinIfNotAlreadyPinned };
};

export default usePinning;
