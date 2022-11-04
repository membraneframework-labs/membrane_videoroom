import {
  AUDIO_TRACK_CONSTRAINTS,
  LOCAL_PEER_ID,
  SCREENSHARING_MEDIA_CONSTRAINTS,
  VIDEO_TRACK_CONSTRAINTS,
} from "./consts";
import {
  MembraneWebRTC,
  Peer,
  SerializedMediaEvent,
  TrackContext,
  TrackEncoding,
} from "@membraneframework/membrane-webrtc-js";
import { Push, Socket } from "phoenix";
import {
  addAudioStatusChangedCallback,
  addVideoElement,
  addVideoStatusChangedCallback,
  attachScreensharing,
  attachStream,
  detachScreensharing,
  getRoomId,
  removeVideoElement,
  setErrorMessage,
  setParticipantsList,
  setupControls,
  setMicIndicator,
  setCameraIndicator,
  toggleScreensharing,
  updateTrackEncoding,
  setIsSimulcastOn,
} from "./room_ui";
import { getVideoStream, getAudioStream } from "./media_utils";

import { parse } from "query-string";

export class Room {
  private peers: Peer[] = [];
  private tracks: Map<string, TrackContext[]> = new Map();
  private displayName: string;
  private localAudioStream: MediaStream | null = null;
  private wakeLock: WakeLockSentinel | null = null;
  private localVideoStream: MediaStream | null = null;
  private localVideoTrackId: string | null = null;
  private localAudioTrackIds: string[] = [];
  private localScreensharing: MediaStream | null = null;
  private localScreensharingTrackId: string | null = null;

  private webrtc: MembraneWebRTC;

  private socket;
  private webrtcSocketRefs: string[] = [];
  private webrtcChannel;
  private isSimulcastOn: boolean = false;

