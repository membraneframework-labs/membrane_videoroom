import React from "react";
import MembraneVideoroomLogo from "../features/shared/components/MembraneVideoroomLogo";

export default {
  title: "components/shared/MembraneVideoroomLogo",
  component: MembraneVideoroomLogo,
};

export const Normal = () => {
  return <MembraneVideoroomLogo />;
};

export const Big = () => {
  return <MembraneVideoroomLogo className="text-5xl" />;
};

export const Custom = () => {
  return <MembraneVideoroomLogo className="scale-x-[-1] text-6xl" />;
};
