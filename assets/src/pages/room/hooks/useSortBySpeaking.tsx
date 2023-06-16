import { groupBy } from "ramda";
import { MediaPlayerTileConfig } from "../../types";


const useSortBySpeaking = (videoTiles: MediaPlayerTileConfig[]): MediaPlayerTileConfig[] => {
    const {localTiles, unsorted} = groupBy((tile: MediaPlayerTileConfig) => {
        return tile.streamSource === "local" ? "localTiles" : "unsorted";
    })(videoTiles);
    const tail = unsorted !== undefined ? 
        [...unsorted].sort((a, b) => a.displayName.localeCompare(b.displayName)) :
        [];
    return [...localTiles, ...tail];
}


export default useSortBySpeaking;