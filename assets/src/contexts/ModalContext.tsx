import React, { useContext, useState } from "react";

export type ModalContextType = {
  setOpen: (value: boolean) => void;
  isOpen: boolean;
};

const ModelContext = React.createContext<ModalContextType | undefined>(undefined);

type Props = {
  children: React.ReactNode;
};

export const ModalProvider = ({ children }: Props) => {
  const [isOpen, setIsOpen] = useState<boolean>(false);

  return (
    <ModelContext.Provider value={{ setOpen: (value) => setIsOpen(value), isOpen }}>{children}</ModelContext.Provider>
  );
};

export const useModal = (): ModalContextType => {
  const context = useContext(ModelContext);
  if (!context) throw new Error("useModal must be used within a ModalProvider");
  return context;
};
