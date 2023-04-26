import React, { SyntheticEvent, useCallback, useEffect, useState } from "react";

type DetailsProps = {
  summaryText: string;
  children: React.ReactNode;
  isOpen: boolean;
  toggle: () => void;
};

const Details = ({ summaryText, children, isOpen, toggle }: DetailsProps) => {
  const [isMounted, setMount] = useState<boolean>(false);

  const notBubblingToggle = useCallback(
    (e: SyntheticEvent) => {
      e.stopPropagation();
      isMounted && toggle();
    },
    [isMounted, toggle]
  );

  useEffect(() => {
    setMount(true);
  }, []);

  return (
    <details onToggle={notBubblingToggle} open={isOpen}>
      <summary>{summaryText}</summary>
      {children}
    </details>
  );
};

export default Details;
