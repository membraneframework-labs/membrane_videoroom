import clsx from "clsx";
import React, { useState } from "react";
import { LocalPeer, RemotePeer } from "../../../pages/room/hooks/usePeerState";
import Chat from "./Chat";
import PeopleComponent from "./PeopleComponent";
import SidebarTab, { Tab } from "./SidebarTab";

type SidebarProps = {
  peers: RemotePeer[];
  localPeer?: LocalPeer;
};

const Sidebar: React.FC<SidebarProps> = ({ peers, localPeer }) => {
  const [tab, setTab] = useState<Tab>("people");

  return (
    <div
      className={clsx(
        "border border-brand-dark-blue-300 bg-brand-white",
        "rounded-xl",
        "grid-wrapper flex w-[300px] flex-col",
        "whitespace-nowrap font-aktivGrotesk"
      )}
    >
      <div className="flex w-full gap-x-3 p-3">
        <SidebarTab activeTab={tab} tab="chat" onClick={setTab}>
          Chat
        </SidebarTab>
        <SidebarTab activeTab={tab} tab="people" onClick={setTab}>
          {`People (${peers.length + 1})`}
        </SidebarTab>
      </div>

      <div className="w-full border-[0.5px] border-brand-dark-blue-300"></div>

      <div className={clsx("w-full overflow-y-auto p-3 pt-6")}>
        {tab == "chat" ? <Chat /> : <PeopleComponent peers={peers} localPeer={localPeer} />}
      </div>
    </div>
  );
};

export default Sidebar;
