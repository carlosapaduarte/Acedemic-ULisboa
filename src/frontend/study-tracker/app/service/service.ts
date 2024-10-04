// This component could be used to define functions that interact with the Backend

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

// User info
export type UserInfo = {
    id: number,
    username: string,
    level: number,
    startDate: number,
    shareProgress: boolean,
    avatarFilename: string, // TODO: this could be undefined
};

async function fetchUserInfo(): Promise<UserInfo> {
    const request = {
        path: `commons/users/me`,
        method: "GET"
    };
    const response: Response = await doFetch(request);

    if (response.ok) {
        const responseObject: UserInfo = await response.json(); // TODO: how
        return responseObject;
    } else
        return Promise.reject(new Error("User info could not be obtained!"));
}

async function updateAppUseGoals(uses: Set<number>) {
    // Set needs to be converted to list
    const usesList = Array.from(uses);
    const request = {
        path: `study-tracker/users/me/use-goals`,
        method: "PUT",
        body: toJsonBody({ uses: usesList })
    };
    const response: Response = await doFetch(request);

    if (response.ok) {
        const responseObject: UserInfo = await response.json();
        return responseObject;
    } else
        return Promise.reject(new Error("App use goals could not be updated!"));
}

export enum BinaryAnswer { YES, NO }

async function updateReceiveNotificationsPreference(answer: BinaryAnswer) {
    const request = {
        path: `study-tracker/users/me/receive-notifications-pref`,
        method: "PUT",
        body: toJsonBody({ receive: answer })
    };
    const response: Response = await doFetch(request);
    if (!response.ok)
        return Promise.reject(new Error("Receive notifications preference could not be updated!"));
}

async function updateWeekPlanningDay(day: number, hour: number) {
    if (day < 0 || day > 6)
        return Promise.reject(new Error("Day " + day + " is not a valid week day!"));

    const request = {
        path: `study-tracker/users/me/week-planning-day`,
        method: "PUT",
        body: toJsonBody({ day, hour })
    };
    const response: Response = await doFetch(request);
    if (!response.ok)
        return Promise.reject(new Error("Week planning day could not be updated!"));
}

export type NewEventInfo = {
    title: string,
    startDate: Date,
    endDate: Date,
    tags: string[]
    everyWeek: boolean
}

