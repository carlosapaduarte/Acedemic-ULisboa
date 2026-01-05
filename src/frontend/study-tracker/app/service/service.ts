import { doFetch, toJsonBody } from "./fetch";
import { NotAuthorizedError } from "~/service/error";
import { CreateTaskInputDto, SlotToWorkDto } from "~/service/output_dtos";
import { utils } from "~/utils";

export type LoginResult = {
  access_token: string;
  token_type: string;
};

export interface Tag {
  id: string;
  name_pt: string;
  name_en?: string;
  user_id: number;
  color?: string;
  is_uc: boolean;
}

export type AuthErrorType =
  | "USERNAME_ALREADY_EXISTS"
  | "INVALID_USERNAME_OR_PASSWORD"
  | "INVALID_FORMAT"
  | "USER_CREATION_FAILED"
  | "LOGIN_FAILED"
  | "TAG_ALREADY_EXISTS_FOR_USER"
  | "TAG_NAME_ALREADY_EXISTS_GLOBAL";

type AuthErrorField = "username" | "password" | "tag_name" | "general";

const AUTH_ERROR_MESSAGES: Record<AuthErrorType, string> = {
  USERNAME_ALREADY_EXISTS: "Username already exists!",
  INVALID_USERNAME_OR_PASSWORD: "Invalid username or password!",
  INVALID_FORMAT: "Invalid format of username or password!",
  USER_CREATION_FAILED: "User creation was not possible!",
  LOGIN_FAILED: "Login failed!",
  TAG_ALREADY_EXISTS_FOR_USER: "You already have this tag.",
  TAG_NAME_ALREADY_EXISTS_GLOBAL:
    "A tag with this name already exists. Please choose a unique name.",
};

export class AuthError extends Error {
  type: AuthErrorType;
  field: AuthErrorField;

  constructor(type: AuthErrorType, field: AuthErrorField) {
    super(AUTH_ERROR_MESSAGES[type]);
    this.name = "AuthError";
    this.type = type;
    this.field = field;
  }
}

/**
 * Makes an API request, using credentials, to create a JWT token, which
 * should be used on sub-sequenced calls, as an authorization mechanism.
 */
async function login(username: string, password: string) {
  const formData = new FormData();
  formData.append("username", username);
  formData.append("password", password);

  const request = {
    path: "commons/token",
    method: "POST",
    body: formData,
  };

  const response: Response = await doFetch(request).catch((error) => {
    if (error instanceof NotAuthorizedError) {
      return Promise.reject(
        new AuthError("INVALID_USERNAME_OR_PASSWORD", "password")
      );
    }
    return Promise.reject(new AuthError("LOGIN_FAILED", "password"));
  });

  if (response.ok) {
    const responseObject: LoginResult = await response.json();
    localStorage["jwt"] = responseObject.access_token;
  } else {
    if (response.status == 400)
      return Promise.reject(new AuthError("INVALID_FORMAT", "password"));
    else if (response.status == 401)
      return Promise.reject(
        new AuthError("INVALID_USERNAME_OR_PASSWORD", "password")
      );
    return Promise.reject(new AuthError("LOGIN_FAILED", "password"));
  }
}

async function testTokenValidity() {
  const request = {
    path: "commons/test-token",
    method: "GET",
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
    body: toJsonBody({ username, password }),
  };
  const response: Response = await doFetch(request);

  if (!response.ok) {
    if (response.status == 409)
      return Promise.reject(
        new AuthError("USERNAME_ALREADY_EXISTS", "username")
      );
    else if (response.status == 400)
      return Promise.reject(
        new AuthError("INVALID_USERNAME_OR_PASSWORD", "password")
      );

    return Promise.reject(new AuthError("USER_CREATION_FAILED", "password"));
  }
}

