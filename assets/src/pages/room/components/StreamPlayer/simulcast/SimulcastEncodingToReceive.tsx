import React, { FC } from "react";
import { TrackEncoding } from "@jellyfish-dev/membrane-webrtc-js";
import { Tooltip } from "./Tooltip";
import { LayerButton } from "./LayerButton";

type Props = {
  setTargetEncoding: (encoding: TrackEncoding) => void;
  targetEncoding: TrackEncoding | null;
  disabled?: boolean;
  tileSizeEncoding: TrackEncoding | null;
  enableSmartEncoding: boolean;
};

export const SimulcastEncodingToReceive: FC<Props> = ({
  targetEncoding,
  setTargetEncoding,
  disabled,
  tileSizeEncoding,
  enableSmartEncoding,
}: Props) => {
  return (
    <div className="absolute bottom-0 right-0 z-50 w-full bg-white p-2 text-sm text-gray-700 opacity-80 md:text-base">
      <div className="flex flex-row justify-between">
        {enableSmartEncoding ? (
          <>
            <Tooltip text="Requested smart encoding target" textCss="left-24">
              <div>Smart: {targetEncoding}</div>
            </Tooltip>
            <Tooltip text="Encoding based on tile size" textCss="right-12">
              <div>Tile encoding: {tileSizeEncoding}</div>
            </Tooltip>
          </>
        ) : (
          <>
            <Tooltip text="User requested encoding target" textCss="left-20">
              <div>Encoding: {targetEncoding}</div>
            </Tooltip>
            <div className="flex flex-row justify-end">
              <LayerButton
                disabled={disabled}
                text="L"
                onClick={() => setTargetEncoding("l")}
                tooltipText="Switch encoding to Low"
              />
              <LayerButton
                disabled={disabled}
                text="M"
                onClick={() => setTargetEncoding("m")}
                tooltipText="Switch encoding to Medium"
              />
              <LayerButton
                disabled={disabled}
                text="H"
                onClick={() => setTargetEncoding("h")}
                tooltipText="Switch encoding to High"
              />
            </div>
          </>
        )}
      </div>
    </div>
  );
};
