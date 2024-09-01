import { DayGoals, Goal } from "~/challenges/types";
import { utils } from "~/utils";
import { t } from "i18next";
import React from "react";

function useSelectedDayGoalInfo({ goals, selectedDay }: { goals: DayGoals[], selectedDay: Date }) {
    // TODO: only displaying one Goal!!! There could be more

    function getSelectedDayGoals(goals: DayGoals[]): Goal[] {
        const goalsToReturn: Goal[] = [];

        const goalsForTheDay = goals.filter((goal: DayGoals) => {
            const date = goal.date;
            return utils.sameDay(date, selectedDay);
        }).map((goal: DayGoals) => goal.goals);

        goalsForTheDay.forEach((goalsExterior: Goal[]) => goalsExterior.forEach((goal: Goal) => goalsToReturn.push(goal)));

        return goalsToReturn;
    }

    const goalsToDisplay = getSelectedDayGoals(goals); // Filters today's goals

    return { goalsToDisplay };
}

export default function SelectedDayGoalInfo({ goals, selectedDay }: { goals: DayGoals[], selectedDay: Date }) {
    const { goalsToDisplay } = useSelectedDayGoalInfo({ goals, selectedDay });

    if (goalsToDisplay.length != 0)
        // Showing a single goal, for now
        return (
            <div>
                {
                    goalsToDisplay.map((goal: Goal, index: number) =>
                        <div key={index} style={{ overflow: "hidden", marginBottom: "3%" }}>
                            <h6>
                                {goal.title}
                            </h6>
                            <p>
                                {goal.description}
                            </p>
                        </div>
                    )
                }
            </div>
        );
    else
        return (
            <div style={{ marginBottom: "3%" }}>
                <h6>
                    {t("calendar:no_goals_title")}
                </h6>
            </div>
        );
}