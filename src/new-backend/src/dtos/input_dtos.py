from pydantic import BaseModel

class LoginInputDto(BaseModel):
    id: int

class SetLevelInputDto(BaseModel):
    id: int
    level: int

class SetShareProgressPreferenceDto(BaseModel):
    id: int
    shareProgress: bool

class NewUserNoteDto(BaseModel):
    id: int
    name: str
    date: int

class SetUserAvatarDto(BaseModel):
    id: int
    avatarFilename: str

class GoalCompletedDto(BaseModel):
    id: int
    goalName: str
    date: int