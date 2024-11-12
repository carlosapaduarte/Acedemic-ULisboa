import { Challenge } from "./types";
import { StoredChallenge } from "~/service/service";


/**
 * Returns the full challenge from the one stored in the database.
 *
 * This function exists for the purpose of internationalization, so that the content of the challenges can be translated
 * to different languages; therefore the challenge content/text isn't directly stored in the database associated to the
 * user, but in the translation files.
 *
 * @param level The level of the challenge
 * @param storedChallenge The challenge stored in the database
 * @param t The translation function
 */
export function getFullChallenge(level: number, storedChallenge: StoredChallenge, t: (key: string) => string): Challenge {
    return {
        id: storedChallenge.id,
        day: storedChallenge.challengeDay,
        title: t(`level${level}.challenge${storedChallenge.id}.title`),
        description: t(`level${level}.challenge${storedChallenge.id}.description`),
        completionDate: storedChallenge.completionDate ? new Date(storedChallenge.completionDate * 1000) : null
    };
}

/**
 * Returns the list of challenge IDs for the given level.
 *
 * @param level The level of the challenges
 */
export function getChallengeIdList(level: number): number[] | number[][] {
    switch (level) {
        case 1:
            return getLevel1ChallengeIdList();
        case 2:
            return getLevel2ChallengeIdList();
        case 3:
            return getLevel3ChallengeIdList();
        default:
            return [];
    }
}

/**
 * Returns the list of challenge IDs for level 1.
 * This is the code that should be changed in order to add or remove challenges from level 1 in the future.
 *
 * You shouldn't
 * directly change the content of the existing challenges, only add more challenges to the database. Then, in this function,
 * you should select the IDs of the challenges you want to include in level 1, and leave the rest out, but existing in the
 * database for historical purposes.
 */
function getLevel1ChallengeIdList(): number[] {
    return [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20];
}

/**
 * Returns the list of challenge IDs for level 2.
 * This is the code that should be changed in order to add or remove challenges from level 2 in the future.
 *
 * You shouldn't
 * directly change the content of the existing challenges, only add more challenges to the database. Then, in this function,
 * you should select the IDs of the challenges you want to include in level 2, and leave the rest out, but existing in the
 * database for historical purposes.
 */
function getLevel2ChallengeIdList(): number[] {
    return [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20];
}

/**
 * Returns the list of challenge IDs for level 3.
 * This is the code that should be changed in order to add or remove challenges from level 3 in the future.
 *
 * You shouldn't
 * directly change the content of the existing challenges, only add more challenges to the database. Then, in this function,
 * you should select the IDs of the challenges you want to include in level 3, and leave the rest out, but existing in the
 * database for historical purposes.
 */
function getLevel3ChallengeIdList(): number[][] {
    return [
        [0],
        [0, 1],
        [0, 1, 2],
        [0, 1, 2, 3],
        [0, 1, 2, 3, 4],
        [0, 1, 2, 3, 4],
        [0, 1, 2, 3, 4],
        [0, 1, 2, 3, 4],
        [0, 1, 2, 3, 4],
        [0, 1, 2, 3, 4],
        [0, 1, 2, 3, 4],
        [0, 1, 2, 3, 4],
        [0, 1, 2, 3, 4],
        [0, 1, 2, 3, 4],
        [0, 1, 2, 3, 4],
        [0, 1, 2, 3, 4],
        [0, 1, 2, 3, 4],
        [0, 1, 2, 3, 4],
        [0, 1, 2, 3, 4],
        [0, 1, 2, 3, 4],
        [0, 1, 2, 3, 4]
    ];
}