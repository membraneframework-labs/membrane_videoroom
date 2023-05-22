import React, { FC } from "react";
import clsx from "clsx";

type Props = {
  topLeft?: JSX.Element | null;
  topRight?: JSX.Element | null;
  bottomLeft?: JSX.Element | null;
  bottomRight?: JSX.Element | null;
  tileSize?: "M" | "L";
};

type Corner = {
  x: "left-0" | "right-0";
  y: "top-0" | "bottom-0";
  content?: JSX.Element | null;
};

const PeerInfoLayer: FC<Props> = ({ topLeft, topRight, bottomLeft, bottomRight, tileSize = "L" }: Props) => {
  const corners: Corner[] = [
    { x: "left-0", y: "top-0", content: topLeft },
    { x: "right-0", y: "top-0", content: topRight },
    { x: "left-0", y: "bottom-0", content: bottomLeft },
    { x: "right-0", y: "bottom-0", content: bottomRight },
  ];
  const paddingClassName = { M: "p-3", L: "p-4" };

  return (
    <>
      {corners.map((corner) => (
        <div
          key={`${corner.x}-${corner.y}`}
          data-name="video-label"
          className={clsx(`absolute text-white ${corner.x} ${corner.y}`, paddingClassName[tileSize])}
        >
          {corner.content}
        </div>
      ))}
    </>
  );
};

export default PeerInfoLayer;
