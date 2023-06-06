import clsx from "clsx";
import React, { useCallback } from "react";
import { Link } from "react-router-dom";
import noop from "../utils/noop";

export type PlainLinkProps = {
  children?: React.ReactNode;
  href?: string;
  onClick?: (e: React.SyntheticEvent) => void | boolean | Promise<void>;
  disabled?: boolean;
  className?: string;
  type?: "button" | "submit" | "reset";
  name?: string;
  button?: boolean;
  reload?: boolean;
};
const PlainLink: React.FC<PlainLinkProps> = ({ href, className, name, children, onClick, disabled, reload, type }) => {
  const onClickInner = useCallback(
    (e: React.SyntheticEvent) => (disabled ? noop() : onClick?.(e)),
    [disabled, onClick]
  );

  const hrefInner = disabled || !href ? "" : href;

  // only onClick
  if (onClick && !href) {
    return (
      <button onClick={onClickInner} className={clsx(className)} aria-label={name} type={type}>
        {children}
      </button>
    );
  }

  // external links
  if (href?.startsWith("http://") || href?.startsWith("https://")) {
    return (
      <a
        target="_blank"
        rel="noreferrer"
        href={hrefInner}
        className={clsx(className)}
        aria-label={name}
        onClick={onClickInner}
        type={type}
      >
        {children}
      </a>
    );
  }

  // internal links
  return (
    <Link onClick={onClickInner} reloadDocument={reload} to={hrefInner} id={name} className={className} type={type}>
      {children}
    </Link>
  );
};

export default PlainLink;
