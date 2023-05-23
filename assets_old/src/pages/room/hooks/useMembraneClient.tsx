import { useCallback, useEffect, useState } from "react";
import { MembraneWebRTC, Peer, SerializedMediaEvent, TrackContext } from "@jellyfish-dev/membrane-webrtc-js";
import { Socket } from "phoenix";
import { PeerMetadata, PeersApi, TrackMetadata } from "./usePeerState";
import { isTrackEncoding, isTrackType } from "../../types";
import { ErrorMessage } from "../errorMessage";

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
  setErrorMessage: (errorMessage: ErrorMessage) => void
): UseSetupResult => {
  const [webrtc, setWebrtc] = useState<MembraneWebRTC | undefined>();

  const handleError = useCallback(
    (text: string, id?: string) => {
      console.error(text);
      setErrorMessage({ message: text, id: id });
    },
    [setErrorMessage]
  );

  useEffect(() => {
    const socket = new Socket("/socket");
    socket.connect();
    const socketOnCloseRef = socket.onClose(() => cleanUp());
    const socketOnErrorRef = socket.onError(() => {
      handleError(`Socket error occurred.`, "socket-error");
      cleanUp();
    });

    const webrtcChannel = socket.channel(`room:${roomId}`, {
      isSimulcastOn: isSimulcastOn,
    });

    webrtcChannel.onError((reason) => {
      console.error(reason);
      handleError(`Webrtc channel error occurred. Check browser logs for more details.`);
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
          handleError(`Connection error occurred. ${message ?? ""}`);
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
        onTrackReady: (ctx: TrackContext) => {
          if (!ctx?.peer || !ctx?.track || !ctx?.stream) return;
          const metadata: TrackMetadata = parseMetadata(ctx);
          if (ctx && ctx.metadata.type === "audio") {
            ctx.onVoiceActivityChanged = () => {
              api.setIsSpeaking(ctx.peer.id, ctx.trackId, ctx.vadStatus);
            };
          }
          api.addTrack(ctx.peer.id, ctx.trackId, metadata, ctx.track, ctx.stream, ctx.vadStatus);
        },
        onTrackAdded: (ctx: TrackContext) => {
          if (!ctx?.peer) return;
          const metadata: TrackMetadata = parseMetadata(ctx);
          // In onTrackAdded method we know, that peer has just added a new track, but right now, the server is still processing it.
          // We register this empty track (with mediaStreamTrack and mediaStream set to undefined) to show the loading indicator.
          api.addTrack(ctx.peer.id, ctx.trackId, metadata);
        },
        onTrackRemoved: (ctx: TrackContext) => {
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
        onJoinError: (_metadata) => {
          console.error(_metadata);

          handleError(`Failed to join the room`);
        },
      },
    });

    webrtcChannel.on("mediaEvent", (event) => {
      webrtc.receiveMediaEvent(event.data);
    });

    webrtcChannel.on("simulcastConfig", () => {
      return;
    });

    webrtcChannel.on("error", (error) => {
      handleError(`Received error report from the server: ${error.message ?? ""}`);
      cleanUp();
    });

    webrtcChannel
      .join()
      .receive("ok", () => {
        webrtc.join(peerMetadata);
        setWebrtc(webrtc);
      })
      .receive("error", (_response) => {
        console.error(_response);

        handleError(`Couldn't establish signaling connection`);
      });

    const cleanUp = () => {
      webrtc.leave();
      webrtcChannel.leave();
      socket.off([socketOnCloseRef, socketOnErrorRef]);
      setWebrtc(undefined);
    };

    return () => {
      cleanUp();
    };
  }, [api, handleError, isSimulcastOn, peerMetadata, roomId, setErrorMessage]);

  return { webrtc };
};
