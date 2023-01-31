import {useEffect, useState} from "react";
import {
  Callbacks,
  MembraneWebRTC,
  Peer,
  SerializedMediaEvent,
  SimulcastConfig,
  TrackBandwidthLimit,
  TrackContext,
  TrackEncoding,
} from "@jellyfish-dev/membrane-webrtc-js";
import {Channel, Socket} from "phoenix";
import EventEmitter from "events";
import TypedEmitter from "typed-emitter";
// todo delete
import {SetErrorMessage} from "../pages/room/RoomPage";
import {
  LibraryLocalPeer,
  LibraryPeersState,
  LibraryRemotePeer,
  LibraryTrack,
  TrackId,
  UseMembraneClientType,
} from "./types";
import {MembraneApi} from "./api";
import {createStore} from "./store";

// todo extract callbacks
export const useLibraryMembraneClient = <PeerMetadataGeneric, TrackMetadataGeneric>(
  roomId: string,
  peerMetadata: PeerMetadataGeneric,
  isSimulcastOn: boolean,
  setErrorMessage: SetErrorMessage
): UseMembraneClientType<PeerMetadataGeneric, TrackMetadataGeneric> | null => {
  type StateShorthand = LibraryPeersState<PeerMetadataGeneric, TrackMetadataGeneric>;
  type LocalPeerShorthand = LibraryLocalPeer<PeerMetadataGeneric, TrackMetadataGeneric>;
  type RemotePeerShorthand = LibraryRemotePeer<PeerMetadataGeneric, TrackMetadataGeneric>;

  const [state, setState] = useState<UseMembraneClientType<PeerMetadataGeneric, TrackMetadataGeneric> | null>(null);

  useEffect(() => {
    const messageEmitter: TypedEmitter<Partial<Callbacks>> = new EventEmitter() as TypedEmitter<Partial<Callbacks>>;
    const store = createStore<PeerMetadataGeneric, TrackMetadataGeneric>();

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
      setErrorMessage("WebrtcChannel error occurred");
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
            store,
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
            store,
            api: prevState?.api || null,
          }));
          store.setStore((): StateShorthand => {
            const remote: Record<string, RemotePeerShorthand> = Object.fromEntries(
              new Map(
                peersInRoom.map((peer) => [
                  peer.id,
                  {
                    id: peer.id,
                    metadata: peer.metadata,
                    tracks: {},
                  },
                ])
              )
            );

            // todo add your own metadata
            const local: LocalPeerShorthand = {
              id: peerId,
              metadata: null,
              tracks: {},
            };

            return { local, remote };
          });
          messageEmitter.emit("onJoinSuccess", peerId, peersInRoom);
        },
        onRemoved: (reason) => {
          console.log({ name: "onRemoved", reason });

          messageEmitter.emit("onRemoved", reason);
          // todo handle
        },
        onPeerJoined: (peer) => {
          console.log({ name: "onPeerJoined", peer });

          store.setStore((prevState: StateShorthand) => {
            const remote: Record<string, RemotePeerShorthand> = {
              ...prevState.remote,
              [peer.id]: { id: peer.id, metadata: peer.metadata, tracks: {} },
            };

            return { ...prevState, remote };
          });
          messageEmitter.emit("onPeerJoined", peer);
        },
        onPeerLeft: (peer) => {
          console.log({ name: "onPeerLeft", peer });

          store.setStore((prevState: StateShorthand) => {
            const remote: Record<string, RemotePeerShorthand> = {
              ...prevState.remote,
            };

            delete remote[peer.id];

            return { ...prevState, remote };
          });
          messageEmitter.emit("onPeerLeft", peer);
        },
        onPeerUpdated: (peer: Peer) => {
          console.log({ name: "onPeerUpdated", peer });

          messageEmitter.emit("onPeerUpdated", peer);
        },
        onTrackReady: (ctx) => {
          console.log({ name: "onTrackReady", ctx });

          store.setStore((prevState: StateShorthand) => {
            if (!ctx.stream) return prevState;
            if (!ctx.peer) return prevState;
            if (!ctx.trackId) return prevState;

            const remote: Record<string, RemotePeerShorthand> = {
              ...prevState.remote,
            };

            // todo fix this mutation
            remote[ctx.peer.id].tracks[ctx.trackId] = {
              trackId: ctx.trackId,
              metadata: ctx.metadata,
              stream: ctx.stream,
              track: ctx.track,
              simulcastConfig: ctx.simulcastConfig
                ? {
                    enabled: ctx.simulcastConfig.enabled,
                    activeEncodings: [...ctx.simulcastConfig.active_encodings],
                  }
                : null,
            };

            return { ...prevState, remote: remote };
          });
          messageEmitter.emit("onTrackReady", ctx);
        },
        onTrackAdded: (ctx) => {
          console.log({ name: "onTrackAdded", ctx });

          store.setStore((prevState: StateShorthand) => {
            if (!ctx.peer) return prevState;
            if (!ctx.trackId) return prevState;

            const remote: Record<string, RemotePeerShorthand> = {
              ...prevState.remote,
            };

            // todo fix this mutation
            remote[ctx.peer.id].tracks[ctx.trackId] = {
              trackId: ctx.trackId,
              metadata: ctx.metadata,
              simulcastConfig: ctx.simulcastConfig
                ? {
                    enabled: ctx.simulcastConfig.enabled,
                    activeEncodings: [...ctx.simulcastConfig.active_encodings],
                  }
                : null,
              stream: ctx.stream,
              track: ctx.track,
            };

            return { ...prevState, remote: remote };
          });
          messageEmitter.emit("onTrackReady", ctx);
        },
        onTrackRemoved: (ctx) => {
          console.log({ name: "onTrackRemoved", ctx });

          store.setStore((prevState: StateShorthand) => {
            if (!ctx.peer) return prevState;
            if (!ctx.trackId) return prevState;

            const remote: Record<string, RemotePeerShorthand> = {
              ...prevState.remote,
            };

            delete remote[ctx.peer.id].tracks[ctx.trackId];

            return { ...prevState, remote: remote };
          });
          messageEmitter.emit("onTrackRemoved", ctx);
        },
        onTrackEncodingChanged: (peerId: string, trackId: string, encoding: TrackEncoding) => {
          console.log({ name: "onTrackEncodingChanged", peerId, trackId, encoding });

          store.setStore((prevState: StateShorthand) => {
            const remote: Record<string, RemotePeerShorthand> = {
              ...prevState.remote,
            };

            const peer = remote[peerId];

            const track = { ...peer.tracks[trackId], encoding };

            return {
              ...prevState,
              remote: {
                ...prevState.remote,
                [peerId]: { ...peer, tracks: { ...peer.tracks, [trackId]: track } },
              },
            };
          });
          messageEmitter.emit("onTrackEncodingChanged", peerId, trackId, encoding);
        },
        onTrackUpdated: (ctx: TrackContext) => {
          console.log({ name: "onTrackUpdated", ctx });

          store.setStore((prevState: StateShorthand) => {
            const remote: Record<string, RemotePeerShorthand> = {
              ...prevState.remote,
            };

            const peer = remote[ctx.peer.id];

            const track: LibraryTrack<TrackMetadataGeneric> = {
              ...peer.tracks[ctx.trackId],
              stream: ctx.stream,
              metadata: ctx.metadata,
            };

            return {
              ...prevState,
              remote: {
                ...prevState.remote,
                [ctx.peer.id]: { ...peer, tracks: { ...peer.tracks, [ctx.trackId]: track } },
              },
            };
          });

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

    const api: MembraneApi<TrackMetadataGeneric> = {
      addTrack: (
        track: MediaStreamTrack,
        stream: MediaStream,
        trackMetadata?: TrackMetadataGeneric,
        simulcastConfig?: SimulcastConfig,
        maxBandwidth?: TrackBandwidthLimit
      ) => {
        const remoteTrackId = webrtc.addTrack(track, stream, trackMetadata, simulcastConfig, maxBandwidth);
        store.setStore((prevState: StateShorthand): StateShorthand => {
          return {
            ...prevState,
            local: {
              ...prevState.local,
              tracks: {
                ...prevState.local.tracks,
                [remoteTrackId]: {
                  track: track,
                  trackId: remoteTrackId,
                  stream: stream,
                  metadata: trackMetadata || null,
                  simulcastConfig: simulcastConfig
                    ? {
                        enabled: simulcastConfig?.enabled,
                        activeEncodings: [...simulcastConfig.active_encodings],
                      }
                    : null,
                },
              },
            },
          };
        });
        return remoteTrackId;
      },

      replaceTrack: (trackId, newTrack, newTrackMetadata) => {
        const promise = webrtc.replaceTrack(trackId, newTrack, newTrackMetadata);
        store.setStore((prevState: StateShorthand): StateShorthand => {
          const prevTrack: LibraryTrack<TrackMetadataGeneric> | null = prevState?.local?.tracks[trackId] || null;
          if (!prevTrack) return prevState;

          return {
            ...prevState,
            local: {
              ...prevState.local,
              tracks: {
                ...prevState.local.tracks,
                [trackId]: {
                  ...prevTrack,
                  track: newTrack,
                  trackId: trackId,
                  metadata: newTrackMetadata ? { ...newTrackMetadata } : null,
                },
              },
            },
          };
        });
        return promise;
      },

      removeTrack: (trackId) => {
        webrtc.removeTrack(trackId);
        store.setStore((prevState: StateShorthand): StateShorthand => {
          const tracksCopy: Record<TrackId, LibraryTrack<TrackMetadataGeneric>> | undefined =
            prevState?.local?.tracks;
          delete tracksCopy[trackId];

          return {
            ...prevState,
            local: {
              ...prevState.local,
              tracks: tracksCopy,
            },
          };
        });
      },

      updateTrackMetadata: (trackId, trackMetadata) => {
        webrtc.updateTrackMetadata(trackId, trackMetadata);

        store.setStore((prevState: StateShorthand): StateShorthand => {
          const prevTrack: LibraryTrack<TrackMetadataGeneric> | null = prevState?.local?.tracks[trackId] || null;
          if (!prevTrack) return prevState;

          return {
            ...prevState,
            local: {
              ...prevState.local,
              tracks: {
                ...prevState.local.tracks,
                [trackId]: {
                  ...prevTrack,
                  metadata: trackMetadata ? { ...trackMetadata } : null,
                },
              },
            },
          };
        });
      },
    };

    signaling.on("mediaEvent", (event) => {
      webrtc.receiveMediaEvent(event.data);
    });

    signaling.on("simulcastConfig", () => {
      return;
    });

    setState({
      webrtc,
      messageEmitter,
      signaling,
      signalingStatus: "connecting",
      webrtcConnectionStatus: "before-connection",
      store,
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
          store,
          api,
        });
      })
      .receive("error", (response) => {
        setErrorMessage("Connecting error");
        console.error("Received error status");
        console.error(response);

        setState({
          webrtc,
          messageEmitter,
          signaling,
          signalingStatus: "error",
          webrtcConnectionStatus: "before-connection",
          store,
          api,
        });
      });

    const cleanUp = () => {
      webrtc.leave();
      signaling.leave();
      socket.off([socketOnCloseRef, socketOnErrorRef]);
      setState(null);
    };

    return () => {
      cleanUp();
    };
  }, [isSimulcastOn, peerMetadata, roomId, setErrorMessage]);

  return state;
};
