from datetime import timedelta
from typing import Annotated, Any
from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
import jwt
from pydantic import BaseModel

from router.academic_challenge.dtos.input_dtos import SetShareProgressPreferenceDto
from router.commons.dtos.input_dtos import CreateUserInputDto, SetUserAvatarDto

from router.commons.dtos.output_dtos import UserOutputDto
from service.common import common as common_service
from service.common.security import ACCESS_TOKEN_EXPIRE_MINUTES, ALGORITHM, SECRET_KEY, TokenData, create_access_token

router = APIRouter(
    prefix="/commons",
)

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="token")

"""
    This is a middleware that resolves the JWT token to the correspondent user ID.
    If the token is invalid, returns a response with 401 error code.
    The user is resolved through the "sub" JWT field, with contains his username.
"""
async def get_current_user_id(token: Annotated[str, Depends(oauth2_scheme)]) -> int:
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload: dict[str, Any] = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        username: Any = payload.get("sub")
        if username is None:
            raise credentials_exception
        token_data = TokenData(username=username)
    except jwt.InvalidTokenError:
        raise credentials_exception
    id = common_service.get_user_id_from_username(username=token_data.username)
    if id is None:
        raise credentials_exception
    return id

class Token(BaseModel):
    access_token: str
    token_type: str

"""
    This route checks credentials, assuming they are present, and returns a
    new JWT token, with a specific expire date, in the response.
    This JWT token contains the username of the correspondent user,
    in the "sub" field. This allows to get 
"""
@router.post("/token")
async def login_for_access_token(
    form_data: Annotated[OAuth2PasswordRequestForm, Depends()],
) -> Token:
    print(form_data)
    user = common_service.authenticate_user(form_data.username, form_data.password)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": user.username}, expires_delta=access_token_expires
    )
    return Token(access_token=access_token, token_type="bearer")

@router.get("/test-token")
async def test_token_validity(
    _: Annotated[int, Depends(get_current_user_id)]
):
    # Middleware should resolve token to user ID, or raise
    return

"""
    Creates a new user.
    It does not replace the login action, which is required to create the JWT token.
"""
@router.post("/create-user")
def create_user(dto: CreateUserInputDto):
    common_service.create_user(dto.username, dto.password)

@router.get("/users/me")
def get_user_info(user_id: Annotated[int, Depends(get_current_user_id)]) -> UserOutputDto:
    #print(datetime.fromtimestamp(service.get_user_info(user_id).batches[0].startDate))
    user = common_service.get_user_info(user_id)
    return UserOutputDto.fromUser(user)

@router.put("/users/me/publish-state")
def set_share_progress_preference(
    user_id: Annotated[int, Depends(get_current_user_id)],
    input_dto: SetShareProgressPreferenceDto
):
    common_service.set_share_progress_preference(user_id, input_dto.shareProgress)

@router.put("/users/me/avatar")
def set_user_avatar(
    user_id: Annotated[int, Depends(get_current_user_id)],
    input_dto: SetUserAvatarDto
):
    common_service.set_user_avatar(user_id, input_dto.avatarFilename)
