import React, { FC } from "react";

export type CheckboxProps = {
  label: string;
  id: string;
  status: boolean;
  onChange: () => void;
  disabled?: boolean;
};

export const Checkbox: FC<CheckboxProps> = ({ label, id, status, onChange, disabled }: CheckboxProps) => {
  return (
    <div className="form-check flex items-center justify-center gap-x-1">
      <label className="form-check-label font-aktivGrotesk text-sm text-brand-dark-blue-500" htmlFor={id}>
        {label}
      </label>
      <input
        onChange={onChange}
        disabled={disabled}
        className="form-check-input"
        type="checkbox"
        checked={status}
        id={id}
        name={id}
      />
    </div>
  );
};
