import { MAX_DATA_POINTS_ON_CHART } from "../room/consts";
import { subSeconds } from "date-fns";
import { tail } from "ramda";

export type Section = {
  key: string;
  descriptive: DescriptiveValue[];
  charts: ChartEntry[];
  subsections?: { [name: string]: Section };
};

type DescriptiveValue = {
  name: string;
  value: string;
};

type ChartEntry = {
  chartTitle: string;
  xs: number[];
  ys: number[];
};

type ChannelInputValue = string | number | ChannelInput | null;

type ChannelInput = {
  [key: string]: ChannelInputValue;
};

export const isChannelInput = (stats: unknown): stats is ChannelInput => {
  return !!(stats && typeof stats === "object" && Object.keys(stats).length > 0);
};

const isCertainTuple = <T extends ChannelInputValue>(
  stats: [string, ChannelInputValue],
  typeCheck: (value: ChannelInputValue) => boolean
): stats is [string, T] => {
  const [_key, value] = stats; //eslint-disable-line @typescript-eslint/no-unused-vars
  return typeCheck(value);
};

const isTupleWithString = (stats: [string, ChannelInputValue]): stats is [string, string] => {
  return isCertainTuple<string>(stats, (v) => typeof v === "string");
};

const isTupleWithNumber = (stats: [string, ChannelInputValue]): stats is [string, number] => {
  return isCertainTuple<number>(stats, (v) => typeof v === "number");
};

const isTupleWithChannelInput = (stats: [string, ChannelInputValue]): stats is [string, ChannelInput] => {
  return isCertainTuple<ChannelInput>(stats, isChannelInput);
};

const mapToChartEntry = (entry: [string, number], prevSection: Section | null): ChartEntry => {
  const [k, v] = entry;

  const prevChart = (prevSection && prevSection.charts.find(({ chartTitle }) => chartTitle === k)) || null;
  const newLabel = Date.now();
  const newValue = v;

  const secondsBefore = (s: number) => subSeconds(Date.now(), s).getTime();
  const previousSeconds = [...Array(MAX_DATA_POINTS_ON_CHART - 1).keys()].map(secondsBefore).reverse();
  const previousLabels = prevChart === null ? previousSeconds : tail(prevChart.xs);
  const previousValues = prevChart === null ? Array(MAX_DATA_POINTS_ON_CHART - 1).fill(null) : tail(prevChart.ys);

  const xs = [...previousLabels, newLabel];
  const ys = [...previousValues, newValue];

  return { chartTitle: k, xs, ys };
};

const parseIncomingStats = (stats: ChannelInput, prevSection: Section | null, key: string): Section => {
  const entries = Object.entries(stats);
  const descriptive: DescriptiveValue[] = entries.filter(isTupleWithString).map(([k, v]) => ({ name: k, value: v }));
  const charts: ChartEntry[] = entries.filter(isTupleWithNumber).map((entry) => mapToChartEntry(entry, prevSection));
  const subsectionEntries = entries.filter(isTupleWithChannelInput).map(([k, v]) => {
    const subsection =
      prevSection && prevSection.subsections && k in prevSection.subsections ? prevSection.subsections[k] : null;
    return [k, parseIncomingStats(v, subsection, `${k}:${key}`)];
  });

  const subsections: { [name: string]: Section } = Object.fromEntries(subsectionEntries);

  return { key, descriptive, charts, subsections };
};

export default parseIncomingStats;
