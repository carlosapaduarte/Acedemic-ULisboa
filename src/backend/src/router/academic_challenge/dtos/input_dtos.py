from pydantic import BaseModel
from typing import Optional


class CreateBatchInputDto(BaseModel):
    level: int
    challengeIds: list[int] | list[list[int]]


class SetLevelInputDto(BaseModel):
    user_id: int
    batch: int
    level: int


class SetShareProgressPreferenceDto(BaseModel):
    shareProgress: bool


class NewUserNoteDto(BaseModel):
    notes: str


class ChallengeCompletedDto(BaseModel):
    challengeId: int
    user_answer: Optional[str] = None
