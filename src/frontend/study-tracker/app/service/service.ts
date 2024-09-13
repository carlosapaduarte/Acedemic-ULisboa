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
    everyWeek: boolean
}

async function createNewEvent(userId: number, newEventInfo: NewEventInfo) {
    const request = {
        path: `study-tracker/users/${userId}/events`,
        method: 'POST',
        body: toBody({
            title: newEventInfo.title,
            startDate: newEventInfo.startDate.getTime() / 1000,
            endDate: newEventInfo.endDate.getTime() / 1000,
            tags: newEventInfo.tags,
            everyWeek: newEventInfo.everyWeek
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
    tags: string[],
    everyWeek: boolean
}

export type Event = {
    startDate: Date,
    endDate: Date,
    title: string,
    tags: string[],
    everyWeek: boolean
}

async function getUserEvents(userId: number, filterTodayEvents: boolean): Promise<Event[]> {
    const request = {
        path: `study-tracker/users/${userId}/events?today=${filterTodayEvents}`,
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
                tags: eventDto.tags,
                everyWeek: eventDto.everyWeek
            }})
    } else {
        if (filterTodayEvents)
            return Promise.reject(new Error('User today-events could not be obtained!'))
        else
            return Promise.reject(new Error('User events could not be obtained!'))
    }
}

async function getUserRecurrentEvents(userId: number) {
    // For simplicity, let's just get all events and filter here instead of in the backend
    const allEvents = await getUserEvents(userId, false)
    return allEvents.filter((event: Event) => event.everyWeek)
}