  constructor() {
    this.socket = new Socket("/socket");
    this.socket.connect();
    const urlParams = this.parseUrl();
    this.displayName = urlParams.displayName;
    this.isSimulcastOn = urlParams.isSimulcastOn;
    this.webrtcChannel = this.socket.channel(`room:${getRoomId()}`, {
      isSimulcastOn: this.isSimulcastOn,
    });
    this.webrtcChannel.onError(() => {
      this.socketOff();
      window.location.reload();
    });
    this.webrtcChannel.onClose(() => {
      this.socketOff();
      window.location.reload();
    });

    this.webrtcSocketRefs.push(this.socket.onError(this.leave));
    this.webrtcSocketRefs.push(this.socket.onClose(this.leave));

    this.webrtc = new MembraneWebRTC({
      callbacks: {
        onSendMediaEvent: (mediaEvent: SerializedMediaEvent) => {
          this.webrtcChannel.push("mediaEvent", { data: mediaEvent });
        },
        onConnectionError: setErrorMessage,
        onJoinSuccess: (_peerId, peersInRoom) => {
          this.localAudioStream?.getTracks().forEach((track) => {
            const trackId = this.webrtc.addTrack(
              track,
              this.localAudioStream!,
              { active: true }
            );
            this.localAudioTrackIds.push(trackId);
          });

          this.localVideoStream?.getTracks().forEach((track) => {
            this.localVideoTrackId = this.webrtc.addTrack(
              track,
              this.localVideoStream!,
              { active: true },
              { enabled: this.isSimulcastOn, active_encodings: ["l", "m", "h"] }
            );
          });

          this.peers = peersInRoom;
          this.peers.forEach((peer) => {
            addVideoElement(peer.id, peer.metadata.displayName, false, {
              onSelectLocalEncoding: null,
              onSelectRemoteEncoding: this.onSelectRemoteEncoding,
            });
            this.tracks.set(peer.id, []);
          });
          this.updateParticipantsList();
          if ("wakeLock" in navigator) {
            // Acquire wakeLock on join
            navigator.wakeLock.request("screen").then((wakeLock) => {
              this.wakeLock = wakeLock;
            });

            // Reacquire wakeLock when after the document is visible again (e.g. user went back to the tab)
            document.addEventListener(
              "visibilitychange",
              this.onVisibilityChange
            );
          }
        },
        onJoinError: (_metadata) => {
          throw `Peer denied.`;
        },
        onTrackReady: (ctx) => {
          if (ctx.metadata?.type === "screensharing") {
            attachScreensharing(
              ctx.peer.id,
              `(${ctx.peer.metadata.displayName}) Screen`,
              ctx.stream!
            );
          } else {
            attachStream(ctx.peer.id, {
              audioStream: ctx.stream,
              videoStream: ctx.stream,
            });
          }
          this.tracks.get(ctx.peer.id)?.push(ctx);

          if (ctx.track?.kind === "audio") {
            setMicIndicator(ctx.peer.id, ctx.metadata.active);
          } else if (
            ctx.track?.kind === "video" &&
            ctx.metadata?.type !== "screensharing"
          ) {
            setCameraIndicator(ctx.peer.id, ctx.metadata.active);
          }
        },
        onTrackAdded: (_ctx) => {},
        onTrackRemoved: (ctx) => {
          if (ctx.metadata.type === "screensharing") {
            detachScreensharing(ctx.peer.id);
          }
          let newPeerTracks = this.tracks
            .get(ctx.peer.id)
            ?.filter((track) => track.trackId !== ctx.trackId)!;
          this.tracks.set(ctx.peer.id, newPeerTracks);
        },
        onTrackUpdated: (ctx) => {
          if (ctx.track?.kind == "audio") {
            setMicIndicator(ctx.peer.id, ctx.metadata.active);
          } else if (
            ctx.track?.kind == "video" &&
            ctx.metadata.type !== "screensharing"
          ) {
            setCameraIndicator(ctx.peer.id, ctx.metadata.active);
          }
        },
        onPeerJoined: (peer) => {
          this.peers.push(peer);
          this.tracks.set(peer.id, []);
          this.updateParticipantsList();
          addVideoElement(peer.id, peer.metadata.displayName, false, {
            onSelectLocalEncoding: null,
            onSelectRemoteEncoding: this.onSelectRemoteEncoding,
          });
        },
        onPeerLeft: (peer) => {
          this.peers = this.peers.filter((p) => p.id !== peer.id);
          this.tracks.delete(peer.id);
          removeVideoElement(peer.id);
          this.updateParticipantsList();
        },
        onPeerUpdated: (_ctx) => {},
        onTrackEncodingChanged: (
          peerId: string,
          _trackId: string,
          encoding: string
        ) => {
          updateTrackEncoding(peerId, encoding);
        },
      },
    });

    this.webrtcChannel.on("mediaEvent", (event: any) =>
      this.webrtc.receiveMediaEvent(event.data)
    );
    this.webrtcChannel.on("simulcastConfig", (event) => {
      this.isSimulcastOn = this.isSimulcastOn || event.data;
      setIsSimulcastOn(event.data);
    });

    addAudioStatusChangedCallback(this.onAudioStatusChange.bind(this));
    addVideoStatusChangedCallback(this.onVideoStatusChange.bind(this));
  }

  public init = async () => {
    this.localVideoStream = await getVideoStream();
    this.localAudioStream = await getAudioStream();

    addVideoElement(LOCAL_PEER_ID, "Me", true, {
      onSelectLocalEncoding: this.onSelectLocalEncoding,
      onSelectRemoteEncoding: null,
    });

    attachStream(LOCAL_PEER_ID, {
      audioStream: this.localAudioStream,
      videoStream: this.localVideoStream,
    });

    await this.phoenixChannelPushResult(this.webrtcChannel.join());
  };

