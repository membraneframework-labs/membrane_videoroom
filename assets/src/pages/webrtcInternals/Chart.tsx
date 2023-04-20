import React, { RefObject, useEffect, useRef, useState } from "react";
import { LineChart, LineChartOptions } from "chartist";
import moment from "moment";
import {zip} from 'ramda';


type ChartProps = {
  title: string;
  xs: number[];
  ys: number[];
}

const Chart = ({title, xs, ys} : ChartProps) => {

  const chartContainerRef: RefObject<HTMLDivElement> = useRef<HTMLDivElement>(null);
  const [chartistLineChart, setChartist] = useState<LineChart | null>(null);

  const options: LineChartOptions = {
    axisX: {
      labelInterpolationFnc: (value) =>  moment(value).seconds() % 10 === 0 ? moment(value).format("hh:mm:ss") : null,
      position: 'end',
    },
    axisY: {
      onlyInteger: true,
      low: 0,
    },
    showPoint: false,
    fullWidth: true,
    lineSmooth: false,
  }

  useEffect(() => {
    const points = zip(xs, ys).map(([x, y]) => ({x, y}));
    const chartData = {
      labels: xs,
      series: [{data: points}],
    };

    if (chartistLineChart === null) {
      const lineChart = new LineChart(chartContainerRef.current, chartData, options);
      setChartist(lineChart);
    } else {
      const updatedChart = chartistLineChart.update(chartData, options);
      setChartist(updatedChart);
    }

    return () => {
      chartistLineChart?.detach()
    }
  }, [chartistLineChart, xs, ys]);


  return  (<div className="w-96 text-center">
    <span>{title}</span>
    <div className={"ct-chart ct-perfect-fourth"} ref={chartContainerRef}></div>
  </div>);
}

export default Chart;

