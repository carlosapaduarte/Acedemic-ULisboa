from enum import Enum
from datetime import datetime, timezone

from repository.sql.commons.repo_sql import CommonsSqlRepo
from router.academic_challenge.dtos.output_dtos import BatchDto, CompletedGoalDto, UserNoteDto
from router.commons.dtos.output_dtos import UserDto

# TODO: this is a problem for the mem repo, since data is stored inside the object.
# Instead, pass a common dependency to the services.
# Same for other services...
commons_repo = CommonsSqlRepo()

class LoginResult(Enum):
    SUCCESS = 0,
    CREATED_USER = 1

def get_datetime_utc(datetime: datetime) -> int:
    return int(datetime.replace(tzinfo=timezone.utc).timestamp())

def login(user_id: int) -> LoginResult:
    if commons_repo.exists_user(user_id):
        return LoginResult.SUCCESS
    commons_repo.create_user(id=user_id, username=f"User{user_id}")
    return LoginResult.CREATED_USER

def get_user_info(user_id: int) -> UserDto:
    user = commons_repo.get_user(user_id)
    return UserDto(
        id=user.id,
        username=user.username,
        avatarFilename=user.avatar_filename,
        shareProgress=user.share_progress,
        userNotes=map(lambda note: UserNoteDto(
            name=note.name,
            date=get_datetime_utc(note.created)
        ), user.user_notes),
        batches=map(lambda batch: BatchDto(
            id=batch.id,
            startDate=get_datetime_utc(batch.start_date),
            level=batch.level,
            completedGoals=map(lambda completed_goal: CompletedGoalDto(
                goalDay=completed_goal.goal_day,
                id=completed_goal.id,
                conclusionDate=get_datetime_utc(completed_goal.conclusion_date)
            ), batch.completed)
        ), user.batches)
    )

def set_user_avatar(user_id: int, avatar_filename: str):
    commons_repo.update_user_avatar(user_id, avatar_filename)

def set_share_progress_preference(user_id: int, share_progress: bool):
    commons_repo.update_share_progress_state(user_id, share_progress)