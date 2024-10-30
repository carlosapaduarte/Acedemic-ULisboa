import { useEffect, useState } from "react";
import { CurWeekDate } from "./Commons";
import styles from "./statistics.module.css";

import React from "react";
import { Pie } from "@visx/shape";
import { Group } from "@visx/group";
import { scaleOrdinal } from "@visx/scale";
import { letterFrequency } from "@visx/mock-data";
import { useSetGlobalError } from "~/components/error/GlobalErrorContainer";
import { service, TaskDistributionPerWeek } from "~/service/service";

const tags = [
    "Study",
    "Homework",
    "Classes",
    "Meditation",
]

function LegendItem({tag} : {tag: string}) {
    return (
        <div className={styles.legendItemContainer}>
            {tag}
        </div>
    )
}

function Legend() {
    return (
        <div className={styles.legendGroupContainer}>
            {tags.map((tag: string, index: number) => 
                <LegendItem tag={tag} key={index}/>
            )}
        </div>
    )
}

const letters = letterFrequency.slice(0, 4);
const frequency = (d) => d.frequency;

const getLetterFrequencyColor = scaleOrdinal({
  domain: letters.map((l) => l.letter),
  range: [
    "rgba(3, 186, 252, 1)", // blue
    "rgba(14, 194, 119, 0.8)", // green
    "rgba(14, 194, 119, 0.6)", // yellow
    "rgba(194, 14, 185, 0.4)" // pink
  ]
});

const defaultMargin = { top: 0, right: 0, bottom: 0, left: 0 };

export type PieProps = {
  width: number;
  height: number;
  margin?: typeof defaultMargin;
};

// Source: https://codesandbox.io/p/sandbox/visx-simple-pie-chart-tf4ed
function Chart({
  margin = defaultMargin
}: PieProps) {

  const height = 150
  const width = 150

  const innerWidth = width - margin.left - margin.right;
  const innerHeight = height - margin.top - margin.bottom;
  const radius = Math.min(innerWidth, innerHeight) / 2;
  const centerY = innerHeight / 2;
  const centerX = innerWidth / 2;
  const top = centerY + margin.top;
  const left = centerX + margin.left;
  const pieSortValues = (a, b) => b - a;

  console.log(letters)

  return (
    <svg width={width} height={height}>
      <Group top={top} left={left}>
        <Pie
          data={letters}
          pieValue={frequency}
          pieSortValues={pieSortValues}
          outerRadius={radius}
        >
          {(pie) => {
            return pie.arcs.map((arc, index) => {
              const { letter } = arc.data;
              const [centroidX, centroidY] = pie.path.centroid(arc);
              const hasSpaceForLabel = arc.endAngle - arc.startAngle >= 0.1;
              const arcPath = pie.path(arc);
              const arcFill = getLetterFrequencyColor(letter);
              return (
                <g key={`arc-${letter}-${index}`}>
                  <path d={arcPath} fill={arcFill} />
                  {hasSpaceForLabel && (
                    <text
                      x={centroidX}
                      y={centroidY}
                      dy=".33em"
                      fill="#ffffff"
                      fontSize={22}
                      textAnchor="middle"
                      pointerEvents="none"
                    >
                      {arc.data.letter}
                    </text>
                  )}
                </g>
              );
            });
          }}
        </Pie>
      </Group>
    </svg>
  );
}

function useTaskDistribution() {
    const setError = useSetGlobalError();
    const [stats, setStats] = useState<TaskDistributionPerWeek[] | undefined>(undefined);

    useEffect(() => {
        service.getTaskDistributionStats()
            .then((stats: any) => setStats(stats))
            .catch((error) => setError(error));
    }, []);

    return {stats}
}

export function TaskDistribution() {
    const {stats} = useTaskDistribution()

    // TODO: continue by using stats to populate the plot

    console.log(stats)
    
    return (
        <>
            <div className={styles.statsContainer}>
                <div className={styles.statsContainerTitle}>
                    (O) Workload distribution
                </div>
                <div className={styles.containerAlignRight}>
                    <CurWeekDate />
                </div>

                <div className={styles.chartGroup}>
                    <Chart width={200} height={200}/>
                    <Legend />    
                </div>

            </div>
        </>
    );
}