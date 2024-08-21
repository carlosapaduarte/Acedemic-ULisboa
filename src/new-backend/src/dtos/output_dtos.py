from pydantic import BaseModel


class UserNoteDto(BaseModel):
    name: str
    created: int
    
class CompletedGoalDto(BaseModel):
    goal_day: int
    name: str
    conclusion_date: int
    
class BatchDto(BaseModel):
    start_date: int
    level: int
    completed: list[CompletedGoalDto]
    
class UserDto(BaseModel):
    id: int
    username: str
    avatar_filename: str | None
    share_progress: bool | None
    user_notes: list[UserNoteDto] | None
    batches: list[BatchDto] | None