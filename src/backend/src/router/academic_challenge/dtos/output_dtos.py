from pydantic import BaseModel

from domain.commons.user import Batch, Challenge, BatchDay
from utils import get_datetime_utc


class ChallengeDto(BaseModel):
    id: int
    completionDate: int | None

    @staticmethod
    def fromChallenges(challenges: list[Challenge]) -> list['ChallengeDto']:
        challenges_dtos: list['ChallengeDto'] = []

        for challenge in challenges:
            challenges_dtos.append(ChallengeDto(
                id=challenge.id,
                completionDate=get_datetime_utc(challenge.completion_date) if challenge.completion_date else None
            ))

        return challenges_dtos


class BatchDayDto(BaseModel):
    id: int
    challenges: list[ChallengeDto]
    notes: str

    @staticmethod
    def fromBatchDays(batch_days: list[BatchDay]) -> list['BatchDayDto']:
        batch_days_dtos: list[BatchDayDto] = []
        for batch_day in batch_days:
            batch_days_dtos.append(BatchDayDto(
                id=batch_day.id,
                challenges=ChallengeDto.fromChallenges(batch_day.challenges),
                notes=batch_day.notes
            ))

        return batch_days_dtos


class BatchDto(BaseModel):
    id: int
    startDate: int
    level: int
    batchDays: list[BatchDayDto]

    @staticmethod
    def fromBatches(batches: list[Batch]) -> list['BatchDto']:
        batches_dtos: list[BatchDto] = []
        for batch in batches:
            batches_dtos.append(BatchDto(
                id=batch.id,
                startDate=get_datetime_utc(batch.start_date),
                level=batch.level,
                batchDays=BatchDayDto.fromBatchDays(batch.batch_days)
            ))

        return batches_dtos
