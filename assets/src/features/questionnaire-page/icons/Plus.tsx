import clsx from "clsx";
import React from "react";

const Plus: React.FC<React.SVGAttributes<SVGElement>> = (props) => {
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
      <path d="M4 12H9" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M12 12H20" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M12 4V20" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
};

export default Plus;
