from typing import List, Annotated
from fastapi import APIRouter, HTTPException, Depends, status
from sqlmodel import Session, select, delete
from sqlmodel.sql.expression import SelectOfScalar
from sqlalchemy.orm import selectinload
from repository.sql.models.database import get_engine
from repository.sql.models.models import UserTagLink, UserModel, STEventTagModel, STTaskTagModel, DailyTagModel,TagModel

from router.commons.common import get_current_user_id

def get_session():
    with Session(get_engine()) as session:
        yield session
        
router = APIRouter(
    prefix="/tags",
    tags=["Tags"],
    responses={404: {"description": "Not found"}},
)

from pydantic import BaseModel

class TagCreate(BaseModel):
    name: str
    
@router.get("/", response_model=List[TagModel])
async def get_all_global_tags(session: Annotated[Session, Depends(get_session)]):
    """
    Retorna todas as tags globais disponíveis no sistema.
    """
    tags = session.exec(select(TagModel)).all()
    return tags


@router.get("/my-tags/", response_model=List[TagModel])
async def get_user_custom_tags(
    current_user: Annotated[UserModel, Depends(get_current_user_id)],
    session: Annotated[Session, Depends(get_session)]
):
    """
    Retorna as tags personalizadas (ou "possuídas") pelo usuário autenticado.
    Isso inclui tags criadas pelo usuário e talvez algumas globais que ele marcou como "minhas".
    """

    user_tag_links = session.exec(
        select(UserTagLink)
        .where(UserTagLink.user_id == current_user.id)
        .options(selectinload(UserTagLink.tag))
    ).all()
    
    user_tags = [link.tag for link in user_tag_links if link.tag]
    return user_tags


@router.post("/", response_model=TagModel, status_code=status.HTTP_201_CREATED)
async def create_new_tag(
    tag_data: TagCreate,
    current_user: Annotated[UserModel, Depends(get_current_user_id)],
    session: Annotated[Session, Depends(get_session)]
):
    """
    Permite ao usuário criar uma nova tag.
    Se a tag já existir globalmente, ela será associada ao usuário.
    Caso contrário, uma nova tag global será criada e associada ao usuário.
    """
    tag_name_normalized = tag_data.name.strip().lower() 
    
    existing_global_tag = session.exec(
        select(TagModel).where(TagModel.name.ilike(tag_name_normalized))
    ).first()

    tag_to_associate: TagModel
    if not existing_global_tag:

        new_tag = TagModel(name=tag_data.name) 
        session.add(new_tag)
        session.flush() 
        tag_to_associate = new_tag
    else:
        tag_to_associate = existing_global_tag
        print(f"Tag global '{tag_data.name}' já existe (ID: {tag_to_associate.id}). Associando ao usuário.")

    existing_user_tag_link = session.exec(
        select(UserTagLink)
        .where(UserTagLink.user_id == current_user.id)
        .where(UserTagLink.tag_id == tag_to_associate.id)
    ).first()

    if existing_user_tag_link:

        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail=f"Tag '{tag_data.name}' is already associated with your account."
        )

    user_tag_link = UserTagLink(user_id=current_user.id, tag_id=tag_to_associate.id)
    session.add(user_tag_link)
    session.commit()
    session.refresh(tag_to_associate)

    return tag_to_associate


@router.delete("/my-tags/{tag_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_user_tag_association(
    tag_id: int,
    current_user: Annotated[UserModel, Depends(get_current_user_id)],
    session: Annotated[Session, Depends(get_session)]
):
    """
    Remove a associação de uma tag personalizada do usuário.
    A tag global em si não é apagada.
    """
    user_tag_link = session.exec(
        select(UserTagLink)
        .where(UserTagLink.user_id == current_user.id)
        .where(UserTagLink.tag_id == tag_id)
    ).first()

    if not user_tag_link:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Tag with ID {tag_id} not found as personalized for this user."
        )

    session.delete(user_tag_link)
    session.commit()
    return # 204 No Content