import clsx from "clsx";
import React from "react";
import Info from "../../leaving-page/icons/Info";

type InputType = "text"; // add other types if needed

type InputProps = {
  value?: string;
  onChange?: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  name?: string;
  type?: InputType;
  placeholder?: string;
  label?: string;
  additionalText?: string;
  required?: boolean;
  disabled?: boolean;
  error?: boolean;
  disableAutocomplete?: boolean;
  className?: string;
};

const Input: React.FC<InputProps> = ({
  value,
  onChange,
  type,
  placeholder,
  label,
  name,
  additionalText,
  required,
  disabled,
  error,
  disableAutocomplete = true,
  className,
}) => {
  return (
    <div className="w-full space-y-2 font-aktivGrotesk">
      {label && (
        <label htmlFor={name} className="block text-base text-brand-dark-blue-500">
          {label}
        </label>
      )}
      <input
        id={name}
        value={value}
        onChange={onChange}
        className={clsx(
          "w-full px-3.5 py-3",
          "rounded-[40px] border-2 text-brand-dark-blue-500 focus:outline-none",
          error
            ? "border-brand-red"
            : disabled
            ? "border-brand-grey-60 bg-white text-brand-grey-80"
            : "border-brand-dark-blue-500 hover:border-brand-sea-blue-400 focus:border-brand-sea-blue-400",
          "appearance-none",
          className
        )}
        name={name}
        type={type}
        placeholder={placeholder}
        required={required}
        disabled={disabled}
        autoComplete={disableAutocomplete ? "off" : "on"}
      />
      {additionalText && (
        <div className='flex gap-1 items-center text-xm'>
        <Info className={clsx(error ? "stroke-brand-red" : "stroke-brand-dark-blue-500")}/>
        <span
          className={clsx(
            "block text-sm",
            disabled ? "text-brand-grey-80" : error ? "text-brand-red" : "text-brand-dark-blue-500"
          )}
        >
          {additionalText}
        </span>
        </div>
      )}
    </div>
  );
};

export default Input;
