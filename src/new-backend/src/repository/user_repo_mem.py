from domain.user import User, UserNote, Goal
from datetime import datetime
from exception import NotFoundException

users = dict()

def create_user(id: int, username: str):
    "Creates a user without avatar, notes and goals, in level 1, and share_progress set to false"
    users[id] = User(
        id, 
        username, 
        level=1, 
        avatar_filename=None, 
        start_date=datetime.now(), 
        share_progress=False,
        user_notes=[],
        completed_goals=[]
    )

def exists_user(id: int) -> bool:
    return id in users

def get_user(id) -> User:
    user = users.get(id)
    if user is None:
        raise NotFoundException(id)
    return user

def update_user_level(user_id: int, new_level: int):
    user: User = get_user(user_id)
    user.level = new_level

def update_share_progress_state(user_id: int, share_progress: bool):
    user: User = get_user(user_id)
    user.share_progress = share_progress

def add_new_user_note(user_id: int, note: str, created: datetime):
    user: User = get_user(user_id)
    user.user_notes.append(UserNote(note, created))

def add_completed_goal(user_id: int, goal_name: str, concluded: datetime):
    user: User = get_user(user_id)
    user.completed_goals.append(Goal(goal_name, concluded))

def set_user_avatar(user_id: int, avatar_filename: str):
    user: User = get_user(user_id)
    user.avatar_filename = avatar_filename