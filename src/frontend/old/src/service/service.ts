// This component could be used to define functions that interact with the Backend and other external services.

import { Goal } from "../challenges/types";
import { LevelType } from "../components/SelectLevel";
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

async function createBatch(userId: number, level: LevelType) {
    const request = {
        path: `users/${userId}/batches`,
        method: 'POST',
        body: toBody({level: level}),
    }
    const response: Response = await doFetch(request)
    if (!response.ok)
        return Promise.reject(new Error('Level selection failed!'))
}

async function selectShareProgressState(userId: number, shareProgress: boolean) {
    const request = {
        path: `users/${userId}/publish-state`,
        method: 'PUT',
        body: toBody({shareProgress}),
    }
    const response: Response = await doFetch(request)
    //console.log(response)
    if (!response.ok)
        return Promise.reject(new Error('Progress share preference selection failed!'))
}

async function selectAvatar(userId: number, avatarFilename: string) {
    const request = {
        path: `users/${userId}/avatar`,
        method: 'PUT',
        body: toBody({avatarFilename}),
    }
    const response: Response = await doFetch(request)
    //console.log(response)
    if (!response.ok)
        return Promise.reject(new Error('Avatar selection failed!'))
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

export type CompletedGoal = {
    goalDay: number
    name: string
    conclusionDate: number
}

export type Batch = {
    id: number,
    startDate: number,
    level: number,
    completedGoals: CompletedGoal[]
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

async function fetchUserInfoFromApi(userId: number): Promise<UserInfo> {
    const request = {
        path: `users/${userId}`,
        method: 'GET',
    }
    const response: Response = await doFetch(request)

    if (response.ok) {
        const responseObject: UserInfo = await response.json() // TODO: how 
        return responseObject
    } else
        return Promise.reject(new Error('User info could not be obtained!'))
}

async function createNewUserNote(userId: number, text: string, userGoalDate: Date) {
    const request = {
        path: `users/${userId}/notes`,
        method: 'POST',
        body: toBody({text, date: Math.trunc(userGoalDate.getTime() / 1000)}), // Send seconds from 1970
    }

    //console.log(request)
    const response: Response = await doFetch(request)
    if (!response.ok)
        return Promise.reject(new Error('Note creation failed!'))
}

async function markGoalAsCompleted(userId: number, batchId: number, goalName: String, goalDay: number) {
    const request = {
        path: `users/${userId}/batches/${batchId}/completed-goals`,
        method: 'POST',
        body: toBody({goalName, goalDay}),
    }
    const response: Response = await doFetch(request)
    if (!response.ok)
        return Promise.reject(new Error('Goal finalized selection failed!'))
}

export const service = {
    createUserOrLogin,
    createBatch,
    selectShareProgressState,
    selectAvatar,
    fetchUserInfoFromApi,
    createNewUserNote,
    markGoalAsCompleted
}