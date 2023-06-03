import React, { SyntheticEvent, useCallback } from "react";
import { useToggle } from "../room/hooks/useToggle";

type DetailsProps = {
  summaryText: string;
  children: React.ReactNode;
  className?: string;
};

const Details = ({ summaryText, children, className }: DetailsProps) => {
  const [isOpen, toggle] = useToggle(false);

  const notBubblingToggle = useCallback(
    (e: SyntheticEvent) => {
      e.stopPropagation();
      toggle();
    },
    [toggle]
  );

  return (
    <details onToggle={notBubblingToggle} open={isOpen} className={className}>
      <summary>{summaryText}</summary>
      {isOpen && children}
    </details>
  );
};

export default Details;
