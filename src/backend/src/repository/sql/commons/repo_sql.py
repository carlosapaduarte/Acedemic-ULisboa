import random

from sqlalchemy import ScalarResult
from sqlmodel import Session, select

from domain.commons.user import Batch, User, Challenge, BatchDay
from exception import NotFoundException
from repository.sql.commons.repo import CommonsRepo
from repository.sql.models import database
from repository.sql.models.models import BatchModel, UserModel

engine = database.get_engine()


class CommonsSqlRepo(CommonsRepo):

    @staticmethod
    def get_user_or_raise(user_id: int, session: Session) -> UserModel:
        statement = select(UserModel).where(UserModel.id == user_id)
        result = session.exec(statement)

        user_model = result.first()

        if user_model is None:
            raise NotFoundException(user_id)

        return user_model

    def exists_user_by_username(self, username: str) -> bool:
        with Session(engine) as session:
            statement = select(UserModel).where(UserModel.username == username)
            results = session.exec(statement)
            return results.first() is not None

    def exists_user_by_id(self, id: int) -> bool:
        with Session(engine) as session:
            statement = select(UserModel).where(UserModel.id == id)
            results = session.exec(statement)
            return results.first() is not None

    @staticmethod
    def from_user_model(user_model: UserModel) -> User:
        batches_model: list[BatchModel] = user_model.user_batches

        # Forces batch_days to load eagerly for each batch, avoiding potential lazy-loading issues.
        for batch in batches_model:
            batch.batch_days

        # Build User Batches
        batches: list[Batch] = []
        for batch in batches_model:
            batch_days: list[BatchDay] = []

            # Forces challenges to load eagerly for each day, avoiding potential lazy-loading issues.
            for batch_day in batch.batch_days:
                batch_day.challenges

            for batch_day in batch.batch_days:
                challenges: list[Challenge] = []
                for challenge in batch_day.challenges:
                    challenges.append(Challenge(challenge.id, challenge.completion_date))
                challenges.sort(key=lambda c: c.id)
                batch_days.append(BatchDay(batch_day.id, challenges, batch_day.notes))

            batches.append(Batch(batch.id, batch.start_date, batch.level, batch_days))

        return User(
            id=user_model.id,
            username=user_model.username,
            hashed_password=user_model.hashed_password,
            avatar_filename=user_model.avatar_filename,
            share_progress=user_model.share_progress,
            batches=batches
        )

    @staticmethod
    def from_user_model_result(result: ScalarResult[UserModel]) -> User | None:
        user_model = result.first()

        if user_model is None:
            return None

        return CommonsSqlRepo.from_user_model(user_model)

    def create_user(self, username: str, hashed_password: str) -> User:
        """Creates a user without avatar, challenges, in level 1, and share_progress set to false"""

        with Session(engine) as session:

            # Generates a random ID, that is not yet taken
            random_generated_id: int = 0
            while True:
                random_generated_id: int = random.randint(1, database.POSTGRES_MAX_INTEGER_VALUE) # For some reason, automatic ID is not working
                statement = select(UserModel).where(UserModel.id == random_generated_id)
                result = session.exec(statement)
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
            session.add(db_user)
            session.commit()
            session.refresh(db_user)

            return CommonsSqlRepo.from_user_model(db_user)

    def get_user_by_id(self, id: int) -> User | None:
        with Session(engine) as session:
            statement = select(UserModel).where(UserModel.id == id)
            result = session.exec(statement)
            return CommonsSqlRepo.from_user_model_result(result)

    def get_user_by_username(self, username: str) -> User | None:
        with Session(engine) as session:
            statement = select(UserModel).where(UserModel.username == username)
            result = session.exec(statement)
            return CommonsSqlRepo.from_user_model_result(result)

    def update_user_avatar(self, user_id: int, avatar_filename: str):
        with Session(engine) as session:
            statement = select(UserModel).where(UserModel.id == user_id)
            result = session.exec(statement)

            user_model: UserModel = result.one()
            user_model.avatar_filename = avatar_filename
            session.add(user_model)
            session.commit()
            session.refresh(user_model)

    def update_share_progress_state(self, user_id: int, share_progress: bool):
        with Session(engine) as session:
            statement = select(UserModel).where(UserModel.id == user_id)
            result = session.exec(statement)

            user_model: UserModel = result.one()
            user_model.share_progress = share_progress
            session.add(user_model)
            session.commit()
            session.refresh(user_model)
