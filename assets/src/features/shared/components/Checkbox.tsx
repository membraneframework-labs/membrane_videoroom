import React, { FC } from "react";

export type CheckboxProps = {
  label: string;
  id: string;
  status: boolean;
  onChange: () => void;
};

export const Checkbox: FC<CheckboxProps> = ({ label, id, status, onChange }: CheckboxProps) => {
  return (
    <div className="form-check flex items-center gap-x-1">
      <label className="form-check-label text-sm text-brand-dark-blue-500 font-aktivGrotesk" htmlFor={id}>
        {label}
      </label>
      <input onChange={onChange} className="form-check-input" type="checkbox" checked={status} id={id} name={id} />
    </div>
  );
};
