from datetime import datetime
from typing import Annotated, List

from fastapi import APIRouter, Depends, Response

from router.academic_challenge.dtos.input_dtos import CreateBatchInputDto, ChallengeCompletedDto, NewUserNoteDto
from router.commons.common import get_current_user_id
from router.commons.dtos.gamification_dtos import BadgeResponse
from service import academic_challenge as academic_challenge_service
from sqlmodel import Session
from repository.sql.models.database import get_session as get_db_session

router = APIRouter(
    prefix="/academic-challenge",
)


@router.post("/users/me/batches")
def create_batch(
        user_id: Annotated[int, Depends(get_current_user_id)],
        input_dto: CreateBatchInputDto
):
    return academic_challenge_service.create_batch(user_id, input_dto.level, input_dto.challengeIds)


@router.post("/users/me/batches/{batch_id}/{batch_day_id}/notes")
def edit_day_note(
        user_id: Annotated[int, Depends(get_current_user_id)],
        batch_id: int,
        batch_day_id: int,
        input_dto: NewUserNoteDto
):
    academic_challenge_service.edit_day_notes(
        user_id=user_id,
        batch_id=batch_id,
        batch_day_id=batch_day_id,
        notes=input_dto.notes,
        date=datetime.now()
    )

@router.post("/users/me/batches/{batch_id}/{batch_day_id}/completed-challenges", response_model=List[BadgeResponse])
def complete_challenge(
        user_id: Annotated[int, Depends(get_current_user_id)],
        batch_id: int,
        batch_day_id: int,
        input_dto: ChallengeCompletedDto,
        db: Session = Depends(get_db_session)
) -> List[BadgeResponse]:
    newly_awarded_badges = academic_challenge_service.complete_challenge(
        user_id=user_id,
        batch_id=batch_id,
        batch_day_id=batch_day_id,
        challenge_id=input_dto.challengeId,
        completion_date=datetime.now(),
        db=db
    )
    return newly_awarded_badges