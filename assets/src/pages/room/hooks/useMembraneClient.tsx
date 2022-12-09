import { useEffect, useState } from "react";
import { MembraneWebRTC, Peer, SerializedMediaEvent, TrackContext } from "@membraneframework/membrane-webrtc-js";
import { Socket } from "phoenix";
import { TrackMetadata, PeerMetadata, PeersApi } from "./usePeerState";
import { isTrackEncoding, isTrackType } from "../../types";
import { SetErrorMessage } from "../RoomPage";

const parseMetadata = (context: TrackContext) => {
  const type = context.metadata.type;
  const active = context.metadata.active;
  return isTrackType(type) ? { type, active } : { active };
};

type UseSetupResult = {
  webrtc?: MembraneWebRTC;
};

// todo extract callbacks
export const useMembraneClient = (
  roomId: string,
  peerMetadata: PeerMetadata,
  isSimulcastOn: boolean,
  api: PeersApi,
  setErrorMessage: SetErrorMessage
): UseSetupResult => {
  const [webrtc, setWebrtc] = useState<MembraneWebRTC | undefined>();

  useEffect(() => {
    const socket = new Socket("/socket");
    socket.connect();
    const socketOnCloseRef = socket.onClose(() => cleanUp());
    const socketOnErrorRef = socket.onError(() => cleanUp());

    const webrtcChannel = socket.channel(`room:${roomId}`, {
      isSimulcastOn: isSimulcastOn,
    });

    webrtcChannel.onError((reason) => {
      console.error("WebrtcChannel error occurred");
      console.error(reason);
      setErrorMessage("WebrtcChannel error occurred");
    });
    webrtcChannel.onClose(() => {
      return;
    });

    const webrtc = new MembraneWebRTC({
      callbacks: {
        onSendMediaEvent: (mediaEvent: SerializedMediaEvent) => {
          webrtcChannel.push("mediaEvent", { data: mediaEvent });
        },
        onConnectionError: (message) => {
          console.error("onConnectionError occurred");
          console.error(message);
          setErrorMessage(message);
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
        onTrackUpdated: (ctx: TrackContext) => {
          api.setMetadata(ctx.peer.id, ctx.trackId, ctx.metadata);
        },
        onVoiceActivityChanged: (peerId: string, trackId: string, vadStatus: "speech" | "silence") => {
          api.setVadStatus(peerId, trackId, vadStatus);
        }
      },
    });

    webrtcChannel.on("mediaEvent", (event) => {
      webrtc.receiveMediaEvent(event.data);
    });

    webrtcChannel.on("simulcastConfig", () => {
      return;
    });

    webrtcChannel
      .join()
      .receive("ok", () => {
        webrtc.join(peerMetadata);
        setWebrtc(webrtc);
      })
      .receive("error", (response) => {
        setErrorMessage("Connecting error");
        console.error("Received error status");
        console.error(response);
      });

    const cleanUp = () => {
      // todo add clean method to remove everything from state
      webrtc.leave();
      webrtcChannel.leave();
      socket.off([socketOnCloseRef, socketOnErrorRef]);
    };

    return () => {
      cleanUp();
    };
  }, [api, isSimulcastOn, peerMetadata, roomId, setErrorMessage]);

  return { webrtc };
};