async function selectShareProgressState(shareProgress: boolean) {
  const request = {
    path: `commons/users/me/publish-state`,
    method: "PUT",
    body: toJsonBody({ shareProgress }),
  };
  const response: Response = await doFetch(request);
  if (!response.ok)
    return Promise.reject(
      new Error("Progress share preference selection failed!")
    );
}

async function selectAvatar(avatarFilename: string) {
  const request = {
    path: `commons/users/me/avatar`,
    method: "PUT",
    body: toJsonBody({ avatarFilename }),
  };
  const response: Response = await doFetch(request);
  if (!response.ok)
    return Promise.reject(new Error("Avatar selection failed!"));
}

// User info
export type UserInfo = {
  id: number;
  username: string;
  level: number;
  startDate: number;
  shareProgress: boolean;
  avatarFilename: string;
  custom_colors?: string[];
};

async function fetchUserInfo(): Promise<UserInfo> {
  const request = {
    path: `commons/users/me`,
    method: "GET",
  };
  const response: Response = await doFetch(request);

  if (response.ok) {
    const responseObject: UserInfo = await response.json();
    return responseObject;
  } else return Promise.reject(new Error("User info could not be obtained!"));
}

async function updateAppUseGoals(uses: Set<number>) {
  const usesList = Array.from(uses);
  const request = {
    path: `study-tracker/users/me/use-goals`,
    method: "PUT",
    body: toJsonBody({ uses: usesList }),
  };
  const response: Response = await doFetch(request);

  if (response.ok) {
    const responseObject: UserInfo = await response.json();
    return responseObject;
  } else
    return Promise.reject(new Error("App use goals could not be updated!"));
}

export enum BinaryAnswer {
  YES,
  NO,
}

async function updateReceiveNotificationsPreference(answer: BinaryAnswer) {
  const request = {
    path: `study-tracker/users/me/receive-notifications-pref`,
    method: "PUT",
    body: toJsonBody({ receive: answer }),
  };
  const response: Response = await doFetch(request);
  if (!response.ok)
    return Promise.reject(
      new Error("Receive notifications preference could not be updated!")
    );
}

async function updateWeekPlanningDay(day: number, hour: number) {
  if (day < 0 || day > 6)
    return Promise.reject(
      new Error("Day " + day + " is not a valid week day!")
    );

  const request = {
    path: `study-tracker/users/me/week-planning-day`,
    method: "PUT",
    body: toJsonBody({ day, hour }),
  };
  const response: Response = await doFetch(request);
  if (!response.ok)
    return Promise.reject(new Error("Week planning day could not be updated!"));
}

export type NewEventInfo = {
  title: string;
  startDate: Date;
  endDate: Date;
  tags: string[];
  everyWeek: boolean;
  everyDay: boolean;
  notes: string;
  color?: string;
  is_uc: boolean;
  recurrenceStart?: Date;
  recurrenceEnd?: Date;
};

async function createNewEvent(newEventInfo: NewEventInfo) {
  const request = {
    path: `study-tracker/users/me/events`,
    method: "POST",
    body: toJsonBody({
      title: newEventInfo.title,
      startDate: newEventInfo.startDate.getTime() / 1000,
      endDate: newEventInfo.endDate.getTime() / 1000,
      tags: newEventInfo.tags,
      everyWeek: newEventInfo.everyWeek,
      everyDay: newEventInfo.everyDay,
      notes: newEventInfo.notes,
      color: newEventInfo.color,
      is_uc: newEventInfo.is_uc,
      recurrenceStart: newEventInfo.recurrenceStart
        ? newEventInfo.recurrenceStart.getTime() / 1000
        : undefined,
      recurrenceEnd: newEventInfo.recurrenceEnd
        ? newEventInfo.recurrenceEnd.getTime() / 1000
        : undefined,
    }),
  };

  try {
    const response: Response = await doFetch(request);
    if (!response.ok) {
      console.error("Service: Falha ao criar novo evento. Resposta:", response);
      try {
        const errorText = await response.text();
        console.error("Service: Resposta de erro do backend:", errorText);
      } catch (e) {
        console.error(
          "Service: Não foi possível ler o texto do erro da resposta."
        );
      }
      throw new Error("New event could not be created!");
    }
  } catch (error) {
    console.error("Service: Erro durante a criação do evento:", error);
    return Promise.reject(error);
  }
}

