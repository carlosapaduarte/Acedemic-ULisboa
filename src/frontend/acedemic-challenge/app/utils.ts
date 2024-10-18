import { Level1 } from "./challenges/level_1";
import { Level2 } from "./challenges/level_2";
import { Level3 } from "./challenges/level_3";
import { Challenge, DayChallenges } from "./challenges/types";
import { LevelType } from "~/routes/log-in/SelectLevelPage/SelectLevelPage";

function sameDay(date1: Date, date2: Date): boolean {
    return (
        date1.getFullYear() == date2.getFullYear() &&
        date1.getMonth() == date2.getMonth() &&
        date1.getDate() == date2.getDate()
    );
}

function getUserChallenges(level: LevelType, startDate: Date): DayChallenges[] {
    let calculatedChallenges: DayChallenges[];
    switch (level) {
        case 1:
            calculatedChallenges = Level1.level1Challenges(startDate);
            break;
        case 2:
            calculatedChallenges = Level2.level2Challenges(startDate);
            break;
        case 3:
            calculatedChallenges = Level3.level3Challenges(startDate);
            break;
        default:
            throw new Error("Level type that does not exist was used!");
    }
    return calculatedChallenges;
}

function getChallengesPerDay(level: LevelType): Challenge[][] {
    // Each index is a list of challenges for the day

    const toReturn: Challenge[][] = [];

    let challenges: Challenge[];
    switch (level) {
        case 1:
            challenges = Level1.getLevel1ChallengeList();
            break;
        case 2:
            challenges = Level2.getLevel2ChallengeList();
            break;
        case 3:
            challenges = Level3.getLevel3ChallengeList();
            break;
        default:
            throw new Error("Level type that does not exist was used!");
    }

    if (level == LevelType.LEVEL_1 || level == LevelType.LEVEL_2)
        challenges.forEach((challenge: Challenge) => toReturn.push([challenge]));
    else {
        // First 5 days
        for (let u = 0; u < challenges.length; u++) {
            const dayChallenges: Challenge[] = [];
            for (let i = 0; i <= u; i++) {
                dayChallenges.push(challenges[i]);
            }
            toReturn.push(dayChallenges);
        }
        // Others
        for (let u = challenges.length; u < 21; u++) {
            toReturn.push(challenges);
        }
    }
    return toReturn;
}

function getChallengesPerDayByStartDate(
    level: LevelType,
    startDate: Date
): Challenge[][] {
    const allChallenges: Challenge[][] = getChallengesPerDay(level);
    //console.log("All challenges: ", allChallenges)
    const numberOfPassedDays = Math.round(
        (new Date().getTime() - startDate.getTime()) / (1000 * 3600 * 24)
    );
    //console.log("Number of passed days: ", numberOfPassedDays)
    return allChallenges.slice(0, numberOfPassedDays + 1);
}

export const utils = {
    sameDay,
    getUserChallenges,
    getChallengesPerDay,
    getChallengesPerDayByStartDate: getChallengesPerDayByStartDate
};
