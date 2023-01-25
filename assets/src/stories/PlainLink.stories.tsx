import React from "react";
import PlainLink from "../features/shared/components/PlainLink";

export default {
  title: "components/shared/PlainLink",
  component: PlainLink,
};

export const Normal = () => {
  return <PlainLink href="https://videoroom.membrane.stream/">Membrane Videoroom</PlainLink>;
};

export const Custom = () => {
  return (
    <PlainLink href="https://videoroom.membrane.stream/" className="underline hover:text-brand-sea-blue-500">
      Membrane Videoroom
    </PlainLink>
  );
};
