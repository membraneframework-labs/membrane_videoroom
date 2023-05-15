import clsx from "clsx";
import React from "react";

const Send: React.FC<React.SVGAttributes<SVGElement>> = (props) => {
  return (
    <svg
      width="1.5em"
      height="1.5em"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      xmlns="http://www.w3.org/2000/svg"
      className={clsx("inline-block", props.className)}
      {...props}
    >
<path d="M20 4L3 11L10 14L13 21L20 4Z" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
<path d="M20 4L10 14" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );
};

export default Send;
