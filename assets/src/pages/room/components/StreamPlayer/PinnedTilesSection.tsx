import React, { FC } from "react";
import { MediaPlayerTileConfig } from "../../../types";
import { MembraneWebRTC } from "@jellyfish-dev/membrane-webrtc-js";
import PeerInfoLayer from "./PeerInfoLayer";
import { PinIndicator, PinTileButton } from "../../../../features/room-page/components/PinComponents";
import NameTag from "../../../../features/room-page/components/NameTag";
import MediaPlayerTile from "./MediaPlayerTile";
import {
  DisabledMicIcon,
  isLoading,
  showDisabledIcon,
} from "../../../../features/room-page/components/DisabledTrackIcon";
import InitialsImage from "../../../../features/room-page/components/InitialsImage";

type Props = {
  pinnedTiles: MediaPlayerTileConfig[];
  unpin: (tileIdToUnpin: string) => void;
  webrtc?: MembraneWebRTC;
  showSimulcast?: boolean;
};

const PinnedTilesSection: FC<Props> = ({ pinnedTiles, unpin, webrtc, showSimulcast }: Props) => {
  return (
    <div className="active-screensharing-grid h-full grid-cols-1">
      {pinnedTiles.map((pinnedTile: MediaPlayerTileConfig) => {
        const tileType = pinnedTile.typeName;
        const hasInitials = tileType === "local" || tileType === "remote";
          return <MediaPlayerTile
          key={pinnedTile.mediaPlayerId}
          peerId={pinnedTile.peerId}
          video={pinnedTile.video}
          audio={tileType === "remote" ? pinnedTile.audio : null}
          streamSource={pinnedTile.streamSource}
          blockFillContent={tileType === "screenShare"}
          flipHorizontally={tileType === "local"}
          layers={
            <>
              {hasInitials && showDisabledIcon(pinnedTile.video) ? (
                <InitialsImage initials={pinnedTile.initials} />
              ) : null}
              <PeerInfoLayer
                topRight={<PinIndicator />}
                topLeft={
                  hasInitials && showDisabledIcon(pinnedTile.audio) ? (
                    <DisabledMicIcon isLoading={isLoading(pinnedTile.audio)} />
                  ) : null
                }
                bottomLeft={<NameTag name={pinnedTile.displayName} />}
              />
              <PinTileButton pinned={true} onClick={() => unpin(pinnedTile.mediaPlayerId)} />
            </>
          }
          showSimulcast={showSimulcast}
          webrtc={webrtc}
          />
      })}
    </div>
  );
};

export default PinnedTilesSection;
