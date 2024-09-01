from fastapi import APIRouter, Response

from router.academic_challenge.dtos.input_dtos import SetShareProgressPreferenceDto
from router.commons.dtos.input_dtos import LoginInputDto, SetUserAvatarDto
from service import academic_challenge_service, common_service

router = APIRouter(
    prefix="/commons",
)

@router.post("/login")
def login(input_dto: LoginInputDto) -> Response:
    common_service.login(input_dto.id)
    return Response() # Just for now...

@router.put("/users/{user_id}/publish-state")
def set_share_progress_preference(user_id: int, input_dto: SetShareProgressPreferenceDto):
    common_service.set_share_progress_preference(user_id, input_dto.shareProgress)

@router.put("/users/{user_id}/avatar")
def set_user_avatar(user_id: int, input_dto: SetUserAvatarDto):
    common_service.set_user_avatar(user_id, input_dto.avatarFilename)

@router.get("/users/{user_id}")
def get_user_info(user_id: int):
    #print(datetime.fromtimestamp(service.get_user_info(user_id).batches[0].startDate))
    return common_service.get_user_info(user_id)