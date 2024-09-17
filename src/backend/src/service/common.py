from enum import Enum

from domain.commons.user import User
from repository.sql.commons.repo_sql import CommonsSqlRepo

# TODO: this is a problem for the mem repo, since data is stored inside the object.
# Instead, pass a common dependency to the services.
# Same for other services...
commons_repo = CommonsSqlRepo()

class LoginResult(Enum):
    SUCCESS = 0,
    CREATED_USER = 1

def login(user_id: int) -> LoginResult:
    if commons_repo.exists_user(user_id):
        return LoginResult.SUCCESS
    commons_repo.create_user(id=user_id, username=f"User{user_id}")
    return LoginResult.CREATED_USER

def get_user_info(user_id: int) -> User:
    return commons_repo.get_user(user_id)

def set_user_avatar(user_id: int, avatar_filename: str):
    commons_repo.update_user_avatar(user_id, avatar_filename)

def set_share_progress_preference(user_id: int, share_progress: bool):
    commons_repo.update_share_progress_state(user_id, share_progress)