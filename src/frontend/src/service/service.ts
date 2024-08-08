// This component could be used to define functions that interact with the Backend and other external services.

import { Goal } from "../challenges/types";
import {doFetch, toBody} from "./fetch"
import {Logger} from "tslog";

const logger = new Logger({name: "service"});

// TODO: maybe, each function of the following should just return the expected type, and thrown when something goes wrong.
// In my opinion, this improves error handling: the caller just has to catch the exception

// TODO: separate tasks in the future
async function createUserOrLogin(userId: number): Promise<boolean> {
    const request = {
        path: 'login',
        method: 'POST',
        body: toBody({id: userId}),
    }
    const response: Response = await doFetch(request)
    console.log('Is logged in: ', response)

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

export type UserNote = {
    name: string;
    date: number
}

// Almost like DayAndGoal but without goal description
export type GoalAndDate = {
    name: string;
    date: number
}

// User info
export type UserInfo = {
    id: number,
    username: string,
    level: number,
    startDate: number,
    shareProgress: boolean,
    userNotes: UserNote[],
    completedGoals: GoalAndDate[]
};

async function fetchUserInfoFromApi(userId: number): Promise<UserInfo | undefined> {
    const request = {
        path: `users/${userId}`,
        method: 'GET',
    }
    const response: Response = await doFetch(request)

    if (response.ok) {
        const responseObject: UserInfo = await response.json() // TODO: how 
        console.log(responseObject)
        return responseObject
    } else
        return undefined
}

async function createNewUserNote(userId: number, name: string, userGoalDate: Date): Promise<boolean | undefined> {
    //console.log(userGoalDate.getTime())
    
    const request = {
        path: `users/${userId}/notes`,
        method: 'POST',
        body: toBody({id: userId, name, date: userGoalDate.getTime()}),
    }
    const response: Response = await doFetch(request)
    return response.ok
}

async function markGoalAsCompleted(userId: number, goalName: String, date: Date) {
    const request = {
        path: `users/${userId}/completed-goals`,
        method: 'POST',
        body: toBody({id: userId, goalName, date: date.getTime()}),
    }
    const response: Response = await doFetch(request)
    return response.ok
}

export const service = {
    createUserOrLogin,
    chooseLevel,
    selectShareProgressState,
    fetchUserInfoFromApi,
    createNewUserNote,
    markGoalAsCompleted
}