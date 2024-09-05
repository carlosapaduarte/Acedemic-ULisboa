from pydantic import BaseModel

from domain.commons.user import Batch, CompletedGoal, UserNote
from utils import get_datetime_utc


class UserNoteDto(BaseModel):
    name: str
    date: int
    
    @staticmethod
    def fromUserNotes(user_notes: list[UserNote]) -> list['UserNoteDto']:
        user_notes_dtos: list[UserNoteDto] = []
        for note in user_notes:
            user_notes_dtos.append(UserNoteDto(
                name=note.name,
                date=get_datetime_utc(note.created)
            ))
            
        return user_notes_dtos
        
    
class CompletedGoalDto(BaseModel):
    goalDay: int
    id: int
    conclusionDate: int
    
    @staticmethod
    def fromCompletedGoals(completed_goals: list[CompletedGoal]) -> list['CompletedGoalDto']:
        completed_goals_dtos: list[CompletedGoalDto] = []
        for completed_goal in completed_goals:
            completed_goals_dtos.append(CompletedGoalDto(
                goalDay=completed_goal.goal_day,
                    id=completed_goal.id,
                    conclusionDate=get_datetime_utc(completed_goal.conclusion_date)
            ))
            
        return completed_goals_dtos
    
class BatchDto(BaseModel):
    id: int
    startDate: int
    level: int
    completedGoals: list[CompletedGoalDto]
    
    @staticmethod
    def fromBatches(batches: list[Batch]) -> list['BatchDto']:
        batches_dtos: list[BatchDto] = []
        for batch in batches:
            completed_goals_dtos = CompletedGoalDto.fromCompletedGoals(batch.completed)
            batches_dtos.append(BatchDto(
                id=batch.id,
                startDate=get_datetime_utc(batch.start_date),
                level=batch.level,
                completedGoals=completed_goals_dtos
            ))
            
        return batches_dtos