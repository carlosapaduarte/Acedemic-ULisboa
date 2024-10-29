from pydantic import BaseModel

from domain.commons.user import Batch, CompletedChallenge, UserNote
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
        
    
class CompletedChallengeDto(BaseModel):
    challengeDay: int
    id: int
    conclusionDate: int
    
    @staticmethod
    def fromCompletedChallenges(completed_challenges: list[CompletedChallenge]) -> list['CompletedChallengeDto']:
        completed_challenges_dtos: list[CompletedChallengeDto] = []
        for completed_challenge in completed_challenges:
            completed_challenges_dtos.append(CompletedChallengeDto(
                challengeDay=completed_challenge.challenge_day,
                    id=completed_challenge.id,
                    conclusionDate=get_datetime_utc(completed_challenge.conclusion_date)
            ))
            
        return completed_challenges_dtos
    
class BatchDto(BaseModel):
    id: int
    startDate: int
    level: int
    completedChallenges: list[CompletedChallengeDto]
    
    @staticmethod
    def fromBatches(batches: list[Batch]) -> list['BatchDto']:
        batches_dtos: list[BatchDto] = []
        for batch in batches:
            completed_challenges_dtos = CompletedChallengeDto.fromCompletedChallenges(batch.completed)
            batches_dtos.append(BatchDto(
                id=batch.id,
                startDate=get_datetime_utc(batch.start_date),
                level=batch.level,
                completedChallenges=completed_challenges_dtos
            ))
            
        return batches_dtos