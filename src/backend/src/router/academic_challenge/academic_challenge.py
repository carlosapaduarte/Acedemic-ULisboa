from datetime import datetime
from typing import Annotated
from fastapi import APIRouter, Depends, Response

from router.academic_challenge.dtos.input_dtos import CreateBatchInputDto, GoalCompletedDto, NewUserNoteDto

from router.commons.common import get_current_user_id
from service import academic_challenge as academic_challenge_service


router = APIRouter(
    prefix="/academic-challenge",
)

@router.post("/users/me/batches")
def create_batch(
    user_id: Annotated[int, Depends(get_current_user_id)], 
    input_dto: CreateBatchInputDto
):
    return academic_challenge_service.create_batch(user_id, input_dto.level)

@router.post("/users/me/notes")
def create_user_note(
    user_id: Annotated[int, Depends(get_current_user_id)],
    input_dto: NewUserNoteDto
):
    academic_challenge_service.create_new_user_note(user_id, input_dto.text, datetime.fromtimestamp(input_dto.date))

@router.post("/users/me/batches/{batch_id}/completed-goals")
def add_completed_goal(
    user_id: Annotated[int, Depends(get_current_user_id)],
    batch_id: int,
    input_dto: GoalCompletedDto
) -> Response:
    academic_challenge_service.create_completed_goal(
        user_id,
        batch_id,
        input_dto.goalId,
        input_dto.goalDay,
        datetime.now()
    )
    return Response()