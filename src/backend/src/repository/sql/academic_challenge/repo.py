from abc import ABC, abstractmethod
from datetime import datetime


class AcademicChallengeRepo(ABC):
    @abstractmethod
    def create_new_batch(self, user_id: int, new_level: int, challenge_ids: list[int] | list[list[int]]) -> int:
        pass

    @abstractmethod
    def complete_challenge(self, user_id: int, batch_id: int, batch_day_id: int, challenge_id: int,completion_date: datetime):
        pass

    @abstractmethod
    def edit_day_notes(self, user_id: int, batch_id: int, batch_day_id: int, notes: str, date: datetime):
        pass
