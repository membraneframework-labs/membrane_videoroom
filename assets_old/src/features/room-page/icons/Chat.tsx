import clsx from "clsx";
import React from "react";

const Chat: React.FC<React.SVGAttributes<SVGElement>> = (props) => {
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
      <path d="M20 4H4V20H20V4Z" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M7 8H17" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M7 12H17" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M7 16H13" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
};

export default Chat;
