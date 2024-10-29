import random
from sqlmodel import Session

from repository.sql.academic_challenge.repo import AcademicChallengeRepo
from datetime import datetime
from repository.sql.models import database
from repository.sql.models.models import BatchModel, CompletedChallengeModel, NoteModel

engine = database.get_engine()

class AcademicChallengeSqlRepo(AcademicChallengeRepo):
    
    def create_new_batch(self, user_id: int, new_level: int) -> int:
        with Session(engine) as session:
            new_batch = BatchModel(
                id=random.randint(1, 999999999), # TODO For some reason, automatic ID is not working
                start_date=datetime.now(),
                level=new_level,
                user_id=user_id
            )
            session.add(new_batch)
            session.commit()

            return new_batch.id
        
    def create_completed_challenge(self, user_id: int, batch_id: int, challenge_id: int, challenge_day: int, conclusion_date: datetime):
        with Session(engine) as session:
            completed_challenge = CompletedChallengeModel(
                batch_id=batch_id,
                user_id=user_id,
                challenge_day=challenge_day,
                id=challenge_id,
                conclusion_date=conclusion_date,
            )
            session.add(completed_challenge)
            session.commit()

    def create_new_user_note(self, user_id: int, note: str, date: datetime):
        with Session(engine) as session:
            new_note = NoteModel(
                text=note,
                date=date,
                user_id=user_id
            )
            session.add(new_note)
            session.commit()