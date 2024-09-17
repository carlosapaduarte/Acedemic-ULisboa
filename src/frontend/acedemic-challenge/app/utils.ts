import { Level1 } from "./challenges/level_1";
import { Level2 } from "./challenges/level_2";
import { Level3 } from "./challenges/level_3";
import { DayGoals, Goal } from "./challenges/types";
import { LevelType } from "~/routes/log-in/SelectLevelPage/SelectLevelPage";

function sameDay(date1: Date, date2: Date): boolean {
    return (
        date1.getFullYear() == date2.getFullYear() &&
        date1.getMonth() == date2.getMonth() &&
        date1.getDate() == date2.getDate()
    );
}

function getUserGoals(level: LevelType, startDate: Date): DayGoals[] {
    let calculatedGoals: DayGoals[];
    switch (level) {
        case 1:
            calculatedGoals = Level1.level1Goals(startDate);
            break;
        case 2:
            calculatedGoals = Level2.level2Goals(startDate);
            break;
        case 3:
            calculatedGoals = Level3.level3Goals(startDate);
            break;
        default:
            throw new Error("Level type that does not exist was used!");
    }
    return calculatedGoals;
}

function getGoalsPerDay(level: LevelType): Goal[][] {
    // Each index is a list of goals for the day

    const toReturn: Goal[][] = [];

    let goals: Goal[];
    switch (level) {
        case 1:
            goals = Level1.getLevel1GoalList();
            break;
        case 2:
            goals = Level2.getLevel2GoalList();
            break;
        case 3:
            goals = Level3.getLevel3GoalList();
            break;
        default:
            throw new Error("Level type that does not exist was used!");
    }

    if (level == LevelType.LEVEL_1 || level == LevelType.LEVEL_2)
        goals.forEach((goal: Goal) => toReturn.push([goal]));
    else {
        // First 5 days
        for (let u = 0; u < goals.length; u++) {
            const dayGoals: Goal[] = [];
            for (let i = 0; i <= u; i++) {
                //console.log(i)
                dayGoals.push(goals[i]);
            }
            toReturn.push(dayGoals);
        }
        // Others
        for (let u = goals.length; u < 21; u++) {
            toReturn.push(goals);
        }
    }
    return toReturn;
}

function getChallengesPerDayByStartDate(
    level: LevelType,
    startDate: Date
): Goal[][] {
    const allGoals: Goal[][] = getGoalsPerDay(level);
    //console.log("All goals: ", allGoals)
    const numberOfPassedDays = Math.round(
        (new Date().getTime() - startDate.getTime()) / (1000 * 3600 * 24)
    );
    //console.log("Number of passed days: ", numberOfPassedDays)
    return allGoals.slice(0, numberOfPassedDays + 1);
}

export const utils = {
    sameDay,
    getUserGoals,
    getGoalsPerDay,
    getChallengesPerDayByStartDate: getChallengesPerDayByStartDate
};
