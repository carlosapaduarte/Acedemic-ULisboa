from domain.user import User, UserNote, CompletedGoal
from datetime import datetime
from exception import NotFoundException
from .user_repo import UserRepo

class UserRepoMem(UserRepo):

    def __init__(self) -> None:
        self.users = dict()
        super().__init__()

    users = dict()

    def create_user(self, id: int, username: str):
        "Creates a user without avatar, notes and goals, in level 1, and share_progress set to false"
        self.users[id] = User(
            id, 
            username, 
            level=1,
            avatar_filename=None,
            start_date=datetime.now(),
            share_progress=False,
            user_notes=[],
            completed_goals=[]
        )

    def exists_user(self, id: int) -> bool:
        return id in self.users

    def get_user(self, id) -> User:
        user = self.users.get(id)
        if user is None:
            raise NotFoundException(id)
        return user

    def create_new_batch(self, user_id: int, new_level: int):
        user: User = self.get_user(user_id)
        user.level = new_level

    def update_share_progress_state(self, user_id: int, share_progress: bool):
        user: User = self.get_user(user_id)
        user.share_progress = share_progress

    def create_new_user_note(self, user_id: int, note: str, created: datetime):
        user: User = self.get_user(user_id)
        user.user_notes.append(UserNote(note, created))

    def create_completed_goal(self, user_id: int, goal_name: str, concluded: datetime):
        user: User = self.get_user(user_id)
        user.completed_goals.append(CompletedGoal(goal_name, concluded))

    def update_user_avatar(self, user_id: int, avatar_filename: str):
        user: User = self.get_user(user_id)
        user.avatar_filename = avatar_filename

    def update_receive_notifications_pref(self, user_id: int, receive: bool):
        pass

    def update_study_tracker_app_planning_day(self, user_id: int, day: int, hour: int):
        pass

    def create_new_study_tracker_task(self, user_id: int, title: str, start_date: datetime, end_date: datetime, tag: str):
        pass