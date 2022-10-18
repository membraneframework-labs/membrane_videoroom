import { useEffect, useState } from "react";
import { MembraneWebRTC, Peer, SerializedMediaEvent, TrackContext } from "@membraneframework/membrane-webrtc-js";
import { Channel, Socket } from "phoenix";
import { v4 as uuid } from "uuid";
import { Metadata } from "./usePeerState";
import { getRandomAnimalEmoji } from "../utils";

export type CommunicationType = {
  webrtc: MembraneWebRTC;
};

const parseMetadata = (context: TrackContext) => ({
  type:
    context.metadata.type === "camera" || context.metadata.type === "screensharing" ? context.metadata.type : undefined,
});

type UseSetupResult = {
  userId?: string;
  webrtc?: MembraneWebRTC;
};

// todo fix now - fix types e.g. setErrorMessage
export function useMembraneClient(
  roomId: string | undefined,
  addPeers: (peerId: string[]) => void,
  removePeer: (peerId: string) => void,
  addTrack: (
    peerId: string,
    trackId: string,
    mediaStreamTrack?: MediaStreamTrack,
    mediaStream?: MediaStream,
    metadata?: Metadata
  ) => void,
  removeTrack: (peerId: string, trackId: string) => void,
  setErrorMessage: (value: ((prevState: string | undefined) => string | undefined) | string | undefined) => void
): UseSetupResult {
  const [webRtc, setWebRtc] = useState<MembraneWebRTC | undefined>();
  const [userId, setUserId] = useState<string | undefined>();

  useEffect(() => {
    console.log("Starting....");
    if (!roomId) {
      console.log("Room is empty. Skipping");
      return;
    }
    const socket = new Socket("/socket"); // phoenix socket
    socket.connect();
    const socketOnCloseRef = socket.onClose(() => cleanUp());
    const socketOnErrorRef = socket.onError(() => cleanUp());

    // TODO fix now
    const displayName = "User 1" + uuid();
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
          addPeers(peersInRoom.map((peer) => peer.id));
          setUserId(peerId);
        },
        onJoinError: (metadata) => {
          console.log({ name: "onJoinError", metadata });
        },
        onTrackReady: (ctx) => {
          console.log({ name: "onTrackReady", ctx });
          const metadata: Metadata = parseMetadata(ctx);
          // todo handle !!
          addTrack(ctx.peer.id!!, ctx.trackId, ctx.track!!, ctx.stream!!, metadata);
        },
        onTrackAdded: (ctx) => {
          // todo this event is triggered multiple times even though onTrackRemoved was invoked
          console.log({ name: "onTrackAdded", ctx });
          const metadata: Metadata = parseMetadata(ctx);
        },
        onTrackRemoved: (ctx) => {
          console.log({ name: "onTrackRemoved", ctx });
          // todo ctx.track.id sometimes is null
          removeTrack(ctx.peer.id!!, ctx.trackId);
        },
        onTrackUpdated: (ctx) => {
          console.log({ name: "onTrackUpdated", ctx });
        },
        onPeerJoined: (peer) => {
          console.log({ name: "onPeerJoined", peer });
          addPeers([peer.id]);
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
        },
      },
    });

    webrtcChannel.on("mediaEvent", (event: any) => {
      webrtc.receiveMediaEvent(event.data);
    });

    webrtcChannel
      .join()
      .receive("ok", (response: any) => {
        setWebRtc(webrtc);

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

  return { userId, webrtc: webRtc };
}
