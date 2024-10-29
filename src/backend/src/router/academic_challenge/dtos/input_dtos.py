from pydantic import BaseModel


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
    date: float

class ChallengeCompletedDto(BaseModel):
    challengeId: int
    challengeDay: int