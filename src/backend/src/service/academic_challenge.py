import datetime

from repository.sql.academic_challenge.repo_sql import AcademicChallengeSqlRepo


academic_challenge_repo = AcademicChallengeSqlRepo()

def create_batch(user_id: int, level: int) -> int:
    return academic_challenge_repo.create_new_batch(user_id, level)

def create_new_user_note(user_id: int, note: str, created: datetime):
    academic_challenge_repo.create_new_user_note(user_id, note, created)

def create_completed_goal(user_id: int, batch_id: int, goal_id: int, goal_day: int, conclusion_date: datetime):
    academic_challenge_repo.create_completed_goal(user_id, batch_id, goal_id, goal_day, conclusion_date)