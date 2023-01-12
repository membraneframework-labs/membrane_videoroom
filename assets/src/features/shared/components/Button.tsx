import clsx from "clsx";
import React from "react";
import PlainLink, { PlainLinkProps } from "./PlainLink";

const Button: React.FC<PlainLinkProps> = (props) => {
  return (
    <PlainLink {...props} className={clsx(props.disabled && "btn-disabled", props.className)}>
      {props.children}
    </PlainLink>
  );
};

export default Button;
