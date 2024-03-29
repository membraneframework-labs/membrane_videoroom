import clsx from "clsx";
import React from "react";

const HangUp: React.FC<React.SVGAttributes<SVGElement>> = (props) => {
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
      <path
        d="M2.44463 14.3553L4.08008 15.9907C4.34082 16.2647 4.69335 16.4332 5.07069 16.464C6.13463 16.5509 8.17814 15.2434 8.70094 14.4379C9.1084 13.8101 8.95087 12.928 8.95154 12.2205C11.0952 11.6291 13.3575 11.6268 15.5 12.2141C15.4993 12.9216 15.3399 13.8039 15.7462 14.431C16.2666 15.2342 18.2989 16.5314 19.3608 16.4505C19.7343 16.422 20.085 16.2587 20.3475 15.991L21.9862 14.3522C22.6101 13.7273 22.5695 12.6477 21.8848 12.0768C16.4777 6.66114 7.98875 6.62194 2.54513 12.0741C1.85695 12.6484 1.81688 13.7326 2.44463 14.3553Z"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
};

export default HangUp;
