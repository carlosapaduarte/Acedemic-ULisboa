from dataclasses import Field
from typing import List, Optional
from pydantic import BaseModel, model_validator

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
    is_uc: bool = False
    recurrenceStart: Optional[float] = None
    recurrenceEnd: Optional[float] = None

class UpdateEventInputDto(BaseModel):
    startDate: float
    endDate: float
    title: str
    tags: list[str]
    everyWeek: bool
    everyDay: bool = False
    notes: Optional[str] = None
    color: str = None
    is_uc: bool = False
    recurrenceStart: Optional[float] = None
    recurrenceEnd: Optional[float] = None

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
    is_micro_task: Optional[bool] = False
    parent_task_id: Optional[int] = None

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
    
class CreateMoodLogInputDto(BaseModel):
    value: int          # Painel 1 (1-5)
    label: str          # Painel 1 (Texto)
    emotions: List[str] # Painel 2 (Tags)
    impacts: List[str]  # Painel 3 (Tags)
    date: float
    
class CreateDailyTags(BaseModel):
    tags: list[str]
    
class UpdateWeekStudyTime(BaseModel):
    year: int
    week: int
    time: int
    
class CreateTagInputDto(BaseModel):
    name_pt: Optional[str] = None
    name_en: Optional[str] = None
    color: Optional[str] = None
    is_uc: bool = False
    @model_validator(mode='before')
    @classmethod
    def check_at_least_one_name(cls, data: dict):
        # Valida se pelo menos um dos nomes foi fornecido
        if not data.get('name_pt') and not data.get('name_en'):
            raise ValueError('É necessário fornecer pelo menos um nome para a etiqueta (name_pt ou name_en).')
        return data

class UpdateTagInputDto(BaseModel):
    name_pt: Optional[str] = None
    name_en: Optional[str] = None
    color: Optional[str] = None

    @model_validator(mode='before')
    @classmethod
    def check_at_least_one_name(cls, data: dict):
        # Valida se pelo menos um dos nomes foi fornecido
        if not data.get('name_pt') and not data.get('name_en'):
            raise ValueError('É necessário fornecer pelo menos um nome para a etiqueta (name_pt ou name_en).')
        return data