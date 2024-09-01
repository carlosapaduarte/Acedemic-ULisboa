from pydantic import BaseModel


class SetStudyTrackerAppUseGoalsInputDto(BaseModel):
    uses: set # Why can't I just write Set<int>?

class UpdateStudyTrackerReceiveNotificationsPrefInputDto(BaseModel):
    receive: bool

class UpdateStudyTrackerWeekPlanningDayInputDto(BaseModel):
    day: int
    hour: int

class CreateNewStudyTrackerTaskInputDto(BaseModel):
    startDate: float
    endDate: float
    title: str
    tags: list[str]

class CreateScheduleNotAvailableBlock(BaseModel):
    weekDay: int
    startHour: int
    duration: int