import React, { SyntheticEvent, useCallback } from "react";

type DetailsProps = {
  summaryText: string;
  children: React.ReactNode;
  isOpen: boolean;
  toggle: () => void;
};

const Details = ({ summaryText, children, isOpen, toggle }: DetailsProps) => {
  const notBubblingToggle = useCallback(
    (e: SyntheticEvent) => {
      e.stopPropagation();
      toggle();
    },
    [toggle]
  );

  return (
    <details onToggle={notBubblingToggle} open={isOpen}>
      <summary>{summaryText}</summary>
      {children}
    </details>
  );
};

export default Details;
