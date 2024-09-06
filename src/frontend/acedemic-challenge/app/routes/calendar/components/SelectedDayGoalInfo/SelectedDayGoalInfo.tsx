import { DayGoals, Goal } from "~/challenges/types";
import { utils } from "~/utils";
import React from "react";
import { useTranslation } from "react-i18next";
import styles from "../../calendarPage.module.css";

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
    const { t } = useTranslation(["calendar"]);

    if (goalsToDisplay.length == 1) {
        const goal = goalsToDisplay[0];
        return (
            <div>
                <h2 className={`${styles.goalTitle}`}>
                    {goal.title}
                </h2>
                <p className={`${styles.goalDescription}`}>
                    {goal.description}
                </p>
            </div>
        );
    } else if (goalsToDisplay.length > 1) {
        return (
            <>
                {
                    goalsToDisplay.map((goal: Goal, index: number) =>
                        <div key={index}>
                            <h2 className={`${styles.goalTitle}`}>
                                {goal.title}
                            </h2>
                            <p className={`${styles.goalDescription}`}>
                                {goal.description}
                            </p>
                        </div>
                    )
                }
            </>
        );
    } else
        return (
            <div>
                <h6>
                    {t("calendar:no_goals_title")}
                </h6>
            </div>
        );
}