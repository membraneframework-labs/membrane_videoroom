import clsx from "clsx";
import React, { FC } from "react";
import { computeInitials } from "./InitialsImage";
import { useSelector } from "../../../jellifish.types";

type PeopleListItem = {
  peerId: string;
  displayName: string;
  initials: string;
};

const PeopleComponent: FC = () => {
  const localUser: PeopleListItem = useSelector((state) => ({
    peerId: state?.local?.id || "Unknown",
    displayName: `${state?.local?.metadata?.name} (You)` || "",
    initials: computeInitials(state?.local?.metadata?.name || ""),
  }));
  // const localUser: PeopleListItem = {
  //   peerId: "Unknown",
  //   displayName: "",
  //   initials: "",
  // };

  const remoteUsers: PeopleListItem[] = useSelector((state) =>
    Object.values(state.remote || {}).map((peer) => ({
      peerId: peer.id ?? "Unknown",
      displayName: peer.metadata?.name || "",
      initials: computeInitials(peer?.metadata?.name || ""),
    }))
  );

  // const remoteUsers: PeopleListItem[] = [];

  const allPeers: PeopleListItem[] = [localUser, ...remoteUsers];

  return (
    <div className={clsx("flex flex-col gap-y-4")}>
      {allPeers.map((peer) => (
        <div key={peer.peerId} className="flex items-center gap-x-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-full border border-brand-dark-blue-200 text-sm text-brand-dark-blue-400">
            {peer.initials}
          </div>
          <div className="max-w-6 truncate">{peer.displayName}</div>
        </div>
      ))}
    </div>
  );
};
export default PeopleComponent;
