import clsx from "clsx";
import React from "react";

const PhoneCall: React.FC<React.SVGAttributes<SVGElement>> = (props) => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="1em"
      height="1em"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      className={clsx("inline-block", props.className)}
      {...props}
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M3 5a2 2 0 012-2h9.489A1.5 1.5 0 0115 4.5V9l4 2-4 2v4.5a1.5 1.5 0 01-1.511 1.5H5a2 2 0 01-2-2V5z"
      />
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10h.01" />
    </svg>
  );
};
export default PhoneCall;
