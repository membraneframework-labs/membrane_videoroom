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
} from "membrane_rtc_engine";
import { Push, Socket } from "phoenix";
import {
  addVideoElement,
  attachScreensharing,
  attachStream,
  detachScreensharing,
  getRoomId,
  removeVideoElement,
  setErrorMessage,
  setParticipantsList,
  setupControls,
  toggleScreensharing,
  updateTrackEncoding,
} from "./room_ui";

import { parse } from "query-string";

export class Room {
  private peers: Peer[] = [];
  private tracks: Map<string, TrackContext[]> = new Map();
  private displayName: string;
  private localAudioStream: MediaStream | null = null;
  private localVideoStream: MediaStream | null = null;
  private localVideoTrackId: string | null = null;
  private localScreensharing: MediaStream | null = null;
  private localScreensharingTrackId: string | null = null;

  private webrtc: MembraneWebRTC;

  private socket;
  private webrtcSocketRefs: string[] = [];
  private webrtcChannel;

  constructor() {
    this.socket = new Socket("/socket");
    this.socket.connect();
    this.displayName = this.parseUrl();
    this.webrtcChannel = this.socket.channel(`room:${getRoomId()}`);
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
          this.localAudioStream
            ?.getTracks()
            .forEach((track) =>
              this.webrtc.addTrack(track, this.localAudioStream!, {})
            );

          this.localVideoStream?.getTracks().forEach((track) => {
            this.localVideoTrackId = this.webrtc.addTrack(
              track,
              this.localVideoStream!,
              {},
              { enabled: true, active_encodings: ["l", "m"] }
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
        },
        onJoinError: (_metadata) => {
          throw `Peer denied.`;
        },
        onTrackReady: (ctx) => {
          if (ctx.metadata && ctx.metadata.type === "screensharing") {
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
  }

  public init = async () => {
    const hasVideoInput: boolean = (
      await navigator.mediaDevices.enumerateDevices()
    ).some((device) => device.kind === "videoinput");

    // Ask user for permissions if required
    await navigator.mediaDevices.getUserMedia({
      audio: true,
      video: hasVideoInput,
    });

    // Refresh mediaDevices list after ensuring permissions are granted
    // Before that, enumerateDevices() call would not return deviceIds
    const mediaDevices = await navigator.mediaDevices.enumerateDevices();
    const videoDevices = mediaDevices.filter(
      (device) => device.kind === "videoinput"
    );

    for (const device of videoDevices) {
      const constraints = {
        video: {
          ...VIDEO_TRACK_CONSTRAINTS,
          deviceId: { exact: device.deviceId },
        },
      };

      try {
        this.localVideoStream = await navigator.mediaDevices.getUserMedia(
          constraints
        );

        break;
      } catch (error) {
        console.error("Error while getting local video stream", error);
      }
    }

    try {
      this.localAudioStream = await navigator.mediaDevices.getUserMedia({
        audio: AUDIO_TRACK_CONSTRAINTS,
      });
    } catch (error) {
      console.error("Error while getting local audio stream", error);
    }

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
        { type: "screensharing" }
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

  private leave = () => {
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

  private parseUrl = (): string => {
    const { display_name: displayName } = parse(document.location.search);

    // remove query params without reloading the page
    window.history.replaceState(null, "", window.location.pathname);

    return displayName as string;
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
