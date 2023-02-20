import React, { FC } from "react";
import { SimulcastReceivingEncoding } from "./SimulcastReceivingEncoding";
import { SimulcastEncodingToReceive } from "./SimulcastEncodingToReceive";
import { TrackEncoding } from "@jellyfish-dev/membrane-webrtc-js";

type Props = {
  targetEncoding: TrackEncoding | null;
  setTargetEncoding: (encoding: TrackEncoding) => void;
  smartEncoding: TrackEncoding | null;
  localSmartEncodingStatus: boolean;
  setLocalSmartEncodingStatus: (value: boolean) => void;
  globalSmartEncodingStatus: boolean;
  tileSizeEncoding: TrackEncoding | null;
  currentEncoding?: TrackEncoding;
  disabled: boolean;
};

export const SimulcastRemoteLayer: FC<Props> = ({
  currentEncoding,
  targetEncoding,
  setTargetEncoding,
  disabled,
  tileSizeEncoding,
  setLocalSmartEncodingStatus,
  localSmartEncodingStatus,
  globalSmartEncodingStatus,
  smartEncoding,
}: Props) => {
  return (
    <>
      <SimulcastReceivingEncoding encoding={currentEncoding} />
      <SimulcastEncodingToReceive
        disabled={disabled}
        targetEncoding={targetEncoding}
        tileSizeEncoding={tileSizeEncoding}
        smartEncoding={smartEncoding}
        localSmartEncodingStatus={localSmartEncodingStatus}
        setLocalSmartEncodingStatus={setLocalSmartEncodingStatus}
        globalSmartEncodingStatus={globalSmartEncodingStatus}
        setTargetEncoding={setTargetEncoding}
      />
    </>
  );
};
