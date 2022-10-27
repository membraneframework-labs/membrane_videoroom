import React, { FC } from "react";

type Props = {
  topLeft?: JSX.Element;
  topRight?: JSX.Element;
  bottomLeft?: JSX.Element;
  bottomRight?: JSX.Element;
};

type Corner = {
  x: "left" | "right";
  y: "top" | "bottom";
  content?: JSX.Element;
};

const PeerInfoLayer: FC<Props> = ({ topLeft, topRight, bottomLeft, bottomRight }: Props) => {
  const corners: Corner[] = [
    { x: "left", y: "top", content: topLeft },
    { x: "right", y: "top", content: topRight },
    { x: "left", y: "bottom", content: bottomLeft },
    { x: "right", y: "bottom", content: bottomRight },
  ];

  return (
    <>
      {corners.map((corner) => (
        <div
          key={`${corner.x}-${corner.y}`}
          data-name="video-label"
          className={`absolute text-white text-shadow-lg ${corner.x}-0 ${corner.y}-0 p-2`}
        >
          {corner.content}
        </div>
      ))}
    </>
  );
};

export default PeerInfoLayer;
