from datetime import datetime

from repository.sql.academic_challenge.repo_sql import AcademicChallengeSqlRepo


academic_challenge_repo = AcademicChallengeSqlRepo()

def create_batch(user_id: int, level: int) -> int:
    return academic_challenge_repo.create_new_batch(user_id, level)

def create_new_user_note(user_id: int, note: str, created: datetime):
    academic_challenge_repo.create_new_user_note(user_id, note, created)

def create_completed_challenge(user_id: int, batch_id: int, challenge_id: int, challenge_day: int, conclusion_date: datetime):
    academic_challenge_repo.create_completed_challenge(
        user_id=user_id,
        batch_id=batch_id,
        challenge_id=challenge_id,
        challenge_day=challenge_day,
        conclusion_date=conclusion_date)