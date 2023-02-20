import React, { FC } from "react";
import { TrackEncoding } from "@jellyfish-dev/membrane-webrtc-js";
import { Tooltip } from "./Tooltip";
import { LayerButton } from "./LayerButton";

type Props = {
  targetEncoding: TrackEncoding | null;
  setTargetEncoding: (encoding: TrackEncoding) => void;
  tileSizeEncoding: TrackEncoding | null;
  smartEncoding: TrackEncoding | null;
  smartEncodingStatus: boolean;
  setSmartEncodingStatus: (value: boolean) => void;
  disabled?: boolean;
};

export const SimulcastEncodingToReceive: FC<Props> = ({
  targetEncoding,
  setTargetEncoding,
  tileSizeEncoding,
  smartEncoding,
  smartEncodingStatus,
  setSmartEncodingStatus,
  disabled,
}: Props) => {
  return (
    <div className="absolute bottom-0 right-0 z-50 w-full bg-white p-2 text-sm text-gray-700 opacity-80 md:text-base">
      <div className="flex flex-row justify-between">
        <Tooltip text="Toggle automatic layer switching" textCss="left-24">
          <div className="form-check flex items-center gap-x-1">
            <label className="form-check-label text-brand-dark-blue-500">Smart</label>
            <input
              onChange={() => setSmartEncodingStatus(!smartEncodingStatus)}
              className="form-check-input"
              type="checkbox"
              checked={smartEncodingStatus}
            />
          </div>
        </Tooltip>

        <Tooltip text="Encoding based on all rules">
          <div>Smart: {smartEncoding}</div>
        </Tooltip>

        <Tooltip text="Encoding based on tile size" textCss="right-20">
          <div>Tile: {tileSizeEncoding}</div>
        </Tooltip>
      </div>

      <div className="flex flex-row justify-between">
        <Tooltip text="Selected encoding target" textCss="left-20">
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
      </div>
    </div>
  );
};
