from typing import Set
from pydantic import BaseModel

class LoginInputDto(BaseModel):
    id: int

class CreateBatchInputDto(BaseModel):
    level: int
    # For simplicity, assume that start-date is NOW

class SetLevelInputDto(BaseModel):
    user_id: int
    batch: int # Batch ID (user can have multiple batches)
    level: int

class SetShareProgressPreferenceDto(BaseModel):
    shareProgress: bool

class NewUserNoteDto(BaseModel):
    text: str
    date: int

class SetUserAvatarDto(BaseModel):
    avatarFilename: str

class GoalCompletedDto(BaseModel):
    goalName: str
    goalDay: int # [1,21]

class SetStudyTrackerAppUseGoalsInputDto(BaseModel):
    uses: set # Why can't I just write Set<int>?

class UpdateStudyTrackerReceiveNotificationsPrefInputDto(BaseModel):
    receive: bool

class UpdateStudyTrackerWeekPlanningDayInputDto(BaseModel):
    day: int
    hour: int

class CreateNewStudyTrackerAppInputDto(BaseModel):
    title: str
    date: int
    tag: str