async function createNewEvent(newEventInfo: NewEventInfo) {
    const request = {
        path: `study-tracker/users/me/events`,
        method: "POST",
        body: toJsonBody({
            title: newEventInfo.title,
            startDate: newEventInfo.startDate.getTime() / 1000,
            endDate: newEventInfo.endDate.getTime() / 1000,
            tags: newEventInfo.tags,
            everyWeek: newEventInfo.everyWeek
        })
    };
    const response: Response = await doFetch(request);
    if (!response.ok)
        return Promise.reject(new Error("New event could not be created!"));
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

async function getUserEvents(filterTodayEvents: boolean): Promise<Event[]> {
    const request = {
        path: `study-tracker/users/me/events?today=${filterTodayEvents}`,
        method: "GET"
    };
    const response: Response = await doFetch(request);

    if (response.ok) {
        const responseObject: EventDto[] = await response.json(); // TODO: how
        return responseObject.map((eventDto: EventDto) => {
            return {
                startDate: new Date(eventDto.startDate * 1000),
                endDate: new Date(eventDto.endDate * 1000),
                title: eventDto.title,
                tags: eventDto.tags,
                everyWeek: eventDto.everyWeek
            };
        });
    } else {
        if (filterTodayEvents)
            return Promise.reject(new Error("User today-events could not be obtained!"));
        else
            return Promise.reject(new Error("User events could not be obtained!"));
    }
}

async function getUserRecurrentEvents(): Promise<Event[]> {
    // For simplicity, let's just get all events and filter here instead of in the backend
    const allEvents = await getUserEvents(false);
    return allEvents.filter((event: Event) => event.everyWeek);
}

async function getStudyBlockHappeningNow(): Promise<Event | undefined> {

    function containsStudyTag(tags: string[]): boolean {
        return tags.includes("Revisão") || tags.includes("Leitura") || tags.includes("Exercícios / Prática") || tags.includes("Preparação de provas");
    }

    const recurrentEvents = await getUserRecurrentEvents();

    // Study blocks happening now!
    const now = new Date();
    return recurrentEvents.find((event: Event) =>
        containsStudyTag(event.tags) && event.startDate < now && event.endDate > now
    );
}

async function getUserTodayEvents(): Promise<Event[]> {
    return getUserEvents(true);
}

export type CreateScheduleNotAvailableBlock = {
    weekDay: number
    startHour: number
    duration: number
}

async function createScheduleNotAvailableBlock(info: CreateScheduleNotAvailableBlock) {
    const request = {
        path: `study-tracker/users/me/schedule/unavailable`,
        method: "POST",
        body: toJsonBody(info)
    };
    const response: Response = await doFetch(request);
    if (!response.ok)
        return Promise.reject(new Error("Unavailable Schedule Block creation failed!"));
}

export type TaskData = {
    title: string
    description: string | undefined
    deadline: Date | undefined
    priority: string
    tags: string[]
    status: string,
}

export type CreateTask = {
    taskData: TaskData
    subTasks: CreateTask[],
    createEvent: boolean
}

async function createNewTask(newTaskInfo: CreateTask): Promise<Task> {
    function toNewTaskBodyBody(newTaskInfo: CreateTask): any {
        return {
            title: newTaskInfo.taskData.title,
            description: newTaskInfo.taskData.description,
            deadline: newTaskInfo.taskData.deadline ? newTaskInfo.taskData.deadline.getTime() / 1000 : undefined,
            priority: newTaskInfo.taskData.priority,
            tags: newTaskInfo.taskData.tags,
            status: newTaskInfo.taskData.status,
            subTasks: newTaskInfo.subTasks.map((subTaskInfo: CreateTask) => toNewTaskBodyBody(subTaskInfo)),
            createEvent: newTaskInfo.createEvent
        };
    }

    const request = {
        path: `study-tracker/users/me/tasks`,
        method: "POST",
        body: toJsonBody(toNewTaskBodyBody(newTaskInfo))
    };

    // Backend returns the newly created Task!
    const response: Response = await doFetch(request);
    if (response.ok) {
        const responseObject: TaskDto = await response.json(); // TODO: how
        return fromTaskDtoToTask(responseObject);
    } else
        return Promise.reject(new Error("Task could not be created!"));
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
    const subTasks = dto.subTasks.map((dto: TaskDto) => fromTaskDtoToTask(dto));
    return {
        id: dto.id,
        data: {
            title: dto.title,
            description: dto.description,
            deadline: new Date(dto.deadline * 1000),
            priority: dto.priority,
            tags: dto.tags,
            status: dto.status
        },
        subTasks
    };
}

async function getTasks(filterUncompletedTasks: boolean): Promise<Task[]> {
    const request = {
        path: `study-tracker/users/me/tasks?order_by_deadline_and_priority=true`,
        method: "GET"
    };
    const response: Response = await doFetch(request);
    if (response.ok) {
        const responseObject: TaskDto[] = await response.json(); // TODO: how
        const tasks = responseObject.map((taskDto: TaskDto) => fromTaskDtoToTask(taskDto));

        // TODO: do filter on backend!
        if (filterUncompletedTasks)
            return tasks.filter((task: Task) => task.data.status != "Tarefa Completa");
        else
            return tasks;
    } else
        return Promise.reject(new Error("User tasks could not be obtained!"));
}

async function getTask(taskId: number): Promise<Task> {
    // For now, just fetch all tasks and return the one that we want

    const tasks = await getTasks(false);
    const task = tasks.find((task: Task) => task.id == taskId);
    if (task != undefined)
        return task;
    return Promise.reject(new Error(`Task with ID ${taskId} doesn't exist!`));
}

async function updateTaskStatus(taskId: number, newStatus: string) {
    const request = {
        path: `study-tracker/users/me/tasks/${taskId}`,
        method: "PUT",
        body: toJsonBody({ newStatus })
    };
    const response: Response = await doFetch(request);
    if (!response.ok)
        return Promise.reject(new Error("Task status could not be updated!"));
}

async function createArchive(name: string) {
    const request = {
        path: `study-tracker/users/me/archives`,
        method: "POST",
        body: toJsonBody({ name })
    };
    const response: Response = await doFetch(request);
    if (!response.ok)
        return Promise.reject(new Error("New archive could not be created!"));
}

export type File = {
    name: string,
    text: string
}

export type Archive = {
    name: string,
    files: File[]
}

async function getArchives(): Promise<Archive[]> {
    const request = {
        path: `study-tracker/users/me/archives`,
        method: "GET"
    };
    const response: Response = await doFetch(request);
    if (response.ok) {
        const responseObject: Archive[] = await response.json(); // TODO: how
        return responseObject;
    } else
        return Promise.reject(new Error("Archives could not be obtained!"));
}

async function getArchive(archiveName: string): Promise<Archive> {
    // To simplify for now...
    const archives = await getArchives();
    const archive = archives.find((archive: Archive) => archive.name == archiveName);
    if (archive == undefined)
        return Promise.reject(new Error("Archive does not exist!"));
    return archive;
}

async function createFile(archiveName: string, name: string) {
    const request = {
        path: `study-tracker/users/me/archives/${archiveName}`,
        method: "POST",
        body: toJsonBody({ name })
    };
    const response: Response = await doFetch(request);
    if (!response.ok)
        return Promise.reject(new Error("New file could not be created!"));
}

async function getFile(archiveName: string, filename: string): Promise<File> {
    // To simplify for now...

    const userArchives = await getArchives();
    const file = userArchives
        .find((archive: Archive) => archive.name == archiveName)?.files
        .find((file: File) => file.name == filename);

    if (file == undefined)
        return Promise.reject(new Error("File does not exist!"));
    return file;
}

async function updateFileContent(archiveName: string, name: string, newContent: string) {
    const request = {
        path: `study-tracker/users/me/archives/${archiveName}/files/${name}`,
        method: "PUT",
        body: toJsonBody({ content: newContent })
    };
    const response: Response = await doFetch(request);
    if (!response.ok)
        return Promise.reject(new Error("New file could not be created!"));
}

export type Grade = {
    value: number,
    weight: number
}

export type CurricularUnit = {
    name: string,
    grades: Grade[]
}

async function getCurricularUnits(): Promise<CurricularUnit[]> {
    const request = {
        path: `study-tracker/users/me/curricular-units`,
        method: "GET"
    };
    const response: Response = await doFetch(request);
    if (response.ok) {
        const responseObject: CurricularUnit[] = await response.json(); // TODO: how
        return responseObject;
    } else
        return Promise.reject(new Error("Curricular Units could not be obtained!"));
}

async function getCurricularUnit(name: string): Promise<CurricularUnit> {
    // To simplify for now...

    const curricularUnitList = await getCurricularUnits();
    const curricularUnit = curricularUnitList
        .find((cu: CurricularUnit) => cu.name == name);

    if (curricularUnit == undefined)
        return Promise.reject(new Error("Curricular Unit does not exist!"));
    return curricularUnit;
}

async function createCurricularUnit(name: string) {
    const request = {
        path: `study-tracker/users/me/curricular-units`,
        method: "POST",
        body: toJsonBody({ name })
    };
    const response: Response = await doFetch(request);
    if (!response.ok)
        return Promise.reject(new Error("New Curricular Unit could not be created!"));
}

async function createGrade(curricularUnit: string, value: number, weight: number) {
    const request = {
        path: `study-tracker/users/me/curricular-units/${curricularUnit}/grades`,
        method: "POST",
        body: toJsonBody({ value, weight })
    };
    const response: Response = await doFetch(request);
    if (!response.ok)
        return Promise.reject(new Error("New Curricular Unit could not be created!"));
}

export const service = {
    login,
    testTokenValidity,
    createUser,
    selectShareProgressState,
    selectAvatar,
    fetchUserInfoFromApi: fetchUserInfo,
    updateAppUseGoals,
    updateReceiveNotificationsPreference,
    updateWeekPlanningDay,
    createNewEvent,
    getUserEvents,
    getUserRecurrentEvents,
    getStudyBlockHappeningNow,
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
    getCurricularUnit,
    createCurricularUnit,
    createGrade
};