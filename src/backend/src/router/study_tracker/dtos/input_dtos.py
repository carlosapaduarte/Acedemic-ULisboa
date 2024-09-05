from pydantic import BaseModel


class SetStudyTrackerAppUseGoalsInputDto(BaseModel):
    uses: set[int]

class UpdateStudyTrackerReceiveNotificationsPrefInputDto(BaseModel):
    receive: bool

class UpdateStudyTrackerWeekPlanningDayInputDto(BaseModel):
    day: int
    hour: int

class CreateEventInputDto(BaseModel):
    startDate: float
    endDate: float
    title: str
    tags: list[str]

class CreateScheduleNotAvailableBlock(BaseModel):
    weekDay: int
    startHour: int
    duration: int
    
class SubTaskInputDto(BaseModel):
    title: str
    status: str

class CreateTaskInputDto(BaseModel):
    title: str
    description: str
    deadline: float
    priority: str
    tags: list[str]
    status: str
    subTasks: list[SubTaskInputDto]
    createEvent: bool

class UpdateTaskStatus(BaseModel):
    new_status: str