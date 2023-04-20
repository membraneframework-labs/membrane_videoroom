import React from "react";
import Details from "./Details";
import Chart from "./Chart";
import { Section } from "./parsIncomingStats";

type InternalsSectionProps = {
  section: Section;
  title: string;
  isOpen: (key: string) => boolean;
  toggle: (key: string) => void;
};

const InternalsSection = ({ title, section, isOpen, toggle }: InternalsSectionProps) => {
  const { key, descriptive, charts, subsections } = section;

  return (
    <Details summaryText={title} isOpen={isOpen(key)} toggle={() => toggle(key)}>
      <ul className="list-inside list-disc">
        {descriptive.map(({ name, value }) => (
          <li className="p-2 px-4" key={name}>{`${name}: ${value}`}</li>
        ))}
      </ul>
      <ul>
        <div className="flex flex-wrap">
          {charts.map(({ chartTitle, xs, ys }) => (
            <li className="p-2" key={chartTitle}>
              <Chart title={chartTitle} xs={xs} ys={ys} />
            </li>
          ))}
        </div>
        {subsections &&
          Object.entries(subsections).map(([key, section]) => (
            <li className="p-2" key={key}>
              <InternalsSection title={key} section={section} isOpen={isOpen} toggle={toggle} />
            </li>
          ))}
      </ul>
    </Details>
  );
};

export default InternalsSection;
