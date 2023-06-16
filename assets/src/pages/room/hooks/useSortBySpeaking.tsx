import { groupBy } from "ramda";
import { MediaPlayerTileConfig, PeerTileConfig, isPeerTileConfig } from "../../types";
import { useCallback, useState } from "react";

// order:
// 1. local tile first
// 2. Screenshare tiles
// 3. Those that have spoken sorted by when they have spoken
// 4. The rest in an alphabetical order
const useSortBySpeaking = (videoTiles: MediaPlayerTileConfig[]): MediaPlayerTileConfig[] => {
    const [speakingHistory, setSpeakingHistory] = useState<Set<string>>(new Set());
    const hasSpoken = useCallback((tileId: string) => speakingHistory.has(tileId), [speakingHistory]);
    const addToHistory = useCallback((tileId: string) => {if (!hasSpoken(tileId)) setSpeakingHistory((oldHistory) => new Set(oldHistory).add(tileId))}, [setSpeakingHistory]);
    // const removeFromHistory = useCallback((tileIds: string) => )
    const sortRemoteTiles = (remoteTiles: PeerTileConfig[]) => {
        const {speaking, rest} = groupBy( ({mediaPlayerId, isSpeaking}: PeerTileConfig) => hasSpoken(mediaPlayerId) || isSpeaking ? "speaking" : "rest")(remoteTiles);
        const speakingTiles = speaking ?? [];
        speakingTiles.map(({mediaPlayerId}) => mediaPlayerId).filter((id) => !hasSpoken(id)).forEach(addToHistory);

        const restSortedByAlphabet = (rest ?? []).sort((a, b) => a.displayName.localeCompare(b.displayName));
        return {speakingTiles, restSortedByAlphabet};
    }
    
    const {localTiles, remoteTiles, screenshareTiles, } = groupBy(({typeName}: MediaPlayerTileConfig) => typeName === "local" ? "localTiles" : typeName === "remote" ? "remoteTiles" : "screenshareTiles")(videoTiles);
    const {speakingTiles, restSortedByAlphabet} = sortRemoteTiles((remoteTiles ?? []).filter(isPeerTileConfig));
    return [...localTiles, ...(screenshareTiles ?? []), ...speakingTiles, ...restSortedByAlphabet];
}


export default useSortBySpeaking;