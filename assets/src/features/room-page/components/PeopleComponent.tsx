import clsx from "clsx";
import React from "react";
import { LocalPeer, RemotePeer } from "../../../pages/room/hooks/usePeerState";
import { computeInitials } from "./InitialsImage";

type PeopleComponentProps = {
  peers: RemotePeer[];
  localPeer?: LocalPeer;
};

type PeopleListItem = {
  peerId: string;
  displayName: string;
  initials: string;
};

const mapRemotePeersToPeopleLstItem = (peers: RemotePeer[]): PeopleListItem[] => {
  return peers.map((peer) => ({
    peerId: peer.id ?? "Unknown",
    displayName: peer.displayName || "",
    initials: computeInitials(peer?.displayName || ""),
  }));
};

const PeopleComponent: React.FC<PeopleComponentProps> = ({ peers, localPeer }) => {
  const localUser: PeopleListItem = {
    peerId: localPeer?.id ?? "Unknown",
    displayName: `${localPeer?.metadata?.displayName} (You)` || "",
    initials: computeInitials(localPeer?.metadata?.displayName || ""),
  };
  const allPeers: PeopleListItem[] = [localUser, ...mapRemotePeersToPeopleLstItem(peers)];

  return (
    <div className={clsx("flex flex-col gap-y-4")}>
      {allPeers.map((peer) => (
        <div key={peer.peerId} className="flex items-center gap-x-3">
          <div className="rounded-full border border-brand-dark-blue-200 p-1.5 text-sm text-brand-dark-blue-400">
            {peer.initials}
          </div>
          <div className="max-w-6 truncate">{peer.displayName}</div>
        </div>
      ))}
    </div>
  );
};
export default PeopleComponent;
