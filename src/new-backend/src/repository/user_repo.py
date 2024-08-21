from abc import ABC, abstractmethod
import datetime
from domain.user import User

class UserRepo(ABC):

    @abstractmethod
    def create_user(self, id: int, username: str) :
        pass

    @abstractmethod
    def exists_user(self, id: int) -> bool:
        pass

    @abstractmethod
    def get_user(self, id) -> User:
        pass

    @abstractmethod
    def create_new_batch(self, user_id: int, new_level: int):
        pass

    @abstractmethod
    def update_share_progress_state(self, user_id: int, share_progress: bool):
        pass

    @abstractmethod
    def create_new_user_note(self, user_id: int, note: str, date: datetime):
        pass

    @abstractmethod
    def create_completed_goal(self, user_id: int, batch_id: int, goal_name: str, goal_day: int, conclusion_date: datetime):
        pass

    @abstractmethod
    def update_user_avatar(self, user_id: int, avatar_filename: str):
        pass