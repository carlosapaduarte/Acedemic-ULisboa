from abc import ABC, abstractmethod
from datetime import datetime

class AcademicChallengeRepo(ABC):
    @abstractmethod
    def create_new_batch(self, user_id: int, new_level: int) -> int:
        pass

    @abstractmethod
    def create_new_user_note(self, user_id: int, note: str, date: datetime):
        pass

    @abstractmethod
    def create_completed_challenge(self, user_id: int, batch_id: int, challenge_id: int, challenge_day: int, conclusion_date: datetime):
        pass