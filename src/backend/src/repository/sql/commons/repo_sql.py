import random
from typing import Optional
from sqlmodel import select, delete, Session
from sqlalchemy.engine import ScalarResult
from sqlalchemy.orm import selectinload 

from domain.commons.user import User, Batch, Challenge, BatchDay 
from exception import NotFoundException
from repository.sql.commons.repo import CommonsRepo 
from repository.sql.models import database 
from repository.sql.models.models import BatchModel, UserModel, UserMetric, BatchDayModel, ChallengeModel 


class CommonsSqlRepo(CommonsRepo):
    
    @staticmethod
    def get_user_or_raise(db: Session, user_id: int) -> UserModel: 
        """Get a user by ID or raise an exception."""
        statement = select(UserModel).where(UserModel.id == user_id)
        result = db.exec(statement) 
        user_model = result.first()
        if user_model is None:
            raise NotFoundException(user_id)
        return user_model

    @staticmethod
    def exists_user_by_username(db: Session, username: str) -> bool: 
        """Check if a user with the given username exists."""
        statement = select(UserModel).where(UserModel.username == username)
        results = db.exec(statement) 
        return results.first() is not None

    @staticmethod
    def exists_user_by_id(db: Session, id: int) -> bool: 
        """Check if a user with the given ID exists."""
        statement = select(UserModel).where(UserModel.id == id)
        results = db.exec(statement) 
        return results.first() is not None
    
    @staticmethod
    def from_user_model(user_model: UserModel) -> User:
        
        batches_model: list[BatchModel] = user_model.user_batches if user_model.user_batches is not None else []
        batches: list[Batch] = []
        for batch_m in batches_model:
            batch_days: list[BatchDay] = []
            batch_days_m: list[BatchDayModel] = batch_m.batch_days if batch_m.batch_days is not None else []
            for batch_day_m in batch_days_m:
                challenges: list[Challenge] = []
                challenges_m: list[ChallengeModel] = batch_day_m.challenges if batch_day_m.challenges is not None else []
                for challenge_m in challenges_m:
                    challenges.append(Challenge(id=challenge_m.id, completion_date=challenge_m.completion_date))
                challenges.sort(key=lambda c: c.id)
                batch_days.append(BatchDay(id=batch_day_m.id, challenges=challenges, notes=batch_day_m.notes))
            batches.append(Batch(id=batch_m.id, start_date=batch_m.start_date, level=batch_m.level, batch_days=batch_days))
        
        return User(
            id=user_model.id,
            username=user_model.username,
            hashed_password=user_model.hashed_password, 
            avatar_filename=user_model.avatar_filename,
            share_progress=user_model.share_progress,
            #receive_st_app_notifications=user_model.receive_st_app_notifications,
            #study_session_time=user_model.study_session_time,
            batches=batches,
            metrics=user_model.metrics
        )

    @staticmethod
    def from_user_model_result(result: ScalarResult[UserModel]) -> User | None:
        user_model = result.first()
        if user_model is None:
            return None
        return CommonsSqlRepo.from_user_model(user_model)
    
    @staticmethod
    def create_user(db: Session, username: str, hashed_password: str) -> UserModel: 
        random_generated_id: int = 0
        while True:
            random_generated_id = random.randint(1, database.POSTGRES_MAX_INTEGER_VALUE)
            statement = select(UserModel).where(UserModel.id == random_generated_id)
            result = db.exec(statement) 
            if result.first() is None:
                break

        db_user = UserModel(
            id=random_generated_id,
            username=username,
            hashed_password=hashed_password,
            avatar_filename=None,
            share_progress=None,
            receive_st_app_notifications=None,
            study_session_time=None
        )
        db.add(db_user)
        db.commit() 
        db.refresh(db_user) 

        return db_user   
    
    @staticmethod
    def get_user_by_id(db: Session, id: int) -> User | None: 
        db.expire_all()
        statement = select(UserModel).where(UserModel.id == id).options(
            selectinload(UserModel.metrics),
            selectinload(UserModel.user_batches).selectinload(BatchModel.batch_days).selectinload(BatchDayModel.challenges)
        )
        result = db.exec(statement) 
        return CommonsSqlRepo.from_user_model_result(result)

    @staticmethod
    def get_user_by_username(db: Session, username: str) -> User | None: 
        db.expire_all()
        statement = select(UserModel).where(UserModel.username == username).options(
            selectinload(UserModel.metrics),
            selectinload(UserModel.user_batches).selectinload(BatchModel.batch_days).selectinload(BatchDayModel.challenges)
        )
        result = db.exec(statement) 
        return CommonsSqlRepo.from_user_model_result(result)

    @staticmethod
    def update_user_avatar(db: Session, user_id: int, avatar_filename: str): 
        statement = select(UserModel).where(UserModel.id == user_id)
        result = db.exec(statement) 
        user_model: UserModel = result.one() 
        user_model.avatar_filename = avatar_filename
        db.add(user_model)
        db.commit() 
        db.refresh(user_model) 

    @staticmethod
    def update_share_progress_state(db: Session, user_id: int, share_progress: bool): 
        statement = select(UserModel).where(UserModel.id == user_id)
        result = db.exec(statement) 
        user_model: UserModel = result.one() 
        user_model.share_progress = share_progress
        db.add(user_model)
        db.commit() 
        db.refresh(user_model) 