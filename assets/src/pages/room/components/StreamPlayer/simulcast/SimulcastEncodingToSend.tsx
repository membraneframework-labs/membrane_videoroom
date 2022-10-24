import React, { FC, useEffect, useState } from "react";
import { useToggle } from "../../../hooks/useToggle";
import { UseSimulcastLocalEncoding } from "../../../hooks/useSimulcastSend";
import { SimulcastQuality } from "../../../hooks/useSimulcastRemoteEncoding";

type Props = {
  localEncoding: UseSimulcastLocalEncoding;
  enableTrackEncoding: (encoding: SimulcastQuality) => void;
  disableTrackEncoding: (encoding: SimulcastQuality) => void;
};

function useToggleLocalEncodingQuality(
  encoding: SimulcastQuality,
  value: boolean,
  enableTrackEncoding: (encoding: SimulcastQuality) => void,
  disableTrackEncoding: (encoding: SimulcastQuality) => void
) {
  useEffect(() => {
    if (value) {
      enableTrackEncoding(encoding);
    } else {
      disableTrackEncoding(encoding);
    }
  }, [value, enableTrackEncoding, disableTrackEncoding, encoding]);
}

export const SimulcastEncodingToSend: FC<Props> = ({
  localEncoding,
  enableTrackEncoding,
  disableTrackEncoding,
}: Props) => {
  const { highQuality, toggleHighQuality, mediumQuality, toggleMediumQuality, lowQuality, toggleLowQuality } =
    localEncoding;

  // useToggleLocalEncodingQuality("h", highQuality, enableTrackEncoding, disableTrackEncoding);
  // useToggleLocalEncodingQuality("m", mediumQuality, enableTrackEncoding, disableTrackEncoding);
  // useToggleLocalEncodingQuality("l", lowQuality, enableTrackEncoding, disableTrackEncoding);

  // todo block form if track is not active
  return (
    <div className="absolute text-sm md:text-base text-gray-700 opacity-80 bg-white bottom-0 right-0 p-2 z-50">
      <label>Encodings to send</label>
      <ul>
        <li>
          <input
            // disabled={true}
            type="checkbox"
            name="h"
            checked={highQuality}
            onChange={() => {
              // todo fix
              toggleHighQuality();
              if (highQuality) {
                disableTrackEncoding("h");
              } else {
                enableTrackEncoding("h");
              }
            }}
          />
          High
        </li>
        <li>
          <input
            type="checkbox"
            name="m"
            checked={mediumQuality}
            onChange={() => {
              // todo fix
              toggleMediumQuality();
              if (mediumQuality) {
                disableTrackEncoding("m");
              } else {
                enableTrackEncoding("m");
              }
            }}
          />{" "}
          Medium
        </li>
        <li>
          <input
            type="checkbox"
            name="l"
            checked={lowQuality}
            onChange={() => {
              // todo fix
              toggleLowQuality();
              if (lowQuality) {
                disableTrackEncoding("l");
              } else {
                enableTrackEncoding("l");
              }
            }}
          />{" "}
          Low
        </li>
      </ul>
    </div>
  );
};
