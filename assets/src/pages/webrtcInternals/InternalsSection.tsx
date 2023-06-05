import React from "react";
import Details from "./Details";
import Chart from "./Chart";
import { Section } from "./parseIncomingStats";

type InternalsSectionProps = {
  section: Section;
  title: string;
};

const InternalsSection = ({ title, section }: InternalsSectionProps) => {
  const { descriptive, sdpInfo, charts, subsections } = section;
  return (
    <Details summaryText={title}>
      <>
        <ul className="list-inside list-disc">
          {descriptive.map(({ name, value }) => (
            <li className="p-2 px-4" key={name}>{`${name}: ${value}`}</li>
          ))}
        </ul>
        {sdpInfo.map(({ name, values }) => (
          <Details key={name} className="pl-4" summaryText={name}>
            <ul>
              {values.map((v, idx) => (
                <li className="px-4 text-xs" key={`${idx}:${v}`}>
                  {v}
                </li>
              ))}
            </ul>
          </Details>
        ))}
        <ul>
          <div className="flex flex-wrap">
            {charts.map(({ chartTitle, xs, ys }) => (
              <li className="p-2" key={chartTitle}>
                <Chart title={chartTitle} xs={xs} ys={ys} />
              </li>
            ))}
          </div>
          {Object.entries(subsections || {}).map(([key, section]) => (
            <li className="p-2" key={key}>
              <InternalsSection title={key} section={section} />
            </li>
          ))}
        </ul>
      </>
    </Details>
  );
};

export default InternalsSection;
