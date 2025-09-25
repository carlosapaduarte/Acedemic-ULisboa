from dataclasses import Field
from typing import List, Optional
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
    tags: Optional[List[str]] = None
    everyWeek: bool
    everyDay: bool = False
    notes: str | None
    color: str = "#3399FF"

class UpdateEventInputDto(BaseModel):
    startDate: float
    endDate: float
    title: str
    tags: list[str]
    everyWeek: bool
    everyDay: bool = False
    notes: Optional[str] = None
    color: str = None

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
    description: str | None = None
    deadline: float | None = None
    priority: str
    tags: list[str]
    status: str
    subTasks: list['CreateTaskInputDto']
    slotsToWork: list[SlotToWorkInputDto] | None = []

class EditTaskInputDto(BaseModel):
    previous_task_name: str
    updated_task: CreateTaskInputDto
    
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
    
class CreateDailyEnergyStatus(BaseModel):
    level: int
    timeOfDay: str
    
class CreateDailyTags(BaseModel):
    tags: list[str]
    
class UpdateWeekStudyTime(BaseModel):
    year: int
    week: int
    time: int
    
class CreateTagInputDto(BaseModel):
    name: str
    color: str

class UpdateTagInputDto(BaseModel):
    name: str
    color: str