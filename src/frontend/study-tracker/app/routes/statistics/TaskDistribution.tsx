import { useEffect, useState } from "react";
import { CurWeekDate, NoDataYetAvailableMessage } from "./Commons";
import styles from "./statistics.module.css";

import React from "react";
import { Pie } from "@visx/shape";
import { Group } from "@visx/group";
import { scaleOrdinal } from "@visx/scale";
import { letterFrequency } from "@visx/mock-data";
import { useSetGlobalError } from "~/components/error/GlobalErrorContainer";
import { service, TaskDistributionPerWeek } from "~/service/service";
import { utils } from "~/utils";
import { LetterFrequency } from "@visx/mock-data/lib/mocks/letterFrequency";

function LegendItem({tag, color} : {tag: string, color: string}) {
    return (
        <div className={styles.legendItemContainer} style={{ backgroundColor: color }}>
            {tag}
        </div>
    )
}

function getColors(): string[] {
  return [
    "rgba(60,148,168,255)", // blue
    "rgba(94,124,86,255)", // green
    "rgba(153,126,49,255)", // yellow
    "rgba(186,93,123,255)", // pink
    "rgba(103,103,103,255)" // grey
  ]
}

function Legend({stats} : {stats: TaskDistributionPerWeek[]}) {
  const legendColors = getColors()
    return (
        <div className={styles.legendGroupContainer}>
            {stats.map((stat: TaskDistributionPerWeek, index: number) => 
                <LegendItem tag={stat.tag} key={index} color={legendColors[index]} />
            )}
        </div>
    )
}

const frequency = (d) => d.frequency;

const defaultMargin = { top: 0, right: 0, bottom: 0, left: 0 };

export type PieProps = {
  width: number;
  height: number;
  margin?: typeof defaultMargin;
};

// Source: https://codesandbox.io/p/sandbox/visx-simple-pie-chart-tf4ed
function Chart({stats} : {stats: TaskDistributionPerWeek[]}) {
    const margin = defaultMargin
    const height = 135
    const width = 135

    const innerWidth = width - margin.left - margin.right;
    const innerHeight = height - margin.top - margin.bottom;
    const radius = Math.min(innerWidth, innerHeight) / 2;
    const centerY = innerHeight / 2;
    const centerX = innerWidth / 2;
    const top = centerY + margin.top;
    const left = centerX + margin.left;
    const pieSortValues = (a, b) => b - a;

    let total = 0
    stats.forEach((stat: TaskDistributionPerWeek) => total += stat.time)

    const data: LetterFrequency[] = stats.map((stat: TaskDistributionPerWeek) => {
        return {
            letter: stat.tag[0],
            frequency: stat.time / total
        }
    })

    const getLetterFrequencyColor = scaleOrdinal({
        domain: data.map((l) => l.letter),
        range: getColors()
      });

    return (
        <div className={styles.chartContainer}>
            <svg width={width} height={height}>
            <Group top={top} left={left}>
                <Pie
                    data={data}
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
        </div>
    );
}

function ChartAndLegend({stats} : {stats: TaskDistributionPerWeek[]}) {
    return (
        stats.length != 0 ?
            <div className={styles.chartAndLegendContainer}>
                <Chart stats={stats} />
                <Legend stats={stats} />
            </div>
        :
            <NoDataYetAvailableMessage />
    )
}

function useTaskDistribution() {
    const setError = useSetGlobalError();
    const [stats, setStats] = useState<TaskDistributionPerWeek[]>([]);

    function filterThisWeekTaskDistribution(stats: TaskDistributionPerWeek[]): TaskDistributionPerWeek[] {
        const now = new Date()
        const currentYear = now.getFullYear()
        const currentYearWeekNumber = utils.getWeekNumber(now)
        return stats.filter((stat: TaskDistributionPerWeek) => stat.year == currentYear && stat.week == currentYearWeekNumber)
    }

    function filterFirstFourTasks(stats: TaskDistributionPerWeek[]): TaskDistributionPerWeek[] {
        // Sorts by task time, and selects the first four
        const firstFour = stats.sort((t1, t2) => t1.time + t2.time).slice(0, 4)
        
        // The others not shown
        const others = stats.filter((stat: TaskDistributionPerWeek) => 
            firstFour.find((s: TaskDistributionPerWeek) => s == stat) == undefined
        )

        // Total time by others not shown
        let total = 0
        others.forEach((stat: TaskDistributionPerWeek) => total += stat.time)

        // Assumes this function is called only for this week's stats
        const now = new Date()
        firstFour.push({
            year: now.getFullYear(),
            week: utils.getWeekNumber(now),
            tag: "others",
            time: total
        })
        
        return firstFour
    }

    useEffect(() => {
        service.getTaskDistributionStats()
            .then((stats: TaskDistributionPerWeek[]) => {
                console.log(stats)
                if (stats.length != 0) {
                    const currentWeekStats = filterThisWeekTaskDistribution(stats)
                    const trimmedWeekStats = filterFirstFourTasks(currentWeekStats)
                    setStats(trimmedWeekStats)
                }
            })
            .catch((error) => setError(error));
    }, []);

    return {stats}
}

export function TaskDistribution() {
    const {stats} = useTaskDistribution()
    //console.log(stats)
    
    return (
        <>
            <div className={styles.statsContainer}>
                <div className={styles.statsContainerTitle}>
                    <img 
                        src="public/icons/workload_distribution_icon.svg" 
                        alt="Workload distribution icon" 
                        className={styles.titleImg} 
                    />
                    Workload distribution
                </div>
                <div className={styles.containerAlignRight}>
                    <CurWeekDate />
                </div>

                <ChartAndLegend stats={stats} />
            </div>
        </>
    );
}