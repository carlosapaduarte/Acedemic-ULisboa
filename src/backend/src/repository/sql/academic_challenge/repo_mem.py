from datetime import datetime
from repository.sql.academic_challenge.repo import AcademicChallengeRepo

class AcademicChallengeMemRepo(AcademicChallengeRepo):

    def create_new_batch(self, user_id: int, new_level: int) -> int:
        return -1

    def create_new_user_note(self, user_id: int, note: str, date: datetime):
        pass

    def create_completed_goal(self, user_id: int, batch_id: int, goal_id: int, goal_day: int, conclusion_date: datetime):
        pass