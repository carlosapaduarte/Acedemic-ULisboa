import React, { useEffect, useMemo, useState } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
  CartesianGrid,
} from "recharts";
import styles from "./statistics.module.css";
import { service, Event, Tag } from "~/service/service";
import { utils } from "~/utils";

const UC_COLOR = "#8d6e63";
const OTHER_COLORS = [
  "#81C784",
  "#64B5F6",
  "#BA68C8",
  "#FFD54F",
  "#4DB6AC",
  "#FF8A65",
];

function expandEventsForCurrentWeek(
  rawEvents: Event[],
  currentWeek: number,
  currentYear: number,
): Event[] {
  const expanded: Event[] = [];

  rawEvents.forEach((ev) => {
    const evDate = new Date(ev.startDate);
    const evEnd = new Date(ev.endDate);
    const durationMs = evEnd.getTime() - evDate.getTime();

    if (!ev.every_week && !ev.every_day) {
      if (
        utils.getWeekNumber(evDate) === currentWeek &&
        evDate.getFullYear() === currentYear
      ) {
        expanded.push(ev);
      }
      return;
    }

    const today = new Date();
    const startOfWeek = new Date(today);
    const dayOfWeek = today.getDay() || 7;
    startOfWeek.setDate(today.getDate() - dayOfWeek + 1);
    startOfWeek.setHours(0, 0, 0, 0);

    for (let i = 0; i < 7; i++) {
      const loopDate = new Date(startOfWeek);
      loopDate.setDate(startOfWeek.getDate() + i);

      let occurs = false;

      if (ev.recurrence_start && loopDate < new Date(ev.recurrence_start))
        continue;
      if (ev.recurrence_end && loopDate > new Date(ev.recurrence_end)) continue;

      if (ev.every_day) occurs = true;
      if (ev.every_week && loopDate.getDay() === evDate.getDay()) occurs = true;

      if (occurs) {
        const newStart = new Date(loopDate);
        newStart.setHours(evDate.getHours(), evDate.getMinutes());
        const newEnd = new Date(newStart.getTime() + durationMs);

        if (utils.getWeekNumber(newStart) === currentWeek) {
          expanded.push({
            ...ev,
            startDate: newStart,
            endDate: newEnd,
          } as any);
        }
      }
    }
  });

  return expanded;
}

