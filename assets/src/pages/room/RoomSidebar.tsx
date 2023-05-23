import React, { FC, useEffect } from "react";
import Sidebar from "../../features/room-page/components/Sidebar";
import clsx from "clsx";
import { AnimatePresence, motion, useAnimation } from "framer-motion";
import useSmartphoneViewport from "../../features/shared/hooks/useSmartphoneViewport";

type Props = {
  isSidebarOpen: boolean;
  setIsSidebarOpen: React.Dispatch<React.SetStateAction<boolean>>;
};

const SIDEBAR_HEIGHT_MOBILE = 480;

const RoomSidebar: FC<Props> = ({ isSidebarOpen, setIsSidebarOpen }: Props) => {
  const isMobile: boolean | undefined = useSmartphoneViewport().isSmartphone;
  const animationControls = useAnimation();

  const sidebarStyles = {
    active: {
      y: 0,
    },
    inactive: {
      y: SIDEBAR_HEIGHT_MOBILE,
    },
    initial: {
      y: SIDEBAR_HEIGHT_MOBILE,
    },
  };

  useEffect(() => {
    animationControls.start(isSidebarOpen ? "active" : "inactive");
  }, [isSidebarOpen, animationControls]);

  useEffect(() => {
    if (isMobile && isSidebarOpen) animationControls.start("active");
  }, [isMobile, isSidebarOpen, animationControls]);

  return (
    <>
      {isMobile ? (
        <AnimatePresence>
          {isSidebarOpen && (
            <motion.div
              className={clsx("absolute inset-0 z-40 h-screen overflow-hidden bg-transparent/40 md:hidden")}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <div className="absolute inset-0" onClick={() => setIsSidebarOpen(false)}></div>
              <motion.div
                initial={"initial"}
                className={`absolute bottom-[-5%] left-0 z-40 h-[480px] w-full touch-none`}
                drag="y"
                dragElastic={0.05}
                dragConstraints={{
                  top: 0,
                }}
                dragMomentum={false}
                dragSnapToOrigin={true}
                onDragEnd={(_event, info) => {
                  const multiplier = 1 / 4;
                  const threshold = SIDEBAR_HEIGHT_MOBILE * multiplier;

                  if (info.offset.y > threshold) {
                    setIsSidebarOpen(false);
                  } else animationControls.start("active");
                }}
                onClick={() => animationControls.start("active")}
                onTap={() => animationControls.start("active")}
                animate={animationControls}
                variants={sidebarStyles}
                transition={{ type: "spring", damping: 60, stiffness: 180 }}
              >
                <Sidebar onClose={() => setIsSidebarOpen(false)} />
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      ) : (
        <div
          className={clsx(
            "hidden w-full md:inline-block",
            isSidebarOpen ? "max-w-[300px]" : "max-w-0",
            "overflow-hidden transition-all duration-300"
          )}
        >
          <Sidebar />
        </div>
      )}
    </>
  );
};

export default RoomSidebar;
