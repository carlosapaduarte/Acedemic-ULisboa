from datetime import datetime, timezone
from enum import Enum

from dtos.output_dtos import *
from repository.user_repo_sql import UserRepoSql

user_repo = UserRepoSql()


class LoginResult(Enum):
    SUCCESS = 0,
    CREATED_USER = 1


def get_datetime_utc(datetime: datetime) -> int:
    return int(datetime.replace(tzinfo=timezone.utc).timestamp())


def login(user_id: int) -> LoginResult:
    if user_repo.exists_user(user_id):
        return LoginResult.SUCCESS
    user_repo.create_user(id=user_id, username=f"User{user_id}")
    return LoginResult.CREATED_USER


def create_batch(user_id: int, level: int) -> int:
    return user_repo.create_new_batch(user_id, level)


def get_user_info(user_id: int) -> UserDto:
    user = user_repo.get_user(user_id)
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


def set_share_progress_preference(user_id: int, share_progress: bool):
    user_repo.update_share_progress_state(user_id, share_progress)


def create_new_user_note(user_id: int, note: str, created: datetime):
    user_repo.create_new_user_note(user_id, note, created)


def create_completed_goal(user_id: int, batch_id: int, goal_id: int, goal_day: int, conclusion_date: datetime):
    user_repo.create_completed_goal(user_id, batch_id, goal_id, goal_day, conclusion_date)


def set_user_avatar(user_id: int, avatar_filename: str):
    user_repo.update_user_avatar(user_id, avatar_filename)


def update_user_study_tracker_use_goals(user_id: int, use_goals: set):
    user_repo.update_user_study_tracker_use_goals(user_id, use_goals)


def update_receive_notifications_pref(user_id: int, receive: bool):
    user_repo.update_receive_notifications_pref(user_id, receive)


def update_study_tracker_app_planning_day(user_id: int, day: int, hour: int):
    user_repo.update_study_tracker_app_planning_day(user_id, day, hour)


def create_new_study_tracker_task(user_id: int, title: str, start_date: datetime, end_date: datetime, tag: str):
    user_repo.create_new_study_tracker_task(user_id, title, start_date, end_date, tag)
