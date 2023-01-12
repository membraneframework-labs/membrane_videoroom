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
  //TODO prevent defualt when onclick and href
  if (href?.startsWith("http://") || href?.startsWith("https://")) {
    return (
      <a target="_blank" rel="noreferrer noopeer" href={href} className={clsx(className)} aria-label={name}>
        {children}
      </a>
    );
  }

  // internal links
  return (
    <Link onClick={onClick} to={href || ""} id={name} className={className}>
      {children}
    </Link>
  );
};

export default PlainLink;