type EventDto = {
  id: number;
  startDate: number;
  endDate: number;
  title: string;
  tags: string[];
  everyWeek: boolean;
  everyDay: boolean;
  color?: string;
  notes: string;
  task_id?: number;
  is_uc: boolean;
  recurrenceStart?: number;
  recurrenceEnd?: number;
};

export type Event = {
  id: number;
  startDate: Date;
  endDate: Date;
  title: string;
  tags: string[];
  everyWeek: boolean;
  everyDay: boolean;
  color: string;
  notes: string;
  task_id?: number;
  is_uc: boolean;
  recurrenceStart?: Date;
  recurrenceEnd?: Date;
};

export type UpdateEventInputDto = {
  title: string;
  startDate: Date;
  endDate: Date;
  tags: string[];
  everyWeek: boolean;
  everyDay: boolean;
  notes: string;
  color?: string;
  is_uc: boolean;
  recurrenceStart?: Date;
  recurrenceEnd?: Date;
};

async function updateEvent(eventId: number, inputDto: UpdateEventInputDto) {
  const request = {
    path: `study-tracker/users/me/events/${eventId}`,
    method: "PUT",
    body: toJsonBody({
      title: inputDto.title,
      startDate: inputDto.startDate.getTime() / 1000,
      endDate: inputDto.endDate.getTime() / 1000,
      tags: inputDto.tags,
      everyWeek: inputDto.everyWeek,
      everyDay: inputDto.everyDay,
      notes: inputDto.notes,
      color: inputDto.color,
      is_uc: inputDto.is_uc,
      recurrenceStart: inputDto.recurrenceStart
        ? inputDto.recurrenceStart.getTime() / 1000
        : undefined,
      recurrenceEnd: inputDto.recurrenceEnd
        ? inputDto.recurrenceEnd.getTime() / 1000
        : undefined,
    }),
  };
  const response: Response = await doFetch(request);
  if (!response.ok)
    return Promise.reject(new Error("Event could not be updated!"));
}

async function deleteEvent(eventId: number) {
  const request = {
    path: `study-tracker/users/me/events/${eventId}`,
    method: "DELETE",
  };
  const response: Response = await doFetch(request);
  if (!response.ok)
    return Promise.reject(new Error("Event could not be deleted!"));
}

async function getUserEvents(
  filterTodayEvents: boolean,
  filterRecurrentEvents: boolean
): Promise<Event[]> {
  const request = {
    path: `study-tracker/users/me/events?today=${filterTodayEvents}&recurrentEvents=${filterRecurrentEvents}`,
    method: "GET",
  };
  const response: Response = await doFetch(request);

  if (response.ok) {
    const responseObject: EventDto[] = await response.json();
    return responseObject.map((eventDto: EventDto) => {
      return {
        id: eventDto.id,
        startDate: new Date(eventDto.startDate * 1000),
        endDate: new Date(eventDto.endDate * 1000),
        title: eventDto.title,
        tags: eventDto.tags,
        everyWeek: eventDto.everyWeek,
        everyDay: eventDto.everyDay,
        notes: eventDto.notes,
        color: eventDto.color || "#3399FF",
        task_id: eventDto.task_id,
        is_uc: eventDto.is_uc,
        recurrenceStart: eventDto.recurrenceStart
          ? new Date(eventDto.recurrenceStart * 1000)
          : undefined,
        recurrenceEnd: eventDto.recurrenceEnd
          ? new Date(eventDto.recurrenceEnd * 1000)
          : undefined,
      };
    });
  } else {
    if (filterTodayEvents)
      return Promise.reject(
        new Error("User today-events could not be obtained!")
      );
    else return Promise.reject(new Error("User events could not be obtained!"));
  }
}

