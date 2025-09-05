import datetime
from pydantic import BaseModel, Field
from typing import List, Optional

from domain.study_tracker import Event
from domain.commons.user import User
from router.academic_challenge.dtos.output_dtos import BatchDto



class LoginOutputDto(BaseModel):
    id: int


class UserOutputDto(BaseModel):
    id: int
    username: str
    avatarFilename: str | None
    shareProgress: bool | None
    batches: list[BatchDto] | None
    currentChallengeLevel: Optional[int] = None

    class Config:
        populate_by_name = True

    @staticmethod
    def fromUser(user: User) -> 'UserOutputDto':
        return UserOutputDto(
            id=user.id,
            username=user.username,
            avatarFilename=user.avatar_filename,
            shareProgress=user.share_progress,
            batches=BatchDto.fromBatches(user.batches),
            currentChallengeLevel=user.metrics.current_challenge_level if user.metrics else None
        )

class TagOutputDto(BaseModel):
    id: str
    name: str
    user_id: int
    is_custom: bool

class EventOutputDto(BaseModel):
    id: int
    startDate: float
    endDate: float
    title: str
    tags: Optional[List[str]] = None
    everyWeek: bool
    everyDay: bool
    notes: Optional[str] = None
    color: str

    @classmethod
    def from_event(cls, event: Event) -> "EventOutputDto":
        """Converte um objeto de domínio Event para um EventOutputDto."""
        start_ts = event.date.start_date.timestamp() if event.date and event.date.start_date else 0.0
        end_ts = event.date.end_date.timestamp() if event.date and event.date.end_date else 0.0

        return cls(
            id=event.id,
            startDate=start_ts,
            endDate=end_ts,
            title=event.title,
            tags=event.tags,
            everyWeek=event.every_week,
            everyDay=event.every_day,
            notes=event.notes,
            color=event.color
        )
