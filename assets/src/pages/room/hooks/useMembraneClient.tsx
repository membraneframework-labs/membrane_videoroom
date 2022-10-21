import { useEffect, useState } from "react";
import { MembraneWebRTC, Peer, SerializedMediaEvent, TrackContext } from "@membraneframework/membrane-webrtc-js";
import { Socket } from "phoenix";
import { Metadata, NewPeer, TrackType } from "./usePeerState";
import { getRandomAnimalEmoji } from "../utils";
import { SimulcastQuality } from "./useSimulcastRemoteEncoding";

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
};

type CurrentUser = {
  id: string;
  displayName: string;
  emoji: string;
};

// todo fix now - fix types e.g. setErrorMessage
export function useMembraneClient(
  roomId: string,
  displayName: string,
  isSimulcastOn: boolean,
  addPeers: (peer: NewPeer[]) => void,
  removePeer: (peerId: string) => void,
  addTrack: (
    peerId: string,
    trackId: string,
    mediaStreamTrack?: MediaStreamTrack,
    mediaStream?: MediaStream,
    metadata?: Metadata
  ) => void,
  removeTrack: (peerId: string, trackId: string) => void,
  setTrackEncoding: (peerId: string, trackId: string, encoding: SimulcastQuality) => void,
  setErrorMessage: (value: ((prevState: string | undefined) => string | undefined) | string | undefined) => void
): UseSetupResult {
  const [webrtc, setWebrtc] = useState<MembraneWebRTC | undefined>();
  const [currentUser, setCurrentUser] = useState<CurrentUser | null>(null);

  useEffect(() => {
    console.log("Starting....");

    const socket = new Socket("/socket"); // phoenix socket
    socket.connect();
    const socketOnCloseRef = socket.onClose(() => cleanUp());
    const socketOnErrorRef = socket.onError(() => cleanUp());

    // emoji is used as an example of additional metadata
    const emoji = getRandomAnimalEmoji();

    const webrtcChannel = socket.channel(`room:${roomId}`, {
      // TODO fix later
      isSimulcastOn: false,
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
          console.log({ name: "onSendMediaEvent", mediaEvent: JSON.parse(mediaEvent) });
          webrtcChannel.push("mediaEvent", { data: mediaEvent });
        },
        onConnectionError: (message: string) => {
          console.log({ name: "onConnectionError", message });
          setErrorMessage("Something went wrong :(");
        },
        // todo [Peer] -> Peer[] ???
        onJoinSuccess: (peerId, peersInRoom: Peer[]) => {
          console.log({ name: "onJoinSuccess", peerId, peersInRoom });
          setCurrentUser({ id: peerId, displayName: displayName, emoji: emoji });
          addPeers(
            peersInRoom.map((peer) => ({
              id: peer.id,
              displayName: peer.metadata.displayName,
              emoji: peer.metadata.emoji,
            }))
          );
        },
        onJoinError: (metadata) => {
          console.log({ name: "onJoinError", metadata });
        },
        onTrackReady: (ctx) => {
          console.log({ name: "onTrackReady", ctx });
          if (ctx?.peer && ctx?.track && ctx?.stream) {
            const metadata: Metadata = parseMetadata(ctx);
            addTrack(ctx.peer.id, ctx.trackId, ctx.track, ctx.stream, metadata);
          }
          // todo handle !!
        },
        onTrackAdded: (ctx) => {
          // todo this event is triggered multiple times even though onTrackRemoved was invoked
          console.log({ name: "onTrackAdded", ctx });
          const metadata: Metadata = parseMetadata(ctx);
        },
        onTrackRemoved: (ctx) => {
          console.log({ name: "onTrackRemoved", ctx });
          const peerId = ctx?.peer?.id;
          if (peerId) {
            removeTrack(peerId, ctx.trackId);
          }
        },
        onTrackUpdated: (ctx) => {
          console.log({ name: "onTrackUpdated", ctx });
        },
        onPeerJoined: (peer) => {
          console.log({ name: "onPeerJoined", peer });
          addPeers([{ id: peer.id, displayName: peer.metadata.displayName, emoji: peer.metadata.emoji }]);
        },
        onPeerLeft: (peer) => {
          console.log({ name: "onPeerLeft", peer });
          removePeer(peer.id);
        },
        onPeerUpdated: (peer) => {
          console.log({ name: "onPeerUpdated", peer });
        },
        onTrackEncodingChanged: (peerId: string, trackId: string, encoding: string) => {
          console.log({ name: "onTrackEncodingChanged", peerId, trackId, encoding });
          // todo encoding as enum
          setTrackEncoding(peerId, trackId, encoding as SimulcastQuality);
        },
      },
    });

    webrtcChannel.on("mediaEvent", (event: any) => {
      webrtc.receiveMediaEvent(event.data);
    });

    webrtcChannel
      .join()
      .receive("ok", (response: any) => {
        setWebrtc(webrtc);

        webrtc.join({ displayName: displayName, emoji: emoji });
      })
      .receive("error", (response: any) => {});

    const cleanUp = () => {
      console.log("Cleaning up started");
      webrtc.leave();
      webrtcChannel.leave();
      socket.off([socketOnCloseRef, socketOnErrorRef]);
      console.log("Cleaning up ended");
    };

    return () => {
      cleanUp();
    };
  }, [roomId]);

  return { webrtc, currentUser };
}
