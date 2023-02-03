import { useCallback, useMemo, useRef, useState } from "react";
import { Callbacks, MembraneWebRTC, Peer, SerializedMediaEvent, TrackContext } from "@jellyfish-dev/membrane-webrtc-js";
import { Channel, Socket } from "phoenix";
import EventEmitter from "events";
import TypedEmitter from "typed-emitter";
import { LibraryPeersState, UseMembraneClientType } from "../state.types";
import { createApiWrapper, StoreApi } from "../storeApi";
import { ExternalState } from "../externalState";
import {
  onJoinSuccess,
  onPeerJoined,
  onPeerLeft,
  onTrackAdded,
  onTrackEncodingChanged,
  onTrackReady,
  onTrackRemoved,
  onTrackUpdated,
} from "../stateMappers";

type UseLibraryMembraneClient2ReturnType<PeerMetadataGeneric, TrackMetadataGeneric> = {
  connect: (roomId: string, peerMetadata: PeerMetadataGeneric, isSimulcastOn: boolean) => void;
  disconnect: () => void;
  store: ExternalState<PeerMetadataGeneric, TrackMetadataGeneric>;
} & Partial<UseMembraneClientType<PeerMetadataGeneric, TrackMetadataGeneric>>;

// todo extract callbacks
export const useNoContextMembraneRTCWrapper = <PeerMetadataGeneric, TrackMetadataGeneric>(
  store: ExternalState<PeerMetadataGeneric, TrackMetadataGeneric>
): UseLibraryMembraneClient2ReturnType<PeerMetadataGeneric, TrackMetadataGeneric> => {
  const [state, setState] = useState<UseMembraneClientType<PeerMetadataGeneric, TrackMetadataGeneric> | null>(null);
  const disconnectCallback = useRef<() => void>(() => {
    return;
  });

  const connect = useCallback(
    (roomId: string, peerMetadata: PeerMetadataGeneric, isSimulcastOn: boolean): void => {
      if (disconnectCallback.current) {
        disconnectCallback.current();
      }

      const messageEmitter: TypedEmitter<Partial<Callbacks>> = new EventEmitter() as TypedEmitter<Partial<Callbacks>>;

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
            messageEmitter.emit("onSendMediaEvent", mediaEvent);
          },
          onConnectionError: (message) => {
            setState({
              webrtc,
              messageEmitter,
              signaling,
              signalingStatus: "connected",
              webrtcConnectionStatus: "error",
              // store,
              api: null,
            });
            messageEmitter.emit("onConnectionError", message);
          },
          // todo [Peer] -> Peer[] ???
          onJoinSuccess: (peerId, peersInRoom: [Peer]) => {
            console.log({ name: "onJoinSuccess", peerId, peersInRoom });
            setState((prevState) => ({
              webrtc,
              messageEmitter,
              signaling,
              signalingStatus: "connected",
              webrtcConnectionStatus: "connected",
              // store,
              api: prevState?.api || null,
            }));
            store.setStore(onJoinSuccess(peersInRoom, peerId, peerMetadata));
            messageEmitter.emit("onJoinSuccess", peerId, peersInRoom);
          },
          onRemoved: (reason) => {
            console.log({ name: "onRemoved", reason });
            messageEmitter.emit("onRemoved", reason);
            // todo handle
          },
          onPeerJoined: (peer) => {
            console.log({ name: "onPeerJoined", peer });
            store.setStore(onPeerJoined(peer));
            messageEmitter.emit("onPeerJoined", peer);
          },
          onPeerLeft: (peer) => {
            console.log({ name: "onPeerLeft", peer });
            store.setStore(onPeerLeft(peer));
            messageEmitter.emit("onPeerLeft", peer);
          },
          onPeerUpdated: (peer: Peer) => {
            console.log({ name: "onPeerUpdated", peer });
            messageEmitter.emit("onPeerUpdated", peer);
          },
          onTrackReady: (ctx) => {
            console.log({ name: "onTrackReady", ctx });
            store.setStore(onTrackReady(ctx));
            messageEmitter.emit("onTrackReady", ctx);
          },
          onTrackAdded: (ctx) => {
            console.log({ name: "onTrackAdded", ctx });
            store.setStore(onTrackAdded(ctx));
            messageEmitter.emit("onTrackReady", ctx);
          },
          onTrackRemoved: (ctx) => {
            console.log({ name: "onTrackRemoved", ctx });
            store.setStore(onTrackRemoved(ctx));
            messageEmitter.emit("onTrackRemoved", ctx);
          },
          onTrackEncodingChanged: (peerId, trackId, encoding) => {
            console.log({ name: "onTrackEncodingChanged", peerId, trackId, encoding });
            store.setStore(onTrackEncodingChanged(peerId, trackId, encoding));
            messageEmitter.emit("onTrackEncodingChanged", peerId, trackId, encoding);
          },
          onTrackUpdated: (ctx: TrackContext) => {
            console.log({ name: "onTrackUpdated", ctx });
            store.setStore(onTrackUpdated(ctx));
            messageEmitter.emit("onTrackUpdated", ctx);
          },
          onTracksPriorityChanged: (enabledTracks: TrackContext[], disabledTracks: TrackContext[]) => {
            console.log({ name: "onTracksPriorityChanged", enabledTracks, disabledTracks });
            messageEmitter.emit("onTracksPriorityChanged", enabledTracks, disabledTracks);
          },
          onJoinError: (metadata) => {
            console.log({ name: "onJoinError", metadata });
            messageEmitter.emit("onJoinError", metadata);
          },
        },
      });

      const api: StoreApi<TrackMetadataGeneric> = createApiWrapper(webrtc, store);

      signaling.on("mediaEvent", (event) => {
        webrtc.receiveMediaEvent(event.data);
      });

      signaling.on("simulcastConfig", () => {
        return;
      });

      store.setStore(
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

      setState({
        webrtc,
        messageEmitter,
        signaling,
        signalingStatus: "connecting",
        webrtcConnectionStatus: "before-connection",
        // store,
        api,
      });

      signaling
        .join()
        .receive("ok", () => {
          webrtc.join(peerMetadata);
          setState({
            webrtc,
            messageEmitter,
            signaling,
            signalingStatus: "connected",
            webrtcConnectionStatus: "connecting",
            // store,
            api,
          });
        })
        .receive("error", (response) => {
          // setErrorMessage("Connecting error");
          console.error("Received error status");
          console.error(response);

          setState({
            webrtc,
            messageEmitter,
            signaling,
            signalingStatus: "error",
            webrtcConnectionStatus: "before-connection",
            // store,
            api,
          });
        });

      const cleanUp = () => {
        store.setStore((): LibraryPeersState<PeerMetadataGeneric, TrackMetadataGeneric> => {
          return {
            local: {
              id: null,
              tracks: {},
              metadata: null,
            },
            remote: {},
            connectivity: {
              api: null,
              webrtc: null,
              signaling: null,
              socket: null,
            },
          };
        });

        webrtc.leave();
        signaling.leave();
        socket.off([socketOnCloseRef, socketOnErrorRef]);
        setState(null);
        disconnectCallback.current = () => {
          return;
        };
      };

      if (disconnectCallback.current) {
        disconnectCallback.current = cleanUp;
      }

      // return () => {
      //   cleanUp();
      // };
    },
    [store]
  );

  const disconnect = useCallback(() => {
    disconnectCallback?.current();
  }, []);

  return useMemo(() => {
    return { ...state, connect, disconnect, store };
  }, [state, connect, disconnect, store]);
};
