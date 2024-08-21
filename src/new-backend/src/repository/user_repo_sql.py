from sqlmodel import Session, select

from repository.sql.models import BatchModel, GoalModel, NoteModel, UserModel
from repository.user_repo import UserRepo
from domain.user import Batch, CompletedGoal, User, UserNote
from datetime import datetime
from repository.sql import database

engine = database.get_engine()

class UserRepoSql(UserRepo):
    
    def create_user(self, id: int, username: str):
        "Creates a user without avatar, notes and goals, in level 1, and share_progress set to false"

        with Session(engine) as session:
            db_user = UserModel(
                id=id, 
                username=username, 
                avatar_filename=None, 
                share_progress=None
            )
            session.add(db_user)
            session.commit()

    def exists_user(self, id: int) -> bool:
        with Session(engine) as session:
            statement = select(UserModel).where(UserModel.id == id)
            results = session.exec(statement)
            return results.first() is not None

    def get_user(self, id) -> User:
        with Session(engine) as session:
            statement = select(UserModel).where(UserModel.id == id)
            result = session.exec(statement)
            
            user_model: UserModel = result.one()
            user_notes_model: list[NoteModel] = user_model.user_notes
            batches_model: list[BatchModel] = user_model.user_batches
            
            # map() in Python is lazy, not eager!
            # Therefore, this forces the session to retrieve all completed_goals, for each batch
            # Better solutions are appreciated!
            for batch in batches_model:
                batch.completed_goals

            return User(
                id,
                user_model.username,
                user_model.avatar_filename,
                user_model.share_progress,
                user_notes=map(lambda note: UserNote(note.text, note.date), user_notes_model),
                batches=map(lambda batch: Batch(
                    start_date=batch.start_date,
                    level=batch.level,
                    completed=map(lambda completed_goal: CompletedGoal(
                        goal_day=completed_goal.goal_day,
                        name=completed_goal.name,
                        conclusion_date=completed_goal.conclusion_date
                    ), batch.completed_goals)
                ), batches_model)
            )

    def create_new_batch(self, user_id: int, new_level: int) -> int:
        with Session(engine) as session:
            new_batch = BatchModel(
                start_date=datetime.now(),
                level=new_level,
                user_id=user_id
            )
            session.add(new_batch)
            session.commit()

            return new_batch.id
        
    def create_completed_goal(self, user_id: int, batch_id: int, goal_name: str, goal_day: int, conclusion_date: datetime):
        with Session(engine) as session:
            completed_goal = GoalModel(
                batch_id=batch_id,
                user_id=user_id,
                goal_day=goal_day,
                name=goal_name,
                conclusion_date=conclusion_date,
            )
            session.add(completed_goal)
            session.commit()

    def create_new_user_note(self, user_id: int, note: str, date: datetime):
        with Session(engine) as session:
            completed_goal = NoteModel(
                text=note,
                date=date,
                user_id=user_id
            )
            session.add(completed_goal)
            session.commit()

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
