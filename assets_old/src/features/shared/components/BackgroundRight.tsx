import clsx from "clsx";
import React from "react";

const BackgroundRight: React.FC<React.SVGAttributes<SVGElement>> = (props) => {
  const { className, ...otherProps } = props;

  return (
    <svg
      width="638"
      height="1002"
      viewBox="0 0 638 1002"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={clsx("inline-block", className)}
      {...otherProps}
    >
      <rect width="636.667" height="1001.1" transform="translate(0.568848)" />
      <rect
        width="170.639"
        height="447.824"
        rx="85.3196"
        transform="matrix(0.866025 0.5 -0.504923 0.863164 360.317 0)"
        fill="#675AF1"
      />
      <path
        d="M205.895 366.442C229.248 326.483 280.672 312.849 320.754 335.991C360.836 359.132 374.398 410.285 351.045 450.244L262.831 601.186C239.478 641.145 188.054 654.779 147.972 631.638C107.89 608.496 94.3281 557.343 117.681 517.384L205.895 366.442Z"
        stroke="white"
        strokeWidth="3"
      />
      <ellipse cx="597.81" cy="522.225" rx="39.4256" ry="38.1806" fill="#A69EFA" />
      <rect
        width="170.634"
        height="454.404"
        rx="85.317"
        transform="matrix(0.866025 0.5 -0.504871 0.863195 349.949 523.545)"
        fill="#46ADD8"
      />
      <ellipse cx="67.3849" cy="729.517" rx="66.816" ry="65.571" fill="#87CCE8" />
    </svg>
  );
};

export default BackgroundRight;
