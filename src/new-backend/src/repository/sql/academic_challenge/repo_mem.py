from domain.commons.user import User, UserNote, CompletedGoal
from datetime import datetime
from repository.sql.academic_challenge.repo import AcademicChallengeRepo

class AcademicChallengeMemRepo(AcademicChallengeRepo):

    def create_new_batch(self, user_id: int, new_level: int):
        user: User = self.get_user(user_id)
        user.level = new_level

    def create_new_user_note(self, user_id: int, note: str, created: datetime):
        user: User = self.get_user(user_id)
        user.user_notes.append(UserNote(note, created))

    def create_completed_goal(self, user_id: int, batch_id: int, goal_id: int, goal_day: int, concluded: datetime):
        user: User = self.get_user(user_id)
        user.completed_goals.append(CompletedGoal(goal_day=goal_day, id=goal_id, conclusion_date=concluded))