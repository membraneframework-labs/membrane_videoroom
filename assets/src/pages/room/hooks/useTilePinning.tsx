import { useCallback, useEffect, useMemo, useReducer, useState } from "react";
import { MediaPlayerTileConfig, StreamSource } from "../../types";
import { groupBy } from "../utils";
import { toLocalTrackSelector, TrackType, useJellyfishClient, useSelector } from "../../../jellifish.types";
import useEffectOnChange from "../../../features/shared/hooks/useEffectOnChange";
import { MessageEvents } from "../../../jellyfishClient/JellyfishClient";
import { Track, TrackMetadata } from "./usePeerState";
import { parseTrackMetadata } from "./useMembraneClient";
import { tr } from "date-fns/locale";
import { LOCAL_SCREEN_SHARING_ID, LOCAL_VIDEO_ID } from "../consts";

type PinningFlags = {
  blockPinning: boolean;
  isAnyPinned: boolean;
  isAnyUnpinned: boolean;
};

type TilePinningApi = {
  // pinnedTiles: MediaPlayerTileConfig[];
  pinnedTilesIds: string[];
  unpinnedTilesIds: string[];
  // unpinnedTiles: MediaPlayerTileConfig[];
  pinTile: (tileId: string) => void;
  unpinTile: (tileId: string) => void;
  pinningFlags: PinningFlags;
};

const INITIAL_STATE: PinState = {
  pinnedTilesIds: [],
  unpinnedTilesIds: [],
  autoPinned: [],
  autoUnpinned: [],
  autoPictureInPicture: [],
  pinnedTileIdHistory: new Set<string>(),
  localCameraTrackId: null,
  localScreenShareTrackId: null,
};

type VideoTrackType = Exclude<TrackType, "audio">;

type Action =
  | { type: "pin"; tileId: string }
  | { type: "unpin"; tileId: string }
  | {
      type: "pinIfNotAlreadyPinned";
      tileId: string;
    }
  | {
      type: "remoteTrackAdded";
      trackType: VideoTrackType;
      tileId: string;
    }
  | {
      type: "remoteTrackRemoved";
      tileId: string;
    }
  | {
      type: "localTrackAdded";
      trackType: VideoTrackType;
      tileId: string;
    }
  | {
      type: "localTrackRemoved";
      trackType: VideoTrackType;
      tileId: string;
    };

const pin = (state: PinState, tileId: string): PinState => {
  console.log({ name: "pin" });

  return !state.pinnedTilesIds.includes(tileId)
    ? {
        ...state,
        pinnedTilesIds: [...state.pinnedTilesIds, tileId],
        // todo remove
        pinnedTileIdHistory: new Set(state.pinnedTileIdHistory).add(tileId),
        unpinnedTilesIds: state.unpinnedTilesIds.filter((unpinned) => unpinned !== tileId),
        autoPinned: state.autoPinned.filter((unpinned) => unpinned !== tileId),
        autoUnpinned: state.autoUnpinned.filter((unpinned) => unpinned !== tileId),
      }
    : state;
};

const autoPin = (state: PinState, tileId: string): PinState => {
  console.log({ name: "autopin" });

  return !state.autoPinned.includes(tileId)
    ? {
        ...state,
        autoPinned: [...state.autoPinned, tileId],
      }
    : state;
};

const autoUnpin = (state: PinState, tileId: string): PinState => {
  console.log({ name: "autoUnpin" });

  return !state.autoUnpinned.includes(tileId)
    ? {
        ...state,
        autoUnpinned: [...state.autoUnpinned, tileId],
      }
    : state;
};

const unpin = (state: PinState, tileId: string): PinState => {
  console.log({ name: "unpin" });

  if (state.unpinnedTilesIds.includes(tileId)) return state;

  return {
    ...state,
    unpinnedTilesIds: [...state.unpinnedTilesIds, tileId],
    pinnedTilesIds: state.pinnedTilesIds.filter((pinnedTileId) => pinnedTileId !== tileId),
    autoPinned: state.autoPinned.filter((pinnedTileId) => pinnedTileId !== tileId),
    autoUnpinned: state.autoUnpinned.filter((pinnedTileId) => pinnedTileId !== tileId),
  };
};

