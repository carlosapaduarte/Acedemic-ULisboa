from abc import ABC, abstractmethod
from domain.commons.user import User

class CommonsRepo(ABC):
    @abstractmethod
    def create_user(self, username: str, hashed_password: str) -> User:
        pass

    @abstractmethod
    def exists_user_by_id(self, id: int) -> bool:
        pass
    
    @abstractmethod
    def exists_user_by_username(self, username: str) -> bool:
        pass

    @abstractmethod
    def get_user_by_id(self, id: int) -> User | None:
        pass
    
    @abstractmethod
    def get_user_by_username(self, username: str) -> User | None:
        pass

    @abstractmethod
    def update_share_progress_state(self, user_id: int, share_progress: bool):
        pass

    @abstractmethod
    def update_user_avatar(self, user_id: int, avatar_filename: str):
        pass
    