async function getUserTodayEvents(userId: number): Promise<Event[]> {
    return getUserEvents(userId, true)
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

export type TaskData = {
    title: string
    description: string
    deadline: Date
    priority: string
    tags: string[]
    status: string,
}

export type CreateTask = {
    taskData: TaskData
    subTasks: CreateTask[],
    createEvent: boolean
}

async function createNewTask(userId: number, newTaskInfo: CreateTask) {
    const request = {
        path: `study-tracker/users/${userId}/tasks`,
        method: 'POST',
        body: toBody({
            title: newTaskInfo.taskData.title,
            description: newTaskInfo.taskData.description,
            deadline: newTaskInfo.taskData.deadline.getTime() / 1000, // Converts to number
            priority: newTaskInfo.taskData.description,
            tags: newTaskInfo.taskData.tags,
            status: newTaskInfo.taskData.status,
            subTasks: newTaskInfo.subTasks,
            createEvent: newTaskInfo.createEvent
        }),
    }
    const response: Response = await doFetch(request)
    if (!response.ok)
        return Promise.reject(new Error('New task could not be created!'))
}

export type Task = {
    id: number,
    data: TaskData
    subTasks: Task[]
}

export type TaskDto = {
    id: number,
    title: string
    description: string
    deadline: number
    priority: string
    tags: string[]
    status: string,
    subTasks: TaskDto[]
}

function fromTaskDtoToTask(dto: TaskDto): Task {
    const subTasks = dto.subTasks.map((dto: TaskDto) => fromTaskDtoToTask(dto))
    return {
        id: dto.id,
        data: {
            title: dto.title,
            description: dto.description,
            deadline: new Date(dto.deadline * 1000),
            priority: dto.priority,
            tags: dto.tags,
            status: dto.status,
        },
        subTasks
    }
}

async function getTasks(userId: number): Promise<Task[]> {
    const request = {
        path: `study-tracker/users/${userId}/tasks?order_by_deadline_and_priority=true`,
        method: 'GET',
    }
    const response: Response = await doFetch(request)
    if (response.ok) {
        const responseObject: TaskDto[] = await response.json() // TODO: how 
        return responseObject.map((taskDto: TaskDto) => fromTaskDtoToTask(taskDto))
    } else
        return Promise.reject(new Error('User tasks could not be obtained!'))   
}

async function getTask(userId: number, taskId: number): Promise<Task> {
    // For now, just fetch all tasks and return the one that we want

    const tasks = await getTasks(userId)
    const task = tasks.find((task: Task) => task.id == taskId)
    if (task != undefined)
        return task
    return Promise.reject(new Error(`Task with ID ${taskId} doesn't exist!`))
}

async function updateTaskStatus(userId: number, taskId: number, newStatus: string) {
    const request = {
        path: `study-tracker/users/${userId}/tasks/${taskId}`,
        method: 'PUT',
        body: toBody({newStatus}),
    }
    const response: Response = await doFetch(request)
    if (!response.ok)
        return Promise.reject(new Error('Task status could not be updated!'))
}

async function createArchive(userId: number, name: string) {
    const request = {
        path: `study-tracker/users/${userId}/archives`,
        method: 'POST',
        body: toBody({name}),
    }
    const response: Response = await doFetch(request)
    if (!response.ok)
        return Promise.reject(new Error('New archive could not be created!'))
}

export type File = {
    name: string,
    text: string
}

export type Archive = {
    name: string,
    files: File[]
}

async function getArchives(userId: number): Promise<Archive[]> {
    const request = {
        path: `study-tracker/users/${userId}/archives`,
        method: 'GET'
    }
    const response: Response = await doFetch(request)
    if (response.ok) {
        const responseObject: Archive[] = await response.json() // TODO: how 
        return responseObject
    } else
        return Promise.reject(new Error('Archives could not be obtained!'))
}

async function getArchive(userId: number, archiveName: string): Promise<Archive> {
    // To simplify for now...
    const archives = await getArchives(userId)
    const archive = archives.find((archive: Archive) => archive.name == archiveName)
    if (archive == undefined)
        return Promise.reject(new Error('Archive does not exist!'))
    return archive
}

async function createFile(userId: number, archiveName: string, name: string) {
    const request = {
        path: `study-tracker/users/${userId}/archives/${archiveName}`,
        method: 'POST',
        body: toBody({name}),
    }
    const response: Response = await doFetch(request)
    if (!response.ok)
        return Promise.reject(new Error('New file could not be created!'))
}

async function getFile(userId: number, archiveName: string, filename: string): Promise<File> {
    // To simplify for now...
    
    const userArchives = await getArchives(userId)
    const file = userArchives
        .find((archive: Archive) => archive.name == archiveName)?.files
        .find((file: File) => file.name == filename)

    if (file == undefined)
        return Promise.reject(new Error('File does not exist!'))
    return file
}

async function updateFileContent(userId: number, archiveName: string, name: string, newContent: string) {
    const request = {
        path: `study-tracker/users/${userId}/archives/${archiveName}/files/${name}`,
        method: 'PUT',
        body: toBody({content: newContent}),
    }
    const response: Response = await doFetch(request)
    if (!response.ok)
        return Promise.reject(new Error('New file could not be created!'))
}

export type Grade = {
    value: number,
    weight: number
}

export type CurricularUnit = {
    name: string,
    grades: Grade[]
}

async function getCurricularUnits(userId: number): Promise<CurricularUnit[]> {
    const request = {
        path: `study-tracker/users/${userId}/curricular-units`,
        method: 'GET'
    }
    const response: Response = await doFetch(request)
    if (response.ok) {
        const responseObject: CurricularUnit[] = await response.json() // TODO: how 
        return responseObject
    } else
        return Promise.reject(new Error('Curricular Units could not be obtained!'))
}

async function createCurricularUnit(userId: number, name: string) {
    const request = {
        path: `study-tracker/users/${userId}/curricular-units`,
        method: 'POST',
        body: toBody({name}),
    }
    const response: Response = await doFetch(request)
    if (!response.ok)
        return Promise.reject(new Error('New Curricular Unit could not be created!'))
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
    getUserEvents,
    getUserRecurrentEvents,
    getUserTodayEvents,
    createScheduleNotAvailableBlock,
    getTasks,
    getTask,
    createNewTask,
    updateTaskStatus,
    createArchive,
    getArchives,
    getArchive,
    createFile,
    getFile,
    updateFileContent,
    getCurricularUnits,
    createCurricularUnit
}