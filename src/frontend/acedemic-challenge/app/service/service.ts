// This component could be used to define functions that interact with the Backend and other external services.

import { LevelType } from "~/routes/log-in/SelectLevelPage/SelectLevelPage";
import { doFetch, toJsonBody } from "./fetch";


// For now, all of these functions will return the expected response.
// If the API reply is not OK, a Promise.reject(error) is returned/throwned instead!
// In my opinion, this eases error handling in the caller.

export type LoginResult = {
    access_token: string,
    token_type: string
};

/**
 * Makes an API request, using credentials, to create a JWT token, which
 * should be used on sub-sequenced calls, as an authorization mechanism.
 */
async function login(username: string, password: string) {
    // NOTE: for now, this function will store the JWT in cache, for simplicity.
    // TODO: think if there is another place to store the token.

    const formData = new FormData();
    formData.append("username", username);
    formData.append("password", password);

    const request = {
        path: "commons/token",
        method: "POST",
        body: formData
    };

    const response: Response = await doFetch(request);
    //console.log('Is logged in: ', response)

    if (response.ok) {
        const responseObject: LoginResult = await response.json(); // TODO: how
        localStorage["jwt"] = responseObject.access_token;
    } else
        return Promise.reject(new Error("Login failed!"));
}

async function testTokenValidity() {
    const request = {
        path: "commons/test-token",
        method: "GET"
    };
    const response: Response = await doFetch(request);
    if (!response.ok) {
        return Promise.reject(new Error("Login failed!"));
    }
}

async function createUser(username: string, password: string) {
    const request = {
        path: "commons/create-user",
        method: "POST",
        body: toJsonBody({ username, password })
    };
    const response: Response = await doFetch(request);
    //console.log('Is logged in: ', response)

    if (!response.ok)
        return Promise.reject(new Error("User creation was not possible!"));
}

async function createBatch(level: LevelType, challengeIds: number[] | number[][]) {
    const request = {
        path: `academic-challenge/users/me/batches`,
        method: "POST",
        body: toJsonBody({ level: level, challengeIds: challengeIds })
    };
    const response: Response = await doFetch(request);
    if (!response.ok)
        return Promise.reject(new Error("Level selection failed!"));
}

async function selectShareProgressState(shareProgress: boolean) {
    const request = {
        path: `commons/users/me/publish-state`,
        method: "PUT",
        body: toJsonBody({ shareProgress })
    };
    const response: Response = await doFetch(request);
    //console.log(response)
    if (!response.ok)
        return Promise.reject(new Error("Progress share preference selection failed!"));
}

async function selectAvatar(avatarFilename: string) {
    const request = {
        path: `commons/users/me/avatar`,
        method: "PUT",
        body: toJsonBody({ avatarFilename })
    };
    const response: Response = await doFetch(request);
    //console.log(response)
    if (!response.ok)
        return Promise.reject(new Error("Avatar selection failed!"));
}

export type UserNote = {
    name: string;
    date: number
}

export type StoredChallenge = {
    id: number,
    challengeDay: number,
    completionDate: number | null
}

export type Batch = {
    id: number,
    startDate: number,
    level: number,
    challenges: StoredChallenge[][]
}

// User info
export type UserInfo = {
    id: number,
    username: string,
    shareProgress: boolean,
    avatarFilename: string, // TODO: this could be undefined
    userNotes: UserNote[],
    batches: Batch[]
};

async function fetchUserInfoFromApi(): Promise<UserInfo> {
    const request = {
        path: `commons/users/me`,
        method: "GET"
    };
    const response: Response = await doFetch(request);

    if (response.ok) {
        const responseObject: UserInfo = await response.json();
        return responseObject;
    } else
        return Promise.reject(new Error("User info could not be obtained!"));
}

async function createNewUserNote(text: string, userChallengeDate: Date) {
    const request = {
        path: `academic-challenge/users/me/notes`,
        method: "POST",
        body: toJsonBody({ text, date: Math.trunc(userChallengeDate.getTime() / 1000) }) // Send seconds from 1970
    };

    //console.log(request)
    const response: Response = await doFetch(request);
    if (!response.ok)
        return Promise.reject(new Error("Note creation failed!"));
}

async function markChallengeAsCompleted(batchId: number, challengeId: number, challengeDay: number) {
    const request = {
        path: `academic-challenge/users/me/batches/${batchId}/completed-challenges`,
        method: "POST",
        body: toJsonBody({ challengeId, challengeDay })
    };
    const response: Response = await doFetch(request);
    if (!response.ok)
        return Promise.reject(new Error("Challenge finalized selection failed!"));
}

export const service = {
    login,
    testTokenValidity,
    createUser,
    createBatch,
    selectShareProgressState,
    selectAvatar,
    fetchUserInfoFromApi,
    createNewUserNote,
    markChallengeAsCompleted: markChallengeAsCompleted
};