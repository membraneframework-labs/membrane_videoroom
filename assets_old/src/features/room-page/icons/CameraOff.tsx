import clsx from "clsx";
import React from "react";

const CameraOff: React.FC<React.SVGAttributes<SVGElement>> = (props) => {
  return (
    <svg
      width="1em"
      height="1em"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      xmlns="http://www.w3.org/2000/svg"
      className={clsx("inline-block", props.className)}
      {...props}
    >
      <path
        d="M3 8V17.5C3 18.0523 3.44772 18.5 4 18.5H14"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path d="M3 3L21 21" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      <path
        d="M10 5.5H15C15.5523 5.5 16 5.94772 16 6.5V9V11"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path d="M21 17V7L16 9" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
};

export default CameraOff;