async function getAllUserEvents(): Promise<Event[]> {
  const normalEvents = await getUserEvents(false, false);
  const recurrentEvents = await getUserEvents(false, true);
  return [...normalEvents, ...recurrentEvents];
}

async function getStudyBlockHappeningNow(): Promise<Event | undefined> {
  function containsStudyTag(tags: string[]): boolean {
    return (
      tags.includes("Revisão") ||
      tags.includes("Leitura") ||
      tags.includes("Exercícios / Prática") ||
      tags.includes("Preparação de provas")
    );
  }

  const recurrentEvents = await getUserEvents(false, true);

  const now = new Date();
  return recurrentEvents.find(
    (event: Event) =>
      containsStudyTag(event.tags) &&
      event.startDate < now &&
      event.endDate > now
  );
}

async function getUserTodayEvents(): Promise<Event[]> {
  return getUserEvents(true, false);
}

export type CreateScheduleNotAvailableBlock = {
  weekDay: number;
  startHour: number;
  duration: number;
};

async function createScheduleNotAvailableBlock(
  info: CreateScheduleNotAvailableBlock
) {
  const request = {
    path: `study-tracker/users/me/schedule/unavailable`,
    method: "POST",
    body: toJsonBody(info),
  };
  const response: Response = await doFetch(request);
  if (!response.ok)
    return Promise.reject(
      new Error("Unavailable Schedule Block creation failed!")
    );
}

export type TaskData = {
  title: string;
  description: string | undefined;
  deadline: Date | undefined;
  priority: string;
  tags: string[];
  status: string;
  is_micro_task: boolean;
  completed_at?: string;
};

function requestBody(newTaskInfo: CreateTaskInputDto): any {
  return {
    title: newTaskInfo.title,
    description: newTaskInfo.description,
    deadline: newTaskInfo.deadline
      ? newTaskInfo.deadline.getTime() / 1000
      : undefined,
    priority: newTaskInfo.priority,
    tags: newTaskInfo.tags,
    status: newTaskInfo.status,
    is_micro_task: newTaskInfo.is_micro_task,
    subTasks: newTaskInfo.subTasks.map((subTaskInfo: CreateTaskInputDto) =>
      requestBody(subTaskInfo)
    ),
    slotsToWork: newTaskInfo.slotsToWork.map((slot: SlotToWorkDto) => {
      return {
        startTime: slot.start.getTime() / 1000,
        endTime: slot.end.getTime() / 1000,
      };
    }),
  };
}

async function createNewTask(newTaskInfo: CreateTaskInputDto): Promise<Task> {
  const request = {
    path: `study-tracker/users/me/tasks`,
    method: "POST",
    body: toJsonBody(requestBody(newTaskInfo)),
  };

  const response: Response = await doFetch(request);
  if (response.ok) {
    const responseObject: TaskDto = await response.json();
    return fromTaskDtoToTask(responseObject);
  } else return Promise.reject(new Error("Task could not be created!"));
}

async function updateTask(
  taskId: number,
  newTaskInfo: CreateTaskInputDto,
  previousTaskName: string
) {
  function toUpdateTaskInputDto(
    newTaskInfo: CreateTaskInputDto,
    previousTaskName: string
  ): any {
    return {
      previous_task_name: previousTaskName,
      updated_task: requestBody(newTaskInfo),
    };
  }

  const request = {
    path: `study-tracker/users/me/tasks/${taskId}`,
    method: "PUT",
    body: toJsonBody(toUpdateTaskInputDto(newTaskInfo, previousTaskName)),
  };

  const response: Response = await doFetch(request);
  if (response.ok) {
    await response.json();
  } else return Promise.reject(new Error("Task could not be updated!"));
}

