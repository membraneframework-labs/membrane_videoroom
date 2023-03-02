import React, { FC } from "react";
import { TrackEncoding } from "@jellyfish-dev/membrane-webrtc-js";
import { Tooltip } from "./Tooltip";
import { LayerButton } from "./LayerButton";

type Props = {
  currentEncoding?: TrackEncoding | null;
  targetEncoding: TrackEncoding | null;
  setTargetEncoding: (encoding: TrackEncoding) => void;
  smartEncoding: TrackEncoding | null;
  localSmartEncodingStatus: boolean;
  setLocalSmartEncodingStatus: (value: boolean) => void;
  disabled: boolean;
};

export const SimulcastEncodingToReceive: FC<Props> = ({
  currentEncoding,
  targetEncoding,
  setTargetEncoding,
  smartEncoding,
  localSmartEncodingStatus,
  setLocalSmartEncodingStatus,
  disabled,
}: Props) => {
  return (
    <div className="absolute top-0 right-0 z-50 w-full text-sm text-gray-700 md:text-base">
      <div className="flex flex-row justify-between">
        <div className="rounded-br-xl bg-white/80 py-2 pl-4 pr-4">
          <Tooltip text="Current encoding" textCss="left-14">
            <div>{currentEncoding}</div>
          </Tooltip>
        </div>

        <div className="flex flex-row justify-end rounded-bl-xl bg-white/80 p-2">
          <LayerButton
            selected={localSmartEncodingStatus}
            disabled={disabled}
            text={smartEncoding ? `Smart (${smartEncoding})` : "Smart"}
            onClick={() => setLocalSmartEncodingStatus(true)}
            tooltipText="Turn on smart encoding"
            tooltipCss="right-16"
          />
          <LayerButton
            selected={!localSmartEncodingStatus && targetEncoding === "h"}
            disabled={disabled}
            text="H"
            onClick={() => setTargetEncoding("h")}
            tooltipText="Switch encoding to High"
            tooltipCss="right-16"
          />
          <LayerButton
            selected={!localSmartEncodingStatus && targetEncoding === "m"}
            disabled={disabled}
            text="M"
            onClick={() => setTargetEncoding("m")}
            tooltipText="Switch encoding to Medium"
            tooltipCss="right-16"
          />
          <LayerButton
            selected={!localSmartEncodingStatus && targetEncoding === "l"}
            disabled={disabled}
            text="L"
            onClick={() => setTargetEncoding("l")}
            tooltipText="Switch encoding to Low"
            tooltipCss="right-16"
          />
        </div>
      </div>
    </div>
  );
};
