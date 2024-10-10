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
    everyWeek: bool

class CreateScheduleNotAvailableBlockInputDto(BaseModel):
    weekDay: int
    startHour: int
    duration: int
    
"""
class CreateScheduleBlockInputDto(BaseModel):
    title: str
    startDate: float
    endDate: float
"""

class SlotToWorkInputDto(BaseModel):
    startTime: float
    endTime: float

class CreateTaskInputDto(BaseModel):
    title: str
    description: str
    deadline: float
    priority: str
    tags: list[str]
    status: str
    subTasks: list['CreateTaskInputDto']
    slotsToWork: list[SlotToWorkInputDto] | None = []

class UpdateTaskStatus(BaseModel):
    newStatus: str
    
class CreateArchiveInputDto(BaseModel):
    name: str
    
class CreateFileInputDto(BaseModel):
    name: str
    
class UpdateFileInputDto(BaseModel):
    content: str
    
class CreateCurricularUnitInputDto(BaseModel):
    name: str
    
class CreateGradeInputDto(BaseModel):
    value: float
    weight: float
    
class CreateDailyEnergyStat(BaseModel):
    date: float
    energyLevel: int