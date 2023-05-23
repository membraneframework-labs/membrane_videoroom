import React from "react";

export const computeInitials = (name: string): string => {
  return name
    .split(" ")
    .map((word) => word.charAt(0))
    .join("")
    .toLocaleUpperCase();
};

type InitialsImageProps = {
  initials: string;
};

const InitialsImage = ({ initials }: InitialsImageProps) => {
  return (
    <div className="absolute flex h-full w-full flex-wrap content-center justify-center bg-brand-sea-blue-100">
      <div className="flex h-32 w-32 flex-wrap content-center justify-center rounded-full border border-brand-dark-blue-200">
        <span className="font-roc-grotesk text-lg font-medium text-brand-dark-blue-400">{initials}</span>
      </div>
    </div>
  );
};

export default InitialsImage;
