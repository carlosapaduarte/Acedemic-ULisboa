from sqlmodel import Session

from repository.sql.academic_challenge.repo import AcademicChallengeRepo
from datetime import datetime
from repository.sql.models import database
from repository.sql.models.models import BatchModel, GoalModel, NoteModel

engine = database.get_engine()

class AcademicChallengeSqlRepo(AcademicChallengeRepo):
    
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
        
    def create_completed_goal(self, user_id: int, batch_id: int, goal_id: int, goal_day: int, conclusion_date: datetime):
        with Session(engine) as session:
            completed_goal = GoalModel(
                batch_id=batch_id,
                user_id=user_id,
                goal_day=goal_day,
                id=goal_id,
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