const remove = (state: PinState, tileId: string): PinState => {
  console.log({ name: "remove" });

  return {
    ...state,
    unpinnedTilesIds: state.unpinnedTilesIds.filter((currentTileId) => currentTileId !== tileId),
    pinnedTilesIds: state.pinnedTilesIds.filter((currentTileId) => currentTileId !== tileId),
    autoPinned: state.autoPinned.filter((currentTileId) => currentTileId !== tileId),
    autoUnpinned: state.autoUnpinned.filter((currentTileId) => currentTileId !== tileId),
  };
};

const reversePinning = (state: PinState, tileId: string) => {
  console.log({ name: "reversePinning" });

  const newVar = {
    ...state,
    unpinnedTilesIds: state.pinnedTilesIds,
    pinnedTilesIds: state.unpinnedTilesIds,
    autoUnpinned: state.autoPinned,
    autoPinned: state.autoUnpinned,
    // pinnedTileIdHistory: new Set(state.pinnedTileIdHistory).add(tileId),
  };

  console.log({ state, newVar });
  return newVar;
};

/*        | vid1         | vid2         |
 * status | autounpinned | autounpinned |
 * status | pinned       | autounpinned |
 * status | unpinned     | autounpinned |
 * status | autounpinned |
 * // to samo r
 */

