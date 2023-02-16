import React, { FC } from "react";
import { SimulcastReceivingEncoding } from "./SimulcastReceivingEncoding";
import { SimulcastEncodingToReceive } from "./SimulcastEncodingToReceive";
import { TrackEncoding } from "@jellyfish-dev/membrane-webrtc-js";

type Props = {
  setTargetEncoding: (encoding: TrackEncoding) => void;
  currentEncoding?: TrackEncoding;
  targetEncoding: TrackEncoding | null;
  disabled?: boolean;
  tileSizeEncoding: TrackEncoding | null;
  enableSmartEncoding: boolean;
};

export const SimulcastRemoteLayer: FC<Props> = ({
  currentEncoding,
  targetEncoding,
  setTargetEncoding,
  disabled,
  tileSizeEncoding,
  enableSmartEncoding,
}: Props) => {
  return (
    <>
      <SimulcastReceivingEncoding encoding={currentEncoding} />
      <SimulcastEncodingToReceive
        enableSmartEncoding={enableSmartEncoding}
        targetEncoding={targetEncoding}
        disabled={disabled}
        setTargetEncoding={setTargetEncoding}
        tileSizeEncoding={tileSizeEncoding}
      />
    </>
  );
};
