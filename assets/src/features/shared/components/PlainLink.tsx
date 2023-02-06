import clsx from "clsx";
import React from "react";
import { Link } from "react-router-dom";

export type PlainLinkProps = {
  children?: React.ReactNode;
  href?: string;
  onClick?: (e: React.SyntheticEvent) => void | boolean | Promise<void>;
  disabled?: boolean;
  className?: string;
  name?: string;
  button?: boolean;
};
const PlainLink: React.FC<PlainLinkProps> = ({ href, className, name, children, onClick, disabled }) => {
  // only onClick
  if (onClick && !href) {
    return (
      <button onClick={disabled ? () => null : onClick} className={clsx(className)} aria-label={name}>
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
        href={disabled || !href ? "" : href}
        className={clsx(className)}
        aria-label={name}
        onClick={onClick}
      >
        {children}
      </a>
    );
  }

  // internal links
  return (
    <Link onClick={disabled ? () => null : onClick} to={disabled || !href ? "" : href} id={name} className={className}>
      {children}
    </Link>
  );
};

export default PlainLink;