const reducerWrapper = (state: PinState, action: Action): PinState => {
  // const { tileId, type } = action;

  const allTiles = [
    ...state.autoPictureInPicture,
    ...state.autoPinned,
    ...state.pinnedTilesIds,
    ...state.autoUnpinned,
    ...state.unpinnedTilesIds,
  ];

  if (action.type === "pin" && allTiles.length === 2) {
    console.log("%cHandle manual pin", "color: red");
    const ramaining = allTiles.filter((tileId) => tileId !== action.tileId);

    return {
      ...state,
      autoPictureInPicture: [],
      unpinnedTilesIds: [],
      pinnedTilesIds: [action.tileId],
      autoUnpinned: ramaining,
      autoPinned: [],
    };
  }

  if (action.type === "unpin" && allTiles.length === 2) {
    console.log("%cHandle manual unpin", "color: red");
    const ramaining = allTiles.filter((tileId) => tileId !== action.tileId);

    return {
      ...state,
      autoPictureInPicture: [],
      unpinnedTilesIds: [action.tileId],
      pinnedTilesIds: [],
      autoUnpinned: [],
      autoPinned: ramaining,
    };
  }

  // gdy dochodzi nowy track
  if (action.type === "remoteTrackAdded" && allTiles.length === 1) {
    console.log("%cHandle remoteTrackAdded", "color: red");
    const oldPIP = allTiles[0];

    return {
      ...state,
      autoPictureInPicture: [action.tileId],
      unpinnedTilesIds: [],
      pinnedTilesIds: [],
      autoUnpinned: [oldPIP],
      autoPinned: [],
    };
  }

  // gdy znika track
  if (action.type === "remoteTrackRemoved" && allTiles.length === 3 && allTiles.includes(action.tileId)) {
    console.log("%cHandle remoteTrackRemoved", "color: red");
    const pinned = [...state.pinnedTilesIds, ...state.autoPinned, ...state.autoPictureInPicture].filter(
      (tileId) => tileId !== action.tileId
    );

    if (pinned.length > 0) {
      console.log("%Some pinned remoteTrackRemoved", "color: red");

      return {
        ...state,
        autoPictureInPicture: [pinned[0]],
        unpinnedTilesIds: [],
        pinnedTilesIds: [],
        autoUnpinned: allTiles.filter((tileId) => !pinned.includes(tileId)),
        autoPinned: [],
      };
    }

    const removed = allTiles.filter((tileId) => tileId !== action.tileId);

    console.log("%Some unpinned remoteTrackRemoved", "color: red");

    console.log({ state, allTiles });
    return {
      ...state,
      autoPictureInPicture: [removed[1]],
      unpinnedTilesIds: [],
      pinnedTilesIds: [],
      autoUnpinned: [removed[0]],
      autoPinned: [],
    };
  }

  // jeżeli 2 kafelki są autounpinned to ostatni będzie PIP
  // jeżeli jeden jest pip a drugi pinned lub unpinned
  const pipState =
    state.autoPictureInPicture.length === 1
      ? {
          ...state,
          autoUnpinned: [...state.autoUnpinned, state.autoPictureInPicture[0]],
          autoPictureInPicture: [],
        }
      : state;

  const newState = reducer(pipState, action);

  const allNewTiles = [
    ...newState.autoPinned,
    ...newState.autoUnpinned,
    ...newState.pinnedTilesIds,
    ...newState.unpinnedTilesIds,
    ...newState.autoPictureInPicture,
  ];

  console.log({ name: "PIP", action, state, allNewTiles, newState, pipState });
  if (allNewTiles.length === 2) {
    // if (newState.autoUnpinned.length === 2) {
    //   const poprawione = {
    //     ...newState,
    //     autoPictureInPicture: [newState.autoUnpinned[1]],
    //     autoUnpinned: [newState.autoUnpinned[0]],
    //   };
    //   console.log({ poprawione });
    //   return poprawione;
    // }
    //
    // if (newState.pinnedTilesIds.length === 2) {
    //   const poprawione3 = {
    //     ...newState,
    //     unpinnedTilesIds: [newState.pinnedTilesIds[0]],
    //     pinnedTilesIds: [newState.pinnedTilesIds[1]],
    //   };
    //   console.log({ poprawione3 });
    //   return poprawione3;
    // }
    // if (newState.unpinnedTilesIds.length === 1 && newState.autoUnpinned.length === 1) {
    //   const poprawione4 = {
    //     ...newState,
    //     autoUnpinned: [],
    //     autoPictureInPicture: newState.autoUnpinned,
    //     unpinnedTilesIds: newState.unpinnedTilesIds,
    //   };
    //   console.log({ poprawione4 });
    //   return poprawione4;
    // }
    // // jeden z nich to nasza lokalny i on ma zostać
    // if (newState.unpinnedTilesIds.length === 2) {
    //   const notLocal = newState.unpinnedTilesIds.filter(
    //     (tileId) => !(tileId === LOCAL_VIDEO_ID || tileId === LOCAL_SCREEN_SHARING_ID)
    //   )[0];
    //   const local = newState.unpinnedTilesIds.filter(
    //     (tileId) => tileId === LOCAL_VIDEO_ID || tileId === LOCAL_SCREEN_SHARING_ID
    //   )[0];
    //   const poprawione2: PinState = {
    //     ...newState,
    //     autoPictureInPicture: [notLocal],
    //     autoUnpinned: [local],
    //     autoPinned: [],
    //     pinnedTilesIds: [],
    //     unpinnedTilesIds: [],
    //   };
    //   console.log({ poprawione2 });
    //   return poprawione2;
    // }
    // // if (action.type === "pin" || action.type === "unpin" || state.autoPictureInPicture.length === 1) {
    // //   // trzeba odwrocic PIP
    // //   const oldPIP = state.autoPictureInPicture[0];
    // //   const notPip = allNewTiles.filter((tile) => tile !== oldPIP)[0];
    // //
    // //   return { ...newState, autoPictureInPicture: [notPip] };
    // // }
  }
  //
  // console.log("Remove PIP if exists");
  return { ...newState, autoPictureInPicture: [] };
};
const reducer = (state: PinState, action: Action): PinState => {
  const { tileId, type } = action;
  const allTiles = [...state.pinnedTilesIds, ...state.autoPinned, ...state.unpinnedTilesIds, ...state.autoUnpinned];
  console.log({ name: "reducer", allTiles, action, state });

  if (type === "pin") {
    // if (allTiles.length === 2 && allTiles.includes(tileId)) {
    //   return reversePinning(state, tileId);
    // } else {
    return pin(state, tileId);
    // }
  } else if (type === "unpin") {
    // if (state.autoUnpinned.length + === 2 && allTiles.includes(tileId)) {
    //   return reversePinning(state, tileId);
    // } else {
    return unpin(state, tileId);
    // }
  } else if (type === "pinIfNotAlreadyPinned" && !state.pinnedTileIdHistory.has(tileId)) {
    return pin(state, tileId);
  } else if (type === "remoteTrackAdded") {
    if (action.trackType === "screensharing") {
      return autoPin(state, tileId);
    } else {
      // if (allTiles.length === 1) {
      //   return { ...autoPin(state, tileId), localCameraTrackId: tileId };
      // }
      return autoUnpin(state, tileId);
    }
  } else if (type === "remoteTrackRemoved") {
    return remove(state, tileId);
  } else if (type === "localTrackAdded") {
    if (action.trackType === "camera") {
      return { ...autoUnpin(state, tileId), localCameraTrackId: tileId };
    } else {
      return { ...autoPin(state, tileId), localScreenShareTrackId: tileId };
    }
  } else if (type === "localTrackRemoved") {
    if (action.trackType === "camera") {
      return { ...remove(state, tileId), localCameraTrackId: null };
    } else {
      return { ...remove(state, tileId), localScreenShareTrackId: null };
    }
  }

  return INITIAL_STATE;
};

