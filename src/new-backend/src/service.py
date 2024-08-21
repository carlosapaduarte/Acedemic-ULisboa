from repository import user_repo_mem
from enum import Enum
from dtos.output_dtos import *
from domain.user import UserNote, Goal
from datetime import datetime

class LoginResult(Enum):
    SUCCESS = 0,
    CREATED_USER = 1

def login(user_id: int) -> LoginResult:
    if user_repo_mem.exists_user(user_id):
        return LoginResult.SUCCESS
    user_repo_mem.create_user(user_id, username=f"User{user_id}")
    return LoginResult.CREATED_USER

def set_level(user_id: int, level: int):
    user_repo_mem.update_user_level(user_id, level)

def get_user_info(user_id: int) -> UserInfo:
    user = user_repo_mem.get_user(user_id)
    return UserInfo(
        user.id,
        user.username,
        user.level,
        user.avatar_filename,
        user.start_date,
        user.share_progress,
        user_notes=list(map(lambda note: UserNoteDto(note.name, created=note.created), user.user_notes)),
        completed_goals=list(map(lambda goal: GoalDto(goal.name, goal.concluded), user.completed_goals))
    )

def set_share_progress_preference(user_id: int, share_progress: bool):
    user_repo_mem.update_share_progress_state(user_id, share_progress)

def create_new_user_note(user_id: int, note: str, created: datetime):
    user_repo_mem.add_new_user_note(user_id, note, created)

def add_completed_goal(user_id: int, goal_name: str, concluded: datetime):
    user_repo_mem.add_completed_goal(user_id, goal_name, concluded)

def set_user_avatar(user_id: int, avatar_filename: str):
    user_repo_mem.set_user_avatar(user_id, avatar_filename)