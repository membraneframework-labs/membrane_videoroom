import React from "react";
import Button from "../../shared/components/Button";
import HomePageLayout from "./HomePageLayout";

const LeavingRoomScreen: React.FC<{ roomId: string }> = ({ roomId }) => {
  return (
    <HomePageLayout>
      <section className="flex h-full w-full flex-col items-center justify-center gap-y-14 sm:gap-y-20">
        <div className="flex flex-col items-center gap-y-2 text-center sm:gap-y-6">
          <h2 className="text-2xl font-medium sm:text-5xl">You&apos;ve left the meeting.</h2>
          <p className="font-aktivGrotesk text-base sm:text-xl">What would you like to do next?</p>
        </div>

        <div className="flex w-full flex-col justify-center gap-6 text-center sm:flex-row">
          <Button href={`/room/${roomId}`} name="rejoin-meeting" variant="light">
            Rejoin the meeting
          </Button>
          <Button href="/" name="main-page" variant="normal">
            Main page
          </Button>
        </div>
      </section>
    </HomePageLayout>
  );
};

export default LeavingRoomScreen;
