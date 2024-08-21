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