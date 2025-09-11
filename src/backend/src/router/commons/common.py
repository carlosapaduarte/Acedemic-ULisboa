# src/backend/src/router/commons/router_commons.py

from datetime import timedelta
from router.commons.dtos.gamification_dtos import BadgeResponse
from sqlmodel import select, Session # Importar Session síncrona
from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
import jwt
from service.gamification import core as gamification_service
from repository.sql.models.models import TagModel, UserModel, UserTagLink
from pydantic import BaseModel
#from service.common.badge_service import 
from repository.sql.models.database import get_session as get_db_session
from typing import Annotated, Any, List

from router.commons.dtos.output_dtos import TagOutputDto
from router.academic_challenge.dtos.input_dtos import SetShareProgressPreferenceDto
from router.commons.dtos.input_dtos import CreateUserInputDto, SetUserAvatarDto, CreateTagInputDto
from router.commons.dtos.output_dtos import UserOutputDto
from service.common import common as common_service
from service.common.security import ACCESS_TOKEN_EXPIRE_MINUTES, ALGORITHM, SECRET_KEY, TokenData, create_access_token

router = APIRouter(
    prefix="/commons",
)

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="commons/token")

def get_current_user_id(token: Annotated[str, Depends(oauth2_scheme)], db: Annotated[Session, Depends(get_db_session)]) -> int:
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
    
    id = common_service.get_user_id_from_username(db=db, username=token_data.username)
    if id is None:
        raise credentials_exception
    return id

class Token(BaseModel):
    access_token: str
    token_type: str
    newly_awarded_badges: List[BadgeResponse] = []

@router.post("/token")
def login_for_access_token(
    form_data: Annotated[OAuth2PasswordRequestForm, Depends()],
    db: Annotated[Session, Depends(get_db_session)]
) -> Token:
    user = common_service.authenticate_user(db, form_data.username, form_data.password)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    newly_awarded_badges = []
    if user.id:
        newly_awarded_badges = gamification_service.update_login_streak(db, user.id)
            
    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": user.username}, expires_delta=access_token_expires
    )
    return Token(access_token=access_token, token_type="bearer", newly_awarded_badges=newly_awarded_badges)

@router.get("/test-token")
async def test_token_validity(
    _: Annotated[int, Depends(get_current_user_id)]
):
    return

"""
    Creates a new user.
    It does not replace the login action, which is required to create the JWT token.
"""
@router.post("/create-user", response_model=UserOutputDto)
def create_user_route(
    dto: CreateUserInputDto,
    db: Annotated[Session, Depends(get_db_session)] 
):
    existing_user = (db.exec(select(UserModel).where(UserModel.username == dto.username))).first()
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail={"type": "USERNAME_ALREADY_EXISTS", "field": "username"}
        )
    try:
        new_user = common_service.create_user(db, dto)
        if not new_user:
            raise Exception("Erro: create_user retornou None")
        return UserOutputDto.fromUser(new_user)
    except HTTPException:
        raise
    except Exception as e:
        print(f"Erro ao criar utilizador com tags: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail={"type": "USER_CREATION_FAILED", "field": "general"}
        )

@router.get("/users/me", response_model=UserOutputDto)
def get_user_info( 
    user_id: Annotated[int, Depends(get_current_user_id)],
    db: Annotated[Session, Depends(get_db_session)]
) -> UserOutputDto:
    user = common_service.get_user_info(db, user_id)
    if user is None:
        raise HTTPException(status.HTTP_404_NOT_FOUND, detail="User not found")
    return UserOutputDto.fromUser(user)

@router.put("/users/me/publish-state", status_code=status.HTTP_204_NO_CONTENT)
def set_share_progress_preference( 
    user_id: Annotated[int, Depends(get_current_user_id)],
    input_dto: SetShareProgressPreferenceDto,
    db: Annotated[Session, Depends(get_db_session)]
):

    common_service.set_share_progress_preference(db, user_id, input_dto.shareProgress)

