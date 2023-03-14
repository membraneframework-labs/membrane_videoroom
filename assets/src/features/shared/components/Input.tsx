import clsx from "clsx";
import React from "react";

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
        value={value}
        onChange={onChange}
        className={clsx(
          "w-full px-3.5 py-3",
          "rounded-[40px] border-2 text-brand-dark-blue-500 focus:outline-none",
          error
            ? "border-brand-red"
            : disabled
            ? "border-brand-grey-60 bg-white text-brand-grey-80"
            : "border-brand-dark-blue-500 focus:border-brand-sea-blue-400",
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
        <span
          className={clsx(
            "block text-sm",
            disabled ? "text-brand-grey-80" : error ? "text-brand-red" : "text-brand-dark-blue-500"
          )}
        >
          {additionalText}
        </span>
      )}
    </div>
  );
};

export default Input;
