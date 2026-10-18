import React, { useMemo } from "react";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import styles from "./statistics.module.css";
import { TaskDistributionPerWeek } from "~/service/service";
import { utils } from "~/utils";
import { useTranslation } from "react-i18next";
import { FaTags } from "react-icons/fa6";

const COLORS = [
  "#FFAB91",
  "#81C784",
  "#64B5F6",
  "#BA68C8",
  "#FFD54F",
  "#4DB6AC",
  "#A1887F",
];

export function TagsStats({ stats }: { stats: TaskDistributionPerWeek[] }) {
  const { t } = useTranslation(["statistics"]);
  const data = useMemo(() => {
    const currentWeek = utils.getWeekNumber(new Date());

    // Agrupar por Tag (Nome)
    const tagMap: Record<string, number> = {};

    stats
      .filter((s) => s.week === currentWeek)
      .forEach((item) => {
        const name = item.tag.charAt(0).toUpperCase() + item.tag.slice(1);
        tagMap[name] = (tagMap[name] || 0) + item.time;
      });

    // Converter para Array e Ordenar
    return Object.keys(tagMap)
      .map((key) => ({ name: key, value: tagMap[key] }))
      .sort((a, b) => b.value - a.value);
  }, [stats]);

  return (
    <div className={styles.statCardContainer}>
      <div className={styles.statTitle}><FaTags /> {t("tag_event_distribution")}</div>

      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
        }}
      >
        <div
          className={styles.chartTitleSmall}
          style={{ border: "none", marginBottom: "0" }}
        >
          {t("time_spent_this_week")}
        </div>

        {data.length > 0 ? (
          <div className={styles.tagsChartContainer}>
            <ResponsiveContainer>
              <PieChart>
                <Pie
                  data={data}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                  label={({ name, percent }) =>
                    percent > 0.1
                      ? `${name} ${(percent * 100).toFixed(0)}%`
                      : ""
                  }
                >
                  {data.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={COLORS[index % COLORS.length]}
                    />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(value: number) => [
                    `${Math.floor(value / 60)}${t("hours_short")} ${value % 60}${t("minutes_short")}`,
                    t("time_label"),
                  ]}
                  contentStyle={{
                    borderRadius: "8px",
                    border: "2px solid var(--color-2)",
                  }}
                />
                <Legend
                  iconType="circle"
                  layout="vertical"
                  verticalAlign="middle"
                  align="right"
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <div className={styles.noDataAvailableMessage}>
            {t("no_events_this_week")}
          </div>
        )}

        <div
          style={{
            fontSize: "0.8rem",
            color: "#666",
            fontStyle: "italic",
            marginTop: "1rem",
            textAlign: "center",
          }}
        >
          {t("event_source_note")}
        </div>
      </div>
    </div>
  );
}
