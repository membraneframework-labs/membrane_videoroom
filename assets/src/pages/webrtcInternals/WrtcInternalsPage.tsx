import { Socket } from "phoenix";
import React, { FC, useCallback, useEffect, useState } from "react";

import useDetailsToggle from "./hooks/useDetailsToggle";
import Details from "./Details";
import Chart from "./Chart";
import {MAX_DATA_POINTS_ON_CHART } from "../room/consts";
import moment from "moment";
import { tail } from "ramda";


type Section = {
  key: string;
  descriptive: DescriptiveValue[];
  charts: ChartEntry[];
  subsections?: {[name: string]: Section};
}

type DescriptiveValue = {
  name: string;
  value: string;
}

type ChartEntry = {
  chartTitle: string;
  xs: number[];
  ys: number[]; 
} 

type ChannelInputValue = string | number | ChannelInput | null;

type ChannelInput = {
  [key: string]: ChannelInputValue;
}

type InternalsSectionProps = {
  section: Section,
  title: string,
}

export const WebrtcInternalsPage: FC = () => {
  const [chartData, setChartData] = useState<Section>({descriptive: [], charts: [], key: "main"});
  const {isOpen, toggle} = useDetailsToggle();


  const InternalsSection = useCallback(({title, section}: InternalsSectionProps) => {
    const {key, descriptive, charts, subsections} = section;
  
    return (<Details summaryText={title} isOpen={isOpen(key)} toggle={() => toggle(key)}>
      <ul className="list-disc list-inside">   
          {descriptive.map(({name, value}) => <li className="p-2 px-4" key={name}>{`${name}: ${value}`}</li>)}
      </ul>
      <ul>
          <div className="flex flex-wrap">
          {charts.map(({chartTitle, xs, ys}) => (<li className="p-2" key={chartTitle}>
                  <Chart title={chartTitle} xs={xs} ys={ys}/></li>))}
          </div>
          {subsections && Object.entries(subsections).map(([key, section]) => (
            <li className="p-2" key={key}><InternalsSection title={key} section={section}/></li>
            ))}
      </ul>
      </Details>);
  }, [isOpen, toggle]);


  useEffect(() => {
    const isChannelInput = (stats: any): stats is ChannelInput => {
      return (stats && typeof stats === "object" && Object.keys(stats).length > 0);
    }

    const isTupleWithString = (stats: [string, ChannelInputValue]): stats is [string, string] => {
      const [_key, value] = stats;
      return typeof value === "string";
    }

    const isTupleWithNumber = (stats: [string, ChannelInputValue]): stats is [string, number] => {
      const [_key, value] = stats;
      return typeof value === "number";
    }

    const isTupleWithChannelInput = (stats: [string, ChannelInputValue]): stats is [string, ChannelInput] => {
      const [_key, value] = stats;
      return isChannelInput(value);
    }

    const socket = new Socket("/socket");
    socket.connect();
    console.log("Connected");

    const channel = socket.channel("stats", {});

    const parseIncomingStats = (stats: ChannelInput, prevSection: Section | null, key: string): Section => {
      const entries = Object.entries(stats);
      // TODO ask the Typescript wizard 🧙‍♂️🧙‍♂️🧙‍♂️ to help with this strange case
      const descriptive: DescriptiveValue[] = entries
          .filter(isTupleWithString)
          .map(([k, v]) => ({name: k, value: v}));
      const charts: ChartEntry[] = entries
          .filter(isTupleWithNumber)
          .map(([k, v]) => {
            const prevChart = prevSection && prevSection.charts.find( ({chartTitle}) => chartTitle === k) || null;
            const newLabel = Date.now();
            const newValue = v;

            const previousLabels = prevChart === null ? 
              [...Array(MAX_DATA_POINTS_ON_CHART - 1).keys()].map((s) => moment(Date.now()).subtract(s+1, "seconds").toDate().getTime()).reverse() :
              tail(prevChart.xs);
            const previousValues = prevChart === null ?
              Array(MAX_DATA_POINTS_ON_CHART - 1).fill(null) : tail(prevChart.ys);

            const xs = [...previousLabels, newLabel];
            const ys = [...previousValues, newValue];

            return {chartTitle: k, xs, ys};
          });

      const subsectionEntries = entries
          .filter(isTupleWithChannelInput)
          .map(([k, v]) => {
            const subsection = prevSection && prevSection.subsections && k in prevSection.subsections ? prevSection.subsections[k] : null;
            return [k, parseIncomingStats(v, subsection, `${k}:${key}`)]});

      const subsections: {[name: string]: Section} = Object.fromEntries(subsectionEntries);

      return {key, descriptive, charts, subsections};
    };

    channel
      .join()
      .receive("ok", () => console.log("Joined the channel"))
      .receive("error", (res) => console.error("Couldn't join the channel, ", res));
    channel.on("metrics", ({ stats }) => {
      console.log("Received metrics", stats);
      console.log("Parsed metrics", parseIncomingStats(stats, chartData, "main"));
      if (isChannelInput(stats)) setChartData((prevStats) => parseIncomingStats(stats, prevStats, "main"));
    });

    return () => {
      channel.leave();
      socket.disconnect();
    };
  }, [chartData]);


  return (
    <div>
      <h1>WebRTC Internals</h1>
      {/* <Chart title="test" labels={labels} dataset={dataset}/> */}
      <div className="ml-4"><InternalsSection title="main" section={chartData}/></div>
    </div>
  );
};
