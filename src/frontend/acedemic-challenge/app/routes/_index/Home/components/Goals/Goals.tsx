import { Goal } from "~/challenges/types";
import { CutButton } from "~/components/Button/Button";
import React from "react";

import styles from "./goals.module.css";
import { useTranslation } from "react-i18next";

export default function Goals({ currentDayNumber, goals, completedGoals, onMarkComplete }: {
    currentDayNumber: number,
    goals: Goal[],
    completedGoals: number[],
    onMarkComplete: (goal: Goal) => void
}) {
    const { t } = useTranslation(["dashboard"]);

    // Per goal, there is a "Mark Complete" button
    return (
        <div>
            <h1 className={styles.currentDayText}>
                {t("dashboard:day")} {currentDayNumber}
            </h1>
            {goals.map((goal: Goal) => {
                const completed = completedGoals.find((completedGoalId) => goal.id == completedGoalId);
                return (
                    <div key={goal.id} style={{ display: "flex", flexDirection: "column", justifyContent: "start" }}>
                        <div style={{ display: "flex", flexDirection: "row", alignItems: "center" }}>
                            <h2 className={styles.challengeTitle}>{goal.title}</h2>
                            {
                                completed ?
                                    <p style={{
                                        textAlign: "left",
                                        width: "100%",
                                        marginBottom: "1%",
                                        textDecoration: "underline"
                                    }}>
                                        ({t("dashboard:goal_completed")})
                                    </p>
                                    :
                                    <></>
                            }
                        </div>
                        <p className={styles.goalDescription}>
                            {goal.description}
                        </p>
                        <div className={styles.buttonsContainer}>
                            <CutButton className={styles.addNoteButton}>
                                {t("dashboard:add_note")}
                            </CutButton>
                            {
                                completed ?
                                    <></>
                                    :
                                    <CutButton className={styles.completeGoalButton}
                                               onClick={() => onMarkComplete(goal)}>
                                        {t("dashboard:mark_complete")}
                                    </CutButton>
                            }
                        </div>
                    </div>
                );
            })}
        </div>
    );
}