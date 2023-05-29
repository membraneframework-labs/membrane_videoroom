import React, { FC } from "react";
import { MediaPlayerTileConfig } from "../../../types";
import PeerInfoLayer from "./PeerInfoLayer";
import { PinIndicator } from "../../../../features/room-page/components/PinComponents";
import NameTag from "../../../../features/room-page/components/NameTag";
import RemoteMediaPlayerTile from "./RemoteMediaPlayerTile";
import { showDisabledIcon } from "../../../../features/room-page/components/DisabledTrackIcon";
import InitialsImage from "../../../../features/room-page/components/InitialsImage";
import { getTileUpperLeftIcon } from "../../../../features/room-page/utils/computeLeftUpperIcon";
import LocalMediaPlayerTile from "./LocalMediaPlayerTile";

type TileProps = {
  tile: MediaPlayerTileConfig;
  className: string;
  forceEncoding: "l" | "m" | "h" | undefined;
  showSimulcast: boolean;
  pinLayer?: JSX.Element;
};

const Tile: FC<TileProps> = ({ tile, className, forceEncoding, showSimulcast, pinLayer }) => {
  const InfoLayer = () => (
    <PeerInfoLayer
      topRight={<PinIndicator />}
      topLeft={getTileUpperLeftIcon(tile)}
      bottomLeft={<NameTag name={tile.displayName} />}
    />
  );

  if (tile.typeName === "screenShare") {
    return (
      <RemoteMediaPlayerTile
        key={tile.mediaPlayerId}
        className={className}
        peerId={tile.peerId}
        video={tile.video?.stream || null}
        layers={
          <>
            <InfoLayer />
            {pinLayer}
          </>
        }
        showSimulcast={false}
        forceEncoding={forceEncoding || null}
        encodingQuality={tile.video?.encodingQuality || null}
        remoteTrackId={tile.video?.remoteTrackId || null}
      />
    );
  }

  const Layers = () => (
    <>
      {showDisabledIcon(tile.video) && <InitialsImage initials={tile.initials} />}
      <InfoLayer />
      {pinLayer}
    </>
  );

  if (tile.typeName === "local") {
    return (
      <LocalMediaPlayerTile
        key={tile.mediaPlayerId}
        className={className}
        video={tile.video?.stream}
        flipHorizontally
        layers={<Layers />}
        showSimulcast={showSimulcast}
      />
    );
  }

  return (
    <RemoteMediaPlayerTile
      key={tile.mediaPlayerId}
      className={className}
      peerId={tile.peerId}
      video={tile.video?.stream}
      audio={tile?.audio?.stream}
      layers={<Layers />}
      showSimulcast={showSimulcast}
      forceEncoding={forceEncoding || null}
      encodingQuality={tile.video?.encodingQuality || null}
      remoteTrackId={tile.video?.remoteTrackId || null}
    />
  );
};

export default Tile;