export type Task = {
  id: number;
  data: TaskData;
  subTasks: Task[];
};

export type TaskDto = {
  id: number;
  title: string;
  description: string;
  deadline: number | undefined;
  priority: string;
  tags: string[];
  status: string;
  is_micro_task: boolean;
  completed_at: number | undefined | null;
  subTasks: TaskDto[];
};

function fromTaskDtoToTask(dto: TaskDto): Task {
  const subTasks = dto.subTasks.map((dto: TaskDto) => fromTaskDtoToTask(dto));
  return {
    id: dto.id,
    data: {
      title: dto.title,
      description: dto.description,
      deadline: dto.deadline ? new Date(dto.deadline * 1000) : undefined,
      priority: dto.priority,
      tags: dto.tags,
      status: dto.status,
      is_micro_task: dto.is_micro_task,
      completed_at: dto.completed_at
        ? new Date(dto.completed_at * 1000).toISOString()
        : undefined,
    },
    subTasks,
  };
}

async function getTasks(filterUncompletedTasks: boolean): Promise<Task[]> {
  const request = {
    path: `study-tracker/users/me/tasks?orderByDeadlineAndPriority=true&filterUncompletedTasks=${filterUncompletedTasks}`,
    method: "GET",
  };
  const response: Response = await doFetch(request);
  if (response.ok) {
    const responseObject: TaskDto[] = await response.json();
    const tasks = responseObject.map((taskDto: TaskDto) =>
      fromTaskDtoToTask(taskDto)
    );
    return tasks;
  } else return Promise.reject(new Error("User tasks could not be obtained!"));
}

export type DailyTasksProgress = {
  date: Date;
  progress: number;
};

async function getDailyTasksProgress(): Promise<DailyTasksProgress[]> {
  function fromDtoToDomain(rsp: any[]): DailyTasksProgress[] {
    return rsp.map((value: any) => {
      return {
        date: new Date(value.date_ * 1000),
        progress: value.progress,
      };
    });
  }

  const now = new Date();
  const request = {
    path: `study-tracker/users/me/statistics/daily-tasks-progress?year=${now.getFullYear()}&week=${utils.getWeekNumber(
      now
    )}`,
    method: "GET",
  };
  const response: Response = await doFetch(request);
  if (response.ok) {
    const responseObject: any[] = await response.json();
    return fromDtoToDomain(responseObject);
  } else return Promise.reject(new Error("User tasks could not be obtained!"));
}

async function getTask(taskId: number): Promise<Task> {
  const request = {
    path: `study-tracker/users/me/tasks/${taskId}`,
    method: "GET",
  };
  const response: Response = await doFetch(request);
  if (response.ok) {
    const responseObject: TaskDto = await response.json();
    return fromTaskDtoToTask(responseObject);
  } else {
    return Promise.reject(new Error(`Task with ID ${taskId} doesn't exist!`));
  }
}

async function updateTaskStatus(taskId: number, newStatus: string) {
  const request = {
    path: `study-tracker/users/me/tasks/${taskId}/status`,
    method: "PUT",
    body: toJsonBody({ newStatus }),
  };
  const response: Response = await doFetch(request);
  if (!response.ok)
    return Promise.reject(new Error("Task status could not be updated!"));
}

async function deleteTask(taskId: number): Promise<void> {
  const request = {
    path: `study-tracker/users/me/tasks/${taskId}`,
    method: "DELETE",
  };
  const response: Response = await doFetch(request);
  if (!response.ok) {
    return Promise.reject(new Error("Task could not be deleted!"));
  }
}

async function createArchive(name: string) {
  const request = {
    path: `study-tracker/users/me/archives`,
    method: "POST",
    body: toJsonBody({ name }),
  };
  const response: Response = await doFetch(request);
  if (!response.ok)
    return Promise.reject(new Error("New archive could not be created!"));
}

export type File = {
  name: string;
  text: any;
};

