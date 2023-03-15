import clsx from "clsx";
import React, { FC } from "react";
import ReactSelect from "react-select";

type Props = Omit<React.ComponentProps<typeof ReactSelect>, "onChange"> & {
  onChange?: (value: string) => void;
  controlClassName?: string;
};

type Option = {
  value: string;
  label: string;
};

export const Select: FC<Props> = ({ onChange, controlClassName, ...otherProps }) => {
  const optionClassName = clsx("px-4 py-3.5 hover:bg-brand-dark-blue-100 focus-within:bg-brand-dark-blue-100");
  const menuClassName = clsx(
    "max-h-40 rounded-3xl border-brand-dark-blue-200 border-2 overflow-y-auto bg-brand-white flex flex-col "
  );

  return (
    <ReactSelect
      unstyled
      classNamePrefix="react-select"
      styles={{
        menu: (base) => {
          return {
            ...base,
            top: "calc(100% + 11px)",
          };
        },
      }}
      classNames={{
        control: () => controlClassName ?? "",
        option: () => optionClassName,
        menu: () => menuClassName ?? "",
      }}
      onChange={(option) => onChange?.call(null, (option as Option).value)}
      {...otherProps}
    />
  );
};
