import React from "react";
import { InitialsCircle } from "../../../../features/room-page/components/InitialsImage";

type Props = {
  initialsFront: string;
  initialsBack: string;
  numberOfLeftTiles: number;
};

const OthersTile = ({ initialsFront, initialsBack, numberOfLeftTiles }: Props) => {
  return (
    <div className="flex h-full w-full flex-wrap content-center justify-center rounded-xl bg-brand-dark-blue-200">
      <div className="flex flex-col flex-wrap">
        <div className="flex">
          <InitialsCircle
            initials={initialsBack}
            size="M"
            borderColor="border-brand-dark-blue-300"
            className="order-none mx-[-8px]"
          />
          <InitialsCircle
            initials={initialsFront}
            size="M"
            borderColor="border-brand-dark-blue-300"
            className="order-1 mx-[-8px] bg-brand-dark-blue-200"
          />
        </div>
        <span className="text-center">{`+ ${numberOfLeftTiles} others`}</span>
      </div>
    </div>
  );
};

export default OthersTile;
