import { groupBy } from "ramda";
import { MediaPlayerTileConfig, PeerTileConfig, isPeerTileConfig } from "../../types";
import { useCallback, useState } from "react";

type date = number;

// desired order:
// 1. local tile first
// 2. Screenshare tiles
// 3. Those that have spoken sorted by when they have spoken
// 4. The rest in an alphabetical order
const useSortBySpeaking = (videoTiles: MediaPlayerTileConfig[]): MediaPlayerTileConfig[] => {
  const [speakingHistory, setSpeakingHistory] = useState<Map<string, date>>(new Map());
  const hasSpoken = useCallback((tileId: string) => speakingHistory.has(tileId), [speakingHistory]);
  const getTimeLastSpoken = useCallback((tileId: string) => speakingHistory.get(tileId) ?? 0, [speakingHistory]);
  const addToHistory = useCallback(
    (tileId: string) => {
      if (!hasSpoken(tileId)) setSpeakingHistory((oldHistory) => new Map(oldHistory).set(tileId, Date.now()));
    },
    [hasSpoken, setSpeakingHistory]
  );

  const sortRemoteTiles = (remoteTiles: PeerTileConfig[]) => {
    const { speaking, rest } = groupBy(({ mediaPlayerId, isSpeaking }: PeerTileConfig) =>
      hasSpoken(mediaPlayerId) || isSpeaking ? "speaking" : "rest"
    )(remoteTiles);
    const newSpeakingTiles = (speaking ?? []).filter(({ mediaPlayerId }) => !hasSpoken(mediaPlayerId));
    newSpeakingTiles.map(({ mediaPlayerId }) => mediaPlayerId).forEach(addToHistory);
    const sortedByDate = (speaking ?? []).sort((a, b) =>
      getTimeLastSpoken(a.mediaPlayerId) < getTimeLastSpoken(b.mediaPlayerId) ? 1 : -1
    );
    const tilesSortedByLastSpoken = [...newSpeakingTiles, ...sortedByDate];

    const restSortedByAlphabet = (rest ?? []).sort((a, b) => a.displayName.localeCompare(b.displayName));
    return { tilesSortedByLastSpoken, restSortedByAlphabet };
  };

  const { localTiles, remoteTiles, screenshareTiles } = groupBy(({ typeName }: MediaPlayerTileConfig) =>
    typeName === "local" ? "localTiles" : typeName === "remote" ? "remoteTiles" : "screenshareTiles"
  )(videoTiles);
  const { tilesSortedByLastSpoken, restSortedByAlphabet } = sortRemoteTiles(
    (remoteTiles ?? []).filter(isPeerTileConfig)
  );
  return [...localTiles, ...(screenshareTiles ?? []), ...tilesSortedByLastSpoken, ...restSortedByAlphabet];
};

export default useSortBySpeaking;
