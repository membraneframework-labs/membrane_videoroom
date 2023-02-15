import React, { FC } from "react";
import { SimulcastReceivingEncoding } from "./SimulcastReceivingEncoding";
import { SimulcastEncodingToReceive } from "./SimulcastEncodingToReceive";
import { TrackEncoding } from "@jellyfish-dev/membrane-webrtc-js";

type Props = {
  setTargetEncoding: (encoding: TrackEncoding) => void;
  setUserSelectedEncoding: (encoding: TrackEncoding) => void;
  currentEncoding?: TrackEncoding;
  targetEncoding: TrackEncoding | null;
  userSelectedEncoding: TrackEncoding | "auto";
  disabled?: boolean;
};

export const SimulcastRemoteLayer: FC<Props> = ({
  currentEncoding,
  targetEncoding,
  userSelectedEncoding,
  setTargetEncoding,
  setUserSelectedEncoding,
  disabled,
}: Props) => {
  return (
    <>
      <SimulcastReceivingEncoding encoding={currentEncoding} />
      <SimulcastEncodingToReceive
        targetEncoding={targetEncoding}
        userSelectedEncoding={userSelectedEncoding}
        setUserSelectedEncoding={setUserSelectedEncoding}
        disabled={disabled}
        setTargetEncoding={setTargetEncoding}
      />
    </>
  );
};