export type PinState = {
  pinnedTilesIds: string[];
  unpinnedTilesIds: string[];
  autoPinned: string[];
  autoUnpinned: string[];
  autoPictureInPicture: string[];
  pinnedTileIdHistory: Set<string>;
  localCameraTrackId: string | null;
  localScreenShareTrackId: string | null;
};

const useTilePinning = (): TilePinningApi => {
  const [state, dispatch] = useReducer(reducerWrapper, INITIAL_STATE);
  const client = useJellyfishClient();

  useEffect(() => {
    console.log({ pinState: state });
  }, [state]);

  const video = useSelector((state) => toLocalTrackSelector(state, "camera"));
  const screenSharing = useSelector((state) => toLocalTrackSelector(state, "screensharing"));

  // todo add screensharing
  useEffectOnChange(video?.stream, (prev, current) => {
    if (!prev && current) {
      console.log("Local video track started");
      dispatch({ type: "localTrackAdded", trackType: "camera", tileId: LOCAL_VIDEO_ID });
    } else if (prev && !current) {
      console.log("Local video track stopped");
      dispatch({ type: "localTrackRemoved", trackType: "camera", tileId: LOCAL_VIDEO_ID });
    }
  });

  useEffectOnChange(screenSharing?.stream, (prev, current) => {
    console.log({ prev, current });

    if (!prev && current) {
      console.log("Local screenSharing track started");
      dispatch({ type: "localTrackAdded", trackType: "screensharing", tileId: LOCAL_SCREEN_SHARING_ID });
    } else if (prev && !current) {
      console.log("Local screenSharing track stopped");
      dispatch({ type: "localTrackRemoved", trackType: "screensharing", tileId: LOCAL_SCREEN_SHARING_ID });
    }
  });

  useEffect(() => {
    if (!client) return;

    const onTrackReady: MessageEvents["onTrackReady"] = (ctx) => {
      const trackType: TrackType | null = parseTrackMetadata(ctx)?.type || null;
      if (trackType === "camera" || trackType === "screensharing") {
        console.log("New camera track added!");
        dispatch({ type: "remoteTrackAdded", trackType, tileId: ctx.trackId });
      }
    };

    const onTrackRemoved: MessageEvents["onTrackRemoved"] = (ctx) => {
      const trackType: TrackType | null = parseTrackMetadata(ctx)?.type || null;
      if (trackType === "camera" || trackType === "screensharing") {
        console.log("New camera track removed!");
        dispatch({ type: "remoteTrackRemoved", tileId: ctx.trackId });
      }
    };

    client.on("onTrackReady", onTrackReady);
    client.on("onTrackRemoved", onTrackRemoved);

    return () => {
      client.off("onTrackReady", onTrackReady);
      client.off("onTrackRemoved", onTrackRemoved);
    };
  }, [client]);

  return useMemo(() => {
    const effectivelyPinned = [...state.autoPinned, ...state.pinnedTilesIds, ...state.autoPictureInPicture];
    const effectivelyUnpinned = [...state.autoUnpinned, ...state.unpinnedTilesIds];

    return {
      pinTile: (tileId) => dispatch({ type: "pin", tileId }),
      unpinTile: (tileId) => dispatch({ type: "unpin", tileId }),
      pinningFlags: {
        blockPinning: effectivelyPinned.length + effectivelyUnpinned.length === 1,
        isAnyPinned: effectivelyPinned.length > 0,
        isAnyUnpinned: effectivelyUnpinned.length > 0,
      },
      pinnedTilesIds: effectivelyPinned,
      unpinnedTilesIds: effectivelyUnpinned,
    };
  }, [state]);
};

export default useTilePinning;
