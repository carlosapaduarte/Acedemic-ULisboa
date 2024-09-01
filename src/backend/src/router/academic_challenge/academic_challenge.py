from datetime import datetime
from fastapi import APIRouter, Response

from router.academic_challenge.dtos.input_dtos import CreateBatchInputDto, GoalCompletedDto, NewUserNoteDto
from service import academic_challenge_service


router = APIRouter(
    prefix="/academic-challenge",
)

@router.post("/users/{user_id}/batches")
def create_batch(user_id: int, input_dto: CreateBatchInputDto):
    return academic_challenge_service.create_batch(user_id, input_dto.level)

@router.post("/users/{user_id}/notes")
def create_user_note(user_id: int, input_dto: NewUserNoteDto):
    academic_challenge_service.create_new_user_note(user_id, input_dto.text, datetime.fromtimestamp(input_dto.date))

@router.post("/users/{user_id}/batches/{batch_id}/completed-goals")
def add_completed_goal(user_id: int, batch_id: int, input_dto: GoalCompletedDto) -> Response:
    academic_challenge_service.create_completed_goal(
        user_id,
        batch_id,
        input_dto.goalId,
        input_dto.goalDay,
        datetime.now()
    )
    return Response()