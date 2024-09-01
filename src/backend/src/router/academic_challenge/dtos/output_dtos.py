from pydantic import BaseModel


class UserNoteDto(BaseModel):
    name: str
    date: int
    
class CompletedGoalDto(BaseModel):
    goalDay: int
    id: int
    conclusionDate: int
    
class BatchDto(BaseModel):
    id: int
    startDate: int
    level: int
    completedGoals: list[CompletedGoalDto]