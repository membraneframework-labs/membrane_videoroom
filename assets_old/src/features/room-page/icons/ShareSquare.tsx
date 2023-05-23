import clsx from "clsx";
import React from "react";

const ShareSquare: React.FC<React.SVGAttributes<SVGElement>> = (props) => {
  return (
    <svg
      width="1em"
      height="1em"
      viewBox="0 0 20 20"
      fill="none"
      stroke="currentColor"
      xmlns="http://www.w3.org/2000/svg"
      className={clsx("inline-block", props.className)}
      {...props}
    >
      <path
        d="M14.5833 12.1667H15.8333C16.7538 12.1667 17.5 11.4205 17.5 10.5V4.66667C17.5 3.74619 16.7538 3 15.8333 3H10C9.07953 3 8.33333 3.74619 8.33333 4.66667V5.91667M4.16667 8.83333H10C10.9205 8.83333 11.6667 9.57953 11.6667 10.5V16.3333C11.6667 17.2538 10.9205 18 10 18H4.16667C3.24619 18 2.5 17.2538 2.5 16.3333V10.5C2.5 9.57953 3.24619 8.83333 4.16667 8.83333Z"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
};

export default ShareSquare;
