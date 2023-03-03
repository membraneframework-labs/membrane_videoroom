import React, { FC } from "react";
import { UseSimulcastLocalEncoding } from "../../../hooks/useSimulcastSend";
import { LayerButton } from "./LayerButton";

type Props = {
  localEncoding: UseSimulcastLocalEncoding;
  disabled?: boolean;
};

export const SimulcastEncodingToSend: FC<Props> = ({ localEncoding, disabled }: Props) => {
  const { highQuality, toggleHighQuality, mediumQuality, toggleMediumQuality, lowQuality, toggleLowQuality } =
    localEncoding;

  return (
    <div className="absolute top-0 right-0 z-50 flex flex-row rounded-bl-xl bg-white/80 px-4 py-2 text-sm text-gray-700  md:text-base">
      <div>Encodings to send</div>
      <LayerButton
        selected={highQuality}
        disabled={disabled}
        text="H"
        onClick={() => toggleHighQuality()}
        tooltipText={highQuality ? "Disable High" : "Enable High"}
        tooltipCss="right-10"
      />
      <LayerButton
        selected={mediumQuality}
        disabled={disabled}
        text="M"
        onClick={() => toggleMediumQuality()}
        tooltipText={mediumQuality ? "Disable Medium" : "Enable Medium"}
        tooltipCss="right-10"
      />
      <LayerButton
        selected={lowQuality}
        disabled={disabled}
        text="L"
        onClick={() => toggleLowQuality()}
        tooltipText={lowQuality ? "Disable Low" : "Enable Low"}
        tooltipCss="right-10"
      />
    </div>
  );
};
