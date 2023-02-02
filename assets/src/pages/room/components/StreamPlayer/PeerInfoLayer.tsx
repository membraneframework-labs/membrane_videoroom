import React, { FC } from "react";
import clsx from "clsx";

type Props = {
  topLeft?: JSX.Element;
  topRight?: JSX.Element;
  bottomLeft?: JSX.Element;
  bottomRight?: JSX.Element;
  tileSize?: "M" | "L";
};

type Corner = {
  x: "left" | "right";
  y: "top" | "bottom";
  content?: JSX.Element;
};

const PeerInfoLayer: FC<Props> = ({ topLeft, topRight, bottomLeft, bottomRight, tileSize = "L" }: Props) => {
  const corners: Corner[] = [
    { x: "left", y: "top", content: topLeft },
    { x: "right", y: "top", content: topRight },
    { x: "left", y: "bottom", content: bottomLeft },
    { x: "right", y: "bottom", content: bottomRight },
  ];
  const paddingClassName = { M: "p-3", L: "p-4" };

  return (
    <>
      {corners.map((corner) => (
        <div
          key={`${corner.x}-${corner.y}`}
          data-name="video-label"
          className={clsx(`absolute text-white ${corner.x}-0 ${corner.y}-0`, paddingClassName[tileSize])}
        >
          {corner.content}
        </div>
      ))}
    </>
  );
};

export default PeerInfoLayer;
