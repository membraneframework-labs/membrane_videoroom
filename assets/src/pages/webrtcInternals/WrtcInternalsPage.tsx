import { Socket } from "phoenix";
import React, { FC, useCallback, useEffect, useState } from "react";


import useDetailsToggle from "./hooks/useDetailsToggle";
import Details from "./Details";
import Chart from "./Chart";

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


  const InternalsSection = useCallback(({title, section}: InternalsSectionProps) => {
    const {key, descriptive, charts, subsections} = section;
  
    return (<Details summaryText={title} isOpen={isOpen(key)} toggle={() => toggle(key)}>
      <ul>   
          {descriptive.map(({name, value}) => <li className="p-2" key={name}>{`${name}: ${value}`}</li>)}
          {charts.map(({chartTitle, labels, dataset}) => (<li className="p-2" key={chartTitle}>
                  <Chart title={chartTitle} labels={labels} dataset={dataset}/></li>))}
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




    // const data = {
    //   labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'],
    //   // Our series array that contains series objects or in this case series data arrays
    //   series: [
    //     [5, 2, 4, 2, 0]
    //   ]
    // };
    // new LineChart('.ct-chart', data);

    return () => {
      channel.leave();
      socket.disconnect();
    };
  }, [chartData]);

  const labels = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'];
  const dataset = [5, 2, 4, 2, 0];

  return (
    <div>
      <h1>WebRTC Internals</h1>
      {/* <Chart title="test" labels={labels} dataset={dataset}/> */}
      <div className="ml-4"><InternalsSection title="main" section={chartData}/></div>
    </div>
  );
};
