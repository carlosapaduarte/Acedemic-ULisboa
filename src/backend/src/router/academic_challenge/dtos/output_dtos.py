from pydantic import BaseModel

from domain.commons.user import Batch, UserNote, Challenge
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


class ChallengeDto(BaseModel):
    id: int
    challengeDay: int
    completionDate: int | None

    @staticmethod
    def fromChallenges(challenges: list[Challenge]) -> list[list['ChallengeDto']]:
        challenges_dtos: list[list['ChallengeDto']] = [[] for _ in range(21)]

        for challenge in challenges:
            index = challenge.challenge_day - 1
            challenges_dtos[index].append(ChallengeDto(
                id=challenge.id,
                challengeDay=challenge.challenge_day,
                completionDate=get_datetime_utc(challenge.completion_date) if challenge.completion_date else None
            ))

        return challenges_dtos


class BatchDto(BaseModel):
    id: int
    startDate: int
    level: int
    challenges: list[list[ChallengeDto]]

    @staticmethod
    def fromBatches(batches: list[Batch]) -> list['BatchDto']:
        batches_dtos: list[BatchDto] = []
        for batch in batches:
            batches_dtos.append(BatchDto(
                id=batch.id,
                startDate=get_datetime_utc(batch.start_date),
                level=batch.level,
                challenges=ChallengeDto.fromChallenges(batch.challenges)
            ))

        return batches_dtos
