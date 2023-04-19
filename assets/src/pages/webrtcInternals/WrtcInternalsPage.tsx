import { Socket } from "phoenix";
import React, { FC, useCallback, useEffect, useState } from "react";

import "chart.js/auto";
import { Line } from "react-chartjs-2";
import useDetailsToggle from "./hooks/useDetailsToggle";
import Details from "./Details";

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
  labels: string[];
  dataset: number[]; 
} 

type ChannelInput = {
  [key: string]: string | number | ChannelInput | null;
}

type InternalsSectionProps = {
  section: Section,
  title: string,
}

export const WebrtcInternalsPage: FC = () => {

  const [chartData, setChartData] = useState<Section>({descriptive: [], charts: [], key: "main"});
  const {isOpen, toggle} = useDetailsToggle();

  const Chart = useCallback(({chartTitle, labels, dataset} : ChartEntry) => {
    const options = {responsive: false, plugins: {legend: {display: false}, title: {display: true, text: chartTitle,}}};
    const data = {
      labels,
      datasets: [{data: dataset}],
    }
    return <Line options={options} data={data}/>;
  }, []);

  const InternalsSection = useCallback(({title, section}: InternalsSectionProps) => {
    const {key, descriptive, charts, subsections} = section;
  
    return (<Details summaryText={title} isOpen={isOpen(key)} toggle={() => toggle(key)}>
      <ul>   
          {descriptive.map(({name, value}) => <li className="p-4" key={name}>{`${name}: ${value}`}</li>)}
          {charts.map(({chartTitle, labels, dataset}) => (<li className="p-4" key={chartTitle}>
                  <Chart chartTitle={chartTitle} labels={labels} dataset={dataset}/></li>))}
          {subsections && Object.entries(subsections).map(([key, section]) => (
            <li className="p-4" key={key}><InternalsSection title={key} section={section}/></li>
            ))}
      </ul>
      </Details>);
  }, [Chart, isOpen, toggle]);


  useEffect(() => {
    const isChannelInput = (stats: any): stats is ChannelInput => {
      return (stats && typeof stats === "object" && Object.keys(stats).length > 0);
    }

    const socket = new Socket("/socket");
    socket.connect();
    console.log("Connected");

    const channel = socket.channel("stats", {});

    const parseIncomingStats = (stats: ChannelInput, prevSection: Section | null, key: string): Section => {
      const entries = Object.entries(stats);
      // TODO ask the Typescript wizard 🧙‍♂️🧙‍♂️🧙‍♂️ to help with this strange case
      const descriptive: DescriptiveValue[] = entries
          .filter( ([_k, v]) => typeof v === "string")
          .map(([k, v]) => ({name: k, value: v}));
      const charts: ChartEntry[] = entries
          .filter(([_k, v]) => typeof v === "number")
          .map(([k, v]) => {
            const prevChart = prevSection && prevSection.charts.find( ({chartTitle}) => chartTitle === k);
            const newLabel = new Date().toLocaleTimeString();
            const newValue = v;

            return prevChart ? 
              {chartTitle: k, labels: [...prevChart.labels, newLabel], dataset: [...prevChart.dataset, newValue]} :
              {chartTitle: k, labels: [new Date().toLocaleTimeString()], dataset: [newValue]}
          });

      const subsectionEntries = entries
          .filter(([_k, v]) => isChannelInput(v))
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
      <div className="ml-4"><InternalsSection title="main" section={chartData}/></div>
    </div>
  );
};
