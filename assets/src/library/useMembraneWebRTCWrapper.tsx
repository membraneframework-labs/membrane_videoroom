import { useEffect } from "react";
import { MembraneWebRTC, Peer, SerializedMediaEvent, TrackContext } from "@jellyfish-dev/membrane-webrtc-js";
import { Channel, Socket } from "phoenix";
import { DEFAULT_STORE, SetStore } from "./externalState";
import { LibraryPeersState } from "./state.types";
import {
  onJoinSuccess,
  onPeerJoined,
  onPeerLeft,
  onTrackAdded,
  onTrackEncodingChanged,
  onTrackReady,
  onTrackRemoved,
  onTrackUpdated,
} from "./stateMappers";
import { createApiWrapper, StoreApi } from "./storeApi";

export const useSyncMembraneWebRTCState = <PeerMetadataGeneric, TrackMetadataGeneric>(
  setStore: SetStore<PeerMetadataGeneric, TrackMetadataGeneric>,
  roomId: string,
  peerMetadata: PeerMetadataGeneric,
  isSimulcastOn: boolean
) => {
  useEffect(() => {
    const socket = new Socket("/socket");
    socket.connect();
    const socketOnCloseRef = socket.onClose(() => cleanUp());
    const socketOnErrorRef = socket.onError(() => cleanUp());

    const signaling: Channel = socket.channel(`room:${roomId}`, {
      isSimulcastOn: isSimulcastOn,
    });

    signaling.onError((reason) => {
      console.error("WebrtcChannel error occurred");
      console.error(reason);
      // setErrorMessage("WebrtcChannel error occurred");
    });
    signaling.onClose(() => {
      return;
    });

    const webrtc = new MembraneWebRTC({
      callbacks: {
        onSendMediaEvent: (mediaEvent: SerializedMediaEvent) => {
          signaling.push("mediaEvent", { data: mediaEvent });
        },
        onConnectionError: (message) => {
          return;
        },
        // todo [Peer] -> Peer[] ???
        onJoinSuccess: (peerId, peersInRoom: [Peer]) => {
          console.log({ name: "onJoinSuccess", peerId, peersInRoom });
          setStore(onJoinSuccess(peersInRoom, peerId, peerMetadata));
        },
        onRemoved: (reason) => {
          console.log({ name: "onRemoved", reason });
          // todo handle
        },
        onPeerJoined: (peer) => {
          console.log({ name: "onPeerJoined", peer });
          setStore(onPeerJoined(peer));
        },
        onPeerLeft: (peer) => {
          console.log({ name: "onPeerLeft", peer });
          setStore(onPeerLeft(peer));
        },
        onPeerUpdated: (peer: Peer) => {
          console.log({ name: "onPeerUpdated", peer });
        },
        onTrackReady: (ctx) => {
          console.log({ name: "onTrackReady", ctx });
          setStore(onTrackReady(ctx));
        },
        onTrackAdded: (ctx) => {
          console.log({ name: "onTrackAdded", ctx });
          setStore(onTrackAdded(ctx));
        },
        onTrackRemoved: (ctx) => {
          console.log({ name: "onTrackRemoved", ctx });
          setStore(onTrackRemoved(ctx));
        },
        onTrackEncodingChanged: (peerId, trackId, encoding) => {
          console.log({ name: "onTrackEncodingChanged", peerId, trackId, encoding });
          setStore(onTrackEncodingChanged(peerId, trackId, encoding));
        },
        onTrackUpdated: (ctx: TrackContext) => {
          console.log({ name: "onTrackUpdated", ctx });
          setStore(onTrackUpdated(ctx));
        },
        onTracksPriorityChanged: (enabledTracks: TrackContext[], disabledTracks: TrackContext[]) => {
          console.log({ name: "onTracksPriorityChanged", enabledTracks, disabledTracks });
        },
        onJoinError: (metadata) => {
          console.log({ name: "onJoinError", metadata });
        },
      },
    });

    const api: StoreApi<TrackMetadataGeneric> = createApiWrapper(webrtc, setStore);

    signaling.on("mediaEvent", (event) => {
      webrtc.receiveMediaEvent(event.data);
    });

    signaling.on("simulcastConfig", () => {
      return;
    });

    setStore(
      (
        prevState: LibraryPeersState<PeerMetadataGeneric, TrackMetadataGeneric>
      ): LibraryPeersState<PeerMetadataGeneric, TrackMetadataGeneric> => {
        return {
          ...prevState,
          connectivity: {
            socket: socket,
            api: api,
            webrtc: webrtc,
            signaling: signaling,
          },
        };
      }
    );

    signaling
      .join()
      .receive("ok", () => {
        webrtc.join(peerMetadata);
      })
      .receive("error", (response) => {
        // setErrorMessage("Connecting error");
        console.error("Received error status");
        console.error(response);
      });

    const cleanUp = () => {
      setStore(() => DEFAULT_STORE);

      webrtc.leave();
      signaling.leave();
      socket.off([socketOnCloseRef, socketOnErrorRef]);
    };

    return () => {
      cleanUp();
    };
  }, [isSimulcastOn, peerMetadata, roomId, setStore]);
};
