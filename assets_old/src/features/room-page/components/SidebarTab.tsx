import clsx from "clsx";
import React from "react";
import Button from "../../shared/components/Button";

export type Tab = "chat" | "people";

type SidebarTabProps = {
  tab: Tab;
  onClick: (tab: Tab) => void;
  activeTab: Tab;
  children?: React.ReactNode;
};

const SidebarTab: React.FC<SidebarTabProps> = ({ onClick, tab, activeTab, children }) => {
  const isActive = tab == activeTab;
  return (
    <Button className={clsx(normalTabClassname, isActive && activeTabClassname)} onClick={() => onClick(tab)}>
      {children}
    </Button>
  );
};

export default SidebarTab;

const normalTabClassname = "w-full rounded-md py-2.5 text-center font-semibold";
const activeTabClassname = "bg-brand-dark-blue-400 text-brand-white";
