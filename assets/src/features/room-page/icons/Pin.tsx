import clsx from "clsx";
import React from "react";

const Pin: React.FC<React.SVGAttributes<SVGElement>> = (props) => {
  return (
    <svg
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      xmlns="http://www.w3.org/2000/svg"
      className={clsx("inline-block", props.className)}
      {...props}
    >
      <path d="M20 8L16 4L7 9L15 17L20 8Z" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M11 12.9999L4.00003 19.9999" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
};

export default Pin;
