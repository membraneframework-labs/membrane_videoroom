import { Socket } from "phoenix";
import React, { FC, useEffect, useState } from "react";

import InternalsSection from "./InternalsSection";
import parseIncomingStats, { Section, isChannelInput } from "./parseIncomingStats";

export const WebrtcInternalsPage: FC = () => {
  const [chartData, setChartData] = useState<Section>({ descriptive: [], charts: [], key: "main" });

  useEffect(() => {
    const socket = new Socket("/socket");
    socket.connect();

    const channel = socket.channel("stats", {});

    channel
      .join()
      .receive("ok", () => console.log("Joined the channel"))
      .receive("error", (res) => console.error("Couldn't join the channel, ", res));
    channel.on("metrics", ({ stats }) => {
      if (isChannelInput(stats)) {
        setChartData((prevStats) => parseIncomingStats(stats, prevStats, "main"));
      }
    });

    return () => {
      channel.leave();
      socket.disconnect();
    };
  }, []);

  return (
    <div>
      <h1>Internals</h1>
      <div className="ml-4">
        <InternalsSection title="main" section={chartData} />
      </div>
    </div>
  );
};
