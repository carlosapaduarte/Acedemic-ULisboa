from typing import Optional, List
from sqlmodel import select, Session
from service.common.security import get_password_hash, verify_password
from repository.sql.models.models import UserModel, TagModel, UserTagLink
from repository.sql.models.database import predefined_global_tag_names
from repository.sql.commons.repo_sql import CommonsSqlRepo
from router.commons.dtos.input_dtos import CreateUserInputDto
from exception import UsernameAlreadyExistsException
from domain.commons.user import User 
from service.gamification import core as gamification_service

def authenticate_user(db: Session, username: str, password: str) -> Optional[User]: 
    user = CommonsSqlRepo.get_user_by_username(db, username) 
    if not user:
        return None
    if not verify_password(password, user.hashed_password): 
        return None
    return user
    
def create_user(db: Session, user_data: CreateUserInputDto) -> User: 
    existing_user = CommonsSqlRepo.exists_user_by_username(db, user_data.username) 
    if existing_user:
        raise UsernameAlreadyExistsException()

    hashed_password = get_password_hash(user_data.password)
    
    new_user_model = CommonsSqlRepo.create_user(db, user_data.username, hashed_password)
    db.flush()
    gamification_service._get_or_create_user_metrics(db, new_user_model.id)

    tag_names_to_find = [tag['name_pt'] for tag in predefined_global_tag_names]

    tags_to_associate = db.exec( 
        select(TagModel).where(TagModel.name_pt.in_(tag_names_to_find))
    ).all()
    
    for tag_model in tags_to_associate:
        user_tag_association = UserTagLink(
            user_id=new_user_model.id,
            tag_id=tag_model.id,
            is_custom=False
        )
        db.add(user_tag_association)

    db.commit() 

    new_user_domain_complete = CommonsSqlRepo.get_user_by_id(db, new_user_model.id)

    if not new_user_domain_complete:
        raise Exception("Falha ao recarregar o utilizador recém-criado")

    return new_user_domain_complete

def get_user_id_from_username(db: Session, username: str) -> Optional[int]: 
    user = CommonsSqlRepo.get_user_by_username(db, username) 
    if user is not None:
        return user.id
    return None

def get_user_info(db: Session, user_id: int) -> Optional[User]:
    user = CommonsSqlRepo.get_user_by_id(db, user_id) 
    if user is not None:
        return user
    return None

def set_user_avatar(db: Session, user_id: int, avatar_filename: str): 
    CommonsSqlRepo.update_user_avatar(db, user_id, avatar_filename) 

def set_share_progress_preference(db: Session, user_id: int, share_progress: bool): 
    CommonsSqlRepo.update_share_progress_state(db, user_id, share_progress) 