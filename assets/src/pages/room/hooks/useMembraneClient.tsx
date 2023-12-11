import { useCallback, useEffect, useState } from "react";
import { Endpoint, SerializedMediaEvent, TrackContext, WebRTCEndpoint } from "@jellyfish-dev/membrane-webrtc-js";
import { Socket } from "phoenix";
import { PeerMetadata, PeersApi, TrackMetadata } from "./usePeerState";
import { isTrackEncoding, isTrackType } from "../../types";
import { ErrorMessage } from "../errorMessage";

const parseMetadata = (context: TrackContext) => {
  const type = context.metadata.type;
  const active = context.metadata.active;
  return isTrackType(type) ? { type, active } : { active };
};

export type UseSetupResult = {
  webrtc?: WebRTCEndpoint;
};

// todo extract callbacks
export const useMembraneClient = (
  roomId: string,
  peerMetadata: PeerMetadata,
  isSimulcastOn: boolean,
  api: PeersApi,
  setErrorMessage: (errorMessage: ErrorMessage) => void
): UseSetupResult => {
  const [webrtc, setWebrtc] = useState<WebRTCEndpoint | undefined>();

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

    const webrtc = new WebRTCEndpoint();

    webrtc.on("sendMediaEvent", (mediaEvent: SerializedMediaEvent) => {
      webrtcChannel.push("mediaEvent", { data: mediaEvent });
    });

    webrtc.on("connectionError", (message: string) => {
      handleError(`Connection error occurred. ${message ?? ""}`);
    });

    webrtc.on("connected", (endpointId: string, otherEndpoints: Endpoint[]) => {
      api.setLocalPeer(endpointId, peerMetadata);
      api.addPeers(
        otherEndpoints.map((endpoint) => ({
          id: endpoint.id,
          displayName: endpoint.metadata.displayName,
          emoji: endpoint.metadata.emoji,
          source: "remote",
        }))
      );
    });

    webrtc.on("trackReady", (ctx: TrackContext) => {
      if (!ctx?.endpoint || !ctx?.track || !ctx?.stream) return;
      const metadata: TrackMetadata = parseMetadata(ctx);
      if (ctx && ctx.metadata.type === "audio") {
        ctx.on("voiceActivityChanged", () => {
          api.setIsSpeaking(ctx.endpoint.id, ctx.trackId, ctx.vadStatus);
        });

        ctx.on("encodingChanged", (newCtx: TrackContext) => {
          if (!isTrackEncoding(newCtx.encoding!)) return;
          api.setEncoding(newCtx.endpoint.id, newCtx.trackId, newCtx.encoding!);
        });
      }
      api.addTrack(ctx.endpoint.id, ctx.trackId, metadata, ctx.track, ctx.stream, ctx.vadStatus);
    });

    webrtc.on("trackAdded", (ctx: TrackContext) => {
      if (!ctx?.endpoint) return;
      const metadata: TrackMetadata = parseMetadata(ctx);
      // In onTrackAdded method we know, that peer has just added a new track, but right now, the server is still processing it.
      // We register this empty track (with mediaStreamTrack and mediaStream set to undefined) to show the loading indicator.
      api.addTrack(ctx.endpoint.id, ctx.trackId, metadata);
    });

    webrtc.on("trackRemoved", (ctx: TrackContext) => {
      const endpointId = ctx?.endpoint?.id;
      if (!endpointId) return;
      api.removeTrack(endpointId, ctx.trackId);
    });

    webrtc.on("endpointAdded", (endpoint: Endpoint) => {
      api.addPeers([
        {
          id: endpoint.id,
          displayName: endpoint.metadata.displayName,
          emoji: endpoint.metadata.emoji,
          source: "remote",
        },
      ]);
    });

    webrtc.on("endpointRemoved", (endpoint: Endpoint) => {
      api.removePeer(endpoint.id);
    });

    webrtc.on("trackUpdated", (ctx: TrackContext) => {
      api.setMetadata(ctx.endpoint.id, ctx.trackId, ctx.metadata);
    });

    webrtcChannel.on("mediaEvent", (event) => {
      webrtc.receiveMediaEvent(event.data);
    });

    webrtcChannel.on("SIPMessage", (message) => {
      console.log("MSG: ", message)
      return;
    });

    webrtcChannel.on("error", (error) => {
      handleError(`Received error report from the server: ${error.message ?? ""}`);
      cleanUp();
    });

    webrtcChannel
      .join()
      .receive("ok", () => {
        webrtc.connect(peerMetadata);
        setWebrtc(webrtc);
      })
      .receive("error", (_response) => {
        console.error(_response);

        handleError(`Couldn't establish signaling connection`);
      });

    const cleanUp = () => {
      webrtc.disconnect();
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
