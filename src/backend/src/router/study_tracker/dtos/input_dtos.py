from pydantic import BaseModel


class SetStudyTrackerAppUseGoalsInputDto(BaseModel):
    uses: set # Why can't I just write Set<int>?

class UpdateStudyTrackerReceiveNotificationsPrefInputDto(BaseModel):
    receive: bool

class UpdateStudyTrackerWeekPlanningDayInputDto(BaseModel):
    day: int
    hour: int

class CreateNewStudyTrackerTaskInputDto(BaseModel):
    start_date: float
    end_date: float
    title: str
    tag: str