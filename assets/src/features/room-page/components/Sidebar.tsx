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
        "border-brand-dark-blue-300 bg-brand-white md:border",
        "rounded-t-2xl md:rounded-xl",
        "md:grid-wrapper absolute bottom-0 left-0 z-40 h-[480px] w-full flex-col md:relative md:z-auto md:flex md:h-full md:w-[300px] md:min-w-[300px]",
        "font-aktivGrotesk"
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
