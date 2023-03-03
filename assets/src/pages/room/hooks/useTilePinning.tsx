import React, { useCallback, useEffect } from "react";
import { MediaPlayerTileConfig, StreamSource } from "../../types";
import usePinning from "./usePinning";
import { groupBy } from "../utils";

type TilePinningApi = {
    pinnedTiles: MediaPlayerTileConfig[];
    unpinnedTiles: MediaPlayerTileConfig[];
    pinTile: (tileId: string) => void;
    unpinTile: (tileId: string) => void;
}

const useTilePinning = (tileConfigs: MediaPlayerTileConfig[]): TilePinningApi => {
    const {pinnedTileIds, pin, unpin, pinIfNotAlreadyPinned} = usePinning();

    const pinNewScreenShares = useCallback(() => {
        tileConfigs
            .filter((tile) => tile.typeName === "screenShare")
            .map((tile) => tile.mediaPlayerId)
            .forEach(pinIfNotAlreadyPinned);
      }, [tileConfigs, pinIfNotAlreadyPinned]);
    
    const pinNewPeer = useCallback(() => {
        if (tileConfigs.length !== 2) return;
        
        const findTileId = (source: StreamSource) => tileConfigs.find((tile) => tile.streamSource === source)?.mediaPlayerId;
    
        const localUserTileId = findTileId("local");
        const remoteUserTileId = findTileId("remote");
        if (!localUserTileId || !remoteUserTileId) return;
    
        const isLocalPinned = pinnedTileIds.includes(localUserTileId);
        const isRemotePinned = pinnedTileIds.includes(remoteUserTileId);
    
        if (!isLocalPinned && !isRemotePinned)
            pinIfNotAlreadyPinned(remoteUserTileId);
  },[tileConfigs, pinnedTileIds, pinIfNotAlreadyPinned]);

    useEffect(() => {
        pinNewScreenShares();
        pinNewPeer()
    }, [pinNewScreenShares, pinNewPeer])


    const takeOutPinnedTiles = useCallback((
        ): { pinnedTiles: MediaPlayerTileConfig[]; unpinnedTiles: MediaPlayerTileConfig[] } => {
          const { pinnedTiles, unpinnedTiles } = groupBy(tileConfigs, ({ mediaPlayerId }) =>
            pinnedTileIds.includes(mediaPlayerId) ? "pinnedTiles" : "unpinnedTiles"
          );
          return { pinnedTiles: pinnedTiles ?? [], unpinnedTiles: unpinnedTiles ?? [] };
        },[tileConfigs, pinnedTileIds]);

    const {pinnedTiles, unpinnedTiles} = takeOutPinnedTiles();

    
    const unpinFirstIfNecessary = useCallback(() => {
        if (tileConfigs.length !== 2 || pinnedTileIds.length !== 1 ) return;
        const pinnedTileId = pinnedTileIds[0];
        unpin(pinnedTileId);
      }, [tileConfigs.length, pinnedTileIds, unpin]);

    const pinTile = useCallback((tileId: string) => {
        unpinFirstIfNecessary();
        pin(tileId);
    }, [unpinFirstIfNecessary, pin]);

    const unpinTile = unpin;

    return {pinnedTiles, unpinnedTiles, pinTile, unpinTile}
}

export default useTilePinning;