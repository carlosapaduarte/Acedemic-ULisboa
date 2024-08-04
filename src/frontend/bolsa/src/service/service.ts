// This component could be used to define functions that interact with the Backend and other external services.

import { doFetch, toBody } from "./fetch"
import {Logger} from "tslog";

const logger = new Logger({ name: "Authn" });

// TODO: maybe, each function of the following should just return the expected type, and thrown when something goes wrong.
// In my opinion, this improves error handling: the caller just has to catch the exception

async function createUser(userId: number): Promise<boolean> {
    const request = {
        path: 'login',
        method: 'POST',
        body: toBody({id: userId}),
    }
    const response: Response = await doFetch(request)
    //console.log(response)

    return response.ok
}

async function chooseLevel(userId: number, level: number): Promise<boolean> {
    const request = {
        path: 'set-level',
        method: 'POST',
        body: toBody({id: userId, level: level}),
    }
    const response: Response = await doFetch(request)
    //console.log(response)

    return response.ok
}

async function selectShareProgressState(userId: number, shareProgress: boolean): Promise<boolean> {
    const request = {
        path: 'set-publish-state-preference',
        method: 'POST',
        body: toBody({id: userId, shareProgress}),
    }
    const response: Response = await doFetch(request)
    //console.log(response)

    return response.ok
}

export type CurrentUserDayAndLevel = {
    day: number;
    level: number;
  };

async function fetchCurrentUserDayAndLevelFromAPi(userId: number): Promise<CurrentUserDayAndLevel | undefined> {
    const request = {
        path: `users/${userId}`,
        method: 'GET',
    }
    const response: Response = await doFetch(request)

    if (response.ok) {
        const responseObject = await response.json()
        console.log(responseObject)
        const userCurrentDay = responseObject.currentDay // TODO: improve error handling
        const level = responseObject.level
        return {
            day: Number(userCurrentDay),
            level: Number(level)
        }
    } else
        return undefined
}

export const Service = {
    createUser,
    chooseLevel,
    selectShareProgressState,
    fetchCurrentUserDayAndLevelFromAPi
}