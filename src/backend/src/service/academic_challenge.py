from datetime import datetime
from sqlmodel import Session 
from repository.sql.models.database import get_session
from fastapi import Depends 

from repository.sql.academic_challenge.repo_sql import AcademicChallengeSqlRepo
from service.gamification import core as gamification_service

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

def complete_challenge(
    user_id: int, 
    batch_id: int, 
    batch_day_id: int, 
    challenge_id: int, 
    completion_date: datetime,
    db: Session
):
    # marca o desafio como completo
    academic_challenge_repo.complete_challenge(
        user_id=user_id, batch_id=batch_id, batch_day_id=batch_day_id, 
        challenge_id=challenge_id, completion_date=completion_date
    )
    return gamification_service.update_challenge_completion_metrics(db, user_id)