@router.put("/users/me/avatar", status_code=status.HTTP_204_NO_CONTENT)
def set_user_avatar( 
    user_id: Annotated[int, Depends(get_current_user_id)],
    input_dto: SetUserAvatarDto,
    db: Annotated[Session, Depends(get_db_session)]
):
    common_service.set_user_avatar(db, user_id, input_dto.avatarFilename)

@router.get("/users/me/tags", response_model=List[TagOutputDto])
def get_user_tags( 
    current_user_id: Annotated[int, Depends(get_current_user_id)],
    db: Annotated[Session, Depends(get_db_session)]
):
    try:
        user_tag_data = (db.exec(
            select(UserTagLink, TagModel)
            .join(TagModel, UserTagLink.tag_id == TagModel.id)
            .where(UserTagLink.user_id == current_user_id)
        )).all()

        if not user_tag_data:
            return []
        
        response_tags = []
        for link, tag in user_tag_data:
            response_tags.append(
                TagOutputDto(
                    id=str(tag.id),
                    name=tag.name,
                    user_id=link.user_id,
                    is_custom=link.is_custom,
                    color=tag.color
                )
            )
        return response_tags
    except Exception as e:
        print(f"(: Error fetching user tags: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to fetch user tags"
        )

@router.delete("/users/me/tags/{tag_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_user_tag( 
    tag_id: int,
    current_user_id: Annotated[int, Depends(get_current_user_id)],
    db: Annotated[Session, Depends(get_db_session)]
):
    try:

        user_tag_link = (db.exec(
            select(UserTagLink).where(
                UserTagLink.user_id == current_user_id,
                UserTagLink.tag_id == tag_id
            )
        )).first()

        if not user_tag_link:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Tag não encontrada para este utilizador."
            )
        
        db.delete(user_tag_link)
        db.commit()

    except HTTPException:
        raise
    except Exception as e:
        print(f"Erro ao apagar tag {tag_id} do utilizador {current_user_id}: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Falha ao apagar tag."
        )

@router.post("/users/me/tags", response_model=TagOutputDto, status_code=status.HTTP_201_CREATED)
def create_user_tag(
    tag_input: CreateTagInputDto,
    current_user_id: Annotated[int, Depends(get_current_user_id)],
    db: Annotated[Session, Depends(get_db_session)]
):
    print(f"DEBUG: Dados recebidos no backend para criar tag: {tag_input.model_dump()}") # Ou tag_input.dict()
    try:

        existing_tag = (db.exec(
            select(TagModel).where(TagModel.name.ilike(tag_input.name))
        )).first()

        if existing_tag:
    
            user_tag_link = (db.exec(
                select(UserTagLink).where(
                    UserTagLink.user_id == current_user_id,
                    UserTagLink.tag_id == existing_tag.id
                )
            )).first()

            if user_tag_link:
                raise HTTPException(
                    status_code=status.HTTP_409_CONFLICT,
                    detail={"type": "TAG_ALREADY_EXISTS_FOR_USER", "field": "tag_name"}
                )
            else:
                new_user_tag_link = UserTagLink(user_id=current_user_id, tag_id=existing_tag.id,is_custom=True)
                db.add(new_user_tag_link)
                db.commit()
                db.refresh(new_user_tag_link)
                return TagOutputDto(id=str(existing_tag.id), name=existing_tag.name, user_id=current_user_id,is_custom=new_user_tag_link.is_custom,color=existing_tag.color)
        else:
            new_tag = TagModel(name=tag_input.name, color="#CCCCCC") #TODO: mudar para o colopicker depois


            db.add(new_tag)
            db.commit()
            db.refresh(new_tag)

            new_user_tag_link = UserTagLink(user_id=current_user_id, tag_id=new_tag.id,is_custom=True)
            db.add(new_user_tag_link)
            db.commit()
            db.refresh(new_user_tag_link)
            
            return TagOutputDto(id=str(new_tag.id), name=new_tag.name, user_id=current_user_id, is_custom=new_user_tag_link.is_custom,color=new_tag.color)

    except HTTPException:
        raise
    except Exception as e:
        print(f"Erro ao criar tag '{tag_input.name}' para o utilizador {current_user_id}: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Falha ao criar tag."
        )
        