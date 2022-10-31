import { useEffect, useState } from "react";
import { MembraneWebRTC, Peer, SerializedMediaEvent, TrackContext } from "@membraneframework/membrane-webrtc-js";
import { Socket } from "phoenix";
import { TrackMetadata, PeerMetadata, PeersApi } from "./usePeerState";
import { isTrackEncoding, isTrackType } from "../../types";
import { SetErrorMessage } from "../RoomPage";

const parseMetadata = (context: TrackContext) => {
  const type = context.metadata.type;
  return isTrackType(type) ? { type } : {};
};

type UseSetupResult = {
  webrtc?: MembraneWebRTC;
};

// todo extract callbacks
export function useMembraneClient(
  roomId: string,
  peerMetadata: PeerMetadata,
  isSimulcastOn: boolean,
  api: PeersApi,
  setErrorMessage: SetErrorMessage
): UseSetupResult {
  const [webrtc, setWebrtc] = useState<MembraneWebRTC | undefined>();

  useEffect(() => {
    const socket = new Socket("/socket");
    socket.connect();
    const socketOnCloseRef = socket.onClose(() => cleanUp());
    const socketOnErrorRef = socket.onError(() => cleanUp());

    const webrtcChannel = socket.channel(`room:${roomId}`, {
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
          webrtcChannel.push("mediaEvent", { data: mediaEvent });
        },
        onConnectionError: (message) => {
          setErrorMessage("Something went wrong :(");
        },
        // todo [Peer] -> Peer[] ???
        onJoinSuccess: (peerId, peersInRoom: Peer[]) => {
          api.setLocalPeer(peerId, peerMetadata);
          api.addPeers(
            peersInRoom.map((peer) => ({
              id: peer.id,
              displayName: peer.metadata.displayName,
              emoji: peer.metadata.emoji,
              source: "remote",
            }))
          );
        },
        onTrackReady: (ctx) => {
          if (!ctx?.peer || !ctx?.track || !ctx?.stream) return;
          const metadata: TrackMetadata = parseMetadata(ctx);
          api.addTrack(ctx.peer.id, ctx.trackId, ctx.track, ctx.stream, metadata);
        },
        onTrackAdded: (ctx) => {
          // todo this event is triggered multiple times even though onTrackRemoved was invoked
          const metadata: TrackMetadata = parseMetadata(ctx);
        },
        onTrackRemoved: (ctx) => {
          const peerId = ctx?.peer?.id;
          if (!peerId) return;
          api.removeTrack(peerId, ctx.trackId);
        },
        onPeerJoined: (peer) => {
          api.addPeers([
            {
              id: peer.id,
              displayName: peer.metadata.displayName,
              emoji: peer.metadata.emoji,
              source: "remote",
            },
          ]);
        },
        onPeerLeft: (peer) => {
          api.removePeer(peer.id);
        },
        onTrackEncodingChanged: (peerId: string, trackId: string, encoding: string) => {
          if (!isTrackEncoding(encoding)) return;
          api.setEncoding(peerId, trackId, encoding);
        },
      },
    });

    webrtcChannel.on("mediaEvent", (event) => {
      webrtc.receiveMediaEvent(event.data);
    });

    webrtcChannel.on("simulcastConfig", (event) => {
      // empty
    });

    webrtcChannel
      .join()
      .receive("ok", (response: any) => {
        webrtc.join(peerMetadata);
        setWebrtc(webrtc);
      })
      .receive("error", (response) => {});

    const cleanUp = () => {
      webrtc.leave();
      webrtcChannel.leave();
      socket.off([socketOnCloseRef, socketOnErrorRef]);
    };

    return () => {
      cleanUp();
    };
  }, [roomId]);

  return { webrtc };
}
