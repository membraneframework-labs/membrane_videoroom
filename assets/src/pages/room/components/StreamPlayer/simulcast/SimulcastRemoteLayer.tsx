import React, { FC } from "react";
import { SimulcastReceivingEncoding } from "./SimulcastReceivingEncoding";
import { SimulcastEncodingToReceive } from "./SimulcastEncodingToReceive";
import { TrackEncoding } from "@jellyfish-dev/membrane-webrtc-js";

type Props = {
  targetEncoding: TrackEncoding | null;
  setTargetEncoding: (encoding: TrackEncoding) => void;
  smartEncoding: TrackEncoding | null;
  smartEncodingStatus: boolean;
  setSmartEncodingStatus: (value: boolean) => void;
  tileSizeEncoding: TrackEncoding | null;
  currentEncoding?: TrackEncoding;
  disabled?: boolean;
};

export const SimulcastRemoteLayer: FC<Props> = ({
  currentEncoding,
  targetEncoding,
  setTargetEncoding,
  disabled,
  tileSizeEncoding,
  setSmartEncodingStatus,
  smartEncodingStatus,
  smartEncoding,
}: Props) => {
  return (
    <>
      <SimulcastReceivingEncoding encoding={currentEncoding} />
      <SimulcastEncodingToReceive
        disabled={disabled}
        targetEncoding={targetEncoding}
        setSmartEncodingStatus={setSmartEncodingStatus}
        tileSizeEncoding={tileSizeEncoding}
        smartEncoding={smartEncoding}
        smartEncodingStatus={smartEncodingStatus}
        setTargetEncoding={setTargetEncoding}
      />
    </>
  );
};
