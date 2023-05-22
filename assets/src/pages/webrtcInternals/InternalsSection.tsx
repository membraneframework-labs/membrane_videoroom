import React from "react";
import Details from "./Details";
import Chart from "./Chart";
import { Section } from "./parseIncomingStats";
import { useToggle } from "../room/hooks/useToggle";

type InternalsSectionProps = {
  section: Section;
  title: string;
};

const InternalsSection = ({ title, section }: InternalsSectionProps) => {
  const { descriptive, charts, subsections } = section;
  const [isOpen, toggle] = useToggle(false);

  return (
    <Details summaryText={title} isOpen={isOpen} toggle={toggle}>
      {isOpen && (
        <>
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
            {Object.entries(subsections || {}).map(([key, section]) => (
              <li className="p-2" key={key}>
                <InternalsSection title={key} section={section} />
              </li>
            ))}
          </ul>
        </>
      )}
    </Details>
  );
};

export default InternalsSection;
