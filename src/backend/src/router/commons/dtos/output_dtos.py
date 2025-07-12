import datetime
from pydantic import BaseModel

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

    @staticmethod
    def fromUser(user: User) -> 'UserOutputDto':
        return UserOutputDto(
            id=user.id,
            username=user.username,
            avatarFilename=user.avatar_filename,
            shareProgress=user.share_progress,
            batches=BatchDto.fromBatches(user.batches)
        )

class BadgeOutputDto(BaseModel):
    id: int
    code: str
    title: str
    description: str
    icon_url: str | None

    
class UserBadgeOutputDto(BaseModel):
    badge: BadgeOutputDto
    earned_at: datetime

    class Config:
        arbitrary_types_allowed = True  # Allows non-Pydantic types like datetime to be used

    