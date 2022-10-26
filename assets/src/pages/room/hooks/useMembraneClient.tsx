import { useEffect, useState } from "react";
import {
  MembraneWebRTC,
  Peer,
  SerializedMediaEvent,
  TrackContext,
  TrackEncoding,
} from "@membraneframework/membrane-webrtc-js";
import { Socket } from "phoenix";
import { Metadata, PeersApi, TrackType } from "./usePeerState";
import { getRandomAnimalEmoji } from "../utils";

const parseMetadata = (context: TrackContext) => {
  const type = context.metadata.type;
  // todo refactor
  const types: TrackType[] = ["camera", "screensharing", "audio"];
  return {
    type: types.includes(type) ? type : undefined,
  };
};

type UseSetupResult = {
  webrtc?: MembraneWebRTC;
  currentUser: CurrentUser | null;
  selectRemoteTrackEncoding: (peerId: string, trackId: string, encoding: TrackEncoding) => void;
  disableTrackEncoding: (trackId: string, encoding: TrackEncoding) => void;
  enableTrackEncoding: (trackId: string, encoding: TrackEncoding) => void;
};

export type CurrentUser = {
  id: string;
  displayName: string;
  emoji: string;
};

// todo fix now - fix types e.g. setErrorMessage
export function useMembraneClient(
  roomId: string,
  displayName: string,
  isSimulcastOn: boolean,
  api: PeersApi,
  setErrorMessage: (value: ((prevState: string | undefined) => string | undefined) | string | undefined) => void
): UseSetupResult {
  const [webrtc, setWebrtc] = useState<MembraneWebRTC | undefined>();
  const [currentUser, setCurrentUser] = useState<CurrentUser | null>(null);

  useEffect(() => {
    // console.log("Starting....");

    const socket = new Socket("/socket");
    socket.connect();
    const socketOnCloseRef = socket.onClose(() => cleanUp());
    const socketOnErrorRef = socket.onError(() => cleanUp());

    // emoji is used as an example of additional metadata
    const emoji = getRandomAnimalEmoji();

    const webrtcChannel = socket.channel(`room:${roomId}`, {
      // TODO fix later
      isSimulcastOn: isSimulcastOn,
    });

    webrtcChannel.onError(() => {
      // TODO fix later
    });
    webrtcChannel.onClose(() => {
      // TODO fix later
    });

    const webrtc = new MembraneWebRTC({
      callbacks: {
        onSendMediaEvent: (mediaEvent: SerializedMediaEvent) => {
          // console.log({ name: "onSendMediaEvent", mediaEvent: JSON.parse(mediaEvent) });
          webrtcChannel.push("mediaEvent", { data: mediaEvent });
        },
        onConnectionError: (message: string) => {
          // console.log({ name: "onConnectionError", message });
          setErrorMessage("Something went wrong :(");
        },
        // todo [Peer] -> Peer[] ???
        onJoinSuccess: (peerId, peersInRoom: Peer[]) => {
          // console.log({ name: "onJoinSuccess", peerId, peersInRoom });
          setCurrentUser({ id: peerId, displayName: displayName, emoji: emoji });
          api.addPeers(
            peersInRoom.map((peer) => ({
              id: peer.id,
              displayName: peer.metadata.displayName,
              emoji: peer.metadata.emoji,
              source: "remote",
            }))
          );
        },
        onJoinError: (metadata) => {
          // console.log({ name: "onJoinError", metadata });
        },
        onTrackReady: (ctx) => {
          // console.log({ name: "onTrackReady", ctx });
          if (!ctx?.peer || !ctx?.track || !ctx?.stream) return;
          const metadata: Metadata = parseMetadata(ctx);
          api.addTrack(ctx.peer.id, ctx.trackId, ctx.track, ctx.stream, metadata);
        },
        onTrackAdded: (ctx) => {
          // todo this event is triggered multiple times even though onTrackRemoved was invoked
          // console.log({ name: "onTrackAdded", ctx });
          const metadata: Metadata = parseMetadata(ctx);
        },
        onTrackRemoved: (ctx) => {
          // console.log({ name: "onTrackRemoved", ctx });
          const peerId = ctx?.peer?.id;
          if (!peerId) return;
          api.removeTrack(peerId, ctx.trackId);
        },
        onTrackUpdated: (ctx) => {
          // console.log({ name: "onTrackUpdated", ctx });
        },
        onPeerJoined: (peer) => {
          // console.log({ name: "onPeerJoined", peer });
          api.addPeers([{ id: peer.id, displayName: peer.metadata.displayName, emoji: peer.metadata.emoji, source: "remote"}]);
        },
        onPeerLeft: (peer) => {
          // console.log({ name: "onPeerLeft", peer });
          api.removePeer(peer.id);
        },
        onPeerUpdated: (peer) => {
          // console.log({ name: "onPeerUpdated", peer });
        },
        onTrackEncodingChanged: (peerId: string, trackId: string, encoding: string) => {
          // console.log({ name: "onTrackEncodingChanged", peerId, trackId, encoding });
          // todo encoding as enum
          api.setEncoding(peerId, trackId, encoding as TrackEncoding);
        },
      },
    });

    webrtcChannel.on("mediaEvent", (event: any) => {
      webrtc.receiveMediaEvent(event.data);
    });

    webrtcChannel.on("simulcastConfig", (event) => {
      // console.log({ name: "simulcastConfig", event });
    });

    webrtcChannel
      .join()
      .receive("ok", (response: any) => {
        setWebrtc(webrtc);

        webrtc.join({ displayName: displayName, emoji: emoji });
      })
      .receive("error", (response: any) => {});

    const cleanUp = () => {
      // console.log("Cleaning up started");
      webrtc.leave();
      webrtcChannel.leave();
      socket.off([socketOnCloseRef, socketOnErrorRef]);
      // console.log("Cleaning up ended");
    };

    return () => {
      cleanUp();
    };
  }, [roomId]);

  const selectRemoteTrackEncoding = (peerId: string, trackId: string, encoding: TrackEncoding) => {
    // console.log({ name: "changeRemoteEncoding", peerId, trackId, encoding });
    if (!webrtc) return;
    webrtc.selectTrackEncoding(peerId, trackId, encoding);
  };

  const enableTrackEncoding = (trackId: string, encoding: TrackEncoding) => {
    // console.log({ name: "enableTrackEncoding", encoding });
    if (!trackId || !webrtc) return;
    // console.log({ encoding });
    webrtc.enableTrackEncoding(trackId, encoding);
  };

  const disableTrackEncoding = (trackId: string, encoding: TrackEncoding) => {
    // console.log({ name: "enableTrackEncoding", encoding });
    if (!trackId || !webrtc) return;
    console.log({ encoding });
    webrtc.disableTrackEncoding(trackId, encoding);
  };

  return {
    webrtc,
    currentUser,
    selectRemoteTrackEncoding,
    enableTrackEncoding,
    disableTrackEncoding,
  };
}
