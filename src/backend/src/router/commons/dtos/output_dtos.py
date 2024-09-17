from pydantic import BaseModel

from domain.commons.user import User
from router.academic_challenge.dtos.output_dtos import BatchDto, UserNoteDto


class UserOutputDto(BaseModel):
    id: int
    username: str
    avatarFilename: str | None
    shareProgress: bool | None
    userNotes: list[UserNoteDto] | None
    batches: list[BatchDto] | None
    
    @staticmethod
    def fromUser(user: User) -> 'UserOutputDto':
        return UserOutputDto(
            id=user.id,
            username=user.username,
            avatarFilename=user.avatar_filename,
            shareProgress=user.share_progress,
            userNotes=UserNoteDto.fromUserNotes(user.user_notes),
            batches=BatchDto.fromBatches(user.batches)
        )