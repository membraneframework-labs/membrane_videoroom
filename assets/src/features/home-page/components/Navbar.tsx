import React from "react";
import HorizontalContourBlueLogo from "../../shared/icons/logos/HorizontalContourBlueLogo";
import PlainLink from "../../shared/components/PlainLink";

const Navbar: React.FC = () => {
  return (
    <PlainLink href="/" name="home-page" reload className="self-start">
      <HorizontalContourBlueLogo className="text-5xl" />
    </PlainLink>
  );
};

export default Navbar;
