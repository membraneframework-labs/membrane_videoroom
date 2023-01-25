import React from "react";
import MembraneLogo from "../features/shared/components/MembraneLogo";

export default {
  title: "components/shared/MembraneLogo",
  component: MembraneLogo,
};

export const Normal = () => {
  return <MembraneLogo />;
};

export const Big = () => {
  return <MembraneLogo className="text-5xl" />;
};

export const Custom = () => {
  return <MembraneLogo className="scale-x-[-1] text-6xl" />;
};
