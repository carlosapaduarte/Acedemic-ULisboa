import { Goal } from "~/challenges/types";
import { Button } from "~/components/Button";
import React from "react";
import { useTranslation } from "react-i18next";

export default function Goals({ goals, completedGoals, onMarkComplete }: {
    goals: Goal[],
    completedGoals: number[],
    onMarkComplete: (goal: Goal) => void
}) {
    const { t } = useTranslation(["dashboard"]);

    // Per goal, there is a "Mark Complete" button
    return (
        <div>
            <h4 style={{ textAlign: "left", width: "50%" }}>{t("dashboard:current_challenge")}</h4>
            <br />
            {goals.map((goal: Goal) => {
                const completed = completedGoals.find((completedGoalId) => goal.id == completedGoalId);
                return (
                    <div key={goal.title} style={{ display: "flex", flexDirection: "column", justifyContent: "start" }}>
                        <div style={{ display: "flex", flexDirection: "row", alignItems: "center" }}>
                            <h5 style={{ textAlign: "left", width: "20%", marginBottom: "1%" }}>{goal.title}</h5>
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
                        <p style={{ fontSize: "110%", textAlign: "left", width: "100%", marginBottom: "1%" }}>
                            {goal.description}
                        </p>
                        {
                            // Depends if goal is or not completed
                            completed ?
                                <></>
                                :
                                <Button variant="round" style={{ width: "20%", marginBottom: "3%" }}
                                        onClick={() => onMarkComplete(goal)}>{t("dashboard:mark_complete")}
                                </Button>
                        }
                    </div>
                );
            })}
        </div>
    );
}