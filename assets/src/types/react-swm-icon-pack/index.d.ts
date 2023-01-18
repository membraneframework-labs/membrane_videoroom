declare module "react-swm-icon-pack" {
  import { FC } from "react";

  type IconProps = {
    color: string;
    strokeWidth: string | number;
    size: string | number;
    set: "broken" | "curved" | "duotone" | "outline";
  };

  export type Icon = FC<Partial<IconProps> & React.HTMLAttributes<HTMLDivElement>>;
}
