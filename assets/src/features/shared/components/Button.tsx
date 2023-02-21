import clsx from "clsx";
import React from "react";
import PlainLink, { PlainLinkProps } from "./PlainLink";

type ButtonVariant = "normal" | "light" | "transparent" | "transparent-light";

type ButtonProps = PlainLinkProps & { variant?: ButtonVariant };

const Button: React.FC<ButtonProps> = (props) => {
  return (
    <PlainLink
      {...props}
      className={clsx(
        props.variant && buttonDefaultClassName,
        props.disabled ? disabledButtonClassName : props.variant && BUTTON_CLASSES[props.variant],
        props.className
      )}
    >
      {props.children}
    </PlainLink>
  );
};

export default Button;

const buttonDefaultClassName = clsx(
  "inline-block whitespace-nowrap text-center",
  "font-medium text-lg font-aktivGrotesk",
  "px-8 py-3",
  "rounded-full"
);

const normalButtonClassName = clsx(
  "bg-brand-dark-blue-500 text-brand-white hover:bg-brand-white hover:text-brand-dark-blue-500 focus:bg-brand-dark-blue-400",
  "border-2 border-solid border-brand-dark-blue-500 focus:border-brand-dark-blue-400",
  "transition-all duration-100 ease-out"
);
const lightButtonClassName = clsx(
  "bg-brand-white text-brand-dark-blue-500 hover:bg-brand-dark-blue-500 hover:text-brand-white focus:bg-brand-dark-blue-200",
  "border-2 border-solid focus:border-brand-dark-blue-200 border-brand-white",
  "transition-all duration-100 ease-out"
);

const transparentButtonClassName = clsx(
  "bg-transparent text-brand-dark-blue-500 hover:bg-transparent hover:text-brand-dark-blue-500 focus:!bg-transparent focus:!text-brand-dark-blue-500",
  "border-none"
);

const transparentLightButtonClassName = clsx(
  "bg-transparent text-brand-white hover:bg-transparent hover:text-brand-white focus:!bg-transparent focus:!text-brand-white",
  "border-none"
);

const disabledButtonClassName = clsx(
  "bg-brand-grey-60 text-brand-white",
  "border-2 border-solid border-brand-grey-60",
  "pointer-events-none cursor-default"
);

const BUTTON_CLASSES: Record<ButtonVariant, string> = {
  normal: normalButtonClassName,
  light: lightButtonClassName,
  transparent: transparentButtonClassName,
  "transparent-light": transparentLightButtonClassName,
};
