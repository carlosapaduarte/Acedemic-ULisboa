// This component could be used to define functions that interact with the Backend and other external services.

import {doFetch, toBody} from "./fetch"


// For now, all of these functions will return the expected response.
// If the API reply is not OK, a Promise.reject(error) is returned/throwned instead!
// In my opinion, this eases error handling in the caller.

// TODO: separate create-user and login events in the future
async function createUserOrLogin(userId: number) {
    //console.log("Trying to use userId: ", userId)
    const request = {
        path: 'commons/login',
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
        path: `commons/users/${userId}/publish-state`,
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
        path: `commons/users/${userId}/avatar`,
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
        path: `commons/users/${userId}`,
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
        path: `study-tracker/users/${userId}/use-goals`,
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
        path: `study-tracker/users/${userId}/receive-notifications-pref`,
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
        path: `study-tracker/users/${userId}/week-planning-day`,
        method: 'PUT',
        body: toBody({day, hour}),
    }
    const response: Response = await doFetch(request)
    if (!response.ok)
        return Promise.reject(new Error('Week planning day could not be updated!'))
}

export type NewEventInfo = {
    title: string,
    startDate: Date,
    endDate: Date,
    tags: string[]
}

async function createNewEvent(userId: number, newEventInfo: NewEventInfo) {
    const request = {
        path: `study-tracker/users/${userId}/events`,
        method: 'POST',
        body: toBody({
            title: newEventInfo.title,
            start_date: newEventInfo.startDate.getTime() / 1000,
            end_date: newEventInfo.endDate.getTime() / 1000,
            tags: newEventInfo.tags
        }),
    }
    const response: Response = await doFetch(request)
    if (!response.ok)
        return Promise.reject(new Error('New event could not be created!'))
}

type EventDto = {
    startDate: number,
    endDate: number,
    title: string,
    tag: string,
    everyWeek: boolean
}

export type Event = {
    startDate: Date,
    endDate: Date,
    title: string,
    tag: string,
    everyWeek: boolean
}

async function getTodayEvents(userId: number): Promise<Event[]> {
    const request = {
        path: `study-tracker/users/${userId}/events?today=true`,
        method: 'GET'
    }
    const response: Response = await doFetch(request)

    if (response.ok) {
        const responseObject: EventDto[] = await response.json() // TODO: how 
        return responseObject.map((eventDto: EventDto) => {
            return {
                startDate: new Date(eventDto.startDate * 1000),
                endDate: new Date(eventDto.endDate * 1000),
                title: eventDto.title,
                tag: eventDto.tag,
                everyWeek: eventDto.everyWeek
            }})
    } else
        return Promise.reject(new Error('User daily events could not be obtained!'))   
}

export type CreateScheduleNotAvailableBlock = {
    weekDay: number
    startHour: number
    duration: number
}

async function createScheduleNotAvailableBlock(userId: number, info: CreateScheduleNotAvailableBlock) {
    const request = {
        path: `study-tracker/users/${userId}/schedule/unavailable`,
        method: 'POST',
        body: toBody(info)
    }
    const response: Response = await doFetch(request)
    if (!response.ok)
        return Promise.reject(new Error('Unavailable Schedule Block creation failed!'))
}

export type SubTaskDto = {
    title: string,
    status: string
}

export type TaskDto = {
    title: string
    description: string
    deadline: number
    priority: string
    tags: string[]
    status: string,
    subTasks: SubTaskDto[]
}

export type Task = {
    title: string
    description: string
    deadline: Date
    priority: string
    tags: string[]
    status: string,
    subTasks: SubTask[]
}

export type SubTask = {
    title: string,
    status: string
}

async function getTasks(userId: number): Promise<Task[]> {
    const request = {
        path: `study-tracker/users/${userId}/tasks?order_by_deadline_and_priority=true`,
        method: 'GET',
    }
    const response: Response = await doFetch(request)
    if (response.ok) {
        const responseObject: TaskDto[] = await response.json() // TODO: how 
        return responseObject.map((taskDto: TaskDto) => {
            return {
                title: taskDto.title,
                description: taskDto.description,
                deadline: new Date(taskDto.deadline * 1000),
                priority: taskDto.priority,
                tags: taskDto.tags,
                status: taskDto.status,
                subTasks: taskDto.subTasks
            }})
    } else
        return Promise.reject(new Error('User tasks could not be obtained!'))   
}

async function createNewTask(userId: number, newTaskInfo: Task, createEvent: boolean) {
    const request = {
        path: `study-tracker/users/${userId}/tasks`,
        method: 'POST',
        body: toBody({
            title: newTaskInfo.title,
            description: newTaskInfo.description,
            deadline: newTaskInfo.deadline.getTime() / 1000,
            priority: newTaskInfo.priority,
            tags: newTaskInfo.tags,
            status: newTaskInfo.status,
            subTasks: newTaskInfo.subTasks,
            createEvent
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
    createNewEvent,
    getTodayEvents,
    createScheduleNotAvailableBlock,
    getTasks,
    createNewTask
}