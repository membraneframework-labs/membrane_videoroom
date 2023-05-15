import clsx from "clsx";
import React from "react";

const Info: React.FC<React.SVGAttributes<SVGElement>> = (props) => {
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
      <path d="M12 7.00999L12 7" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M12 17L12 10" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      <path
        d="M12 21C16.9706 21 21 16.9706 21 12C21 7.02944 16.9706 3 12 3C7.02944 3 3 7.02944 3 12C3 16.9706 7.02944 21 12 21Z"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
};

export default Info;
