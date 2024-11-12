from datetime import datetime
from typing import Annotated

from fastapi import APIRouter, Depends, Response

from router.academic_challenge.dtos.input_dtos import CreateBatchInputDto, ChallengeCompletedDto, NewUserNoteDto
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
    return academic_challenge_service.create_batch(user_id, input_dto.level, input_dto.challengeIds)


@router.post("/users/me/notes")
def create_user_note(
        user_id: Annotated[int, Depends(get_current_user_id)],
        input_dto: NewUserNoteDto
):
    academic_challenge_service.create_new_user_note(
        user_id=user_id,
        note=input_dto.text,
        created=datetime.fromtimestamp(input_dto.date)
    )


@router.post("/users/me/batches/{batch_id}/completed-challenges")
def complete_challenge(
        user_id: Annotated[int, Depends(get_current_user_id)],
        batch_id: int,
        input_dto: ChallengeCompletedDto
) -> Response:
    academic_challenge_service.complete_challenge(
        user_id=user_id,
        batch_id=batch_id,
        challenge_id=input_dto.challengeId,
        challenge_day=input_dto.challengeDay,
        completion_date=datetime.now()
    )
    return Response()