  public join = () => {
    const onScreensharingEnd = async () => {
      if (!this.localScreensharing) return;

      this.localScreensharing.getTracks().forEach((track) => track.stop());
      this.localScreensharing = null;

      this.webrtc.removeTrack(this.localScreensharingTrackId!);
      detachScreensharing(LOCAL_PEER_ID);
    };

    const onScreensharingStart = async () => {
      if (this.localScreensharing) return;

      this.localScreensharing = await navigator.mediaDevices.getDisplayMedia(
        SCREENSHARING_MEDIA_CONSTRAINTS
      );

      this.localScreensharingTrackId = this.webrtc.addTrack(
        this.localScreensharing.getVideoTracks()[0],
        this.localScreensharing,
        { type: "screensharing", active: true }
      );

      // listen for screensharing stop via browser controls instead of ui buttons
      this.localScreensharing.getVideoTracks().forEach((track) => {
        track.onended = () => {
          toggleScreensharing(null, onScreensharingEnd)();
        };
      });

      attachScreensharing(
        LOCAL_PEER_ID,
        "(Me) Screen",
        this.localScreensharing
      );
    };

    const callbacks = {
      onLeave: this.leave,
      onScreensharingStart,
      onScreensharingEnd,
    };

    setupControls(
      {
        audioStream: this.localAudioStream,
        videoStream: this.localVideoStream,
      },
      callbacks
    );

    this.webrtc.join({ displayName: this.displayName });
  };

  private onVisibilityChange = async () => {
    if (this.wakeLock !== null && document.visibilityState === "visible") {
      this.wakeLock = await navigator.wakeLock.request("screen");
    }
  };

  private leave = () => {
    window.history.replaceState(
      null,
      "",
      `${window.location.pathname}?simulcast=${this.isSimulcastOn}`
    );
    document.removeEventListener("visibilitychange", this.onVisibilityChange);
    this.wakeLock && this.wakeLock.release();
    this.wakeLock = null;
    this.webrtc.leave();
    this.webrtcChannel.leave();
    this.socketOff();
  };

  private socketOff = () => {
    this.socket.off(this.webrtcSocketRefs);
    while (this.webrtcSocketRefs.length > 0) {
      this.webrtcSocketRefs.pop();
    }
  };

  private onSelectLocalEncoding = (
    encoding: TrackEncoding,
    selected: boolean
  ): void => {
    if (selected) {
      this.webrtc.enableTrackEncoding(this.localVideoTrackId!, encoding);
    } else {
      this.webrtc.disableTrackEncoding(this.localVideoTrackId!, encoding);
    }
  };

  private onSelectRemoteEncoding = (
    peerId: string,
    encoding: TrackEncoding
  ): void => {
    const trackId = this.tracks
      .get(peerId)
      ?.filter(
        (track) =>
          track.metadata.type != "screensharing" && track.track!.kind == "video"
      )[0].trackId!;
    this.webrtc.selectTrackEncoding(peerId, trackId, encoding);
  };

  private parseUrl = (): { displayName: string; isSimulcastOn: boolean } => {
    let { display_name: displayName, simulcast: simulcast } = parse(
      document.location.search
    );

    // remove query params without reloading the page
    window.history.replaceState(null, "", window.location.pathname);
    displayName = displayName as string;
    const isSimulcastOn = simulcast == "true";
    return { displayName, isSimulcastOn };
  };

  private onAudioStatusChange = (status: boolean) => {
    this.localAudioTrackIds.forEach((track) =>
      this.webrtc.updateTrackMetadata(track, { active: status })
    );
    setMicIndicator("local-peer", status);
  };

  private onVideoStatusChange = (status: boolean) => {
    this.webrtc.updateTrackMetadata(this.localVideoTrackId!, {
      active: status,
    });
    setCameraIndicator("local-peer", status);
  };

  private updateParticipantsList = (): void => {
    const participantsNames = this.peers.map((p) => p.metadata.displayName);

    if (this.displayName) {
      participantsNames.push(this.displayName);
    }

    setParticipantsList(participantsNames);
  };

  private phoenixChannelPushResult = async (push: Push): Promise<any> => {
    return new Promise((resolve, reject) => {
      push
        .receive("ok", (response: any) => resolve(response))
        .receive("error", (response: any) => reject(response));
    });
  };
}