export function DrillDownStats() {
  const [rawEvents, setRawEvents] = useState<Event[]>([]);
  const [tags, setTags] = useState<Tag[]>([]);
  const [loading, setLoading] = useState(true);

  const [selectedTag, setSelectedTag] = useState<string | null>(null);
  const [selectedTagType, setSelectedTagType] = useState<"uc" | "other" | null>(
    null,
  );

  useEffect(() => {
    Promise.all([service.getAllUserEvents(), service.fetchUserTags()])
      .then(([eventsData, tagsData]) => {
        setRawEvents(eventsData);
        setTags(tagsData);
        setLoading(false);
      })
      .catch((err) => console.error(err));
  }, []);

  const { ucData, otherData, drillDownData } = useMemo(() => {
    const today = new Date();
    const currentWeek = utils.getWeekNumber(today);
    const currentYear = today.getFullYear();

    const weeklyEvents = expandEventsForCurrentWeek(
      rawEvents,
      currentWeek,
      currentYear,
    );

    const ucMap: Record<string, number> = {};
    const otherMap: Record<string, number> = {};
    const coOccurrenceMap: Record<string, number> = {};

    weeklyEvents.forEach((event) => {
      const duration = Math.round(
        (new Date(event.endDate).getTime() -
          new Date(event.startDate).getTime()) /
          (1000 * 60),
      );

      if (event.tags && event.tags.length > 0) {
        const eventTagNames: string[] = [];

        event.tags.forEach((tagItem: any) => {
          let tagName = "Desconhecido";
          if (typeof tagItem === "object" && tagItem !== null) {
            tagName = tagItem.name_pt || tagItem.name_en || "Sem Nome";
          } else {
            const found = tags.find(
              (t) =>
                t.name_pt === tagItem ||
                t.name_en === tagItem ||
                t.id === tagItem,
            );
            tagName = found ? found.name_pt || found.name_en : String(tagItem);
          }
          eventTagNames.push(tagName);
        });

        event.tags.forEach((tagItem: any, index: number) => {
          let tagName = eventTagNames[index];
          let isUc = false;

          if (typeof tagItem === "object" && tagItem !== null) {
            isUc = tagItem.is_uc;
          } else {
            const found = tags.find(
              (t) =>
                t.name_pt === tagItem ||
                t.name_en === tagItem ||
                t.id === tagItem,
            );
            if (found) isUc = found.is_uc;
          }

          // Drill Down Logic
          if (selectedTag && eventTagNames.includes(selectedTag)) {
            if (tagName !== selectedTag) {
              coOccurrenceMap[tagName] =
                (coOccurrenceMap[tagName] || 0) + duration;
            }
          }

          // Overview Logic
          if (!selectedTag) {
            if (isUc) {
              ucMap[tagName] = (ucMap[tagName] || 0) + duration;
            } else {
              otherMap[tagName] = (otherMap[tagName] || 0) + duration;
            }
          }
        });
      }
    });

    const formatData = (map: Record<string, number>) =>
      Object.keys(map)
        .map((key) => ({ name: key, value: map[key] }))
        .sort((a, b) => b.value - a.value);

    return {
      ucData: formatData(ucMap),
      otherData: formatData(otherMap),
      drillDownData: formatData(coOccurrenceMap),
    };
  }, [rawEvents, tags, selectedTag]);

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const min = payload[0].value;
      const h = Math.floor(min / 60);
      const m = min % 60;
      return (
        <div className={styles.customTooltip}>
          <p className={styles.customTooltipLabel}>{label}</p>
          <p style={{ color: "#666" }}>{h > 0 ? `${h}h ${m}m` : `${m} min`}</p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className={styles.statCardContainer}>
      <div className={styles.statTitle}>
        {selectedTag
          ? `🔍 Detalhe: ${selectedTag}`
          : "🏷️ Distribuição de Tempo"}
      </div>

      {!selectedTag && (
        <p
          style={{
            fontSize: "0.85rem",
            color: "#666",
            margin: "-10px 0 15px 0",
            paddingLeft: "1rem",
          }}
        >
          Onde gastaste o teu tempo esta semana
        </p>
      )}

      {selectedTag ? (
        <div style={{ padding: "1rem" }}>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: "1rem",
            }}
          >
            <button
              onClick={() => setSelectedTag(null)}
              style={{
                background: "none",
                border: "none",
                cursor: "pointer",
                color: "var(--color-2)",
                fontWeight: "bold",
                display: "flex",
                alignItems: "center",
                gap: "5px",
                fontSize: "1rem",
              }}
            >
              {"⬅ Voltar"}
            </button>
            <span
              style={{ fontSize: "0.8rem", color: "#666", fontStyle: "italic" }}
            >
              {"Co-ocorrências com: "}
              <b>{selectedTag}</b>
            </span>
          </div>

          <div style={{ width: "100%", height: 300 }}>
            {drillDownData.length > 0 ? (
              <ResponsiveContainer>
                <BarChart
                  layout="vertical"
                  data={drillDownData}
                  margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                  <XAxis type="number" hide />
                  <YAxis
                    dataKey="name"
                    type="category"
                    width={100}
                    tick={{
                      fill: "#5d4037",
                      fontWeight: "bold",
                      fontSize: "0.8rem",
                    }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <Tooltip content={<CustomTooltip />} />
                  <Bar dataKey="value" radius={[0, 4, 4, 0]} barSize={30}>
                    {drillDownData.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={
                          selectedTagType === "uc"
                            ? UC_COLOR
                            : OTHER_COLORS[index % OTHER_COLORS.length]
                        }
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div
                style={{
                  height: "100%",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexDirection: "column",
                  color: "#999",
                }}
              >
                <p>Esta tag aparece sozinha nos eventos.</p>
                <p style={{ fontSize: "0.8rem" }}>
                  (Não foi combinada com outras tags)
                </p>
              </div>
            )}
          </div>
        </div>
      ) : (
        <div className={styles.tasksGrid}>
          {/* 1. GERAL (MOVIDO PARA A ESQUERDA) */}
          <div className={styles.chartWrapper}>
            <div className={styles.chartTitleSmall}>{"🌟 Geral"}</div>
            {otherData.length > 0 ? (
              <div style={{ width: "100%", height: 250, fontSize: "0.7rem" }}>
                <ResponsiveContainer>
                  <BarChart
                    layout="vertical"
                    data={otherData}
                    margin={{ left: 10, right: 30 }}
                  >
                    <XAxis type="number" hide />
                    <YAxis
                      dataKey="name"
                      type="category"
                      width={80}
                      tick={{ fill: "#5d4037", fontWeight: "bold" }}
                      axisLine={false}
                      tickLine={false}
                    />
                    <Tooltip
                      cursor={{ fill: "rgba(0,0,0,0.05)" }}
                      content={<CustomTooltip />}
                    />
                    <Bar
                      dataKey="value"
                      radius={[0, 4, 4, 0]}
                      barSize={20}
                      style={{ cursor: "pointer" }}
                      onClick={(entry) => {
                        setSelectedTag(entry.name);
                        setSelectedTagType("other");
                      }}
                    >
                      {otherData.map((entry, index) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={OTHER_COLORS[index % OTHER_COLORS.length]}
                          style={{ cursor: "pointer" }}
                        />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
                <div
                  style={{
                    textAlign: "center",
                    fontSize: "0.7rem",
                    color: "#999",
                    marginTop: "5px",
                  }}
                >
                  (Clica na barra para ver detalhes)
                </div>
              </div>
            ) : (
              <div className={styles.noDataAvailableMessage}>
                Sem registos gerais.
              </div>
            )}
          </div>

          <div className={styles.chartWrapper}>
            <div className={styles.chartTitleSmall}>{"🎓 Académico (UCs)"}</div>
            {ucData.length > 0 ? (
              <div style={{ width: "100%", height: 250, fontSize: "0.7rem" }}>
                <ResponsiveContainer>
                  <BarChart
                    layout="vertical"
                    data={ucData}
                    margin={{ left: 10, right: 30 }}
                  >
                    <XAxis type="number" hide />
                    <YAxis
                      dataKey="name"
                      type="category"
                      width={80}
                      tick={{ fill: "#5d4037", fontWeight: "bold" }}
                      axisLine={false}
                      tickLine={false}
                    />
                    <Tooltip
                      cursor={{ fill: "rgba(0,0,0,0.05)" }}
                      content={<CustomTooltip />}
                    />
                    <Bar
                      dataKey="value"
                      radius={[0, 4, 4, 0]}
                      barSize={20}
                      fill={UC_COLOR}
                      style={{ cursor: "pointer" }}
                      onClick={(entry) => {
                        setSelectedTag(entry.name);
                        setSelectedTagType("uc");
                      }}
                    />
                  </BarChart>
                </ResponsiveContainer>
                <div
                  style={{
                    textAlign: "center",
                    fontSize: "0.7rem",
                    color: "#999",
                    marginTop: "5px",
                  }}
                >
                  (Clica na barra para ver detalhes)
                </div>
              </div>
            ) : (
              <div className={styles.noDataAvailableMessage}>
                Sem dados de UCs.
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
