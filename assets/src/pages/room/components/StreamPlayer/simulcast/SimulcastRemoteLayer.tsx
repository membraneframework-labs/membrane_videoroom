import React, { FC } from "react";
import { SimulcastReceivingEncoding } from "./SimulcastReceivingEncoding";
import { SimulcastEncodingToReceive } from "./SimulcastEncodingToReceive";
import { TrackEncoding } from "@jellyfish-dev/membrane-webrtc-js";

type Props = {
  setTargetEncoding: (encoding: TrackEncoding | null) => void;
  currentEncoding?: TrackEncoding;
  targetEncoding: TrackEncoding | null;
  userSelectedEncoding: TrackEncoding | null;
  disabled?: boolean;
};

export const SimulcastRemoteLayer: FC<Props> = ({
  currentEncoding,
  targetEncoding,
  userSelectedEncoding,
  setTargetEncoding,
  disabled,
}: Props) => {
  return (
    <>
      <SimulcastReceivingEncoding encoding={currentEncoding} />
      <SimulcastEncodingToReceive
        targetEncoding={targetEncoding}
        userSelectedEncoding={userSelectedEncoding}
        setTargetEncoding={setTargetEncoding}
        disabled={disabled}
      />
    </>
  );
};
