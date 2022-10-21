import React, { FC } from "react";

export interface Props {
  topLeft?: JSX.Element;
  topRight?: JSX.Element;
  bottomLeft?: JSX.Element;
  bottomRight?: JSX.Element;
}

const PeerInfoLayer: FC<Props> = ({ topLeft, topRight, bottomLeft, bottomRight }: Props) => {
  return (
    <>
      {topLeft && (
        <div data-name="video-label" className="absolute text-white text-shadow-lg top-0 left-0 p-2">
          {topLeft}
        </div>
      )}
      {topRight && (
        <div data-name="video-label" className="absolute text-white text-shadow-lg top-0 right-0 p-2">
          {topRight}
        </div>
      )}
      {bottomLeft && (
        <div data-name="video-label" className="absolute text-white text-shadow-lg bottom-0 left-0 p-2">
          {bottomLeft}
        </div>
      )}
      {bottomRight && (
        <div data-name="video-label" className="absolute text-white text-shadow-lg bottom-0 right-0 p-2">
          {bottomRight}
        </div>
      )}
    </>
  );
};

export default PeerInfoLayer;
