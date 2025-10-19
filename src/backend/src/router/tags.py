from typing import List, Annotated, Optional
from fastapi import APIRouter, HTTPException, Depends, status
from sqlmodel import Session, select
from sqlalchemy.orm import selectinload

from repository.sql.models.database import get_session
from repository.sql.models.models import UserTagLink, TagModel
from router.study_tracker.dtos.input_dtos import CreateTagInputDto, UpdateTagInputDto
from router.study_tracker.dtos.output_dtos import TagOutputDto
from router.commons.common import get_current_user_id

router = APIRouter(
    prefix="/tags",
    tags=["Tags"],
    responses={404: {"description": "Not found"}},
)
    
@router.get("/", response_model=List[TagOutputDto])
async def get_all_global_tags(session: Annotated[Session, Depends(get_session)]):
    """
    Retorna todas as tags globais disponíveis no sistema.
    """
    tags_from_db = session.exec(select(TagModel)).all()
    return [TagOutputDto.model_validate(tag) for tag in tags_from_db]


@router.get("/my-tags/", response_model=List[TagOutputDto])
async def get_user_custom_tags(
    current_user_id: Annotated[int, Depends(get_current_user_id)],
    session: Annotated[Session, Depends(get_session)]
):
    """
    Retorna as tags associadas ao utilizador autenticado.
    """
    user_tag_links = session.exec(
        select(UserTagLink)
        .where(UserTagLink.user_id == current_user_id)
        .options(selectinload(UserTagLink.tag))
    ).all()
    
    user_tags = [link.tag for link in user_tag_links if link.tag]
    return [TagOutputDto.model_validate(tag) for tag in user_tags]

@router.post("/", response_model=TagOutputDto, status_code=status.HTTP_201_CREATED)
async def create_new_tag(
    tag_data: CreateTagInputDto,
    current_user_id: Annotated[int, Depends(get_current_user_id)],
    session: Annotated[Session, Depends(get_session)]
):
    """
    Cria e associa uma nova tag a um utilizador.
    Reutiliza tags globais se já existirem, ou cria uma nova.
    """
    name_pt = tag_data.name_pt.strip() if tag_data.name_pt else None
    name_en = tag_data.name_en.strip() if tag_data.name_en else None

    final_pt = name_pt or name_en
    final_en = name_en or name_pt

    # Procura por uma tag global que corresponda exatamente
    statement = select(TagModel).where(
        TagModel.name_pt == final_pt,
        TagModel.name_en == final_en,
        TagModel.color.ilike(tag_data.color)
    )
    existing_global_tag = session.exec(statement).first()

    tag_to_associate: TagModel

    if not existing_global_tag:
        new_tag = TagModel(name_pt=final_pt, name_en=final_en, color=tag_data.color)
        session.add(new_tag)
        session.flush()
        tag_to_associate = new_tag
    else:
        tag_to_associate = existing_global_tag

    # Verifica se a associação já existe
    existing_user_link = session.exec(
        select(UserTagLink)
        .where(UserTagLink.user_id == current_user_id)
        .where(UserTagLink.tag_id == tag_to_associate.id)
    ).first()

    if existing_user_link:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail=f"A etiqueta '{final_pt}' já está associada à sua conta.",
        )

    # Cria a nova associação
    new_user_tag_link = UserTagLink(user_id=current_user_id, tag_id=tag_to_associate.id, is_custom=True)
    session.add(new_user_tag_link)
    session.commit()
    session.refresh(tag_to_associate)

    return tag_to_associate

@router.delete("/my-tags/{tag_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_user_tag_association(
    tag_id: int,
    current_user_id: Annotated[int, Depends(get_current_user_id)],
    session: Annotated[Session, Depends(get_session)]
):
    """
    Remove a associação de uma tag do utilizador. A tag global não é apagada.
    """
    user_tag_link = session.exec(
        select(UserTagLink)
        .where(UserTagLink.user_id == current_user_id)
        .where(UserTagLink.tag_id == tag_id)
    ).first()

    if not user_tag_link:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"A associação à tag com ID {tag_id} não foi encontrada para este utilizador."
        )

    session.delete(user_tag_link)
    session.commit()
    return