export type Archive = {
  name: string;
  files: File[];
};

async function getArchives(): Promise<Archive[]> {
  const request = {
    path: `study-tracker/users/me/archives`,
    method: "GET",
  };
  const response: Response = await doFetch(request);
  if (response.ok) {
    const responseObject: Archive[] = await response.json();
    return responseObject;
  } else return Promise.reject(new Error("Archives could not be obtained!"));
}

async function getArchive(archiveName: string): Promise<Archive> {
  const userArchives = await getArchives();
  const archive = userArchives.find(
    (archive: Archive) => archive.name == archiveName
  );
  if (archive == undefined)
    return Promise.reject(new Error("Archive does not exist!"));
  return archive;
}

async function createFile(archiveName: string, name: string) {
  const request = {
    path: `study-tracker/users/me/archives/${archiveName}`,
    method: "POST",
    body: toJsonBody({ name }),
  };
  const response: Response = await doFetch(request);
  if (!response.ok)
    return Promise.reject(new Error("New file could not be created!"));
}

async function getFile(archiveName: string, filename: string): Promise<File> {
  const userArchives = await getArchives();
  const file = userArchives
    .find((archive: Archive) => archive.name == archiveName)
    ?.files.find((file: File) => file.name == filename);

  if (file == undefined)
    return Promise.reject(new Error("File does not exist!"));
  return file;
}

async function updateFileContent(
  archiveName: string,
  name: string,
  newContent: string
) {
  const request = {
    path: `study-tracker/users/me/archives/${archiveName}/files/${name}`,
    method: "PUT",
    body: toJsonBody({ content: newContent }),
  };
  const response: Response = await doFetch(request);
  if (!response.ok)
    return Promise.reject(new Error("New file could not be created!"));
}

export type Grade = {
  id: number;
  value: number;
  weight: number;
};

export type CurricularUnit = {
  name: string;
  grades: Grade[];
};

async function getCurricularUnits(): Promise<CurricularUnit[]> {
  const request = {
    path: `study-tracker/users/me/curricular-units`,
    method: "GET",
  };
  const response: Response = await doFetch(request);
  if (response.ok) {
    const responseObject: CurricularUnit[] = await response.json();
    return responseObject;
  } else
    return Promise.reject(new Error("Curricular Units could not be obtained!"));
}

async function getCurricularUnit(name: string): Promise<CurricularUnit> {
  const curricularUnitList = await getCurricularUnits();
  const curricularUnit = curricularUnitList.find(
    (cu: CurricularUnit) => cu.name == name
  );

  if (curricularUnit == undefined)
    return Promise.reject(new Error("Curricular Unit does not exist!"));
  return curricularUnit;
}

async function createCurricularUnit(name: string) {
  const request = {
    path: `study-tracker/users/me/curricular-units`,
    method: "POST",
    body: toJsonBody({ name }),
  };
  const response: Response = await doFetch(request);
  if (!response.ok)
    return Promise.reject(
      new Error("New Curricular Unit could not be created!")
    );
}

async function createGrade(
  curricularUnit: string,
  value: number,
  weight: number
) {
  const request = {
    path: `study-tracker/users/me/curricular-units/${curricularUnit}/grades`,
    method: "POST",
    body: toJsonBody({ value, weight }),
  };
  const response: Response = await doFetch(request);
  if (!response.ok)
    return Promise.reject(
      new Error("New Curricular Unit could not be created!")
    );
}

async function deleteGrade(curricularUnitName: string, gradeId: number) {
  const request = {
    path: `study-tracker/users/me/curricular-units/${curricularUnitName}/grades/${gradeId}`,
    method: "DELETE",
  };
  const response: Response = await doFetch(request);
  if (!response.ok)
    return Promise.reject(new Error("Grade could not be deleted!"));
}

export enum TimeOfDay {
  MORNING,
  AFTERNOON,
  NIGHT,
}

