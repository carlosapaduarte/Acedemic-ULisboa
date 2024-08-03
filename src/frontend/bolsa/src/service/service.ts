// This component could be used to define functions that interact with the Backend and other external services.

import { doFetch, toBody } from "./fetch"

async function createUser(userId: number): Promise<boolean> {
    const request = {
        href: 'login',
        method: 'POST',
        body: toBody({id: userId}),
    }
    const response: Response = await doFetch(request)
    console.log(response)

    return response.ok
}

export const Service = {
    createUser
}