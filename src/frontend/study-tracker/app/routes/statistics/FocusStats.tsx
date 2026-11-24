import React, { useMemo } from "react";
import styles from "./statistics.module.css";
import { WeekTimeStudy } from "~/service/service";
import { utils } from "~/utils";
import { useTranslation } from "react-i18next";

export function FocusStats({ weeklyStudyTime }: { weeklyStudyTime: WeekTimeStudy[] }) {
  const { t } = useTranslation(["statistics"]);
  const stats = useMemo(() => {
    const today = new Date();
    const weekdayOffset = (today.getDay() + 6) % 7;
    const thursday = new Date(today);
    thursday.setDate(today.getDate() - weekdayOffset + 3);
    const week = utils.getWeekNumber(today);
    return weeklyStudyTime.find(
      (record) => record.week === week && record.year === thursday.getFullYear(),
    );
  }, [weeklyStudyTime]);

  return (
    <div className={styles.statCardContainer}>
      <div className={styles.statTitle}>{t("statistics:pomodoro_performance")}</div>

      <div className={styles.focusMetricsLayout}>
        <div className={styles.chartWrapper} style={{ alignItems: "stretch" }}>
          <div className={styles.chartTitleSmall}>{t("statistics:weekly_metrics")}</div>

          {stats && (stats.total > 0 || stats.nOfSessions > 0) ? (
            <div className={styles.focusMetricsGrid}>
              <div
                className={styles.summaryCard}
                style={{ padding: "0.5rem 0.8rem", border: "1px solid #ddd" }}
              >
                <div
                  style={{
                    fontSize: "1.3rem",
                    fontWeight: "bold",
                    color: "var(--color-3)",
                  }}
                >
                  {Math.round(stats.averageBySession)} {t("statistics:minute_short")}
                </div>
                <div
                  className={styles.summaryLabel}
                  style={{ fontSize: "0.7rem" }}
                >
                  {t("statistics:average_per_session")}
                </div>
              </div>

              <div
                className={styles.summaryCard}
                style={{ padding: "0.5rem 0.8rem", border: "1px solid #ddd" }}
              >
                <div
                  style={{
                    fontSize: "1.3rem",
                    fontWeight: "bold",
                    color: "var(--color-1)",
                  }}
                >
                  {stats.nOfSessions}
                </div>
                <div
                  className={styles.summaryLabel}
                  style={{ fontSize: "0.7rem" }}
                >
                  {t("statistics:sessions_completed_week")}
                </div>
              </div>
            </div>
          ) : (
            <div
              className={styles.noDataAvailableMessage}
              style={{ fontSize: "0.8rem", padding: "2rem" }}
            >
              {t("statistics:no_sessions_this_week")}
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
