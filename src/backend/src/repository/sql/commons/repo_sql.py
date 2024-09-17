from sqlmodel import Session, select

from exception import NotFoundException
from repository.sql.commons.repo import CommonsRepo
from repository.sql.models import database
from repository.sql.models.models import BatchModel, UserModel
from domain.commons.user import Batch, CompletedGoal, User, UserNote

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
    
    def create_user(self, id: int, username: str):
        "Creates a user without avatar, notes and goals, in level 1, and share_progress set to false"

        with Session(engine) as session:
            db_user = UserModel(
                id=id,
                username=username, 
                avatar_filename=None, 
                share_progress=None,
                receive_st_app_notifications=None
            )
            session.add(db_user)
            session.commit()

    def exists_user(self, id: int) -> bool:
        with Session(engine) as session:
            statement = select(UserModel).where(UserModel.id == id)
            results = session.exec(statement)
            return results.first() is not None

    def get_user(self, id: int) -> User:
        with Session(engine) as session:
            statement = select(UserModel).where(UserModel.id == id)
            result = session.exec(statement)
            
            user_model: UserModel = result.one()
            batches_model: list[BatchModel] = user_model.user_batches
            
            # map() in Python is lazy, not eager!
            # Therefore, this forces the session to retrieve all completed_goals, for each batch
            # Better solutions are appreciated!
            for batch in batches_model:
                batch.completed_goals
                
            # Build User Notes
            user_notes: list[UserNote] = []
            for note in user_model.user_notes:
                user_notes.append(UserNote(note.text, note.date))
                
            # Build User Batches
            batches: list[Batch] = []
            for batch in user_model.user_batches:
                
                # Build Batch Completed Goals
                completed_goals: list[CompletedGoal] = []
                for goal in batch.completed_goals:
                    completed_goals.append(CompletedGoal(goal.goal_day, goal.id, goal.conclusion_date))
                
                batches.append(Batch(batch.id, batch.start_date, batch.level, completed_goals))

            return User(
                id,
                user_model.username,
                user_model.avatar_filename,
                user_model.share_progress,
                user_notes=user_notes,
                batches=batches
            )

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