from datetime import datetime
from typing import Any, Dict
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
) -> Dict[str, Any]:
    # marca o desafio como completo
    ranks_before = gamification_service.get_completed_level_ranks(db, user_id, app_scope="academic_challenge")
    academic_challenge_repo.complete_challenge(
        user_id=user_id, batch_id=batch_id, batch_day_id=batch_day_id, 
        challenge_id=challenge_id, completion_date=completion_date
    )
    
    newly_awarded_badges = gamification_service.update_challenge_completion_metrics(db, user_id)
    ranks_after = gamification_service.get_completed_level_ranks(db, user_id, app_scope="academic_challenge")
    newly_completed_ranks = ranks_after.difference(ranks_before)
    
    completed_level_rank = None
    
    if newly_completed_ranks:
        completed_level_rank = newly_completed_ranks.pop()
        print(f"Nível {completed_level_rank} COMPLETADO A 100%")


    return {
        "newly_awarded_badges": newly_awarded_badges,
        "completed_level_rank": completed_level_rank
    }
