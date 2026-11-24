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
import type { TooltipPayload } from "recharts/types/state/tooltipSlice";
import styles from "./statistics.module.css";
import { service, Event, Tag } from "~/service/service";
import { utils } from "~/utils";
import { useTranslation } from "react-i18next";
import { FaArrowLeft, FaMagnifyingGlass } from "react-icons/fa6";

const OTHER_COLORS = [
  "#81C784",
  "#64B5F6",
  "#BA68C8",
  "#FFD54F",
  "#4DB6AC",
  "#FF8A65",
];

type TagChartDatum = { key: string; name: string };
type TagCursorProps = React.SVGProps<SVGRectElement> & {
  payload?: TooltipPayload;
  onSelectTag: (tagKey: string) => void;
  getAccessibleLabel: (name: string) => string;
};

function InteractiveTagCursor({
  payload,
  onSelectTag,
  getAccessibleLabel,
  ...rectProps
}: TagCursorProps) {
  const datum = payload?.[0]?.payload as TagChartDatum | undefined;
  if (!datum?.key) return null;

  const handleKeyDown = (event: React.KeyboardEvent<SVGRectElement>) => {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      onSelectTag(datum.key);
    }
  };

  return (
    <rect
      {...rectProps}
      fill="rgba(0,0,0,0.05)"
      pointerEvents="all"
      role="button"
      tabIndex={0}
      aria-label={getAccessibleLabel(datum.name)}
      onClick={() => onSelectTag(datum.key)}
      onKeyDown={handleKeyDown}
    />
  );
}

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

    if (!ev.everyWeek && !ev.everyDay) {
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

      if (ev.recurrenceStart && loopDate < new Date(ev.recurrenceStart))
        continue;
      if (ev.recurrenceEnd && loopDate > new Date(ev.recurrenceEnd)) continue;

      if (ev.everyDay) occurs = true;
      if (ev.everyWeek && loopDate.getDay() === evDate.getDay()) occurs = true;

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
  const { t } = useTranslation(["statistics"]);
  const [rawEvents, setRawEvents] = useState<Event[]>([]);
  const [tags, setTags] = useState<Tag[]>([]);
  const [loading, setLoading] = useState(true);

  const [selectedTagKey, setSelectedTagKey] = useState<string | null>(null);

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

    const ucMap: Record<string, { name: string; value: number; color: string }> = {};
    const otherMap: Record<string, { name: string; value: number; color: string }> = {};
    const coOccurrenceMap: Record<
      string,
      { name: string; value: number; color: string }
    > = {};

    const resolveTag = (
      tagItem:
        | string
        | {
            id?: string | number;
            name?: string;
            name_pt?: string;
            name_en?: string;
            color?: string;
            is_uc?: boolean;
          },
    ) => {
      const tagReference =
        typeof tagItem === "object" && tagItem !== null ? tagItem : undefined;
      const tag = tags.find((candidate) => {
        if (tagReference) {
          if (tagReference.id !== undefined && tagReference.id !== null) {
            return String(candidate.id) === String(tagReference.id);
          }
          return (
            candidate.name_pt === tagReference.name_pt ||
            candidate.name_en === tagReference.name_en ||
            candidate.name_pt === tagReference.name ||
            candidate.name_en === tagReference.name
          );
        }
        return (
          String(candidate.id) === String(tagItem) ||
          candidate.name_pt === tagItem ||
          candidate.name_en === tagItem
        );
      });
      const name = tag
        ? tag.name_pt || tag.name_en || t("unnamed_tag")
        : tagReference
          ? tagReference.name_pt || tagReference.name_en || tagReference.name || t("unnamed_tag")
          : String(tagItem || t("unknown_tag"));
      const id = tag?.id ?? tagReference?.id;
      const key =
        id !== undefined && id !== null
          ? `id:${id}`
          : `name:${name.trim().toLocaleLowerCase()}`;

      return {
        key,
        name,
        isUc: tag?.is_uc ?? tagReference?.is_uc ?? false,
        color:
          tag?.color ||
          tagReference?.color ||
          OTHER_COLORS[
            Array.from(key).reduce(
              (hash, character) => (hash * 31 + character.charCodeAt(0)) >>> 0,
              0,
            ) % OTHER_COLORS.length
          ],
      };
    };

    weeklyEvents.forEach((event) => {
      const duration = Math.round(
        (new Date(event.endDate).getTime() -
          new Date(event.startDate).getTime()) /
          (1000 * 60),
      );

      if (event.tags && event.tags.length > 0) {
        const eventTags = event.tags.map(resolveTag);

        eventTags.forEach((tag) => {
          if (
            selectedTagKey &&
            eventTags.some((eventTag) => eventTag.key === selectedTagKey)
          ) {
            if (tag.key !== selectedTagKey) {
              const current = coOccurrenceMap[tag.key] || {
                name: tag.name,
                value: 0,
                color: tag.color,
              };
              coOccurrenceMap[tag.key] = {
                ...current,
                value: current.value + duration,
              };
            }
          }

          if (!selectedTagKey) {
            if (tag.isUc) {
              const current = ucMap[tag.key] || {
                name: tag.name,
                value: 0,
                color: tag.color,
              };
              ucMap[tag.key] = { ...current, value: current.value + duration };
            } else {
              const current = otherMap[tag.key] || {
                name: tag.name,
                value: 0,
                color: tag.color,
              };
              otherMap[tag.key] = { ...current, value: current.value + duration };
            }
          }
        });
      }
    });

    const formatData = (
      map: Record<string, { name: string; value: number; color: string }>,
    ) =>
      Object.entries(map)
        .map(([key, entry]) => ({ key, ...entry }))
        .sort((a, b) => b.value - a.value);

    const formatCoOccurrences = () =>
      Object.entries(coOccurrenceMap)
        .map(([key, entry]) => ({ key, ...entry }))
        .sort((a, b) => b.value - a.value);

    return {
      ucData: formatData(ucMap),
      otherData: formatData(otherMap),
      drillDownData: formatCoOccurrences(),
    };
  }, [rawEvents, tags, selectedTagKey, t]);

  const selectedTagName = selectedTagKey
    ? tags.find((tag) => selectedTagKey === `id:${tag.id}`)?.name_pt ||
      tags.find((tag) => selectedTagKey === `id:${tag.id}`)?.name_en ||
      selectedTagKey.replace(/^name:/, "")
    : null;
  const selectTag = (tagKey: string) => {
    setSelectedTagKey(tagKey);
  };
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const min = payload[0].value;
      const h = Math.floor(min / 60);
      const m = min % 60;
      return (
        <div className={styles.customTooltip}>
          <p className={styles.customTooltipLabel}>{label}</p>
          <p style={{ color: "#666" }}>{h > 0 ? `${h}${t("hours_short")} ${m}${t("minutes_short")}` : `${m} ${t("minutes_short")}`}</p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className={styles.statCardContainer}>
      <div className={styles.statTitle}>
        {selectedTagName
          ? <><FaMagnifyingGlass aria-hidden="true" /> {t("tag_detail", { tag: selectedTagName })}</>
          : t("distribution_time")}
      </div>

      {!selectedTagKey && (
        <p
          style={{
            fontSize: "0.85rem",
            color: "#666",
            margin: "-10px 0 15px 0",
            paddingLeft: "1rem",
          }}
        >
          {t("where_time_this_week")}
        </p>
      )}

      {selectedTagKey ? (
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
              type="button"
              onClick={() => {
                setSelectedTagKey(null);
              }}
              className={styles.detailBackButton}
            >
              <><FaArrowLeft aria-hidden="true" /> {t("back")}</>
            </button>
            <span
              style={{ fontSize: "0.8rem", color: "#666", fontStyle: "italic" }}
            >
              {t("co_occurrences_with")} {" "}
              <b>{selectedTagName}</b>
            </span>
          </div>

          <div
            style={{
              width: "100%",
              height: Math.max(144, drillDownData.length * 44),
            }}
          >
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
                        fill={entry.color}
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
                <p>{t("tag_alone_events")}</p>
                <p style={{ fontSize: "0.8rem" }}>
                  {t("tag_not_combined")}
                </p>
              </div>
            )}
          </div>
        </div>
      ) : (
        <div className={styles.tasksGrid}>
          {/* 1. GERAL (MOVIDO PARA A ESQUERDA) */}
          <div className={styles.chartWrapper}>
            <div className={styles.chartTitleSmall}>{t("general")}</div>
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
                      cursor={
                        <InteractiveTagCursor
                          onSelectTag={selectTag}
                          getAccessibleLabel={(name) => t("open_tag_details", { tag: name })}
                        />
                      }
                      content={<CustomTooltip />}
                    />
                    <Bar
                      dataKey="value"
                      radius={[0, 4, 4, 0]}
                      barSize={20}
                      style={{ cursor: "pointer" }}
                      onClick={(entry) => {
                        selectTag(String(entry.key));
                      }}
                    >
                      {otherData.map((entry, index) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={entry.color}
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
                    marginBottom: "5px",
                  }}
                >
                  {t("click_bar_details")}
                </div>
                </div>
            ) : (
              <div className={styles.noDataAvailableMessage}>
                {t("no_general_records")}
              </div>
            )}
          </div>

          <div className={styles.chartWrapper}>
            <div className={styles.chartTitleSmall}>{t("academic_units")}</div>
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
                      cursor={
                        <InteractiveTagCursor
                          onSelectTag={selectTag}
                          getAccessibleLabel={(name) => t("open_tag_details", { tag: name })}
                        />
                      }
                      content={<CustomTooltip />}
                    />
                    <Bar
                      dataKey="value"
                      radius={[0, 4, 4, 0]}
                      barSize={20}
                      style={{ cursor: "pointer" }}
                      onClick={(entry) => {
                        selectTag(String(entry.key));
                      }}
                    >
                      {ucData.map((entry) => (
                        <Cell
                          key={entry.key}
                          fill={entry.color}
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
                    marginBottom: "5px",
                  }}
                >
                  {t("click_bar_details")}
                </div>
                </div>
            ) : (
              <div className={styles.noDataAvailableMessage}>
                {t("no_unit_data")}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