async function createDailyEnergyStat(
  energyLevel: number,
  timeOfDay: TimeOfDay
) {
  function toStr(timeOfDay: TimeOfDay): string {
    if (timeOfDay == TimeOfDay.MORNING) return "morning";
    if (timeOfDay == TimeOfDay.AFTERNOON) return "afternoon";
    return "night";
  }

  const today = new Date();
  const request = {
    path: `study-tracker/users/me/statistics/daily-energy-status`,
    method: "POST",
    body: toJsonBody({
      date: today.getTime() / 1000,
      timeOfDay: toStr(timeOfDay),
      level: energyLevel,
    }),
  };
  const response: Response = await doFetch(request);
  if (!response.ok)
    return Promise.reject(
      new Error("Energy level daily statistic could not be submitted!")
    );
}

async function submitDailyTags(tags: string[]) {
  const request = {
    path: `study-tracker/users/me/statistics/daily-tags`,
    method: "POST",
    body: toJsonBody({ tags }),
  };
  const response: Response = await doFetch(request);
  if (!response.ok)
    return Promise.reject(new Error("Daily tags could not be submitted!"));
}

async function getDailyTags(): Promise<string[]> {
  const request = {
    path: `study-tracker/users/me/statistics/daily-tags`,
    method: "GET",
  };
  const response: Response = await doFetch(request);
  if (response.ok) {
    const responseObject: string[] = await response.json();
    return responseObject;
  } else
    return Promise.reject(
      new Error("Could not obtain task distribution statistics!")
    );
}

export type TaskDistributionPerWeek = {
  year: number;
  week: number;
  tag: string;
  time: number;
};

async function getTaskDistributionStats(): Promise<TaskDistributionPerWeek[]> {
  function toDomain(obj: any): TaskDistributionPerWeek[] {
    const stats: TaskDistributionPerWeek[] = [];

    for (const [year, weeksObj] of Object.entries<any>(obj)) {
      for (const [week, tagsObj] of Object.entries<any>(weeksObj)) {
        for (const [tag, time] of Object.entries(tagsObj)) {
          stats.push({
            year: Number(year),
            week: Number(week),
            tag,
            time: Number(time),
          });
        }
      }
    }
    return stats;
  }

  const request = {
    path: `study-tracker/users/me/statistics/time-by-event-tag`,
    method: "GET",
  };
  const response: Response = await doFetch(request);
  if (response.ok) {
    const responseObject: CurricularUnit[] = await response.json();
    return toDomain(responseObject);
  } else
    return Promise.reject(
      new Error("Could not obtain task distribution statistics!")
    );
}

export type DailyEnergyStatus = {
  date: Date;
  level: number;
};
type DailyEnergyStatusDto = {
  date: number;
  level: number;
};

async function fetchEnergyHistory(): Promise<DailyEnergyStatus[]> {
  function toDomain(value: DailyEnergyStatusDto): DailyEnergyStatus {
    return {
      date: new Date(value.date * 1000),
      level: value.level,
    };
  }

  const request = {
    path: `study-tracker/users/me/statistics/daily-energy-status`,
    method: "GET",
  };
  const response: Response = await doFetch(request);
  if (response.ok) {
    const responseObject: DailyEnergyStatusDto[] = await response.json();
    return responseObject.map((value) => toDomain(value));
  } else
    return Promise.reject(new Error("Could not obtain user energy history!"));
}

export type WeekTimeStudy = {
  year: number;
  week: number;
  total: number;
  averageBySession: number;
  target: number;
};

async function getStudyTimeByWeek(): Promise<WeekTimeStudy[]> {
  const request = {
    path: `study-tracker/users/me/statistics/week-study-time`,
    method: "GET",
  };
  const response: Response = await doFetch(request);
  if (response.ok) {
    const responseObject: WeekTimeStudy[] = await response.json();
    return responseObject;
  } else
    return Promise.reject(
      new Error("Could not obtain total time study this week!")
    );
}

