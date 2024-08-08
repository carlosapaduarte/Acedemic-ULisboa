// This component could be used to define functions that interact with the Backend and other external services.

import { Goal } from "../challenges/types";
import {doFetch, toBody} from "./fetch"
import {Logger} from "tslog";

const logger = new Logger({name: "service"});

// For now, all of these functions will return the expected response.
// If the API reply is not OK, a Promise.reject(error) is returned/throwned instead!
// In my opinion, this eases error handling in the caller.

// TODO: separate create-user and login tasks in the future
async function createUserOrLogin(userId: number) {
    const request = {
        path: 'login',
        method: 'POST',
        body: toBody({id: userId}),
    }
    const response: Response = await doFetch(request)
    //console.log('Is logged in: ', response)
    if (!response.ok)
        return Promise.reject(new Error('User creation was not possible'))
}

async function chooseLevel(userId: number, level: number) {
    const request = {
        path: 'set-level',
        method: 'POST',
        body: toBody({id: userId, level: level}),
    }
    const response: Response = await doFetch(request)
    if (!response.ok)
        return Promise.reject(new Error('Level selection failed!'))
}

async function selectShareProgressState(userId: number, shareProgress: boolean) {
    const request = {
        path: 'set-publish-state-preference',
        method: 'POST',
        body: toBody({id: userId, shareProgress}),
    }
    const response: Response = await doFetch(request)
    //console.log(response)
    if (!response.ok)
        return Promise.reject(new Error('Progress share preference selection failed!'))
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

async function fetchUserInfoFromApi(userId: number): Promise<UserInfo> {
    const request = {
        path: `users/${userId}`,
        method: 'GET',
    }
    const response: Response = await doFetch(request)

    if (response.ok) {
        const responseObject: UserInfo = await response.json() // TODO: how 
        //console.log(responseObject)
        return responseObject
    } else
        return Promise.reject(new Error('User info could not be obtained!'))
}

async function createNewUserNote(userId: number, name: string, userGoalDate: Date) {
    //console.log(userGoalDate.getTime())
    
    const request = {
        path: `users/${userId}/notes`,
        method: 'POST',
        body: toBody({id: userId, name, date: userGoalDate.getTime()}),
    }
    const response: Response = await doFetch(request)
    if (!response.ok)
        return Promise.reject(new Error('Note creation failed!'))
}

async function markGoalAsCompleted(userId: number, goalName: String, date: Date) {
    const request = {
        path: `users/${userId}/completed-goals`,
        method: 'POST',
        body: toBody({id: userId, goalName, date: date.getTime()}),
    }
    const response: Response = await doFetch(request)
    if (!response.ok)
        return Promise.reject(new Error('Goal finalized selection failed!'))
}

export const service = {
    createUserOrLogin,
    chooseLevel,
    selectShareProgressState,
    fetchUserInfoFromApi,
    createNewUserNote,
    markGoalAsCompleted
}