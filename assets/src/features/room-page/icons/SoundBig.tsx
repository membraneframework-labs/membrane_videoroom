import clsx from "clsx";
import React from "react";

const SoundBig: React.FC<React.SVGAttributes<SVGElement>> = (props) => {
  return (
    <svg
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="currentColor"
      xmlns="http://www.w3.org/2000/svg"
      className={clsx("inline-block", props.className)}
      {...props}
    >
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M7 19C6.44772 19 6 18.5523 6 18V6C6 5.44771 6.44772 5 7 5C7.55228 5 8 5.44771 8 6V18C8 18.5523 7.55228 19 7 19Z"
      />
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M12 22C11.4477 22 11 21.5523 11 21L11 3C11 2.44772 11.4477 2 12 2C12.5523 2 13 2.44772 13 3L13 21C13 21.5523 12.5523 22 12 22Z"
      />
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M17 16C16.4477 16 16 15.5523 16 15L16 9C16 8.44772 16.4477 8 17 8C17.5523 8 18 8.44772 18 9V15C18 15.5523 17.5523 16 17 16Z"
      />
    </svg>
  );
};

export default SoundBig;
