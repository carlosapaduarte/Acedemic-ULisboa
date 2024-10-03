from domain.commons.user import User
from exception import UsernameAlreadyExistsException
from repository.sql.commons.repo_sql import CommonsSqlRepo

from service.common.security import get_password_hash, verify_password

# TODO: this is a problem for the mem repo, since data is stored inside the object.
# Instead, pass a common dependency to the services.
# Same for other services...
commons_repo = CommonsSqlRepo()

def authenticate_user(username: str, password: str):
    user = commons_repo.get_user_by_username(username)
    if not user:
        return False
    if not verify_password(password, user.hashed_password):
        return False
    return user

def create_user(username: str, password: str) -> int:
    if not commons_repo.exists_user_by_username(username):
        hashed_password = get_password_hash(password)
        user = commons_repo.create_user(username, hashed_password)
        return user.id
    
    raise UsernameAlreadyExistsException()

def get_user_id_from_username(username: str) -> int | None:
    user = commons_repo.get_user_by_username(username)
    if user != None:
        return user.id
    return None

def get_user_info(user_id: int) -> User | None:
    user = commons_repo.get_user_by_id(user_id)
    if user != None:
        return user
    return None

def set_user_avatar(user_id: int, avatar_filename: str):
    commons_repo.update_user_avatar(user_id, avatar_filename)

def set_share_progress_preference(user_id: int, share_progress: bool):
    commons_repo.update_share_progress_state(user_id, share_progress)