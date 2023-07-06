import { useState, useEffect } from "react";
import { MediaPlayerTileConfig, isPeerTileConfig } from "../../types";

export function useSortedUnpinnedTiles(
  maxTiles: number,
  tileConfigs: MediaPlayerTileConfig[]
): {
  visibleTiles: MediaPlayerTileConfig[];
  overflownTiles: MediaPlayerTileConfig[];
} {
  const [visibleTiles, setVisibleTiles] = useState<MediaPlayerTileConfig[]>([]);
  const [overflownTiles, setOverflownTiles] = useState<MediaPlayerTileConfig[]>([]);
  const [cache, setCache] = useState<LruCache>();

  useEffect(() => {
    setCache(new LruCache(maxTiles));
  }, [maxTiles]);

  useEffect(() => {
    if (!cache) return;
    const [newVisibleTiles, newOverflownTiles] = cache.recalculate(tileConfigs);
    setVisibleTiles(newVisibleTiles);
    setOverflownTiles(newOverflownTiles);
  }, [cache, tileConfigs]);

  return { visibleTiles, overflownTiles };
}

interface Priority {
  local: boolean;
  screenShare: boolean;
  lastUpdatedAt: number;
}

interface CacheItem {
  config: MediaPlayerTileConfig;
  priority: Priority;
}

class LruCache {
  #originalSize: number;
  #size: number;
  #array: CacheItem[] = [];
  #oldPriorities: Record<string, Priority> = {};

  constructor(size: number) {
    this.#size = this.#originalSize = size;
  }

  recalculate(newArray: MediaPlayerTileConfig[]): [MediaPlayerTileConfig[], MediaPlayerTileConfig[]] {
    this.#size = newArray.length > this.#size ? this.#originalSize - 1 : this.#originalSize;
    const rest: MediaPlayerTileConfig[] = [];

    this.evictRemovedEntries(newArray);
    this.updateExistingEntries(newArray);

    this.#array = this.#array.slice(0, this.#size);

    for (const config of newArray) {
      if (this.#array.find(({ config: { mediaPlayerId } }) => mediaPlayerId === config.mediaPlayerId)) continue;
      if (rest.find(({ mediaPlayerId }) => mediaPlayerId === config.mediaPlayerId)) continue;

      const addResult = this.add(config);
      if (addResult !== undefined) {
        this.#oldPriorities[addResult.config.mediaPlayerId] = addResult.priority;
        rest.push(addResult.config);
      }
    }

    return [this.getConfigs(), rest];
  }

  /** Function that tries to insert a new tile
   * @param config New tile
   * @returns The tile with the lowest priority that was evicted.
   *  Can be the same as the config parameter, if we were not able to find a place for it.
   *  Can be undefined if no tile was evicted.
   */
  private add(config: MediaPlayerTileConfig): CacheItem | undefined {
    const oldPriority = this.#oldPriorities[config.mediaPlayerId];
    const newItem = {
      config,
      priority:
        oldPriority !== undefined
          ? {
              ...oldPriority,
              ...(isPeerTileConfig(config) && config.isSpeaking && { lastSpokenAt: Date.now() }),
            }
          : {
              local: config.typeName === "local",
              screenShare: !isPeerTileConfig(config),
              lastUpdatedAt: isPeerTileConfig(config) ? (config.isSpeaking ? Date.now() : 0) : Date.now(),
            },
    };

    if (this.#array.length < this.#size) {
      if (!isPeerTileConfig(newItem.config)) {
        let i = 0;
        for (i = 0; i < this.#array.length; i++) {
          if (this.#array[i].config.typeName === "remote") {
            this.#array.splice(i, 0, newItem);
            return;
          }
        }
        this.#array.splice(i, 0, newItem);
      } else {
        this.#array.push(newItem);
      }
      return;
    }

    const minIndex = this.getLeastImportantIndex();

    if (config.typeName === "screenShare") {
      if (this.#array[minIndex].config.typeName === "screenShare") {
        const evicted = this.#array[minIndex];
        this.#array[minIndex] = newItem;
        return evicted;
      } else {
        const evicted = this.#array[minIndex];
        this.#array.splice(minIndex, 1);
        let i;
        for (i = 0; i < this.#array.length; i++) {
          if (this.#array[i].config.typeName === "remote") {
            this.#array.splice(i, 0, newItem);
            return evicted;
          }
        }
        this.#array.splice(i, 0, newItem);
        return evicted;
      }
    }

    if (this.isMoreImportant(newItem, this.#array[minIndex])) {
      const evicted = this.#array[minIndex];
      this.#array[minIndex] = newItem;
      return evicted;
    }

    return newItem;
  }

  private evictRemovedEntries(newArray: MediaPlayerTileConfig[]) {
    const afterEviction = [];
    for (const entry of this.#array) {
      const exists = newArray.find((c) => c.mediaPlayerId === entry.config.mediaPlayerId);
      if (exists) {
        afterEviction.push(entry);
      } else {
        this.#oldPriorities[entry.config.mediaPlayerId] = entry.priority;
      }
    }
    this.#array = afterEviction;
  }

  private updateExistingEntries(newArray: MediaPlayerTileConfig[]) {
    for (const config of newArray) {
      const idx = this.#array.findIndex((c) => c.config.mediaPlayerId === config.mediaPlayerId);
      if (idx >= 0) {
        if (config.typeName !== "screenShare" && config.isSpeaking) {
          this.#array[idx].priority.lastUpdatedAt = Date.now();
        }
      }
    }
  }

  private getLeastImportantIndex(): number {
    let minIndex = 0;
    for (let i = 1; i < this.#array.length; i++) {
      if (this.isMoreImportant(this.#array[minIndex], this.#array[i])) {
        minIndex = i;
      }
    }
    return minIndex;
  }

  private isMoreImportant(item: CacheItem, other: CacheItem) {
    if (item.priority.local) return true;
    if (other.priority.local) return false;
    if (other.priority.screenShare && item.priority.screenShare) {
      return item.priority.lastUpdatedAt > other.priority.lastUpdatedAt;
    }
    if (item.priority.screenShare) return true;
    if (other.priority.screenShare) return false;
    return item.priority.lastUpdatedAt > other.priority.lastUpdatedAt;
  }

  private getConfigs(): MediaPlayerTileConfig[] {
    return this.#array.map(({ config }) => config);
  }
}
