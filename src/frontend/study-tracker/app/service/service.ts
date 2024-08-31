// This component could be used to define functions that interact with the Backend and other external services.

import {doFetch, toBody} from "./fetch"


// For now, all of these functions will return the expected response.
// If the API reply is not OK, a Promise.reject(error) is returned/throwned instead!
// In my opinion, this eases error handling in the caller.

// TODO: separate create-user and login tasks in the future
async function createUserOrLogin(userId: number) {
    //console.log("Trying to use userId: ", userId)
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

// User info
export type UserInfo = {
    id: number,
    username: string,
    level: number,
    startDate: number,
    shareProgress: boolean,
    avatarFilename: string, // TODO: this could be undefined
};

async function fetchUserInfoFromApi(userId: number): Promise<UserInfo> {
    const request = {
        path: `users/${userId}`,
        method: 'GET'
    }
    const response: Response = await doFetch(request)

    if (response.ok) {
        const responseObject: UserInfo = await response.json() // TODO: how 
        return responseObject
    } else
        return Promise.reject(new Error('User info could not be obtained!'))
}

async function updateAppUseGoals(userId: number, uses: Set<number>) {
    // Set needs to be converted to list
    const usesList = Array.from(uses)
    const request = {
        path: `users/${userId}/study-tracker-app/use-goals`,
        method: 'PUT',
        body: toBody({uses: usesList}),
    }
    const response: Response = await doFetch(request)

    if (response.ok) {
        const responseObject: UserInfo = await response.json()
        return responseObject
    } else
        return Promise.reject(new Error('App use goals could not be updated!'))
}

export enum BinaryAnswer { YES, NO }
async function updateReceiveNotificationsPreference(userId: number, answer: BinaryAnswer) {
    const request = {
        path: `users/${userId}/study-tracker-app/receive-notifications-pref`,
        method: 'PUT',
        body: toBody({receive: answer}),
    }
    const response: Response = await doFetch(request)
    if (!response.ok)
        return Promise.reject(new Error('Receive notifications preference could not be updated!'))
}

async function updateWeekPlanningDay(userId: number, day: number, hour: number) {
    if (day < 0 || day > 6)
        return Promise.reject(new Error('Day ' + day + " is not a valid week day!"))

    const request = {
        path: `users/${userId}/study-tracker-app/week-planning-day`,
        method: 'PUT',
        body: toBody({day, hour}),
    }
    const response: Response = await doFetch(request)
    if (!response.ok)
        return Promise.reject(new Error('Week planning day could not be updated!'))
}

export type NewTaskInfo = {
    title: string,
    startDate: Date,
    endDate: Date,
    tag: string
}

async function createNewTask(userId: number, newTaskInfo: NewTaskInfo) {
    console.log("New Task Info: ", newTaskInfo)
    console.log(newTaskInfo.startDate.getTime() / 1000)
    console.log(newTaskInfo.endDate.getTime() / 1000)

    const request = {
        path: `users/${userId}/study-tracker-app/tasks`,
        method: 'POST',
        body: toBody({
            title: newTaskInfo.title,
            start_date: newTaskInfo.startDate.getTime() / 1000,
            end_date: newTaskInfo.endDate.getTime() / 1000,
            tag: newTaskInfo.tag
        }),
    }
    const response: Response = await doFetch(request)
    if (!response.ok)
        return Promise.reject(new Error('New task could not be created!'))
}

export const service = {
    createUserOrLogin,
    selectShareProgressState,
    selectAvatar,
    fetchUserInfoFromApi,
    updateAppUseGoals,
    updateReceiveNotificationsPreference,
    updateWeekPlanningDay,
    createNewTask
}