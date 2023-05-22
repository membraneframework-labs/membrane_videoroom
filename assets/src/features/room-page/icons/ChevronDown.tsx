import clsx from "clsx";
import React from "react";

const ChevronDown: React.FC<React.SVGAttributes<SVGElement>> = (props) => {
  return (
    <svg
      width="1em"
      height="1em"
      viewBox="0 0 19 11"
      fill="none"
      stroke="currentColor"
      xmlns="http://www.w3.org/2000/svg"
      className={clsx("inline-block", props.className)}
      {...props}
    >
      <path
        d="M1.41309 1.62488L9.41309 9.62488L17.4131 1.62488"
        stroke="#001A72"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
};

export default ChevronDown;
