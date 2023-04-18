import { Socket } from "phoenix";
import React, { FC, useEffect, useState } from "react";

import "chart.js/auto";
import { Chart, Line } from "react-chartjs-2";

type Section = {
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

  const [chartData, setChartData] = useState<Section>({descriptive: [], charts: []});

  const Chart = ({chartTitle, labels, dataset} : ChartEntry) => {
    const options = {responsive: false, plugins: {legend: {display: false}, title: {display: true, text: chartTitle,}}};
    const data = {
      labels,
      datasets: [{data: dataset}],
    }
    return <Line options={options} data={data}/>;
  }

  const InternalsSection = ({title, section}: InternalsSectionProps) => {
    const {descriptive, charts, subsections} = section;
    //TODO chang it to `details` HTML element (persist if toggled)
    return (<details>
      <summary>{title}</summary>
      <ul>   
          {descriptive.map(({name, value}) => <li className="p-4" key={name}>{`${name}: ${value}`}</li>)}
          {charts.map(({chartTitle, labels, dataset}) => (<li className="p-4" key={chartTitle}>
                  <Chart chartTitle={chartTitle} labels={labels} dataset={dataset}/></li>))}
          {subsections && Object.entries(subsections).map(([key, section]) => (
            <li className="p-4" key={key}><InternalsSection title={key} section={section}/></li>
            ))}
      </ul>
    </details>);
  }


  useEffect(() => {
    const isChannelInput = (stats: any): stats is ChannelInput => {
      // return Object.keys(stats as ChannelInput).some((key) => /room/.test(key));
      return (stats && typeof stats === "object" && Object.keys(stats).length > 0);
    }

    const socket = new Socket("/socket");
    socket.connect();
    console.log("Connected");

    const channel = socket.channel("stats", {});

    const parseIncomingStats = (stats: ChannelInput, prevSection: Section | null): Section => {
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
            return [k, parseIncomingStats(v, subsection)]});

      const subsections: {[name: string]: Section} = Object.fromEntries(subsectionEntries);

      return {descriptive, charts, subsections};
    };

    channel
      .join()
      .receive("ok", () => console.log("Joined the channel"))
      .receive("error", (res) => console.error("Couldn't join the channel, ", res));
    channel.on("metrics", ({ stats }) => {
      console.log("Received metrics", stats);
      console.log("Parsed metrics", parseIncomingStats(stats, chartData));
      if (isChannelInput(stats)) setChartData((prevStats) => parseIncomingStats(stats, prevStats));
      // const testInputValue: ChannelInput = {
      //   "piesek": "swinka",
      //   "piesek123": 123,
      //   "kotki": 245,
      //   "room_id=room": {
      //     "peer_id=2137": {
      //       "ice.binding_requests_received": 18,
      //       "ice.bytes_sent": 17298,
      //       "track_id=7312": {
      //         "inbound-rtp.encoding": "H264"
      //       }
      //     }
      //   }
      // }

      // const prevSection: Section = {
      //   descriptive: [{name: "piesek", value: "xyz"}],
      //   charts: [{chartTitle: "piesek123", labels: [new Date().toLocaleTimeString()], dataset: [120]},
      //   {chartTitle: "kotki", labels: [new Date().toLocaleTimeString()], dataset: [120]}
      // ],
      // } 
      // console.log("test", parseIncomingStats(testInputValue, prevSection));

      // setChartData((prevStats) => parseIncomingStats(testInputValue, prevSection))
    });

    return () => {
      channel.leave();
      socket.disconnect();
    };
  }, []);

  return (
    <div>
      <h1>WebRTC Internals</h1>
      <div className="ml-4"><InternalsSection title="main" section={chartData}/></div>
    </div>
  );
};
