import React from "react";
import { LOCAL_PEER_NAME } from "../../../pages/room/consts";

type NameTagProps = {
  name: string;
};

const NameTag = ({ name }: NameTagProps) => {
  const isMyself = name === LOCAL_PEER_NAME;
  const bgColor = isMyself ? "bg-brand-pink-500" : "bg-brand-dark-blue-400";

  return (
    <div className={`${bgColor} gap-1 rounded-full px-3 py-1`}>
      <span className="text-sm ">{name}</span>
    </div>
  );
};

export default NameTag;
