from abc import ABC, abstractmethod
from domain.commons.user import User

class CommonsRepo(ABC):
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
    def update_share_progress_state(self, user_id: int, share_progress: bool):
        pass

    @abstractmethod
    def update_user_avatar(self, user_id: int, avatar_filename: str):
        pass