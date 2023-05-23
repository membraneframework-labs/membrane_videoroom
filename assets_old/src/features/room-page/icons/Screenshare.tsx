import clsx from "clsx";
import React from "react";

const Screenshare: React.FC<React.SVGAttributes<SVGElement>> = (props) => {
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
      <path d="M16 10.5H8" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M13 13.5L16 10.5L13 7.5" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M16 20H12H8" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M12 20V16" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      <path
        d="M19 5H5C4.44772 5 4 5.44771 4 6V15C4 15.5523 4.44772 16 5 16H12H19C19.5523 16 20 15.5523 20 15V6C20 5.44772 19.5523 5 19 5Z"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
};

export default Screenshare;
