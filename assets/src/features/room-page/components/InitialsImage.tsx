import clsx from "clsx";
import React from "react";

export const computeInitials = (name: string): string => {
  return name
    .split(" ")
    .map((word) => word.charAt(0))
    .join("")
    .toLocaleUpperCase();
};

export type InitialsCircleSize = "M" | "L";

type CircleProps = {
  initials: string;
  size?: InitialsCircleSize;
  borderColor?: string;
  className?: string;
};

export const InitialsCircle = ({
  initials,
  size = "L",
  borderColor = "border-brand-dark-blue-200",
  className,
}: CircleProps) => {
  const sizeClass = size === "L" ? "h-32 w-32" : "h-16 w-16";
  return (
    <div
      className={clsx(
        className,
        sizeClass,
        borderColor,
        "flex flex-wrap content-center justify-center rounded-full border"
      )}
    >
      <span className="font-roc-grotesk text-lg font-medium text-brand-dark-blue-400">{initials}</span>
    </div>
  );
};

type Props = {
  initials: string;
};

const InitialsImage = ({ initials }: Props) => (
  <div className="absolute flex h-full w-full flex-wrap content-center justify-center bg-brand-sea-blue-100">
    <InitialsCircle initials={initials} />
  </div>
);

export default InitialsImage;
