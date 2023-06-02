import { useCallback, useEffect, useReducer, useState } from "react";
import { MediaPlayerTileConfig, StreamSource } from "../../types";
import usePinning, { InitialState, reducer } from "./usePinning";
import { groupBy } from "../utils";

type PinningFlags = {
  blockPinning: boolean;
  isAnyPinned: boolean;
  isAnyUnpinned: boolean;
};

type TilePinningApi = {
  pinnedTiles: MediaPlayerTileConfig[];
  unpinnedTiles: MediaPlayerTileConfig[];
  pinTile: (tileId: string) => void;
  unpinTile: (tileId: string) => void;
  pinningFlags: PinningFlags;
};

const useTilePinning = (tileConfigs: MediaPlayerTileConfig[]): TilePinningApi => {
  // const { pinnedTileIds, pin, unpin, pinIfNotAlreadyPinned } = usePinning();
  const [state, dispatch] = useReducer(reducer, InitialState);

  const [numberOfTiles, setNumberOfTiles] = useState<number>(tileConfigs.length);
  const [autoPinned, setAutoPinned] = useState<string | null>(null);

  const pinNewScreenShares = useCallback(() => {
    tileConfigs
      .filter((tile) => tile.typeName === "screenShare")
      .map((tile) => tile.mediaPlayerId)
      .forEach((tileId) => dispatch({ type: "pinIfNotAlreadyPinned", tileId }));
  }, [tileConfigs]);

  const unpinAutoPinnedWhenNumberOfTilesChanged = useCallback(
    (oldNumber: number, newNumber: number): void => {
      if (autoPinned && oldNumber !== newNumber) {
        dispatch({ type: "unpin", tileId: autoPinned })
      }
    },
    [autoPinned]
  );

  const removeAutoPin = useCallback(() => setAutoPinned(null), []);

  useEffect(() => {
    unpinAutoPinnedWhenNumberOfTilesChanged(numberOfTiles, tileConfigs.length);
    setNumberOfTiles(tileConfigs.length);
  }, [unpinAutoPinnedWhenNumberOfTilesChanged, numberOfTiles, tileConfigs.length]);

  const autoPinSecondPeer = useCallback(() => {
    if (tileConfigs.length !== 2) return;

    const findTileId = (source: StreamSource) =>
      tileConfigs.find((tile) => tile.streamSource === source)?.mediaPlayerId;

    const localUserTileId = findTileId("local");
    const remoteUserTileId = findTileId("remote");
    if (!localUserTileId || !remoteUserTileId) return;

    const isLocalPinned = state.pinnedTilesIds.includes(localUserTileId);
    const isRemotePinned = state.pinnedTilesIds.includes(remoteUserTileId);

    if (!isLocalPinned && !isRemotePinned) {
      dispatch({ type: "pinIfNotAlreadyPinned", tileId: remoteUserTileId });
      setAutoPinned(remoteUserTileId);
    }
  }, [tileConfigs, state.pinnedTilesIds]);

  useEffect(() => {
    pinNewScreenShares();
    autoPinSecondPeer();
  }, [pinNewScreenShares, autoPinSecondPeer]);

  // todo refactor to useMemo
  const takeOutPinnedTiles = useCallback((): {
    pinnedTiles: MediaPlayerTileConfig[];
    unpinnedTiles: MediaPlayerTileConfig[];
  } => {
    const { pinnedTiles, unpinnedTiles } = groupBy(tileConfigs, ({ mediaPlayerId }) =>
      state.pinnedTilesIds.includes(mediaPlayerId) ? "pinnedTiles" : "unpinnedTiles"
    );
    return { pinnedTiles: pinnedTiles ?? [], unpinnedTiles: unpinnedTiles ?? [] };
  }, [tileConfigs, state.pinnedTilesIds]);

  const { pinnedTiles, unpinnedTiles } = takeOutPinnedTiles();

  const unpinFirstIfNecessary = useCallback(() => {
    if (tileConfigs.length !== 2 || !state.pinnedTilesIds[0]) return;
    const pinnedTileId = state.pinnedTilesIds[0];
    dispatch({ type: "unpin", tileId: pinnedTileId });
  }, [tileConfigs.length, state.pinnedTilesIds]);

  const pinTile = useCallback(
    (tileId: string) => {
      unpinFirstIfNecessary();
      dispatch({ type: "pin", tileId })
    },
    [unpinFirstIfNecessary]
  );

  const unpinTile = useCallback(
    (tileId: string) => {
      if (tileId === autoPinned) removeAutoPin();
      dispatch({ type: "unpin", tileId })
    },
    [autoPinned, removeAutoPin]
  );

  const pinningFlags: PinningFlags = {
    blockPinning: tileConfigs.length === 1,
    isAnyPinned: pinnedTiles.length > 0,
    isAnyUnpinned: unpinnedTiles.length > 0,
  };

  return { pinnedTiles, unpinnedTiles, pinTile, unpinTile, pinningFlags };
};

export default useTilePinning;
