from datetime import datetime

from repository.sql.academic_challenge.repo import AcademicChallengeRepo


class AcademicChallengeMemRepo(AcademicChallengeRepo):

    def create_new_batch(self, user_id: int, new_level: int, challenge_ids: list[int] | list[list[int]]) -> int:
        return -1

    def complete_challenge(self, user_id: int, batch_id: int, batch_day_id: int, challenge_id: int,
                           completion_date: datetime):
        pass

    def edit_day_notes(self, user_id: int, batch_id: int, batch_day_id: int, notes: str, date: datetime):
        pass
