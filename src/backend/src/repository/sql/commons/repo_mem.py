import random

from domain.commons.user import User
from exception import NotFoundException
from repository.sql.commons.repo import CommonsRepo


class CommonsMemRepo(CommonsRepo):

    def __init__(self) -> None:
        self.users = dict()
        super().__init__()

    users: dict[str, User] = dict()

    def create_user(self, username: str, hashed_password: str):
        "Creates a user without avatar, notes and challenges, in level 1, and share_progress set to false"
        self.users[username] = User(
            id=random.randint(1, 999999999),
            username=username,
            hashed_password=hashed_password,
            avatar_filename=None,
            share_progress=False,
            batches=[]
        )

    def exists_user_by_id(self, id: int) -> bool:
        return id in self.users

    def get_user_by_id(self, id) -> User:
        user = self.users.get(id)
        if user is None:
            raise NotFoundException(id)
        return user

    def update_share_progress_state(self, user_id: int, share_progress: bool):
        user: User = self.get_user_by_id(user_id)
        user.share_progress = share_progress

    def update_user_avatar(self, user_id: int, avatar_filename: str):
        user: User = self.get_user_by_id(user_id)
        user.avatar_filename = avatar_filename
