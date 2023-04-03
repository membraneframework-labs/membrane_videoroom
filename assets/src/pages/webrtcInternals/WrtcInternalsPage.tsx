import { Socket } from "phoenix";
import React, { FC, useEffect, useState } from "react";

import "chart.js/auto";
import { Chart } from "react-chartjs-2";

export const WebrtcInternalsPage: FC = () => {

  const [chartData, setChartData] = useState({});

  useEffect(() => {
    const socket = new Socket("/socket");
    socket.connect();
    console.log("Connected");

    const channel = socket.channel("stats", {});

    const parseIncomingStats = (stats: any) => {
      const parsedStats = {};

      




      return parsedStats;
    };

    channel
      .join()
      .receive("ok", () => console.log("Joined the channel"))
      .receive("error", (res) => console.error("Couldn't join the channel, ", res));
    channel.on("metrics", ({ stats }) => {
      console.log("Received metrics", stats);
      setChartData(parseIncomingStats(stats));
    });

    return () => {
      channel.leave();
      socket.disconnect();
    };
  }, []);

  return (
    <div>
      <h1>WRTC Internals</h1>
    </div>
  );
};
