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
    level: int = 1
    startDate: int = 0
    shareProgress: bool = False
    
    avatarFilename: Optional[str] = None 
    batches: list = []

    custom_colors: List[str] = [] 

    @classmethod
    def fromUser(cls, user):
        colors = getattr(user, "custom_colors", [])
        if colors is None:
            colors = []

        start_date = 0
        if hasattr(user, "study_session_time") and user.study_session_time:
            start_date = int(user.study_session_time.timestamp())
        elif hasattr(user, "start_date") and user.start_date:
             start_date = int(user.start_date)

        return cls(
            id=user.id,
            username=user.username,
            level=getattr(user, "level", 1),
            startDate=start_date,
            shareProgress=getattr(user, "share_progress", False) or False,
            
            avatarFilename=getattr(user, "avatar_filename", None),
            
            batches=[], 

            custom_colors=colors
        )
    
class TagOutputDto(BaseModel):
    id: str
    name_pt: Optional[str] = None
    name_en: Optional[str] = None
    user_id: int
    is_custom: bool
    color: Optional[str] = None
    is_uc: bool = False

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