async function startStudySession() {
  const request = {
    path: `study-tracker/users/me/week-study-time-session`,
    method: "PUT",
  };
  const response: Response = await doFetch(request);
  if (!response.ok)
    return Promise.reject(new Error("Could not start study session!"));
}

async function finishStudySession() {
  const request = {
    path: `study-tracker/users/me/week-study-time-session`,
    method: "DELETE",
  };
  const response: Response = await doFetch(request);
  if (!response.ok)
    return Promise.reject(new Error("Could not finish study session!"));
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
  updateEvent,
  deleteEvent,
  getUserEvents,
  getAllUserEvents,
  getStudyBlockHappeningNow,
  getUserTodayEvents,
  createScheduleNotAvailableBlock,
  getTasks,
  getTask,
  createNewTask,
  updateTask,
  updateTaskStatus,
  deleteTask,
  createArchive,
  getArchives,
  getArchive,
  createFile,
  getFile,
  updateFileContent,
  getCurricularUnits,
  getCurricularUnit,
  createCurricularUnit,
  createGrade,
  deleteGrade,
  createDailyEnergyStat,
  submitDailyTags,
  getDailyTags,
  getTaskDistributionStats,
  getThisWeekDailyTasksProgress: getDailyTasksProgress,
  fetchEnergyHistory,
  getStudyTimeByWeek,
  startStudySession,
  finishStudySession,

  async fetchUserTags(): Promise<Tag[]> {
    try {
      const request = {
        path: "commons/users/me/tags",
        method: "GET",
      };
      const response = await doFetch(request);
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(
          `Failed to fetch user tags: ${response.status} ${response.statusText} - ${errorText}`
        );
      }
      return response.json();
    } catch (error) {
      console.error("Erro ao buscar tags:", error);
      throw error;
    }
  },

  async createTag(tagData: {
    name: string;
    color: string;
    description?: string;
  }): Promise<Tag> {
    const request = {
      path: `commons/users/me/tags`,
      method: "POST",
      body: toJsonBody(tagData),
    };
    const response = await doFetch(request);

    if (!response.ok) {
      const errorData = await response
        .json()
        .catch(() => ({ message: "Erro desconhecido da API." }));
      console.error("API respondeu com erro:", response.status, errorData);
      if (response.status === 409) {
        const error = new Error("TagAlreadyExists");
        (error as any).type = "TAG_ALREADY_EXISTS_FOR_USER";
        throw error;
      } else if (response.status === 400) {
        throw new Error(errorData.message || "Dados inválidos para criar tag.");
      } else {
        throw new Error(
          errorData.message || `Erro do servidor: ${response.status}`
        );
      }
    }
    return response.json();
  },

  async updateTag(
    tagId: string | number,
    tagData: { name: string; color: string; description?: string }
  ): Promise<Tag> {
    const request = {
      path: `commons/users/me/tags/${tagId}`,
      method: "PUT",
      body: toJsonBody(tagData),
    };
    const response = await doFetch(request);

    if (!response.ok) {
      throw new Error("Falha ao atualizar tag");
    }
    return response.json();
  },

  async deleteTag(tagId: number): Promise<void> {
    try {
      const request = {
        path: `commons/users/me/tags/${tagId}`,
        method: "DELETE",
      };
      const response = await doFetch(request);
    } catch (error) {
      console.error(`Erro ao apagar tag com ID ${tagId}:`, error);
      throw error;
    }
  },

  async updateUserCustomColors(colors: string[]): Promise<string[]> {
    const request = {
      path: `commons/users/me/colors`,
      method: "PUT",
      body: toJsonBody({ colors }),
    };
    const response = await doFetch(request);

    if (response.ok) {
      const data = await response.json();
      return data.colors;
    } else {
      throw new Error("Failed to update custom colors");
    }
  },
};
