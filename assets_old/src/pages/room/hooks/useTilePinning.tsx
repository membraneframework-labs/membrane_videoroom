import { useCallback, useEffect, useState } from "react";
import { MediaPlayerTileConfig, StreamSource } from "../../types";
import usePinning from "./usePinning";
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
  const { pinnedTileIds, pin, unpin, pinIfNotAlreadyPinned } = usePinning();
  const [numberOfTiles, setNumberOfTiles] = useState<number>(tileConfigs.length);
  const [autoPinned, setAutoPinned] = useState<string | null>(null);

  const pinNewScreenShares = useCallback(() => {
    tileConfigs
      .filter((tile) => tile.typeName === "screenShare")
      .map((tile) => tile.mediaPlayerId)
      .forEach(pinIfNotAlreadyPinned);
  }, [tileConfigs, pinIfNotAlreadyPinned]);

  const unpinAutoPinnedWhenNumberOfTilesChanged = useCallback(
    (oldNumber: number, newNumber: number): void => {
      if (autoPinned && oldNumber !== newNumber) {
        unpin(autoPinned);
      }
    },
    [autoPinned, unpin]
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

    const isLocalPinned = pinnedTileIds.includes(localUserTileId);
    const isRemotePinned = pinnedTileIds.includes(remoteUserTileId);

    if (!isLocalPinned && !isRemotePinned) {
      pinIfNotAlreadyPinned(remoteUserTileId);
      setAutoPinned(remoteUserTileId);
    }
  }, [tileConfigs, pinnedTileIds, pinIfNotAlreadyPinned]);

  useEffect(() => {
    pinNewScreenShares();
    autoPinSecondPeer();
  }, [pinNewScreenShares, autoPinSecondPeer]);

  const takeOutPinnedTiles = useCallback((): {
    pinnedTiles: MediaPlayerTileConfig[];
    unpinnedTiles: MediaPlayerTileConfig[];
  } => {
    const { pinnedTiles, unpinnedTiles } = groupBy(tileConfigs, ({ mediaPlayerId }) =>
      pinnedTileIds.includes(mediaPlayerId) ? "pinnedTiles" : "unpinnedTiles"
    );
    return { pinnedTiles: pinnedTiles ?? [], unpinnedTiles: unpinnedTiles ?? [] };
  }, [tileConfigs, pinnedTileIds]);

  const { pinnedTiles, unpinnedTiles } = takeOutPinnedTiles();

  const unpinFirstIfNecessary = useCallback(() => {
    if (tileConfigs.length !== 2 || !pinnedTileIds[0]) return;
    const pinnedTileId = pinnedTileIds[0];
    unpin(pinnedTileId);
  }, [tileConfigs.length, pinnedTileIds, unpin]);

  const pinTile = useCallback(
    (tileId: string) => {
      unpinFirstIfNecessary();
      pin(tileId);
    },
    [unpinFirstIfNecessary, pin]
  );

  const unpinTile = useCallback(
    (tileId: string) => {
      if (tileId === autoPinned) removeAutoPin();
      unpin(tileId);
    },
    [autoPinned, removeAutoPin, unpin]
  );

  const pinningFlags: PinningFlags = {
    blockPinning: tileConfigs.length === 1,
    isAnyPinned: pinnedTiles.length > 0,
    isAnyUnpinned: unpinnedTiles.length > 0,
  };

  return { pinnedTiles, unpinnedTiles, pinTile, unpinTile, pinningFlags };
};

export default useTilePinning;
