// This component could be used to define functions that interact with the Backend and other external services.

import { doFetch, toBody } from "./fetch"

async function createUser(userId: number): Promise<boolean> {
    const request = {
        href: 'login',
        method: 'POST',
        body: toBody({id: userId}),
    }
    const response: Response = await doFetch(request)
    //console.log(response)

    return response.ok
}

async function chooseLevel(userId: number, level: number): Promise<boolean> {
    const request = {
        href: 'set-level',
        method: 'POST',
        body: toBody({id: userId, level: level}),
    }
    const response: Response = await doFetch(request)
    //console.log(response)

    return response.ok
}

async function selectShareProgressState(userId: number, shareProgress: boolean): Promise<boolean> {
    const request = {
        href: 'set-publish-state-preference',
        method: 'POST',
        body: toBody({id: userId, shareProgress}),
    }
    const response: Response = await doFetch(request)
    //console.log(response)

    return response.ok
}

export const Service = {
    createUser,
    chooseLevel,
    selectShareProgressState
}