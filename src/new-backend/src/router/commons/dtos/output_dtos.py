from pydantic import BaseModel

from router.academic_challenge.dtos.output_dtos import BatchDto, UserNoteDto


class UserDto(BaseModel):
    id: int
    username: str
    avatarFilename: str | None
    shareProgress: bool | None
    userNotes: list[UserNoteDto] | None
    batches: list[BatchDto] | None