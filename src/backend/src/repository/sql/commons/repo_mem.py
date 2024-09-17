from domain.commons.user import User
from datetime import datetime

from domain.user import User
from exception import NotFoundException
from repository.sql.commons.repo import CommonsRepo


class CommonsMemRepo(CommonsRepo):

    def __init__(self) -> None:
        self.users = dict()
        super().__init__()

    users: dict[int, User] = dict()

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

    def update_share_progress_state(self, user_id: int, share_progress: bool):
        user: User = self.get_user(user_id)
        user.share_progress = share_progress

    def update_user_avatar(self, user_id: int, avatar_filename: str):
        user: User = self.get_user(user_id)
        user.avatar_filename = avatar_filename