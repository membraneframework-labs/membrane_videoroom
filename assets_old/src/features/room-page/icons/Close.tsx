import clsx from "clsx";
import React from "react";

const Close: React.FC<React.SVGAttributes<SVGElement>> = (props) => {
  return (
    <svg
      width="1em"
      height="1em"
      viewBox="0 0 16 16"
      fill="currentColor"
      xmlns="http://www.w3.org/2000/svg"
      className={clsx("inline-block", props.className)}
      {...props}
    >
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M2.97971 2.97994C3.17497 2.78468 3.49155 2.78468 3.68681 2.97994L7.99993 7.29306L12.313 2.97994C12.5083 2.78468 12.8249 2.78468 13.0201 2.97994C13.2154 3.1752 13.2154 3.49179 13.0201 3.68705L8.70703 8.00016L13.0202 12.3133C13.2154 12.5085 13.2154 12.8251 13.0202 13.0204C12.8249 13.2157 12.5083 13.2157 12.3131 13.0204L7.99993 8.70727L3.68681 13.0204C3.49154 13.2157 3.17496 13.2157 2.9797 13.0204C2.78444 12.8251 2.78444 12.5085 2.9797 12.3133L7.29282 8.00016L2.97971 3.68705C2.78445 3.49179 2.78445 3.1752 2.97971 2.97994Z"
      />
    </svg>
  );
};

export default Close;
