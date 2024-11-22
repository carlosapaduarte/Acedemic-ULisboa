from datetime import datetime

from repository.sql.academic_challenge.repo_sql import AcademicChallengeSqlRepo

academic_challenge_repo = AcademicChallengeSqlRepo()


def create_batch(user_id: int, level: int, challenge_ids: list[int] | list[list[int]]) -> int:
    return academic_challenge_repo.create_new_batch(user_id, level, challenge_ids)


def edit_day_notes(user_id: int, batch_id: int, batch_day_id: int, notes: str, date: datetime):
    academic_challenge_repo.edit_day_notes(
        user_id=user_id,
        batch_id=batch_id,
        batch_day_id=batch_day_id,
        notes=notes,
        date=date)


def complete_challenge(user_id: int, batch_id: int, batch_day_id: int, challenge_id: int, completion_date: datetime):
    academic_challenge_repo.complete_challenge(
        user_id=user_id,
        batch_id=batch_id,
        batch_day_id=batch_day_id,
        challenge_id=challenge_id,
        completion_date=completion_date)
