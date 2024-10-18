import { Challenge, DayChallenges } from "./types";

function getDayChallenges(challenges: Challenge[], startDate: Date, level: number): DayChallenges[] {
    const today = new Date();

    const elapsedDays = Math.round((today.getTime() - startDate.getTime()) / (1000 * 3600 * 24)); // corresponds to [level1Aux] challenge index

    if (level == 1 || level == 2) {
        const challengesShortened: Challenge[] = challenges.slice(0, elapsedDays + 1);
        //console.log('Challenges shortened: ', challengesShortened)

        const challengesToReturn = challengesShortened.map((challenge, index) => {
            const challengeDate = new Date();
            challengeDate.setDate(today.getDate() - (elapsedDays - index));
            return {
                challenges: [{ id: challenge.id, title: challenge.title, description: challenge.description }],
                date: challengeDate
            };
        });

        return challengesToReturn;
    } else {
        const challengesToReturn: DayChallenges[] = [];

        for (let u = 0; u < 21; u++) {
            const curDate: Date = new Date(); // Starts on the first day (batch was created)
            curDate.setDate(startDate.getDate() + u);

            const challengesForTheDay: Challenge[] = [];
            if (u < 5) {
                for (let i = u; i >= 0; i--) {
                    challengesForTheDay.push(challenges[i]);
                }
            } else {
                for (let i = 0; i < 5; i++) {
                    challengesForTheDay.push(challenges[i]);
                }
            }
            challengesToReturn.push({
                challenges: challengesForTheDay,
                date: curDate
            });
        }
        console.log(challengesToReturn);
        return challengesToReturn;
    }
}

export const commons = {
    getDayChallenges
};