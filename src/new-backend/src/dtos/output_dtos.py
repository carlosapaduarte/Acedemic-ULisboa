from pydantic import BaseModel


class UserNoteDto(BaseModel):
    name: str
    date: int
    
class CompletedGoalDto(BaseModel):
    goalDay: int
    name: str
    conclusionDate: int
    
class BatchDto(BaseModel):
    id: int
    startDate: int
    level: int
    completedGoals: list[CompletedGoalDto]
    
class UserDto(BaseModel):
    id: int
    username: str
    avatarFilename: str | None
    shareProgress: bool | None
    userNotes: list[UserNoteDto] | None
    batches: list[BatchDto] | None